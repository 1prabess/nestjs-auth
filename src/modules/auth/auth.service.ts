import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../users/user.service.js';
import { JwtService } from '@nestjs/jwt';
import { PasswordService } from './password.service.js';
import jwtConfig from '../../configs/jwt.config.js';
import type { ConfigType } from '@nestjs/config';
import { RegisterDto } from './dto/register.dto.js';
import { toUserResponse, UserResponse } from '../users/user-response.js';
import { User } from '../users/entities/user.entity.js';
import { AccessToken, AuthTokens } from './auth-tokens.js';
import { randomUUID } from 'crypto';
import { parseDurationToSeconds } from '../../common/utils/parse-duration.js';
import { SessionMetadata, SessionsService } from './sessions.service.js';
import sessionConfig from '../../configs/session.config.js';
import { RefreshTokenService } from './refresh-token.service.js';
import { DataSource, IsNull, Repository } from 'typeorm';
import { RefreshToken } from './entities/refresh-token.entity.js';
import { Session } from './entities/session.entity.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
    private readonly sessionsService: SessionsService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly dataSource: DataSource,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    @Inject(sessionConfig.KEY)
    private readonly sessionConfiguration: ConfigType<typeof sessionConfig>,
  ) {}

  async register(registerDto: RegisterDto): Promise<UserResponse> {
    const passwordHash = await this.passwordService.hashPassword(
      registerDto.password,
    );

    const user = await this.usersService.create(
      registerDto.email,
      passwordHash,
    );

    return toUserResponse(user);
  }

  async startSession(
    user: User,
    metaData: SessionMetadata,
  ): Promise<AuthTokens> {
    const now = new Date();
    const session = await this.sessionsService.create(
      user.id,
      new Date(
        now.getTime() +
          parseDurationToSeconds(this.sessionConfiguration.absoluteTtl) * 1000,
      ),
      metaData,
    );

    const refreshToken = await this.issueRefreshToken(session.id, user.id, now);

    const accessToken = await this.issueAccessToken(user, session.id);

    return {
      ...accessToken,
      refreshToken,
    };
  }

  async refresh(presentedToken: string): Promise<AuthTokens> {
    const tokenHash = this.refreshTokenService.hashToken(presentedToken);

    const outcome = await this.dataSource.transaction(async (manager) => {
      const refreshTokenRepository = manager.getRepository(RefreshToken);
      const sessionRepository = manager.getRepository(Session);

      const storedRefreshToken = await refreshTokenRepository.findOne({
        where: { tokenHash },
        lock: { mode: 'pessimistic_write' },
      });

      if (!storedRefreshToken) {
        return { status: 'invalid' as const };
      }

      // Detect reuse before checking revocation.
      if (storedRefreshToken.usedAt !== null) {
        await this.killSession(
          sessionRepository,
          refreshTokenRepository,
          storedRefreshToken.sessionId,
        );

        return { status: 'reused' as const };
      }

      if (storedRefreshToken.revokedAt !== null) {
        return { status: 'invalid' as const };
      }

      const now = new Date();

      if (storedRefreshToken.expiresAt.getTime() <= now.getTime()) {
        await refreshTokenRepository.update(
          { id: storedRefreshToken.id },
          { revokedAt: now },
        );

        return { status: 'invalid' as const };
      }

      // Lock the session to serialize operations within it.
      const session = await sessionRepository.findOne({
        where: { id: storedRefreshToken.sessionId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!session || session.revokedAt !== null) {
        return { status: 'invalid' as const };
      }

      if (session.expiresAt.getTime() <= now.getTime()) {
        await this.killSession(
          sessionRepository,
          refreshTokenRepository,
          session.id,
        );

        return { status: 'invalid' as const };
      }

      // Validate the user before changing any tokens.
      const user = await this.usersService.findById(session.userId);

      if (!user) {
        await this.killSession(
          sessionRepository,
          refreshTokenRepository,
          session.id,
        );

        return { status: 'invalid' as const };
      }

      const newRefreshToken = this.refreshTokenService.generateToken();

      const nextExpiresAt = new Date(
        Math.min(
          now.getTime() +
            parseDurationToSeconds(this.sessionConfiguration.refreshTtl) * 1000,
          session.expiresAt.getTime(),
        ),
      );

      const replacement = refreshTokenRepository.create({
        sessionId: session.id,
        userId: session.userId,
        tokenHash: this.refreshTokenService.hashToken(newRefreshToken),
        expiresAt: nextExpiresAt,
      });

      await refreshTokenRepository.save(replacement);

      await refreshTokenRepository.update(
        { id: storedRefreshToken.id },
        {
          usedAt: now,
          revokedAt: now,
          replacedBy: replacement.id,
        },
      );

      await sessionRepository.update({ id: session.id }, { lastUsedAt: now });

      const accessToken = await this.issueAccessToken(user, session.id);

      return {
        status: 'rotated' as const,
        tokens: {
          ...accessToken,
          refreshToken: newRefreshToken,
        },
      };
    });

    if (outcome.status === 'rotated') {
      return outcome.tokens;
    }

    if (outcome.status === 'reused') {
      throw new UnauthorizedException(
        'This refresh token has already been used. The session has been revoked.',
      );
    }

    throw new UnauthorizedException('Invalid refresh token');
  }

  async killSession(
    sessionRepository: Repository<Session>,
    refreshTokenRepository: Repository<RefreshToken>,
    sessionId: string,
  ): Promise<void> {
    const now = new Date();

    await sessionRepository.update(
      { id: sessionId, revokedAt: IsNull() },
      { revokedAt: now },
    );

    await refreshTokenRepository.update(
      { sessionId, revokedAt: IsNull() },
      { revokedAt: now },
    );
  }

  async logout(userId: string, sessionId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const sessionRepository = manager.getRepository(Session);
      const refreshTokenRepository = manager.getRepository(RefreshToken);

      const result = await sessionRepository.update(
        {
          id: sessionId,
          userId,
          revokedAt: IsNull(),
        },
        { revokedAt: new Date() },
      );

      if (!result.affected) {
        return;
      }

      await refreshTokenRepository.update(
        {
          sessionId,
          revokedAt: IsNull(),
        },
        { revokedAt: new Date() },
      );
    });
  }

  async issueRefreshToken(
    sessionId: string,
    userId: string,
    now: Date,
  ): Promise<string> {
    const token = this.refreshTokenService.generateToken();

    await this.refreshTokenService.storeToken(
      sessionId,
      userId,
      this.refreshTokenService.hashToken(token),
      new Date(
        now.getTime() +
          parseDurationToSeconds(this.sessionConfiguration.refreshTtl) * 1000,
      ),
    );

    return token;
  }

  async issueAccessToken(user: User, sessionId: string): Promise<AccessToken> {
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      jti: randomUUID(),
      sid: sessionId,
    });

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: parseDurationToSeconds(this.jwtConfiguration.accessTtl),
    };
  }
}

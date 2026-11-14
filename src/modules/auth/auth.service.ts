import { Inject, Injectable } from '@nestjs/common';
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

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
    private readonly sessionsService: SessionsService,
    private readonly refreshTokenService: RefreshTokenService,
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

    const accessToken = await this.issueAccessToken(user);

    return {
      ...accessToken,
      refreshToken,
    };
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

  async issueAccessToken(user: User): Promise<AccessToken> {
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      jti: randomUUID(),
    });

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: parseDurationToSeconds(this.jwtConfiguration.accessTtl),
    };
  }
}

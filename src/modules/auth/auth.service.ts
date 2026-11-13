import { Inject, Injectable } from '@nestjs/common';
import { UserService } from '../users/user.service.js';
import { JwtService } from '@nestjs/jwt';
import { PasswordService } from './password.service.js';
import jwtConfig from '../../configs/jwt.config.js';
import type { ConfigType } from '@nestjs/config';
import { RegisterDto } from './dto/register.dto.js';
import { toUserResponse, UserResponse } from '../users/user-response.js';
import { User } from '../users/entities/user.entity.js';
import { AuthTokens } from './auth-tokens.js';
import { randomUUID } from 'crypto';
import { parseDurationToSeconds } from '../../common/utils/parse-duration.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
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

  async issueTokens(user: User): Promise<AuthTokens> {
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

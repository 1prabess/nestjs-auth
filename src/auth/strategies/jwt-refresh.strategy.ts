import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { TokenPayload } from '../interfaces/token-payload.interface';
import { AuthService } from '../providers/auth.service';
import jwtConfig from '../config/jwt.config';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refreshToken',
) {
  constructor(
    @Inject(jwtConfig.KEY)
    jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request.cookies?.refreshToken,
      ]),
      secretOrKey: jwtConfiguration.refreshTokenSecret,
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: TokenPayload) {
    return this.authService.validateUserRefreshToken(
      payload.userId,
      request.cookies?.refreshToken,
    );
  }
}

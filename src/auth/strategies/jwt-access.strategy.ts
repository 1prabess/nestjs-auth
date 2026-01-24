import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import type { ConfigType } from '@nestjs/config';
import { TokenPayload } from '../interfaces/token-payload.interface';
import { UserService } from 'src/user/providers/user.service';
import { Inject, Injectable } from '@nestjs/common';
import jwtConfig from '../config/jwt.config';

@Injectable()
export class JwtAccessTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-accessToken',
) {
  constructor(
    @Inject(jwtConfig.KEY)
    jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request.cookies?.accessToken,
      ]),
      secretOrKey: jwtConfiguration.accessTokenSecret,
    });
  }

  async validate(payload: TokenPayload) {
    return await this.userService.findById(payload.userId);
  }
}

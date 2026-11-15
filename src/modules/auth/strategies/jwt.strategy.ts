import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../../users/user.service.js';
import jwtConfig from '../../../configs/jwt.config.js';
import type { ConfigType } from '@nestjs/config';
import { AccessTokenPayload } from '../access-token-payload.js';
import { RequestWithSession } from '../../../common/types/request-with-session.js';
import { SessionsService } from '../sessions.service.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject(jwtConfig.KEY)
    jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly usersService: UserService,
    private readonly sessionsService: SessionsService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtConfiguration.accessSecret,
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  async validate(request: RequestWithSession, payload: AccessTokenPayload) {
    const session = await this.sessionsService.findActiveById(payload.sid);

    if (!session) {
      throw new UnauthorizedException('Invalid access token');
    }

    request.sessionId = payload.sid;

    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Invalid access token');
    }

    return user;
  }
}

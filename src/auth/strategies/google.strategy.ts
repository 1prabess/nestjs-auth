import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import googleConfig from '../config/google.config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @Inject(googleConfig.KEY)
    googleConfiguration: ConfigType<typeof googleConfig>,
  ) {
    super({
      clientID: googleConfiguration.clientId,
      clientSecret: googleConfiguration.clientSecret,
      callbackURL: googleConfiguration.callbackUrl,
      scope: ['email', 'profile'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    done(null, profile);
  }
}

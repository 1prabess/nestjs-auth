import { Module } from '@nestjs/common';
import { PasswordService } from './password.service.js';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { UsersModule } from '../users/users.module.js';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './strategies/local.strategy.js';
import { ConfigModule, type ConfigType } from '@nestjs/config';
import jwtConfig from '../../configs/jwt.config.js';
import { parseDurationToSeconds } from '../../common/utils/parse-duration.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { LocalAuthGuard } from './guards/local-auth.guard.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [jwtConfig.KEY],
      useFactory: (config: ConfigType<typeof jwtConfig>) => ({
        secret: config.accessSecret,
        signOptions: {
          expiresIn: parseDurationToSeconds(config.accessTtl),
        },
      }),
    }),
  ],
  providers: [
    PasswordService,
    AuthService,
    LocalStrategy,
    JwtStrategy,
    LocalAuthGuard,
    JwtAuthGuard,
  ],
  controllers: [AuthController],
})
export class AuthModule {}

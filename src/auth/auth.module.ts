import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './providers/auth.service';
import { HashingProvider } from './providers/hashing.provider';
import { BcryptProvider } from './providers/bcrypt.provider';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtAccessTokenStrategy } from './strategies/jwt-access.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';

@Module({
  imports: [forwardRef(() => UserModule), PassportModule, JwtModule],
  exports: [HashingProvider],
  providers: [
    AuthService,
    LocalStrategy,
    JwtAccessTokenStrategy,
    JwtRefreshStrategy,
    {
      provide: HashingProvider,
      useClass: BcryptProvider,
    },
    BcryptProvider,
  ],
  controllers: [AuthController],
})
export class AuthModule {}

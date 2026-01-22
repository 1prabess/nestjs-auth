import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './providers/auth.service';
import { HashingProvider } from './providers/hashing.provider';
import { BcryptProvider } from './providers/bcrypt.provider';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [forwardRef(() => UserModule), PassportModule, JwtModule],
  exports: [HashingProvider],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    {
      provide: HashingProvider,
      useClass: BcryptProvider,
    },
    BcryptProvider,
  ],
  controllers: [AuthController],
})
export class AuthModule {}

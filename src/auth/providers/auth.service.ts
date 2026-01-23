import {
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from 'src/user/providers/user.service';
import { HashingProvider } from './hashing.provider';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/schema/user.schema';
import type { Response } from 'express';
import { TokenPayload } from '../interfaces/token-payload.interface';
import { RegisterUserDto } from '../dtos/register-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly hashingProvider: HashingProvider,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async login(user: User) {
    const accessTokenCookieExpiry = new Date();
    accessTokenCookieExpiry.setTime(
      accessTokenCookieExpiry.getTime() +
        Number(
          this.configService.getOrThrow<string>(
            'JWT_ACCESS_TOKEN_EXPIRATION_MS',
          ),
        ),
    );

    const refreshTokenCookieExpiry = new Date();
    refreshTokenCookieExpiry.setTime(
      refreshTokenCookieExpiry.getTime() +
        Number(
          this.configService.getOrThrow<string>(
            'JWT_REFRESH_TOKEN_EXPIRATION_MS',
          ),
        ),
    );

    const payload: TokenPayload = {
      userId: user._id.toHexString(),
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: `${this.configService.getOrThrow('JWT_ACCESS_TOKEN_EXPIRATION_MS')}ms`,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: `${this.configService.getOrThrow('JWT_REFRESH_TOKEN_EXPIRATION_MS')}ms`,
    });

    await this.userService.setRefreshToken(
      user._id.toHexString(),
      refreshToken,
    );

    return { accessToken, refreshToken };
  }

  async register(registerUserDto: RegisterUserDto) {
    const user = await this.userService.create(
      registerUserDto.email,
      registerUserDto.password,
    );

    const { accessToken, refreshToken } = await this.login(user);

    return { user, accessToken, refreshToken };
  }

  async logout(userId: string) {
    await this.userService.removeRefreshToken(userId);
  }

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.hashingProvider.compare(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async validateUserRefreshToken(userId: string, refreshToken: string) {
    const user = await this.userService.findByIdWithRefreshToken(userId);

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException();
    }

    const isValid = await this.hashingProvider.compare(
      refreshToken,
      user?.refreshToken,
    );

    if (!isValid) {
      throw new UnauthorizedException();
    }

    return user;
  }
}

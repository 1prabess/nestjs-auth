import {
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from 'src/user/providers/user.service';
import { HashingProvider } from './hashing.provider';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/schema/user.schema';
import { TokenPayload } from '../interfaces/token-payload.interface';
import { RegisterUserDto } from '../dtos/register-user.dto';
import { AuthTokens } from '../interfaces/auth-tokens.interface';
import jwtConfig from '../config/jwt.config';

@Injectable()
export class AuthService {
  constructor(
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly hashingProvider: HashingProvider,
    private readonly jwtService: JwtService,
  ) {}

  async login(user: User): Promise<AuthTokens> {
    const accessTokenCookieExpiry = new Date();
    accessTokenCookieExpiry.setTime(
      accessTokenCookieExpiry.getTime() +
        Number(this.jwtConfiguration.accessTokenTtlMs),
    );

    const refreshTokenCookieExpiry = new Date();
    refreshTokenCookieExpiry.setTime(
      refreshTokenCookieExpiry.getTime() +
        Number(this.jwtConfiguration.refreshTokenTtlMs),
    );

    const payload: TokenPayload = {
      userId: user._id.toHexString(),
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.jwtConfiguration.accessTokenSecret,
      expiresIn: `${this.jwtConfiguration.accessTokenTtlMs}ms`,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.jwtConfiguration.refreshTokenSecret,
      expiresIn: `${this.jwtConfiguration.refreshTokenTtlMs}ms`,
    });

    await this.userService.setRefreshToken(
      user._id.toHexString(),
      refreshToken,
    );

    return { accessToken, refreshToken };
  }

  async register(registerUserDto: RegisterUserDto): Promise<AuthTokens> {
    const user = await this.userService.create(
      registerUserDto.email,
      registerUserDto.password,
    );

    return this.login(user);
  }

  async logout(userId: string): Promise<void> {
    await this.userService.removeRefreshToken(userId);
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userService.findByEmail(email);
    if (!user || !user.password) {
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

  async validateOauthLogin(profile: any): Promise<AuthTokens> {
    const { emails, displayName } = profile;
    const email = emails[0].value;

    let user = await this.userService.findByEmail(email);

    if (!user) {
      user = await this.userService.create(email, null);
    }

    const { accessToken, refreshToken } = await this.login(user);

    return { accessToken, refreshToken };
  }

  async validateUserRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<User> {
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

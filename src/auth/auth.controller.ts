import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from 'src/user/schema/user.schema';
import type { Response } from 'express';
import { AuthService } from './providers/auth.service';
import { clearAuthCookies, setAuthCookies } from './utils/cookies.utils';
import { JwtRefreshTokenAuthGuard } from './guards/jwt-refresh-auth.guard';
import { RegisterUserDto } from './dtos/register-user.dto';
import { ApiBody, ApiCookieAuth, ApiOperation } from '@nestjs/swagger';
import { LoginUserDto } from './dtos/login-user.dto';
import { JwtAccessTokenAuthGuard } from './guards/jwt-access-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginUserDto })
  @Post('/login')
  @UseGuards(LocalAuthGuard)
  async login(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.login(user);

    setAuthCookies(response, accessToken, refreshToken);

    return { message: 'Login successful' };
  }

  @Post('/register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterUserDto })
  async register(
    @Body() registerUserDto: RegisterUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { user, accessToken, refreshToken } =
      await this.authService.register(registerUserDto);

    setAuthCookies(response, accessToken, refreshToken);

    return {
      message: 'Registration successful',
      user: {
        id: user._id,
        email: user.email,
      },
    };
  }

  @Post('/refresh')
  @ApiOperation({ summary: 'Refresh access and refresh tokens' })
  @ApiCookieAuth('refreshToken')
  @UseGuards(JwtRefreshTokenAuthGuard)
  async refreshToken(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.login(user);

    setAuthCookies(response, accessToken, refreshToken);

    return { message: 'Tokens refreshed' };
  }

  @Post('/logout')
  @UseGuards(JwtAccessTokenAuthGuard)
  async logout(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.logout(user._id.toHexString());

    clearAuthCookies(response);

    return { message: 'Logged out successfully' };
  }
}

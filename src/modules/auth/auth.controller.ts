import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { toUserResponse, type UserResponse } from '../users/user-response.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { User } from '../users/entities/user.entity.js';
import { AuthTokens } from './auth-tokens.js';
import { LocalAuthGuard } from './guards/local-auth.guard.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import type { Request as HttpRequest } from 'express';
import { CurrentSessionId } from '../../common/types/current-session-id.decorator.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiCreatedResponse({
    description: 'The user was successfully registered',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        email: { type: 'string', format: 'email' },
        createdAt: { type: 'string', format: 'date-time' },
      },
      required: ['id', 'email', 'createdAt'],
    },
  })
  async register(@Body() registerDto: RegisterDto): Promise<UserResponse> {
    return this.authService.register(registerDto);
  }

  @Post('/login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in a user' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description: 'The user was successfully logged in',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
        tokenType: { type: 'string', example: 'Bearer' },
        expiresIn: { type: 'number' },
      },
      required: ['accessToken', 'refreshToken', 'tokenType', 'expiresIn'],
    },
  })
  async login(
    @CurrentUser() user: User,
    @Request() request: HttpRequest,
  ): Promise<AuthTokens> {
    const userAgent = request.headers['user-agent'];
    return this.authService.startSession(user, {
      userAgent: typeof userAgent === 'string' ? userAgent : null,
      ipAddress: request.ip ?? null,
    });
  }

  @Post('/refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh the access token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiOkResponse({
    description: 'The access token was successfully refreshed',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
        tokenType: { type: 'string', example: 'Bearer' },
        expiresIn: { type: 'number' },
      },
      required: ['accessToken', 'refreshToken', 'tokenType', 'expiresIn'],
    },
  })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<AuthTokens> {
    return this.authService.refresh(refreshTokenDto.refreshToken);
  }

  @Post('/logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Log out the current session' })
  @ApiOkResponse({
    description: 'The session and its refresh tokens were revoked',
  })
  async logout(
    @CurrentUser() user: User,
    @CurrentSessionId() sessionId: string | undefined,
  ): Promise<void> {
    if (!sessionId) {
      throw new UnauthorizedException('Invalid access token');
    }

    await this.authService.logout(user.id, sessionId);
  }

  @Get('/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the current user' })
  @ApiOkResponse({
    description: 'The current authenticated user',
  })
  me(@CurrentUser() user: User): UserResponse {
    return toUserResponse(user);
  }
}

import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
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
import { toUserResponse, type UserResponse } from '../users/user-response.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { User } from '../users/entities/user.entity.js';
import { AuthTokens } from './auth-tokens.js';
import { LocalAuthGuard } from './guards/local-auth.guard.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import type { Request as HttpRequest } from 'express';

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
        tokenType: { type: 'string', example: 'Bearer' },
        expiresIn: { type: 'number' },
      },
      required: ['accessToken', 'tokenType', 'expiresIn'],
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

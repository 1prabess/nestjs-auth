import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token issued when the session was started',
    example: 'u3Xq2wP9Qm1kLz7rF0nT4vY8bC6dE1sA5gH2jK9lM0oP3qR7tU4vW6xY8zA1bC',
    minLength: 40,
    maxLength: 128,
  })
  @IsString()
  @MinLength(40)
  @MaxLength(128)
  refreshToken: string;
}

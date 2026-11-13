import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Email address of the registered user',
    example: 'user@example.com',
    maxLength: 320,
  })
  @IsEmail()
  @MaxLength(320)
  email: string;

  @ApiProperty({
    description: 'Password of the registered user',
    example: 'StrongPassword123!',
    maxLength: 128,
  })
  @IsString()
  @MaxLength(128)
  password: string;
}

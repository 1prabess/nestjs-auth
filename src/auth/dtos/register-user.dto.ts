import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {
  @ApiProperty({
    description: 'Email of the user',
    example: 'user@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description:
      'Password of the user. Must be strong (min 8 chars, uppercase, lowercase, number, symbol)',
    example: 'StrongP@ssw0rd!',
  })
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;
}

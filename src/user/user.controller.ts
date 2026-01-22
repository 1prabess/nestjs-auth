import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from 'src/dtos/create-user.dto';
import { UserService } from './providers/user.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }
}

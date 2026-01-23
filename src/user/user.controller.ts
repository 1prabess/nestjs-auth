import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './providers/user.service';
import { JwtAccessTokenAuthGuard } from 'src/auth/guards/jwt-access-auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from './schema/user.schema';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users (Admin/Moderator only)' })
  @Get()
  @UseGuards(JwtAccessTokenAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the currently logged-in user' })
  @Get('/profile')
  @UseGuards(JwtAccessTokenAuthGuard)
  async getProfile(@CurrentUser() user: User): Promise<User | null> {
    return this.userService.findById(user._id.toHexString());
  }
}

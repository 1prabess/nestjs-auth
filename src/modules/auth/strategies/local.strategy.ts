import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UserService } from '../../users/user.service.js';
import { PasswordService } from '../password.service.js';
import { User } from '../../users/entities/user.entity.js';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(
    private readonly usersService: UserService,
    private readonly passwordService: PasswordService,
  ) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);

    if (!user || !user.passwordHash) {
      await this.passwordService.verifyDummy(password);
      throw new UnauthorizedException('Invalid email or password');
    }

    const matches = await this.passwordService.verifyPassword(
      user.passwordHash,
      password,
    );

    if (!matches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return user;
  }
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../schema/user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from 'src/dtos/create-user.dto';
import { HashingProvider } from 'src/auth/providers/hashing.provider';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly hashingProvider: HashingProvider,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = new this.userModel({
      ...createUserDto,
      password: await this.hashingProvider.hash(createUserDto.password),
    });

    return await user.save();
  }
}

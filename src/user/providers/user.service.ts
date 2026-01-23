import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../schema/user.schema';
import { Model } from 'mongoose';
import { HashingProvider } from 'src/auth/providers/hashing.provider';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly hashingProvider: HashingProvider,
  ) {}

  async create(email: string, password: string) {
    const existingUser = await this.findByEmail(email);

    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    const hashedPassword = await this.hashingProvider.hash(password);

    const user = new this.userModel({
      email,
      password: hashedPassword,
    });

    return await user.save();
  }

  async findById(userId: string) {
    return await this.userModel.findById(userId);
  }

  async findByEmail(email: string) {
    return await this.userModel.findOne({ email });
  }

  async findAll() {
    return this.userModel.find().select('-password -refreshToken');
  }

  async setRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await this.hashingProvider.hash(refreshToken);

    await this.userModel.findByIdAndUpdate(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  async findByIdWithRefreshToken(userId: string) {
    return await this.userModel.findById(userId).select('+refreshToken');
  }

  async removeRefreshToken(userId: string) {
    await this.userModel.findByIdAndUpdate(userId, { refreshToken: null });
  }
}

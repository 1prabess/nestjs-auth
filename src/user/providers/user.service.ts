import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../schema/user.schema';
import { Model, Document } from 'mongoose';
import { HashingProvider } from 'src/auth/providers/hashing.provider';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User & Document>,
    private readonly hashingProvider: HashingProvider,
  ) {}

  async create(email: string, password: string): Promise<User> {
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

  async findById(userId: string): Promise<User | null> {
    return await this.userModel
      .findById(userId)
      .select('-password -refreshToken');
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userModel.findOne({ email });
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-password -refreshToken');
  }

  async setRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const hashedRefreshToken = await this.hashingProvider.hash(refreshToken);

    await this.userModel.findByIdAndUpdate(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  async findByIdWithRefreshToken(userId: string): Promise<User | null> {
    return await this.userModel.findById(userId).select('+refreshToken');
  }

  async removeRefreshToken(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { refreshToken: null });
  }
}

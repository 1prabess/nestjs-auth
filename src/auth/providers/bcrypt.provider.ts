import { Injectable } from '@nestjs/common';
import { HashingProvider } from './hashing.provider';
import bcrypt from 'bcryptjs';

@Injectable()
export class BcryptProvider implements HashingProvider {
  private readonly saltRounds = 10;

  async hash(value: string): Promise<string> {
    return await bcrypt.hash(value, this.saltRounds);
  }

  async compare(value: string, hashValue: string): Promise<boolean> {
    return await bcrypt.compare(value, hashValue);
  }
}

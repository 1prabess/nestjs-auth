import { Injectable } from '@nestjs/common';
import { argon2id, hash, verify } from 'argon2';
import { randomBytes } from 'crypto';

@Injectable()
export class PasswordService {
  private dummyHash: string | null = null;

  async hashPassword(password: string): Promise<string> {
    return hash(password, {
      type: argon2id,
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
    });
  }

  async verifyPassword(
    passwordHash: string,
    password: string,
  ): Promise<boolean> {
    try {
      return await verify(passwordHash, password);
    } catch {
      return false;
    }
  }

  async verifyDummy(password: string): Promise<boolean> {
    this.dummyHash ??= await this.hashPassword(randomBytes(32).toString('hex'));

    return this.verifyPassword(this.dummyHash, password);
  }
}

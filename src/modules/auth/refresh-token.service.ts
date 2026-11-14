import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshToken } from './entities/refresh-token.entity.js';
import { Repository } from 'typeorm';
import { createHash, randomBytes } from 'crypto';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  generateToken(): string {
    return randomBytes(32).toString('base64url');
  }

  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  async storeToken(
    sessionId: string,
    userId: string,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<RefreshToken> {
    const refreshToken = this.refreshTokenRepository.create({
      sessionId,
      userId,
      tokenHash,
      expiresAt,
    });

    return await this.refreshTokenRepository.save(refreshToken);
  }
}

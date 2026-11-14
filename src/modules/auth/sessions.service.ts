import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Session } from './entities/session.entity.js';
import { IsNull, MoreThan, Repository } from 'typeorm';

export interface SessionMetadata {
  userAgent: string | null;
  ipAddress: string | null;
}

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionsRepository: Repository<Session>,
  ) {}

  async create(
    userId: string,
    expiresAt: Date,
    metaData: SessionMetadata,
  ): Promise<Session> {
    const session = this.sessionsRepository.create({
      userId,
      expiresAt,
      lastUsedAt: new Date(),
      userAgent: metaData.userAgent,
      ipAddress: metaData.ipAddress,
    });

    return this.sessionsRepository.save(session);
  }

  async listActive(userId: string): Promise<Session[]> {
    return this.sessionsRepository.find({
      where: {
        userId,
        revokedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
      order: { lastUsedAt: 'DESC' },
    });
  }
}

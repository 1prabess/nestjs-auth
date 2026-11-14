import { registerAs } from '@nestjs/config';

export default registerAs('sessionConfig', () => ({
  refreshTtl: process.env.REFRESH_TTL ?? '7d',
  absoluteTtl: process.env.SESSION_ABSOLUTE_TTL ?? '30d',
}));

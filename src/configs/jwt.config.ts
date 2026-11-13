import { registerAs } from '@nestjs/config';

export default registerAs('jwtConfig', () => ({
  accessSecret: process.env.JWT_ACCESS_SECRET ?? '',
  accessTtl: process.env.JWT_ACCESS_TTL ?? '15m',
}));

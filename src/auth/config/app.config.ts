import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  smtpHost: process.env.SMTP_HOST,
  smtpUsername: process.env.SMTP_USERNAME,
  smtpPassword: process.env.SMTP_PASSWORD,
  smtpPort: process.env.SMTP_PORT,
}));

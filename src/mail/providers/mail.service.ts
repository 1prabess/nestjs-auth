import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from 'src/user/schema/user.schema';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendWelcomeMail(user: User): Promise<void> {
    await this.mailerService.sendMail({
      to: user.email,
      from: 'Prabesh Shrestha',
      subject: 'Welcome to Nestjs Auth',
      template: './welcome',
      context: {
        email: user.email,
        year: new Date().getFullYear(),
        appName: 'Nestjs Auth',
      },
    });

    console.log(`Welcome email sent to ${user.email}`);
  }
}

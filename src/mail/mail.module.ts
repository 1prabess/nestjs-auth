import { Global, Module } from '@nestjs/common';
import { MailService } from './providers/mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import appConfig from 'src/auth/config/app.config';
import { ConfigModule, type ConfigType } from '@nestjs/config';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { join } from 'path';

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [appConfig.KEY],
      imports: [ConfigModule.forFeature(appConfig)],
      useFactory: (appConfiguration: ConfigType<typeof appConfig>) => ({
        transport: {
          host: appConfiguration.smtpHost,
          secure: false,
          port: appConfiguration.smtpPort,
          auth: {
            user: appConfiguration.smtpUsername,
            pass: appConfiguration.smtpPassword,
          },
        },
        defaults: {
          from: `My App <no-reply@myapp.com>`,
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new EjsAdapter(),
          options: {
            strict: false,
          },
        },
      }),
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}

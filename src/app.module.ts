import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import type { ConfigType } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import dbConfig from './auth/config/db.config';
import { envValidationSchema } from './auth/config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      load: [dbConfig],
    }),
    MongooseModule.forRootAsync({
      inject: [dbConfig.KEY],
      useFactory: (dbConfiguration: ConfigType<typeof dbConfig>) => ({
        uri: dbConfiguration.uri,
      }),
    }),
    UserModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

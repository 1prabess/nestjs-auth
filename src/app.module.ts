import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './configs/app.config.js';
import databaseConfig from './configs/database.config.js';
import { envSchema } from './configs/env.validation.js';
import { UsersModule } from './modules/users/users.module.js';
import { DatabaseModule } from './database/database.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import jwtConfig from './configs/jwt.config.js';
import sessionConfig from './configs/session.config.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      cache: true,
      load: [appConfig, databaseConfig, jwtConfig, sessionConfig],
      validationSchema: envSchema,
    }),
    UsersModule,
    DatabaseModule,
    HealthModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

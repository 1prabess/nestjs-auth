import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NextFunction, Request, Response } from 'express';
import { AppModule } from './app.module.js';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  const helmetMiddleware = helmet();

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/docs')) return next();
    return helmetMiddleware(req, res, next);
  });

  const config = new DocumentBuilder()
    .setTitle('nestjs-auth')
    .setDescription('Authentication API')
    .setVersion('0.0.1')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();

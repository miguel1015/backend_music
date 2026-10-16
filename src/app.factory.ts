import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/httpException.filter';

/**
 * Crea y configura la app. La usan el servidor local (main.ts) y la función
 * de Vercel (api/index.js)
 */
export async function createApp(): Promise<NestExpressApplication> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });

  // La foto de perfil viaja en base64 dentro del JSON
  app.useBodyParser('json', { limit: '5mb' });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.setGlobalPrefix('/api');

  const config = new DocumentBuilder()
    .setTitle('Musik API')
    .setDescription('API de ProyectMusic')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/docs', app, document);

  return app;
}

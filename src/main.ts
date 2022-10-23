import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PrismaModel } from './prisma/generated-classes';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const config = new DocumentBuilder()
    .setTitle('NestJS - JWT HTTP-Only Cookie Authentication')
    .setDescription(
      'A repository made for exploring NestJS Authentication with Cookie based access tokens and refresh tokens.',
    )
    .setVersion('1.0')
    .addCookieAuth(
      'Authentication',
      {
        type: 'apiKey',
        in: 'cookie',
        description:
          'Provide email and password credentials to be authenticated and have access to privileged resources',
      },
      'Authentication',
    )
    .addCookieAuth(
      'Refresh',
      {
        type: 'apiKey',
        in: 'cookie',
        description:
          'Provide email and password credentials to be authenticated and have access to privileged resources',
      },
      'Refresh',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [...PrismaModel.extraModels],
  });

  SwaggerModule.setup('api', app, document);
  app.enableCors({
    origin: 'http://localhost:3001',
    credentials: true,
  });
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());
  app.useLogger(app.get(Logger));
  await app.listen(3000);
}
bootstrap();

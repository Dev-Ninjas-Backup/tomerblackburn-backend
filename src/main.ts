import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('TomerBlackburn Authentication API')
    .setDescription(
      'A secure authentication API with JWT tokens, featuring user registration and login endpoints. Built with NestJS and PostgreSQL.',
    )
    .setVersion('1.0.0')
    .addTag('authentication', 'User authentication endpoints')
    .addTag('health', 'Health check and system status')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT! || 3000;
  await app.listen(process.env.PORT ?? port);
  console.log(`the server running at http://localhost:${port}/api`);
}
bootstrap();

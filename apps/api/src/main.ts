import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';

export function configureApp(app: INestApplication): void {
  const configService = app.get(ConfigService);
  const corsOriginsEnv = configService.get<string>(
    'CORS_ORIGINS',
    'http://localhost:3000,http://127.0.0.1:3000',
  );
  const origins = corsOriginsEnv
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: origins,
    credentials: true,
  });

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
}

export function configureSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Dashboard Power BI API')
    .setDescription('API backend da plataforma Dashboard Power BI.')
    .setVersion('0.1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
}

export async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3001);
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');

  configureApp(app);

  if (nodeEnv !== 'production') {
    configureSwagger(app);
  }

  await app.listen(port);
}

if (require.main === module) {
  void bootstrap();
}

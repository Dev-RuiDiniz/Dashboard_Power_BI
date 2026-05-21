import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

export function configureApp(app: {
  useGlobalPipes: (...pipes: ValidationPipe[]) => void;
}): void {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
}

export function configureSwagger(app: Parameters<typeof SwaggerModule.setup>[1]): void {
  const config = new DocumentBuilder()
    .setTitle('Dashboard Power BI API')
    .setDescription('API backend da plataforma Dashboard Power BI.')
    .setVersion('0.1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3001);

  configureApp(app);
  configureSwagger(app);

  await app.listen(port);
}

void bootstrap();

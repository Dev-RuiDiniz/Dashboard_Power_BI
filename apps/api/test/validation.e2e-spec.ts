import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { configureApp } from '../src/main';

describe('ValidationPipe global (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('deve rejeitar payload inválido', async () => {
    await request(app.getHttpServer())
      .post('/validation-test')
      .send({ name: 'ab', extra: 'bloqueado' })
      .expect(400);
  });

  it('deve aceitar payload válido e remover campos não permitidos', async () => {
    await request(app.getHttpServer())
      .post('/validation-test')
      .send({ name: 'teste' })
      .expect(201)
      .expect({
        accepted: true,
        name: 'teste',
      });
  });
});

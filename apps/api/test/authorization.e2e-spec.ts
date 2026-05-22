import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { configureApp } from '../src/main';

describe('Autorização RBAC e setores (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.AUTH_DEMO_USER_EMAIL = 'admin@example.com';
    process.env.AUTH_DEMO_USER_PASSWORD = 'Admin123!';
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_ACCESS_EXPIRES_IN_SECONDS = '900';
    process.env.JWT_REFRESH_EXPIRES_IN_SECONDS = '604800';
    process.env.BCRYPT_SALT_ROUNDS = '4';
    process.env.AUTH_LOGIN_MAX_ATTEMPTS = '5';
    process.env.AUTH_LOGIN_WINDOW_SECONDS = '60';
    process.env.AUTH_LOGIN_LOCKOUT_SECONDS = '60';

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

  const login = async (email: string, ip: string) => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .set('x-forwarded-for', ip)
      .send({
        email,
        password: 'Admin123!',
      })
      .expect(200);

    return response.body.accessToken as string;
  };

  it('deve retornar 401 quando token não for informado', async () => {
    await request(app.getHttpServer()).get('/authz-test/view/financeiro').expect(401);
  });

  it('viewer deve visualizar o próprio setor', async () => {
    const token = await login('viewer.financeiro@example.com', '10.20.0.1');

    await request(app.getHttpServer())
      .get('/authz-test/view/financeiro')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.action).toBe('view');
        expect(body.sector).toBe('financeiro');
      });
  });

  it('viewer não deve fazer download', async () => {
    const token = await login('viewer.financeiro@example.com', '10.20.0.2');

    await request(app.getHttpServer())
      .get('/authz-test/download/financeiro')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });

  it('downloader deve fazer download do próprio setor', async () => {
    const token = await login('downloader.financeiro@example.com', '10.20.0.3');

    await request(app.getHttpServer())
      .get('/authz-test/download/financeiro')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  it('downloader mão deve acessar setor diferente', async () => {
    const token = await login('downloader.financeiro@example.com', '10.20.0.4');

    await request(app.getHttpServer())
      .get('/authz-test/download/comercial')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });

  it('admin deve acessar endpoint administrativo e qualquer setor', async () => {
    const token = await login('admin@example.com', '10.20.0.5');

    await request(app.getHttpServer())
      .get('/authz-test/admin')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    await request(app.getHttpServer())
      .get('/authz-test/download/comercial')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
});

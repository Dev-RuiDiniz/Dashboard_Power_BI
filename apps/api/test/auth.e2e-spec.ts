import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { configureApp } from '../src/main';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.AUTH_DEMO_USER_EMAIL = 'admin@example.com';
    process.env.AUTH_DEMO_USER_PASSWORD = 'Admin123!';
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_ACCESS_EXPIRES_IN_SECONDS = '900';
    process.env.JWT_REFRESH_EXPIRES_IN_SECONDS = '604800';
    process.env.BCRYPT_SALT_ROUNDS = '4';
    process.env.AUTH_LOGIN_MAX_ATTEMPTS = '2';
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

  it('POST /auth/login deve retornar access token e refresh token', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .set('x-forwarded-for', '10.0.0.1')
      .send({
        email: 'admin@example.com',
        password: 'Admin123!',
      })
      .expect(200);

    expect(response.body).toEqual({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
      tokenType: 'Bearer',
      expiresIn: 900,
    });
  });

  it('POST /auth/login deve rejeitar credenciais inválidas', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .set('x-forwarded-for', '10.0.0.2')
      .send({
        email: 'admin@example.com',
        password: 'SenhaErrada123!',
      })
      .expect(401);
  });

  it('POST /auth/login deve retornar 429 após brute-force', async () => {
    const payload = {
      email: 'admin@example.com',
      password: 'SenhaErrada123!',
    };

    await request(app.getHttpServer()).post('/auth/login').set('x-forwarded-for', '10.0.0.3').send(payload).expect(401);
    await request(app.getHttpServer()).post('/auth/login').set('x-forwarded-for', '10.0.0.3').send(payload).expect(401);
    await request(app.getHttpServer()).post('/auth/login').set('x-forwarded-for', '10.0.0.3').send(payload).expect(429);
    await request(app.getHttpServer())
      .post('/auth/login')
      .set('x-forwarded-for', '10.0.0.3')
      .send({
        email: 'admin@example.com',
        password: 'Admin123!',
      })
      .expect(429);
  });

  it('POST /auth/refresh deve rotacionar refresh token', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .set('x-forwarded-for', '10.0.0.4')
      .send({
        email: 'admin@example.com',
        password: 'Admin123!',
      })
      .expect(200);

    const refreshResponse = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({
        refreshToken: loginResponse.body.refreshToken,
      })
      .expect(200);

    expect(refreshResponse.body.refreshToken).not.toBe(loginResponse.body.refreshToken);

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({
        refreshToken: loginResponse.body.refreshToken,
      })
      .expect(401);
  });

  it('POST /auth/logout deve invalidar refresh token', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .set('x-forwarded-for', '10.0.0.5')
      .send({
        email: 'admin@example.com',
        password: 'Admin123!',
      })
      .expect(200);

    await request(app.getHttpServer())
      .post('/auth/logout')
      .send({
        refreshToken: loginResponse.body.refreshToken,
      })
      .expect(200)
      .expect({ success: true });

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({
        refreshToken: loginResponse.body.refreshToken,
      })
      .expect(401);
  });
});

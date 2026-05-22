import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { EmailService } from '../src/auth/services/email.service';
import { configureApp } from '../src/main';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let emailService: EmailService;

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
    process.env.PASSWORD_RESET_TOKEN_EXPIRES_SECONDS = '900';
    process.env.PASSWORD_RESET_PUBLIC_URL = 'http://localhost:3000/reset-password';
    process.env.SMTP_MODE = 'mock';

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    emailService = moduleRef.get(EmailService);
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/forgot-password deve retornar resposta genérica para e-mail existente', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/forgot-password')
      .send({
        email: 'admin@example.com',
      })
      .expect(200);

    expect(response.body).toEqual({
      success: true,
      message: 'Se o e-mail estiver cadastrado, enviaremos instruções para redefinir a senha.',
    });
    expect(emailService.getSentEmails().length).toBeGreaterThan(0);
  });

  it('POST /auth/forgot-password deve retornar resposta genérica para e-mail inexistente', async () => {
    emailService.clearSentEmails();

    const response = await request(app.getHttpServer())
      .post('/auth/forgot-password')
      .send({
        email: 'unknown@example.com',
      })
      .expect(200);

    expect(response.body).toEqual({
      success: true,
      message: 'Se o e-mail estiver cadastrado, enviaremos instruções para redefinir a senha.',
    });
    expect(emailService.getSentEmails()).toHaveLength(0);
  });

  it('POST /auth/reset-password deve rejeitar token inválido', async () => {
    await request(app.getHttpServer())
      .post('/auth/reset-password')
      .send({
        token: 'token-invalido-com-tamanho-minimo-para-teste',
        newPassword: 'NovaSenha123!',
      })
      .expect(400);
  });

  it('POST /auth/reset-password deve redefinir senha com token válido e impedir reutilização', async () => {
    emailService.clearSentEmails();

    await request(app.getHttpServer())
      .post('/auth/forgot-password')
      .send({
        email: 'admin@example.com',
      })
      .expect(200);

    const token = new URL(emailService.getSentEmails()[0].resetUrl).searchParams.get('token');

    await request(app.getHttpServer())
      .post('/auth/reset-password')
      .send({
        token,
        newPassword: 'NovaSenha123!',
      })
      .expect(200)
      .expect({ success: true });

    await request(app.getHttpServer())
      .post('/auth/reset-password')
      .send({
        token,
        newPassword: 'OutraSenha123!',
      })
      .expect(400);

    await request(app.getHttpServer())
      .post('/auth/login')
      .set('x-forwarded-for', '10.0.10.10')
      .send({
        email: 'admin@example.com',
        password: 'Admin123!',
      })
      .expect(401);

    await request(app.getHttpServer())
      .post('/auth/login')
      .set('x-forwarded-for', '10.0.10.11')
      .send({
        email: 'admin@example.com',
        password: 'NovaSenha123!',
      })
      .expect(200);
  });
});

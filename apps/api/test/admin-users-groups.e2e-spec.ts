import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { configureApp } from '../src/main';

describe('Admin usuários e grupos (e2e)', () => {
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

  const login = async (email: string) => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .set('x-forwarded-for', `10.30.0.${Math.floor(Math.random() * 200) + 1}`)
      .send({
        email,
        password: 'Admin123!',
      })
      .expect(200);

    return response.body.accessToken as string;
  };

  it('deve retornar 401 sem token', async () => {
    await request(app.getHttpServer()).get('/admin/users').expect(401);
  });

  it('deve retornar 403 para usuário não admin', async () => {
    const token = await login('viewer.financeiro@example.com');

    await request(app.getHttpServer()).get('/admin/users').set('Authorization', `Bearer ${token}`).expect(403);
  });

  it('admin deve criar, editar, vincular grupo, resetar senha e desativar usuário', async () => {
    const token = await login('admin@example.com');

    const groupResponse = await request(app.getHttpServer())
      .post('/admin/groups')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Financeiro Admin',
        roles: ['viewer'],
        sectors: ['financeiro'],
      })
      .expect(201);

    const userResponse = await request(app.getHttpServer())
      .post('/admin/users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: 'crud.user@example.com',
        password: 'Senha123!',
        roles: ['viewer'],
        sectors: ['financeiro'],
      })
      .expect(201);

    expect(userResponse.body).not.toHaveProperty('passwordHash');

    const userId = userResponse.body.id;

    await request(app.getHttpServer())
      .patch(`/admin/users/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        roles: ['downloader'],
      })
      .expect(200)
      .expect(({ body }) => {
        expect(body.roles).toEqual(['downloader']);
      });

    await request(app.getHttpServer())
      .put(`/admin/users/${userId}/groups`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        groupIds: [groupResponse.body.id],
      })
      .expect(200)
      .expect(({ body }) => {
        expect(body.groupIds).toEqual([groupResponse.body.id]);
      });

    await request(app.getHttpServer())
      .post(`/admin/users/${userId}/reset-password`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        newPassword: 'NovaSenha123!',
      })
      .expect(201)
      .expect({ success: true });

    await request(app.getHttpServer())
      .patch(`/admin/users/${userId}/deactivate`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.isActive).toBe(false);
      });
  });
});

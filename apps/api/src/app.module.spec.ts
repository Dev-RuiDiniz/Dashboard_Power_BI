import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from './app.module';
import { configureApp } from './main';

describe('AppModule integration', () => {
  let app: INestApplication;
  const originalExportWorkerEnabled = process.env.EXPORT_WORKER_ENABLED;

  beforeAll(async () => {
    process.env.EXPORT_WORKER_ENABLED = 'false';

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }

    if (originalExportWorkerEnabled === undefined) {
      delete process.env.EXPORT_WORKER_ENABLED;
      return;
    }

    process.env.EXPORT_WORKER_ENABLED = originalExportWorkerEnabled;
  });

  it.each([
    '/dashboard/home',
    '/dashboard/kpis',
    '/dashboard/kpis/receita-mensal/drilldown',
    '/dashboard/sectors',
    '/notifications',
    '/exports',
    '/admin/settings',
    '/admin/permissions',
    '/admin/audit',
  ])('deve expor a rota protegida %s no runtime principal', async (path) => {
    const response = await request(app.getHttpServer()).get(path);

    expect(response.status).not.toBe(404);
    expect([401, 403]).toContain(response.status);
  });
});

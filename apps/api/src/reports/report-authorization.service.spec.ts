import { ForbiddenException, UnauthorizedException } from '@nestjs/common';

import { ReportDefinition } from './entities/report-definition.entity';
import { ReportAuthorizationService } from './report-authorization.service';

const report: ReportDefinition = {
  id: 'report-1',
  name: 'Relatório Financeiro',
  description: 'Visão consolidada.',
  sector: 'financeiro',
  sourceType: 'view',
  sourceName: 'reports.vw_financeiro',
  parameters: [],
  requiredPermissions: ['reports:financeiro:read'],
  isActive: true,
  createdAt: '2026-05-23T00:00:00.000Z',
  updatedAt: '2026-05-23T00:00:00.000Z',
};

describe('ReportAuthorizationService', () => {
  const service = new ReportAuthorizationService();

  it('deve permitir usuário com setor e permissão compatíveis', () => {
    expect(() =>
      service.assertCanAccessReport(report, {
        userId: 'user-1',
        roles: ['viewer'],
        sectors: ['financeiro'],
        permissions: ['reports:financeiro:read'],
      }),
    ).not.toThrow();
  });

  it('deve permitir admin sem validar setor ou permissão específica', () => {
    expect(() =>
      service.assertCanAccessReport(report, {
        userId: 'admin-1',
        roles: ['admin'],
        sectors: [],
        permissions: [],
      }),
    ).not.toThrow();
  });

  it('deve negar usuário sem contexto, setor ou permissão', () => {
    expect(() => service.assertCanAccessReport(report, null)).toThrow(UnauthorizedException);
    expect(() =>
      service.assertCanAccessReport(report, {
        userId: 'user-1',
        roles: ['viewer'],
        sectors: ['comercial'],
        permissions: ['reports:financeiro:read'],
      }),
    ).toThrow(ForbiddenException);
    expect(() =>
      service.assertCanAccessReport(report, {
        userId: 'user-1',
        roles: ['viewer'],
        sectors: ['financeiro'],
        permissions: [],
      }),
    ).toThrow(ForbiddenException);
  });
});

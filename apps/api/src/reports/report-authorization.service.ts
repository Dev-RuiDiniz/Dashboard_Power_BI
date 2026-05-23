import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';

import { AuthenticatedRequestUser } from '../auth/types/auth.types';
import { ReportDefinition } from './entities/report-definition.entity';

export interface ReportAccessContext {
  userId: string;
  roles: string[];
  sectors: string[];
  permissions: string[];
}

@Injectable()
export class ReportAuthorizationService {
  normalizeContext(user?: AuthenticatedRequestUser | ReportAccessContext | null): ReportAccessContext {
    if (!user) {
      throw new UnauthorizedException('Usuário não autenticado.');
    }

    const rawUser = user as AuthenticatedRequestUser & { permissions?: string[]; userId?: string; id?: string };

    return {
      userId: rawUser.sub ?? rawUser.userId ?? rawUser.id ?? 'unknown',
      roles: normalizeList(rawUser.roles),
      sectors: normalizeList(rawUser.sectors),
      permissions: normalizeList(rawUser.permissions),
    };
  }

  assertCanAccessReport(report: ReportDefinition, user?: AuthenticatedRequestUser | ReportAccessContext | null): void {
    const context = this.normalizeContext(user);

    if (context.roles.includes('admin')) {
      return;
    }

    if (!context.sectors.includes(report.sector)) {
      throw new ForbiddenException('Usuário sem acesso ao setor do relatório.');
    }

    const missingPermission = report.requiredPermissions.find((permission) => !context.permissions.includes(permission));

    if (missingPermission) {
      throw new ForbiddenException('Usuário sem permissão para acessar o relatório.');
    }
  }

  canAccessReport(report: ReportDefinition, user?: AuthenticatedRequestUser | ReportAccessContext | null): boolean {
    try {
      this.assertCanAccessReport(report, user);

      return true;
    } catch {
      return false;
    }
  }
}

function normalizeList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string').map((item) => item.trim().toLowerCase()).filter(Boolean);
}

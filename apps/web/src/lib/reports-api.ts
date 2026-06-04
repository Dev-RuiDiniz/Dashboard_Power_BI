import type { ReportCatalogItem } from '@/components/reports/report-catalog';
import { buildReportFiltersQueryParams, type ReportFilters } from '@/lib/report-filters';

type ApiReportSourceType = 'view' | 'stored_procedure' | 'procedure';

type ApiReport = {
  id: string;
  name: string;
  description: string;
  sector: string;
  sourceType: ApiReportSourceType;
  requiredPermissions: string[];
  status?: ReportCatalogItem['status'];
  updatedAt?: string;
};

type ApiPaginatedReports = {
  items: ApiReport[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type FetchReportsParams = {
  page?: number;
  pageSize?: number;
  token?: string;
  filters?: ReportFilters;
};

export type PaginatedReports = {
  items: ReportCatalogItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

const DEFAULT_API_URL = 'http://localhost:3001';

export async function fetchReports({ page = 1, pageSize = 20, token, filters = { parameters: undefined } }: FetchReportsParams = {}): Promise<PaginatedReports> {
  const url = new URL('/reports', getApiBaseUrl());
  url.searchParams.set('page', String(page));
  url.searchParams.set('pageSize', String(pageSize));

  buildReportFiltersQueryParams(filters).forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url.toString(), {
    headers,
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Nao foi possivel carregar os relatorios.');
  }

  const payload = (await response.json()) as ApiPaginatedReports;

  return {
    items: payload.items.map(toCatalogItem),
    page: payload.page,
    pageSize: payload.pageSize,
    total: payload.total,
    totalPages: payload.totalPages,
  };
}

function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL;
}

function toCatalogItem(report: ApiReport): ReportCatalogItem {
  return {
    id: report.id,
    name: report.name,
    description: report.description,
    sector: report.sector,
    sourceType: report.sourceType === 'stored_procedure' ? 'procedure' : report.sourceType,
    requiredPermissions: report.requiredPermissions,
    status: report.status ?? 'available',
    updatedAt: report.updatedAt ?? new Date().toISOString(),
  };
}

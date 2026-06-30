import type { ReportCatalogItem } from '@/components/reports/report-catalog';
import { apiGet } from '@/lib/admin-api';
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
  filters?: ReportFilters;
};

export type PaginatedReports = {
  items: ReportCatalogItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export async function fetchReports({
  page = 1,
  pageSize = 20,
  filters = { parameters: undefined },
}: FetchReportsParams = {}): Promise<PaginatedReports> {
  const searchParams = new URLSearchParams();
  searchParams.set('page', String(page));
  searchParams.set('pageSize', String(pageSize));

  buildReportFiltersQueryParams(filters).forEach((value, key) => {
    searchParams.set(key, value);
  });

  const query = searchParams.toString();
  const path = query ? `/reports?${query}` : '/reports';

  const payload = await apiGet<ApiPaginatedReports>(path);

  return {
    items: payload.items.map(toCatalogItem),
    page: payload.page,
    pageSize: payload.pageSize,
    total: payload.total,
    totalPages: payload.totalPages,
  };
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

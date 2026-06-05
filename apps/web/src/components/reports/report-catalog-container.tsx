'use client';

import { TriangleAlert as AlertTriangle, Loader as Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { fetchReports, type PaginatedReports } from '@/lib/reports-api';
import type { ReportFilters } from '@/lib/report-filters';

import { ReportAdvancedFilters } from './report-advanced-filters';
import { ReportCatalog } from './report-catalog';

type ReportCatalogContainerProps = {
  token?: string;
  onSelectReport?: (id: string) => void;
};

const INITIAL_PAGE = 1;
const INITIAL_PAGE_SIZE = 20;

export function ReportCatalogContainer({ token, onSelectReport }: ReportCatalogContainerProps) {
  const [reportsResponse, setReportsResponse] = useState<PaginatedReports | null>(null);
  const [filters, setFilters] = useState<ReportFilters>({ parameters: undefined });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadReports = useCallback(
    async (appliedFilters: ReportFilters) => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await fetchReports({
          page: INITIAL_PAGE,
          pageSize: INITIAL_PAGE_SIZE,
          token,
          filters: appliedFilters,
        });

        setReportsResponse(response);
      } catch {
        setErrorMessage('Não foi possível carregar os relatórios.');
      } finally {
        setIsLoading(false);
      }
    },
    [token],
  );

  useEffect(() => {
    void loadReports(filters);
  }, [filters, loadReports]);

  function handleApplyFilters(nextFilters: ReportFilters) {
    setFilters(nextFilters);
  }

  if (isLoading && !reportsResponse) {
    return (
      <Card className="border-dashed text-center">
        <CardHeader>
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-700" aria-hidden="true" />
          <CardTitle>Carregando catálogo de dashboards</CardTitle>
          <CardDescription>
            Estamos consultando a Reports API e validando os dashboards autorizados para a sessão.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (errorMessage && !reportsResponse) {
    return (
      <Card className="border-amber-200 bg-amber-50 text-center">
        <CardHeader>
          <AlertTriangle className="mx-auto h-8 w-8 text-amber-700" aria-hidden="true" />
          <CardTitle>{errorMessage}</CardTitle>
          <CardDescription>
            Verifique se a API está disponível, se a URL pública está configurada e se a sessão
            possui permissão para listar relatórios.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <ReportAdvancedFilters onApplyFilters={handleApplyFilters} />

      {isLoading ? (
        <Card className="border-dashed text-center">
          <CardHeader>
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-blue-700" aria-hidden="true" />
            <CardTitle>Atualizando relatórios</CardTitle>
            <CardDescription>Aplicando filtros avançados na Reports API.</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {errorMessage ? (
        <Card className="border-amber-200 bg-amber-50 text-center">
          <CardHeader>
            <AlertTriangle className="mx-auto h-6 w-6 text-amber-700" aria-hidden="true" />
            <CardTitle>{errorMessage}</CardTitle>
            <CardDescription>
              Os dados anteriores foram mantidos enquanto a nova consulta falhou.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <ReportCatalog reports={reportsResponse?.items ?? []} onSelectReport={onSelectReport} />
    </div>
  );
}

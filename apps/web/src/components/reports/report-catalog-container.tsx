'use client';

import { AlertTriangle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { fetchReports, type PaginatedReports } from '@/lib/reports-api';

import { ReportCatalog } from './report-catalog';

type ReportCatalogContainerProps = {
  token?: string;
};

const INITIAL_PAGE = 1;
const INITIAL_PAGE_SIZE = 20;

export function ReportCatalogContainer({ token }: ReportCatalogContainerProps) {
  const reportsResponse, setReportsResponse] = useState<PaginatedReports | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadReports() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await fetchReports({ page: INITIAL_PAGE, pageSize: INITIAL_PAGE_SIZE, token });

        if (isActive) {
          setReportsResponse(response);
        }
      } catch {
        if (isActive) {
          setErrorMessage('Nao foi possivel carregar os relatorios');
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadReports();

    return () => {
      isActive = false;
    };
  }, [token]);

  if (isLoading) {
    return (
      <Card className="border-dashed text-center">
        <CardHeader>
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-700" aria-hidden="true" />
          <CardTitle>Carregando catalogo de dashboards</CardTitle>
          <CardDescription>Estamos consultando a Reports API e validando os dashboards autorizados para a sessao.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (errorMessage) {
    return (
      <Card className="border-amber-200 bg-amber-50 text-center">
        <CardHeader>
          <AlertTriangle className="mx-auto h-8 w-8 text-amber-700" aria-hidden="true" />
          <CardTitle>{errorMessage}</CardTitle>
          <CardDescription>
            Verifique se a API esta disponivel, se a URL publica esta configurada e se a sessao possui permissao para listar relatorios.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <ReportCatalog reports={reportsResponse?.items ?? []} />;
}

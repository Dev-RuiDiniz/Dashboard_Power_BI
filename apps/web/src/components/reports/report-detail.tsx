'use client';

import {
  TriangleAlert as AlertTriangle,
  ArrowLeft,
  ChartBar as BarChart3,
  Download,
  Star,
  Loader as Loader2,
  Play,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { apiGet, apiPost } from '@/lib/admin-api';
import { createExport, favoriteReport } from '@/lib/platform-api';

type ReportParameter = {
  name: string;
  type: 'string' | 'int' | 'number' | 'boolean' | 'date';
  required?: boolean;
  maxLength?: number;
  label?: string;
};

type ReportDetail = {
  id: string;
  name: string;
  description: string;
  sector: string;
  sourceType: 'view' | 'stored_procedure';
  parameters: ReportParameter[];
  requiredPermissions: string[];
};

type QueryResult = {
  items: Record<string, unknown>[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

type ReportDetailProps = {
  reportId: string;
  onBack: () => void;
};

export function ReportDetail({ reportId, onBack }: ReportDetailProps) {
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);
  const [exportingFormat, setExportingFormat] = useState<'pdf' | 'excel' | null>(null);
  const [isFavoriting, setIsFavoriting] = useState(false);

  const loadReport = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await apiGet<ReportDetail>(`/reports/${reportId}`);
      setReport(response);
    } catch {
      setErrorMessage('Não foi possível carregar o relatório.');
    } finally {
      setIsLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    void loadReport();
  }, [loadReport]);

  async function handleExecuteQuery() {
    if (!report) return;

    setIsQuerying(true);
    setQueryError(null);
    const filters = buildFilters(report.parameters, paramValues);

    try {
      const result = await apiPost<QueryResult>(`/reports/${reportId}/query`, {
        filters,
        page: 1,
        pageSize: 50,
      });
      setQueryResult(result);
    } catch (err) {
      setQueryError(err instanceof Error ? err.message : 'Erro ao executar consulta.');
    } finally {
      setIsQuerying(false);
    }
  }

  async function handleCreateExport(format: 'pdf' | 'excel') {
    if (!report) {
      return;
    }

    setExportingFormat(format);
    setExportError(null);
    setExportSuccess(null);

    try {
      await createExport({
        reportId: report.id,
        exportFormat: format,
        parameters: buildFilters(report.parameters, paramValues),
      });
      setExportSuccess(`Exportação em ${format.toUpperCase()} solicitada com sucesso.`);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'Erro ao solicitar exportação.');
    } finally {
      setExportingFormat(null);
    }
  }

  async function handleFavoriteReport() {
    if (!report) {
      return;
    }

    setIsFavoriting(true);
    setExportError(null);
    setExportSuccess(null);

    try {
      await favoriteReport(report.id);
      setExportSuccess('Relatorio favoritado com sucesso.');
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'Erro ao favoritar relatorio.');
    } finally {
      setIsFavoriting(false);
    }
  }

  if (isLoading) {
    return (
      <Card className="border-dashed text-center">
        <CardHeader>
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-700" aria-hidden="true" />
          <CardTitle>Carregando relatório</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (errorMessage || !report) {
    return (
      <Card className="border-amber-200 bg-amber-50 text-center">
        <CardHeader>
          <AlertTriangle className="mx-auto h-8 w-8 text-amber-700" aria-hidden="true" />
          <CardTitle>{errorMessage ?? 'Relatório não encontrado.'}</CardTitle>
          <Button variant="outline" onClick={onBack} className="mx-auto mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao catálogo
          </Button>
        </CardHeader>
      </Card>
    );
  }

  const columns = queryResult?.items.length ? Object.keys(queryResult.items[0]!) : [];

  return (
    <section className="space-y-6" aria-labelledby="report-detail-title">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} aria-label="Voltar ao catálogo">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
            {report.sector} &middot; {report.sourceType === 'view' ? 'View SQL' : 'Procedure SQL'}
          </p>
          <h1
            id="report-detail-title"
            className="mt-1 text-2xl font-bold tracking-tight text-slate-950"
          >
            {report.name}
          </h1>
        </div>
        <Button
          variant="outline"
          onClick={() => void handleFavoriteReport()}
          disabled={isFavoriting}
        >
          <Star className="mr-2 h-4 w-4" aria-hidden="true" />
          {isFavoriting ? 'Favoritando...' : 'Favoritar relatorio'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-700" aria-hidden="true" />
            Detalhes do relatório
          </CardTitle>
          <CardDescription>{report.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {report.requiredPermissions.map((perm) => (
              <Badge key={perm} className="border border-slate-200 bg-white text-slate-700">
                {perm}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {report.parameters.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Parâmetros da consulta</CardTitle>
            <CardDescription>Preencha os parâmetros para executar o relatório.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {report.parameters.map((param) => (
                <Input
                  key={param.name}
                  label={`${param.label ?? param.name}${param.required ? ' *' : ''}`}
                  type={
                    param.type === 'date'
                      ? 'date'
                      : param.type === 'int' || param.type === 'number'
                        ? 'number'
                        : 'text'
                  }
                  value={paramValues[param.name] ?? ''}
                  onChange={(e) =>
                    setParamValues((prev) => ({ ...prev, [param.name]: e.target.value }))
                  }
                  placeholder={param.type}
                  helperText={`Tipo: ${param.type}${param.required ? ' (obrigatório)' : ''}`}
                />
              ))}
            </div>
            <Button onClick={handleExecuteQuery} disabled={isQuerying}>
              <Play className="mr-2 h-4 w-4" aria-hidden="true" />
              {isQuerying ? 'Executando...' : 'Executar consulta'}
            </Button>
          </CardContent>
        </Card>
      )}

      {report.parameters.length === 0 && (
        <Button onClick={handleExecuteQuery} disabled={isQuerying}>
          <Play className="mr-2 h-4 w-4" aria-hidden="true" />
          {isQuerying ? 'Executando...' : 'Executar consulta'}
        </Button>
      )}

      {queryError && (
        <Card className="border-amber-200 bg-amber-50 text-center">
          <CardHeader>
            <AlertTriangle className="mx-auto h-6 w-6 text-amber-700" aria-hidden="true" />
            <CardTitle>{queryError}</CardTitle>
          </CardHeader>
        </Card>
      )}

      {exportError && (
        <Card className="border-amber-200 bg-amber-50 text-center">
          <CardHeader>
            <AlertTriangle className="mx-auto h-6 w-6 text-amber-700" aria-hidden="true" />
            <CardTitle>{exportError}</CardTitle>
          </CardHeader>
        </Card>
      )}

      {exportSuccess && (
        <Card className="border-emerald-200 bg-emerald-50 text-center">
          <CardHeader>
            <CardTitle>{exportSuccess}</CardTitle>
          </CardHeader>
        </Card>
      )}

      {queryResult && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados</CardTitle>
            <CardDescription>
              {queryResult.total} registro(s) encontrado(s) &middot; Página {queryResult.page} de{' '}
              {queryResult.totalPages}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={() => void handleCreateExport('pdf')}
                disabled={exportingFormat !== null}
              >
                <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                {exportingFormat === 'pdf' ? 'Solicitando PDF...' : 'Exportar PDF'}
              </Button>
              <Button
                variant="outline"
                onClick={() => void handleCreateExport('excel')}
                disabled={exportingFormat !== null}
              >
                <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                {exportingFormat === 'excel' ? 'Solicitando Excel...' : 'Exportar Excel'}
              </Button>
            </div>
            {queryResult.items.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                Nenhum resultado para a consulta.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {columns.map((col) => (
                        <TableHead key={col}>{col}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {queryResult.items.map((row, idx) => (
                      <TableRow key={idx}>
                        {columns.map((col) => (
                          <TableCell key={col}>{String(row[col] ?? '-')}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </section>
  );
}

function buildFilters(parameters: ReportParameter[], paramValues: Record<string, string>) {
  const filters: Record<string, unknown> = {};

  for (const param of parameters) {
    const value = paramValues[param.name];
    if (value !== undefined && value.trim() !== '') {
      if (param.type === 'int' || param.type === 'number') {
        filters[param.name] = Number(value);
      } else if (param.type === 'boolean') {
        filters[param.name] = value === 'true';
      } else {
        filters[param.name] = value;
      }
    }
  }

  return filters;
}

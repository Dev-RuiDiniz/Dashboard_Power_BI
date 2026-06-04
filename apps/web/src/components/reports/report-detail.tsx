'use client';

import { TriangleAlert as AlertTriangle, ArrowLeft, ChartBar as BarChart3, Loader as Loader2, Play } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableEmpty } from '@/components/ui';
import { apiGet, apiPost } from '@/lib/admin-api';

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

  const loadReport = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await apiGet<ReportDetail>(`/reports/${reportId}`);
      setReport(response);
    } catch {
      setErrorMessage('Nao foi possivel carregar o relatorio.');
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

    const filters: Record<string, unknown> = {};
    for (const param of report.parameters) {
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

  if (isLoading) {
    return (
      <Card className="border-dashed text-center">
        <CardHeader>
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-700" aria-hidden="true" />
          <CardTitle>Carregando relatorio</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (errorMessage || !report) {
    return (
      <Card className="border-amber-200 bg-amber-50 text-center">
        <CardHeader>
          <AlertTriangle className="mx-auto h-8 w-8 text-amber-700" aria-hidden="true" />
          <CardTitle>{errorMessage ?? 'Relatorio nao encontrado.'}</CardTitle>
          <Button variant="outline" onClick={onBack} className="mx-auto mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao catalogo
          </Button>
        </CardHeader>
      </Card>
    );
  }

  const columns = queryResult?.items.length
    ? Object.keys(queryResult.items[0]!)
    : [];

  return (
    <section className="space-y-6" aria-labelledby="report-detail-title">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} aria-label="Voltar ao catalogo">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
            {report.sector} &middot; {report.sourceType === 'view' ? 'View SQL' : 'Procedure SQL'}
          </p>
          <h1 id="report-detail-title" className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
            {report.name}
          </h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-700" aria-hidden="true" />
            Detalhes do relatorio
          </CardTitle>
          <CardDescription>{report.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {report.requiredPermissions.map((perm) => (
              <Badge key={perm} className="border border-slate-200 bg-white text-slate-700">{perm}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {report.parameters.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Parametros da consulta</CardTitle>
            <CardDescription>Preencha os parametros para executar o relatorio.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {report.parameters.map((param) => (
                <Input
                  key={param.name}
                  label={`${param.label ?? param.name}${param.required ? ' *' : ''}`}
                  type={param.type === 'date' ? 'date' : param.type === 'int' || param.type === 'number' ? 'number' : 'text'}
                  value={paramValues[param.name] ?? ''}
                  onChange={(e) => setParamValues((prev) => ({ ...prev, [param.name]: e.target.value }))}
                  placeholder={param.type}
                  helperText={`Tipo: ${param.type}${param.required ? ' (obrigatorio)' : ''}`}
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

      {queryResult && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados</CardTitle>
            <CardDescription>
              {queryResult.total} registro(s) encontrado(s) &middot; Pagina {queryResult.page} de {queryResult.totalPages}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {queryResult.items.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">Nenhum resultado para a consulta.</p>
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

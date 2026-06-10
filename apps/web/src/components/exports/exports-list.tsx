'use client';

import {
  RefreshCw,
  TriangleAlert as AlertTriangle,
  Download,
  FileSpreadsheet,
  FileText,
  FileX,
  Loader as Loader2,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { downloadExportFile, fetchExports, type ExportJob } from '@/lib/platform-api';

const formatLabel: Record<ExportJob['export_format'], string> = {
  pdf: 'PDF',
  excel: 'Excel',
  csv: 'CSV',
  json: 'JSON',
};

const statusLabel: Record<ExportJob['status'], string> = {
  pending: 'Pendente',
  processing: 'Processando',
  completed: 'Concluido',
  failed: 'Falhou',
};

const statusVariant: Record<ExportJob['status'], 'default' | 'success' | 'warning' | 'danger'> = {
  pending: 'default',
  processing: 'warning',
  completed: 'success',
  failed: 'danger',
};

const formatIcon: Record<ExportJob['export_format'], typeof FileText> = {
  pdf: FileText,
  excel: FileSpreadsheet,
  csv: FileText,
  json: FileText,
};

export function ExportsList() {
  const [exports, setExports] = useState<ExportJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [filterFormats, setFilterFormats] = useState<string[]>([]);
  const [filterStatuses, setFilterStatuses] = useState<string[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadExports = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    setErrorMessage(null);
    try {
      setExports(await fetchExports());
      setLastUpdated(new Date());
    } catch {
      setErrorMessage('Não foi possível carregar o histórico de exportações.');
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadExports();
  }, [loadExports]);

  useEffect(() => {
    const active = exports.some((e) => e.status === 'pending' || e.status === 'processing');
    if (active) {
      setIsPolling(true);
      intervalRef.current = setInterval(() => {
        void loadExports(true);
      }, 5000);
    } else {
      setIsPolling(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [exports, loadExports]);

  async function handleDownload(item: ExportJob) {
    if (!item.file_url) {
      return;
    }

    setDownloadingId(item.id);
    setErrorMessage(null);

    try {
      const blob = await downloadExportFile(item.file_url);
      const objectUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      const fileName = item.file_url.split('/').pop() ?? `${item.id}.${item.export_format}`;

      anchor.href = objectUrl;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch {
      setErrorMessage('Não foi possível baixar o arquivo exportado.');
    } finally {
      setDownloadingId(null);
    }
  }

  if (isLoading) {
    return (
      <section className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 h-8 w-64 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 h-4 w-96 animate-pulse rounded bg-slate-200" />
        </div>
        <Card>
          <CardHeader>
            <div className="h-6 w-48 animate-pulse rounded bg-slate-200" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded bg-slate-100" />
            ))}
          </CardContent>
        </Card>
      </section>
    );
  }

  if (errorMessage && exports.length === 0) {
    return (
      <Card className="border-amber-200 bg-amber-50 text-center">
        <CardHeader>
          <AlertTriangle className="mx-auto h-8 w-8 text-amber-700" aria-hidden="true" />
          <CardTitle>{errorMessage}</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const filteredExports = exports.filter((item) => {
    const formatOk = filterFormats.length === 0 || filterFormats.includes(item.export_format);
    const statusOk = filterStatuses.length === 0 || filterStatuses.includes(item.status);
    return formatOk && statusOk;
  });

  const completedCount = exports.filter((item) => item.status === 'completed').length;
  const failedCount = exports.filter((item) => item.status === 'failed').length;

  return (
    <section className="space-y-6" aria-labelledby="exports-title">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
              Exportações
            </p>
            <h1
              id="exports-title"
              className="mt-3 text-3xl font-bold tracking-tight text-slate-950"
            >
              Histórico de exportações
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
              Acompanhe o status das suas exportações em PDF, Excel, CSV e JSON. Downloads
              disponíveis por 7 dias.
              {isPolling && (
                <span className="ml-2 inline-flex items-center gap-1 text-xs text-blue-600">
                  <RefreshCw className="h-3 w-3 animate-spin" aria-hidden="true" />
                  Atualizando automaticamente
                </span>
              )}
              {lastUpdated && !isPolling && (
                <span className="ml-2 inline-flex items-center text-xs text-slate-400">
                  Atualizado em {formatDate(lastUpdated.toISOString())}
                </span>
              )}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <SummaryCard label="Concluidas" value={completedCount} />
            <SummaryCard label="Falharam" value={failedCount} />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-blue-700" aria-hidden="true" />
                Exportações recentes
              </CardTitle>
              <CardDescription>Últimas 50 exportações solicitadas.</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {(['pdf', 'excel', 'csv', 'json'] as ExportJob['export_format'][]).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() =>
                    setFilterFormats((prev) =>
                      prev.includes(fmt) ? prev.filter((f) => f !== fmt) : [...prev, fmt],
                    )
                  }
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    filterFormats.includes(fmt)
                      ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-300'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {formatLabel[fmt]}
                </button>
              ))}
              <div className="mx-1 h-4 w-px bg-slate-200" />
              {(['pending', 'processing', 'completed', 'failed'] as ExportJob['status'][]).map(
                (st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() =>
                      setFilterStatuses((prev) =>
                        prev.includes(st) ? prev.filter((s) => s !== st) : [...prev, st],
                      )
                    }
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                      filterStatuses.includes(st)
                        ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-300'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {statusLabel[st]}
                  </button>
                ),
              )}
              {(filterFormats.length > 0 || filterStatuses.length > 0) && (
                <button
                  type="button"
                  onClick={() => {
                    setFilterFormats([]);
                    setFilterStatuses([]);
                  }}
                  className="text-xs text-slate-400 underline hover:text-slate-600"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Formato</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tamanho</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Expira em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExports.length === 0 ? (
                <TableEmpty colSpan={6}>
                  <div className="py-8 text-center">
                    <FileX className="mx-auto h-8 w-8 text-slate-400" aria-hidden="true" />
                    <p className="mt-3 text-sm text-slate-500">Nenhuma exportação encontrada.</p>
                    <p className="mt-1 text-xs text-slate-400">
                      Crie uma exportação a partir de um relatório para começar.
                    </p>
                  </div>
                </TableEmpty>
              ) : (
                filteredExports.map((item) => {
                  const Icon = formatIcon[item.export_format];
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-slate-500" aria-hidden="true" />
                          {formatLabel[item.export_format]}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={statusVariant[item.status]}
                          title={item.error_message ?? undefined}
                        >
                          {statusLabel[item.status]}
                          {item.status === 'failed' && item.error_message && (
                            <span className="sr-only">: {item.error_message}</span>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.file_size_bytes ? formatFileSize(item.file_size_bytes) : '-'}
                      </TableCell>
                      <TableCell>{formatDate(item.created_at)}</TableCell>
                      <TableCell>{formatDate(item.expires_at)}</TableCell>
                      <TableCell className="text-right">
                        {item.status === 'completed' && item.file_url ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => void handleDownload(item)}
                            disabled={downloadingId === item.id}
                          >
                            <Download className="mr-1 h-3 w-3" />
                            {downloadingId === item.id ? 'Baixando...' : 'Baixar'}
                          </Button>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(
    new Date(value),
  );
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

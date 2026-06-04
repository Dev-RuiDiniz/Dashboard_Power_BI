'use client';

import { TriangleAlert as AlertTriangle, Download, FileSpreadsheet, FileText, Loader as Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableEmpty } from '@/components/ui';
import { supabase } from '@/lib/supabase';

type ExportJob = {
  id: string;
  report_id: string;
  export_format: 'pdf' | 'excel' | 'csv' | 'json';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  file_url?: string;
  file_size_bytes?: number;
  error_message?: string;
  created_at: string;
  completed_at?: string;
  expires_at: string;
};

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadExports = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const { data, error } = await supabase
        .from('export_jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      setExports(data ?? []);
    } catch {
      setErrorMessage('Nao foi possivel carregar o historico de exportacoes.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadExports();
  }, [loadExports]);

  if (isLoading) {
    return (
      <Card className="border-dashed text-center">
        <CardHeader>
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-700" aria-hidden="true" />
          <CardTitle>Carregando exportacoes</CardTitle>
        </CardHeader>
      </Card>
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

  const completedCount = exports.filter((e) => e.status === 'completed').length;
  const failedCount = exports.filter((e) => e.status === 'failed').length;

  return (
    <section className="space-y-6" aria-labelledby="exports-title">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Exportacoes</p>
            <h1 id="exports-title" className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
              Historico de exportacoes
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
              Acompanhe o status das suas exportacoes em PDF, Excel, CSV e JSON. Downloads disponiveis por 7 dias.
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
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-blue-700" aria-hidden="true" />
            Exportacoes recentes
          </CardTitle>
          <CardDescription>Ultimas 50 exportacoes solicitadas.</CardDescription>
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
                <TableHead className="text-right">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exports.length === 0 ? (
                <TableEmpty colSpan={6}>Nenhuma exportacao encontrada.</TableEmpty>
              ) : (
                exports.map((exp) => {
                  const Icon = formatIcon[exp.export_format];
                  return (
                    <TableRow key={exp.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-slate-500" aria-hidden="true" />
                          {formatLabel[exp.export_format]}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[exp.status]}>{statusLabel[exp.status]}</Badge>
                      </TableCell>
                      <TableCell>{exp.file_size_bytes ? formatFileSize(exp.file_size_bytes) : '-'}</TableCell>
                      <TableCell>{formatDate(exp.created_at)}</TableCell>
                      <TableCell>{formatDate(exp.expires_at)}</TableCell>
                      <TableCell className="text-right">
                        {exp.status === 'completed' && exp.file_url ? (
                          <a
                            href={exp.file_url}
                            download
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center rounded-xl bg-background text-foreground ring-1 ring-border hover:bg-muted h-9 px-3 text-xs font-medium transition-colors"
                          >
                            <Download className="mr-1 h-3 w-3" /> Baixar
                          </a>
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
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

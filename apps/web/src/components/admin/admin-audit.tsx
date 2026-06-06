'use client';

import {
  TriangleAlert as AlertTriangle,
  Loader as Loader2,
  Search,
  FileText,
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
  TableEmpty,
} from '@/components/ui';
import { apiGet } from '@/lib/admin-api';

type AuditLog = {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
};

type AuditLogsResponse = AuditLog[];

export function AdminAudit() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await apiGet<AuditLogsResponse>('/admin/audit');
      setLogs(response);
    } catch {
      setErrorMessage('Não foi possível carregar os logs de auditoria.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

  const filteredLogs =
    search.trim().length > 0
      ? logs.filter(
          (log) =>
            log.userEmail.toLowerCase().includes(search.toLowerCase()) ||
            log.action.toLowerCase().includes(search.toLowerCase()) ||
            log.resource.toLowerCase().includes(search.toLowerCase()),
        )
      : logs;

  if (isLoading) {
    return (
      <Card className="border-dashed text-center">
        <CardHeader>
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-700" aria-hidden="true" />
          <CardTitle>Carregando logs de auditoria</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (errorMessage && logs.length === 0) {
    return (
      <Card className="border-amber-200 bg-amber-50 text-center">
        <CardHeader>
          <AlertTriangle className="mx-auto h-8 w-8 text-amber-700" aria-hidden="true" />
          <CardTitle>{errorMessage}</CardTitle>
          <CardDescription>
            Verifique se a API está disponível e se você possui permissão de administrador.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <section className="space-y-6" aria-labelledby="admin-audit-title">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
          Administração
        </p>
        <h1
          id="admin-audit-title"
          className="mt-3 text-3xl font-bold tracking-tight text-slate-950"
        >
          Logs de auditoria
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
          Visualize o histórico de ações administrativas e de usuário para rastreabilidade e
          conformidade.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-700" aria-hidden="true" />
                Histórico de ações
              </CardTitle>
              <CardDescription>Registros de todas as ações no sistema.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Buscar
            <span className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400"
                aria-hidden="true"
              />
              <Input
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="E-mail, ação ou recurso"
                aria-label="Buscar logs"
              />
            </span>
          </label>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Recurso</TableHead>
                <TableHead>IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableEmpty colSpan={5}>Nenhum log encontrado.</TableEmpty>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm text-slate-600">
                      {formatDate(log.createdAt)}
                    </TableCell>
                    <TableCell className="font-medium">{log.userEmail}</TableCell>
                    <TableCell>
                      <Badge className="border border-slate-200 bg-white text-slate-700">
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="border border-blue-200 bg-blue-50 text-blue-700">
                        {log.resource}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {log.ipAddress || '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

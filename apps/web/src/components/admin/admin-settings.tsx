'use client';

import {
  TriangleAlert as AlertTriangle,
  Loader as Loader2,
  Settings,
  ShieldCheck,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableEmpty,
} from '@/components/ui';
import { getAppDataClient, type SystemSettingItem } from '@/lib/app-data';
import {
  getRetentionStatus,
  runRetention,
  type RetentionConfig,
  type RetentionResult,
} from '@/lib/admin-api';

type SystemSetting = SystemSettingItem;

export function AdminSettings() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retention, setRetention] = useState<RetentionConfig | null>(null);
  const [retentionResult, setRetentionResult] = useState<RetentionResult | null>(null);
  const [retentionLoading, setRetentionLoading] = useState(false);
  const [retentionError, setRetentionError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    const client = getAppDataClient();

    setIsLoading(true);
    setErrorMessage(null);
    try {
      setSettings(await client.listSystemSettings());
    } catch {
      setErrorMessage('Nao foi possivel carregar as configuracoes.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
    void getRetentionStatus()
      .then(setRetention)
      .catch(() => setRetention(null));
  }, [loadSettings]);

  const handleRunRetention = useCallback(async () => {
    setRetentionLoading(true);
    setRetentionError(null);
    setRetentionResult(null);
    try {
      setRetentionResult(await runRetention());
    } catch {
      setRetentionError('Erro ao executar retenção.');
    } finally {
      setRetentionLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <Card className="border-dashed text-center">
        <CardHeader>
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-700" aria-hidden="true" />
          <CardTitle>Carregando configuracoes</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (errorMessage && settings.length === 0) {
    return (
      <Card className="border-amber-200 bg-amber-50 text-center">
        <CardHeader>
          <AlertTriangle className="mx-auto h-8 w-8 text-amber-700" aria-hidden="true" />
          <CardTitle>{errorMessage}</CardTitle>
          <CardDescription>
            Verifique a conexao com a fonte de dados ativa do ambiente.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <section className="space-y-6" aria-labelledby="admin-settings-title">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
          Administracao
        </p>
        <h1
          id="admin-settings-title"
          className="mt-3 text-3xl font-bold tracking-tight text-slate-950"
        >
          Configuracoes do sistema
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
          Gerencie as configuracoes globais da plataforma, incluindo SMTP, pool de conexao e cache.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-700" aria-hidden="true" />
            Configuracoes cadastradas
          </CardTitle>
          <CardDescription>
            Parametros globais que controlam o comportamento da plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Chave</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Descricao</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Atualizado em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {settings.length === 0 ? (
                <TableEmpty colSpan={5}>Nenhuma configuracao encontrada.</TableEmpty>
              ) : (
                settings.map((setting) => (
                  <TableRow key={setting.id}>
                    <TableCell className="font-medium font-mono text-xs">
                      {setting.setting_key}
                    </TableCell>
                    <TableCell className="max-w-xs truncate font-mono text-xs">
                      {setting.is_sensitive ? '****' : JSON.stringify(setting.setting_value)}
                    </TableCell>
                    <TableCell>{setting.description ?? '-'}</TableCell>
                    <TableCell>
                      <Badge variant={setting.is_sensitive ? 'warning' : 'default'}>
                        {setting.is_sensitive ? 'Sensivel' : 'Publico'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(setting.updated_at)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-blue-700" aria-hidden="true" />
            Política de Retenção (LGPD)
          </CardTitle>
          <CardDescription>
            Anonimização e expurgo automático de dados pessoais. Job cron executa diariamente às
            03:00.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {retention ? (
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-xs font-medium uppercase text-slate-500">Logs de auditoria</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {retention.auditLogDays} dias
                </p>
                <p className="mt-1 text-xs text-slate-500">IP e User-Agent anonimizados</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-xs font-medium uppercase text-slate-500">Refresh tokens</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {retention.refreshTokenDays} dias
                </p>
                <p className="mt-1 text-xs text-slate-500">Tokens expirados revogados removidos</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-xs font-medium uppercase text-slate-500">Exportações</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {retention.exportDays} dias
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Arquivos e registros expirados removidos
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              Não foi possível carregar as configurações de retenção.
            </p>
          )}

          <div className="flex items-center gap-3">
            <Button
              onClick={() => void handleRunRetention()}
              disabled={retentionLoading}
              variant="default"
            >
              {retentionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  Executando...
                </>
              ) : (
                'Executar retenção agora'
              )}
            </Button>

            {retentionResult && (
              <p className="text-sm text-green-700">
                Logs anonimizados: {retentionResult.anonymizedLogs} · Tokens removidos:{' '}
                {retentionResult.deletedTokens} · Exports removidos:{' '}
                {retentionResult.deletedExports}
              </p>
            )}

            {retentionError && <p className="text-sm text-red-700">{retentionError}</p>}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(
    new Date(value),
  );
}

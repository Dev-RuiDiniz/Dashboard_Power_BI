'use client';

import { TriangleAlert as AlertTriangle, Loader as Loader2, Settings } from 'lucide-react';
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
import { supabase } from '@/lib/supabase';

type SystemSetting = {
  id: string;
  setting_key: string;
  setting_value: unknown;
  description?: string;
  is_sensitive: boolean;
  updated_at: string;
};

export function AdminSettings() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('setting_key');
      if (error) throw error;
      setSettings(data ?? []);
    } catch {
      setErrorMessage('Não foi possível carregar as configurações.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  if (isLoading) {
    return (
      <Card className="border-dashed text-center">
        <CardHeader>
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-700" aria-hidden="true" />
          <CardTitle>Carregando configurações</CardTitle>
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
            Verifique a conexão com o Supabase e as permissões de acesso.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <section className="space-y-6" aria-labelledby="admin-settings-title">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
          Administração
        </p>
        <h1
          id="admin-settings-title"
          className="mt-3 text-3xl font-bold tracking-tight text-slate-950"
        >
          Configurações do sistema
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
          Gerencie as configurações globais da plataforma, incluindo SMTP, pool de conexão e cache.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-700" aria-hidden="true" />
            Configurações cadastradas
          </CardTitle>
          <CardDescription>
            Parâmetros globais que controlam o comportamento da plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Chave</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Atualizado em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {settings.length === 0 ? (
                <TableEmpty colSpan={5}>Nenhuma configuração encontrada.</TableEmpty>
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
                        {setting.is_sensitive ? 'Sensível' : 'Público'}
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
    </section>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(
    new Date(value),
  );
}

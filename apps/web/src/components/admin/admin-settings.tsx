'use client';

import { TriangleAlert as AlertTriangle, Loader as Loader2, Settings } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

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
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { fetchSystemSettings, type SystemSetting, updateSystemSetting } from '@/lib/platform-api';

export function AdminSettings() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [draftValues, setDraftValues] = useState<Record<string, string>>({});
  const [savingKeys, setSavingKeys] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const nextSettings = await fetchSystemSettings();
      setSettings(nextSettings);
      setDraftValues(
        Object.fromEntries(
          nextSettings.map((setting) => [setting.setting_key, getSettingInputValue(setting)]),
        ),
      );
    } catch {
      setErrorMessage('Não foi possível carregar as configurações.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const draftByKey = useMemo(() => draftValues, [draftValues]);

  async function handleSave(setting: SystemSetting) {
    const nextValue = draftByKey[setting.setting_key] ?? '';

    setSavingKeys((current) => ({ ...current, [setting.setting_key]: true }));
    setErrorMessage(null);

    try {
      const updated = await updateSystemSetting(setting.setting_key, { value: nextValue });
      setSettings((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setDraftValues((current) => ({
        ...current,
        [updated.setting_key]: getSettingInputValue(updated),
      }));
    } catch {
      setErrorMessage('Não foi possível salvar a configuração selecionada.');
    } finally {
      setSavingKeys((current) => ({ ...current, [setting.setting_key]: false }));
    }
  }

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
            Verifique a conexão com a API e as permissões de acesso.
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
          {errorMessage ? <p className="text-sm font-medium text-danger">{errorMessage}</p> : null}
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
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {settings.length === 0 ? (
                <TableEmpty colSpan={6}>Nenhuma configuração encontrada.</TableEmpty>
              ) : (
                settings.map((setting) => {
                  const isSaving = savingKeys[setting.setting_key] ?? false;

                  return (
                    <TableRow key={setting.id}>
                      <TableCell className="font-mono text-xs font-medium">
                        {setting.setting_key}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        {setting.is_sensitive ? (
                          <span className="font-mono text-xs">****</span>
                        ) : (
                          <Input
                            aria-label={`Valor ${setting.setting_key}`}
                            value={draftValues[setting.setting_key] ?? ''}
                            onChange={(event) =>
                              setDraftValues((current) => ({
                                ...current,
                                [setting.setting_key]: event.target.value,
                              }))
                            }
                          />
                        )}
                      </TableCell>
                      <TableCell>{setting.description ?? '-'}</TableCell>
                      <TableCell>
                        <Badge variant={setting.is_sensitive ? 'warning' : 'default'}>
                          {setting.is_sensitive ? 'Sensível' : 'Público'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(setting.updated_at)}</TableCell>
                      <TableCell className="text-right">
                        {setting.is_sensitive ? (
                          <span className="text-xs text-slate-500">Somente visualização</span>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => void handleSave(setting)}
                            disabled={isSaving}
                          >
                            {isSaving ? 'Salvando...' : 'Salvar'}
                          </Button>
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

function getSettingInputValue(setting: SystemSetting): string {
  if (
    setting.setting_value &&
    typeof setting.setting_value === 'object' &&
    'value' in setting.setting_value &&
    typeof setting.setting_value.value === 'string'
  ) {
    return setting.setting_value.value;
  }

  if (typeof setting.setting_value === 'string') {
    return setting.setting_value;
  }

  return JSON.stringify(setting.setting_value ?? '');
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(
    new Date(value),
  );
}

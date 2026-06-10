'use client';

import { useEffect, useState } from 'react';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from '@/components/ui';
import { getDashboardById, updateDashboard } from '@/lib/platform-api';

type EditDashboardModalProps = {
  dashboardId: string;
  onClose: () => void;
  onSuccess: () => void;
};

export function EditDashboardModal({ dashboardId, onClose, onSuccess }: EditDashboardModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const dashboard = await getDashboardById(dashboardId);
        setName(dashboard.name);
        setDescription(dashboard.description);
        setIsDefault(dashboard.isDefault);
      } catch {
        setErrorMessage('Nao foi possivel carregar o dashboard.');
      } finally {
        setIsLoading(false);
      }
    }
    void load();
  }, [dashboardId]);

  async function handleSave() {
    if (!name.trim()) return;

    setIsSaving(true);
    setErrorMessage(null);
    try {
      await updateDashboard(dashboardId, {
        name: name.trim(),
        description: description.trim() || undefined,
        isDefault,
      });
      onSuccess();
    } catch {
      setErrorMessage('Nao foi possivel salvar as alteracoes.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Editar dashboard</CardTitle>
          <CardDescription>Atualize as informacoes do dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <p className="text-sm text-slate-500">Carregando...</p>
          ) : (
            <>
              {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Nome
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome do dashboard"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Descricao
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descricao opcional"
                />
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                />
                Definir como padrao
              </label>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button onClick={() => void handleSave()} disabled={isSaving || !name.trim()}>
                  {isSaving ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

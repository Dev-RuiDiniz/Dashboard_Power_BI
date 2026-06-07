'use client';

import { LayoutDashboard, Loader2, Star, TriangleAlert } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from '@/components/ui';
import {
  createDashboard,
  fetchDashboards,
  fetchFavoriteReports,
  type UserDashboard,
} from '@/lib/platform-api';
import type { PaginatedReports } from '@/lib/reports-api';

type FavoriteReport = PaginatedReports['items'][number];

export function DashboardWorkspace() {
  const [dashboards, setDashboards] = useState<UserDashboard[]>([]);
  const [favorites, setFavorites] = useState<FavoriteReport[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadWorkspace = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [dashboardResponse, favoriteResponse] = await Promise.all([
        fetchDashboards(),
        fetchFavoriteReports(),
      ]);
      setDashboards(dashboardResponse);
      setFavorites(favoriteResponse);
    } catch {
      setErrorMessage('Nao foi possivel carregar a area de dashboards personalizados.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  async function handleCreateDashboard() {
    if (!name.trim()) {
      return;
    }

    setIsCreating(true);
    setErrorMessage(null);
    try {
      const created = await createDashboard({
        name: name.trim(),
        description: description.trim() || undefined,
        isDefault,
      });
      setDashboards((current) => [created, ...current]);
      setName('');
      setDescription('');
      setIsDefault(false);
    } catch {
      setErrorMessage('Nao foi possivel criar o dashboard personalizado.');
    } finally {
      setIsCreating(false);
    }
  }

  if (isLoading) {
    return (
      <Card className="border-dashed text-center">
        <CardHeader>
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-700" aria-hidden="true" />
          <CardTitle>Carregando dashboards personalizados</CardTitle>
          <CardDescription>Consultando dashboards e atalhos favoritos da API.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <section className="space-y-6" aria-labelledby="dashboards-title">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
          Dashboards personalizados
        </p>
        <h1 id="dashboards-title" className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
          Area de dashboards do usuario
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
          Crie areas personalizadas, mantenha um dashboard padrao e use os relatorios favoritos como
          atalhos para a proxima fase do editor visual.
        </p>
      </div>

      {errorMessage ? (
        <Card className="border-amber-200 bg-amber-50 text-center">
          <CardHeader>
            <TriangleAlert className="mx-auto h-8 w-8 text-amber-700" aria-hidden="true" />
            <CardTitle>{errorMessage}</CardTitle>
          </CardHeader>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Novo dashboard</CardTitle>
          <CardDescription>
            Crie um novo dashboard para organizar widgets e atalhos.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-[2fr_3fr_1.5fr_auto]">
          <Input
            id="dashboard-name"
            name="dashboard-name"
            label="Nome do dashboard"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ex.: Comercial"
          />
          <Input
            id="dashboard-description"
            name="dashboard-description"
            label="Descricao do dashboard"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Resumo da operacao"
          />
          <label className="flex items-end gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(event) => setIsDefault(event.target.checked)}
            />
            Definir como padrao
          </label>
          <div className="flex items-end">
            <Button onClick={() => void handleCreateDashboard()} disabled={isCreating}>
              {isCreating ? 'Criando...' : 'Criar dashboard'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Meus dashboards</CardTitle>
            <CardDescription>
              Lista atual de dashboards persistidos para a sua conta.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {dashboards.length === 0 ? (
              <p className="text-sm text-slate-500">
                Nenhum dashboard personalizado foi criado ainda.
              </p>
            ) : (
              dashboards.map((dashboard) => (
                <div
                  key={dashboard.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-slate-950">{dashboard.name}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {dashboard.description || 'Sem descricao.'}
                      </p>
                    </div>
                    {dashboard.isDefault ? (
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                        Padrao
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                    <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                    {dashboard.widgets.length} widget(s) conectado(s)
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Favoritos</CardTitle>
            <CardDescription>
              Relatorios marcados para acesso rapido e futura composicao de widgets.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {favorites.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhum relatorio favorito encontrado.</p>
            ) : (
              favorites.map((report) => (
                <div key={report.id} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-amber-100 p-2 text-amber-700">
                      <Star className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-950">{report.name}</p>
                      <p className="mt-1 text-sm text-slate-600">{report.description}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

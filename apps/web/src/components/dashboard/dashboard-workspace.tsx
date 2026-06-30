'use client';

import {
  Eye,
  LayoutDashboard,
  Loader2,
  Pencil,
  Sparkles,
  Star,
  Trash2,
  TriangleAlert,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
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
  deleteDashboard,
  fetchDashboards,
  fetchFavoriteReports,
  updateDashboard,
  type UserDashboard,
} from '@/lib/platform-api';
import type { PaginatedReports } from '@/lib/reports-api';

type FavoriteReport = PaginatedReports['items'][number];

export function DashboardWorkspace() {
  const router = useRouter();
  const [dashboards, setDashboards] = useState<UserDashboard[]>([]);
  const [favorites, setFavorites] = useState<FavoriteReport[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingDashboard, setEditingDashboard] = useState<UserDashboard | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editIsDefault, setEditIsDefault] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [seededMessage, setSeededMessage] = useState<string | null>(null);

  const loadWorkspace = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [dashboardResponse, favoriteResponse] = await Promise.all([
        fetchDashboards(),
        fetchFavoriteReports(),
      ]);
      setDashboards(dashboardResponse.dashboards);
      setFavorites(favoriteResponse);
      if (dashboardResponse.seededViaApi) {
        setSeededMessage(
          'Criamos um dashboard padrão para você começar. Você pode personalizá-lo a qualquer momento.',
        );
      }
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

  async function handleDeleteDashboard(id: string) {
    if (!confirm('Tem certeza que deseja excluir este dashboard?')) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteDashboard(id);
      setDashboards((current) => current.filter((d) => d.id !== id));
    } catch {
      setErrorMessage('Nao foi possivel excluir o dashboard.');
    } finally {
      setDeletingId(null);
    }
  }

  function handleStartEdit(dashboard: UserDashboard) {
    setEditingDashboard(dashboard);
    setEditName(dashboard.name);
    setEditDescription(dashboard.description);
    setEditIsDefault(dashboard.isDefault);
  }

  async function handleSaveEdit() {
    if (!editingDashboard || !editName.trim()) return;

    setIsSavingEdit(true);
    try {
      const updated = await updateDashboard(editingDashboard.id, {
        name: editName.trim(),
        description: editDescription.trim() || undefined,
        isDefault: editIsDefault,
      });
      setDashboards((current) => current.map((d) => (d.id === updated.id ? updated : d)));
      setEditingDashboard(null);
    } catch {
      setErrorMessage('Nao foi possivel salvar as alteracoes.');
    } finally {
      setIsSavingEdit(false);
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

      {seededMessage ? (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="flex items-start gap-3 py-4">
            <Sparkles className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-700" aria-hidden="true" />
            <p className="flex-1 text-sm text-blue-800">{seededMessage}</p>
            <button
              type="button"
              onClick={() => setSeededMessage(null)}
              className="rounded-lg p-1 text-blue-400 hover:bg-blue-100 hover:text-blue-700"
              aria-label="Fechar aviso"
            >
              <X className="h-4 w-4" />
            </button>
          </CardContent>
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
              <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">
                <LayoutDashboard className="mx-auto h-8 w-8 text-slate-400" aria-hidden="true" />
                <p className="mt-3 text-sm text-slate-500">
                  Nenhum dashboard personalizado foi criado ainda.
                </p>
                <p className="mt-1 text-xs text-slate-400">Crie um dashboard acima para comecar.</p>
              </div>
            ) : (
              dashboards.map((dashboard) => (
                <div
                  key={dashboard.id}
                  className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50"
                  onClick={() => router.push(`/app/dashboards/${dashboard.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      router.push(`/app/dashboards/${dashboard.id}`);
                    }
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-base font-semibold text-slate-950">{dashboard.name}</p>
                        {dashboard.isDefault ? (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                            Padrao
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-slate-600">
                        {dashboard.description || 'Sem descricao.'}
                      </p>
                    </div>
                    <div
                      className="flex gap-1"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                      role="group"
                    >
                      <button
                        type="button"
                        className="rounded-lg p-2 text-slate-400 hover:bg-blue-100 hover:text-blue-700"
                        onClick={() => router.push(`/app/dashboards/${dashboard.id}`)}
                        aria-label="Visualizar dashboard"
                        title="Visualizar"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="rounded-lg p-2 text-slate-400 hover:bg-amber-100 hover:text-amber-700"
                        onClick={() => handleStartEdit(dashboard)}
                        aria-label="Editar dashboard"
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="rounded-lg p-2 text-slate-400 hover:bg-red-100 hover:text-red-700"
                        onClick={() => void handleDeleteDashboard(dashboard.id)}
                        disabled={deletingId === dashboard.id}
                        aria-label="Excluir dashboard"
                        title="Excluir"
                      >
                        {deletingId === dashboard.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                    <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                    {dashboard.widgets.length} widget(s)
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

      {editingDashboard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Editar dashboard</CardTitle>
              <CardDescription>Atualize as informacoes do dashboard.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Nome
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Nome do dashboard"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Descricao
                <Input
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Descricao opcional"
                />
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={editIsDefault}
                  onChange={(e) => setEditIsDefault(e.target.checked)}
                />
                Definir como padrao
              </label>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingDashboard(null)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => void handleSaveEdit()}
                  disabled={isSavingEdit || !editName.trim()}
                >
                  {isSavingEdit ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </section>
  );
}

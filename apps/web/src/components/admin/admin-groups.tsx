'use client';

import { TriangleAlert as AlertTriangle, Loader as Loader2, Plus, Search, Users } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableEmpty } from '@/components/ui';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/admin-api';

type AdminGroup = {
  id: string;
  name: string;
  description?: string;
  roles: string[];
  sectors: string[];
  isActive: boolean;
};

type AdminGroupsResponse = AdminGroup[];

export function AdminGroups() {
  const [groups, setGroups] = useState<AdminGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const loadGroups = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await apiGet<AdminGroupsResponse>('/admin/groups');
      setGroups(response);
    } catch {
      setErrorMessage('Nao foi possivel carregar os grupos.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadGroups();
  }, [loadGroups]);

  const filteredGroups = search.trim().length > 0
    ? groups.filter((g) => g.name.toLowerCase().includes(search.toLowerCase()))
    : groups;

  if (isLoading) {
    return (
      <Card className="border-dashed text-center">
        <CardHeader>
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-700" aria-hidden="true" />
          <CardTitle>Carregando grupos</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (errorMessage && groups.length === 0) {
    return (
      <Card className="border-amber-200 bg-amber-50 text-center">
        <CardHeader>
          <AlertTriangle className="mx-auto h-8 w-8 text-amber-700" aria-hidden="true" />
          <CardTitle>{errorMessage}</CardTitle>
          <CardDescription>Verifique se a API esta disponivel e se voce possui permissao de administrador.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <section className="space-y-6" aria-labelledby="admin-groups-title">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Administracao</p>
        <h1 id="admin-groups-title" className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
          Gerenciamento de grupos
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
          Crie e gerencie grupos de acesso com roles e setores predefinidos para facilitar a atribuicao de permissoes.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-700" aria-hidden="true" />
                Grupos cadastrados
              </CardTitle>
              <CardDescription>Lista de grupos com suas permissoes e setores.</CardDescription>
            </div>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              Novo grupo
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Buscar
            <span className="relative">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" aria-hidden="true" />
              <Input
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nome do grupo"
                aria-label="Buscar grupos"
              />
            </span>
          </label>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descricao</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Setores</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGroups.length === 0 ? (
                <TableEmpty colSpan={6}>Nenhum grupo encontrado.</TableEmpty>
              ) : (
                filteredGroups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell className="font-medium">{group.name}</TableCell>
                    <TableCell>{group.description ?? '-'}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {group.roles.map((role) => (
                          <Badge key={role} className="border border-slate-200 bg-white text-slate-700">{role}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {group.sectors.map((sector) => (
                          <Badge key={sector} className="border border-blue-200 bg-blue-50 text-blue-700">{sector}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={group.isActive ? 'success' : 'danger'}>
                        {group.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            if (confirm(`Deseja excluir o grupo "${group.name}"?`)) {
                              try {
                                await apiDelete(`/admin/groups/${group.id}`);
                                void loadGroups();
                              } catch {
                                alert('Erro ao excluir grupo.');
                              }
                            }
                          }}
                        >
                          Excluir
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {showCreateForm && (
        <CreateGroupModal
          onClose={() => setShowCreateForm(false)}
          onCreated={() => {
            setShowCreateForm(false);
            void loadGroups();
          }}
        />
      )}
    </section>
  );
}

function CreateGroupModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (name.trim().length < 3) {
      setError('O nome deve ter no minimo 3 caracteres.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiPost('/admin/groups', {
        name: name.trim(),
        description: description.trim() || undefined,
        roles: ['visualizador'],
        sectors: [],
      });
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar grupo.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Criar novo grupo</CardTitle>
          <CardDescription>Preencha os dados para cadastrar um novo grupo de acesso.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Nome" value={name} onChange={(e) => setName(e.target.value)} required helperText="Minimo 3 caracteres" />
            <Input label="Descricao" value={description} onChange={(e) => setDescription(e.target.value)} />
            {error && <p className="text-xs font-medium text-danger" role="alert">{error}</p>}
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? 'Criando...' : 'Criar grupo'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import {
  TriangleAlert as AlertTriangle,
  Loader as Loader2,
  Plus,
  Search,
  Shield,
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
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/admin-api';

type Permission = {
  id: string;
  code: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type PermissionsResponse = Permission[];

export function AdminPermissions() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const loadPermissions = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await apiGet<PermissionsResponse>('/admin/permissions');
      setPermissions(response);
    } catch {
      setErrorMessage('Não foi possível carregar as permissões.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPermissions();
  }, [loadPermissions]);

  const filteredPermissions =
    search.trim().length > 0
      ? permissions.filter(
          (p) =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.code.toLowerCase().includes(search.toLowerCase()) ||
            p.resource.toLowerCase().includes(search.toLowerCase()),
        )
      : permissions;

  if (isLoading) {
    return (
      <Card className="border-dashed text-center">
        <CardHeader>
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-700" aria-hidden="true" />
          <CardTitle>Carregando permissões</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (errorMessage && permissions.length === 0) {
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
    <section className="space-y-6" aria-labelledby="admin-permissions-title">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
          Administração
        </p>
        <h1
          id="admin-permissions-title"
          className="mt-3 text-3xl font-bold tracking-tight text-slate-950"
        >
          Gerenciamento de permissões
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
          Crie e gerencie permissões granulares por recurso e ação para controle fino de acesso.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-700" aria-hidden="true" />
                Permissões cadastradas
              </CardTitle>
              <CardDescription>Lista de todas as permissões do sistema.</CardDescription>
            </div>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              Nova permissão
            </Button>
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
                placeholder="Nome, código ou recurso"
                aria-label="Buscar permissões"
              />
            </span>
          </label>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Recurso</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPermissions.length === 0 ? (
                <TableEmpty colSpan={6}>Nenhuma permissão encontrada.</TableEmpty>
              ) : (
                filteredPermissions.map((permission) => (
                  <TableRow key={permission.id}>
                    <TableCell className="font-mono text-xs">{permission.code}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-950">{permission.name}</p>
                        <p className="text-xs text-slate-500">{permission.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="border border-blue-200 bg-blue-50 text-blue-700">
                        {permission.resource}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="border border-slate-200 bg-white text-slate-700">
                        {permission.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={permission.isActive ? 'success' : 'danger'}>
                        {permission.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            if (confirm(`Deseja excluir a permissão "${permission.name}"?`)) {
                              try {
                                await apiDelete(`/admin/permissions/${permission.id}`);
                                void loadPermissions();
                              } catch {
                                alert('Erro ao excluir permissão.');
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
        <CreatePermissionModal
          onClose={() => setShowCreateForm(false)}
          onCreated={() => {
            setShowCreateForm(false);
            void loadPermissions();
          }}
        />
      )}
    </section>
  );
}

function CreatePermissionModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [resource, setResource] = useState('');
  const [action, setAction] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (code.trim().length < 3) {
      setError('O código deve ter no mínimo 3 caracteres.');
      return;
    }

    if (name.trim().length < 3) {
      setError('O nome deve ter no mínimo 3 caracteres.');
      return;
    }

    if (resource.trim().length < 2) {
      setError('O recurso deve ter no mínimo 2 caracteres.');
      return;
    }

    if (action.trim().length < 2) {
      setError('A ação deve ter no mínimo 2 caracteres.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiPost('/admin/permissions', {
        code: code.trim(),
        name: name.trim(),
        description: description.trim() || undefined,
        resource: resource.trim(),
        action: action.trim(),
      });
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar permissão.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
    >
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Criar nova permissão</CardTitle>
          <CardDescription>
            Preencha os dados para cadastrar uma nova permissão no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Código"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              helperText="Ex: reports:financeiro:read"
              placeholder="reports:financeiro:read"
            />
            <Input
              label="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              helperText="Mínimo 3 caracteres"
            />
            <Input
              label="Descrição"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Input
              label="Recurso"
              value={resource}
              onChange={(e) => setResource(e.target.value)}
              required
              helperText="Ex: reports, users, admin"
              placeholder="reports"
            />
            <Input
              label="Ação"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              required
              helperText="Ex: read, write, delete"
              placeholder="read"
            />
            {error && (
              <p className="text-xs font-medium text-danger" role="alert">
                {error}
              </p>
            )}
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? 'Criando...' : 'Criar permissão'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

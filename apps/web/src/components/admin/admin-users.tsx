'use client';

import {
  TriangleAlert as AlertTriangle,
  Loader as Loader2,
  LogOut,
  Plus,
  Search,
  UserCog,
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
import { apiGet, apiPost, apiPatch } from '@/lib/admin-api';

type AdminUser = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  roles: string[];
  sectors: string[];
  lastLoginAt?: string;
  createdAt: string;
};

type AdminUsersResponse = AdminUser[];

export function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await apiGet<AdminUsersResponse>('/admin/users');
      setUsers(response);
    } catch {
      setErrorMessage('Não foi possível carregar os usuários.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const filteredUsers =
    search.trim().length > 0
      ? users.filter(
          (u) =>
            u.email.toLowerCase().includes(search.toLowerCase()) ||
            `${u.firstName ?? ''} ${u.lastName ?? ''}`.toLowerCase().includes(search.toLowerCase()),
        )
      : users;

  const activeCount = users.filter((u) => u.isActive).length;
  const inactiveCount = users.filter((u) => !u.isActive).length;

  if (isLoading) {
    return (
      <Card className="border-dashed text-center">
        <CardHeader>
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-700" aria-hidden="true" />
          <CardTitle>Carregando usuários</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (errorMessage && users.length === 0) {
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
    <section className="space-y-6" aria-labelledby="admin-users-title">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
              Administração
            </p>
            <h1
              id="admin-users-title"
              className="mt-3 text-3xl font-bold tracking-tight text-slate-950"
            >
              Gerenciamento de usuários
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
              Crie, edite e desative usuários da plataforma. Gerencie roles, setores e grupos de
              acesso.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <SummaryCard label="Ativos" value={activeCount} />
            <SummaryCard label="Inativos" value={inactiveCount} />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="h-5 w-5 text-blue-700" aria-hidden="true" />
                Usuários cadastrados
              </CardTitle>
              <CardDescription>Lista de todos os usuários com status e permissões.</CardDescription>
            </div>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              Novo usuário
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
                placeholder="Nome ou e-mail"
                aria-label="Buscar usuários"
              />
            </span>
          </label>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Setores</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Último login</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableEmpty colSpan={7}>Nenhum usuário encontrado.</TableEmpty>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.firstName ?? '-'} {user.lastName ?? ''}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role) => (
                          <Badge
                            key={role}
                            className="border border-slate-200 bg-white text-slate-700"
                          >
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.sectors.map((sector) => (
                          <Badge
                            key={sector}
                            className="border border-blue-200 bg-blue-50 text-blue-700"
                          >
                            {sector}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? 'success' : 'danger'}>
                        {user.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.lastLoginAt ? formatDate(user.lastLoginAt) : '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {user.isActive && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                try {
                                  await apiPost('/auth/sessions/revoke-all', {
                                    userId: user.id,
                                  });
                                  alert('Sessões revogadas com sucesso.');
                                } catch {
                                  alert('Erro ao revogar sessões.');
                                }
                              }}
                            >
                              <LogOut className="mr-1 h-3 w-3" aria-hidden="true" />
                              Revogar sessões
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                try {
                                  await apiPatch(`/admin/users/${user.id}/deactivate`, {});
                                  void loadUsers();
                                } catch {
                                  alert('Erro ao desativar usuário.');
                                }
                              }}
                            >
                              Desativar
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            const newPassword = prompt('Nova senha (minimo 8 caracteres):');
                            if (newPassword && newPassword.length >= 8) {
                              try {
                                await apiPost(`/admin/users/${user.id}/reset-password`, {
                                  newPassword,
                                });
                                alert('Senha redefinida com sucesso.');
                              } catch {
                                alert('Erro ao redefinir senha.');
                              }
                            }
                          }}
                        >
                          Resetar senha
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
        <CreateUserModal
          onClose={() => setShowCreateForm(false)}
          onCreated={() => {
            setShowCreateForm(false);
            void loadUsers();
          }}
        />
      )}
    </section>
  );
}

function CreateUserModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('A senha deve ter no minimo 8 caracteres.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiPost('/admin/users', {
        email,
        password,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        roles: ['visualizador'],
        sectors: [],
        groupIds: [],
      });
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar usuario.');
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
          <CardTitle>Criar novo usuario</CardTitle>
          <CardDescription>
            Preencha os dados para cadastrar um novo usuario na plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              helperText="Minimo 8 caracteres"
            />
            <Input label="Nome" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            <Input
              label="Sobrenome"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
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
                {isSubmitting ? 'Criando...' : 'Criar usuario'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
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
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(value));
}

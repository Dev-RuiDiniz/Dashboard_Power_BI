'use client';

import {
  TriangleAlert as AlertTriangle,
  BarChart3,
  Loader as Loader2,
  Plus,
  Search,
} from 'lucide-react';
import { useCallback, useEffect, useState, type FormEvent } from 'react';

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
import {
  createAdminReport,
  deactivateAdminReport,
  fetchAdminReports,
  type AdminReportDefinition,
} from '@/lib/platform-api';

export function AdminReports() {
  const [reports, setReports] = useState<AdminReportDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const loadReports = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetchAdminReports();
      setReports(response);
    } catch {
      setErrorMessage('Não foi possível carregar os relatórios.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  const filteredReports =
    search.trim().length > 0
      ? reports.filter(
          (report) =>
            report.name.toLowerCase().includes(search.toLowerCase()) ||
            report.sector.toLowerCase().includes(search.toLowerCase()),
        )
      : reports;

  if (isLoading) {
    return (
      <Card className="border-dashed text-center">
        <CardHeader>
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-700" aria-hidden="true" />
          <CardTitle>Carregando relatórios</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (errorMessage && reports.length === 0) {
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
    <section className="space-y-6" aria-labelledby="admin-reports-title">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
          Administração
        </p>
        <h1
          id="admin-reports-title"
          className="mt-3 text-3xl font-bold tracking-tight text-slate-950"
        >
          Gestão de relatórios
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
          Cadastre e gerencie definições de relatórios SQL consumidas pelo catálogo da plataforma.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-700" aria-hidden="true" />
                Definições cadastradas
              </CardTitle>
              <CardDescription>
                {reports.length} relatório(s) no catálogo administrativo.
              </CardDescription>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  className="pl-9"
                  placeholder="Buscar por nome ou setor"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
              <Button onClick={() => setShowCreateForm((current) => !current)}>
                <Plus className="mr-2 h-4 w-4" />
                Novo relatório
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {showCreateForm && (
            <CreateReportForm
              onCreated={async () => {
                setShowCreateForm(false);
                await loadReports();
              }}
              onCancel={() => setShowCreateForm(false)}
            />
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Setor</TableHead>
                <TableHead>Fonte</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.length === 0 ? (
                <TableEmpty colSpan={5}>Nenhum relatório encontrado.</TableEmpty>
              ) : (
                filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-950">{report.name}</p>
                        <p className="text-xs text-slate-500">{report.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>{report.sector}</TableCell>
                    <TableCell className="font-mono text-xs">{report.sourceName}</TableCell>
                    <TableCell>
                      <Badge variant={report.isActive ? 'success' : 'default'}>
                        {report.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {report.isActive && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => void handleDeactivate(report.id, loadReports)}
                        >
                          Desativar
                        </Button>
                      )}
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

async function handleDeactivate(id: string, reload: () => Promise<void>) {
  try {
    await deactivateAdminReport(id);
    await reload();
  } catch {
    alert('Não foi possível desativar o relatório.');
  }
}

type CreateReportFormProps = {
  onCreated: () => Promise<void>;
  onCancel: () => void;
};

function CreateReportForm({ onCreated, onCancel }: CreateReportFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sector, setSector] = useState('financeiro');
  const [sourceName, setSourceName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await createAdminReport({
        name,
        description,
        sector,
        sourceType: 'view',
        sourceName,
        parameters: [],
        requiredPermissions: [`reports:${sector}:read`],
      });
      await onCreated();
    } catch {
      alert('Não foi possível criar o relatório.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="rounded-xl border border-slate-200 bg-slate-50 p-4"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          placeholder="Nome do relatório"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          placeholder="Setor"
          value={sector}
          onChange={(e) => setSector(e.target.value)}
          required
        />
        <Input
          className="md:col-span-2"
          placeholder="Descrição"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <Input
          className="md:col-span-2"
          placeholder="Fonte SQL (ex: reports.vw_financeiro)"
          value={sourceName}
          onChange={(e) => setSourceName(e.target.value)}
          required
        />
      </div>
      <div className="mt-4 flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Salvar relatório'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

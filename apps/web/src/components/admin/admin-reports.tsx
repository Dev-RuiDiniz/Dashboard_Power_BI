'use client';

import {
  TriangleAlert as AlertTriangle,
  BarChart3,
  CheckCircle2,
  Loader as Loader2,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  XCircle,
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
  updateAdminReport,
  validateAdminReportSource,
  type AdminReportDefinition,
} from '@/lib/platform-api';

export function AdminReports() {
  const [reports, setReports] = useState<AdminReportDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingReport, setEditingReport] = useState<AdminReportDefinition | null>(null);

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
              <Button
                onClick={() => {
                  setEditingReport(null);
                  setShowForm((current) => !current);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Novo relatório
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {showForm && (
            <ReportForm
              report={editingReport}
              onSaved={async () => {
                setShowForm(false);
                setEditingReport(null);
                await loadReports();
              }}
              onCancel={() => {
                setShowForm(false);
                setEditingReport(null);
              }}
            />
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Setor</TableHead>
                <TableHead>Fonte</TableHead>
                <TableHead>Parâmetros</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.length === 0 ? (
                <TableEmpty colSpan={6}>Nenhum relatório encontrado.</TableEmpty>
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
                    <TableCell>
                      <div className="font-mono text-xs">{report.sourceName}</div>
                      <Badge
                        variant="default"
                        className="mt-1 text-[10px] border border-slate-200 bg-white text-slate-600"
                      >
                        {report.sourceType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {report.parameters.length === 0 ? (
                        <span className="text-xs text-slate-400">—</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {report.parameters.map((p) => (
                            <Badge
                              key={p.name}
                              variant="default"
                              className="text-[10px] bg-slate-100 text-slate-700"
                            >
                              {p.name}: {p.type}
                              {p.required && '*'}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={report.isActive ? 'success' : 'default'}>
                        {report.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingReport(report);
                            setShowForm(true);
                          }}
                        >
                          <Pencil className="mr-1 h-3 w-3" />
                          Editar
                        </Button>
                        {report.isActive && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => void handleDeactivate(report.id, loadReports)}
                          >
                            Desativar
                          </Button>
                        )}
                      </div>
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

type ReportFormProps = {
  report: AdminReportDefinition | null;
  onSaved: () => Promise<void>;
  onCancel: () => void;
};

function ReportForm({ report, onSaved, onCancel }: ReportFormProps) {
  const isEditing = report !== null;
  const [name, setName] = useState(report?.name ?? '');
  const [description, setDescription] = useState(report?.description ?? '');
  const [sector, setSector] = useState(report?.sector ?? 'financeiro');
  const [sourceType, setSourceType] = useState<'view' | 'stored_procedure'>(
    report?.sourceType ?? 'view',
  );
  const [sourceName, setSourceName] = useState(report?.sourceName ?? '');
  const [parameters, setParameters] = useState<
    Array<{ name: string; type: string; required: boolean }>
  >(
    (report?.parameters ?? []).map((p) => ({
      name: p.name,
      type: p.type,
      required: p.required ?? false,
    })),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    message?: string;
  } | null>(null);

  async function handleValidate() {
    if (!sourceName.trim()) return;
    setIsValidating(true);
    setValidationResult(null);
    try {
      const result = await validateAdminReportSource(sourceType, sourceName.trim());
      setValidationResult(result);
    } catch {
      setValidationResult({ valid: false, message: 'Erro ao validar fonte.' });
    } finally {
      setIsValidating(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);

    const payload = {
      name,
      description,
      sector,
      sourceType,
      sourceName,
      parameters,
      requiredPermissions: [`reports:${sector}:read`],
    };

    try {
      if (isEditing) {
        await updateAdminReport(report.id, payload);
      } else {
        await createAdminReport(payload);
      }
      await onSaved();
    } catch {
      alert(
        isEditing
          ? 'Não foi possível atualizar o relatório.'
          : 'Não foi possível criar o relatório.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function addParameter() {
    setParameters((prev) => [...prev, { name: '', type: 'string', required: false }]);
  }

  function removeParameter(index: number) {
    setParameters((prev) => prev.filter((_, i) => i !== index));
  }

  function updateParameter(
    index: number,
    field: 'name' | 'type' | 'required',
    value: string | boolean,
  ) {
    setParameters((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
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
        <div className="flex gap-2 md:col-span-2">
          <select
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
            value={sourceType}
            onChange={(e) => setSourceType(e.target.value as 'view' | 'stored_procedure')}
          >
            <option value="view">View SQL</option>
            <option value="stored_procedure">Stored Procedure</option>
          </select>
          <Input
            className="flex-1"
            placeholder="Fonte SQL (ex: reports.vw_financeiro)"
            value={sourceName}
            onChange={(e) => {
              setSourceName(e.target.value);
              setValidationResult(null);
            }}
            required
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => void handleValidate()}
            disabled={isValidating || !sourceName.trim()}
          >
            {isValidating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ShieldCheck className="mr-2 h-4 w-4" />
            )}
            Testar conexão
          </Button>
        </div>
        {validationResult && (
          <div className="flex items-center gap-2 md:col-span-2 text-sm">
            {validationResult.valid ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span className="text-emerald-700">Fonte SQL válida.</span>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="text-red-700">{validationResult.message}</span>
              </>
            )}
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-700">Parâmetros</p>
          <Button type="button" variant="outline" size="sm" onClick={addParameter}>
            <Plus className="mr-1 h-3 w-3" />
            Adicionar
          </Button>
        </div>
        {parameters.length === 0 ? (
          <p className="mt-2 text-sm text-slate-400">Nenhum parâmetro configurado.</p>
        ) : (
          <div className="mt-2 space-y-2">
            {parameters.map((param, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input
                  placeholder="Nome do parâmetro"
                  value={param.name}
                  onChange={(e) => updateParameter(index, 'name', e.target.value)}
                  className="flex-1"
                />
                <select
                  className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={param.type}
                  onChange={(e) => updateParameter(index, 'type', e.target.value)}
                >
                  <option value="string">string</option>
                  <option value="int">int</option>
                  <option value="number">number</option>
                  <option value="boolean">boolean</option>
                  <option value="date">date</option>
                </select>
                <label className="flex items-center gap-1 text-sm text-slate-600 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={param.required}
                    onChange={(e) => updateParameter(index, 'required', e.target.checked)}
                  />
                  Obrigatório
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeParameter(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  Remover
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : isEditing ? 'Atualizar relatório' : 'Salvar relatório'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

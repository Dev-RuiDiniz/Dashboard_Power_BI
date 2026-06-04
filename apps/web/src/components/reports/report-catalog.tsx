'use client';

import { ChartBar as BarChart3, ListFilter as Filter, Search, ShieldCheck } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from '@/components/ui';

export type ReportCatalogItem = {
  id: string;
  name: string;
  description: string;
  sector: string;
  sourceType: 'view' | 'procedure';
  requiredPermissions: string[];
  status: 'available' | 'restricted' | 'maintenance';
  updatedAt: string;
};

type ReportCatalogProps = {
  reports: ReportCatalogItem[];
  onSelectReport?: (id: string) => void;
};

const statusLabel: Record<ReportCatalogItem['status'], string> = {
  available: 'Disponível',
  restricted: 'Restrito',
  maintenance: 'Manutenção',
};

const statusClassName: Record<ReportCatalogItem['status'], string> = {
  available: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  restricted: 'border-amber-200 bg-amber-50 text-amber-700',
  maintenance: 'border-slate-200 bg-slate-100 text-slate-700',
};

export function ReportCatalog({ reports, onSelectReport }: ReportCatalogProps) {
  const [search, setSearch] = useState('');
  const [sector, setSector] = useState('todos');
  const [status, setStatus] = useState<ReportCatalogItem['status'] | 'todos'>('todos');

  const sectors = useMemo(() => ['todos', ...Array.from(new Set(reports.map((report) => report.sector))).sort()], [reports]);

  const filteredReports = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return reports.filter((report) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        report.name.toLowerCase().includes(normalizedSearch) ||
        report.description.toLowerCase().includes(normalizedSearch) ||
        report.sector.toLowerCase().includes(normalizedSearch);

      const matchesSector = sector === 'todos' || report.sector === sector;
      const matchesStatus = status === 'todos' || report.status === status;

      return matchesSearch && matchesSector && matchesStatus;
    });
  }, [reports, search, sector, status]);

  const totalAvailable = reports.filter((report) => report.status === 'available').length;
  const totalRestricted = reports.filter((report) => report.status === 'restricted').length;

  return (
    <section className="space-y-6" aria-labelledby="reports-catalog-title">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Relatórios</p>
            <h1 id="reports-catalog-title" className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
              Catálogo de dashboards
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
              Consulte relatórios autorizados por setor, acompanhe o status operacional e acesse rapidamente os
              dashboards disponíveis para a sua sessão.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <SummaryCard label="Disponíveis" value={totalAvailable} />
            <SummaryCard label="Restritos" value={totalRestricted} />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-700" aria-hidden="true" />
            Filtros do catálogo
          </CardTitle>
          <CardDescription>Refine a busca por texto, setor e status do dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[1fr_220px_220px]">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Buscar
            <span className="relative">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" aria-hidden="true" />
              <Input
                className="pl-9"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Nome, descrição ou setor"
                aria-label="Buscar relatórios"
              />
            </span>
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Setor
            <select
              className="h-11 rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={sector}
              onChange={(event) => setSector(event.target.value)}
              aria-label="Filtrar por setor"
            >
              {sectors.map((item) => (
                <option key={item} value={item}>
                  {item === 'todos' ? 'Todos os setores' : item}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Status
            <select
              className="h-11 rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={status}
              onChange={(event) => setStatus(event.target.value as ReportCatalogItem['status'] | 'todos')}
              aria-label="Filtrar por status"
            >
              <option value="todos">Todos os status</option>
              <option value="available">Disponível</option>
              <option value="restricted">Restrito</option>
              <option value="maintenance">Manutenção</option>
            </select>
          </label>
        </CardContent>
      </Card>

      {filteredReports.length === 0 ? (
        <Card className="border-dashed text-center">
          <CardHeader>
            <CardTitle>Nenhum relatório encontrado</CardTitle>
            <CardDescription>Revise os filtros aplicados ou solicite acesso ao administrador do setor.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredReports.map((report) => (
            <Card key={report.id} className="flex h-full flex-col">
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={statusClassName[report.status]}>{statusLabel[report.status]}</Badge>
                  <Badge className="border border-slate-200 bg-white text-slate-700">{report.sector}</Badge>
                  <Badge className="border border-slate-200 bg-white text-slate-700">{report.sourceType === 'view' ? 'View SQL' : 'Procedure SQL'}</Badge>
                </div>
                <CardTitle className="flex items-start gap-3">
                  <BarChart3 className="mt-1 h-5 w-5 shrink-0 text-blue-700" aria-hidden="true" />
                  {report.name}
                </CardTitle>
                <CardDescription>{report.description}</CardDescription>
              </CardHeader>

              <CardContent className="mt-auto space-y-4">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                    Permissões necessárias
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {report.requiredPermissions.map((permission) => (
                      <Badge key={permission} className="border border-slate-200 bg-white text-slate-700">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-slate-500">Atualizado em {formatDate(report.updatedAt)}</p>
                  <Button disabled={report.status !== 'available'} aria-disabled={report.status !== 'available'} onClick={() => report.status === 'available' && onSelectReport?.(report.id)}>
                    {report.status === 'available' ? 'Abrir dashboard' : 'Acesso indisponível'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
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

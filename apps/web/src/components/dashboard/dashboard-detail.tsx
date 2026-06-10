'use client';

import {
  ArrowLeft,
  Loader2,
  Plus,
  Settings,
  Trash2,
  TriangleAlert,
  LayoutDashboard,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import {
  BarChartWidget,
  LineChartWidget,
  PieChartWidget,
  AreaChartWidget,
} from '@/components/charts';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { formatKpiValue } from '@/lib/kpis';
import {
  fetchDashboardKpis,
  getDashboardById,
  removeDashboardWidget,
  type UserDashboard,
} from '@/lib/platform-api';

type KpiItem = {
  id: string;
  title: string;
  sector: string;
  value: number;
  previousValue?: number;
  unit: 'number' | 'currency' | 'percent';
};

type DashboardDetailProps = {
  dashboardId: string;
  onBack?: () => void;
  onEdit?: (dashboard: UserDashboard) => void;
  onAddWidget?: (dashboardId: string) => void;
};

export function DashboardDetail({
  dashboardId,
  onBack,
  onEdit,
  onAddWidget,
}: DashboardDetailProps) {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<UserDashboard | null>(null);
  const [kpis, setKpis] = useState<KpiItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [dashboardData, kpiList] = await Promise.all([
        getDashboardById(dashboardId),
        fetchDashboardKpis(),
      ]);
      setDashboard(dashboardData);
      setKpis(kpiList as KpiItem[]);
    } catch {
      setErrorMessage('Nao foi possivel carregar o dashboard.');
    } finally {
      setIsLoading(false);
    }
  }, [dashboardId]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  async function handleRemoveWidget(widgetId: string) {
    try {
      await removeDashboardWidget(dashboardId, widgetId);
      await loadDashboard();
    } catch {
      setErrorMessage('Nao foi possivel remover o widget.');
    }
  }

  if (isLoading) {
    return (
      <Card className="border-dashed text-center">
        <CardHeader>
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-700" aria-hidden="true" />
          <CardTitle>Carregando dashboard</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (errorMessage || !dashboard) {
    return (
      <Card className="border-amber-200 bg-amber-50 text-center">
        <CardHeader>
          <TriangleAlert className="mx-auto h-8 w-8 text-amber-700" aria-hidden="true" />
          <CardTitle>{errorMessage || 'Dashboard nao encontrado.'}</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const kpiMap = new Map(kpis.map((k) => [k.id, k]));

  return (
    <section className="space-y-6" aria-labelledby="dashboard-detail-title">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
          Dashboards personalizados
        </p>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1
              id="dashboard-detail-title"
              className="text-3xl font-bold tracking-tight text-slate-950"
            >
              {dashboard.name}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              {dashboard.description || 'Sem descricao.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => (onBack ? onBack() : router.push('/app/dashboards'))}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            {onEdit && (
              <Button variant="outline" onClick={() => onEdit(dashboard)}>
                <Settings className="mr-2 h-4 w-4" />
                Editar
              </Button>
            )}
            {onAddWidget && (
              <Button onClick={() => onAddWidget(dashboardId)}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar widget
              </Button>
            )}
          </div>
        </div>
      </div>

      {dashboard.widgets.length === 0 ? (
        <Card className="border-dashed text-center">
          <CardHeader>
            <LayoutDashboard className="mx-auto h-8 w-8 text-slate-400" aria-hidden="true" />
            <CardTitle>Nenhum widget configurado</CardTitle>
            <CardDescription>
              Clique em "Adicionar widget" para criar o primeiro widget deste dashboard.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {dashboard.widgets.map((widget) => (
            <WidgetCard
              key={widget.id}
              widget={widget}
              kpiMap={kpiMap}
              onRemove={() => void handleRemoveWidget(widget.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function WidgetCard({
  widget,
  kpiMap,
  onRemove,
}: {
  widget: UserDashboard['widgets'][number];
  kpiMap: Map<string, KpiItem>;
  onRemove: () => void;
}) {
  if (widget.widgetType === 'kpi') {
    const kpi = widget.kpiId ? kpiMap.get(widget.kpiId) : null;
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">{widget.title}</CardTitle>
            {kpi && (
              <CardDescription>
                {kpi.sector} — {formatKpiValue({ value: kpi.value, unit: kpi.unit })}
              </CardDescription>
            )}
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
            aria-label="Remover widget"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </CardHeader>
        <CardContent>
          {kpi ? (
            <div className="space-y-2">
              <p className="text-3xl font-bold text-slate-950">
                {formatKpiValue({ value: kpi.value, unit: kpi.unit })}
              </p>
              {kpi.previousValue !== undefined && (
                <p className="text-sm text-slate-500">
                  Anterior: {formatKpiValue({ value: kpi.previousValue, unit: kpi.unit })}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-500">KPI nao encontrado.</p>
          )}
        </CardContent>
      </Card>
    );
  }

  if (widget.widgetType === 'chart') {
    const kpi = widget.kpiId ? kpiMap.get(widget.kpiId) : null;
    const mockData = kpi
      ? [
          { label: 'Atual', value: kpi.value },
          { label: 'Anterior', value: kpi.previousValue ?? kpi.value * 0.9 },
        ]
      : [{ label: 'A', value: 10 }];

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">{widget.title}</CardTitle>
          <button
            type="button"
            onClick={onRemove}
            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
            aria-label="Remover widget"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </CardHeader>
        <CardContent>
          {widget.chartType === 'bar' && (
            <BarChartWidget
              title=""
              description=""
              data={mockData}
              xKey="label"
              yKey="value"
              unit={kpi?.unit ?? 'number'}
            />
          )}
          {widget.chartType === 'line' && (
            <LineChartWidget
              title=""
              description=""
              data={mockData}
              xKey="label"
              series={[{ dataKey: 'value', name: 'Valor', color: '#1d4ed8' }]}
              unit={kpi?.unit ?? 'number'}
            />
          )}
          {widget.chartType === 'pie' && (
            <PieChartWidget
              title=""
              description=""
              data={mockData}
              nameKey="label"
              valueKey="value"
              unit={kpi?.unit ?? 'number'}
            />
          )}
          {widget.chartType === 'area' && (
            <AreaChartWidget
              title=""
              description=""
              data={mockData}
              xKey="label"
              series={[{ dataKey: 'value', name: 'Valor', color: '#1d4ed8', fillOpacity: 0.3 }]}
              unit={kpi?.unit ?? 'number'}
            />
          )}
          {!widget.chartType && (
            <p className="text-sm text-slate-500">Tipo de grafico nao especificado.</p>
          )}
        </CardContent>
      </Card>
    );
  }

  if (widget.widgetType === 'table') {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">{widget.title}</CardTitle>
          <button
            type="button"
            onClick={onRemove}
            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
            aria-label="Remover widget"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">
            Widget de tabela. Conecte a um relatorio para exibir dados.
          </p>
        </CardContent>
      </Card>
    );
  }

  return null;
}

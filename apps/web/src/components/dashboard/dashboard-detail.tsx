'use client';

import {
  ArrowLeft,
  Check,
  Loader2,
  Pencil,
  Settings,
  TriangleAlert,
  LayoutDashboard,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import type { Layout } from 'react-grid-layout';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import {
  addDashboardWidget,
  batchUpdateDashboardWidgets,
  fetchDashboardKpis,
  fetchKpiHistory,
  getDashboardById,
  removeDashboardWidget,
  updateDashboardWidget,
  type KpiHistoryResponse,
  type UserDashboard,
} from '@/lib/platform-api';

import { DashboardCanvas } from './dashboard-canvas';
import { WidgetPalette, type PaletteWidgetType } from './widget-palette';
import { WidgetConfigPanel } from './widget-config-panel';

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
  const [kpiHistoryMap, setKpiHistoryMap] = useState<Map<string, KpiHistoryResponse>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSavingLayout, setIsSavingLayout] = useState(false);
  const [editWidgets, setEditWidgets] = useState<UserDashboard['widgets']>([]);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [configWidget, setConfigWidget] = useState<UserDashboard['widgets'][number] | null>(null);
  const [layoutChanged, setLayoutChanged] = useState(false);

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

      const chartWidgetKpiIds = dashboardData.widgets
        .filter((w) => w.widgetType === 'chart' && w.kpiId)
        .map((w) => w.kpiId!);

      if (chartWidgetKpiIds.length > 0) {
        const historyResults = await Promise.allSettled(
          chartWidgetKpiIds.map(async (kpiId) => ({
            kpiId,
            data: await fetchKpiHistory(kpiId),
          })),
        );

        const historyMap = new Map<string, KpiHistoryResponse>();
        for (const result of historyResults) {
          if (result.status === 'fulfilled') {
            historyMap.set(result.value.kpiId, result.value.data);
          }
        }
        setKpiHistoryMap(historyMap);
      } else {
        setKpiHistoryMap(new Map());
      }
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
      setConfigWidget(null);
      setSelectedWidgetId(null);
      await loadDashboard();
    } catch {
      setErrorMessage('Nao foi possivel remover o widget.');
    }
  }

  async function handleSaveLayout() {
    if (!dashboard) return;
    setIsSavingLayout(true);
    setErrorMessage(null);
    try {
      const items = editWidgets.map((w, index) => ({
        widgetId: w.id,
        displayOrder: (index + 1) * 10,
        position: w.position,
      }));
      await batchUpdateDashboardWidgets(dashboardId, items);
      setIsEditing(false);
      setSelectedWidgetId(null);
      setLayoutChanged(false);
      await loadDashboard();
    } catch {
      setErrorMessage('Nao foi possivel salvar o layout dos widgets.');
    } finally {
      setIsSavingLayout(false);
    }
  }

  function handleLayoutChange(layout: Layout) {
    setEditWidgets((prev) =>
      prev.map((w) => {
        const item = layout.find((l) => l.i === w.id);
        if (!item) return w;
        return {
          ...w,
          position: {
            x: item.x,
            y: item.y,
            width: item.w,
            height: item.h,
          },
        };
      }),
    );
    setLayoutChanged(true);
  }

  async function handleAddWidgetFromPalette(
    type: PaletteWidgetType,
    config?: Record<string, unknown>,
  ) {
    try {
      const defaultTitles: Record<PaletteWidgetType, string> = {
        kpi: 'Novo KPI',
        chart: 'Novo Gráfico',
        table: 'Nova Tabela',
        text: 'Novo Texto',
        iframe: 'Novo Iframe',
      };
      const defaultSizes: Record<PaletteWidgetType, { width: number; height: number }> = {
        kpi: { width: 3, height: 2 },
        chart: { width: 6, height: 4 },
        table: { width: 6, height: 4 },
        text: { width: 6, height: 3 },
        iframe: { width: 6, height: 4 },
      };
      const size = defaultSizes[type];
      const maxY = editWidgets.reduce(
        (max, w) => Math.max(max, w.position.y + w.position.height),
        0,
      );
      await addDashboardWidget(dashboardId, {
        widgetType: type,
        title: defaultTitles[type],
        chartType: type === 'chart' ? ((config?.chartType as string) ?? 'bar') : null,
        kpiId: null,
        config: config ?? {},
        content: type === 'text' ? ((config?.content as string) ?? '') : null,
        url: type === 'iframe' ? ((config?.url as string) ?? '') : null,
        position: { x: 0, y: maxY, width: size.width, height: size.height },
      });
      await loadDashboard();
    } catch {
      setErrorMessage('Nao foi possivel adicionar o widget.');
    }
  }

  async function handleSaveWidgetConfig(
    widgetId: string,
    config: Partial<{
      title: string;
      chartType: string | null;
      kpiId: string | null;
      content: string;
      url: string;
    }>,
  ) {
    try {
      const updateInput: Parameters<typeof updateDashboardWidget>[2] = {};
      if (config.title !== undefined) updateInput.title = config.title;
      if (config.chartType !== undefined) updateInput.chartType = config.chartType;
      if (config.kpiId !== undefined) updateInput.kpiId = config.kpiId;
      if (config.content !== undefined) updateInput.content = config.content;
      if (config.url !== undefined) updateInput.url = config.url;
      await updateDashboardWidget(dashboardId, widgetId, updateInput);
      setConfigWidget(null);
      await loadDashboard();
    } catch {
      setErrorMessage('Nao foi possivel salvar a configuração do widget.');
    }
  }

  function handleConfigureWidget(widgetId: string) {
    const widget =
      editWidgets.find((w) => w.id === widgetId) ??
      dashboard?.widgets.find((w) => w.id === widgetId);
    if (widget) setConfigWidget(widget);
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
                <Settings className="mr-2 h-4 w-4" />
                Gerenciar
              </Button>
            )}
            <Button
              variant={isEditing ? 'default' : 'outline'}
              onClick={() => {
                if (isEditing) {
                  void handleSaveLayout();
                } else {
                  setEditWidgets(dashboard.widgets);
                  setIsEditing(true);
                }
              }}
              disabled={isSavingLayout}
            >
              {isEditing ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  {isSavingLayout
                    ? 'Salvando...'
                    : layoutChanged
                      ? 'Salvar alterações'
                      : 'Concluir'}
                </>
              ) : (
                <>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar layout
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="flex gap-4">
          <div className="w-64 flex-shrink-0">
            <WidgetPalette onAddWidget={handleAddWidgetFromPalette} />
          </div>
          <div className="flex-1">
            <DashboardCanvas
              widgets={editWidgets}
              kpiMap={kpiMap}
              kpiHistoryMap={kpiHistoryMap}
              isEditing
              selectedWidgetId={selectedWidgetId}
              onSelectWidget={setSelectedWidgetId}
              onRemoveWidget={(id) => void handleRemoveWidget(id)}
              onConfigureWidget={handleConfigureWidget}
              onLayoutChange={handleLayoutChange}
            />
          </div>
        </div>
      )}

      {!isEditing && dashboard.widgets.length === 0 && (
        <Card className="border-dashed text-center">
          <CardHeader>
            <LayoutDashboard className="mx-auto h-8 w-8 text-slate-400" aria-hidden="true" />
            <CardTitle>Nenhum widget configurado</CardTitle>
            <CardDescription>
              Clique em "Editar layout" para adicionar widgets ao dashboard.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {!isEditing && dashboard.widgets.length > 0 && (
        <DashboardCanvas
          widgets={dashboard.widgets}
          kpiMap={kpiMap}
          kpiHistoryMap={kpiHistoryMap}
        />
      )}

      {isEditing && configWidget && (
        <WidgetConfigPanel
          widget={configWidget}
          kpis={kpis.map((k) => ({ id: k.id, title: k.title, sector: k.sector }))}
          onClose={() => setConfigWidget(null)}
          onSave={handleSaveWidgetConfig}
          onRemove={(id) => void handleRemoveWidget(id)}
        />
      )}
    </section>
  );
}

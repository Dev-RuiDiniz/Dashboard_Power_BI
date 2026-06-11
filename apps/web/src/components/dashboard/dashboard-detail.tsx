'use client';

import {
  ArrowLeft,
  Check,
  Loader2,
  Plus,
  Pencil,
  Settings,
  TriangleAlert,
  LayoutDashboard,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import {
  DndContext,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import {
  fetchDashboardKpis,
  getDashboardById,
  removeDashboardWidget,
  reorderDashboardWidgets,
  type UserDashboard,
} from '@/lib/platform-api';

import { SortableWidgetCard } from './sortable-widget-card';
import { WidgetCard } from './widget-card';

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
  const [isEditing, setIsEditing] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [editWidgets, setEditWidgets] = useState<UserDashboard['widgets']>([]);

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

  async function handleSaveOrder() {
    if (!dashboard) return;
    setIsSavingOrder(true);
    setErrorMessage(null);
    try {
      const items = editWidgets.map((w, index) => ({
        widgetId: w.id,
        displayOrder: (index + 1) * 10,
      }));
      await reorderDashboardWidgets(dashboardId, items);
      setIsEditing(false);
      await loadDashboard();
    } catch {
      setErrorMessage('Nao foi possivel salvar a ordem dos widgets.');
    } finally {
      setIsSavingOrder(false);
    }
  }

  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor));

  function handleDragEnd(event: import('@dnd-kit/core').DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setEditWidgets((items) => {
        const oldIndex = items.findIndex((w) => w.id === active.id);
        const newIndex = items.findIndex((w) => w.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
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
            <Button
              variant={isEditing ? 'default' : 'outline'}
              onClick={() => {
                if (isEditing) {
                  void handleSaveOrder();
                } else {
                  setEditWidgets(dashboard.widgets);
                  setIsEditing(true);
                }
              }}
              disabled={isSavingOrder}
            >
              {isEditing ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  {isSavingOrder ? 'Salvando...' : 'Concluir'}
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
      ) : isEditing ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={editWidgets.map((w) => w.id)} strategy={rectSortingStrategy}>
            <div className="grid gap-4 md:grid-cols-2">
              {editWidgets.map((widget) => (
                <SortableWidgetCard
                  key={widget.id}
                  widget={widget}
                  kpiMap={kpiMap}
                  onRemove={() => void handleRemoveWidget(widget.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
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

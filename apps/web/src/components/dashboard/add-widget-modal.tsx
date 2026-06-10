'use client';

import { useEffect, useState } from 'react';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from '@/components/ui';
import { fetchDashboardKpis, addDashboardWidget } from '@/lib/platform-api';

type KpiItem = {
  id: string;
  title: string;
  sector: string;
  value: number;
  unit: 'number' | 'currency' | 'percent';
};

type AddWidgetModalProps = {
  dashboardId: string;
  onClose: () => void;
  onSuccess: () => void;
};

export function AddWidgetModal({ dashboardId, onClose, onSuccess }: AddWidgetModalProps) {
  const [widgetType, setWidgetType] = useState<'kpi' | 'chart' | 'table'>('kpi');
  const [title, setTitle] = useState('');
  const [chartType, setChartType] = useState('bar');
  const [kpiId, setKpiId] = useState('');
  const [kpis, setKpis] = useState<KpiItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const list = await fetchDashboardKpis();
        const items = (list ?? []) as KpiItem[];
        setKpis(items);
        if (items.length > 0 && items[0]) {
          setKpiId(items[0].id);
        }
      } catch {
        setErrorMessage('Nao foi possivel carregar os KPIs.');
      }
    }
    void load();
  }, []);

  async function handleSave() {
    if (!title.trim()) return;

    setIsSaving(true);
    setErrorMessage(null);
    try {
      await addDashboardWidget(dashboardId, {
        widgetType,
        title: title.trim(),
        chartType: widgetType === 'chart' ? chartType : null,
        kpiId: widgetType === 'kpi' || widgetType === 'chart' ? kpiId : null,
        config: {},
        position: { x: 0, y: 0, width: 1, height: 1 },
      });
      onSuccess();
    } catch {
      setErrorMessage('Nao foi possivel adicionar o widget.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Adicionar widget</CardTitle>
          <CardDescription>Escolha o tipo e configure o widget.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Tipo de widget
            <select
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={widgetType}
              onChange={(e) => setWidgetType(e.target.value as 'kpi' | 'chart' | 'table')}
            >
              <option value="kpi">KPI</option>
              <option value="chart">Grafico</option>
              <option value="table">Tabela</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Titulo
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titulo do widget"
            />
          </label>

          {(widgetType === 'kpi' || widgetType === 'chart') && (
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              KPI
              <select
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={kpiId}
                onChange={(e) => setKpiId(e.target.value)}
              >
                {kpis.map((kpi) => (
                  <option key={kpi.id} value={kpi.id}>
                    {kpi.title} ({kpi.sector})
                  </option>
                ))}
              </select>
            </label>
          )}

          {widgetType === 'chart' && (
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Tipo de grafico
              <select
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
              >
                <option value="bar">Barra</option>
                <option value="line">Linha</option>
                <option value="pie">Pizza</option>
                <option value="area">Area</option>
              </select>
            </label>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={() => void handleSave()} disabled={isSaving || !title.trim()}>
              {isSaving ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

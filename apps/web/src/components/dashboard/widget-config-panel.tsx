'use client';

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@/components/ui';
import type { UserDashboard } from '@/lib/platform-api';

type WidgetConfig = {
  title: string;
  chartType: string | null;
  kpiId: string | null;
  content: string;
  url: string;
};

type WidgetConfigPanelProps = {
  widget: UserDashboard['widgets'][number];
  kpis?: Array<{ id: string; title: string; sector: string }>;
  onClose: () => void;
  onSave: (widgetId: string, config: Partial<WidgetConfig>) => void;
  onRemove?: (widgetId: string) => void;
};

export function WidgetConfigPanel({
  widget,
  kpis = [],
  onClose,
  onSave,
  onRemove,
}: WidgetConfigPanelProps) {
  const [title, setTitle] = useState(widget.title);
  const [chartType, setChartType] = useState(widget.chartType ?? 'bar');
  const [kpiId, setKpiId] = useState(widget.kpiId ?? '');
  const [content, setContent] = useState((widget.config as { content?: string }).content ?? '');
  const [url, setUrl] = useState((widget.config as { url?: string }).url ?? '');

  useEffect(() => {
    setTitle(widget.title);
    setChartType(widget.chartType ?? 'bar');
    setKpiId(widget.kpiId ?? '');
    setContent((widget.config as { content?: string }).content ?? '');
    setUrl((widget.config as { url?: string }).url ?? '');
  }, [widget]);

  function handleSave() {
    const config: Partial<WidgetConfig> = { title: title.trim() };

    if (widget.widgetType === 'chart') {
      config.chartType = chartType;
      config.kpiId = kpiId || null;
    } else if (widget.widgetType === 'kpi') {
      config.kpiId = kpiId || null;
    } else if (widget.widgetType === 'text') {
      config.content = content;
    } else if (widget.widgetType === 'iframe') {
      config.url = url;
    }

    onSave(widget.id, config);
  }

  return (
    <div className="fixed inset-right-0 right-0 top-0 z-40 h-full w-96 overflow-y-auto border-l border-slate-200 bg-white shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-200 p-4">
        <h2 className="text-lg font-semibold text-slate-900">Configurar widget</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
          aria-label="Fechar painel"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-4 p-4">
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Título
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título do widget"
          />
        </label>

        {(widget.widgetType === 'kpi' || widget.widgetType === 'chart') && (
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            KPI
            <select
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={kpiId}
              onChange={(e) => setKpiId(e.target.value)}
            >
              <option value="">Selecione um KPI</option>
              {kpis.map((kpi) => (
                <option key={kpi.id} value={kpi.id}>
                  {kpi.title} ({kpi.sector})
                </option>
              ))}
            </select>
          </label>
        )}

        {widget.widgetType === 'chart' && (
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Tipo de gráfico
            <select
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
            >
              <option value="bar">Barra</option>
              <option value="line">Linha</option>
              <option value="pie">Pizza</option>
              <option value="area">Área</option>
            </select>
          </label>
        )}

        {widget.widgetType === 'text' && (
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Conteúdo
            <textarea
              className="min-h-32 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Digite o conteúdo do widget..."
            />
          </label>
        )}

        {widget.widgetType === 'iframe' && (
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            URL
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://exemplo.com"
            />
          </label>
        )}

        <div className="flex gap-2 pt-4">
          <Button onClick={handleSave} disabled={!title.trim()} className="flex-1">
            Salvar
          </Button>
          {onRemove && (
            <Button
              variant="outline"
              onClick={() => onRemove(widget.id)}
              className="text-red-600 hover:bg-red-50"
            >
              Remover
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

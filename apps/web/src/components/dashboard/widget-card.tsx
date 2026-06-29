'use client';

import { Trash2 } from 'lucide-react';

import {
  BarChartWidget,
  LineChartWidget,
  PieChartWidget,
  AreaChartWidget,
} from '@/components/charts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { formatKpiValue } from '@/lib/kpis';
import type { KpiHistoryResponse, UserDashboard } from '@/lib/platform-api';

type KpiItem = {
  id: string;
  title: string;
  sector: string;
  value: number;
  previousValue?: number;
  unit: 'number' | 'currency' | 'percent';
};

type WidgetCardProps = {
  widget: UserDashboard['widgets'][number];
  kpiMap: Map<string, KpiItem>;
  kpiHistoryMap?: Map<string, KpiHistoryResponse>;
  onRemove?: () => void;
  dragHandle?: React.ReactNode;
};

export function WidgetCard({
  widget,
  kpiMap,
  kpiHistoryMap,
  onRemove,
  dragHandle,
}: WidgetCardProps) {
  if (widget.widgetType === 'kpi') {
    const kpi = widget.kpiId ? kpiMap.get(widget.kpiId) : null;
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            {dragHandle}
            <div>
              <CardTitle className="text-base">{widget.title}</CardTitle>
              {kpi && (
                <CardDescription>
                  {kpi.sector} — {formatKpiValue({ value: kpi.value, unit: kpi.unit })}
                </CardDescription>
              )}
            </div>
          </div>
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
              aria-label="Remover widget"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
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
    const history = widget.kpiId ? kpiHistoryMap?.get(widget.kpiId) : undefined;

    const chartData =
      history && history.periods.length > 0
        ? history.periods.map((p) => ({
            label: p.period,
            value: p.value,
            previousValue: p.previousValue,
          }))
        : kpi
          ? [
              { label: 'Atual', value: kpi.value },
              { label: 'Anterior', value: kpi.previousValue ?? kpi.value * 0.9 },
            ]
          : [{ label: 'A', value: 10 }];

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            {dragHandle}
            <CardTitle className="text-base">{widget.title}</CardTitle>
          </div>
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
              aria-label="Remover widget"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </CardHeader>
        <CardContent>
          {widget.chartType === 'bar' && (
            <BarChartWidget
              title=""
              description=""
              data={chartData}
              xKey="label"
              yKey="value"
              unit={kpi?.unit ?? 'number'}
            />
          )}
          {widget.chartType === 'line' && (
            <LineChartWidget
              title=""
              description=""
              data={chartData}
              xKey="label"
              series={[
                { dataKey: 'value', name: 'Valor', color: '#1d4ed8' },
                ...(history && history.periods.length > 0
                  ? [
                      {
                        dataKey: 'previousValue',
                        name: 'Anterior',
                        color: '#94a3b8',
                        strokeDasharray: '4 4' as const,
                      },
                    ]
                  : []),
              ]}
              unit={kpi?.unit ?? 'number'}
            />
          )}
          {widget.chartType === 'pie' && (
            <PieChartWidget
              title=""
              description=""
              data={chartData}
              nameKey="label"
              valueKey="value"
              unit={kpi?.unit ?? 'number'}
            />
          )}
          {widget.chartType === 'area' && (
            <AreaChartWidget
              title=""
              description=""
              data={chartData}
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
          <div className="flex items-center gap-2">
            {dragHandle}
            <CardTitle className="text-base">{widget.title}</CardTitle>
          </div>
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
              aria-label="Remover widget"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">
            Widget de tabela. Conecte a um relatorio para exibir dados.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (widget.widgetType === 'text') {
    const textContent = (widget.config as { content?: string }).content ?? widget.content ?? '';
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            {dragHandle}
            <CardTitle className="text-base">{widget.title}</CardTitle>
          </div>
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
              aria-label="Remover widget"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </CardHeader>
        <CardContent>
          {textContent ? (
            <p className="whitespace-pre-wrap text-sm text-slate-700">{textContent}</p>
          ) : (
            <p className="text-sm text-slate-500">
              Sem conteúdo. Configure o widget para adicionar texto.
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  if (widget.widgetType === 'iframe') {
    const iframeUrl = (widget.config as { url?: string }).url ?? widget.url ?? '';
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            {dragHandle}
            <CardTitle className="text-base">{widget.title}</CardTitle>
          </div>
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
              aria-label="Remover widget"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </CardHeader>
        <CardContent>
          {iframeUrl ? (
            <iframe
              src={iframeUrl}
              title={widget.title}
              className="h-64 w-full rounded-lg border border-slate-200"
              sandbox="allow-scripts allow-same-origin"
              loading="lazy"
            />
          ) : (
            <p className="text-sm text-slate-500">
              Sem URL configurada. Configure o widget para incorporar uma página.
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return null;
}

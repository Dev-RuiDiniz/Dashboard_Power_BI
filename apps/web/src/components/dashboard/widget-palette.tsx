'use client';

import { BarChart3, FileText, Globe, LayoutGrid, PieChart, Table } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

export type PaletteWidgetType = 'kpi' | 'chart' | 'table' | 'text' | 'iframe';

type PaletteItem = {
  type: PaletteWidgetType;
  label: string;
  description: string;
  icon: React.ReactNode;
  defaultConfig?: Record<string, unknown>;
};

const PALETTE_ITEMS: PaletteItem[] = [
  {
    type: 'kpi',
    label: 'KPI',
    description: 'Indicador numérico com valor atual e anterior',
    icon: <LayoutGrid className="h-5 w-5" aria-hidden="true" />,
  },
  {
    type: 'chart',
    label: 'Gráfico',
    description: 'Gráfico de barra, linha, pizza ou área',
    icon: <BarChart3 className="h-5 w-5" aria-hidden="true" />,
    defaultConfig: { chartType: 'bar' },
  },
  {
    type: 'table',
    label: 'Tabela',
    description: 'Tabela de dados conectada a um relatório',
    icon: <Table className="h-5 w-5" aria-hidden="true" />,
  },
  {
    type: 'text',
    label: 'Texto',
    description: 'Bloco de texto livre (markdown)',
    icon: <FileText className="h-5 w-5" aria-hidden="true" />,
    defaultConfig: { content: '' },
  },
  {
    type: 'iframe',
    label: 'Iframe',
    description: 'Incorporar página externa via URL',
    icon: <Globe className="h-5 w-5" aria-hidden="true" />,
    defaultConfig: { url: '' },
  },
];

type WidgetPaletteProps = {
  onAddWidget: (type: PaletteWidgetType, config?: Record<string, unknown>) => void;
  disabled?: boolean;
};

export function WidgetPalette({ onAddWidget, disabled }: WidgetPaletteProps) {
  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          Paleta de Widgets
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {PALETTE_ITEMS.map((item) => (
          <button
            key={item.type}
            type="button"
            disabled={disabled}
            onClick={() => onAddWidget(item.type, item.defaultConfig)}
            className="flex w-full items-center gap-3 rounded-lg border border-slate-200 p-3 text-left transition hover:border-blue-300 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={`Adicionar widget ${item.label}`}
          >
            <span className="flex-shrink-0 text-blue-700">{item.icon}</span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900">{item.label}</p>
              <p className="truncate text-xs text-slate-500">{item.description}</p>
            </div>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}

export { PALETTE_ITEMS };

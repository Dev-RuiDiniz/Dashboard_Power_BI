'use client';

import { Settings, Trash2 } from 'lucide-react';

import { WidgetCard } from './widget-card';
import type { KpiHistoryResponse, UserDashboard } from '@/lib/platform-api';

type KpiItem = {
  id: string;
  title: string;
  sector: string;
  value: number;
  previousValue?: number;
  unit: 'number' | 'currency' | 'percent';
};

type ResizableWidgetCardProps = {
  widget: UserDashboard['widgets'][number];
  kpiMap: Map<string, KpiItem>;
  kpiHistoryMap?: Map<string, KpiHistoryResponse>;
  onRemove?: () => void;
  onConfigure?: () => void;
  selected?: boolean;
};

export function ResizableWidgetCard({
  widget,
  kpiMap,
  kpiHistoryMap,
  onRemove,
  onConfigure,
  selected,
}: ResizableWidgetCardProps) {
  return (
    <div
      className={`relative rounded-xl border-2 transition-colors ${
        selected
          ? 'border-blue-500 ring-2 ring-blue-200'
          : 'border-transparent hover:border-slate-200'
      }`}
    >
      <div className="absolute right-2 top-2 z-10 flex gap-1">
        {onConfigure && (
          <button
            type="button"
            onClick={onConfigure}
            className="rounded-lg bg-white/90 p-1.5 text-slate-500 shadow-sm hover:bg-blue-50 hover:text-blue-700"
            aria-label="Configurar widget"
          >
            <Settings className="h-4 w-4" />
          </button>
        )}
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="rounded-lg bg-white/90 p-1.5 text-slate-500 shadow-sm hover:bg-red-50 hover:text-red-600"
            aria-label="Remover widget"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
      <WidgetCard widget={widget} kpiMap={kpiMap} kpiHistoryMap={kpiHistoryMap} />
    </div>
  );
}

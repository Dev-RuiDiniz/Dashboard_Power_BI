'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

import { WidgetCard } from './widget-card';
import type { UserDashboard } from '@/lib/platform-api';

type KpiItem = {
  id: string;
  title: string;
  sector: string;
  value: number;
  previousValue?: number;
  unit: 'number' | 'currency' | 'percent';
};

type SortableWidgetCardProps = {
  widget: UserDashboard['widgets'][number];
  kpiMap: Map<string, KpiItem>;
  onRemove?: () => void;
};

export function SortableWidgetCard({ widget, kpiMap, onRemove }: SortableWidgetCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: widget.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto',
  } as React.CSSProperties;

  const dragHandle = (
    <button
      type="button"
      {...attributes}
      {...listeners}
      className="cursor-grab rounded p-1 text-slate-400 hover:bg-slate-100 active:cursor-grabbing"
      aria-label="Arrastar widget"
    >
      <GripVertical className="h-5 w-5" />
    </button>
  );

  return (
    <div ref={setNodeRef} style={style}>
      <WidgetCard widget={widget} kpiMap={kpiMap} onRemove={onRemove} dragHandle={dragHandle} />
    </div>
  );
}

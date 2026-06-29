'use client';

import { LayoutGrid } from 'lucide-react';
import { useMemo } from 'react';
import {
  Responsive,
  useContainerWidth,
  type Layout,
  type LayoutItem,
  type ResponsiveLayouts,
} from 'react-grid-layout';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import type { KpiHistoryResponse, UserDashboard } from '@/lib/platform-api';

import { ResizableWidgetCard } from './resizable-widget-card';

type KpiItem = {
  id: string;
  title: string;
  sector: string;
  value: number;
  previousValue?: number;
  unit: 'number' | 'currency' | 'percent';
};

type DashboardCanvasProps = {
  widgets: UserDashboard['widgets'][number][];
  kpiMap: Map<string, KpiItem>;
  kpiHistoryMap?: Map<string, KpiHistoryResponse>;
  isEditing?: boolean;
  selectedWidgetId?: string | null;
  onSelectWidget?: (widgetId: string) => void;
  onRemoveWidget?: (widgetId: string) => void;
  onConfigureWidget?: (widgetId: string) => void;
  onLayoutChange?: (layout: Layout) => void;
};

export function DashboardCanvas({
  widgets,
  kpiMap,
  kpiHistoryMap,
  isEditing = false,
  selectedWidgetId,
  onSelectWidget,
  onRemoveWidget,
  onConfigureWidget,
  onLayoutChange,
}: DashboardCanvasProps) {
  const { width, containerRef, mounted } = useContainerWidth();

  const layoutItems: LayoutItem[] = useMemo(() => {
    return widgets.map((w) => ({
      i: w.id,
      x: w.position.x,
      y: w.position.y,
      w: w.position.width,
      h: w.position.height,
      minW: 1,
      minH: 1,
      maxW: 12,
    }));
  }, [widgets]);

  const layouts: ResponsiveLayouts = useMemo(() => {
    return {
      lg: layoutItems,
      md: layoutItems,
      sm: layoutItems.map((item) => ({ ...item, w: Math.min(item.w ?? 1, 6) })),
      xs: layoutItems.map((item) => ({ ...item, w: 1 })),
    } as unknown as ResponsiveLayouts;
  }, [layoutItems]);

  if (widgets.length === 0) {
    return (
      <Card className="border-dashed text-center">
        <CardHeader>
          <LayoutGrid className="mx-auto h-8 w-8 text-slate-400" aria-hidden="true" />
          <CardTitle>Nenhum widget no canvas</CardTitle>
          <CardContent className="mt-2">
            <p className="text-sm text-slate-500">
              {isEditing
                ? 'Arraste um widget da paleta ou clique para adicionar ao canvas.'
                : 'Este dashboard ainda não tem widgets configurados.'}
            </p>
          </CardContent>
        </CardHeader>
      </Card>
    );
  }

  if (!isEditing) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {widgets.map((widget) => (
          <ResizableWidgetCard
            key={widget.id}
            widget={widget}
            kpiMap={kpiMap}
            kpiHistoryMap={kpiHistoryMap}
          />
        ))}
      </div>
    );
  }

  return (
    <div ref={containerRef as React.RefObject<HTMLDivElement>}>
      {mounted && (
        <Responsive
          className="layout"
          width={width}
          layouts={layouts}
          cols={{ lg: 12, md: 12, sm: 6, xs: 1 }}
          rowHeight={80}
          margin={[12, 12]}
          dragConfig={{ enabled: true, bounded: false, handle: '.drag-handle' }}
          resizeConfig={{ enabled: true, handles: ['se'] }}
          onLayoutChange={(layout: Layout) => onLayoutChange?.(layout)}
        >
          {widgets.map((widget) => (
            <div
              key={widget.id}
              onClick={() => onSelectWidget?.(widget.id)}
              className="cursor-pointer"
            >
              <ResizableWidgetCard
                widget={widget}
                kpiMap={kpiMap}
                kpiHistoryMap={kpiHistoryMap}
                onRemove={onRemoveWidget ? () => onRemoveWidget(widget.id) : undefined}
                onConfigure={onConfigureWidget ? () => onConfigureWidget(widget.id) : undefined}
                selected={selectedWidgetId === widget.id}
              />
            </div>
          ))}
        </Responsive>
      )}
    </div>
  );
}

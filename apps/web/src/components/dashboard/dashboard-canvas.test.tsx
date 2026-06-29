import { render, screen, fireEvent } from '@testing-library/react';

import { DashboardCanvas } from './dashboard-canvas';
import type { UserDashboard } from '@/lib/platform-api';

jest.mock('react-grid-layout', () => ({
  Responsive: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="grid-layout">{children}</div>
  ),
  useContainerWidth: () => ({
    width: 800,
    containerRef: { current: null },
    mounted: true,
  }),
  WidthProvider: (Comp: React.ComponentType) => Comp,
}));

jest.mock('./resizable-widget-card', () => ({
  ResizableWidgetCard: ({
    widget,
    onRemove,
    onConfigure,
    selected,
  }: {
    widget: { id: string; title: string };
    onRemove?: () => void;
    onConfigure?: () => void;
    selected?: boolean;
  }) => (
    <div data-testid={`widget-${widget.id}`} data-selected={selected}>
      {widget.title}
      {onRemove && (
        <button onClick={onRemove} aria-label={`Remover ${widget.id}`}>
          Remover
        </button>
      )}
      {onConfigure && (
        <button onClick={onConfigure} aria-label={`Configurar ${widget.id}`}>
          Configurar
        </button>
      )}
    </div>
  ),
}));

const mockWidgets: UserDashboard['widgets'][number][] = [
  {
    id: 'w1',
    dashboardId: 'd1',
    widgetType: 'kpi',
    title: 'Receita',
    chartType: null,
    reportId: null,
    kpiId: 'kpi1',
    displayOrder: 10,
    config: {},
    content: null,
    url: null,
    position: { x: 0, y: 0, width: 2, height: 1 },
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'w2',
    dashboardId: 'd1',
    widgetType: 'chart',
    title: 'Vendas',
    chartType: 'bar',
    reportId: null,
    kpiId: 'kpi2',
    displayOrder: 20,
    config: {},
    content: null,
    url: null,
    position: { x: 2, y: 0, width: 4, height: 2 },
    createdAt: '2026-01-01T00:00:00Z',
  },
];

const kpiMap = new Map([
  ['kpi1', { id: 'kpi1', title: 'Receita', sector: 'fin', value: 100, unit: 'currency' as const }],
  ['kpi2', { id: 'kpi2', title: 'Vendas', sector: 'fin', value: 50, unit: 'number' as const }],
]);

describe('DashboardCanvas', () => {
  it('renderiza estado vazio quando não há widgets', () => {
    render(<DashboardCanvas widgets={[]} kpiMap={kpiMap} />);

    expect(screen.getByText('Nenhum widget no canvas')).toBeInTheDocument();
  });

  it('renderiza widgets em modo visualização (grid estático)', () => {
    render(<DashboardCanvas widgets={mockWidgets} kpiMap={kpiMap} />);

    expect(screen.getByTestId('widget-w1')).toBeInTheDocument();
    expect(screen.getByTestId('widget-w2')).toBeInTheDocument();
  });

  it('renderiza grid editável quando isEditing=true', () => {
    render(<DashboardCanvas widgets={mockWidgets} kpiMap={kpiMap} isEditing />);

    expect(screen.getByTestId('grid-layout')).toBeInTheDocument();
  });

  it('chama onRemoveWidget ao clicar remover', () => {
    const onRemoveWidget = jest.fn();
    render(
      <DashboardCanvas
        widgets={mockWidgets}
        kpiMap={kpiMap}
        isEditing
        onRemoveWidget={onRemoveWidget}
      />,
    );

    fireEvent.click(screen.getByLabelText('Remover w1'));
    expect(onRemoveWidget).toHaveBeenCalledWith('w1');
  });

  it('chama onConfigureWidget ao clicar configurar', () => {
    const onConfigureWidget = jest.fn();
    render(
      <DashboardCanvas
        widgets={mockWidgets}
        kpiMap={kpiMap}
        isEditing
        onConfigureWidget={onConfigureWidget}
      />,
    );

    fireEvent.click(screen.getByLabelText('Configurar w2'));
    expect(onConfigureWidget).toHaveBeenCalledWith('w2');
  });

  it('chama onSelectWidget ao clicar no widget', () => {
    const onSelectWidget = jest.fn();
    const { container } = render(
      <DashboardCanvas
        widgets={mockWidgets}
        kpiMap={kpiMap}
        isEditing
        onSelectWidget={onSelectWidget}
      />,
    );

    const widgetWrapper = container.querySelector('[key="w1"]') ?? screen.getByTestId('widget-w1');
    fireEvent.click(widgetWrapper);
    expect(onSelectWidget).toHaveBeenCalled();
  });
});

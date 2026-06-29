import { render, screen, fireEvent } from '@testing-library/react';

import { ResizableWidgetCard } from './resizable-widget-card';
import type { UserDashboard } from '@/lib/platform-api';

jest.mock('./widget-card', () => ({
  WidgetCard: ({ widget }: { widget: { title: string } }) => (
    <div data-testid="widget-card">{widget.title}</div>
  ),
}));

const mockWidget: UserDashboard['widgets'][number] = {
  id: 'w1',
  dashboardId: 'd1',
  widgetType: 'kpi',
  title: 'Receita Total',
  chartType: null,
  reportId: null,
  kpiId: 'kpi1',
  displayOrder: 10,
  config: {},
  content: null,
  url: null,
  position: { x: 0, y: 0, width: 1, height: 1 },
  createdAt: '2026-01-01T00:00:00Z',
};

const kpiMap = new Map([
  [
    'kpi1',
    { id: 'kpi1', title: 'Receita', sector: 'financeiro', value: 1000, unit: 'currency' as const },
  ],
]);

describe('ResizableWidgetCard', () => {
  it('renderiza o widget', () => {
    render(<ResizableWidgetCard widget={mockWidget} kpiMap={kpiMap} />);

    expect(screen.getByTestId('widget-card')).toBeInTheDocument();
  });

  it('botão remover chama onRemove', () => {
    const onRemove = jest.fn();
    render(<ResizableWidgetCard widget={mockWidget} kpiMap={kpiMap} onRemove={onRemove} />);

    fireEvent.click(screen.getByLabelText('Remover widget'));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('botão configurar chama onConfigure', () => {
    const onConfigure = jest.fn();
    render(<ResizableWidgetCard widget={mockWidget} kpiMap={kpiMap} onConfigure={onConfigure} />);

    fireEvent.click(screen.getByLabelText('Configurar widget'));
    expect(onConfigure).toHaveBeenCalledTimes(1);
  });

  it('não renderiza botões quando callbacks ausentes', () => {
    render(<ResizableWidgetCard widget={mockWidget} kpiMap={kpiMap} />);

    expect(screen.queryByLabelText('Remover widget')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Configurar widget')).not.toBeInTheDocument();
  });

  it('destaca widget quando selected=true', () => {
    const { container } = render(
      <ResizableWidgetCard widget={mockWidget} kpiMap={kpiMap} selected />,
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('border-blue-500');
  });
});

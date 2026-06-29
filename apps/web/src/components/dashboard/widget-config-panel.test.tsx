import { render, screen, fireEvent } from '@testing-library/react';

import { WidgetConfigPanel } from './widget-config-panel';
import type { UserDashboard } from '@/lib/platform-api';

const baseWidget: UserDashboard['widgets'][number] = {
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
  position: { x: 0, y: 0, width: 1, height: 1 },
  createdAt: '2026-01-01T00:00:00Z',
};

const mockKpis = [
  { id: 'kpi1', title: 'Receita', sector: 'financeiro' },
  { id: 'kpi2', title: 'Vendas', sector: 'comercial' },
];

describe('WidgetConfigPanel', () => {
  it('renderiza campo título para todos os tipos', () => {
    render(
      <WidgetConfigPanel
        widget={baseWidget}
        kpis={mockKpis}
        onClose={jest.fn()}
        onSave={jest.fn()}
      />,
    );

    expect(screen.getByDisplayValue('Receita')).toBeInTheDocument();
  });

  it('renderiza seletor de KPI para widget tipo kpi', () => {
    render(
      <WidgetConfigPanel
        widget={baseWidget}
        kpis={mockKpis}
        onClose={jest.fn()}
        onSave={jest.fn()}
      />,
    );

    expect(screen.getByText('Receita (financeiro)')).toBeInTheDocument();
    expect(screen.getByText('Vendas (comercial)')).toBeInTheDocument();
  });

  it('renderiza seletor de tipo de gráfico para widget tipo chart', () => {
    const chartWidget = { ...baseWidget, widgetType: 'chart' as const, chartType: 'bar' };
    render(
      <WidgetConfigPanel
        widget={chartWidget}
        kpis={mockKpis}
        onClose={jest.fn()}
        onSave={jest.fn()}
      />,
    );

    expect(screen.getByDisplayValue('Barra')).toBeInTheDocument();
  });

  it('renderiza textarea de conteúdo para widget tipo text', () => {
    const textWidget = {
      ...baseWidget,
      widgetType: 'text' as const,
      config: { content: 'Texto inicial' },
    };
    render(<WidgetConfigPanel widget={textWidget} onClose={jest.fn()} onSave={jest.fn()} />);

    expect(screen.getByDisplayValue('Texto inicial')).toBeInTheDocument();
  });

  it('renderiza campo URL para widget tipo iframe', () => {
    const iframeWidget = {
      ...baseWidget,
      widgetType: 'iframe' as const,
      config: { url: 'https://exemplo.com' },
    };
    render(<WidgetConfigPanel widget={iframeWidget} onClose={jest.fn()} onSave={jest.fn()} />);

    expect(screen.getByDisplayValue('https://exemplo.com')).toBeInTheDocument();
  });

  it('chama onSave com config correto ao salvar', () => {
    const onSave = jest.fn();
    render(
      <WidgetConfigPanel widget={baseWidget} kpis={mockKpis} onClose={jest.fn()} onSave={onSave} />,
    );

    fireEvent.click(screen.getByText('Salvar'));
    expect(onSave).toHaveBeenCalledWith('w1', { title: 'Receita', kpiId: 'kpi1' });
  });

  it('chama onRemove ao clicar remover', () => {
    const onRemove = jest.fn();
    render(
      <WidgetConfigPanel
        widget={baseWidget}
        kpis={mockKpis}
        onClose={jest.fn()}
        onSave={jest.fn()}
        onRemove={onRemove}
      />,
    );

    fireEvent.click(screen.getByText('Remover'));
    expect(onRemove).toHaveBeenCalledWith('w1');
  });

  it('chama onClose ao clicar fechar', () => {
    const onClose = jest.fn();
    render(
      <WidgetConfigPanel
        widget={baseWidget}
        kpis={mockKpis}
        onClose={onClose}
        onSave={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByLabelText('Fechar painel'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

import { render, screen, fireEvent } from '@testing-library/react';

import { WidgetPalette, PALETTE_ITEMS } from './widget-palette';

describe('WidgetPalette', () => {
  it('renderiza todos os tipos de widget', () => {
    render(<WidgetPalette onAddWidget={jest.fn()} />);

    expect(screen.getByText('KPI')).toBeInTheDocument();
    expect(screen.getByText('Gráfico')).toBeInTheDocument();
    expect(screen.getByText('Tabela')).toBeInTheDocument();
    expect(screen.getByText('Texto')).toBeInTheDocument();
    expect(screen.getByText('Iframe')).toBeInTheDocument();
  });

  it('chama onAddWidget com tipo correto ao clicar', () => {
    const onAddWidget = jest.fn();
    render(<WidgetPalette onAddWidget={onAddWidget} />);

    fireEvent.click(screen.getByLabelText('Adicionar widget KPI'));
    expect(onAddWidget).toHaveBeenCalledWith('kpi', undefined);

    fireEvent.click(screen.getByLabelText('Adicionar widget Gráfico'));
    expect(onAddWidget).toHaveBeenCalledWith('chart', { chartType: 'bar' });

    fireEvent.click(screen.getByLabelText('Adicionar widget Texto'));
    expect(onAddWidget).toHaveBeenCalledWith('text', { content: '' });

    fireEvent.click(screen.getByLabelText('Adicionar widget Iframe'));
    expect(onAddWidget).toHaveBeenCalledWith('iframe', { url: '' });
  });

  it('desabilita todos os botões quando disabled=true', () => {
    render(<WidgetPalette onAddWidget={jest.fn()} disabled />);

    const buttons = screen.getAllByRole('button');
    buttons.forEach((btn) => expect(btn).toBeDisabled());
  });

  it('tem 5 itens na paleta', () => {
    expect(PALETTE_ITEMS).toHaveLength(5);
  });
});

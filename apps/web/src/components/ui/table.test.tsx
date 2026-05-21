import { render, screen } from '@testing-library/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';

describe('Table', () => {
  it('renderiza cabeçalho e linha', () => {
    render(<Table><TableHeader><TableRow><TableHead>Relatório</TableHead></TableRow></TableHeader><TableBody><TableRow><TableCell>Financeiro</TableCell></TableRow></TableBody></Table>);
    expect(screen.getByText('Relatório')).toBeInTheDocument();
    expect(screen.getByText('Financeiro')).toBeInTheDocument();
  });
});

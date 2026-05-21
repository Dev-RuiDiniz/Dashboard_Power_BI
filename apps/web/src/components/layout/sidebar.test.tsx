import { render, screen } from '@testing-library/react';
import { Sidebar } from './sidebar';

describe('Sidebar', () => {
  it('renderiza item ativo', () => {
    render(<Sidebar activePath="/" />);
    expect(screen.getByRole('link', { name: /Visão geral/i })).toHaveAttribute('aria-current', 'page');
  });
});

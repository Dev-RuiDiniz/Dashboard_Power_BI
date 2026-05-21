import { render, screen } from '@testing-library/react';
import { Header } from './header';

describe('Header', () => {
  it('renderiza navegação principal', () => {
    render(<Header />);
    expect(screen.getByText('Dashboard Power BI')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Navegação principal' })).toBeInTheDocument();
  });
});

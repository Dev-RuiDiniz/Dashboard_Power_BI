import { render, screen } from '@testing-library/react';
import DesignSystemPage from './page';

describe('DesignSystemPage', () => {
  it('renderiza preview visual', () => {
    render(<DesignSystemPage />);
    expect(screen.getByRole('heading', { name: 'Design system base' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Primário' })).toBeInTheDocument();
    expect(screen.getByLabelText('Nome do relatório')).toBeInTheDocument();
  });
});

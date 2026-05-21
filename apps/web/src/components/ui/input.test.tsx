import { render, screen } from '@testing-library/react';
import { Input } from './input';

describe('Input', () => {
  it('associa label e exibe erro', () => {
    render(<Input label="Nome" name="name" error="Campo obrigatório" />);
    expect(screen.getByLabelText('Nome')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Campo obrigatório')).toBeInTheDocument();
  });
});

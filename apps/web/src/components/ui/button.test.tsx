import { render, screen } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  it('renderiza conteúdo e disabled', () => {
    render(<Button disabled>Salvar</Button>);
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled();
  });
});

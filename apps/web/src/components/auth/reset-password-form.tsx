'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { resetPassword } from '@/lib/auth/api';
import { getAuthErrorMessage } from '@/lib/auth/errors';

type Props = { token?: string };

export function ResetPasswordForm({ token }: Props) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldError, setFieldError] = useState(token ? '' : 'Token de recuperação não informado.');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldError('');
    setStatus('');
    setError('');

    if (!token) return setFieldError('Token de recuperação não informado.');
    if (!newPassword) return setFieldError('Informe a nova senha.');
    if (newPassword.length < 8) return setFieldError('A senha deve ter pelo menos 8 caracteres.');
    if (newPassword !== confirmPassword) return setFieldError('As senhas não conferem.');

    setIsLoading(true);
    try {
      await resetPassword(token, newPassword);
      setStatus('Senha redefinida com sucesso. Você já pode acessar sua conta.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit} noValidate>
      <div className="space-y-2">
        <label htmlFor="newPassword" className="text-sm font-medium text-slate-800">Nova senha</label>
        <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" />
      </div>
      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-800">Confirmar senha</label>
        <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" />
      </div>
      {fieldError ? <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{fieldError}</div> : null}
      {status ? <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{status}</div> : null}
      {error ? <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      <Button className="w-full" type="submit" disabled={isLoading || !token}>{isLoading ? 'Redefinindo...' : 'Redefinir senha'}</Button>
      <p className="text-center text-sm text-slate-600">Já redefiniu? <Link className="font-semibold text-blue-700" href="/login">Voltar ao login</Link></p>
    </form>
  );
}

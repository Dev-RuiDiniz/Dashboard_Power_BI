'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { forgotPassword } from '@/lib/auth/api';
import { getAuthErrorMessage } from '@/lib/auth/errors';

const emailRegex = /\S+@\S+\.\S+/;

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldError('');
    setStatus('');
    setError('');

    if (!email) return setFieldError('Informe seu e-mail.');
    if (!emailRegex.test(email)) return setFieldError('Informe um e-mail válido.');

    setIsLoading(true);
    try {
      const response = await forgotPassword(email);
      setStatus(response.message);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit} noValidate>
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-slate-800">E-mail</label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
      </div>
      {fieldError ? <p className="text-sm text-red-600">{fieldError}</p> : null}
      {status ? <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{status}</div> : null}
      {error ? <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      <Button className="w-full" type="submit" disabled={isLoading}>{isLoading ? 'Enviando...' : 'Enviar instruções'}</Button>
      <p className="text-center text-sm text-slate-600">Lembrou a senha? <Link className="font-semibold text-blue-700" href="/login">Voltar ao login</Link></p>
    </form>
  );
}

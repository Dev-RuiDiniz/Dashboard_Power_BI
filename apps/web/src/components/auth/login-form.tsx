'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { login } from '@/lib/auth/api';
import { getAuthErrorMessage } from '@/lib/auth/errors';
import { saveAuthSession } from '@/lib/auth/session';

const emailRegex = /\S+@\S+\.\S+/;

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setFieldError('');

    if (!email) return setFieldError('Informe seu e-mail.');
    if (!emailRegex.test(email)) return setFieldError('Informe um e-mail válido.');
    if (!password) return setFieldError('Informe sua senha.');

    setIsLoading(true);
    try {
      const session = await login(email, password);
      saveAuthSession(session);
      router.push('/app');
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
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-slate-800">Senha</label>
        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
      </div>
      {fieldError ? <p className="text-sm text-red-600">{fieldError}</p> : null}
      {error ? <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      <Button className="w-full" type="submit" disabled={isLoading}>{isLoading ? 'Entrando...' : 'Entrar'}</Button>
      <p className="text-center text-sm text-slate-600">Esqueceu sua senha? <Link className="font-semibold text-blue-700" href="/forgot-password">Recuperar acesso</Link></p>
    </form>
  );
}

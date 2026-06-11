'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { login, loginWithTotp } from '@/lib/auth/api';
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
  const [isVerifyingTotp, setIsVerifyingTotp] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [totpCode, setTotpCode] = useState('');

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setFieldError('');

    if (!email) return setFieldError('Informe seu e-mail.');
    if (!emailRegex.test(email)) return setFieldError('Informe um e-mail válido.');
    if (!password) return setFieldError('Informe sua senha.');

    setIsLoading(true);
    try {
      const result = await login(email, password);

      if ('requiresTwoFactor' in result) {
        setTempToken(result.tempToken);
        setIsVerifyingTotp(true);
        return;
      }

      saveAuthSession(result);
      router.push('/app');
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleTotpSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!/^\d{6}$/.test(totpCode)) {
      setFieldError('Informe o código de 6 dígitos.');
      return;
    }

    setIsLoading(true);
    try {
      const session = await loginWithTotp(tempToken, totpCode);
      saveAuthSession(session);
      router.push('/app');
    } catch (err) {
      setFieldError('');
      setError(getAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  if (isVerifyingTotp) {
    return (
      <form className="space-y-5" onSubmit={handleTotpSubmit} noValidate>
        <div className="space-y-2">
          <p className="text-sm text-slate-600">
            Este login exige autenticação de dois fatores. Insira o código de 6 dígitos do seu
            aplicativo autenticador.
          </p>
          <label htmlFor="totp" className="text-sm font-medium text-slate-800">
            Código de verificação
          </label>
          <Input
            id="totp"
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={totpCode}
            onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            autoComplete="one-time-code"
          />
        </div>
        {fieldError ? <p className="text-sm text-red-600">{fieldError}</p> : null}
        {error ? (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        ) : null}
        <Button className="w-full" type="submit" disabled={isLoading}>
          {isLoading ? 'Verificando...' : 'Verificar e entrar'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full text-sm text-slate-500"
          onClick={() => {
            setIsVerifyingTotp(false);
            setTempToken('');
            setTotpCode('');
            setError('');
          }}
        >
          Voltar ao login
        </Button>
      </form>
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleLogin} noValidate>
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-slate-800">
          E-mail
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-slate-800">
          Senha
        </label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
      </div>
      {fieldError ? <p className="text-sm text-red-600">{fieldError}</p> : null}
      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      ) : null}
      <Button className="w-full" type="submit" disabled={isLoading}>
        {isLoading ? 'Entrando...' : 'Entrar'}
      </Button>
      <p className="text-center text-sm text-slate-600">
        Esqueceu sua senha?{' '}
        <Link className="font-semibold text-blue-700" href="/forgot-password">
          Recuperar acesso
        </Link>
      </p>
    </form>
  );
}

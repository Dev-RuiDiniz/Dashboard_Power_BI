'use client';

import {
  Loader as Loader2,
  TriangleAlert as AlertTriangle,
  User,
  Mail,
  Shield,
  Building2,
  Calendar,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from '@/components/ui';
import { apiGet, apiPatch } from '@/lib/admin-api';
import { setupTotp, verifyTotpSetup, disableTotp } from '@/lib/auth/api';

type UserProfile = {
  id: string;
  email: string;
  roles: string[];
  sectors: string[];
  groupIds: string[];
  isActive: boolean;
  isTwoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  deactivatedAt: string | null;
};

export function UserProfile() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isSettingUpTotp, setIsSettingUpTotp] = useState(false);
  const [totpSetupData, setTotpSetupData] = useState<{ secret: string; otpauthUrl: string } | null>(
    null,
  );
  const [totpVerificationCode, setTotpVerificationCode] = useState('');
  const [isVerifyingTotp, setIsVerifyingTotp] = useState(false);
  const [totpError, setTotpError] = useState<string | null>(null);
  const [isDisablingTotp, setIsDisablingTotp] = useState(false);
  const [disableTotpCode, setDisableTotpCode] = useState('');
  const [disableTotpPassword, setDisableTotpPassword] = useState('');

  const loadUserProfile = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await apiGet<UserProfile>('/auth/me');
      setUser(response);
    } catch {
      setErrorMessage('Não foi possível carregar o perfil do usuário.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUserProfile();
  }, [loadUserProfile]);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword.length < 8) {
      setPasswordError('A nova senha deve ter no mínimo 8 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('As senhas não conferem.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await apiPatch(`/auth/me/password`, {
        currentPassword,
        newPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsEditing(false);
      alert('Senha atualizada com sucesso.');
    } catch {
      setPasswordError('Erro ao atualizar senha. Verifique a senha atual.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSetupTotp = async () => {
    setIsSettingUpTotp(true);
    setTotpError(null);
    try {
      const data = await setupTotp();
      setTotpSetupData(data);
    } catch {
      setTotpError('Não foi possível iniciar a configuração de 2FA.');
    } finally {
      setIsSettingUpTotp(false);
    }
  };

  const handleVerifyTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    setTotpError(null);

    if (!/^\d{6}$/.test(totpVerificationCode)) {
      setTotpError('Informe o código de 6 dígitos.');
      return;
    }

    setIsVerifyingTotp(true);
    try {
      await verifyTotpSetup(totpVerificationCode);
      setTotpSetupData(null);
      setTotpVerificationCode('');
      await loadUserProfile();
      alert('2FA ativado com sucesso.');
    } catch {
      setTotpError('Código inválido. Tente novamente.');
    } finally {
      setIsVerifyingTotp(false);
    }
  };

  const handleDisableTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    setTotpError(null);

    if (!/^\d{6}$/.test(disableTotpCode)) {
      setTotpError('Informe o código de 6 dígitos.');
      return;
    }

    if (!disableTotpPassword) {
      setTotpError('Informe sua senha atual.');
      return;
    }

    setIsDisablingTotp(true);
    try {
      await disableTotp(disableTotpCode, disableTotpPassword);
      setDisableTotpCode('');
      setDisableTotpPassword('');
      await loadUserProfile();
      alert('2FA desativado com sucesso.');
    } catch {
      setTotpError('Código ou senha inválidos. Tente novamente.');
    } finally {
      setIsDisablingTotp(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-dashed text-center">
        <CardHeader>
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-700" aria-hidden="true" />
          <CardTitle>Carregando perfil</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (errorMessage && !user) {
    return (
      <Card className="border-amber-200 bg-amber-50 text-center">
        <CardHeader>
          <AlertTriangle className="mx-auto h-8 w-8 text-amber-700" aria-hidden="true" />
          <CardTitle>{errorMessage}</CardTitle>
          <CardDescription>
            Verifique se a API está disponível e se você está autenticado.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!user) return null;

  return (
    <section className="space-y-6" aria-labelledby="profile-title">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Meu Perfil</p>
        <h1 id="profile-title" className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
          Perfil do usuário
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
          Visualize e gerencie suas informações de perfil e permissões na plataforma.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-700" aria-hidden="true" />
              Informações pessoais
            </CardTitle>
            <CardDescription>Dados básicos da sua conta.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 text-slate-400" aria-hidden="true" />
              <div className="flex-1">
                <p className="text-xs font-medium uppercase text-slate-500">E-mail</p>
                <p className="mt-1 text-sm font-medium text-slate-950">{user.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-5 w-5 text-slate-400" aria-hidden="true" />
              <div className="flex-1">
                <p className="text-xs font-medium uppercase text-slate-500">Membro desde</p>
                <p className="mt-1 text-sm text-slate-700">
                  {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(
                    new Date(user.createdAt),
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="mt-0.5 h-5 w-5 text-slate-400" aria-hidden="true" />
              <div className="flex-1">
                <p className="text-xs font-medium uppercase text-slate-500">Status</p>
                <Badge variant={user.isActive ? 'success' : 'danger'} className="mt-1">
                  {user.isActive ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-700" aria-hidden="true" />
              Permissões
            </CardTitle>
            <CardDescription>Roles e setores atribuídos ao seu usuário.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-medium uppercase text-slate-500 mb-2">Roles</p>
              <div className="flex flex-wrap gap-2">
                {user.roles.length === 0 ? (
                  <p className="text-sm text-slate-500">Nenhuma role atribuída</p>
                ) : (
                  user.roles.map((role) => (
                    <Badge key={role} className="border border-slate-200 bg-white text-slate-700">
                      {role}
                    </Badge>
                  ))
                )}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-slate-500 mb-2">Setores</p>
              <div className="flex flex-wrap gap-2">
                {user.sectors.length === 0 ? (
                  <p className="text-sm text-slate-500">Nenhum setor atribuído</p>
                ) : (
                  user.sectors.map((sector) => (
                    <Badge key={sector} className="border border-blue-200 bg-blue-50 text-blue-700">
                      {sector}
                    </Badge>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-700" aria-hidden="true" />
            Segurança
          </CardTitle>
          <CardDescription>Gerencie sua senha e autenticação de dois fatores.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Senha</h3>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>Alterar senha</Button>
            ) : (
              <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-md">
                <Input
                  id="current-password"
                  label="Senha atual"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
                <Input
                  id="new-password"
                  label="Nova senha"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  helperText="Mínimo 8 caracteres"
                />
                <Input
                  id="confirm-password"
                  label="Confirmar nova senha"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                {passwordError && (
                  <p className="text-xs font-medium text-danger" role="alert">
                    {passwordError}
                  </p>
                )}
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setPasswordError(null);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isUpdatingPassword}>
                    {isUpdatingPassword ? 'Atualizando...' : 'Atualizar senha'}
                  </Button>
                </div>
              </form>
            )}
          </div>

          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">
              Autenticação de dois fatores (2FA)
            </h3>
            {user.isTwoFactorEnabled ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="success">2FA ativado</Badge>
                  {user.roles.includes('admin') && (
                    <span className="text-xs text-slate-500">
                      (obrigatório para administradores)
                    </span>
                  )}
                </div>
                {user.roles.includes('admin') ? (
                  <p className="text-sm text-slate-600">
                    2FA é obrigatório para administradores e não pode ser desativado.
                  </p>
                ) : (
                  <form onSubmit={handleDisableTotp} className="space-y-3 max-w-md">
                    <p className="text-sm text-slate-600">
                      Para desativar o 2FA, informe um código válido do seu aplicativo autenticador
                      e sua senha atual.
                    </p>
                    <Input
                      id="disable-totp"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="000000"
                      value={disableTotpCode}
                      onChange={(e) => setDisableTotpCode(e.target.value.replace(/\D/g, ''))}
                      required
                    />
                    <Input
                      id="disable-totp-password"
                      type="password"
                      placeholder="Senha atual"
                      value={disableTotpPassword}
                      onChange={(e) => setDisableTotpPassword(e.target.value)}
                      required
                    />
                    {totpError && (
                      <p className="text-xs font-medium text-danger" role="alert">
                        {totpError}
                      </p>
                    )}
                    <Button type="submit" variant="outline" disabled={isDisablingTotp}>
                      {isDisablingTotp ? 'Desativando...' : 'Desativar 2FA'}
                    </Button>
                  </form>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {user.roles.includes('admin') && (
                  <div
                    className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
                    role="alert"
                  >
                    <strong>2FA obrigatório para administradores.</strong> Você precisa ativar a
                    autenticação de dois fatores para acessar funcionalidades administrativas.
                  </div>
                )}
                {!totpSetupData ? (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-600">
                      Ative a autenticação de dois fatores para aumentar a segurança da sua conta.
                    </p>
                    <Button onClick={() => void handleSetupTotp()} disabled={isSettingUpTotp}>
                      {isSettingUpTotp ? 'Carregando...' : 'Ativar 2FA'}
                    </Button>
                    {totpError && (
                      <p className="text-xs font-medium text-danger" role="alert">
                        {totpError}
                      </p>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleVerifyTotp} className="space-y-4 max-w-md">
                    <p className="text-sm text-slate-600">
                      Escaneie o QR code com seu aplicativo autenticador ou clique no link abaixo.
                      Em seguida, insira o código de verificação de 6 dígitos para confirmar.
                    </p>
                    <a
                      href={totpSetupData.otpauthUrl}
                      className="block text-sm font-mono bg-slate-50 border border-slate-200 rounded-md p-3 break-all text-blue-700 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {totpSetupData.otpauthUrl}
                    </a>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Secret (para entrada manual)</p>
                      <code className="block text-sm font-mono bg-slate-50 border border-slate-200 rounded-md p-2 break-all">
                        {totpSetupData.secret}
                      </code>
                    </div>
                    <Input
                      id="verify-totp"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="Código de 6 dígitos"
                      value={totpVerificationCode}
                      onChange={(e) => setTotpVerificationCode(e.target.value.replace(/\D/g, ''))}
                      required
                    />
                    {totpError && (
                      <p className="text-xs font-medium text-danger" role="alert">
                        {totpError}
                      </p>
                    )}
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setTotpSetupData(null);
                          setTotpVerificationCode('');
                          setTotpError(null);
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={isVerifyingTotp}>
                        {isVerifyingTotp ? 'Verificando...' : 'Verificar e ativar'}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

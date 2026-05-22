import { AuthCard } from '@/components/auth/auth-card';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';

type ResetPasswordPageProps = {
  searchParams: {
    token?: string;
  };
};

export default function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  return (
    <AuthCard title="Redefinir senha" description="Crie uma nova senha para voltar a acessar sua conta.">
      <ResetPasswordForm token={searchParams.token} />
    </AuthCard>
  );
}

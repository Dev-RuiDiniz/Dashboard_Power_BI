import { AuthCard } from '@/components/auth/auth-card';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';

export default function ForgotPasswordPage() {
  return (
    <AuthCard title="Recuperar senha" description="Informe seu e-mail para receber as instruções de redefinição.">
      <ForgotPasswordForm />
    </AuthCard>
  );
}

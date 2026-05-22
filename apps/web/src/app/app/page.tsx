import Link from 'next/link';

export default function AuthenticatedAppPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <section className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-white p-8 text-center shadow-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">Sessão autenticada</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-950">Bem-vindo ao Dashboard Power BI</h1>
        <p className="mt-4 text-slate-600">
          Esta é uma rota autenticada mínima para validar o happy path de login da Sprint 2.
        </p>
        <Link className="mt-8 inline-flex rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800" href="/">
          Ir para início
        </Link>
      </section>
    </main>
  );
}

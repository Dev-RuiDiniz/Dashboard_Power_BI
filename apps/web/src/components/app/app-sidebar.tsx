import { NavLink } from './nav-link';

export function AppSidebar() {
  return (
    <aside className="w-full border-b border-slate-800 bg-slate-950 p-4 md:min-h-screen md:w-72 md:border-b-0 md:border-r md:p-6">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-400">Dashboard Power BI</p>
        <h2 className="mt-3 text-xl font-bold text-white">Área autenticada</h2>
      </div>

      <nav aria-label="Navegação autenticada" className="space-y-3">
        <NavLink href="/app" label="Visão geral" description="Resumo inicial da sessão autenticada." />
        <NavLink href="/app/reports" label="Relatórios" description="Placeholder para relatórios protegidos." />
        <NavLink href="/app/admin" label="Administração" description="Placeholder para gestão administrativa." />
      </nav>
    </aside>
  );
}

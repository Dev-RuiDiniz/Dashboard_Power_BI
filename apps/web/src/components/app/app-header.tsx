import { LogoutButton } from './logout-button';

export function AppHeader() {
  return (
    <header className="flex flex-col gap-4 border-b border-slate-200 bg-white px-6 py-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium text-blue-700">Sessão ativa</p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950">Dashboard Power BI</h1>
      </div>
      <LogoutButton />
    </header>
  );
}

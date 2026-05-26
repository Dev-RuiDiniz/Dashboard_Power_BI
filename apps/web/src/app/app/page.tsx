import { DashboardHome } from '@/components/dashboard/dashboard-home';
import type { KpiItem } from '@/lib/kpis';

const initialKpis: KpiItem[] = [
  {
    id: 'receita-mensal',
    title: 'Receita mensal',
    sector: 'Financeiro',
    value: 120000,
    previousValue: 100000,
    unit: 'currency',
  },
  {
    id: 'margem-operacional',
    title: 'Margem operacional',
    sector: 'Financeiro',
    value: 0.32,
    previousValue: 0.3,
    unit: 'percent',
  },
  {
    id: 'leads-qualificados',
    title: 'Leads qualificados',
    sector: 'Comercial',
    value: 430,
    previousValue: 400,
    unit: 'number',
  },
  {
    id: 'sla-operacional',
    title: 'SLA operacional',
    sector: 'Operacoes',
    value: 0.92,
    previousValue: 0.9,
    unit: 'percent',
  },
  {
    id: 'dashboards-ativos',
    title: 'Dashboards ativos',
    sector: 'BI',
    value: 18,
    previousValue: 16,
    unit: 'number',
  },
  {
    id: 'exportacoes-mensais',
    title: 'Exportacoes mensais',
    sector: 'BI',
    value: 240,
    previousValue: 220,
    unit: 'number',
  },
];

export default function AppHomePage() {
  return <DashboardHome kpis={initialKpis} />;
}

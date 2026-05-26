import { ReportCatalog, type ReportCatalogItem } from '@/components/reports/report-catalog';

const initialReports: ReportCatalogItem[] = [
  {
    id: 'financeiro-dre-mensal',
    name: 'DRE Mensal',
    description: 'Acompanha receitas, despesas, margem e resultado operacional por competência.',
    sector: 'Financeiro',
    sourceType: 'view',
    requiredPermissions: ['reports:read', 'sector:financeiro'],
    status: 'available',
    updatedAt: '2026-05-21T12:00:00.000Z',
  },
  {
    id: 'comercial-funil-vendas',
    name: 'Funil de Vendas',
    description: 'Consolida oportunidades, etapas comerciais, taxa de conversão e previsão de receita.',
    sector: 'Comercial',
    sourceType: 'procedure',
    requiredPermissions: ['reports:read', 'sector:comercial'],
    status: 'available',
    updatedAt: '2026-05-22T12:00:00.000Z',
  },
  {
    id: 'operacoes-sla-atendimento',
    name: 'SLA de Atendimento',
    description: 'Monitora filas, tempo médio de resposta, violações de SLA e produtividade operacional.',
    sector: 'Operações',
    sourceType: 'view',
    requiredPermissions: ['reports:read', 'sector:operacoes'],
    status: 'restricted',
    updatedAt: '2026-05-23T12:00:00.000Z',
  },
  {
    id: 'executivo-indicadores-gerais',
    name: 'Indicadores Executivos',
    description: 'Visão consolidada de KPIs estratégicos para diretoria e gestão multiárea.',
    sector: 'Executivo',
    sourceType: 'procedure',
    requiredPermissions: ['reports:read', 'role:executivo'],
    status: 'maintenance',
    updatedAt: '2026-05-20T12:00:00.000Z',
  },
];

export default function ReportsPage() {
  return <ReportCatalog reports={initialReports} />;
}

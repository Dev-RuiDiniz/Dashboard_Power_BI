import type { SectorCode } from '../../auth/types/auth.types';

export type SectorDashboardTemplate = {
  name: string;
  description: string;
  widgets: Array<{
    widgetType: 'kpi';
    title: string;
    kpiId: string;
    chartType: null;
    position: { x: number; y: number; width: number; height: number };
    displayOrder: number;
  }>;
};

const GRID_WIDTH = 12;
const KPI_WIDTH = 4;
const KPI_HEIGHT = 1;

function buildKpiWidgets(kpiDefs: Array<{ kpiId: string; title: string }>) {
  return kpiDefs.map((def, index) => ({
    widgetType: 'kpi' as const,
    title: def.title,
    kpiId: def.kpiId,
    chartType: null,
    position: {
      x: (index * KPI_WIDTH) % GRID_WIDTH,
      y: Math.floor((index * KPI_WIDTH) / GRID_WIDTH),
      width: KPI_WIDTH,
      height: KPI_HEIGHT,
    },
    displayOrder: (index + 1) * 10,
  }));
}

const PRODUCAO_TEMPLATE: SectorDashboardTemplate = {
  name: 'Dashboard de Produção',
  description: 'KPIs de plantio, colheita e variedades — gerado automaticamente.',
  widgets: buildKpiWidgets([
    { kpiId: 'producao-plantio-area', title: 'Área plantada' },
    { kpiId: 'producao-operacoes-plantio', title: 'Operações de plantio' },
    { kpiId: 'producao-colheita-area', title: 'Área colhida' },
    { kpiId: 'producao-variedades', title: 'Variedades plantadas' },
    { kpiId: 'producao-talhoes', title: 'Talhões monitorados' },
  ]),
};

const COMERCIAL_TEMPLATE: SectorDashboardTemplate = {
  name: 'Dashboard Comercial',
  description: 'KPIs de contratos, entregas e pendências — gerado automaticamente.',
  widgets: buildKpiWidgets([
    { kpiId: 'comercial-contratos', title: 'Contratos comerciais' },
    { kpiId: 'comercial-quantidade-entregue', title: 'Quantidade entregue' },
    { kpiId: 'comercial-quantidade-pendente', title: 'Quantidade pendente' },
    { kpiId: 'comercial-quantidade-devolvida', title: 'Quantidade devolvida' },
  ]),
};

const ALGODOEIRA_TEMPLATE: SectorDashboardTemplate = {
  name: 'Dashboard Algodoeira',
  description: 'KPIs de contratos, embarques e fardos — gerado automaticamente.',
  widgets: buildKpiWidgets([
    { kpiId: 'algodoeira-contratos', title: 'Contratos da algodoeira' },
    { kpiId: 'algodoeira-embarques', title: 'Embarques programados' },
    { kpiId: 'algodoeira-fardos', title: 'Produção de fardos' },
  ]),
};

const DIRETORIA_TEMPLATE: SectorDashboardTemplate = {
  name: 'Dashboard Executivo',
  description: 'KPIs de todas as áreas — gerado automaticamente.',
  widgets: buildKpiWidgets([
    { kpiId: 'producao-plantio-area', title: 'Área plantada' },
    { kpiId: 'producao-colheita-area', title: 'Área colhida' },
    { kpiId: 'comercial-contratos', title: 'Contratos comerciais' },
    { kpiId: 'comercial-quantidade-entregue', title: 'Quantidade entregue' },
    { kpiId: 'algodoeira-contratos', title: 'Contratos da algodoeira' },
    { kpiId: 'algodoeira-fardos', title: 'Produção de fardos' },
  ]),
};

const SECTOR_TO_TEMPLATE: Record<SectorCode, SectorDashboardTemplate> = {
  operacoes: PRODUCAO_TEMPLATE,
  comercial: COMERCIAL_TEMPLATE,
  financeiro: ALGODOEIRA_TEMPLATE,
  diretoria: DIRETORIA_TEMPLATE,
};

export function getTemplateForSectors(sectors: SectorCode[]): SectorDashboardTemplate {
  if (sectors.length === 0 || sectors.includes('diretoria')) {
    return DIRETORIA_TEMPLATE;
  }

  const sector = sectors[0]!;
  return SECTOR_TO_TEMPLATE[sector] ?? DIRETORIA_TEMPLATE;
}

import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import { SectorCode } from '../../auth/types/auth.types';
import { DatabaseProviderService } from '../../sql-server/database-provider.service';
import { SqlQueryService } from '../../sql-server/sql-query.service';

export type BusinessArea = 'producao' | 'comercial' | 'algodoeira';

export type DashboardKpi = {
  id: string;
  title: string;
  businessArea: BusinessArea;
  sector: string;
  value: number;
  previousValue: number;
  unit: 'number' | 'currency' | 'percent';
};

export type DashboardBusinessAreaSummary = {
  businessArea: BusinessArea;
  label: string;
  total: number;
  averageDelta: number;
};

export type DashboardSector = {
  id: string;
  code: string;
  name: string;
};

export type DashboardSectorSummary = {
  sector: string;
  total: number;
  averageDelta: number;
};

export type DashboardHomeChartPoint = {
  id: string;
  title: string;
  businessArea: BusinessArea;
  sector: string;
  value: number;
  previousValue: number;
  delta: number;
};

export type DrilldownDimension =
  | 'fazenda'
  | 'cultura'
  | 'variedade'
  | 'safra'
  | 'cliente'
  | 'produto'
  | 'status'
  | 'tempo';

export type DrilldownDimensionOption = {
  dimension: DrilldownDimension;
  label: string;
};

export type DashboardHomeResponse = {
  summary: {
    totalKpis: number;
    totalSectors: number;
    averageDelta: number;
  };
  kpis: DashboardKpi[];
  businessAreas: DashboardBusinessAreaSummary[];
  sectorSummaries: DashboardSectorSummary[];
  charts: {
    sectorDistribution: DashboardSectorSummary[];
    kpiPerformance: DashboardHomeChartPoint[];
  };
  availableDrilldowns: Array<{
    kpiId: string;
    label: string;
    dimensions: DrilldownDimensionOption[];
  }>;
};

export type DashboardDrilldownResponse = {
  kpiId: string;
  label: string;
  dimension: DrilldownDimension;
  availableDimensions: DrilldownDimensionOption[];
  series: Array<{
    label: string;
    value: number;
  }>;
  rows: Array<{
    period: string;
    value: number;
    delta: number;
  }>;
};

export type KpiHistoryItem = {
  period: string;
  value: number;
  previousValue: number;
  delta: number;
};

export type KpiHistoryResponse = {
  kpiId: string;
  label: string;
  unit: DashboardKpi['unit'];
  granularity: 'monthly' | 'annual-comparative';
  rangeMonths: 12;
  periods: KpiHistoryItem[];
};

type PlantioRow = {
  DESCRICAO_SAFRA: string | null;
  DESC_FAZENDA: string | null;
  NUMERO_TALHAO: string | null;
  DESC_VARIEDADE: string | null;
  DESC_CULTURA: string | null;
  QTD_HA_EFETIVO: number | null;
  DATA_PLANTIO: string | Date | null;
};

type ColheitaRow = {
  DESCRICAO_SAFRA: string | null;
  DESC_FAZENDA: string | null;
  NUMERO_TALHAO: string | null;
  DESC_VARIEDADE: string | null;
  DESC_CULTURA: string | null;
  QTD_HA_EFETIVO: number | null;
  DATA_LANCAMENTO: string | Date | null;
};

type ContratoRow = {
  SEQ_PLA_CONTRATO: string | null;
  NOME_CLIENTE: string | null;
  DESCRICAO_PRODUTO: string | null;
  QUANTIDADE: number | null;
  QTDE_EMBARC: number | null;
  QTDE_TON: number | null;
  QTDE_EMBARC_TON: number | null;
  SALDO: number | null;
  SALDO_TON: number | null;
  DEVOLUCAO: number | null;
  STATUS: string | null;
};

type EmbarqueRow = {
  SEQ_PLA_INSTRUCAO: string | null;
  SEQ_PLA_CONTRATO: string | null;
  NR_INSTRUCAO: string | null;
  COD_SAFRA: number | null;
  DATA_INSTRUCAO: string | Date | null;
  QUANTIDADE: number | null;
  FARDOS: number | null;
  CLIENTE_DESTINO: string | null;
  CUMPRIDA: string | null;
  CANCELADO: string | null;
};

type OracleDashboardDataset = {
  plantio: PlantioRow[];
  colheita: ColheitaRow[];
  contratos: ContratoRow[];
  embarques: EmbarqueRow[];
};

type DrilldownDimensionConfig = {
  dimension: DrilldownDimension;
  label: string;
  getRows: (dataset: OracleDashboardDataset) => DashboardDrilldownResponse['rows'];
};

type DashboardKpiDefinition = {
  id: string;
  title: string;
  businessArea: BusinessArea;
  unit: DashboardKpi['unit'];
  getValue: (dataset: OracleDashboardDataset) => number;
  getPreviousValue: (dataset: OracleDashboardDataset, currentValue: number) => number;
  drilldownDimensions: DrilldownDimensionConfig[];
  getHistory: (dataset: OracleDashboardDataset, currentValue: number) => KpiHistoryItem[];
  getHistoryGranularity: () => KpiHistoryResponse['granularity'];
};

const BUSINESS_AREA_LABEL: Record<BusinessArea, string> = {
  producao: 'Producao',
  comercial: 'Comercial',
  algodoeira: 'Algodoeira',
};

const SECTOR_TO_BUSINESS_AREA: Record<string, BusinessArea> = {
  operacoes: 'producao',
  comercial: 'comercial',
  financeiro: 'algodoeira',
};

function shouldSeeAllSectors(sectors: SectorCode[]): boolean {
  return sectors.length === 0 || sectors.includes('diretoria');
}

function filterKpisBySectors(kpis: DashboardKpi[], sectors: SectorCode[]): DashboardKpi[] {
  if (shouldSeeAllSectors(sectors)) {
    return kpis;
  }

  const allowedAreas = new Set<BusinessArea>(
    sectors.map((s) => SECTOR_TO_BUSINESS_AREA[s]).filter((v): v is BusinessArea => Boolean(v)),
  );

  return kpis.filter((kpi) => allowedAreas.has(kpi.businessArea));
}

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);
  private readonly rangeMonths = 12;

  constructor(
    private readonly sqlQueryService: SqlQueryService,
    private readonly databaseProviderService: DatabaseProviderService,
  ) {}

  async getHome(sectors: SectorCode[] = []): Promise<DashboardHomeResponse> {
    const kpis = await this.listKpis(sectors);

    return buildDashboardHome(kpis);
  }

  async getKpiDrilldown(
    kpiId: string,
    sectors: SectorCode[] = [],
    dimension?: DrilldownDimension,
  ): Promise<DashboardDrilldownResponse> {
    const kpis = await this.listKpis(sectors);
    const kpi = kpis.find((item) => item.id === kpiId);

    if (!kpi) {
      throw new NotFoundException('KPI nao encontrado.');
    }

    const definition = KPI_DEFINITIONS.find((item) => item.id === kpiId);
    if (!definition) {
      throw new NotFoundException('KPI nao encontrado.');
    }

    const dataset = await this.loadDataset();

    const availableDimensions = definition.drilldownDimensions.map((d) => ({
      dimension: d.dimension,
      label: d.label,
    }));

    const selectedDimension =
      definition.drilldownDimensions.find((d) => d.dimension === dimension) ??
      definition.drilldownDimensions[0]!;

    return {
      kpiId: kpi.id,
      label: kpi.title,
      dimension: selectedDimension.dimension,
      availableDimensions,
      series: [
        { label: 'Atual', value: kpi.value },
        { label: 'Anterior', value: kpi.previousValue },
      ],
      rows: selectedDimension.getRows(dataset),
    };
  }

  async listKpis(sectors: SectorCode[] = []): Promise<DashboardKpi[]> {
    const dataset = await this.loadDataset();

    const allKpis = KPI_DEFINITIONS.map((definition) => {
      const value = round(definition.getValue(dataset));
      const previousValue = round(definition.getPreviousValue(dataset, value));

      return {
        id: definition.id,
        title: definition.title,
        businessArea: definition.businessArea,
        sector: BUSINESS_AREA_LABEL[definition.businessArea],
        value,
        previousValue,
        unit: definition.unit,
      };
    });

    return filterKpisBySectors(allKpis, sectors);
  }

  async listSectors(): Promise<DashboardSector[]> {
    return (Object.entries(BUSINESS_AREA_LABEL) as Array<[BusinessArea, string]>).map(
      ([id, name]) => ({
        id,
        code: id.toUpperCase(),
        name,
      }),
    );
  }

  async getKpiHistory(kpiId: string, sectors: SectorCode[] = []): Promise<KpiHistoryResponse> {
    const kpis = await this.listKpis(sectors);
    const kpi = kpis.find((item) => item.id === kpiId);

    if (!kpi) {
      throw new NotFoundException('KPI nao encontrado.');
    }

    const definition = KPI_DEFINITIONS.find((item) => item.id === kpiId);
    if (!definition) {
      throw new NotFoundException('KPI nao encontrado.');
    }

    const dataset = await this.loadDataset();

    return {
      kpiId: kpi.id,
      label: kpi.title,
      unit: kpi.unit,
      granularity: definition.getHistoryGranularity(),
      rangeMonths: 12,
      periods: definition.getHistory(dataset, kpi.value),
    };
  }

  private async loadDataset(): Promise<OracleDashboardDataset> {
    const provider = this.databaseProviderService?.getProvider?.();
    if (provider !== 'oracle' || !this.sqlQueryService?.executeView) {
      return this.getFallbackDataset();
    }

    try {
      const [plantio, colheita, contratos, embarques] = await Promise.all([
        this.sqlQueryService.executeView<PlantioRow>(
          {
            viewName: 'EXTRATOR.EXT_COL_OS_PLANTIO',
            columns: [
              'DESCRICAO_SAFRA',
              'DESC_FAZENDA',
              'NUMERO_TALHAO',
              'DESC_VARIEDADE',
              'DESC_CULTURA',
              'QTD_HA_EFETIVO',
              'DATA_PLANTIO',
            ],
          },
          'oracle',
        ),
        this.sqlQueryService.executeView<ColheitaRow>(
          {
            viewName: 'EXTRATOR.EXT_COL_OS_COLHEITA',
            columns: [
              'DESCRICAO_SAFRA',
              'DESC_FAZENDA',
              'NUMERO_TALHAO',
              'DESC_VARIEDADE',
              'DESC_CULTURA',
              'QTD_HA_EFETIVO',
              'DATA_LANCAMENTO',
            ],
          },
          'oracle',
        ),
        this.sqlQueryService.executeView<ContratoRow>(
          {
            viewName: 'AGNEW.VW_CONS_CONTRATO_GRAOS',
            columns: [
              'SEQ_PLA_CONTRATO',
              'NOME_CLIENTE',
              'DESCRICAO_PRODUTO',
              'QUANTIDADE',
              'QTDE_EMBARC',
              'QTDE_TON',
              'QTDE_EMBARC_TON',
              'SALDO',
              'SALDO_TON',
              'DEVOLUCAO',
              'STATUS',
            ],
          },
          'oracle',
        ),
        this.sqlQueryService.executeView<EmbarqueRow>(
          {
            viewName: 'AGNEW.INSTRUCAO_EMBARQUE',
            columns: [
              'SEQ_PLA_INSTRUCAO',
              'SEQ_PLA_CONTRATO',
              'NR_INSTRUCAO',
              'COD_SAFRA',
              'DATA_INSTRUCAO',
              'QUANTIDADE',
              'FARDOS',
              'CLIENTE_DESTINO',
              'CUMPRIDA',
              'CANCELADO',
            ],
          },
          'oracle',
        ),
      ]);

      if (
        plantio.length === 0 &&
        colheita.length === 0 &&
        contratos.length === 0 &&
        embarques.length === 0
      ) {
        return this.getFallbackDataset();
      }

      return this.limitDatasetToLastTwelveMonths({ plantio, colheita, contratos, embarques });
    } catch (error) {
      this.logger.warn(
        `Falha ao consultar Oracle para dashboard: ${error instanceof Error ? error.message : 'erro desconhecido'}`,
      );
      return this.getFallbackDataset();
    }
  }

  private getFallbackDataset(): OracleDashboardDataset {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const monthDates = getTrailingMonthDates(currentDate, this.rangeMonths);

    return {
      plantio: monthDates.map((date, index) => ({
        DESCRICAO_SAFRA: `${date.getFullYear()}/${date.getFullYear() + 1}`,
        DESC_FAZENDA: index % 2 === 0 ? 'Fazenda Ceu Azul' : 'Fazenda Novo Horizonte',
        NUMERO_TALHAO: `P-${String(index + 1).padStart(2, '0')}`,
        DESC_VARIEDADE: index % 3 === 0 ? 'FM 911' : index % 3 === 1 ? 'FM 945' : 'NS75',
        DESC_CULTURA: index % 4 === 0 ? 'Milho' : 'Algodao',
        QTD_HA_EFETIVO: 24 + index * 3.75,
        DATA_PLANTIO: new Date(date.getFullYear(), date.getMonth(), 10 + (index % 10)),
      })),
      colheita: monthDates.map((date, index) => ({
        DESCRICAO_SAFRA: `${date.getFullYear()}/${date.getFullYear() + 1}`,
        DESC_FAZENDA: index % 2 === 0 ? 'Fazenda Herminia' : 'Fazenda Santa Luzia',
        NUMERO_TALHAO: `C-${String(index + 1).padStart(2, '0')}`,
        DESC_VARIEDADE: index % 2 === 0 ? '8010 VIP' : 'FM 985',
        DESC_CULTURA: index % 3 === 0 ? 'Milho' : 'Algodao',
        QTD_HA_EFETIVO: 18 + index * 2.9,
        DATA_LANCAMENTO: new Date(date.getFullYear(), date.getMonth(), 12 + (index % 8)),
      })),
      contratos: [
        {
          SEQ_PLA_CONTRATO: '25040802',
          NOME_CLIENTE: 'Clodoveu Franciosi',
          DESCRICAO_PRODUTO: 'Soja em Graos',
          QUANTIDADE: 250000,
          QTDE_EMBARC: 36420,
          QTDE_TON: 250,
          QTDE_EMBARC_TON: 36.42,
          SALDO: 213580,
          SALDO_TON: 213.58,
          DEVOLUCAO: 0,
          STATUS: 'A',
        },
        {
          SEQ_PLA_CONTRATO: '29046702',
          NOME_CLIENTE: 'Rogerio Augusto Franciosi',
          DESCRICAO_PRODUTO: 'Soja em Graos',
          QUANTIDADE: 250000,
          QTDE_EMBARC: 0,
          QTDE_TON: 250,
          QTDE_EMBARC_TON: 0,
          SALDO: 250000,
          SALDO_TON: 250,
          DEVOLUCAO: 0,
          STATUS: 'C',
        },
        {
          SEQ_PLA_CONTRATO: '17526302',
          NOME_CLIENTE: 'Agricola Ferrari Ltda',
          DESCRICAO_PRODUTO: 'Painco em Graos Preto',
          QUANTIDADE: 150000,
          QTDE_EMBARC: 35707,
          QTDE_TON: 150,
          QTDE_EMBARC_TON: 35.707,
          SALDO: 114293,
          SALDO_TON: 114.293,
          DEVOLUCAO: 0,
          STATUS: 'A',
        },
      ],
      embarques: monthDates.map((date, index) => ({
        SEQ_PLA_INSTRUCAO: `7331${String(index + 1).padStart(3, '0')}`,
        SEQ_PLA_CONTRATO: `7328${String((index % 4) + 1).padStart(3, '0')}`,
        NR_INSTRUCAO: `INST-${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        COD_SAFRA: currentYear,
        DATA_INSTRUCAO: new Date(date.getFullYear(), date.getMonth(), 5 + (index % 12)),
        QUANTIDADE: 45000 + index * 2000,
        FARDOS: 180 + index * 12,
        CLIENTE_DESTINO: index % 2 === 0 ? 'Destino 1' : 'Destino 2',
        CUMPRIDA: 'N',
        CANCELADO: 'N',
      })),
    };
  }

  private limitDatasetToLastTwelveMonths(dataset: OracleDashboardDataset): OracleDashboardDataset {
    const range = getLastMonthsRange(this.rangeMonths);

    return {
      plantio: filterRowsByDateRange(dataset.plantio, (row) => row.DATA_PLANTIO, range),
      colheita: filterRowsByDateRange(dataset.colheita, (row) => row.DATA_LANCAMENTO, range),
      contratos: dataset.contratos,
      embarques: filterRowsByDateRange(dataset.embarques, (row) => row.DATA_INSTRUCAO, range),
    };
  }
}

const KPI_DEFINITIONS: DashboardKpiDefinition[] = [
  {
    id: 'producao-plantio-area',
    title: 'Area plantada',
    businessArea: 'producao',
    unit: 'number',
    getValue: (dataset) => sumBy(dataset.plantio, (row) => toNumber(row.QTD_HA_EFETIVO)),
    getPreviousValue: (dataset, currentValue) =>
      getPreviousPeriodValue(
        dataset.plantio,
        (row) => row.DATA_PLANTIO,
        (row) => toNumber(row.QTD_HA_EFETIVO),
        currentValue,
      ),
    drilldownDimensions: [
      {
        dimension: 'fazenda',
        label: 'Fazenda',
        getRows: (dataset) =>
          buildGroupedRows(
            groupSumBy(
              dataset.plantio,
              (row) => normalizeLabel(row.DESC_FAZENDA),
              (row) => toNumber(row.QTD_HA_EFETIVO),
            ),
          ),
      },
      {
        dimension: 'cultura',
        label: 'Cultura',
        getRows: (dataset) =>
          buildGroupedRows(
            groupSumBy(
              dataset.plantio,
              (row) => normalizeLabel(row.DESC_CULTURA),
              (row) => toNumber(row.QTD_HA_EFETIVO),
            ),
          ),
      },
      {
        dimension: 'variedade',
        label: 'Variedade',
        getRows: (dataset) =>
          buildGroupedRows(
            groupSumBy(
              dataset.plantio,
              (row) => normalizeLabel(row.DESC_VARIEDADE),
              (row) => toNumber(row.QTD_HA_EFETIVO),
            ),
          ),
      },
      {
        dimension: 'safra',
        label: 'Safra',
        getRows: (dataset) =>
          buildGroupedRows(
            groupSumBy(
              dataset.plantio,
              (row) => normalizeLabel(row.DESCRICAO_SAFRA),
              (row) => toNumber(row.QTD_HA_EFETIVO),
            ),
          ),
      },
      {
        dimension: 'tempo',
        label: 'Tempo',
        getRows: (dataset) =>
          buildTimelineRows(
            groupMonthlySum(
              dataset.plantio,
              (row) => row.DATA_PLANTIO,
              (row) => toNumber(row.QTD_HA_EFETIVO),
            ),
          ),
      },
    ],
    getHistory: (dataset, currentValue) =>
      buildHistoryFromTimeline(
        groupMonthlySum(
          dataset.plantio,
          (row) => row.DATA_PLANTIO,
          (row) => toNumber(row.QTD_HA_EFETIVO),
        ),
        currentValue,
      ),
    getHistoryGranularity: () => 'monthly',
  },
  {
    id: 'producao-operacoes-plantio',
    title: 'Operacoes de plantio',
    businessArea: 'producao',
    unit: 'number',
    getValue: (dataset) => dataset.plantio.length,
    getPreviousValue: (dataset, currentValue) =>
      getPreviousPeriodCount(dataset.plantio, (row) => row.DATA_PLANTIO, currentValue),
    drilldownDimensions: [
      {
        dimension: 'cultura',
        label: 'Cultura',
        getRows: (dataset) =>
          buildGroupedRows(
            groupCountBy(dataset.plantio, (row) => normalizeLabel(row.DESC_CULTURA)),
          ),
      },
      {
        dimension: 'fazenda',
        label: 'Fazenda',
        getRows: (dataset) =>
          buildGroupedRows(
            groupCountBy(dataset.plantio, (row) => normalizeLabel(row.DESC_FAZENDA)),
          ),
      },
      {
        dimension: 'variedade',
        label: 'Variedade',
        getRows: (dataset) =>
          buildGroupedRows(
            groupCountBy(dataset.plantio, (row) => normalizeLabel(row.DESC_VARIEDADE)),
          ),
      },
      {
        dimension: 'safra',
        label: 'Safra',
        getRows: (dataset) =>
          buildGroupedRows(
            groupCountBy(dataset.plantio, (row) => normalizeLabel(row.DESCRICAO_SAFRA)),
          ),
      },
      {
        dimension: 'tempo',
        label: 'Tempo',
        getRows: (dataset) =>
          buildTimelineRows(groupMonthlyCount(dataset.plantio, (row) => row.DATA_PLANTIO)),
      },
    ],
    getHistory: (dataset, currentValue) =>
      buildHistoryFromTimeline(
        groupMonthlyCount(dataset.plantio, (row) => row.DATA_PLANTIO),
        currentValue,
      ),
    getHistoryGranularity: () => 'monthly',
  },
  {
    id: 'producao-colheita-area',
    title: 'Area colhida',
    businessArea: 'producao',
    unit: 'number',
    getValue: (dataset) => sumBy(dataset.colheita, (row) => toNumber(row.QTD_HA_EFETIVO)),
    getPreviousValue: (dataset, currentValue) =>
      getPreviousPeriodValue(
        dataset.colheita,
        (row) => row.DATA_LANCAMENTO,
        (row) => toNumber(row.QTD_HA_EFETIVO),
        currentValue,
      ),
    drilldownDimensions: [
      {
        dimension: 'fazenda',
        label: 'Fazenda',
        getRows: (dataset) =>
          buildGroupedRows(
            groupSumBy(
              dataset.colheita,
              (row) => normalizeLabel(row.DESC_FAZENDA),
              (row) => toNumber(row.QTD_HA_EFETIVO),
            ),
          ),
      },
      {
        dimension: 'cultura',
        label: 'Cultura',
        getRows: (dataset) =>
          buildGroupedRows(
            groupSumBy(
              dataset.colheita,
              (row) => normalizeLabel(row.DESC_CULTURA),
              (row) => toNumber(row.QTD_HA_EFETIVO),
            ),
          ),
      },
      {
        dimension: 'variedade',
        label: 'Variedade',
        getRows: (dataset) =>
          buildGroupedRows(
            groupSumBy(
              dataset.colheita,
              (row) => normalizeLabel(row.DESC_VARIEDADE),
              (row) => toNumber(row.QTD_HA_EFETIVO),
            ),
          ),
      },
      {
        dimension: 'safra',
        label: 'Safra',
        getRows: (dataset) =>
          buildGroupedRows(
            groupSumBy(
              dataset.colheita,
              (row) => normalizeLabel(row.DESCRICAO_SAFRA),
              (row) => toNumber(row.QTD_HA_EFETIVO),
            ),
          ),
      },
      {
        dimension: 'tempo',
        label: 'Tempo',
        getRows: (dataset) =>
          buildTimelineRows(
            groupMonthlySum(
              dataset.colheita,
              (row) => row.DATA_LANCAMENTO,
              (row) => toNumber(row.QTD_HA_EFETIVO),
            ),
          ),
      },
    ],
    getHistory: (dataset, currentValue) =>
      buildHistoryFromTimeline(
        groupMonthlySum(
          dataset.colheita,
          (row) => row.DATA_LANCAMENTO,
          (row) => toNumber(row.QTD_HA_EFETIVO),
        ),
        currentValue,
      ),
    getHistoryGranularity: () => 'monthly',
  },
  {
    id: 'producao-variedades',
    title: 'Variedades plantadas',
    businessArea: 'producao',
    unit: 'number',
    getValue: (dataset) =>
      countDistinct(dataset.plantio, (row) => normalizeLabel(row.DESC_VARIEDADE)),
    getPreviousValue: (_, currentValue) => fallbackPreviousValue(currentValue),
    drilldownDimensions: [
      {
        dimension: 'variedade',
        label: 'Variedade',
        getRows: (dataset) =>
          buildGroupedRows(
            groupCountBy(dataset.plantio, (row) => normalizeLabel(row.DESC_VARIEDADE)),
          ),
      },
      {
        dimension: 'fazenda',
        label: 'Fazenda',
        getRows: (dataset) =>
          buildGroupedRows(
            groupCountBy(dataset.plantio, (row) => normalizeLabel(row.DESC_FAZENDA)),
          ),
      },
      {
        dimension: 'cultura',
        label: 'Cultura',
        getRows: (dataset) =>
          buildGroupedRows(
            groupCountBy(dataset.plantio, (row) => normalizeLabel(row.DESC_CULTURA)),
          ),
      },
      {
        dimension: 'safra',
        label: 'Safra',
        getRows: (dataset) =>
          buildGroupedRows(
            groupCountBy(dataset.plantio, (row) => normalizeLabel(row.DESCRICAO_SAFRA)),
          ),
      },
      {
        dimension: 'tempo',
        label: 'Tempo',
        getRows: (dataset) =>
          buildTimelineRows(groupMonthlyCount(dataset.plantio, (row) => row.DATA_PLANTIO)),
      },
    ],
    getHistory: (dataset, currentValue) =>
      buildHistoryFromTimeline(
        groupMonthlyDistinctCount(
          dataset.plantio,
          (row) => row.DATA_PLANTIO,
          (row) => normalizeLabel(row.DESC_VARIEDADE),
        ),
        currentValue,
      ),
    getHistoryGranularity: () => 'monthly',
  },
  {
    id: 'producao-talhoes',
    title: 'Talhoes monitorados',
    businessArea: 'producao',
    unit: 'number',
    getValue: (dataset) =>
      countDistinct(dataset.plantio, (row) => normalizeLabel(row.NUMERO_TALHAO)),
    getPreviousValue: (_, currentValue) => fallbackPreviousValue(currentValue),
    drilldownDimensions: [
      {
        dimension: 'fazenda',
        label: 'Fazenda',
        getRows: (dataset) =>
          buildGroupedRows(
            groupCountBy(dataset.plantio, (row) => normalizeLabel(row.DESC_FAZENDA)),
          ),
      },
      {
        dimension: 'cultura',
        label: 'Cultura',
        getRows: (dataset) =>
          buildGroupedRows(
            groupCountBy(dataset.plantio, (row) => normalizeLabel(row.DESC_CULTURA)),
          ),
      },
      {
        dimension: 'variedade',
        label: 'Variedade',
        getRows: (dataset) =>
          buildGroupedRows(
            groupCountBy(dataset.plantio, (row) => normalizeLabel(row.DESC_VARIEDADE)),
          ),
      },
      {
        dimension: 'safra',
        label: 'Safra',
        getRows: (dataset) =>
          buildGroupedRows(
            groupCountBy(dataset.plantio, (row) => normalizeLabel(row.DESCRICAO_SAFRA)),
          ),
      },
      {
        dimension: 'tempo',
        label: 'Tempo',
        getRows: (dataset) =>
          buildTimelineRows(groupMonthlyCount(dataset.plantio, (row) => row.DATA_PLANTIO)),
      },
    ],
    getHistory: (dataset, currentValue) =>
      buildHistoryFromTimeline(
        groupMonthlyDistinctCount(
          dataset.plantio,
          (row) => row.DATA_PLANTIO,
          (row) => normalizeLabel(row.NUMERO_TALHAO),
        ),
        currentValue,
      ),
    getHistoryGranularity: () => 'monthly',
  },
  {
    id: 'comercial-contratos',
    title: 'Contratos comerciais',
    businessArea: 'comercial',
    unit: 'number',
    getValue: (dataset) =>
      countDistinct(dataset.contratos, (row) => normalizeLabel(row.SEQ_PLA_CONTRATO)),
    getPreviousValue: (_, currentValue) => fallbackPreviousValue(currentValue),
    drilldownDimensions: [
      {
        dimension: 'cliente',
        label: 'Cliente',
        getRows: (dataset) =>
          buildGroupedRows(
            groupDistinctCountBy(
              dataset.contratos,
              (row) => normalizeLabel(row.NOME_CLIENTE),
              (row) => normalizeLabel(row.SEQ_PLA_CONTRATO),
            ),
          ),
      },
      {
        dimension: 'produto',
        label: 'Produto',
        getRows: (dataset) =>
          buildGroupedRows(
            groupDistinctCountBy(
              dataset.contratos,
              (row) => normalizeLabel(row.DESCRICAO_PRODUTO),
              (row) => normalizeLabel(row.SEQ_PLA_CONTRATO),
            ),
          ),
      },
      {
        dimension: 'status',
        label: 'Status',
        getRows: (dataset) =>
          buildGroupedRows(
            groupDistinctCountBy(
              dataset.contratos,
              (row) => normalizeLabel(row.STATUS),
              (row) => normalizeLabel(row.SEQ_PLA_CONTRATO),
            ),
          ),
      },
    ],
    getHistory: (dataset, currentValue) =>
      buildAnnualComparativeHistory(
        groupAnnualDistinctCount(dataset.contratos, (row) => normalizeLabel(row.SEQ_PLA_CONTRATO)),
        currentValue,
      ),
    getHistoryGranularity: () => 'annual-comparative',
  },
  {
    id: 'comercial-quantidade-entregue',
    title: 'Quantidade entregue',
    businessArea: 'comercial',
    unit: 'number',
    getValue: (dataset) =>
      sumBy(dataset.contratos, (row) => firstNonZero(row.QTDE_EMBARC_TON, row.QTDE_EMBARC)),
    getPreviousValue: (_, currentValue) => fallbackPreviousValue(currentValue),
    drilldownDimensions: [
      {
        dimension: 'produto',
        label: 'Produto',
        getRows: (dataset) =>
          buildGroupedRows(
            groupSumBy(
              dataset.contratos,
              (row) => normalizeLabel(row.DESCRICAO_PRODUTO),
              (row) => firstNonZero(row.QTDE_EMBARC_TON, row.QTDE_EMBARC),
            ),
          ),
      },
      {
        dimension: 'cliente',
        label: 'Cliente',
        getRows: (dataset) =>
          buildGroupedRows(
            groupSumBy(
              dataset.contratos,
              (row) => normalizeLabel(row.NOME_CLIENTE),
              (row) => firstNonZero(row.QTDE_EMBARC_TON, row.QTDE_EMBARC),
            ),
          ),
      },
      {
        dimension: 'status',
        label: 'Status',
        getRows: (dataset) =>
          buildGroupedRows(
            groupSumBy(
              dataset.contratos,
              (row) => normalizeLabel(row.STATUS),
              (row) => firstNonZero(row.QTDE_EMBARC_TON, row.QTDE_EMBARC),
            ),
          ),
      },
    ],
    getHistory: (dataset, currentValue) =>
      buildAnnualComparativeHistory(
        groupAnnualSum(dataset.contratos, (row) =>
          firstNonZero(row.QTDE_EMBARC_TON, row.QTDE_EMBARC),
        ),
        currentValue,
      ),
    getHistoryGranularity: () => 'annual-comparative',
  },
  {
    id: 'comercial-quantidade-pendente',
    title: 'Quantidade pendente',
    businessArea: 'comercial',
    unit: 'number',
    getValue: (dataset) =>
      sumBy(dataset.contratos, (row) => firstNonZero(row.SALDO_TON, row.SALDO)),
    getPreviousValue: (_, currentValue) => fallbackPreviousValue(currentValue),
    drilldownDimensions: [
      {
        dimension: 'cliente',
        label: 'Cliente',
        getRows: (dataset) =>
          buildGroupedRows(
            groupSumBy(
              dataset.contratos,
              (row) => normalizeLabel(row.NOME_CLIENTE),
              (row) => firstNonZero(row.SALDO_TON, row.SALDO),
            ),
          ),
      },
      {
        dimension: 'produto',
        label: 'Produto',
        getRows: (dataset) =>
          buildGroupedRows(
            groupSumBy(
              dataset.contratos,
              (row) => normalizeLabel(row.DESCRICAO_PRODUTO),
              (row) => firstNonZero(row.SALDO_TON, row.SALDO),
            ),
          ),
      },
      {
        dimension: 'status',
        label: 'Status',
        getRows: (dataset) =>
          buildGroupedRows(
            groupSumBy(
              dataset.contratos,
              (row) => normalizeLabel(row.STATUS),
              (row) => firstNonZero(row.SALDO_TON, row.SALDO),
            ),
          ),
      },
    ],
    getHistory: (dataset, currentValue) =>
      buildAnnualComparativeHistory(
        groupAnnualSum(dataset.contratos, (row) => firstNonZero(row.SALDO_TON, row.SALDO)),
        currentValue,
      ),
    getHistoryGranularity: () => 'annual-comparative',
  },
  {
    id: 'comercial-quantidade-devolvida',
    title: 'Quantidade devolvida',
    businessArea: 'comercial',
    unit: 'number',
    getValue: (dataset) => sumBy(dataset.contratos, (row) => toNumber(row.DEVOLUCAO)),
    getPreviousValue: (_, currentValue) => fallbackPreviousValue(currentValue),
    drilldownDimensions: [
      {
        dimension: 'produto',
        label: 'Produto',
        getRows: (dataset) =>
          buildGroupedRows(
            groupSumBy(
              dataset.contratos,
              (row) => normalizeLabel(row.DESCRICAO_PRODUTO),
              (row) => toNumber(row.DEVOLUCAO),
            ),
          ),
      },
      {
        dimension: 'cliente',
        label: 'Cliente',
        getRows: (dataset) =>
          buildGroupedRows(
            groupSumBy(
              dataset.contratos,
              (row) => normalizeLabel(row.NOME_CLIENTE),
              (row) => toNumber(row.DEVOLUCAO),
            ),
          ),
      },
      {
        dimension: 'status',
        label: 'Status',
        getRows: (dataset) =>
          buildGroupedRows(
            groupSumBy(
              dataset.contratos,
              (row) => normalizeLabel(row.STATUS),
              (row) => toNumber(row.DEVOLUCAO),
            ),
          ),
      },
    ],
    getHistory: (dataset, currentValue) =>
      buildAnnualComparativeHistory(
        groupAnnualSum(dataset.contratos, (row) => toNumber(row.DEVOLUCAO)),
        currentValue,
      ),
    getHistoryGranularity: () => 'annual-comparative',
  },
  {
    id: 'algodoeira-contratos',
    title: 'Contratos da algodoeira',
    businessArea: 'algodoeira',
    unit: 'number',
    getValue: (dataset) =>
      countDistinct(dataset.embarques, (row) => normalizeLabel(row.SEQ_PLA_CONTRATO)),
    getPreviousValue: (dataset, currentValue) =>
      getPreviousPeriodDistinctCount(
        dataset.embarques,
        (row) => row.DATA_INSTRUCAO,
        (row) => normalizeLabel(row.SEQ_PLA_CONTRATO),
        currentValue,
      ),
    drilldownDimensions: [
      {
        dimension: 'safra',
        label: 'Safra',
        getRows: (dataset) =>
          buildGroupedRows(
            groupDistinctCountBy(
              dataset.embarques,
              (row) => String(row.COD_SAFRA ?? 'Sem safra'),
              (row) => normalizeLabel(row.SEQ_PLA_CONTRATO),
            ),
          ),
      },
      {
        dimension: 'cliente',
        label: 'Cliente',
        getRows: (dataset) =>
          buildGroupedRows(
            groupDistinctCountBy(
              dataset.embarques,
              (row) => normalizeLabel(row.CLIENTE_DESTINO),
              (row) => normalizeLabel(row.SEQ_PLA_CONTRATO),
            ),
          ),
      },
      {
        dimension: 'tempo',
        label: 'Tempo',
        getRows: (dataset) =>
          buildTimelineRows(
            groupMonthlyDistinctCount(
              dataset.embarques,
              (row) => row.DATA_INSTRUCAO,
              (row) => normalizeLabel(row.SEQ_PLA_CONTRATO),
            ),
          ),
      },
    ],
    getHistory: (dataset, currentValue) =>
      buildHistoryFromTimeline(
        groupMonthlyDistinctCount(
          dataset.embarques,
          (row) => row.DATA_INSTRUCAO,
          (row) => normalizeLabel(row.SEQ_PLA_CONTRATO),
        ),
        currentValue,
      ),
    getHistoryGranularity: () => 'monthly',
  },
  {
    id: 'algodoeira-embarques',
    title: 'Embarques programados',
    businessArea: 'algodoeira',
    unit: 'number',
    getValue: (dataset) => dataset.embarques.length,
    getPreviousValue: (dataset, currentValue) =>
      getPreviousPeriodCount(dataset.embarques, (row) => row.DATA_INSTRUCAO, currentValue),
    drilldownDimensions: [
      {
        dimension: 'safra',
        label: 'Safra',
        getRows: (dataset) =>
          buildGroupedRows(
            groupCountBy(dataset.embarques, (row) => String(row.COD_SAFRA ?? 'Sem safra')),
          ),
      },
      {
        dimension: 'cliente',
        label: 'Cliente',
        getRows: (dataset) =>
          buildGroupedRows(
            groupCountBy(dataset.embarques, (row) => normalizeLabel(row.CLIENTE_DESTINO)),
          ),
      },
      {
        dimension: 'tempo',
        label: 'Tempo',
        getRows: (dataset) =>
          buildTimelineRows(groupMonthlyCount(dataset.embarques, (row) => row.DATA_INSTRUCAO)),
      },
    ],
    getHistory: (dataset, currentValue) =>
      buildHistoryFromTimeline(
        groupMonthlyCount(dataset.embarques, (row) => row.DATA_INSTRUCAO),
        currentValue,
      ),
    getHistoryGranularity: () => 'monthly',
  },
  {
    id: 'algodoeira-fardos',
    title: 'Producao de fardos',
    businessArea: 'algodoeira',
    unit: 'number',
    getValue: (dataset) => sumBy(dataset.embarques, (row) => toNumber(row.FARDOS)),
    getPreviousValue: (dataset, currentValue) =>
      getPreviousPeriodValue(
        dataset.embarques,
        (row) => row.DATA_INSTRUCAO,
        (row) => toNumber(row.FARDOS),
        currentValue,
      ),
    drilldownDimensions: [
      {
        dimension: 'safra',
        label: 'Safra',
        getRows: (dataset) =>
          buildGroupedRows(
            groupSumBy(
              dataset.embarques,
              (row) => String(row.COD_SAFRA ?? 'Sem safra'),
              (row) => toNumber(row.FARDOS),
            ),
          ),
      },
      {
        dimension: 'cliente',
        label: 'Cliente',
        getRows: (dataset) =>
          buildGroupedRows(
            groupSumBy(
              dataset.embarques,
              (row) => normalizeLabel(row.CLIENTE_DESTINO),
              (row) => toNumber(row.FARDOS),
            ),
          ),
      },
      {
        dimension: 'tempo',
        label: 'Tempo',
        getRows: (dataset) =>
          buildTimelineRows(
            groupMonthlySum(
              dataset.embarques,
              (row) => row.DATA_INSTRUCAO,
              (row) => toNumber(row.FARDOS),
            ),
          ),
      },
    ],
    getHistory: (dataset, currentValue) =>
      buildHistoryFromTimeline(
        groupMonthlySum(
          dataset.embarques,
          (row) => row.DATA_INSTRUCAO,
          (row) => toNumber(row.FARDOS),
        ),
        currentValue,
      ),
    getHistoryGranularity: () => 'monthly',
  },
];

function buildDashboardHome(kpis: DashboardKpi[]): DashboardHomeResponse {
  const sectorSummaries = aggregateKpisBySector(kpis);
  const businessAreas = aggregateKpisByBusinessArea(kpis);
  const totalSectors = new Set(kpis.map((kpi) => kpi.businessArea)).size;
  const averageDelta =
    kpis.length > 0
      ? round(
          kpis.reduce((sum, kpi) => sum + calculateKpiDelta(kpi.value, kpi.previousValue), 0) /
            kpis.length,
        )
      : 0;

  return {
    summary: {
      totalKpis: kpis.length,
      totalSectors,
      averageDelta,
    },
    kpis,
    businessAreas,
    sectorSummaries,
    charts: {
      sectorDistribution: sectorSummaries,
      kpiPerformance: kpis.map((kpi) => ({
        id: kpi.id,
        title: kpi.title,
        businessArea: kpi.businessArea,
        sector: kpi.sector,
        value: kpi.value,
        previousValue: kpi.previousValue,
        delta: calculateKpiDelta(kpi.value, kpi.previousValue),
      })),
    },
    availableDrilldowns: kpis.map((kpi) => {
      const definition = KPI_DEFINITIONS.find((d) => d.id === kpi.id);
      return {
        kpiId: kpi.id,
        label: kpi.title,
        dimensions: definition
          ? definition.drilldownDimensions.map((d) => ({
              dimension: d.dimension,
              label: d.label,
            }))
          : [],
      };
    }),
  };
}

function aggregateKpisBySector(kpis: DashboardKpi[]): DashboardSectorSummary[] {
  const bySector = kpis.reduce<Record<string, { total: number; deltaSum: number }>>((acc, kpi) => {
    const delta = calculateKpiDelta(kpi.value, kpi.previousValue);

    if (!acc[kpi.sector]) {
      acc[kpi.sector] = { total: 0, deltaSum: 0 };
    }

    acc[kpi.sector]!.total += 1;
    acc[kpi.sector]!.deltaSum += delta;

    return acc;
  }, {});

  return Object.entries(bySector).map(([sector, summary]) => ({
    sector,
    total: summary.total,
    averageDelta: round(summary.deltaSum / summary.total),
  }));
}

function aggregateKpisByBusinessArea(kpis: DashboardKpi[]): DashboardBusinessAreaSummary[] {
  const byArea = kpis.reduce<Record<BusinessArea, { total: number; deltaSum: number }>>(
    (acc, kpi) => {
      const delta = calculateKpiDelta(kpi.value, kpi.previousValue);
      const current = acc[kpi.businessArea] ?? { total: 0, deltaSum: 0 };

      current.total += 1;
      current.deltaSum += delta;
      acc[kpi.businessArea] = current;

      return acc;
    },
    {} as Record<BusinessArea, { total: number; deltaSum: number }>,
  );

  return (Object.keys(BUSINESS_AREA_LABEL) as BusinessArea[]).map((businessArea) => {
    const current = byArea[businessArea] ?? { total: 0, deltaSum: 0 };

    return {
      businessArea,
      label: BUSINESS_AREA_LABEL[businessArea],
      total: current.total,
      averageDelta: current.total > 0 ? round(current.deltaSum / current.total) : 0,
    };
  });
}

function groupMonthlySum<T>(
  rows: T[],
  getDate: (row: T) => string | Date | null | undefined,
  getValue: (row: T) => number,
) {
  const grouped = new Map<string, number>();

  for (const row of rows) {
    const period = toPeriodLabel(getDate(row));
    if (!period) {
      continue;
    }

    grouped.set(period, round((grouped.get(period) ?? 0) + getValue(row)));
  }

  return Array.from(grouped.entries()).map(([period, value]) => ({ period, value }));
}

function groupMonthlyCount<T>(rows: T[], getDate: (row: T) => string | Date | null | undefined) {
  return groupMonthlySum(rows, getDate, () => 1);
}

function groupMonthlyDistinctCount<T>(
  rows: T[],
  getDate: (row: T) => string | Date | null | undefined,
  getKey: (row: T) => string,
) {
  const grouped = new Map<string, Set<string>>();

  for (const row of rows) {
    const period = toPeriodLabel(getDate(row));
    const key = getKey(row);
    if (!period || !key) {
      continue;
    }

    if (!grouped.has(period)) {
      grouped.set(period, new Set<string>());
    }
    grouped.get(period)!.add(key);
  }

  return Array.from(grouped.entries()).map(([period, items]) => ({ period, value: items.size }));
}

function groupAnnualSum<T>(rows: T[], getValue: (row: T) => number) {
  return [
    {
      period: String(new Date().getFullYear()),
      value: round(sumBy(rows, getValue)),
    },
  ];
}

function groupAnnualDistinctCount<T>(rows: T[], getKey: (row: T) => string) {
  return [
    {
      period: String(new Date().getFullYear()),
      value: countDistinct(rows, getKey),
    },
  ];
}

function buildHistoryFromTimeline(
  periods: Array<{ period: string; value: number }>,
  currentValue: number,
): KpiHistoryItem[] {
  const sanitized = periods
    .filter((item) => item.period)
    .sort((left, right) => comparePeriodLabels(left.period, right.period))
    .slice(-12);

  if (sanitized.length === 0) {
    return buildFallbackHistory(currentValue);
  }

  const rows = sanitized.map((item, index) => {
    const previousValue = index > 0 ? sanitized[index - 1]!.value : 0;

    return {
      period: item.period,
      value: round(item.value),
      previousValue: round(previousValue),
      delta: calculateKpiDelta(item.value, previousValue),
    };
  });

  return rows.length > 0 ? rows : buildFallbackHistory(currentValue);
}

function buildAnnualComparativeHistory(
  periods: Array<{ period: string; value: number }>,
  currentValue: number,
): KpiHistoryItem[] {
  const sanitized = periods
    .filter((item) => item.period)
    .sort((left, right) => Number(left.period) - Number(right.period));

  if (sanitized.length === 0) {
    return buildFallbackHistory(currentValue);
  }

  return sanitized.map((item, index) => {
    const previousValue = index > 0 ? sanitized[index - 1]!.value : 0;

    return {
      period: item.period,
      value: round(item.value),
      previousValue: round(previousValue),
      delta: calculateKpiDelta(item.value, previousValue),
    };
  });
}

function buildFallbackHistory(currentValue: number): KpiHistoryItem[] {
  const previousValue = fallbackPreviousValue(currentValue);

  return [
    {
      period: 'Anterior',
      value: previousValue,
      previousValue: previousValue,
      delta: 0,
    },
    {
      period: 'Atual',
      value: round(currentValue),
      previousValue,
      delta: calculateKpiDelta(currentValue, previousValue),
    },
  ];
}

function getPreviousPeriodValue<T>(
  rows: T[],
  getDate: (row: T) => string | Date | null | undefined,
  getValue: (row: T) => number,
  currentValue: number,
) {
  const timeline = groupMonthlySum(rows, getDate, getValue);
  return timeline.length > 1
    ? round(timeline[timeline.length - 2]!.value)
    : fallbackPreviousValue(currentValue);
}

function getPreviousPeriodCount<T>(
  rows: T[],
  getDate: (row: T) => string | Date | null | undefined,
  currentValue: number,
) {
  const timeline = groupMonthlyCount(rows, getDate);
  return timeline.length > 1
    ? round(timeline[timeline.length - 2]!.value)
    : fallbackPreviousValue(currentValue);
}

function getPreviousPeriodDistinctCount<T>(
  rows: T[],
  getDate: (row: T) => string | Date | null | undefined,
  getKey: (row: T) => string,
  currentValue: number,
) {
  const timeline = groupMonthlyDistinctCount(rows, getDate, getKey);
  return timeline.length > 1
    ? round(timeline[timeline.length - 2]!.value)
    : fallbackPreviousValue(currentValue);
}

function groupSumBy<T>(rows: T[], getLabel: (row: T) => string, getValue: (row: T) => number) {
  const grouped = new Map<string, number>();

  for (const row of rows) {
    const label = getLabel(row);
    if (!label) {
      continue;
    }
    grouped.set(label, round((grouped.get(label) ?? 0) + getValue(row)));
  }

  return grouped;
}

function groupCountBy<T>(rows: T[], getLabel: (row: T) => string) {
  return groupSumBy(rows, getLabel, () => 1);
}

function groupDistinctCountBy<T>(
  rows: T[],
  getLabel: (row: T) => string,
  getKey: (row: T) => string,
) {
  const grouped = new Map<string, Set<string>>();

  for (const row of rows) {
    const label = getLabel(row);
    const key = getKey(row);
    if (!label || !key) {
      continue;
    }

    if (!grouped.has(label)) {
      grouped.set(label, new Set<string>());
    }

    grouped.get(label)!.add(key);
  }

  return new Map(Array.from(grouped.entries()).map(([label, values]) => [label, values.size]));
}

function buildGroupedRows(grouped: Map<string, number>): DashboardDrilldownResponse['rows'] {
  const rows = Array.from(grouped.entries())
    .map(([period, value]) => ({ period, value: round(value) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  let previousValue = 0;

  return rows.map((row) => {
    const delta = calculateKpiDelta(row.value, previousValue);
    previousValue = row.value;

    return {
      period: row.period,
      value: row.value,
      delta,
    };
  });
}

function buildTimelineRows(
  periods: Array<{ period: string; value: number }>,
): DashboardDrilldownResponse['rows'] {
  const sorted = periods
    .filter((p) => p.period)
    .sort((a, b) => comparePeriodLabels(a.period, b.period))
    .slice(-12);

  let previousValue = 0;

  return sorted.map((item) => {
    const delta = calculateKpiDelta(item.value, previousValue);
    previousValue = item.value;

    return {
      period: item.period,
      value: round(item.value),
      delta,
    };
  });
}

function countDistinct<T>(rows: T[], getKey: (row: T) => string) {
  const values = new Set<string>();
  for (const row of rows) {
    const key = getKey(row);
    if (key) {
      values.add(key);
    }
  }
  return values.size;
}

function sumBy<T>(rows: T[], getValue: (row: T) => number) {
  return rows.reduce((sum, row) => sum + getValue(row), 0);
}

function toNumber(value: unknown) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function firstNonZero(...values: unknown[]) {
  for (const value of values) {
    const numberValue = toNumber(value);
    if (numberValue !== 0) {
      return numberValue;
    }
  }

  return 0;
}

function normalizeLabel(value: unknown) {
  return String(value ?? '').trim();
}

function toPeriodLabel(value: string | Date | null | undefined) {
  if (!value) {
    return null;
  }

  const date = toDate(value);
  if (!date) {
    return null;
  }

  return `${MONTHS[date.getMonth()]}/${String(date.getFullYear()).slice(-2)}`;
}

function filterRowsByDateRange<T>(
  rows: T[],
  getDate: (row: T) => string | Date | null | undefined,
  range: { start: Date; end: Date },
) {
  return rows.filter((row) => {
    const date = toDate(getDate(row));
    return Boolean(date && date >= range.start && date <= range.end);
  });
}

function getLastMonthsRange(rangeMonths: number) {
  const currentDate = new Date();
  const start = new Date(currentDate.getFullYear(), currentDate.getMonth() - (rangeMonths - 1), 1);
  const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);

  return { start, end };
}

function getTrailingMonthDates(currentDate: Date, rangeMonths: number) {
  return Array.from({ length: rangeMonths }, (_, index) => {
    const offset = rangeMonths - index - 1;
    return new Date(currentDate.getFullYear(), currentDate.getMonth() - offset, 1);
  });
}

function toDate(value: string | Date | null | undefined) {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function comparePeriodLabels(left: string, right: string) {
  const leftDate = parsePeriodLabel(left);
  const rightDate = parsePeriodLabel(right);

  if (!leftDate || !rightDate) {
    return left.localeCompare(right);
  }

  return leftDate.getTime() - rightDate.getTime();
}

function parsePeriodLabel(value: string) {
  const [monthLabel, yearLabel] = value.split('/');
  if (!monthLabel || !yearLabel) {
    return null;
  }

  const monthIndex = MONTHS.indexOf(monthLabel);
  const fullYear = Number(`20${yearLabel}`);
  if (monthIndex < 0 || !Number.isFinite(fullYear)) {
    return null;
  }

  return new Date(fullYear, monthIndex, 1);
}

function fallbackPreviousValue(currentValue: number) {
  if (currentValue === 0) {
    return 0;
  }

  return round(currentValue * 0.9);
}

function calculateKpiDelta(value: number, previousValue = 0): number {
  if (previousValue === 0) {
    return round(value === 0 ? 0 : 100);
  }

  return round(((value - previousValue) / Math.abs(previousValue)) * 100);
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

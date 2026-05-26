import { z } from 'zod';

const dateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use o formato YYYY-MM-DD.')
  .optional()
  .or(z.literal('').transform(() => undefined));

const textSchema = z
  .string()
  .trim()
  .optional()
  .or(z.literal('').transform(() => undefined));

const parameterValueSchema = z.union([z.string().trim(), z.number(), z.boolean()]);

export const reportFiltersSchema = z
  .object({
    startDate: dateSchema,
    endDate: dateSchema,
    category: textSchema,
    sector: textSchema,
    parameters: z.record(parameterValueSchema).optional(),
  })
  .transform((filters) => ({
    ...filters,
    parameters: normalizeParameters(filters.parameters),
  }))
  .refine(
    (filters) => {
      if (!filters.startDate || !filters.endDate) {
        return true;
      }

      return filters.startDate <= filters.endDate;
    },
    {
      message: 'A data inicial nao pode ser maior que a data final.',
      path: ['startDate'],
    },
  );

export type ReportFilters = z.infer<typeof reportFiltersSchema>;

export function toReportFiltersPayload(input: unknown): ReportFilters {
  const parsed = reportFiltersSchema.parse(input);

  return removeEmptyFilters(parsed);
}

export function buildReportFiltersQueryParams(filters: ReportFilters): URLSearchParams {
  const params = new URLSearchParams();
  const payload = toReportFiltersPayload(filters);

  appendParam(params, 'startDate', payload.startDate);
  appendParam(params, 'endDate', payload.endDate);
  appendParam(params, 'category', payload.category);
  appendParam(params, 'sector', payload.sector);

  Object.entries(payload.parameters ?? {}).forEach(([key, value]) => {
    appendParam(params, `parameters[${key}]`, String(value));
  });

  return params;
}

function normalizeParameters(parameters?: Record<string, string | number | boolean>) {
  if (!parameters) {
    return undefined;
  }

  const normalized = Object.entries(parameters).reduce<Record<string, string | number | boolean>>((acc, [key, value]) => {
    if (typeof value === 'string') {
      const trimmed = value.trim();

      if (trimmed.length > 0) {
        acc[key] = trimmed;
      }

      return acc;
    }

    acc[key] = value;
    return acc;
  }, {});

  return Object.keys(normalized).length > 0 ? normalized : undefined;
}

function removeEmptyFilters(filters: ReportFilters): ReportFilters {
  const payload: ReportFilters = {};

  appendFilter(payload, 'startDate', filters.startDate);
  appendFilter(payload, 'endDate', filters.endDate);
  appendFilter(payload, 'category', filters.category);
  appendFilter(payload, 'sector', filters.sector);

  if (filters.parameters && Object.keys(filters.parameters).length > 0) {
    payload.parameters = filters.parameters;
  }

  return payload;
}

function appendFilter<TKey extends keyof ReportFilters>(payload: ReportFilters, key: TKey, value: ReportFilters[TKey]) {
  if (value !== undefined && value !== '') {
    payload[key] = value;
  }
}

function appendParam(params: URLSearchParams, key: string, value?: string) {
  if (value !== undefined && value !== '') {
    params.set(key, value);
  }
}

'use client';

import { SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from '@/components/ui';
import { type ReportFilters, toReportFiltersPayload } from '@/lib/report-filters';

type ReportAdvancedFiltersProps = {
  onApplyFilters: (filters: ReportFilters) => void;
};

type FormState = {
  startDate: string;
  endDate: string;
  category: string;
  sector: string;
  competencia: string;
};

const initialFormState: FormState = {
  startDate: '',
  endDate: '',
  category: '',
  sector: '',
  competencia: '',
};

export function ReportAdvancedFilters({ onApplyFilters }: ReportAdvancedFiltersProps) {
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function updateField(field: keyof FormState, value: string) {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = toSafePayload(formState);

    if (!result.success) {
      setErrorMessage(result.error);
      return;
    }

    setErrorMessage(null);
    onApplyFilters(result.filters);
  }

  function handleClear() {
    setFormState(initialFormState);
    setErrorMessage(null);
    onApplyFilters(toReportFiltersPayload({}));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-blue-700" aria-hidden="true" />
          Filtros avançados
        </CardTitle>
        <CardDescription>
          Refine a consulta por período, categoria, setor e parâmetros dinâmicos do relatório.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4 lg:grid-cols-[repeat(5,minmax(0,1fr))_auto]"
          onSubmit={handleSubmit}
        >
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Data inicial
            <Input
              type="date"
              value={formState.startDate}
              onChange={(event) => updateField('startDate', event.target.value)}
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Data final
            <Input
              type="date"
              value={formState.endDate}
              onChange={(event) => updateField('endDate', event.target.value)}
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Categoria
            <Input
              value={formState.category}
              onChange={(event) => updateField('category', event.target.value)}
              placeholder="dre, funil, sla"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Setor
            <Input
              value={formState.sector}
              onChange={(event) => updateField('sector', event.target.value)}
              placeholder="financeiro"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Competência
            <Input
              value={formState.competencia}
              onChange={(event) => updateField('competencia', event.target.value)}
              placeholder="2026-05"
            />
          </label>

          <div className="flex flex-col justify-end gap-2 sm:flex-row lg:flex-col">
            <Button type="submit">Aplicar filtros</Button>
            <Button type="button" variant="outline" onClick={handleClear}>
              Limpar filtros
            </Button>
          </div>

          {errorMessage ? (
            <p className="lg:col-span-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
              {errorMessage}
            </p>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}

function toSafePayload(
  formState: FormState,
): { success: true; filters: ReportFilters } | { success: false; error: string } {
  try {
    return {
      success: true,
      filters: toReportFiltersPayload({
        startDate: formState.startDate,
        endDate: formState.endDate,
        category: formState.category,
        sector: formState.sector,
        parameters: {
          competencia: formState.competencia,
        },
      }),
    };
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes('data inicial')
        ? 'A data inicial não pode ser maior que a data final.'
        : 'Revise os filtros informados.';

    return {
      success: false,
      error: message,
    };
  }
}

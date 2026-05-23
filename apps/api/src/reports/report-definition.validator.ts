import { BadRequestException } from '@nestjs/common';

import {
  CreateReportDefinitionInput,
  ReportDefinition,
  ReportParameterDefinition,
  ReportSourceType,
  UpdateReportDefinitionInput,
} from './entities/report-definition.entity';
import { validateSqlObjectName, validateSqlParameterName } from '../sql-server/sql-query-validator';

const VALID_SOURCE_TYPES = new Set<ReportSourceType>(['view', 'stored_procedure']);
const VALID_PARAMETER_TYPES = new Set(['string', 'int', 'number', 'boolean', 'date']);
const SAFE_TEXT_PATTERN = /^[\p{L}\p{N}_ .,@:/()-]+$/u;
const SAFE_KEY_PATTERN = /^[A-Za-z][A-Za-z0-9_:-]*$/;

export class ReportDefinitionValidationError extends BadRequestException {
  constructor(message: string) {
    super(message);
  }
}

export function validateCreateReportDefinition(input: CreateReportDefinitionInput): CreateReportDefinitionInput {
  const normalized = {
    name: validateRequiredText(input.name, 'nome', 120),
    description: validateRequiredText(input.description, 'descrição', 500),
    sector: validateSector(input.sector),
    sourceType: validateSourceType(input.sourceType),
    sourceName: validateSqlObjectName(input.sourceName, 'fonte SQL'),
    parameters: validateParameters(input.parameters ?? []),
    requiredPermissions: validatePermissions(input.requiredPermissions ?? []),
    isActive: input.isActive ?? true,
  };

  return normalized;
}

export function validateUpdateReportDefinition(
  current: ReportDefinition,
  input: UpdateReportDefinitionInput,
): CreateReportDefinitionInput {
  return validateCreateReportDefinition({
    name: input.name ?? current.name,
    description: input.description ?? current.description,
    sector: input.sector ?? current.sector,
    sourceType: input.sourceType ?? current.sourceType,
    sourceName: input.sourceName ?? current.sourceName,
    parameters: input.parameters ?? current.parameters,
    requiredPermissions: input.requiredPermissions ?? current.requiredPermissions,
    isActive: input.isActive ?? current.isActive,
  });
}

export function validateSector(value: string): string {
  return validateRequiredText(value, 'setor', 80).toLowerCase();
}

function validateSourceType(value: ReportSourceType): ReportSourceType {
  if (!VALID_SOURCE_TYPES.has(value)) {
    throw new ReportDefinitionValidationError('Tipo de fonte SQL inválido.');
  }

  return value;
}

function validateParameters(parameters: ReportParameterDefinition[]): ReportParameterDefinition[] {
  if (!Array.isArray(parameters)) {
    throw new ReportDefinitionValidationError('Parâmetros devem ser uma lista.');
  }

  const names = new Set<string>();

  return parameters.map((parameter) => {
    if (!parameter || typeof parameter !== 'object' || Array.isArray(parameter)) {
      throw new ReportDefinitionValidationError('Parâmetro inválido.');
    }

    const name = validateSqlParameterName(parameter.name, 'parâmetro do relatório');

    if (names.has(name)) {
      throw new ReportDefinitionValidationError(`Parâmetro duplicado: ${name}`);
    }

    names.add(name);

    if (!VALID_PARAMETER_TYPES.has(parameter.type)) {
      throw new ReportDefinitionValidationError(`Tipo de parâmetro inválido: ${name}`);
    }

    if (
      parameter.maxLength !== undefined &&
      (!Number.isInteger(parameter.maxLength) || parameter.maxLength <= 0 || parameter.maxLength > 1000)
    ) {
      throw new ReportDefinitionValidationError(`Tamanho máximo inválido para parâmetro: ${name}`);
    }

    return {
      name,
      type: parameter.type,
      required: parameter.required ?? false,
      maxLength: parameter.maxLength,
    };
  });
}

function validatePermissions(permissions: string[]): string[] {
  if (!Array.isArray(permissions)) {
    throw new ReportDefinitionValidationError('Permissões devem ser uma lista.');
  }

  const uniquePermissions = new Set<string>();

  for (const permission of permissions) {
    const safePermission = validateRequiredText(permission, 'permissão', 120);

    if (!SAFE_KEY_PATTERN.test(safePermission)) {
      throw new ReportDefinitionValidationError('Permissão inválida.');
    }

    uniquePermissions.add(safePermission);
  }

  return [...uniquePermissions];
}

function validateRequiredText(value: string, label: string, maxLength: number): string {
  if (typeof value !== 'string') {
    throw new ReportDefinitionValidationError(`${label} deve ser texto.`);
  }

  const normalizedValue = value.trim();

  if (!normalizedValue) {
    throw new ReportDefinitionValidationError(`${label} é obrigatório.`);
  }

  if (normalizedValue.length > maxLength) {
    throw new ReportDefinitionValidationError(`${label} excede o tamanho máximo.`);
  }

  if (!SAFE_TEXT_PATTERN.test(normalizedValue)) {
    throw new ReportDefinitionValidationError(`${label} contém caracteres não permitidos.`);
  }

  return normalizedValue;
}

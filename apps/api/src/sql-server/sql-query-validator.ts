export class SqlQueryValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SqlQueryValidationError';
  }
}

const SAFE_QUALIFIED_IDENTIFIER_PATTERN = /^[A-Za-z][A-Za-z0-9_]*\.[A-Za-z][A-Za-z0-9_]*$/;
const SAFE_IDENTIFIER_PATTERN = /^[A-Za-z][A-Za-z0-9_]*$/;

const FORBIDDEN_SQL_FRAGMENTS = [
  ';',
  '--',
  '/*',
  '*/',
  "'",
  '"',
  '[',
  ']',
  ' select ',
  ' insert ',
  ' update ',
  ' delete ',
  ' drop ',
  ' alter ',
  ' create ',
  ' merge ',
  ' union ',
  ' exec ',
  ' execute ',
  ' truncate ',
  ' xp_',
];

export function validateSqlObjectName(value: string, label = 'identificador SQL'): string {
  const normalizedValue = normalizeText(value);

  assertNoForbiddenFragment(normalizedValue, label);

  if (!SAFE_QUALIFIED_IDENTIFIER_PATTERN.test(normalizedValue)) {
    throw new SqlQueryValidationError(`${label} inválido.`);
  }

  return normalizedValue;
}

export function validateSqlColumnName(value: string, label = 'coluna SQL'): string {
  const normalizedValue = normalizeText(value);

  assertNoForbiddenFragment(normalizedValue, label);

  if (!SAFE_IDENTIFIER_PATTERN.test(normalizedValue)) {
    throw new SqlQueryValidationError(`${label} inválida.`);
  }

  return normalizedValue;
}

export function validateSqlParameterName(value: string, label = 'parâmetro SQL'): string {
  const normalizedValue = normalizeText(value);

  assertNoForbiddenFragment(normalizedValue, label);

  if (!SAFE_IDENTIFIER_PATTERN.test(normalizedValue)) {
    throw new SqlQueryValidationError(`${label} inválido.`);
  }

  return normalizedValue;
}

function normalizeText(value: string): string {
  if (typeof value !== 'string') {
    throw new SqlQueryValidationError('Valor SQL inválido.');
  }

  const normalizedValue = value.trim();

  if (!normalizedValue) {
    throw new SqlQueryValidationError('Valor SQL obrigatório.');
  }

  return normalizedValue;
}

function assertNoForbiddenFragment(value: string, label: string): void {
  const searchableValue = ` ${value.toLowerCase()} `;

  if (FORBIDDEN_SQL_FRAGMENTS.some((fragment) => searchableValue.includes(fragment))) {
    throw new SqlQueryValidationError(`${label} contém trecho não permitido.`);
  }
}

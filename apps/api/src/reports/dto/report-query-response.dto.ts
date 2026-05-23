export interface PaginatedResponse<TItem> {
  items: TItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PublicReportDefinition {
  id: string;
  name: string;
  description: string;
  sector: string;
  sourceType: 'view' | 'stored_procedure';
  parameters: Array<{
    name: string;
    type: 'string' | 'int' | 'number' | 'boolean' | 'date';
    required: boolean;
    maxLength?: number;
  }>;
  requiredPermissions: string[];
}

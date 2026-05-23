export type ReportSourceType = 'view' | 'stored_procedure';
export type ReportParameterType = 'string' | 'int' | 'number' | 'boolean' | 'date';

export interface ReportParameterDefinition {
  name: string;
  type: ReportParameterType;
  required?: boolean;
  maxLength?: number;
}

export interface ReportDefinition {
  id: string;
  name: string;
  description: string;
  sector: string;
  sourceType: ReportSourceType;
  sourceName: string;
  parameters: ReportParameterDefinition[];
  requiredPermissions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CreateReportDefinitionInput = Omit<ReportDefinition, 'id' | 'isActive' | 'createdAt' | 'updatedAt'> & {
  isActive?: boolean;
};

export type UpdateReportDefinitionInput = Partial<CreateReportDefinitionInput>;

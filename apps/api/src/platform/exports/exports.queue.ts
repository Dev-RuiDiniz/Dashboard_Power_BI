export const EXPORTS_QUEUE_NAME = 'export-jobs';

export type ExportJobPayload = {
  jobId: string;
  userId: string;
  reportId: string;
  exportFormat: 'pdf' | 'excel' | 'csv' | 'json';
  parameters?: Record<string, unknown>;
  requestContext: {
    userId: string;
    email: string;
    roles: string[];
    sectors: string[];
    permissions: string[];
  };
};

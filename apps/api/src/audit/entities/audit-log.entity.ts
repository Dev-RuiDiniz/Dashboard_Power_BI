export type AuditLog = {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
};

export type CreateAuditLogInput = {
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
};

export type AuditLogFilter = {
  userId?: string;
  action?: string;
  resource?: string;
  resourceId?: string;
  startDate?: Date;
  endDate?: Date;
};

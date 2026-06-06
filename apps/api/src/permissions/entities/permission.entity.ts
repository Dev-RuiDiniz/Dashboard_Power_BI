export type Permission = {
  id: string;
  code: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CreatePermissionInput = {
  code: string;
  name: string;
  description: string;
  resource: string;
  action: string;
};

export type UpdatePermissionInput = Partial<CreatePermissionInput> & {
  isActive?: boolean;
};

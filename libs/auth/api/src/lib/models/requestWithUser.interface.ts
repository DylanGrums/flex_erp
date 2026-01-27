import { Request } from 'express';
export type AuthUser = {
  id?: string;
  userId?: string;
  tenantId?: string;
  email?: string;
  roles?: string | string[];
  role?: string;
  avatar?: string | null;
  isActive?: boolean;
};

export interface RequestWithUser extends Request {
  user?: AuthUser;
}

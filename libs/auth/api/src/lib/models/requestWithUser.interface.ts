import { Request } from 'express';
import { User } from 'generated/prisma/client';

interface RequestWithUser extends Request {
  user: User;
}

export default RequestWithUser;

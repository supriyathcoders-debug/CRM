import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { userRepository } from '../repositories/user.repository';
import { UnauthorizedError } from '../utils/errors';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    companyId: string;
    role: string;
    permissions: string[];
    employeeId?: string;
  };
}

export async function authenticate(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Access token required');
    }

    const token = header.slice(7);
    const payload = verifyAccessToken(token);
    const user = await userRepository.findById(payload.sub);

    if (!user || user.status === 'SUSPENDED' || user.status === 'INACTIVE') {
      throw new UnauthorizedError('Invalid session');
    }

    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      companyId: user.companyId,
      role: user.role.name,
      permissions: user.role.permissions.map((rp) => rp.permission.key),
      employeeId: user.employee?.id,
    };
    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) next(error);
    else next(new UnauthorizedError('Invalid or expired token'));
  }
}

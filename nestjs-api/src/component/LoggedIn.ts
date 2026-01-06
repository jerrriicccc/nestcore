import { Request } from 'express';
import { validateToken } from './validateaccess/validate-rbactoken';

/**
 * Get the logged-in employee ID from the request
 * @param req - Express request object
 * @returns Employee ID as string if successfully logged in, null otherwise
 */
export async function getLoggedEmployee(req: Request): Promise<string | null> {
  const validationResult = await validateToken(req);
  const loggedId = validationResult.payload.id;
  const result = loggedId ? String(loggedId) : null;

  return result;
}

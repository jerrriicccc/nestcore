import { Injectable, ForbiddenException } from '@nestjs/common';

@Injectable()
export class ValidateAccessService {
  /**
   * Checks if the user has at least one of the required roles.
   * @param user The user object (should have a roles or defaultroleid property)
   * @param requiredRoles Array of allowed role IDs (number[])
   * @returns boolean
   */
  isGranted(user: any, requiredRoles: number[]): boolean {
    if (!user) return false;
    // Support both array of roles and single defaultroleid
    if (Array.isArray(user.roles)) {
      return user.roles.some((role: number) => requiredRoles.includes(role));
    }
    if (user.defaultroleid) {
      return requiredRoles.includes(user.defaultroleid);
    }
    return false;
  }

  /**
   * Throws ForbiddenException if user does not have required role(s).
   * @param user The user object
   * @param requiredRoles Array of allowed role IDs (number[])
   */
  check(user: any, requiredRoles: number[]) {
    if (!this.isGranted(user, requiredRoles)) {
      throw new ForbiddenException('You do not have access to this resource');
    }
  }
}

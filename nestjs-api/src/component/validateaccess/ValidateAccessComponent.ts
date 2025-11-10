import {
  Injectable,
  ForbiddenException,
  UnauthorizedException,
  Request,
  Response,
} from '@nestjs/common';
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';
import { validateToken, validateUserAccess } from './RbacToken';

export interface ValidateAccessOptions {
  isContinue?: boolean;
  preFlightOnly?: boolean;
  validateTokenOnly?: boolean;
  RBACModule?: string;
  dataSource?: any; // TypeORM DataSource
}

@Injectable()
export class ValidateAccessService {
  public isContinue: boolean = false;
  public preFlightOnly: boolean = false;
  public validateTokenOnly: boolean = false;
  public RBACModule: string = '';

  /**
   * Prepares CORS headers for the response
   * Equivalent to PHP prepareHeader(&$controller)
   */
  prepareHeader(request: ExpressRequest, response: ExpressResponse): void {
    const origin = request.headers.origin || '*';

    response.header({
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS',
      'Access-Control-Max-Age': '86400',
      'Access-Control-Allow-Headers':
        'Content-Type, Authorization, X-Requested-With, X-Rbac-Token',
    });
  }

  /**
   * Main startup method that handles CORS, token validation, and RBAC validation
   * Equivalent to PHP startup(Controller $controller)
   */
  async startup(
    request: ExpressRequest,
    response: ExpressResponse,
  ): Promise<void> {
    this.prepareHeader(request, response);

    // CORS PreFlight
    if (request.method === 'OPTIONS') {
      response.status(200).send('');
      return;
    }

    if (this.preFlightOnly) {
      this.isContinue = true;
      return;
    }

    // STEP 1: Check if Authorization header exists
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      response.status(401).json({
        status: 'error',
        code: 1,
        message: 'Authorization header is required',
      });
      return;
    }

    // STEP 2: Check if X-RBAC-Token header exists (case-insensitive)
    const rbacHeader =
      request.headers['x-rbac-token'] ||
      request.headers['X-Rbac-Token'] ||
      request.headers['X-RBAC-TOKEN'];
    if (!rbacHeader) {
      response.status(401).json({
        status: 'error',
        code: 2,
        message: 'X-RBAC-Token header is required',
      });
      return;
    }

    // STEP 3: Validate Authorization token
    const tokenResult = await validateToken(request);
    if (!tokenResult.ok) {
      response.status(401).json({
        status: 'error',
        code: tokenResult.code,
        message: tokenResult.message,
      });
      return;
    }

    if (this.validateTokenOnly) {
      this.isContinue = true;
      return;
    }

    // STEP 4: Validate RBAC token
    const rbacResult = await validateUserAccess(request, {
      RBACModule: this.RBACModule,
    });
    if (!rbacResult.ok) {
      response.status(403).json({
        status: 'error',
        code: rbacResult.code,
        message: rbacResult.message,
      });
      return;
    }

    // STEP 5: Both validations passed - grant access
    this.isContinue = true;
  }

  /**
   * Shutdown method to handle final response
   * Equivalent to PHP shutdown(Controller $controller)
   */
  shutdown(
    request: ExpressRequest,
    response: ExpressResponse,
  ): ExpressResponse | null {
    if (!this.isContinue) {
      return response;
    }
    return null;
  }

  /**
   * Check if access is granted (equivalent to PHP isGranted())
   * @returns boolean indicating if access is granted
   */
  isGranted(): boolean {
    return this.isContinue;
  }

  /**
   * Legacy method for role-based access (kept for backward compatibility)
   * @param user The user object (should have a roles or defaultroleid property)
   * @param requiredRoles Array of allowed role IDs (number[])
   * @returns boolean
   */
  isGrantedByRoles(user: any, requiredRoles: number[]): boolean {
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
    if (!this.isGrantedByRoles(user, requiredRoles)) {
      throw new ForbiddenException('You do not have access to this resource');
    }
  }

  /**
   * Configure the service with options
   * @param options Configuration options
   */
  configure(options: ValidateAccessOptions): void {
    this.isContinue = options.isContinue ?? false;
    this.preFlightOnly = options.preFlightOnly ?? false;
    this.validateTokenOnly = options.validateTokenOnly ?? false;
    this.RBACModule = options.RBACModule ?? '';
  }

  /**
   * Check if both Authorization and X-RBAC-Token headers are present
   * @param request Express request object
   * @returns Object with validation results
   */
  checkHeaders(request: ExpressRequest): {
    hasAuthHeader: boolean;
    hasRbacHeader: boolean;
    bothPresent: boolean;
    authHeader?: string;
    rbacHeader?: string;
  } {
    const authHeader = request.headers.authorization;
    const rbacHeader = request.headers['x-rbac-token'] as string;

    return {
      hasAuthHeader: !!authHeader,
      hasRbacHeader: !!rbacHeader,
      bothPresent: !!(authHeader && rbacHeader),
      authHeader: authHeader,
      rbacHeader: rbacHeader,
    };
  }
}

// Export ValidateAccess as an alias for the class
export { ValidateAccessService as ValidateAccess };

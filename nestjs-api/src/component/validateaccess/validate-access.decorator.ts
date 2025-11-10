import {
  createParamDecorator,
  ExecutionContext,
  Injectable,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ValidateAccessService as ValidateAccessServiceClass,
  ValidateAccessOptions,
} from './ValidateAccessComponent';

/**
 * Custom guard that integrates ValidateAccessService with NestJS
 */
@Injectable()
export class ValidateAccessGuard {
  constructor(
    private readonly validateAccessService: ValidateAccessServiceClass,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    try {
      await this.validateAccessService.startup(request, response);
      return this.validateAccessService.isGranted();
    } catch (error) {
      return false;
    }
  }
}

/**
 * Decorator to apply ValidateAccessService to controller methods
 * Equivalent to using the PHP ValidateaccessComponent in CakePHP controllers
 *
 * @param options Configuration options for validation
 * @returns Method decorator
 */
export function ValidateAccess(options: ValidateAccessOptions = {}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const validateAccessService = new ValidateAccessServiceClass();
      validateAccessService.configure(options);

      // Find request and response objects from method arguments
      const req = args.find((arg) => arg && arg.headers && arg.method);
      const res = args.find((arg) => arg && arg.header && arg.status);

      if (!req || !res) {
        throw new UnauthorizedException(
          'Request and Response objects not found in method arguments',
        );
      }

      try {
        await validateAccessService.startup(req, res);

        if (!validateAccessService.isGranted()) {
          return; // Response already sent in startup method
        }

        // Call the original method
        const result = await originalMethod.apply(this, args);

        // Handle shutdown
        validateAccessService.shutdown(req, res);

        return result;
      } catch (error) {
        validateAccessService.shutdown(req, res);
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Parameter decorator to get the ValidateAccessService instance
 * Can be used in controller methods to access the service
 */
export const ValidateAccessServiceParam = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): ValidateAccessServiceClass => {
    const request = ctx.switchToHttp().getRequest();

    // Create and configure service instance
    const service = new ValidateAccessServiceClass();

    // You can configure it here based on request context if needed
    // service.configure({ RBACModule: 'someModule' });

    return service;
  },
);

/**
 * Decorator for controllers that need CORS handling only
 */
export function CorsOnly() {
  return ValidateAccess({ preFlightOnly: true });
}

/**
 * Decorator for controllers that need token validation only (no RBAC)
 */
export function TokenValidationOnly() {
  return ValidateAccess({ validateTokenOnly: true });
}

/**
 * Decorator for controllers that need full RBAC validation
 */
export function FullRBACValidation(RBACModule?: string) {
  return ValidateAccess({ RBACModule });
}

/**
 * Method decorator for automatic dual token validation
 * Use this on individual methods instead of class-level decoration
 */
export function ValidateAccessMethod(options: ValidateAccessOptions = {}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // Find request object from method arguments
      const req = args.find((arg) => arg && arg.headers && arg.method);

      if (!req) {
        throw new UnauthorizedException(
          'Request object not found in method arguments',
        );
      }

      // Headers will be validated by the actual validation functions
      // This allows for more specific error messages

      // Import the validation functions
      const { validateToken, validateUserAccess } = require('./rbacToken');

      try {
        // Validate Authorization token
        const tokenResult = await validateToken(req);
        if (!tokenResult.ok) {
          // Throw proper NestJS exception with the specific error message
          throw new UnauthorizedException(tokenResult.message);
        }

        // If only token validation is needed, proceed
        if (options.validateTokenOnly) {
          return await originalMethod.apply(this, args);
        }

        // Validate RBAC token
        const rbacResult = await validateUserAccess(req, {
          RBACModule: options.RBACModule,
          dataSource: options.dataSource,
        });
        if (!rbacResult.ok) {
          // Throw proper NestJS exception with the specific error message
          throw new UnauthorizedException(rbacResult.message);
        }

        // Both validations passed, proceed with original method
        return await originalMethod.apply(this, args);
      } catch (error) {
        // If it's already a NestJS exception, re-throw it
        if (error instanceof UnauthorizedException) {
          throw error;
        }
        // For other errors, wrap them in UnauthorizedException
        throw new UnauthorizedException(
          error.message || 'Authentication failed',
        );
      }
    };

    return descriptor;
  };
}

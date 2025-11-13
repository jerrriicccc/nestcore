import { UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import {
  ValidateUserAccessOptions,
  validateUserAccess,
} from './validate-rbactoken';

/**
 * Method decorator that validates RBAC/access tokens before executing the
 * controller handler. The validated access data is cached on the request
 * object so that helper utilities (e.g. hasReadAccess) can re-use it.
 */
export function ValidateAccessMethod(
  options: ValidateUserAccessOptions = {},
): MethodDecorator {
  return (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const request: Request | undefined = args.find(
        (arg) => arg && typeof arg === 'object' && 'headers' in arg,
      );

      if (!request) {
        throw new UnauthorizedException(
          'Request object not found for RBAC validation',
        );
      }

      const validationResult = await validateUserAccess(request, options);

      if (!validationResult.ok) {
        throw new UnauthorizedException(validationResult.message);
      }

      const accessInfo = validationResult.payload?.access;
      const permissions = Array.isArray(accessInfo?.access)
        ? accessInfo.access
        : [];

      request['rbacAccess'] = permissions;
      request['rbacPayload'] = validationResult.payload?.rbacPayload;

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

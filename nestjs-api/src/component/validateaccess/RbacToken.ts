import { Request } from 'express';
import { UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import { DataSource } from 'typeorm';

interface TokenValidationResponse {
  ok: boolean;
  code: number;
  message: string;
  payload?: any;
}

interface ValidateUserAccessOptions {
  RBACModule?: string;
  dataSource?: DataSource;
}

// Global DataSource instance - will be set by the application
let globalDataSource: DataSource | null = null;

/**
 * Set the global DataSource instance for RBAC operations
 * @param dataSource - TypeORM DataSource instance
 */
export function setRBACDataSource(dataSource: DataSource): void {
  globalDataSource = dataSource;
}

export function getTokenFromHeader(request: Request): string[] | null {
  const authHeader = request.headers.authorization;
  if (!authHeader) return null;

  const auth = authHeader.split(' '); // ["Bearer", "token"]
  if (auth.length !== 2 || auth[0] !== 'Bearer') return null;

  const token = auth[1].split('.'); // Split JWT into parts
  return token.length === 3 ? token : null;
}

export function getRBACTokenFromHeader(request: Request): string[] | null {
  // Handle case-insensitive header access
  const rbacHeader = request.headers['x-rbac-token'] as string;

  if (!rbacHeader) return null;
  const auth = rbacHeader.split(' ');

  // Extract the actual token part
  const tokenString = auth.length >= 2 ? auth[1] : rbacHeader;

  const token = tokenString.split('.');

  // RBAC token should have 2 parts: payload.signature
  if (token.length === 2) {
    return token;
  } else if (token.length === 3) {
    // If it's a 3-part JWT, we need to extract the correct parts
    // For RBAC, we typically want parts 1 and 2 (payload and signature)
    return [token[1], token[2]];
  }

  return null;
}

// You'll need to implement this function based on your signing algorithm
function signTokenBase64(
  header: string,
  payload: string,
  secret: string = process.env.JWT_SECRET || 'defaultsecret',
): string {
  const data = `${header}.${payload}`;
  return crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Generate RBAC token for a user
 * @param accessToken - The access token (JWT) to use for signing
 * @param user - User object with role information
 * @param module - Module name for RBAC access
 * @param encryptedAccessData - Pre-encrypted access data (optional)
 * @returns RBAC token string
 */
export function generateRBACToken(
  accessToken: string,
  user: any,
  module: string = 'appointments',
  encryptedAccessData?: string,
): string {
  // Decode the access token to get its header
  const accessTokenParts = accessToken.split('.');
  if (accessTokenParts.length !== 3) {
    throw new Error('Invalid access token format');
  }

  const accessTokenHeader = accessTokenParts[0];

  // Create RBAC payload
  const rbacPayload = {
    sub: user.id,
    email: user.email,
    id: user.id, // This should match the access token header id
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
    iat: Math.floor(Date.now() / 1000),
    auth: encryptedAccessData || null, // Include encrypted access data
  };

  // Encode the payload
  const encodedPayload = Buffer.from(JSON.stringify(rbacPayload))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  // Sign the token using the access token header and RBAC payload
  const signature = signTokenBase64(accessTokenHeader, encodedPayload);

  // Return the RBAC token (payload.signature format)
  return `${encodedPayload}.${signature}`;
}

// Helper function to decode base64 to JSON
function decodeBase64ToJSON(base64String: string): any {
  try {
    return JSON.parse(Buffer.from(base64String, 'base64').toString());
  } catch (error) {
    throw new Error('Invalid base64 JSON format');
  }
}

/**
 * Decrypt encrypted data using multiple methods for compatibility
 * Supports AES-256-CBC, base64, AES-192-CBC, and direct JSON parsing
 * @param encryptedData - The encrypted data string to decrypt
 * @returns Decrypted string data
 * @throws Error if all decryption methods fail
 */
function decryptCipher8(encryptedData: string): string {
  // Method 1: Try AES-256-CBC with IV (most common)
  try {
    const algorithm = 'aes-256-cbc';
    const secretKey =
      process.env.ENCRYPTION_KEY || 'your-32-character-secret-key-here';
    const key = crypto.scryptSync(secretKey, 'salt', 32);

    // Split the encrypted data to get IV and encrypted content
    const parts = encryptedData.split(':');
    if (parts.length === 2) {
      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];

      const decipher = crypto.createDecipheriv(algorithm, key, iv);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    }
  } catch (error) {
    return error.message;
  }

  // Method 2: Try simple base64 decoding
  try {
    return Buffer.from(encryptedData, 'base64').toString('utf8');
  } catch (base64Error) {
    // Continue to next method
  }

  // Method 3: Try AES-192-CBC (legacy method)
  try {
    const algorithm = 'aes-192-cbc';
    const secretKey =
      process.env.ENCRYPTION_KEY || 'your-32-character-secret-key-here';
    const key = crypto.scryptSync(secretKey, 'salt', 24);

    // Generate a default IV for legacy compatibility
    const iv = Buffer.alloc(16, 0); // Zero-filled IV for legacy compatibility

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (aes192Error) {
    // Continue to next method
  }

  // Method 4: Try direct string (if already decrypted)
  try {
    return JSON.parse(encryptedData);
  } catch (jsonError) {
    console.error('All decryption methods failed:', {
      aes256cbc: 'Failed',
      base64: 'Failed',
      aes192: 'Failed',
      direct: 'Failed',
    });
    throw new Error('Failed to decrypt data - all methods exhausted');
  }
}

/**
 * Get controller name from request - matches PHP $this->request->params['controller']
 * @param request - Express request object
 * @returns Controller name string
 */
function getControllerFromRequest(request: Request): string {
  // Try to get controller from route parameters first (NestJS way)
  if (request.params && request.params['controller']) {
    return request.params['controller'];
  }

  // Fallback to extracting from URL path
  const path = request.route?.path || request.url;
  const segments = path.split('/').filter((segment) => segment.length > 0);

  // Remove common API prefixes and get the first meaningful segment
  const apiPrefixes = ['api', 'v1', 'v2'];
  const filteredSegments = segments.filter(
    (segment) => !apiPrefixes.includes(segment.toLowerCase()),
  );

  return filteredSegments[0] || '';
}

/**
 * Get user's actual role permissions from database
 * @param roleId - User's role ID
 * @param moduleName - Module name (e.g., 'appointments', 'customers')
 * @param dataSource - TypeORM DataSource for database access
 * @returns Array of access permissions (e.g., ['Read', 'Create', 'Update', 'Delete'])
 */
async function getUserRolePermissions(
  roleId: number,
  moduleName: string,
  dataSource?: DataSource,
): Promise<string[]> {
  try {
    // Use provided DataSource or global DataSource
    const ds = dataSource || globalDataSource;

    if (!ds) {
      // console.log('No DataSource available, returning empty permissions');
      return [];
    }

    // Map module name to database accesskey format
    // Database uses singular capitalized form: appointments -> Appointment,
    // Remove trailing 's' if plural, then capitalize first letter
    const singular = moduleName.endsWith('s')
      ? moduleName.slice(0, -1)
      : moduleName;
    const accessKey = singular.charAt(0).toUpperCase() + singular.slice(1);

    // Query rolelines table for the user's role and module
    const query = `
      SELECT rl.accessvalue 
      FROM rolelines rl 
      WHERE rl.roleid = ? 
      AND rl.accesskey = ?
    `;

    const result = await ds.query(query, [roleId, accessKey]);

    if (result && result.length > 0 && result[0].accessvalue) {
      // accessvalue is stored as JSON string, parse it
      const accessValue =
        typeof result[0].accessvalue === 'string'
          ? JSON.parse(result[0].accessvalue)
          : result[0].accessvalue;

      return Array.isArray(accessValue) ? accessValue : [];
    }

    return [];
  } catch (error) {
    console.error('Error getting user role permissions:', error);
    return [];
  }
}

/**
 * Get permissions from multiple roles for a specific module
 * @param roleIds - Array of role IDs (from assignedroles)
 * @param moduleName - Module name
 * @param dataSource - TypeORM DataSource for database access
 * @returns Array of access permissions from all roles
 */
async function getUserPermissionsFromMultipleRoles(
  roleIds: (string | number)[],
  moduleName: string,
  dataSource?: DataSource,
): Promise<string[]> {
  try {
    if (!roleIds || roleIds.length === 0) {
      return [];
    }

    // Use provided DataSource or global DataSource
    const ds = dataSource || globalDataSource;

    if (!ds) {
      // console.log('No DataSource available, returning empty permissions');
      return [];
    }

    // Map module name to database accesskey format
    const singular = moduleName.endsWith('s')
      ? moduleName.slice(0, -1)
      : moduleName;
    const accessKey = singular.charAt(0).toUpperCase() + singular.slice(1);

    // Convert role IDs to numbers and filter out invalid ones
    const validRoleIds = roleIds
      .map((id) => {
        const numId = typeof id === 'string' ? parseInt(id, 10) : id;
        return isNaN(numId) ? null : numId;
      })
      .filter((id): id is number => id !== null);

    if (validRoleIds.length === 0) {
      return [];
    }

    // Query rolelines table for all roles and module
    const query = `
      SELECT rl.roleid, rl.accessvalue 
      FROM rolelines rl 
      WHERE rl.roleid IN (${validRoleIds.map(() => '?').join(',')})
      AND rl.accesskey = ?
    `;

    const results = await ds.query(query, [...validRoleIds, accessKey]);

    // Collect all permissions from all roles (keeping all permissions, including duplicates)
    const allPermissions: string[] = [];
    for (const result of results) {
      if (result.accessvalue) {
        // accessvalue is stored as JSON string, parse it
        const accessValue =
          typeof result.accessvalue === 'string'
            ? JSON.parse(result.accessvalue)
            : result.accessvalue;

        if (Array.isArray(accessValue)) {
          allPermissions.push(...accessValue);
        }
      }
    }

    return allPermissions;
  } catch (error) {
    console.error('Error getting user permissions from multiple roles:', error);
    return [];
  }
}

export async function validateUserAccess(
  request: Request,
  options: ValidateUserAccessOptions = {},
): Promise<TokenValidationResponse> {
  const response: TokenValidationResponse = { ok: false, code: 0, message: '' };

  const token = await getTokenFromHeader(request);
  const rbacToken = await getRBACTokenFromHeader(request);

  // Check if RBAC token exists and has required parts
  if (!rbacToken || !rbacToken[0] || !rbacToken[1]) {
    response.code = 1;
    response.message = 'Missing RBAC Token';
    return response;
  }

  // Verify RBAC token signature using access token header and RBAC token payload
  if (!token || !token[0]) {
    response.code = 6; // Additional error for missing access token
    response.message = 'Missing Access Token for RBAC validation';
    return response;
  }

  const sign = signTokenBase64(token[0], rbacToken[0]);
  if (sign !== rbacToken[1]) {
    response.code = 2;
    response.message = 'Invalid RBAC Token';
    return response;
  }

  try {
    // Decode RBAC token payload
    const payload = decodeBase64ToJSON(rbacToken[0]);

    // Check RBAC token expiration
    const now = new Date();
    const exp = new Date(payload.exp * 1000); // Convert Unix timestamp to Date

    if (now > exp) {
      response.code = 3;
      response.message = 'Expired RBAC token';
      return response;
    }

    // Validate if token ID from access token matches token ID in RBAC payload
    // Get the ID from the access token payload (not header)
    const accessTokenPayload = decodeBase64ToJSON(token[1]);

    if (accessTokenPayload.id !== payload.id) {
      response.code = 4;
      response.message = `Mismatched ID in access token and in role-based token payload. Access Token ID: ${accessTokenPayload.id}, RBAC Token ID: ${payload.id}`;
      return response;
    }

    // Get the RBAC module first
    const RBACModule =
      options.RBACModule && options.RBACModule !== ''
        ? options.RBACModule
        : getControllerFromRequest(request);

    // Check if the current controller matches the submitted token
    let access;

    // Check if auth field exists
    if (!payload.auth) {
      // Get assigned roles from access token payload
      // ONLY use assignedroles, do NOT use defaultroleid
      if (
        !accessTokenPayload.assignedroles ||
        !Array.isArray(accessTokenPayload.assignedroles) ||
        accessTokenPayload.assignedroles.length === 0
      ) {
        response.code = 7;
        response.message =
          'No assigned roles found. User must have assigned roles to access resources.';
        return response;
      }

      const assignedRoles = accessTokenPayload.assignedroles;
      const actualPermissions = await getUserPermissionsFromMultipleRoles(
        assignedRoles,
        RBACModule || '',
        options.dataSource,
      );

      // Create access object with actual database permissions
      access = {
        module: RBACModule || '',
        access: actualPermissions, // Use actual database permissions from all assigned roles
        role: assignedRoles, // Store all assigned roles
        userId: payload.sub,
        email: payload.email,
      };
    } else {
      try {
        // Try to parse as JSON first (in case it's already decrypted)
        try {
          access = JSON.parse(payload.auth);
          // console.log('Successfully parsed auth as JSON:', access);
        } catch (jsonError) {
          // console.log('JSON parsing failed, attempting decryption...');
          // If JSON parsing fails, try decryption
          const decryptedData = decryptCipher8(payload.auth);
          // console.log('Decrypted data:', decryptedData);
          access = JSON.parse(decryptedData);
          // console.log('Successfully parsed decrypted data:', access);
        }
      } catch (decryptError) {
        // console.log('Failed to decrypt access data:', decryptError.message);
        response.code = 7;
        response.message = 'Failed to decrypt access data';
        return response;
      }
    }

    // Validate access object structure
    if (!access || typeof access !== 'object' || !access.module) {
      response.code = 7;
      response.message = 'Invalid access data structure - missing module';
      return response;
    }

    const rbacHeader = request.headers['x-rbac-token'];
    const headerParts =
      rbacHeader && typeof rbacHeader === 'string' ? rbacHeader.split(' ') : [];
    const headerModule = headerParts.length > 0 ? headerParts[0] : null;

    const accessModuleMatch = access.module === RBACModule;
    const headerModuleMatch = headerModule === RBACModule;

    const moduleMatches = accessModuleMatch && headerModuleMatch;

    if (!moduleMatches) {
      if (!accessModuleMatch && !headerModuleMatch) {
        response.code = 5;
        response.message = `Mismatched module in role-based token. Expected: ${RBACModule}, Got access module: ${access.module}, Header module: ${headerModule}`;
      } else if (!accessModuleMatch) {
        response.code = 5;
        response.message = `Mismatched RBAC Token. Expected: ${RBACModule}, Got: ${access.module}`;
      } else if (!headerModuleMatch) {
        response.code = 5;
        response.message = `Mismatched header module in RBAC token. Expected: ${RBACModule}, Got: ${headerModule}`;
      }
      return response;
    }

    response.ok = true;
    response.payload = { access, rbacPayload: payload };
    return response;
  } catch (error) {
    response.code = 7;
    response.message = 'Invalid RBAC token format or decryption failed';
    return response;
  }
}

export async function validateToken(
  request: Request,
  requiredRoles: string[] = [],
): Promise<TokenValidationResponse> {
  const response: TokenValidationResponse = { ok: false, code: 0, message: '' };

  const token = await getTokenFromHeader(request);

  // Check if token exists and has all 3 parts
  if (!token || token.length !== 3 || !token[0] || !token[1] || !token[2]) {
    response.code = 1;
    response.message = 'Incomplete Token';
    return response;
  }

  // Verify token signature
  const sign = signTokenBase64(token[0], token[1]);
  if (sign !== token[2]) {
    response.code = 2;
    response.message = 'Invalid Sign';
    return response;
  }

  try {
    // Decode payload
    const payload = JSON.parse(Buffer.from(token[1], 'base64').toString());

    const now = new Date();
    const exp = new Date(payload.exp * 1000);

    if (now > exp) {
      response.code = 3;
      response.message = 'Expired Token';
      return response;
    }

    // Check roles if required (optional role-based validation)
    if (requiredRoles.length > 0 && payload.roles) {
      const userRoles = Array.isArray(payload.roles)
        ? payload.roles
        : [payload.roles];
      const hasRequiredRole = requiredRoles.some((role) =>
        userRoles.includes(role),
      );

      if (!hasRequiredRole) {
        response.code = 4;
        response.message = 'Insufficient Permissions';
        return response;
      }
    }

    response.ok = true;
    response.payload = payload;
    return response;
  } catch (error) {
    response.code = 5;
    response.message = 'Invalid Token Format';
    return response;
  }
}

// Helper function to throw NestJS exceptions based on validation result
export function handleTokenValidation(
  validationResult: TokenValidationResponse,
): any {
  if (!validationResult.ok) {
    throw new UnauthorizedException(validationResult.message);
  }
  return validationResult.payload;
}

// REST Token validation function (similar to your PHP validateRESTToken)
export async function validateRESTToken(
  request: Request,
  requiredRoles: string[] = [],
): Promise<boolean> {
  const result = await validateToken(request, requiredRoles);

  if (!result.ok) {
    // For codes 1, 2, 3 (Incomplete Token, Invalid Sign, Expired Token)
    if (result.code <= 3) {
      throw new UnauthorizedException('Invalid Token');
    } else {
      // For other error codes (permissions, format errors)
      throw new UnauthorizedException(result.message);
    }
  }

  return true;
}

/**
 * Get access information from RBAC payload
 * @param request - Express request object
 * @returns Access array from RBAC token
 * @throws Error if RBAC token is invalid or missing
 */
export function getAccessInfoFromRBACPayload(request: Request): string[] {
  const rbacToken = getRBACTokenFromHeader(request);

  if (!rbacToken || !rbacToken[0]) {
    throw new Error('RBAC token not found or invalid');
  }

  const rbacPayload = decodeBase64ToJSON(rbacToken[0]);
  const access = JSON.parse(decryptCipher8(rbacPayload.auth));

  return access.access || [];
}

/**
 * Check if user has specific access permission
 * @param request - Express request object
 * @param txtAccess - Access permission to check (e.g., "Create", "Read", "Update", "Delete")
 * @returns True if user has the specified access
 */
export function hasAccess(request: Request, txtAccess: string): boolean {
  try {
    const access = getAccessInfoFromRBACPayload(request);
    return Array.isArray(access) && access.includes(txtAccess);
  } catch (error) {
    return false;
  }
}

/**
 * Check if user has Create access
 * @param request - Express request object
 * @returns True if user has Create access
 */
export function hasCreateAccess(request: Request): boolean {
  return hasAccess(request, 'Create');
}

export function hasReadAccess(request: Request): boolean {
  return hasAccess(request, 'Read');
}

export function hasUpdateAccess(request: Request): boolean {
  return hasAccess(request, 'Update');
}

export function hasDeleteAccess(request: Request): boolean {
  return hasAccess(request, 'Delete');
}

/**
 * Deny role-based access and throw UnauthorizedException
 * @throws UnauthorizedException with 403 status
 */
export function denyRoleBasedAccess(): never {
  throw new UnauthorizedException('Your role has no access to this resource.');
}

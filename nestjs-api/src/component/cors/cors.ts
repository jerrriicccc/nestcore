import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class CorsComponent {
  private isOption: boolean = false;

  /**
   * Initialize CORS headers for the response
   * @param request - Express request object
   * @param response - Express response object
   */
  initialize(request: Request, response: Response): void {
    const origin = request.headers.origin || '*';

    response.header('Access-Control-Allow-Origin', origin);
    response.header(
      'Access-Control-Allow-Methods',
      'GET, PUT, POST, DELETE, OPTIONS',
    );
    response.header('Access-Control-Max-Age', '86400');
    response.header(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With, X-RBAC-Token',
    );
    response.header('Content-Type', 'application/json');
  }

  /**
   * Handle CORS preflight requests
   * @param request - Express request object
   * @param response - Express response object
   * @returns True if this was a preflight request
   */
  startup(request: Request, response: Response): boolean {
    if (request.method === 'OPTIONS') {
      const origin = request.headers.origin || '*';
      response.status(200).send(origin);
      this.isOption = true;
      return true;
    }
    return false;
  }

  /**
   * Cleanup after request processing
   * @param request - Express request object
   * @param response - Express response object
   */
  shutdown(request: Request, response: Response): void {
    // Cleanup logic if needed
  }

  /**
   * Check if this was a preflight request
   * @returns True if this was a preflight request
   */
  isPreFlight(): boolean {
    return this.isOption;
  }

  /**
   * Reset the component state
   */
  reset(): void {
    this.isOption = false;
  }
}

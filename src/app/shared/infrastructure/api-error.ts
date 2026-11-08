import { HttpErrorResponse } from '@angular/common/http';

/**
 * Problem details answered by the StockIA Platform API (RFC 9457): title is a stable error code
 * (InvalidCredentials, CannotSell, AccountLocked…), detail the message in the language of the request
 * and details the extra data some errors carry.
 * @author DataBit
 */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly title: string,
    readonly detail: string,
    readonly details: Record<string, unknown> | null = null,
    readonly fieldErrors: Record<string, string[]> = {},
  ) {
    super(detail || title);
  }

  /**
   * Translates an HTTP error of the API into an ApiError (status 0 means the API is not reachable).
   * @param error - Error raised by HttpClient.
   */
  static from(error: unknown): ApiError {
    if (error instanceof ApiError) return error;
    if (error instanceof HttpErrorResponse) {
      const body = (error.error ?? {}) as {
        title?: string;
        detail?: string;
        details?: Record<string, unknown>;
        errors?: Record<string, string[]>;
      };
      return new ApiError(error.status, body.title ?? '', body.detail ?? '', body.details ?? null, body.errors ?? {});
    }
    return new ApiError(-1, 'Unexpected', String(error));
  }

  get isNetworkError(): boolean {
    return this.status === 0;
  }
}

/**
 * Custom API Error class that extends the native Error object
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  /**
   * Create a new API Error
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Error message
   * @param {boolean} isOperational - Is this a known operational error?
   * @param {string} stack - Error stack trace
   */
  constructor(
    statusCode: number,
    message: string,
    isOperational: boolean = true,
    stack: string = ''
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Create a 400 Bad Request error
   */
  static badRequest(message: string = 'Bad Request'): ApiError {
    return new ApiError(400, message);
  }

  /**
   * Create a 401 Unauthorized error
   */
  static unauthorized(message: string = 'Unauthorized'): ApiError {
    return new ApiError(401, message);
  }

  /**
   * Create a 403 Forbidden error
   */
  static forbidden(message: string = 'Forbidden'): ApiError {
    return new ApiError(403, message);
  }

  /**
   * Create a 404 Not Found error
   */
  static notFound(message: string = 'Not Found'): ApiError {
    return new ApiError(404, message);
  }

  /**
   * Create a 409 Conflict error
   */
  static conflict(message: string = 'Conflict'): ApiError {
    return new ApiError(409, message);
  }

  /**
   * Create a 422 Unprocessable Entity error
   */
  static unprocessableEntity(message: string = 'Unprocessable Entity'): ApiError {
    return new ApiError(422, message);
  }

  /**
   * Create a 429 Too Many Requests error
   */
  static tooManyRequests(message: string = 'Too Many Requests'): ApiError {
    return new ApiError(429, message);
  }

  /**
   * Create a 500 Internal Server Error
   */
  static internal(message: string = 'Internal Server Error'): ApiError {
    return new ApiError(500, message, false);
  }

  /**
   * Create a 501 Not Implemented error
   */
  static notImplemented(message: string = 'Not Implemented'): ApiError {
    return new ApiError(501, message, false);
  }

  /**
   * Create a 503 Service Unavailable error
   */
  static serviceUnavailable(message: string = 'Service Unavailable'): ApiError {
    return new ApiError(503, message, false);
  }

  /**
   * Convert error to JSON
   */
  toJSON(): object {
    return {
      status: 'error',
      statusCode: this.statusCode,
      message: this.message,
      ...(process.env.NODE_ENV === 'development' && { stack: this.stack }),
    };
  }
}

/**
 * Type guard to check if an error is an instance of ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Type guard to check if an error has a status code
 */
export interface ErrorWithStatus extends Error {
  statusCode?: number;
  status?: number | string;
}

export function isErrorWithStatus(error: unknown): error is ErrorWithStatus {
  return (
    error instanceof Error &&
    (typeof (error as ErrorWithStatus).statusCode === 'number' ||
      typeof (error as ErrorWithStatus).status === 'number' ||
      typeof (error as ErrorWithStatus).status === 'string')
  );
}

/**
 * Get the status code from an error
 */
export function getErrorStatusCode(error: unknown): number {
  if (isApiError(error)) {
    return error.statusCode;
  }

  if (isErrorWithStatus(error)) {
    if (typeof error.statusCode === 'number') {
      return error.statusCode;
    }
    if (typeof error.status === 'number') {
      return error.status;
    }
    if (typeof error.status === 'string' && !isNaN(Number(error.status))) {
      return Number(error.status);
    }
  }

  return 500; // Default to 500 Internal Server Error
}

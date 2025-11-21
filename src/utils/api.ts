/**
 * API utility functions for standardized responses and error handling
 */

/**
 * Standard API response interface
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Standard error codes
 */
export const ErrorCodes = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * Creates a successful JSON response
 *
 * @param data - The data to return
 * @param message - Optional success message
 * @param status - HTTP status code (default: 200)
 */
export function apiSuccess<T>(
  data: T,
  message?: string,
  status: number = 200
): Response {
  const response: ApiResponse<T> = {
    success: true,
    data,
    ...(message && { message }),
  };

  return new Response(JSON.stringify(response), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Creates an error JSON response
 *
 * @param message - Error message
 * @param status - HTTP status code (default: 400)
 */
export function apiError(
  message: string,
  status: number = ErrorCodes.BAD_REQUEST
): Response {
  const response: ApiResponse = {
    success: false,
    error: message,
  };

  return new Response(JSON.stringify(response), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Creates a validation error response
 *
 * @param message - Validation error message
 * @param errors - Optional detailed validation errors
 */
export function validationError(
  message: string,
  errors?: Record<string, string[]>
): Response {
  const response: ApiResponse & { errors?: Record<string, string[]> } = {
    success: false,
    error: message,
    ...(errors && { errors }),
  };

  return new Response(JSON.stringify(response), {
    status: ErrorCodes.UNPROCESSABLE_ENTITY,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Creates a not found error response
 *
 * @param resource - The resource that was not found
 */
export function notFoundError(resource: string = 'Resource'): Response {
  return apiError(`${resource} not found`, ErrorCodes.NOT_FOUND);
}

/**
 * Creates an unauthorized error response
 *
 * @param message - Optional custom message
 */
export function unauthorizedError(
  message: string = 'Unauthorized'
): Response {
  return apiError(message, ErrorCodes.UNAUTHORIZED);
}

/**
 * Creates a conflict error response (e.g., duplicate resource)
 *
 * @param message - Conflict error message
 */
export function conflictError(message: string): Response {
  return apiError(message, ErrorCodes.CONFLICT);
}

/**
 * Creates an internal server error response
 *
 * @param message - Optional error message (defaults to generic message)
 * @param error - The actual error (logged in development)
 */
export function internalError(
  message: string = 'Internal server error',
  error?: unknown
): Response {
  // Log error in development
  if (import.meta.env.DEV && error) {
    console.error('Internal server error:', error);
  }

  return apiError(message, ErrorCodes.INTERNAL_SERVER_ERROR);
}

/**
 * Parses JSON from request body with error handling
 *
 * @param request - The request object
 * @returns Parsed JSON data or null if parsing fails
 */
export async function parseRequestBody<T = unknown>(
  request: Request
): Promise<T | null> {
  try {
    return await request.json();
  } catch (error) {
    return null;
  }
}

/**
 * Validates required fields in request data
 *
 * @param data - The data object to validate
 * @param requiredFields - Array of required field names
 * @returns Array of missing field names (empty if all present)
 */
export function validateRequiredFields(
  data: Record<string, unknown>,
  requiredFields: string[]
): string[] {
  return requiredFields.filter(field => {
    const value = data[field];
    return value === undefined || value === null || value === '';
  });
}

/**
 * Creates a standardized created response (HTTP 201)
 *
 * @param data - The created resource data
 * @param message - Optional success message
 */
export function createdResponse<T>(data: T, message?: string): Response {
  return apiSuccess(data, message || 'Resource created successfully', 201);
}

/**
 * Creates a standardized no content response (HTTP 204)
 */
export function noContentResponse(): Response {
  return new Response(null, { status: 204 });
}

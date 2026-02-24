import { HttpErrorResponse } from '@angular/common/http';

/**
 * Server error formats:
 *
 * Validation: { "errors": { "password": "no debe estar vacío" }, "status": 400, "timestamp": "..." }
 * Generic:    { "message": "Unauthorized", "status": 401, "timestamp": "..." }
 */

export function extractServerError(error: HttpErrorResponse, fallback: string = 'Error en la solicitud'): string {
  if (!error) return fallback;

  const body = error.error;

  // Format 1: { errors: { field: "msg", ... } }
  if (body?.errors && typeof body.errors === 'object') {
    const messages = Object.values(body.errors) as string[];
    return messages.join('. ');
  }

  // Format 2: { message: "Unauthorized" }
  if (body?.message) return body.message;

  // Plain string body
  if (typeof body === 'string' && body.length > 0) return body;

  // HTTP status fallback
  if (error.status === 0) return 'No se pudo conectar con el servidor';

  return fallback;
}

import { HttpErrorResponse } from '@angular/common/http';

export function errorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    const body = error.error as { error?: string; errors?: Record<string, string> } | null;
    if (body?.error) {
      return body.error;
    }
    if (body?.errors) {
      return Object.values(body.errors).join(' ');
    }
    if (error.status === 0) {
      return 'No se pudo conectar con el servidor. Verifique la URL y la conexión.';
    }
  }
  return 'Ocurrió un error inesperado.';
}

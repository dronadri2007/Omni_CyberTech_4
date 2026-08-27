export class AppError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(status: number, message: string, code = 'ERR', details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static badRequest(message: string, details?: unknown) {
    return new AppError(400, message, 'ERR_BAD_REQUEST', details);
  }
  static unauthorized(message = 'Authentication required') {
    return new AppError(401, message, 'ERR_UNAUTHORIZED');
  }
  static forbidden(message = 'Not permitted') {
    return new AppError(403, message, 'ERR_FORBIDDEN');
  }
  static notFound(message = 'Resource not found') {
    return new AppError(404, message, 'ERR_NOT_FOUND');
  }
  static tooLarge(message = 'Payload too large') {
    return new AppError(413, message, 'ERR_TOO_LARGE');
  }
}

export class HttpError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 400,
    public readonly code = 'HTTP_ERROR',
  ) {
    super(message);
  }
}

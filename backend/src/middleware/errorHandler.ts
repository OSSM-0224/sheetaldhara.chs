import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Mongoose validation and cast failures are caused by the client's input, not
  // by a server fault. Reporting them as 500 both misleads the frontend (which
  // renders 500s as "something broke on our end") and hides genuine incidents in
  // monitoring. Example: Resident.findById("[object Object]") is a bad request.
  const isClientError =
    err instanceof mongoose.Error.CastError ||
    err instanceof mongoose.Error.ValidationError;

  if (isClientError) {
    return res.status(400).json({
      error: 'The request contained an invalid or malformed value.',
      ...(process.env.NODE_ENV !== 'production' && { detail: err.message }),
    });
  }

  // A body-parser failure (malformed JSON) also carries a 400-worthy status.
  if (err?.type === 'entity.parse.failed' || err?.type === 'entity.too.large') {
    return res.status(400).json({ error: 'Request body could not be parsed.' });
  }

  const status = err.status || err.statusCode || 500;
  const isServerError = status >= 500;

  console.error(
    `[error] ${req.method} ${req.originalUrl} -> ${status}:`,
    err.message
  );

  if (isServerError) {
    // Do not echo internal error messages or stack traces to the client for 5xx.
    return res.status(status).json({
      error: 'Internal server error. Please try again later.',
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    });
  }

  return res.status(status).json({
    error: err.message || 'Request could not be completed.',
  });
}

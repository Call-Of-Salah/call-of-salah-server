import type { Response } from 'express';
import type { ZodType } from 'zod';
import { HttpStatus } from './httpStatus.js';

function requestIdOf(res: Response): string {
  return (res.locals['requestId'] as string | undefined) ?? '';
}

export function sendSuccess<T>(res: Response, data: T, status: HttpStatus = HttpStatus.OK): void {
  const schema = res.locals['responseSchema'] as ZodType | undefined;
  const meta = { request_id: requestIdOf(res) };

  if (!schema) {
    res.status(status).json({ data, meta });
    return;
  }

  const result = schema.safeParse(data);

  if (!result.success) {
    throw new Error(`Response failed validation: ${JSON.stringify(result.error.issues)}`);
  }

  res.status(status).json({ data: result.data, meta });
}

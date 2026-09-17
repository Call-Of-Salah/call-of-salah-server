import type { Response } from 'express';
import type { ZodType } from 'zod';
import { HttpStatus } from './httpStatus.js';


export function sendSuccess<T>(res: Response, body: T, status: HttpStatus = HttpStatus.OK): void {
  const schema = res.locals['responseSchema'] as ZodType | undefined;

  if (!schema) {
    res.status(status).json({ status, body });
    return;
  }

  const result = schema.safeParse(body);

  if (!result.success) {
    throw new Error(`Response failed validation: ${JSON.stringify(result.error.issues)}`);
  }

  res.status(status).json({ status, body: result.data });
}

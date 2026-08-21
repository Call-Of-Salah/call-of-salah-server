import { describe, expect, it } from 'vitest';
import { ukDateString } from '../src/lib/time.js';

describe('ukDateString', () => {
  it('returns YYYY-MM-DD', () => {
    expect(ukDateString(new Date('2025-08-21T12:00:00Z'))).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

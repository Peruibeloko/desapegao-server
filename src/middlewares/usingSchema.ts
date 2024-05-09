import { Context } from 'hono/mod.ts';
import { formatError } from '@/models/Listing.ts';
import { z } from 'zod';

type ValidationMiddleware = <T extends z.ZodSchema>(schema: T) => (data: unknown, c: Context) => z.infer<typeof schema>;

export const usingSchema: ValidationMiddleware = schema => (body, c) => {
  const reqId = c.get('reqId');
  console.log(`[${reqId}]`, 'Parsing payload');

  const result = schema.safeParse(body);

  if (!result.success) {
    console.log(`[${reqId}]`, 'Invalid payload', formatError(result.error));
    return c.json({ reqId, ...formatError(result.error) }, 400);
  }

  console.log(`[${reqId}]`, 'All good!');

  const { data } = result;
  return data as z.infer<typeof schema>;
};

import { Context } from 'hono/mod.ts';
import { z } from 'zod';

type ValidationMiddleware = <T extends z.ZodSchema>(schema: T) => (data: unknown, c: Context) => z.infer<typeof schema>;

export const usingSchema: ValidationMiddleware = schema => (body, c) => {
  const result = schema.safeParse(body);
  if (!result.success) return c.text('Invalid listing', 400);
  const { data } = result;
  return data as z.infer<typeof schema>;
};

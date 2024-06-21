import { createMiddleware } from 'hono/helper/factory/index.ts';
import { parseAuthHeader } from '@/services/Auth.ts';

export const checkAuth = createMiddleware(async (c, next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader) return c.text('', 401);
  const authData = parseAuthHeader(authHeader);

  if (!authData) return c.text('', 401);

  await next();
});

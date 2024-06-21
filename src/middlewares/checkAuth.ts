import { createMiddleware } from 'hono/helper/factory/index.ts';
import { parseAuthHeader } from '@/services/Auth.ts';
import * as jwt from '@cross/jwt';

export const checkAuth = createMiddleware(async (c, next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader) return c.text('', 401);
  const authData = parseAuthHeader(authHeader);

  if (!authData) return c.text('', 401);
  const { token, email } = authData;

  if (!token || !email) return c.text('', 401);

  const kv = new Deno.Kv();
  const { value: secret } = await kv.get<string>(['auth', email as string]);
  kv.close();

  if (!secret) return c.text('', 401);

  const isValid = await jwt
    .verifyJWT(token, secret)
    .then(() => true)
    .catch(() => false);

  if (!isValid) return c.text('', 401);
  await next();
});

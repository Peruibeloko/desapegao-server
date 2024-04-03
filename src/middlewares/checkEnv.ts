import { createMiddleware } from 'hono/helper/factory/index.ts';

export const usingEnv = (keys: ReadonlyArray<string>) => {
  return createMiddleware(async (c, next) => {
    const env: Record<(typeof keys)[number], string> = {};
    for (const key of keys) {
      const result = Deno.env.get(key);

      if (result === undefined) return c.text('Missing environment variables', 500);
      env[key] = result;
    }

    c.set('env', env);
    await next();
  });
};

import { Hono, validator } from 'hono/mod.ts';
import { usingSchema } from '@/middlewares/usingSchema.ts';
import { LoginSchema } from '@/models/Auth.ts';
import { login } from '@/services/Auth.ts';
import { checkAuth } from '@/middlewares/checkAuth.ts';

interface State {
  Variables: {
    reqId: string;
  };
}

const auth = new Hono<State>();

auth.post('/check', checkAuth, c => c.text('', 200));
auth.post('/login', validator('json', usingSchema(LoginSchema)), async c => {
  const { email, otp } = c.req.valid('json');

  const token = await login(email, otp);

  if (token === null) return c.text('', 401);

  return c.text(token, 200);
});

export default auth;

import { Hono } from 'hono/mod.ts';
import { cors } from 'hono/middleware.ts';
import listingRouter from '@/controllers/Listing.ts';
import callbackRouter from '@/controllers/Callback.ts';

interface State {
  Variables: {
    reqId: string;
  };
}

const app = new Hono<State>();

app.use('*', cors());

app.use('*', async (c, next) => {
  const reqId = crypto.randomUUID();
  c.set('reqId', reqId);
  console.log(`[${reqId}]`, c.req.method, c.req.path, await c.req.json());
  await next();
});

app.get('/', c => c.text('Hello Deno!'));

app.route('/listing', listingRouter);
app.route('/callback', callbackRouter);

Deno.serve(app.fetch);

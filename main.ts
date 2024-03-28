import { Hono } from 'hono/mod.ts';
import { cors } from 'hono/middleware.ts';
import listingRouter from '@/controllers/Listing.ts';
import callbackRouter from '@/controllers/Callback.ts';
import { ConnPool } from '@/clients/ConnPool.ts';
import { dq } from '@/clients/Q.ts';

interface State {
  Variables: {
    connPool: ConnPool;
  };
}

const app = new Hono<State>();
const dbPool = await ConnPool.init(10);

app.use('*', cors());

app.use(async (c, next) => {
  c.set('connPool', dbPool);
  await next();
});

app.get('/', c => c.text('Hello Deno!'));

app.route('/listing', listingRouter);
app.route('/callback', callbackRouter);

Deno.serve(app.fetch);
Deno.cron('Queue consumer', { minute: { every: 15 } }, async () => {
  const conn = await Deno.openKv();
  if (!conn) throw new Error("Can't connect to the database");

  const listing = dq(conn);
  // TODO enviar para grupos
});

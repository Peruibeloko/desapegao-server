import { Hono, validator } from 'hono/mod.ts';
import using from '@/middlewares/validate.ts';
import { ListingSchema } from '@/models/Listing.ts';
import { Queue } from '@/clients/Queue.ts';

const listing = new Hono<{
  Variables: {
    kv: Deno.Kv;
  };
}>();

listing.use(async (c, next) => {
  c.set('kv', await Deno.openKv());
  await next();
});

listing.post('/', validator('json', using(ListingSchema)), async c => {
  const listing = c.req.valid('json');
  const q = new Queue(c.get('kv'));
  const qSize = await q.enq(listing);

  return c.json(null, qSize ? 200 : 500);
});

export default listing;

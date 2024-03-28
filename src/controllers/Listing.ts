import { Hono, validator } from 'hono/mod.ts';
import using from '@/middlewares/validate.ts';
import { ListingSchema } from '@/models/Listing.ts';
import { nq } from '@/clients/Q.ts';
import { ConnPool } from '@/clients/ConnPool.ts';

interface State {
  Variables: {
    connPool: ConnPool;
  };
}

const listing = new Hono<State>();

listing.post('/', validator('json', using(ListingSchema)), async c => {
  const listing = c.req.valid('json');
  const conn = await c.get('connPool').getConnection(3);
  if (conn === null) return c.text('No database connections available, please wait and try again', 503);

  const success = await nq(listing, conn);

  return c.text('', success ? 200 : 500);
});

export default listing;

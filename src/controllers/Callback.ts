import { Hono, validator } from 'hono/mod.ts';
import using from '@/middlewares/validate.ts';
import { ListingSchema } from '@/models/Listing.ts';
import { ConnPool } from '@/clients/ConnPool.ts';

interface State {
  Variables: {
    connPool: ConnPool;
  };
}

const callback = new Hono<State>();

callback.post('/', validator('json', using(ListingSchema)), async c => {
  // TODO implementar lógica de callback do webhook da Pagar.me
});

export default callback;

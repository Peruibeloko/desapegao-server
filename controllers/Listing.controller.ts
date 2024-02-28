import { Hono } from 'deps';
import { validateWith } from 'helpers';
import { createListing, getListings } from 'service/Listing.service.ts';
import { CreateListingInput } from 'types/service.typings.ts';

const router = new Hono();

router
  .post('/', async c => {
    const data = validateWith(await c.req.json(), CreateListingInput);
    const result = await createListing(data);

    return c.json(null, result ? 200 : 500);
  })
  .get(async c => {
    const result = await getListings();
    return c.json(result);
  });

export default router;

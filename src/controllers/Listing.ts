import { usingEnv } from '@/middlewares/checkEnv.ts';
import { usingSchema } from '@/middlewares/usingSchema.ts';
import { ListingSchema } from '@/models/Listing.ts';
import { createListing, uploadFTP } from '@/services/Listing.ts';

import { Hono, validator } from 'hono/mod.ts';

const ENV_VARS = ['FTP_URL', 'FTP_PORT', 'FTP_USER', 'FTP_PASS'] as const;

interface State {
  Variables: {
    reqId: string;
    env: Record<(typeof ENV_VARS)[number], string>;
  };
}

const listing = new Hono<State>();

listing.post('/', validator('json', usingSchema(ListingSchema)), async c => {
  const listing = c.req.valid('json');
  const reqId = c.get('reqId');

  const result = await createListing(listing, reqId);

  if (result.isErr()) {
    const err = result.unwrapErr();
    console.error(`[${reqId}]`, err);
    return c.json({ reqId, message: `Error creating listing: ${err}` }, 500);
  }

  return c.text('', 200);
});

listing.post('/ftp', validator('json', usingSchema(ListingSchema)), usingEnv(ENV_VARS), async c => {
  const listing = c.req.valid('json');
  const env = c.get('env');
  const reqId = c.get('reqId');

  const ftp = { url: env.FTP_URL, port: +env.FTP_PORT, user: env.FTP_USER, pass: env.FTP_PASS };

  const result = await uploadFTP(ftp, listing, reqId);

  if (result.isErr()) {
    console.error(`[${reqId}]`, 'Error while connecting', result.unwrapErr());
    return c.json({ reqId, message: 'Error connecting to FTP' }, 500);
  }

  return c.text('', 200);
});

export default listing;

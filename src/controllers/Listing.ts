import { ConnPool } from '@/clients/ConnPool.ts';
import { usingEnv } from '@/middlewares/checkEnv.ts';
import { usingSchema } from '@/middlewares/usingSchema.ts';
import { ListingSchema } from '@/models/Listing.ts';
import { createListing, uploadFTP } from '@/services/Listing.ts';

import { Hono, validator } from 'hono/mod.ts';

const ENV_VARS = ['FTP_URL', 'FTP_PORT', 'FTP_USER', 'FTP_PASS'] as const;

interface State {
  Variables: {
    connPool: ConnPool;
    reqId: string;
    env: Record<(typeof ENV_VARS)[number], string>;
  };
}

const listing = new Hono<State>();

listing.post('/', validator('json', usingSchema(ListingSchema)), async c => {
  const listing = c.req.valid('json');
  const reqId = c.get('reqId');
  const pool = c.get('connPool');

  const [connKey, conn] = await pool.getConnection(3);
  if (conn === null) return c.text('No database connections available, please wait and try again', 503);

  try {
    createListing(listing, conn, reqId);
  } catch (e) {
    pool.thanks(connKey);
    console.error(`[${reqId}]`, 'Error creating listing', e.cause);
    return c.json({ reqId, message: 'Error creating listing' }, 500);
  }

  pool.thanks(connKey);
  return c.text('', 200);
});

listing.post('/ftp', validator('json', usingSchema(ListingSchema)), usingEnv(ENV_VARS), async c => {
  const listing = c.req.valid('json');
  const env = c.get('env');
  const reqId = c.get('reqId');

  const ftp = { url: env.FTP_URL, port: +env.FTP_PORT, user: env.FTP_USER, pass: env.FTP_PASS };

  try {
    await uploadFTP(ftp, listing, reqId);
  } catch (e) {
    console.error(`[${reqId}]`, 'Error while connecting', e);
    return c.json({ reqId, message: 'Error connecting to FTP' }, 500);
  }

  return c.text('', 200);
});

export default listing;

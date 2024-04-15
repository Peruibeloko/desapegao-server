import { ConnPool } from '@/clients/ConnPool.ts';
import { nq } from '@/clients/Q.ts';
import { usingEnv } from '@/middlewares/checkEnv.ts';
import { usingSchema } from '@/middlewares/usingSchema.ts';
import { ListingSchema } from '@/models/Listing.ts';
import { FTPClient } from 'ftp';
import { Hono, validator } from 'hono/mod.ts';
import { decodeBase64 } from 'std/encoding/base64.ts';

const ENV_VARS = ['FTP_URL', 'FTP_PORT', 'FTP_USER', 'FTP_PASS'] as const;

interface State {
  Variables: {
    connPool: ConnPool;
    env: Record<(typeof ENV_VARS)[number], string>;
  };
}

const listing = new Hono<State>();

listing.post('/', validator('json', usingSchema(ListingSchema)), async c => {
  const listing = c.req.valid('json');
  const pool = c.get('connPool');
  const [connKey, conn] = await pool.getConnection(3);
  if (conn === null) return c.text('No database connections available, please wait and try again', 503);

  const success = await nq(listing, conn);
  pool.thanks(connKey);

  return c.text('', success ? 200 : 500);
});

listing.post('/ftp', validator('json', usingSchema(ListingSchema)), usingEnv(ENV_VARS), async c => {
  const listing = c.req.valid('json');
  const env = c.get('env');

  {
    using ftp = new FTPClient(env.FTP_URL, {
      user: env.FTP_USER,
      pass: env.FTP_PASS,
      port: +env.FTP_PORT,
      mode: 'passive'
    });
    
    const [fileType, b64WithHeader] = listing.listingImage.split(';');
    const [, b64ImageData] = b64WithHeader.split(',');
    const [, extension] = fileType.split('/');
    
    const fileName = `${listing.sellerName.toLowerCase()}_${listing.sellerPhone.replaceAll(/^\D$/g, '')}.${extension}`;
    const imageData = decodeBase64(b64ImageData);
    
    console.info(`Connecting to ${env.FTP_USER}@${env.FTP_URL}:${env.FTP_PORT}`);
    try {  
      await ftp.connect();
    } catch (e) {
      console.error('Error while connecting', e);  
    }
    console.info('Uploading', fileName);
    await ftp.upload(fileName, imageData);
  }

  return c.text('', 200);
});

export default listing;

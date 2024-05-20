import { Hono, validator } from 'hono/mod.ts';
import { usingSchema } from '@/middlewares/usingSchema.ts';
import { ConnPool } from '@/clients/ConnPool.ts';
import { processNotification } from '@/services/Callback.ts';
import { WebhookSchema } from '@/models/Webhook.ts';
import { Nothing } from '@/types/global.ts';

interface State {
  Variables: {
    connPool: ConnPool;
    reqId: string;
  };
}

const callback = new Hono<State>();

callback.post('/', validator('json', usingSchema(WebhookSchema)), async c => {
  const pool = c.get('connPool');
  const reqId = c.get('reqId');
  const [connKey, conn] = await pool.getConnection(3);

  const payload = c.req.valid('json');
  const type = payload.type;
  const paymentId = payload.data.id;

  if (type !== 'payment') return c.text('', 200);

  const result = await processNotification(paymentId, conn);

  pool.thanks(connKey);

  if (result !== Nothing) {
    console.error(`${[reqId]}`, result.message);
    return c.json({ reqId, message: result.message }, 500);
  }

  return c.text('', 200);
});

export default callback;

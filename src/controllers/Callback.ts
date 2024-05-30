import { Hono, validator } from 'hono/mod.ts';
import { usingSchema } from '@/middlewares/usingSchema.ts';
import { processNotification } from '@/services/Callback.ts';
import { WebhookSchema } from '@/models/Webhook.ts';

interface State {
  Variables: {
    reqId: string;
  };
}

const callback = new Hono<State>();

callback.post('/', validator('json', usingSchema(WebhookSchema)), async c => {
  const reqId = c.get('reqId');
  const payload = c.req.valid('json');
  const type = payload.type;
  const paymentId = payload.data.id;

  if (type !== 'payment') return c.text('', 200);

  const result = await processNotification(paymentId);

  if (result.isErr()) {
    const errMsg = result.unwrapErr();
    console.error(`${[reqId]}`, errMsg);
    return c.json({ reqId, message: errMsg }, 500);
  }

  return c.text('', 200);
});

export default callback;

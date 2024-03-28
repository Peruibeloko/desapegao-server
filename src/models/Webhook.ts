import { z } from 'zod';

export type Webhook = z.infer<typeof WebhookSchema>;
export const WebhookSchema = z.object({
  // TODO implementar verificação de payload do webhook da pagar.me
});

import { ZodError, z } from 'zod';

export type Webhook = z.infer<typeof WebhookSchema>;
export const WebhookSchema = z.object({
  type: z.enum(['payment', 'plan', 'subscription', 'invoice']),
  data: z
    .object({
      id: z.string()
    })
    .required()
});

export function formatError(error: ZodError) {
  return error.issues.reduce(
    (result, el) => ({
      ...result,
      [el.path.join('.')]: el.message
    }),
    {}
  );
}

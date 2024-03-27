import { z } from 'zod';

export type Order = z.infer<typeof OrderSchema>;
export const OrderSchema = z.object({
  sellerName: z.string(),
  value: z.number(),
  paymentMethod: z.enum(['credit_card', 'boleto', 'voucher', 'bank_transfer', 'safety_pay', 'checkout', 'cash', 'pix'])
});

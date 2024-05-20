import { paymentReceived } from '@/clients/Pending.ts';
import { nq } from '@/clients/Q.ts';
import { Nothing } from '@/types/global.ts';

export async function processNotification(paymentId: string, conn: Deno.Kv): Promise<Maybe<Error>> {
  const result = await paymentReceived(paymentId, conn);
  if (result instanceof Error) return result;
  await nq(result, conn);
  return Nothing;
}

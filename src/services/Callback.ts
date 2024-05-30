import { paymentReceived } from '@/clients/Pending.ts';
import { nq } from '@/clients/Q.ts';
import { Ok, Err, Result } from '@fp-utils/result';

export async function processNotification(paymentId: string) {
  const result = await paymentReceived(paymentId);
  if (Result.isErr(result)) return Err(result);
  await nq(result.unwrap());
  return Ok();
}

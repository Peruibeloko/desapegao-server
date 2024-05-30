import { Listing } from '@/models/Listing.ts';
import { Ok, Err } from '@fp-utils/result';

export function paymentCreated(paymentId: number, listing: Listing) {
  new Deno.Kv().set(['payment_pending', paymentId], listing);
}

export async function paymentReceived(paymentId: string) {
  const conn = new Deno.Kv();
  const listing = await conn.get(['payment_pending', paymentId]);

  if (listing.value === null) return Err(`No listing found for paymentId ${paymentId}`);

  conn.delete(listing.key);
  return Ok(listing.value as Listing);
}

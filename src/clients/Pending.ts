import { Listing } from '@/models/Listing.ts';

export function paymentCreated(paymentId: number, listing: Listing, conn: Deno.Kv) {
  conn.set(['payment_pending', paymentId], listing);
}

export async function paymentReceived(paymentId: string, conn: Deno.Kv): Promise<Result<Listing>> {
  const listing = await conn.get(['payment_pending', paymentId]);

  if (listing.value === null) return new Error(`No listing found for paymentId ${paymentId}`);

  conn.delete(listing.key);
  return listing.value as Listing;
}

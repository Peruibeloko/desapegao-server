import { Listing } from '@/models/Listing.ts';

/**
 * Checks if specified seller is on cooldown
 * @param sellerPhone The seller's phone number
 * @param conn A resolved connection to Deno KV
 * @returns If the seller is in cooldown
 */
export async function isInCooldown(sellerPhone: string) {
  const conn = new Deno.Kv();
  const searchResult = await conn.get(['cooldown', sellerPhone]);
  conn.close();

  if (searchResult.value) return true;
  return false;
}

/**
 * Enqueues a listing for later processing
 * @param listing The listing object
 * @param conn A resolved connection to Deno KV
 * @returns If the operation was successful
 */
export async function nq(listing: Listing) {
  const conn = new Deno.Kv();
  const ONE_DAY = 1000 * 60 * 60 * 24;

  const today = new Date().toISOString();

  await conn.set(['listing', today], listing);
  await conn.set(['cooldown', listing.sellerPhone], true, {
    expireIn: ONE_DAY
  });
  conn.close();
}

/**
 * Dequeues a listing for processing
 * @returns The listing object
 */
export async function dq() {
  const conn = new Deno.Kv();
  const iter = conn.list({ prefix: ['listing'] }, { limit: 1 });
  const listing = await iter.next().then(el => el.value);

  if (!listing) {
    conn.close();
    return null;
  }

  conn.delete(listing.key);
  conn.close();
  return listing.value as Listing;
}

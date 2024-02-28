import { z } from 'deps';
import { CreateListingInput } from 'types/service.typings.ts';

export async function createListing(data: z.infer<typeof CreateListingInput>) {
  const kv = await Deno.openKv();
  const result = await kv.set(['listings', data.name], 'it works!');
  kv.close();

  return result.ok;
}

export async function getListings() {
  const kv = await Deno.openKv();

  const result = kv.list({
    prefix: ['listings']
  });

  const out = [];
  for await (const item of result) {
    out.push(item);
    result.next();
  }

  kv.close();

  return out;
}

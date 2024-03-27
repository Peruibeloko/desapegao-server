import { Listing } from '@/models/Listing.ts';

const FIFTEEN_MINUTES = 1000 * 60 * 15;

export class Queue {
  #instance: Deno.Kv;
  #sizeInternal = 0;

  /**
   * Creates a specialized class for manipulating KV Queues
   * @param kv await Deno.openKv()
   */
  constructor(kv: Deno.Kv) {
    this.#instance = kv;
  }

  /**
   * Enqueues a listing for delivery
   * @param listing The product listing
   */
  async enq(listing: Listing) {
    // await this.#instance.enqueue(listing, {
    //   delay: this.#sizeInternal * FIFTEEN_MINUTES + FIFTEEN_MINUTES
    // });
    await this.#instance.enqueue(listing);

    this.#sizeInternal += 1;
    
    return this.#sizeInternal;
  }

  get size() {
    return this.#sizeInternal;
  }
}

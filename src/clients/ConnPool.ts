interface Pool {
  [key: string]: {
    available: boolean;
    conn: Deno.Kv;
  };
}

const sleep = (ms: number) => new Promise((resolve, _) => setTimeout(() => resolve(null), ms));

/**
 * Manages a pool of connections to Deno KV
 *
 * Use the static `ConnPool.init()` method for creation
 */
export class ConnPool {
  #pool: Pool;

  /**
   * @param conns A list of resolved Deno KV connections
   * @hideconstructor
   */
  constructor(conns: Deno.Kv[]) {
    this.#pool = conns.reduce(
      (acc, conn) => ({
        ...acc,
        [crypto.randomUUID()]: {
          available: true,
          conn
        }
      }),
      {}
    );
  }

  /**
   * Creates a connection pool for Deno KV
   * @param size Pool size
   * @returns A new instance of a managed connection pool
   */
  public static async init(size: number) {
    const wip: Deno.Kv[] = [];
    for (let n = 0; n < size; n++) {
      wip.push(await Deno.openKv());
    }
    return new ConnPool(wip);
  }

  /**
   * Tries to get a connection up to `attempts` times
   * @returns Either a connection or null
   */
  public async getConnection(attempts: number) {
    for (let i = 0; i < attempts; i++) {
      for (const key in this.#pool) {
        if (!this.#pool[key].available) continue;
        this.#pool[key].available = false;
        return [key, this.#pool[key].conn] as [key: string, conn: Deno.Kv];
      }
      await sleep(1000);
    }
    throw new Error('No available connections');
  }

  public thanks(key: string) {
    if (this.#pool[key].available) return;
    this.#pool[key].available = true;
  }
}

type MemItem<T> = {
  locked: boolean;
  expired: number;
  accessed: number;
  value: T;
  fetch(): T;
};

export class MemCache {
  items: Record<string, MemItem<any>> = {};
  constructor(private expired: number) {

  }
  async get<T>(key: string, fetch: () => T): Promise<T> {
    const now = Date.now();
    let it = this.items[key];
    if (!it) {
      it = {
        locked: true,
        expired: now + this.expired,
        accessed: now,
        value: undefined as any,
        fetch,
      };
      this.items[key] = it;
      it.value = await it.fetch();
      it.expired = Date.now() + this.expired;
      it.locked = false;
    } else if (it.expired <= now && !it.locked) {
      it.locked = true;
      it.value = await it.fetch();
      it.expired = Date.now() + this.expired;
      it.locked = false;
    }
    it.accessed = now;
    return it.value;
  }
}

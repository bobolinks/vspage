/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-undef */
import { envVersion } from '../env';
import Log from './log';

function versionCompatible(base: string, ver: string) {
  const vb = base.split('.').map(e => parseInt(e, 10));
  const v1 = ver.split('.').map(e => parseInt(e, 10));
  return vb[0] === v1[0];
}

type DataPack = {
  ver: string;
  data: Record<string, any>;
};

type Listener = (name: string, root: any, key: string | symbol, value: any) => void;

export class Watcher {
  private listeners: Record<string, Array<{ owner: any, fn: Listener }>>;

  constructor() {
    this.listeners = {};
  }

  addListener(owner: any, name: string | Array<string>, fn: Listener) {
    const names = Array.isArray(name) ? name : [name];
    for (const it of names) {
      let items = this.listeners[it];
      if (!items) {
        items = [];
        this.listeners[it] = items;
      }
      items.push({ owner, fn });
    }
  }

  removelistener(owner: any, name?: string) {
    const ls = name ? [this.listeners[name]] : Object.values(this.listeners);
    ls.forEach(elements => {
      if (!elements) return;
      for (let i = 0; i < elements.length; i++) {
        if (elements[i].owner !== owner) {
          elements.splice(i, 1);
          i--;
        }
      }
    });
  }

  onUpdated(name: string, root: any, key: string | symbol, value: any) {
    const listeners = this.listeners[key as any];
    if (listeners) {
      listeners.forEach(it => {
        it.fn.call(it.owner, name, root, key, value);
      });
    }
    const lsStars = this.listeners['*'];
    if (lsStars) {
      lsStars.forEach(it => {
        it.fn.call(it.owner, name, root, key, value);
      });
    }
  }

  onflush?(name: string, root: any): void;
}

/** data proxy */
const isProxy = Symbol('isProxy');

class ProxyHandler {
  name: string;

  path: string;

  watcher: Watcher;

  parent?: ProxyHandler;

  constructor(name: string, w: Watcher, parent?: ProxyHandler) {
    this.name = name;
    this.watcher = w;
    this.parent = parent;
    const names: Array<string> = [name];
    let n: any = parent;
    while (n) {
      names.push(n.name);
      n = n.parent;
    }
    this.path = names.reverse().join('.');
  }

  get(target: any, p: string | symbol, receiver: any): any {
    if (p === isProxy) {
      return true;
    }
    const value = Reflect.get(target, p, receiver);
    if (typeof value !== 'object' || value === null || value[isProxy]) {
      return value;
    }
    const proxy = new Proxy(value, new ProxyHandler(p as string, this.watcher, this));
    Reflect.set(target, p, proxy, receiver);
    return proxy;
  }

  set(target: any, p: string | symbol, value: any, receiver: any): boolean {
    const ovalue = Reflect.get(target, p, receiver);
    if (ovalue === value) {
      return true;
    }
    const rs = Reflect.set(target, p, value, receiver);
    if (rs) {
      this.watcher.onUpdated(this.path, null, p, value);
    }
    return rs;
  }
}

export function Storage<T = Record<string, any>>(
  name: string, version: string, data: T, watcher?: Watcher, isPersistent?: boolean,
): T {
  let pack = null as any as DataPack;
  let path = '';
  let fs: WechatMiniprogram.FileSystemManager | null = null;
  const begin = Date.now();
  if (isPersistent) {
    /** load data from disk */
    path = `${wx.env.USER_DATA_PATH}/${name}_${envVersion}.json`;
    fs = wx.getFileSystemManager();
    try {
      pack = JSON.parse(fs.readFileSync(path, 'utf-8') as string) as DataPack;
    } catch (_e) {
      pack = {} as any as DataPack;
    }
  } else {
    /** load data from cache */
    pack = JSON.parse(wx.getStorageSync(name) || '{}') as DataPack;
  }
  if (pack.ver && !versionCompatible(version, pack.ver)) {
    Log.warn('数据版本已不兼容，内容已被重置');
  } else {
    Object.assign(data, pack.data || {});
  }
  const elapsed = Date.now() - begin;
  console.log('loaded', { name, elapsed });

  const throttle = {
    tick: 0,
    task: 0 as any,
    values: {} as any as Record<string, any>,
  };

  const proxyHandler = new ProxyHandler(name, {
    onUpdated(p: string, _root: any, key: string | symbol, value: any) {
      if (!throttle.task) {
        throttle.task = setTimeout(() => {
          throttle.task = undefined;
          if (watcher?.onflush) {
            watcher.onflush(p, data);
          }
          const begin = Date.now();
          if (fs) {
            fs.writeFileSync(path as any, JSON.stringify({ ver: version, data }), 'utf-8');
          } else {
            wx.setStorageSync(name, JSON.stringify({ ver: version, data }));
          }
          const elapsed = Date.now() - begin;
          console.log('save', { p, elapsed });

          // send notification to watchers
          if (watcher) {
            for (const [k, v] of Object.entries(throttle.values)) {
              watcher.onUpdated(p, data, k, v);
            }
            throttle.values = {};
          }
        }, 0);
      }
      if (watcher) {
        throttle.values[key as any] = value;
      }
    },
  } as any);
  return new Proxy(data, proxyHandler);
}

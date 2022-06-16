/* eslint-disable */
/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-undef */
import { envVersion } from '../env';
import Log from './log';
function versionCompatible(base, ver) {
    const vb = base.split('.').map(e => parseInt(e, 10));
    const v1 = ver.split('.').map(e => parseInt(e, 10));
    return vb[0] === v1[0];
}
export class Watcher {
    constructor() {
        this.listeners = {};
    }
    addListener(owner, name, fn) {
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
    removelistener(owner, name) {
        const ls = name ? [this.listeners[name]] : Object.values(this.listeners);
        ls.forEach(elements => {
            if (!elements)
                return;
            for (let i = 0; i < elements.length; i++) {
                if (elements[i].owner !== owner) {
                    elements.splice(i, 1);
                    i--;
                }
            }
        });
    }
    onUpdated(name, root, key, value) {
        const listeners = this.listeners[key];
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
}
/** data proxy */
const isProxy = Symbol('isProxy');
class ProxyHandler {
    constructor(name, w, parent) {
        this.name = name;
        this.watcher = w;
        this.parent = parent;
        const names = [name];
        let n = parent;
        while (n) {
            names.push(n.name);
            n = n.parent;
        }
        this.path = names.reverse().join('.');
    }
    get(target, p, receiver) {
        if (p === isProxy) {
            return true;
        }
        const value = Reflect.get(target, p, receiver);
        if (typeof value !== 'object' || value === null || value[isProxy]) {
            return value;
        }
        const proxy = new Proxy(value, new ProxyHandler(p, this.watcher, this));
        Reflect.set(target, p, proxy, receiver);
        return proxy;
    }
    set(target, p, value, receiver) {
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
export function Storage(name, version, data, watcher, isPersistent) {
    let pack = null;
    let path = '';
    let fs = null;
    const begin = Date.now();
    if (isPersistent) {
        /** load data from disk */
        path = `${wx.env.USER_DATA_PATH}/${name}_${envVersion}.json`;
        fs = wx.getFileSystemManager();
        try {
            pack = JSON.parse(fs.readFileSync(path, 'utf-8'));
        }
        catch (_e) {
            pack = {};
        }
    }
    else {
        /** load data from cache */
        pack = JSON.parse(wx.getStorageSync(name) || '{}');
    }
    if (pack.ver && !versionCompatible(version, pack.ver)) {
        Log.warn('数据版本已不兼容，内容已被重置');
    }
    else {
        Object.assign(data, pack.data || {});
    }
    const elapsed = Date.now() - begin;
    console.log('loaded', { name, elapsed });
    const throttle = {
        tick: 0,
        task: 0,
        values: {},
    };
    const proxyHandler = new ProxyHandler(name, {
        onUpdated(p, _root, key, value) {
            if (!throttle.task) {
                throttle.task = setTimeout(() => {
                    throttle.task = undefined;
                    if (watcher?.onflush) {
                        watcher.onflush(p, data);
                    }
                    const begin = Date.now();
                    if (fs) {
                        fs.writeFileSync(path, JSON.stringify({ ver: version, data }), 'utf-8');
                    }
                    else {
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
                throttle.values[key] = value;
            }
        },
    });
    return new Proxy(data, proxyHandler);
}

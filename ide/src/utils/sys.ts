import Net from './net';

type Dependence = {
  type: 'stylesheet' | 'module' | 'source';
  value: string;
  timestamp: number;
  attrs: Record<string, string>;
};

export default {
  modules: {} as Record<string, any>,
  mountLink(id: string, path: string, timestamp: number, attrs?: Record<string, string>, contentDocument?: Document | null): Promise<any> {
    if (/^[^./]/.test(path)) {
      path = `/${path}`;
    }
    return new Promise((reslove, reject) => {
      const d = contentDocument || document;
      let o = d.getElementById(id) as HTMLLinkElement;
      if (o && o.getAttribute('t') === timestamp.toString()) {
        return reslove(o);
      }
      const e = d.createElement('link');
      e.setAttribute('id', id);
      e.rel = 'stylesheet';
      e.href = path;
      e.setAttribute('t', timestamp.toString());
      for (const [k, v] of Object.entries(attrs || {})) {
        e.setAttribute(k, v);
      }
      e.onload = () => {
        reslove(e);
      }
      e.onerror = (err) => {
        reject(err);
      }
      if (o) {
        d.head.replaceChild(e, o);
      } else {
        d.head.appendChild(e);
      }
    });
  },
  mountSource(id: string, source: string, timestamp: number, attrs: Record<string, string>, contentDocument?: Document | null) {
    return new Promise((reslove, reject) => {
      const d = contentDocument || document;
      let e = d.getElementById(id) as HTMLScriptElement;
      if (e && e.getAttribute('t') !== timestamp.toString()) {
        d.head.removeChild(e);
        e = null as any;
      }
      if (!e) {
        e = d.createElement('script');
        e.setAttribute('id', id);
        (e as any).__resolve = reslove;
        e.type = 'module';
        e.innerHTML = `
        (async function() {
          ${source};
          const e = document.getElementById('${id}');
          e.__resolve(e);
        })();
        `;
        e.setAttribute('t', timestamp.toString());
        for (const [k, v] of Object.entries(attrs)) {
          e.setAttribute(k, v);
        }
        e.onerror = (err) => {
          reject(err);
        }
        d.head.appendChild(e);
      } else {
        reslove(e);
      }
    });
  },
  mountModule(id: string, path: string, timestamp: number, attrs: Record<string, string>, contentDocument?: Document | null) {
    if (/^[^./]/.test(path)) {
      path = `/${path}`;
    }
    if (path.indexOf('?') === -1) {
      path += '?import=module';
    } else {
      path += '&import=module';
    }
    return this.mountSource(id, `await import('${path}')`, timestamp, attrs, contentDocument);
  },
  mountDeps(deps: Record<string, Dependence>, contentDocument?: Document | null): Promise<any> {
    return Promise.all(Object.entries(deps).map(([id, dep]) => {
      if (dep.type === 'stylesheet') {
        return this.mountLink(id, dep.value, dep.timestamp, dep.attrs, contentDocument);
      } else if (dep.type === 'module') {
        return this.mountModule(id, dep.value, dep.timestamp, dep.attrs, contentDocument);
      } else {
        return this.mountSource(id, dep.value, dep.timestamp, dep.attrs, contentDocument);
      }
    }));
  },
  async import(path: string) {
    if (!(window as any).import) {
      (window as any).import = new Function('path', 'return import(path)');
    }
    try {
      return (await (window as any).import(path)).default;
    } catch (e: any) {
      if ((window as any).wxAlert) {
        (window as any).wxAlert({
          type: 'error',
          message: `[import ${path}]\n${e.message || e.toString()}`,
        });
      }
      throw e;
    }
  },
  require(path: string) {
    try {
      let m = this.modules[path];
      if (m) {
        return m;
      }
      const code = Net.requestSync({
        url: path,
        method: 'GET',
      });
      m = eval(`(function(){var module = {exports: {}}; var exports = module.exports; ${code}; return exports;})()`);
      this.modules[path] = m;
      return m;
    } catch (e: any) {
      if ((window as any).wxAlert) {
        (window as any).wxAlert({
          type: 'error',
          message: `[require ${path}]\n${e.message || e.toString()}`,
        });
      }
      throw e;
    }
  },
  randomString(length: number) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-';
    const l = chars.length;
    return Array(length).fill(0).map((_) => chars[Math.floor(Math.random() * l)]).join('');
  },
};


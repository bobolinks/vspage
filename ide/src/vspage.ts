
import { readonly } from 'vue';
import { VsPage as IVsPage, VsCode as IVsCode, Editor as IEditor, StylePatch, PageData, MessageData } from 'vspage';
import store, { files } from './store';
import wxApp from './core/app';
import { renderPage, updateSelector } from './core/page';
import { Sys } from './utils';

const w = window as any;

export const VsPage = new class implements IVsPage {
  syncAppConfig(appConfig: AppConfig): void {
    Object.assign(store.config, appConfig);
    wxApp.relaunch({});
  }
  setCurrentPage(path: string, data: PageData): void {
    wx.redirectTo({
      ...data,
      url: path,
    });
  }
  updatePage(path: string, data: Partial<PageData>): void {
    if (!store.pages.length || !data.wxml) {
      return;
    }
    const page = store.pages[store.pages.length - 1];
    if (data.wxml) {
      (page.iframe.contentWindow as any).wxml = data.wxml;
    }
    renderPage(page);
  }
  /** 更新文件wxss|xs */
  updateFile(path: TyPath, timestamp: number) {
    if (!timestamp) {
      delete files[path];
    } else {
      files[path] = { timestamp };
    }
    if (/\.(t|j)s$/i.test(path)) {
      wxApp.relaunch({
        url: path.replace(/\.(t|j)s$/i, ''),
      });
    } else {
      const simulator = document.querySelector('#simulator > iframe') as HTMLIFrameElement;
      const doc = simulator?.contentDocument;
      if (!doc) {
        throw new Error('doc is null');
      }
      const pathWithSlash = path.replace(/^([^/])/g, '/$1');
      if (pathWithSlash === '/app.wxss') {
        Sys.mountLink('stylesheet-app', `${pathWithSlash}?t=${timestamp}`, timestamp, {}, doc);
      } else if (pathWithSlash.startsWith(store.currPage)) {
        Sys.mountLink('stylesheet-page', `${pathWithSlash}?t=${timestamp}`, timestamp, {}, doc);
      } else {
        const links = doc.querySelectorAll('link[rel=stylesheet]');
        let linkFound: HTMLLinkElement | null = null;
        for (let i = 0; i < links.length; i++) {
          const link = links[i] as HTMLLinkElement;
          if (link.href.indexOf(path) !== -1) {
            linkFound = link;
            break;
          }
        }
        if (linkFound) {
          const query = (linkFound.href.split('?')[1] || '').replace(/t=\d+/, `t=${timestamp}`);
          Sys.mountLink(linkFound.id, `${pathWithSlash}?${query}`, timestamp, {}, doc);
        } else {
          throw new Error('link not found');
        }
      }
    }
  }
  select(target: string | null): void {
    const simulator = document.querySelector('#simulator > iframe') as HTMLIFrameElement;
    const doc = simulator?.contentDocument;
    if (doc) {
      const element = doc.querySelector(`[data-attr-path='${target}']`) as any;
      updateSelector(doc, element);
    }
  }
};

w.VsPage = VsPage;

export const VsCode = new class implements IVsCode {
  private queue: Array<MessageRequest> = [];
  private token: number = -1;

  constructor() {
    window.addEventListener('message', async (event) => {
      const message = event.data as MessageBase;
      console.log('received', message);
      if ((message as MessageResponse).isrsp) {
        const rsp = message as MessageResponse;
        const req = this.queue.find(e => e.token === rsp.token);
        if (req) {
          req.resolve(message);
        } else {
          console.log('unhandled message', message);
        }
      } else {
        const req = message as MessageRequest;
        const method = (VsPage as any)[message.method];
        if (method) {
          const rs = await method.call(VsPage, ...req.params);
          try {
            this.response(rs, req);
          } catch (e) {
            this.response(e, req, -1);
          }
        } else {
          console.log('unhandled message', message);
        }
      }
    });
  }
  patchStyle(path: TyPath, target: string, patch: StylePatch): void {
    this.request({
      method: 'patchStyle',
      params: [path, target, patch],
    });
  }
  select(path: TyPath, target: string | null): void {
    this.request({
      method: 'select',
      params: [path, target],
    });
  }
  alert(data: string | MessageData): void {
    this.request({
      method: 'alert',
      params: [data],
    });
  }
  private request(m: MessageBase & { params: Array<any>; }): Promise<any> {
    (m as MessageRequest).token = this.token--;
    (m as any).toService = true;
    const req = Object.assign({}, m) as unknown as MessageRequest;
    req.timer = setTimeout(((token: number) => {
      const req = this.queue.find(e => e.token === token);
      if (req) {
        req.timer = undefined as any;
        req.reject('timeout');
      }
    }).bind(this, req.token), 5000);
    this.queue.push(req);
    return new Promise((resolve, reject) => {
      req.resolve = resolve;
      req.reject = reject;
      window.parent?.postMessage(m, '*');
    })
      .then((rsp) => {
        clearTimeout(req.timer);
        req.timer = undefined as any;
        return rsp;
      })
      .catch((e) => {
        (req as any).error = e;
      })
      .finally(() => {
        if (req.timer) {
          clearTimeout(req.timer);
          req.timer = undefined as any;
        }
        this.queue.splice(this.queue.indexOf(req), 1);
        const { error } = req as any;
        if (error) {
          throw error;
        }
      });
  }
  private response(data: any, r: MessageRequest, code?: number) {
    window.parent?.postMessage({ toService: true, isrsp: true, token: r.token, method: r.method, code, data }, '*');
  }
};

w.VsCode = VsCode;

export const Editor = new class implements IEditor {
  select(element: HTMLElement | null): void {
    if (element) {
      const ast = (element as any).__ast as TyAst;
      store.swap.ast = ast;
      store.swap.element = readonly(element);
    } else {
      store.swap.ast = readonly(null as any);
      store.swap.element = readonly(null as any);
    }
    VsCode.select(store.currPage, element?.getAttribute('data-attr-path') as string);
  }
  patchStyle(patch: StylePatch): boolean {
    if (!store.swap.ast) {
      return false;
    }
    const ast = store.swap.ast as any;
    const style = ast.style || ((ast as any).style = {}) as any;
    const element = store.swap.element as HTMLElement;
    let changed = false;
    for (const [key, value] of Object.entries(patch)) {
      if (value === false) {
        if (Object.hasOwnProperty.call(style, key)) {
          delete style[key];
          element.style.setProperty(key, '');
          changed = true;
        }
        continue;
      }
      if (!Object.hasOwnProperty.call(style, key)) {
        changed = true;
        style[key] = value;
        element.style.setProperty(key, value);
      } else if (style[key] !== patch[key]) {
        changed = true;
        style[key] = value;
        element.style.setProperty(key, value);
      }
    }
    if (changed) {
      VsCode.patchStyle(store.currPage, element.getAttribute('data-attr-path') as string, patch);
    }
    return changed;
  }
};

w.Editor = Editor;

w.wxAlert = VsCode.alert.bind(VsCode);
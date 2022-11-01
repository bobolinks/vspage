import { Sys } from '../../utils/index';
import store from '../../store';
import { bindPage, renderPage, } from '../page';
import { VsCode } from '../../vspage';

let instance = null as WechatMiniprogram.App.Options<any>;

interface WxGlobal {
  App: WechatMiniprogram.App.Constructor;
  getApp: WechatMiniprogram.App.GetApp;
  Page: WechatMiniprogram.Page.Constructor;
  getCurrentPages: WechatMiniprogram.Page.GetCurrentPages;
  Component: WechatMiniprogram.Component.Constructor;
  require(module: string): any;
}

const wxInstance: WechatMiniprogram.Wx = {} as any;
const wxInstanceOrg = wx;

Object.assign(wxInstance, wx);

if (typeof global !== 'undefined') {
  (global as any).wx = wxInstance;
}
if (typeof globalThis !== 'undefined') {
  (globalThis as any).wx = wxInstance;
}

(window as any).wx = wxInstance;

export const wxGlobal: WxGlobal = {
  App(options) {
    instance = options;
    options.onLaunch?.call(options, {
      path: store.homePage,
      query: {},
      scene: 1001,
      shareTicket: '',
    });
  },
  getApp() {
    return instance;
  },
  Page(options) {
    const pages = wxGlobal.getCurrentPages();
    const currPage = pages[pages.length - 1];
    bindPage(currPage, options);
    const [, query] = store.currPage.split('?');
    try {
      currPage.onLoad(Object.fromEntries((query || '').split('&').map(v => v.split('='))));
      currPage.onShow();
      currPage.onReady();
    } catch (e: any) {
      VsCode.alert({
        type: 'error',
        message: e.message || e.toString(),
      });
    }
    if (!currPage.rendered) {
      renderPage(currPage);
    }
  },
  getCurrentPages() {
    return store.pages as any;
  },
  Component(options) {
    const component = store.components[store.currComponentPath];
    if (!component || component.options) {
      throw '';
    }
    component.bind(options);
    return '';
  },
  require(file): any {
    return Sys.require(file);
  }
};

Object.assign(window, wxGlobal);
(window as any).wxGlobal = wxGlobal;


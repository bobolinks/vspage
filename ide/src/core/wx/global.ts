import { Sys } from '../../utils/index';
import store from '../../store';
import { bindPage, } from '../page';
import { TComponentClass } from '../component';

let instance = null as WechatMiniprogram.App.Options<any>;

interface WxGlobal {
  App: WechatMiniprogram.App.Constructor;
  getApp: WechatMiniprogram.App.GetApp;
  Page: WechatMiniprogram.Page.Constructor;
  getCurrentPages: WechatMiniprogram.Page.GetCurrentPages;
  Component: WechatMiniprogram.Component.Constructor;
  require(module: string): Promise<any>;
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
    currPage.onLoad();
    currPage.onShow();
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
  require(file): Promise<any> {
    return Sys.import(file);
  }
};

Object.assign(window, wxGlobal);
(window as any).wxGlobal = wxGlobal;


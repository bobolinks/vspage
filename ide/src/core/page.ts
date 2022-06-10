import store, { files } from '../store';
import { TyAttrsMap } from '../utils/dom';
import { Sys, Cache, Wxml, Dom } from '../utils/index';
import { formatUsingCompoents } from './component';
import { wxGlobal } from './wx/global';

type WxPageInstance = WechatMiniprogram.Page.Instance<WechatMiniprogram.Page.DataOption, WechatMiniprogram.Page.CustomOption>;
type WxPageOptions = WechatMiniprogram.Page.Options<any, any>;

export function bindPage(page: WxPageInstance, options?: WxPageOptions) {
  Object.assign(page, options);
  if (options.options) {
    renderPage(page);
  }
}

export function renderPage(page: WxPageInstance) {
  const d = page.iframe.contentDocument;
  if (!d) {
    throw '';
  }
  const wxml = (page.iframe.contentWindow as any).wxml;
  const ast = Wxml.toAst(wxml);
  const attrsMap: TyAttrsMap = {};
  const propsMap: Record<string, Array<string>> = {};
  if (store.config.usingComponents) {
    for (const [k, v] of Object.entries(store.config.usingComponents)) {
      attrsMap[k] = { 'data-comp-path': v };
      const c = store.components[v];
      if (c) {
        propsMap[k] = Object.keys(c.options?.properties || {});
      }
    }
  }
  if (page.config?.usingComponents) {
    for (const [k, v] of Object.entries(page.config.usingComponents)) {
      attrsMap[k] = { 'data-comp-path': v as any };
      const c = store.components[v as string];
      if (c) {
        propsMap[k] = Object.keys(c.options?.properties || {});
      }
    }
  }
  const domTree = Dom.generate(page, ast, page.data, page.scoped, true, attrsMap, propsMap);
  while (d.body.childNodes.length > 1) {
    d.body.removeChild(d.body.childNodes[1]);
  }
  if (d.body.childNodes.length === 0) {
    d.body.appendChild(domTree);
  } else {
    d.body.replaceChild(domTree, d.body.childNodes[0]);
  }
}

export class TPage implements WxPageInstance {
  data: Object;
  is: string;
  route: string;
  options: Record<string, string | undefined>;
  config: any;
  iframe: HTMLIFrameElement;
  path: string;
  scoped: string;
  constructor(path: string, config: any) {
    const id = path.replace(/[^0-9a-z-]/ig, '-');
    this.data = {};
    this.path = path;
    this.is = '';
    this.route = '';
    this.options = {};
    this.config = config;
    if (config.usingComponents) {
      formatUsingCompoents(config.usingComponents, path);
    }
    this.scoped = `scoped-${Sys.randomString(6)}`;
    this.iframe = document.createElement('iframe');
    this.iframe.setAttribute('seamless', '');
    this.iframe.src = `/${path}.wxml`.replace(/^\/\/+/, '/');
    this.iframe.addEventListener('load', () => {
      if (!this.iframe.contentDocument) {
        throw '';
      }
      const stylesheets = document.getElementsByName('cssshr');
      let cssCode: Array<string> = [];
      let links: Array<string> = [];
      stylesheets.forEach(e => {
        if (e.tagName === 'LINK' && (e as HTMLLinkElement).rel === 'stylesheet') {
          links.push((e as HTMLLinkElement).href);
        } else if (e.tagName === 'STYLE') {
          cssCode.push(e.innerHTML);
        }
      });
      const head = this.iframe.contentDocument.head;
      if (cssCode.length) {
        const style = document.createElement('style');
        style.innerHTML = cssCode.join('\n');
        head.insertBefore(style, head.children[0]);
      }
      links.forEach(link => {
        const l = document.createElement('link');
        l.rel = 'stylesheet';
        l.href = link;
        head.insertBefore(l, head.children[1]);
      });
      Object.assign(this.iframe.contentWindow, wxGlobal);
      (this.iframe.contentWindow as any).wx = wx;
      const t = Cache.findStamp(path, files);
      Sys.mountModule(`module-page-${id}`, path, t, {});
    });
  }
  setUpdatePerformanceListener<WithDataPath extends boolean = false>(options: WechatMiniprogram.Component.SetUpdatePerformanceListenerOption<WithDataPath>, callback?: WechatMiniprogram.Component.UpdatePerformanceListener<WithDataPath>): void {
    throw new Error('Method not implemented.');
  }
  onLoad(arg?: Record<string, string | undefined>): void | Promise<void> {
    throw new Error('Method not implemented.');
  }
  onShow(arg?: unknown): void | Promise<void> { }
  onReady(arg?: unknown): void | Promise<void> {
    throw new Error('Method not implemented.');
  }
  onHide(arg?: unknown): void | Promise<void> {
    throw new Error('Method not implemented.');
  }
  onUnload(arg?: unknown): void | Promise<void> {
    throw new Error('Method not implemented.');
  }
  onPullDownRefresh(arg?: unknown): void | Promise<void> {
    throw new Error('Method not implemented.');
  }
  onReachBottom(arg?: unknown): void | Promise<void> {
    throw new Error('Method not implemented.');
  }
  onShareAppMessage(arg?: WechatMiniprogram.Page.IShareAppMessageOption): void | WechatMiniprogram.Page.ICustomShareContent {
    throw new Error('Method not implemented.');
  }
  onShareTimeline(arg?: unknown): void | WechatMiniprogram.Page.ICustomTimelineContent {
    throw new Error('Method not implemented.');
  }
  onPageScroll(arg?: WechatMiniprogram.Page.IPageScrollOption): void | Promise<void> {
    throw new Error('Method not implemented.');
  }
  onTabItemTap(arg?: WechatMiniprogram.Page.ITabItemTapOption): void | Promise<void> {
    throw new Error('Method not implemented.');
  }
  onResize(arg?: WechatMiniprogram.Page.IResizeOption): void | Promise<void> {
    throw new Error('Method not implemented.');
  }
  onAddToFavorites(arg?: WechatMiniprogram.Page.IAddToFavoritesOption): WechatMiniprogram.Page.IAddToFavoritesContent {
    throw new Error('Method not implemented.');
  }
  setData(data: Partial<WechatMiniprogram.Page.DataOption> & WechatMiniprogram.IAnyObject, callback?: () => void): void {
    Object.assign(this.data, data);
    renderPage(this);
  }
  hasBehavior(behavior: string): void {
    throw new Error('Method not implemented.');
  }
  triggerEvent<DetailType = any>(name: string, detail?: DetailType, options?: WechatMiniprogram.Component.TriggerEventOption): void {
    throw new Error('Method not implemented.');
  }
  createSelectorQuery(): WechatMiniprogram.SelectorQuery {
    throw new Error('Method not implemented.');
  }
  createIntersectionObserver(options: WechatMiniprogram.CreateIntersectionObserverOption): WechatMiniprogram.IntersectionObserver {
    throw new Error('Method not implemented.');
  }
  selectComponent(selector: string): WechatMiniprogram.Component.TrivialInstance {
    throw new Error('Method not implemented.');
  }
  selectAllComponents(selector: string): WechatMiniprogram.Component.TrivialInstance[] {
    throw new Error('Method not implemented.');
  }
  selectOwnerComponent(): WechatMiniprogram.Component.TrivialInstance {
    throw new Error('Method not implemented.');
  }
  getRelationNodes(relationKey: string): WechatMiniprogram.Component.TrivialInstance[] {
    throw new Error('Method not implemented.');
  }
  groupSetData(callback?: () => void): void {
    throw new Error('Method not implemented.');
  }
  getTabBar(): WechatMiniprogram.Component.TrivialInstance {
    throw new Error('Method not implemented.');
  }
  getPageId(): string {
    throw new Error('Method not implemented.');
  }
  animate(selector: string, keyFrames: WechatMiniprogram.Component.KeyFrame[], duration: number, callback?: () => void): void;
  animate(selector: string, keyFrames: WechatMiniprogram.Component.ScrollTimelineKeyframe[], duration: number, scrollTimeline: WechatMiniprogram.Component.ScrollTimelineOption): void;
  animate(selector: any, keyFrames: any, duration: any, scrollTimeline?: any): void {
    throw new Error('Method not implemented.');
  }
  clearAnimation(selector: string, callback: () => void): void;
  clearAnimation(selector: string, options?: WechatMiniprogram.Component.ClearAnimationOptions, callback?: () => void): void;
  clearAnimation(selector: any, options?: any, callback?: any): void {
    throw new Error('Method not implemented.');
  }
  getOpenerEventChannel(): WechatMiniprogram.EventChannel {
    throw new Error('Method not implemented.');
  }
}

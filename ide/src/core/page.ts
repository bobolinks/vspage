import store, { files } from '../store';
import { TyAttrsMap } from '../utils/dom';
import { Sys, Cache, Wxml, Dom } from '../utils/index';
import { Editor } from '../vspage';
import { formatUsingCompoents } from './component';
import { wxGlobal } from './wx/global';

type WxPageInstance = WechatMiniprogram.Page.Instance<WechatMiniprogram.Page.DataOption, WechatMiniprogram.Page.CustomOption>;
type WxPageOptions = WechatMiniprogram.Page.Options<any, any>;

function updateSelector(doc: Document, el?: HTMLElement) {
  let selector = doc.getElementById('editor-element-selector');
  if (!selector) return;
  if (el) {
    const ast = (el as any).__ast as TyAst;
    const rt = el.getBoundingClientRect();
    if (rt.top <= 20) {
      if (!selector.classList.contains('editor-element-selector-fixed')) {
        selector.classList.toggle('editor-element-selector-fixed');
      }
    } else if (selector.classList.contains('editor-element-selector-fixed')) {
      selector.classList.toggle('editor-element-selector-fixed');
    }
    selector.setAttribute('data-attr-tag', `<${ast.tag || 'text'}>`);
    selector.setAttribute('style', `display:block; left:${doc.documentElement.scrollLeft + rt.x}px; top:${doc.documentElement.scrollTop + rt.y}px; width:${rt.width - 2}px; height:${rt.height - 2}px`);
  }
  else {
    if (selector.classList.contains('editor-element-selector-fixed')) {
      selector.classList.toggle('editor-element-selector-fixed');
    }
    selector.removeAttribute('data-attr-tag');
    selector.setAttribute('style', `display:none;`);
  }
}

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
  const selector = d.createElement('div');
  selector.setAttribute('id', 'editor-element-selector');
  d.body.appendChild(selector);

  const list = d.body.querySelectorAll('[data-attr-path]');
  list.forEach((e: HTMLElement) => {
    e.onclick = (ev: Event) => {
      ev.stopPropagation();
      updateSelector(d, e);
      Editor.select((e as any).__ast);
    };
  });
}

export class TPage implements WxPageInstance {
  data: Object;
  is: string;
  route: string;
  options: Record<string, string | undefined>;
  config: any;
  iframe: HTMLIFrameElement;
  path: string;
  url: string;
  scoped: string;
  constructor(url: string, config: any) {
    const path = url.split('?')[0];;
    const id = path.replace(/[^0-9a-z-]/ig, '-');
    this.data = {};
    this.path = path;
    this.url = url;
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
      let cssCode: Array<string> = [cssEditor];
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
  onLoad(arg?: Record<string, string | undefined>): void | Promise<void> { }
  onShow(arg?: unknown): void | Promise<void> { }
  onReady(arg?: unknown): void | Promise<void> { }
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

const cssEditor = `
.editor-element-inherit {
  all: inherit;
  margin: 0;
  padding: 0;
  border: none;
}
#editor-element-selector {
  display: none;
  position: absolute;
  /* background: rgba(25, 190, 107, 0.2); */
  margin: 0;
  padding: 0;
  border: 1px dashed #19be6b;
  z-index: 4999;
  pointer-events: none;
  box-shadow: 0px 0px 4px 0.5px #aaa;
}
#editor-element-target {
  display: none;
  position: absolute;
  background: rgba(255, 165, 0, 0.15);
  margin: 0;
  padding: 0;
  border: 1px dashed #ed3f14;
  z-index: 5000;
  pointer-events: none;
}
#editor-element-selector::before, #editor-element-target::before {
  display: block;
  content: attr(data-attr-tag);
  font-size: 12px;
  color: #fff;
  border-radius: 2px;
  position: absolute;
  top: -16px;
  padding: 0px 5px;
  font-weight: 200;
  z-index: 200;
  pointer-events: none;
  text-overflow: ellipsis;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  transform: scale(0.75);
  transform-origin: left;
}
#editor-element-selector::before {
  background: #19be6b;
}
#editor-element-target::before {
  background: orange;
}
.editor-element-selector-fixed::before {
  top: unset !important;
  bottom: -16px;
}
.editor-element-slot {
  position: relative;
  border-radius: 4px;
  line-height: 1.0;
  background: #dedede;
  border: 1px dashed #80848f;
  text-align: center;
}
.editor-element-slot::before {
  content: attr(data-attr-decoration);
  font-size: 12px;
  color: #ed4014;
  padding-left: 4px;
  padding-right: 4px;
  text-decoration: underline;
  vertical-align: middle;
  font-weight: 100;
  z-index: 100;
  pointer-events: none;
  transform: scale(0.5);
}
.editor-element-fail {
  position: relative;
  border-radius: 4px;
  min-width: 60px;
  min-height: 60px;
  line-height: 60px;
  text-align: center;
}
.editor-element-fail::after {
  position: absolute;
  content: attr(data-attr-decoration);
  font-size: 8px;
  color: #ed4014;
  padding-left: 4px;
  padding-right: 4px;
  font-weight: 100;
  z-index: 100;
  pointer-events: none;
  white-space: nowrap;
  top: 0;
  left: 0;
  min-width: 100%;
  min-height: 100%;
}
.editor-element-page {
  font-size: 12px;
  border-radius: 4px;
  color: #ed4014;
  background: #dedede;
  border: 1px dashed #80848f;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}`;
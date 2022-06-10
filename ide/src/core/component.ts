import store, { UsingComponents, files } from '../store';
import { TyAttrsMap } from '../utils/dom';
import { Cache, Sys, Path, Wxml, Dom } from '../utils/index';
import { TPage } from './page';

type WxComponentInstance = WechatMiniprogram.Component.TrivialInstance & Pick<WechatMiniprogram.Component.Lifetimes, 'lifetimes'>;
type WxComponentOptions = WechatMiniprogram.Component.TrivialOption;

export class TComponent implements WxComponentInstance {
  $$: WxComponent;
  path: string;
  wxml: string;
  options: WechatMiniprogram.Component.ComponentOptions;
  config: any;
  scoped: string;
  is: string;
  id: string;
  dataset: Record<string, string>;
  data: WechatMiniprogram.IAnyObject & WechatMiniprogram.Component.PropertyOptionToData<WechatMiniprogram.IAnyObject>;
  properties: WechatMiniprogram.IAnyObject & WechatMiniprogram.Component.PropertyOptionToData<WechatMiniprogram.IAnyObject>;
  constructor(path: string, wxml: string, config: any, scoped: string, element: WxComponent) {
    this.path = path;
    this.is = path;
    this.id = path.replace(/[^0-9a-z-]/ig, '-');
    this.dataset = {};
    this.data = {};
    this.properties = {};
    this.lifetimes = {};
    this.wxml = wxml;
    this.options = {};
    this.config = config;
    this.scoped = scoped;
    this.$$ = element;
  }
  setUpdatePerformanceListener<WithDataPath extends boolean = false>(options: WechatMiniprogram.Component.SetUpdatePerformanceListenerOption<WithDataPath>, callback?: WechatMiniprogram.Component.UpdatePerformanceListener<WithDataPath>): void {
    throw new Error('Method not implemented.');
  }
  lifetimes: Partial<{ created(): void; attached(): void; ready(): void; moved(): void; detached(): void; error(err: Error): void; }>;
  setData(data: Partial<WechatMiniprogram.IAnyObject> & WechatMiniprogram.IAnyObject, callback?: () => void): void {
    Object.assign(this.data, data);
    this.$$.render();
  }
  hasBehavior(behavior: string): void {
    throw new Error("Method not implemented.");
  }
  triggerEvent<DetailType = any>(name: string, detail?: DetailType, options?: WechatMiniprogram.Component.TriggerEventOption): void {
    const { events } = this.$$.__ast;
    if (!events) {
      return;
    }
    const ev = events[name] as any;
    if (!ev) {
      return;
    }
    const pages = store.pages;
    const currPage = pages[pages.length - 1] as any;
    const method = currPage[ev.script];
    if (method) {
      method({ detail });
    }
  }
  createSelectorQuery(): WechatMiniprogram.SelectorQuery {
    throw new Error("Method not implemented.");
  }
  createIntersectionObserver(options: WechatMiniprogram.CreateIntersectionObserverOption): WechatMiniprogram.IntersectionObserver {
    throw new Error("Method not implemented.");
  }
  selectComponent(selector: string): WechatMiniprogram.Component.TrivialInstance {
    throw new Error("Method not implemented.");
  }
  selectAllComponents(selector: string): WechatMiniprogram.Component.TrivialInstance[] {
    throw new Error("Method not implemented.");
  }
  selectOwnerComponent(): WechatMiniprogram.Component.TrivialInstance {
    throw new Error("Method not implemented.");
  }
  getRelationNodes(relationKey: string): WechatMiniprogram.Component.TrivialInstance[] {
    throw new Error("Method not implemented.");
  }
  groupSetData(callback?: () => void): void {
    throw new Error("Method not implemented.");
  }
  getTabBar(): WechatMiniprogram.Component.TrivialInstance {
    throw new Error("Method not implemented.");
  }
  getPageId(): string {
    throw new Error("Method not implemented.");
  }
  animate(selector: string, keyFrames: WechatMiniprogram.Component.KeyFrame[], duration: number, callback?: () => void): void;
  animate(selector: string, keyFrames: WechatMiniprogram.Component.ScrollTimelineKeyframe[], duration: number, scrollTimeline: WechatMiniprogram.Component.ScrollTimelineOption): void;
  animate(selector: any, keyFrames: any, duration: any, scrollTimeline?: any): void {
    throw new Error("Method not implemented.");
  }
  clearAnimation(selector: string, callback: () => void): void;
  clearAnimation(selector: string, options?: WechatMiniprogram.Component.ClearAnimationOptions, callback?: () => void): void;
  clearAnimation(selector: any, options?: any, callback?: any): void {
    throw new Error("Method not implemented.");
  }
  getOpenerEventChannel(): WechatMiniprogram.EventChannel {
    throw new Error("Method not implemented.");
  }
}

export class TComponentClass {
  /** path withoud ext */
  path: string;
  /** wxml file */
  wxml: string;
  /** json file */
  config: any;
  /** options*/
  options?: WxComponentOptions;
  /** style scoping */
  scoped: string;
  constructor(path: string, wxml: string, config: any) {
    this.path = path;
    this.wxml = wxml;
    this.config = config;
    this.scoped = `scoped-${Sys.randomString(6)}`;
    if (config.usingComponents) {
      formatUsingCompoents(config.usingComponents, path);
    }
  }
  bind(options?: WxComponentOptions) {
    this.options = options;
  }
  createInstance(element: WxComponent) {
    const instance = new TComponent(this.path, this.wxml, this.config, this.scoped, element);
    if (this.options) {
      Object.assign(instance, this.options);
      if (this.options.methods) {
        Object.assign(instance, this.options.methods);
      }
    }
    // clone new one
    instance.data = JSON.parse(JSON.stringify(instance.data));
    const props = JSON.parse(JSON.stringify(instance.properties || {}));
    for (const [key, item] of Object.entries(props)) {
      const camelName = key.replace(/-([a-zA-Z])/g, $1 => $1.substring(1).toLocaleUpperCase());
      const minusName = key.replace(/([a-z][A-Z])/g, $1 => `${$1[0]}-${$1[1].toLocaleLowerCase()}`);
      const value = element.getAttribute(camelName) || element.getAttribute(minusName) || (item as any).default;
      if (value !== null && value !== undefined) {
        instance.data[key] = value;
      }
    }
    if (element.__props) {
      for (const [key, value] of Object.entries(element.__props)) {
        instance.data[key] = value;
      }
    }
    return instance;
  }
}

export class WxComponent extends HTMLElement {
  instance?: TComponent;
  __ast: TyAst = {} as any;
  __props?: any;
  static cxt: any = null;
  constructor() {
    super();
  }
  connectedCallback() {
    const tag = this.tagName.toLocaleLowerCase();
    const compPath = this.getAttribute('data-comp-path');
    if (!compPath) {
      throw `component[${tag}] not found`;
    }
    const component = store.components[compPath];
    if (!component) {
      throw `component[${tag}] not found`;
    }
    this.instance = component.createInstance(this);
    const pages = store.pages;
    const currPage = pages[pages.length - 1];
    const wxssPath = Cache.withStamp(`${this.instance.path}.wxss?scoped=${this.instance.scoped}`, files);
    Sys.mountLink(`stylesheet-component-${tag}`, wxssPath, Cache.findStamp(wxssPath, files), {}, currPage.iframe.contentDocument);
    this.render();
    this.instance.lifetimes.attached?.call(this.instance);
  }
  disconnectedCallback() {
    if (this.instance) {
      this.instance.lifetimes.detached?.call(this.instance);
      this.instance = undefined;
    }
  }
  render() {
    if (!this.instance) {
      throw 'has not attached';
    }
    const ast = Wxml.toAst(this.instance.wxml);
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
    if (this.instance.config?.usingComponents) {
      for (const [k, v] of Object.entries(this.instance.config.usingComponents)) {
        attrsMap[k] = { 'data-comp-path': v as string };
        const c = store.components[v as string];
        if (c) {
          propsMap[k] = Object.keys(c.options?.properties || {});
        }
      }
    }
    const domTree = Dom.generate(this.instance, ast, this.instance.data || {}, this.instance.scoped, false, attrsMap, propsMap);
    while (this.childNodes.length > 1) {
      this.removeChild(this.childNodes[1]);
    }
    if (this.childNodes.length === 0) {
      this.appendChild(domTree);
    } else {
      this.replaceChild(domTree, this.childNodes[0]);
    }
  }
};

export async function loadComponentRes(name: string, path: string) {
  const wxml = await Sys.import(Cache.withStamp(`${path}.wxml?import=module`, files));
  const options = await Sys.import(Cache.withStamp(`${path}.json?import=module`, files));
  const component = new TComponentClass(path, wxml, options);
  store.components[path] = component;
  if (options.usingComponents) {
    await loadComponentsRes(options.usingComponents);
  }
}

export async function loadComponentsRes(usingComponents: UsingComponents) {
  Object.keys(usingComponents).forEach(name => {
    const tag = `wx-${name.toLocaleLowerCase()}`;
    if (!customElements.get(tag)) {
      customElements.define(tag, class extends WxComponent { });
    }
  });

  const paths = Object.entries(usingComponents).filter(e => !store.components[e[1]]);
  await Promise.all(paths.map(async ([name, p]) => {
    await loadComponentRes(name, p);
  }));
}

export async function loadComponents(usingComponents: UsingComponents) {
  // load resource first
  await loadComponentsRes(usingComponents);
  // then load script
  for (const [p, component] of Object.entries(store.components)) {
    if (component.options) {
      continue;
    }
    store.currComponentPath = p;
    const path = `/${p}`.replace(/^\/\/+/, '/');
    const id = path.replace(/[^0-9a-z-]/ig, '-');
    await Sys.mountModule(`module-component-${id}`, path, Cache.findStamp(path, files), {});
  }
}

export function formatUsingCompoents(usingComponents: UsingComponents, base: string): UsingComponents {
  for (const [k, v] of Object.entries(usingComponents as UsingComponents)) {
    usingComponents[k] = Path.relative(base, v);
  }
  return usingComponents;
}

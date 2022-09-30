import store, { files } from '../../store';
import { TPage } from '../page';
import { Cache, Sys, Path } from '../../utils/index';
import { formatUsingCompoents, loadComponents } from '../component';
import { PageData } from 'vspage';

type NavigateToOption = WechatMiniprogram.NavigateToOption & PageData;

wx.setNavigationBarTitle = async function (options: WechatMiniprogram.SetNavigationBarTitleOption) {
  store.page.navigationBarTitleText = options.title;
} as any;

wx.navigateTo = async function (options: NavigateToOption) {
  const simulator = document.getElementById('simulator');
  if (!simulator) {
    throw 'error';
  }
  const url = Path.relative(store.currPage || '/', options.url);
  const path = url.split('?')[0];
  const pageOptions = await Sys.import(Cache.withStamp(`${path}.json?import=module`, files));
  if (pageOptions.usingComponents) {
    formatUsingCompoents(pageOptions.usingComponents, path);
    await loadComponents(pageOptions.usingComponents);
  }
  const newPage = new TPage(url, pageOptions, { wxml: options.wxml, });
  store.pages.push(newPage);
  store.currPage = url;
  store.page = pageOptions;
  simulator?.replaceChild(newPage.iframe, simulator.children[1]);
} as any;

wx.redirectTo = async function (options: WechatMiniprogram.RedirectToOption) {
  if (store.pages.length) {
    const page = store.pages.pop();
    page?.onUnload();
  }
  return wx.navigateTo(options);
} as any;

wx.navigateBack = async function (options: WechatMiniprogram.NavigateBackOption) {
  const simulator = document.getElementById('simulator');
  if (!simulator) {
    throw 'error';
  }
  if (!store.pages.length) {
    return;
  }
  let delta = options?.delta || 1;
  if (delta > store.pages.length) {
    delta = store.pages.length;
  }
  store.pages.splice(store.pages.length - delta);
  if (store.pages.length) {
    const page = store.pages[store.pages.length - 1];
    store.currPage = page.url;
    store.page = page.options;
    simulator.replaceChild(page.iframe, simulator.children[1]);
  } else {
    simulator.replaceChild(document.createElement('iframe'), simulator.children[1]);
    store.currPage = '';
  }
} as any;


import store, { UsingComponents, files } from '../../store';
import { TPage } from '../page';
import { Cache, Sys, Path } from '../../utils/index';
import { formatUsingCompoents, loadComponents } from '../component';

wx.navigateTo = async function (options: WechatMiniprogram.NavigateToOption) {
  const simulator = document.getElementById('simulator');
  if (!simulator) {
    throw 'error';
  }
  const path = Path.relative(store.currPage || '/', options.url);
  const pageOptions = await Sys.import(`${path}.json?import=module`);
  if (pageOptions.usingComponents) {
    formatUsingCompoents(pageOptions.usingComponents, path);
    await loadComponents(pageOptions.usingComponents);
  }
  const newPage = new TPage(path, pageOptions);
  store.pages.push(newPage);
  store.currPage = newPage.path;
  store.page = pageOptions;
  simulator?.replaceChild(newPage.iframe, simulator.children[1]);
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
    store.currPage = page.path;
    store.page = page.options;
    simulator.replaceChild(page.iframe, simulator.children[1]);
  } else {
    simulator.replaceChild(document.createElement('iframe'), simulator.children[1]);
    store.currPage = '';
  }
} as any;


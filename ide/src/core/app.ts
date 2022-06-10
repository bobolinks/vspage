import store, { files } from '../store';
import { Sys, Cache } from '../utils/index';
import { formatUsingCompoents, loadComponents } from './component';

export default {
  async launch() {
    document.head.children[0].setAttribute('name', 'cssshr');
    const appConfig = await Sys.import('/app.json?t=0&import=module');
    store.config = appConfig;
    store.homePage = appConfig.pages[0];
    if (store.config.usingComponents) {
      formatUsingCompoents(store.config.usingComponents, '/');
    }
    return await this.relaunch({
      url: store.homePage,
    });
  },
  async tryReload() {
    const appConfig = await Sys.import(Cache.withStamp('/app.json?import=module', files));
    store.config = appConfig;
    store.homePage = appConfig.pages[0];
    if (store.config.usingComponents) {
      formatUsingCompoents(store.config.usingComponents, '/');
    }
  },
  async relaunch(options: Partial<WechatMiniprogram.ReLaunchOption>) {
    // mount app
    await Sys.mountModule('module-app', '/app', Cache.findStamp('/app', files), {});
    // mount components
    await loadComponents(store.config.usingComponents);
    await wx.navigateTo({
      url: options.url || 'pages/index/index',
    })
  }
};

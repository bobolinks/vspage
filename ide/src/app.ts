import { App } from 'vue';
import { Router, } from "vue-router";
import { Store } from 'vuex';
import state, { files } from './store';
import rpcService, { rpc } from './rpc';
import './core/wx/index';
import wxApp from './core/app';

export default {
  beforeLaunch(app: App, store: Store<typeof state>, router: Router) {
    rpcService.init(`/__rpc__/message`, () => {
      console.log('connected');
      rpc.request('project.config').then((config: any) => {
        store.state.config = config;
        wxApp.launch();
      });
    });
  },
  onLaunched(app: App, store: Store<typeof state>, router: Router) {
    store.watch((state, getters) => getters.homePage, (value) => {
      wxApp.relaunch({
        url: value,
      });
    });
    rpc.describe('file:changed', ({ filePath, timestamp }: { filePath: string, timestamp: number }) => {
      if (filePath[0] !== '/') {
        filePath = `/${filePath}`;
      }
      if (!timestamp) {
        delete files[filePath];
      } else {
        files[filePath] = { timestamp };
      }
      if (filePath === '/project.json') {
        wxApp.tryReload();
      } else {
        wxApp.reloadPage();
      }
    }, this);
  },
};

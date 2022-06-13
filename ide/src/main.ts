import { createApp, openBlock, resolveComponent, createBlock } from 'vue';
import { createRouter, createWebHashHistory, createWebHistory } from "vue-router";
import './assets/app.css';
import './assets/flex.css';
import './assets/idefont/iconfont.css';
import appLifeCircle from './app';
import routes from './router';
import { store } from './store';

if (!(window as any).setImmediate) {
  ((window as any)).setImmediate = window.setTimeout;
}

async function regService() {
  if ('serviceWorker' in navigator) {
    const wk = await navigator.serviceWorker.getRegistration('/service-worker.js');
    if (wk) {
      return;
    }
    navigator.serviceWorker.register('/service-worker.js')
      .then(function () {
      }).catch(function (error) {
        console.log(error);
      });
  } else {
    console.log(`The current browser doesn't support service workers.`);
  }
}

regService();

if (!(window as any).$) {
  ((window as any)).$ = (selector: string, doc?: Document) => (doc || document).querySelector(selector);
}

document.title = 'wesim';

// const app = createApp(appVue);
const app = createApp({
  render: () => (openBlock(), createBlock(resolveComponent('router-view'))),
});

// @ts-ignore
window.__app = app;

// @ts-ignore
window.__store = store;

// setup store
app.use(store);

// setup router
const baseUrl = '/';
// const history = createWebHistory(baseUrl);
const history = createWebHashHistory(baseUrl);
const router = createRouter({
  history,
  routes
});
app.use(router);

appLifeCircle.beforeLaunch(app, store, router);

const vue = app.mount('#app');

// @ts-ignore
window.__vue = vue;

vue.$nextTick(() => {
  appLifeCircle.onLaunched(app, store, router);
});

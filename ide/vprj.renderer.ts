/* in esm mode */
import { createApp, } from 'vue/dist/vue.esm-bundler';
import * as Vue from 'vue/dist/vue.esm-bundler';
import { createRouter, createWebHashHistory, } from "vue-router";
import './src/assets/app.css';
import { store } from './src/store';

declare const window: any;

window.Vue = Vue;

// Create router for vue
const router = createRouter({
  history: createWebHashHistory('/'),
  routes: [{
    path: '/:pathMatch(.*)*',
    component: {
      template: '<div class="editor-element-page"><span>子页面</span></div>',
    },
  }]
});

// Render function
export default async function render(_vm, el) {
  // Create a vue3 instance
  const app = createApp(_vm);
  // Setup store
  app.use(store);
  // Setup router
  app.use(router);
  // Then mount
  window._vue = app.mount(el);
};

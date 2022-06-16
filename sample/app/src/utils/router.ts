import Task from './task';

export { AsyncPage } from './task';

/* eslint-disable no-undef */
const router = {
  cached: {} as any as Record<number, Record<string, any>>,
  redirectTo(options: WechatMiniprogram.RedirectToOption, data?: any) {
    const [uri, query] = options.url.split('?');
    const tskid = Math.random();
    this.cached[tskid] = data || {};
    return wx.redirectTo(Object.assign(options, {
      url: [uri].concat([(query?.split('&') || []).concat(`tskid=${tskid}`).join('&')]).join('?'),
    }));
  },
  navigateTo(options: WechatMiniprogram.RedirectToOption, data?: any) {
    const [uri, query] = options.url.split('?');
    const tskid = Math.random();
    this.cached[tskid] = data || {};
    return wx.navigateTo(Object.assign(options, {
      url: [uri].concat([(query?.split('&') || []).concat(`tskid=${tskid}`).join('&')]).join('?'),
    }));
  },
  wait: Task.wait,
};

export default router;

type ROptions = WechatMiniprogram.Page.Options<any, any>;
export const PageWithData: WechatMiniprogram.Page.Constructor = function (options?: ROptions) {
  options = options || {};
  const { onLoad } = options;
  options.onLoad = function (options: Record<string, any> | undefined) {
    if (typeof options?.tskid !== 'undefined') {
      this.tskid = options.tskid;
      const task = router.cached[this.tskid];
      if (task) {
        delete router.cached[this.tskid];
        this.setData(task);
      }
    }
    if (onLoad) {
      onLoad.call(this, options);
    }
  };
  return Page(options);
};

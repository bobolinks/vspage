/* eslint-disable */
import Task from './task';
export { AsyncPage } from './task';
/* eslint-disable no-undef */
const router = {
    cached: {},
    redirectTo(options, data) {
        const [uri, query] = options.url.split('?');
        const tskid = Math.random();
        this.cached[tskid] = data || {};
        return wx.redirectTo(Object.assign(options, {
            url: [uri].concat([((query === null || query === void 0 ? void 0 : query.split('&')) || []).concat(`tskid=${tskid}`).join('&')]).join('?'),
        }));
    },
    navigateTo(options, data) {
        const [uri, query] = options.url.split('?');
        const tskid = Math.random();
        this.cached[tskid] = data || {};
        return wx.navigateTo(Object.assign(options, {
            url: [uri].concat([((query === null || query === void 0 ? void 0 : query.split('&')) || []).concat(`tskid=${tskid}`).join('&')]).join('?'),
        }));
    },
    wait: Task.wait,
};
export default router;
export const PageWithData = function (options) {
    options = options || {};
    const { onLoad } = options;
    options.onLoad = function (options) {
        if (typeof (options === null || options === void 0 ? void 0 : options.tskid) !== 'undefined') {
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

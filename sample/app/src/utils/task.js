/* eslint-disable */
let gtskid = 1;
/**
 * 异步工作模型
 */
export const AsyncWorker = {
    queue: {},
    /**
     * 创建一个普通任务
     * @param name 任务名称
     * @param data 参数
     * @returns
     */
    push(name, data) {
        const tskid = gtskid++;
        const task = {
            name,
            data: data || {},
            steps: [{ name: 'begin', time: Date.now() }],
            resolve: null,
            reject: null,
        };
        this.queue[tskid] = task;
        return tskid;
    },
    /**
     * 获取任务
     * @param tskid 任务id
     * @returns
     */
    peek(tskid) {
        return this.queue[tskid];
    },
    /**
     * 任务状态变迁
     * @param tskid 任务id
     * @param name  状态名称
     */
    step(tskid, name) {
        const tsk = this.queue[tskid];
        if (tsk) {
            tsk.steps.push({ name, time: Date.now() });
        }
    },
    /**
     * 任务标记完成，并从任务队列中删除
     * @param tskid 任务ID
     * @param result 结果
     * @returns
     */
    commit(tskid, result) {
        const tsk = this.queue[tskid];
        if (!tsk) {
            return;
        }
        delete this.queue[tskid];
        tsk.steps.push({ name: 'done', time: Date.now() });
        tsk.resolve(result);
        wx.reportAnalytics(`${tsk.name}_successed`, {
            elapsed: tsk.steps[tsk.steps.length - 1].time - tsk.steps[0].time,
            code: 0,
            step: tsk.steps[tsk.steps.length - 1].name,
        });
        if (tsk.prev) {
            this.commit(tsk.prev);
        }
    },
    /**
     * 标记任务失败，并从队列中删除
     * @param tskid 任务ID
     * @param code 错误码
     * @param error 错误内容
     * @returns
     */
    error(tskid, code, error) {
        const tsk = this.queue[tskid];
        if (!tsk) {
            return;
        }
        delete this.queue[tskid];
        tsk.steps.push({ name: 'failed', time: Date.now() });
        tsk.reject(error);
        wx.reportAnalytics(`${tsk.name}_failed`, {
            elapsed: tsk.steps[tsk.steps.length - 1].time - tsk.steps[0].time,
            code: code || -1,
            step: tsk.steps[tsk.steps.length - 1].name,
        });
        if (tsk.prev) {
            this.error(tsk.prev, code, error);
        }
    },
    /**
     * 创建一个界面任务
     * @param url   页面地址
     * @param data  参数
     * @param name  任务名称
     * @param prev  前置任务
     * @returns
     */
    wait(url, data, name, prev) {
        const [uri, query] = url.split('?');
        const tskid = gtskid++;
        const prewTask = prev ? this.queue[prev] : null;
        const task = {
            name: name || 'unnamed',
            data: Object.assign(Object.assign({}, (prewTask === null || prewTask === void 0 ? void 0 : prewTask.data) || {}), data || {}),
            steps: [{ name: name || 'begin', time: Date.now() }],
            resolve: null,
            reject: null,
            prev,
        };
        this.queue[tskid] = task;
        return new Promise((resolve, reject) => {
            task.resolve = resolve;
            task.reject = reject;
            wx.navigateTo({
                url: [uri].concat([((query === null || query === void 0 ? void 0 : query.split('&')) || []).concat(`tskid=${tskid}`).join('&')]).join('?'),
                fail: (res) => {
                    if (res.errMsg) {
                        wx.showToast({ title: res.errMsg });
                        reject(res);
                        this.error(tskid, undefined, new Error(res.errMsg));
                    }
                },
            });
        });
    },
};
export default AsyncWorker;
export const AsyncPage = function (options) {
    options = options || {};
    const { onLoad, onUnload } = options;
    options.onLoad = function (options) {
        if (typeof (options === null || options === void 0 ? void 0 : options.tskid) !== 'undefined') {
            this.tskid = options.tskid;
            const task = AsyncWorker.peek(this.tskid);
            if (task) {
                this.setData(task.data);
            }
        }
        if (onLoad) {
            onLoad.call(this, options);
        }
    };
    options.onUnload = function () {
        if (onUnload) {
            onUnload.call(this);
        }
        this.reject(new Error('Cancelled'));
    };
    options.args = function () {
        if ('tskid' in this) {
            const tsk = AsyncWorker.peek(this.tskid);
            if (tsk) {
                return tsk.data;
            }
        }
        return undefined;
    };
    options.state = function (name) {
        if ('tskid' in this) {
            AsyncWorker.step(this.tskid, name);
        }
    };
    options.resolve = function (result) {
        if ('tskid' in this) {
            AsyncWorker.commit(this.tskid, result);
        }
    };
    options.reject = function (error) {
        if ('tskid' in this) {
            AsyncWorker.error(this.tskid, undefined, error);
        }
    };
    options.join = function (url, data, name) {
        return this.wait(url, data, name, this.tskid);
    };
    return Page(options);
};

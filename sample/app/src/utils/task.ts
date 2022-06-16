/* eslint-disable no-undef */
/**
 * 任务模型
 */
interface Task {
  name: string;
  data: Record<string, any>;
  steps: Array<{ name: string; time: number; }>;
  resolve: any;
  reject: any;
  /** 前置任务，任务结束时自动结束前置任务 */
  prev?: number;
}

type AsyncOptions<
  TData extends WechatMiniprogram.Page.DataOption,
  TCustom extends WechatMiniprogram.Page.CustomOption
  > = (TCustom & Partial<WechatMiniprogram.Page.Data<TData>> & Partial<WechatMiniprogram.Page.ILifetime> & {
    options?: WechatMiniprogram.Component.ComponentOptions
  }) &
  ThisType<WechatMiniprogram.Page.Instance<TData, TCustom> & {
    /**
     * 获取任务随带参数
     */
    args(): Record<string, any>;
    /**
     * 任务状态变迁
     * @param name  状态名称
     */
    state(name: string): void;
    /**
     * 任务标记完成，并从任务队列中删除
     * @param result  结果
     */
    resolve(result: Record<string, any>): void;
    /**
     * 任务标记失败，并从任务队列中删除
     * @param error  错误信心
     */
    reject(error: Error): void;
    /**
     * 创建一个关联任务，只支持一对一关联，
     * @param url
     * @param data
     * @param name
     */
    join(url: string, data?: Record<string, any>, name?: string): Promise<any>;
  }>;

type AsyncConstructor = <
  TData extends WechatMiniprogram.Page.DataOption,
  TCustom extends WechatMiniprogram.Page.CustomOption>(
  options: AsyncOptions<TData, TCustom>
) => void;

let gtskid = 1;

/**
 * 异步工作模型
 */
export const AsyncWorker = {
  queue: {} as any as Record<string, Task>,

  /**
   * 创建一个普通任务
   * @param name 任务名称
   * @param data 参数
   * @returns
   */
  push(name: string, data: Record<string, any>): number {
    const tskid = gtskid++;
    const task: Task = {
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
  peek(tskid: number): Task | undefined {
    return this.queue[tskid];
  },

  /**
   * 任务状态变迁
   * @param tskid 任务id
   * @param name  状态名称
   */
  step(tskid: number, name: string) {
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
  commit(tskid: number, result?: any) {
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
  error(tskid: number, code?: number, error?: Error) {
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
  wait(url: string, data?: Record<string, any>, name?: string, prev?: number): Promise<any> {
    const [uri, query] = url.split('?');
    const tskid = gtskid++;
    const prewTask = prev ? this.queue[prev] : null;
    const task: Task = {
      name: name || 'unnamed',
      data: { ...prewTask?.data || {}, ...data || {} },
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
        url: [uri].concat([(query?.split('&') || []).concat(`tskid=${tskid}`).join('&')]).join('?'),
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

export const AsyncPage: AsyncConstructor = function (options?: AsyncOptions<any, any>) {
  options = options || {};
  const { onLoad, onUnload } = options;
  options.onLoad = function (options: Record<string, any> | undefined) {
    if (typeof options?.tskid !== 'undefined') {
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
  options.state = function (name: string) {
    if ('tskid' in this) {
      AsyncWorker.step(this.tskid, name);
    }
  };
  options.resolve = function (result: Record<string, any>) {
    if ('tskid' in this) {
      AsyncWorker.commit(this.tskid, result);
    }
  };
  options.reject = function (error: Error) {
    if ('tskid' in this) {
      AsyncWorker.error(this.tskid, undefined, error);
    }
  };
  options.join = function (url: string, data?: Record<string, any>, name?: string): Promise<any> {
    return this.wait(url, data, name, (this as any).tskid);
  };
  return Page(options);
};

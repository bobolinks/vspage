import store from '../../store';
import { Path } from '../../utils/index';

const handlers = {
  getCurrentRoute() {
    return { route: store.currPage };
  },
  getLocalImgData({ path }: any) {
    return { localData: Path.relative(store.currPage, path) };
  },
  systemLog(data: any) {
    const { dataArray } = data;
    for (const iterator of dataArray) {
      console.log(iterator.message);
    }
  },
};

type TyWeixinJSBridge = {
  invokeCallbackHandler(id: number, message: string): void;
};

declare const WeixinJSBridge: TyWeixinJSBridge;

window.addEventListener('message', (e) => {
  if (!e.data || !e.data.callbackId) {
    return;
  }
  const method = (handlers as any)[e.data.event];
  if (method) {
    const rs = method.call(handlers, JSON.parse(e.data.paramsString || ''));
    WeixinJSBridge.invokeCallbackHandler(e.data.callbackId, rs);
  } else {
    console.log(e.data.event, e.data);
  }
});

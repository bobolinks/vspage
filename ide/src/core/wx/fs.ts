import { Net } from '../../utils/index';

wx.getFileSystemManager = function () {
  return new Proxy({}, {
    get(target: any, p: string | symbol, receiver: any): any {
      let method = Reflect.get(target, p, receiver);
      if (method) {
        return method;
      }
      if (typeof p === 'symbol') {
        return;
      }
      if (!/Sync$/.test(p)) {
        method = async (...args: []) => {
          return Net.request({
            url: `/__fs__/${p}`,
            data: JSON.stringify(args || []),
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
        }
      } else {
        method = (...args: []) => {
          return Net.requestSync({
            url: `/__fs__/${p}`,
            data: JSON.stringify(args || []),
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
        }
      }
      Reflect.set(target, p, method, receiver);
      return method;
    }
  }) as WechatMiniprogram.FileSystemManager;
};

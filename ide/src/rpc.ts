import './polyfill';
import { listen, MessageConnection } from 'vscode-ws-jsonrpc';
import normalizeUrl from 'normalize-url';
import ReconnectingWebSocket from 'reconnecting-websocket';

export type TyUrl = string;

/** 消息处理函数 */
export declare type TyRpcHandler = (...params: any[]) => any;

/** rpc 通道 */
export interface TyRpcConnection {
  /** 发送请求 */
  request(method: string, ...args: any[]): Promise<any>,
  /** 订阅事件 */
  describe(method: string, handler: TyRpcHandler, target: any): void,
  /** 取消订阅 */
  undescribe(target: any): void,
}

interface TyRpcConnectionEx extends TyRpcConnection {
  /** rpc 消息通道 */
  rawConnection: MessageConnection | undefined;
  /** 订阅清单 */
  handlers: Record<string, Array<{ target: any, handler: TyRpcHandler }>>;
}

export const rpc: TyRpcConnectionEx = {
  rawConnection: undefined,
  handlers: {},
  /** 发送请求 */
  request(method: string, ...args: any[]): Promise<any> {
    if (!this.rawConnection) {
      throw 'disconnected';
    }
    return this.rawConnection.sendRequest(method, ...(args || []));
  },
  /** 订阅事件 */
  describe(method: string, handler: TyRpcHandler, target: any): void {
    const ls = this.handlers[method] || (this.handlers[method] = []);
    ls.push({
      handler,
      target,
    });
  },
  /** 取消订阅 */
  undescribe(target: any): void {
    for (const [method, ls] of Object.entries(this.handlers)) {
      const nls = ls.filter(e => e.target != target);
      if (nls.length !== ls.length) {
        this.handlers[method] = nls;
      }
    }
  },
};

const rpcService = {
  createUrl(path: TyUrl) {
    const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
    return normalizeUrl(`${protocol}://${location.host}${path}`);
  },
  createWebSocket(url: TyUrl) {
    const socketOptions = {
      maxReconnectionDelay: 10000,
      minReconnectionDelay: 1000,
      reconnectionDelayGrowFactor: 1.3,
      connectionTimeout: 10000,
      maxRetries: Infinity,
      debug: false
    };
    // @ts-ignore
    return new ReconnectingWebSocket(this.createUrl(url), [], socketOptions);
  },
  init(url: TyUrl, onConnected: () => any) {
    const webSocket = this.createWebSocket(url) as WebSocket;
    webSocket.binaryType = 'arraybuffer';

    // listen when the web socket is opened
    listen({
      webSocket,
      onConnection: ((connection: MessageConnection) => {
        connection.listen();
        connection.onNotification((method: string, ...params: any[]): void => {
          const ls = rpc.handlers[method];
          if (ls) {
            ls.forEach(it => {
              it.handler.call(it.target, ...(params || []));
            })
          }
        });
        connection.onRequest((method: string, ...params: any[]): any => {
          const ls = rpc.handlers[method];
          if (ls) {
            // only return first result
            for (const it of ls) {
              return it.handler.call(it.target, ...(params || []));
            }
          }
        });
        rpc.rawConnection = connection;
        onConnected();
        connection.onClose(() => {
          rpc.rawConnection = undefined;
        });
      }).bind(this),
    });

    return this;
  },
};

export default rpcService;

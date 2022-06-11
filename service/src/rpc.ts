import ws from 'ws';
import express from 'express';
import { MessageConnection, WebSocketMessageReader, WebSocketMessageWriter, createMessageConnection, ConsoleLogger } from 'vscode-ws-jsonrpc';
import { IncomingMessage } from 'http';
import { Socket } from 'net';

/** rpc session */
export interface RpcSession {
  /** connection */
  connection: MessageConnection;
  /** send notification to browser */
  notify(name: string, ...args: any[]): void;
  /** send request to browser */
  request(name: string, ...args: any[]): any;
}

export const rpc: RpcSession = {
  connection: null as any as MessageConnection,
  notify(name: string, ...args): void {
    if (!this.connection) {
      return;
    }
    this.connection.sendNotification(name, ...args);
  },
  request(name: string, ...args): any {
    if (!this.connection) {
      return;
    }
    return this.connection.sendRequest(name, ...args);
  },
};

type RpcModuleFunc = (rpc: RpcSession) => RpcMethods;
type RpcMethods = Record<string, any>;
export interface RpcModule {
  name: string;
  module: RpcMethods | RpcModuleFunc;
}

// create the web socket
const wss = new ws.Server({
  noServer: true,
  perMessageDeflate: false,
});

function handleIncoming(app: express.Express, modules: Record<string, RpcMethods>, url: string, session: RpcSession) {
  (app as any).onUpgrade(url, (request: IncomingMessage, socket: Socket, head: Buffer) => {
    if (session.connection) {
      return;
    }
    wss.handleUpgrade(request, socket, head, (webSocket) => {
      const socket = {
        send: (content: any) => webSocket.send(content, (error) => {
          if (error) {
            throw error;
          }
        }),
        onMessage: (cb: (this: ws, data: ws.Data) => void) => webSocket.on('message', cb),
        onError: (cb: (this: ws, err: Error) => void) => webSocket.on('error', cb),
        onClose: (cb: (this: ws, code: number, reason: string) => void) => {
          webSocket.on('close', cb);
        },
        dispose: () => {
          webSocket.close();
        },
      };

      const reader = new WebSocketMessageReader(socket);
      const writer = new WebSocketMessageWriter(socket);

      const newConnection = createMessageConnection(reader, writer, new ConsoleLogger());
      webSocket.on('close', () => {
        session.connection = undefined as any;
      });
      newConnection.onRequest((method: string, ...params: any[]) => {
        const [, name, methodName] = /^([^.]+)\.(.+)$/.exec(method) || [];
        const mo = modules[name];
        if (!mo) {
          throw `module ${name} not found`;
        }
        const me = mo[methodName];
        if (!me) {
          throw `method ${name}.${methodName} not found`;
        }
        return me.call(mo, ...params);
      });

      newConnection.listen();
      session.connection = newConnection;

      console.log(`connected to ${url}`);
    });
  });
}

export default {
  init(app: express.Express, modules: Record<string, RpcModule>) {
    handleIncoming(app, modules, '/__rpc__/message', rpc);
  },
};

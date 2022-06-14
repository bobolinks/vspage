
import * as vscode from 'vscode';
import { VsPage as IVsPage, Env, PageData } from 'vspage';
import { Service } from './service';

export class VsPage implements IVsPage, vscode.Disposable {
  private queue: Array<MessageRequest> = [];
  private token: number = 0;

  constructor(private webview: vscode.Webview, private service: Service) {
  }
  dispose() {
    for (const msg of this.queue) {
      clearTimeout(msg.timer);
    }
  }
  syncAppConfig(appConfig: AppConfig): void {
    this.request({
      method: 'syncAppConfig',
      params: [...arguments],
    });
  }
  setCurrentPage(path: string, data: PageData): void {
    this.request({
      method: 'setCurrentPage',
      params: [...arguments],
    });
  }
  updatePage(path: string, data: Partial<PageData>): void {
    this.request({
      method: 'updatePage',
      params: [...arguments],
    });
  }
  select(target: string | null): void {
    this.request({
      method: 'select',
      params: [...arguments],
    });
  }
  initialize(env: Env): void {
    this.request({
      method: 'initialize',
      params: [...arguments],
    });
  }
  async onDidReceiveMessage(message: MessageBase) {
    if ((message as MessageResponse).isrsp) {
      const rsp = message as MessageResponse;
      const req = this.queue.find(e => e.token === rsp.token);
      if (req) {
        req.resolve(message);
      } else {
        console.warn(`request[token=${rsp.token}] not found`);
      }
    } else {
      const req = message as MessageRequest;
      const method = (this.service as any)[message.method];
      if (method) {
        try {
          const rs = await method.call(this.service, ...req.params);
          this.response(rs, req);
        } catch (e: any) {
          console.warn(e.message || e);
        }
      } else {
        this.response(true, req);
      }
    }
  }
  private response(data: any, r: MessageRequest, code?: number) {
    this.webview.postMessage({ isrsp: true, token: r.token, method: r.method, code, data });
  }
  private request(m: MessageBase & { params: Array<any>; }): Promise<any> {
    (m as MessageRequest).token = this.token++;
    const req = Object.assign({}, m) as unknown as MessageRequest;
    req.timer = setTimeout(((token: number) => {
      const req = this.queue.find(e => e.token === token);
      if (req) {
        req.timer = undefined as any;
        req.reject('timeout');
      }
    }).bind(this, req.token), 5000);
    this.queue.push(req);
    return new Promise((resolve, reject) => {
      req.resolve = resolve;
      req.reject = reject;
      this.webview.postMessage(m);
    })
      .then((rsp) => {
        clearTimeout(req.timer);
        req.timer = undefined as any;
        return rsp;
      })
      .catch((e) => {
        (req as any).error = e;
        console.warn(e.message || e);
      })
      .finally(() => {
        if (req.timer) {
          clearTimeout(req.timer);
          req.timer = undefined as any;
        }
        this.queue.splice(this.queue.indexOf(req), 1);
        const { error } = req as any;
        if (error) {
          throw error;
        }
      });
  }
};

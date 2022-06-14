import * as vscode from 'vscode';
import { MessageData, StylePatch, VsCode as VsCodeService } from 'vspage';

export class Service implements VsCodeService, vscode.Disposable {
  constructor(private terminal: vscode.EventEmitter<string>) {
  }
  dispose() {
  }
  alert(data: string | MessageData): void {
    const message = typeof data === 'string' ? data : data.message;
    const type = typeof data === 'string' ? 'info' : data.type;
    let items: Array<string> = typeof message === 'string' ? [message] : [];
    if (typeof message !== 'string') {
      if (typeof message === 'string') {
        items.push(message);
      } else if (Array.isArray(message)) {
        items = message;
      } else {
        items.push(JSON.stringify(message));
      }
    }
    const colors = {
      debug: '\x1b[37m',
      info: '\x1b[37m',
      warning: '\x1b[31m',
      error: '\x1b[33m',
    };
    this.terminal.fire(colors[type] || colors.info);
    for (const it of items) {
      this.terminal.fire(it.replace(/http:\/\/[^:]+:[0-9]+\/project\//mg, '/').replace(/([^\r])\n/mg, '$1\r\n'));
    }
    this.terminal.fire('\x1b[0m\r\n');
  }
  patchStyle(target: string, patch: StylePatch): void {
    throw new Error('Method not implemented.');
  }
  select(target: string | null): void {
    this.alert(`select [${target}]`);
  }
}
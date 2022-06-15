import fs from 'fs';
import path from 'path';
import * as vscode from 'vscode';
import { MessageData, StylePatch, VsCode as VsCodeService } from 'vspage';
import utils from './utils';
import { TyAstRoot } from './utils/html';

export function transpileWxml(src: string): TyAstRoot {
  const root = utils.html.htmlToAstEx(src, undefined, {
    parseText(ast: TyAstText, text: string) {
      ast.text = utils.wxml.parseTextValue(text);
      return true;
    },
    parseAttr(ast: TyAst, name: string, value: string) {
      const lcname = name.toLocaleLowerCase();
      const values = utils.wxml.parseTextValue(value);
      const hasBound = /{{.*}}/.test(value);
      /** only transpile style */
      if (lcname === 'style') {
        if (hasBound) {
          if (!ast.attrs) ast.attrs = {};
          ast.attrs[hasBound ? `:${name}` : name] = values ? utils.wxml.stringifyToText(values) : value;
        } else {
          ast.style = utils.css.inlineStyleToAst(value);
        }
      } else {
        if (!ast.attrs) ast.attrs = {};
        ast.attrs[hasBound ? `:${name}` : name] = values ? utils.wxml.stringifyToText(values) : value;
      }
      return true;
    },
  });
  return root.htmlAst;
}

export class Service implements VsCodeService, vscode.Disposable {
  constructor(private miniroot: string, private terminal: vscode.EventEmitter<string>) {
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
  patchStyle(pagePath: TyPath, target: string, patch: StylePatch): void {
    const absFilePath = path.join(this.miniroot, pagePath);
    const editor = vscode.window.visibleTextEditors.find(e => utils.path.compatible(e.document.uri.path) === absFilePath);
    const src = editor ? editor.document.getText() : fs.readFileSync(absFilePath, 'utf8');
    const ast = transpileWxml(src);
    const node = utils.html.query(ast, target);
    if (!node) {
      throw new Error(`cannot find node [${target}]`);
    }
    const style = node.style || (node.style = {});
    let changed = false;
    for (const [key, value] of Object.entries(patch)) {
      if (value === false) {
        if (Object.hasOwnProperty.call(style, key)) {
          delete style[key];
          changed = true;
        }
        continue;
      }
      if (!Object.hasOwnProperty.call(style, key)) {
        changed = true;
        style[key] = value;
      } else if (style[key] !== patch[key]) {
        changed = true;
        style[key] = value;
      }
    }
    if (!changed) {
      return;
    }
    const newSrc = utils.html.astToHtml(ast);
    if (editor) {
      editor.edit((edit: vscode.TextEditorEdit) => {
        const firstLine = editor.document.lineAt(0);
        const lastLine = editor.document.lineAt(editor.document.lineCount - 1);
        const textRange = new vscode.Range(firstLine.range.start, lastLine.range.end);
        edit.replace(textRange, newSrc);
      });
    } else if (fs.existsSync(absFilePath)) {
      fs.writeFileSync(absFilePath, newSrc, 'utf-8');
    }
  }
  select(pagePath: TyPath, target: string | null): void {
    this.alert(`select [${target}]`);
  }
}
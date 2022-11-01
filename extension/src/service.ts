import fs from 'fs';
import path from 'path';
import { ChildProcess, spawn } from 'child_process';
import * as vscode from 'vscode';
import { MessageData, StylePatch, VsCode as VsCodeService } from 'vspage';
import utils from './utils';
import { TyAstRoot } from './utils/html';
import shelljs from 'shelljs';

const wxmlEmitter = {
  textContent(ast: TyAstText) {
    return utils.wxml.stringifyToText(ast.text);
  },
  stringify: (ast: TyAst) => {
    let src = '';
    if (ast.logic) {
      const logics: Array<TyAstLogic> = Array.isArray(ast.logic) ? ast.logic : [ast.logic];
      for (const logic of logics) {
        if (logic.instruction === 'wx:for') {
          const forIndex = logic.data.index || 'index';
          const forItem = logic.data.it || 'item';
          src += ` wx:for=${utils.wxml.toAttrString(`{{${logic.data.entity}}}`)} wx:for-item='${forItem}' wx:for-index='${forIndex}'`;
          if (logic.data.key) {
            src += ` wx:key=${utils.wxml.toAttrString(logic.data.key)}`;
          }
        } else if (logic.data.entity) {
          src += ` ${logic.instruction}=${utils.wxml.toAttrString(`{{${logic.data.entity}}}`)}`;
        } else {
          src += ` ${logic.instruction}`;
        }
      }
    }

    for (const key in ast.events) {
      const value = ast.events[key];
      src += ` bind:${key}=${utils.wxml.toAttrString(value)}`;
    }

    for (const [key, value] of Object.entries(ast.attrs || {} as any as TyMap<any>)) {
      const keyWithoutColon = key[0] === ':' ? key.substring(1) : key;
      if (key[0] === ':') {
        src += ` ${keyWithoutColon}=${utils.wxml.toAttrString(value)}`;
        continue;
      }
      const valueType = typeof value;
      if (valueType === 'string') {
        if (value === null) {
          src += ` ${keyWithoutColon}`;
        } else {
          src += ` ${keyWithoutColon}=${utils.wxml.toAttrString(value)}`;
        }
      } else if (valueType === 'object' && Array.isArray(value)) {
        src += ` ${keyWithoutColon}=${utils.wxml.toAttrString(value.join(' '))}`;
      } else if (valueType === 'boolean') {
        if (value) {
          src += ` ${keyWithoutColon}`;
        }
      } else if (value === null) {
        src += ` ${keyWithoutColon}`;
      } else {
        src += ` ${keyWithoutColon}=${utils.wxml.toAttrString(value)}`;
      }
    }

    // process class list
    const classes: any = typeof ast.classes === 'string' ? [ast.classes] : ast.classes;
    if (classes?.length) {
      let hasBound = false;
      for (const iterator of classes) {
        if (Object.hasOwnProperty.call(iterator, '$')) {
          hasBound = true;
        }
      }
      if (hasBound) {
        const nameList = [];
        for (const iterator of classes) {
          if (Object.hasOwnProperty.call(iterator, '$')) {
            nameList.push(`{{${iterator.$}}}`);
          } else {
            nameList.push(iterator);
          }
        }
        src += ` class=${utils.wxml.toAttrString(nameList.join(' ').replace(/\s\s+/g, ' '))}`;
      } else {
        src += ` class=${utils.wxml.toAttrString(classes.join(' ').replace(/\s\s+/g, ' '))}`;
      }
    }

    const style = Object.assign((ast as any).Gstyle || {}, ast.style || {});
    if (Object.keys(style).length) {
      src += ` style='${utils.css.astToInlinestyle(style)}'`;
    }
    return src;
  },
};

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
  private srvpro?: ChildProcess;
  constructor(private extroot: string, private workspacePath: string, private minisrc: string, private terminal: vscode.EventEmitter<string>) {
  }
  launchService(): Promise<number> {
    if (this.srvpro) {
      throw 'Aready launched';
    }
    const child = shelljs.exec(`node ./service.js --root=${this.workspacePath}`, {
      cwd: this.extroot,
      async: true,
    });
    this.srvpro = child;
    let resolved = false;
    return new Promise<number>((resolve, reject) => {
      child.stdout?.on('data', (data) => {
        if (!resolved) {
          const ms = /\[port=(\d+)\]/.exec(data);
          if (ms) {
            resolved = true;
            resolve(parseInt(ms[1]));
          }
        }
      });
      child.on('exit', (code) => {
        this.srvpro = undefined;
        if (!resolved) {
          reject(0);
        }
        console.error(`vspage service exit with code[${code}]`);
      });
    });
  }
  dispose() {
    try {
      this.srvpro?.kill(9);
    } catch (e) {
      console.error(e);
    }
  }
  alert(data: string | MessageData): void {
    const message = typeof data === 'string' ? data : data.message;
    const type = typeof data === 'string' ? 'info' : data.type;
    let items: Array<string> = typeof message === 'string' ? [`[${type.toUpperCase()}] ${message}`] : [];
    if (typeof message !== 'string') {
      if (Array.isArray(message)) {
        items = (message as any).map((e: any) => `[${type.toUpperCase()}] ${e}`);
      } else {
        items.push(`[${type.toUpperCase()}] ${JSON.stringify(message)}`);
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
    const absFilePath = path.join(this.minisrc, `${pagePath}.wxml`);
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
    const newSrc = utils.html.astToHtml(ast, 0, wxmlEmitter);
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
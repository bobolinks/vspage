import fs from 'fs';
import path from 'path';
import * as vscode from 'vscode';
import ts from 'typescript';
import md5 from 'md5';
import utils from './utils';
import { VsPage } from './vspage';
import { PageData } from 'vspage';
import { Service } from './service';

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

const vspageConfigFile = '.vspage/config.json';
const miniProjectConfigFile = 'project.config.json';

export class WebView {
  /**
   * Track the currently panel. Only allow a single panel to exist at a time.
   */
  public static currentPanel: WebView | undefined;

  public static createOrShow(context: vscode.ExtensionContext) {
    const pos = vscode.ViewColumn.Two;
    // If we already have a panel, show it.
    if (WebView.currentPanel) {
      WebView.currentPanel.panel.reveal(pos);
      return;
    }

    const opts: vscode.WebviewOptions = {
      // Enable javascript in the webview
      enableScripts: true,
      // And restrict the webview to only loading content from our extension's root directory.
      localResourceRoots: [context.extensionUri],
    };

    const panel = vscode.window.createWebviewPanel(
      'vide.editor',
      'Vide Editor',
      vscode.ViewColumn.Two,
      Object.assign(opts, { retainContextWhenHidden: true } as any as vscode.WebviewPanelOptions),
    );

    WebView.currentPanel = new WebView(context, panel);
  }

  public static revive(context: vscode.ExtensionContext, panel: vscode.WebviewPanel) {
    WebView.currentPanel = new WebView(context, panel);
  }

  public readonly terminal: vscode.Terminal;
  public currentEditor: vscode.TextEditor | undefined;
  private disposables: vscode.Disposable[] = [];
  private nonce: string = getNonce();
  private vspage: VsPage;
  private service: Service;
  private exclude: Array<string>;
  private modulesMap: Record<string, string> = {};
  private compilerOptions: ts.CompilerOptions;
  private workspacePath: string;
  private projectPath: string;
  private minirootPath: string;
  private curPagePath: string | undefined;
  private curPage: PageData | undefined;

  constructor(private context: vscode.ExtensionContext, private panel: vscode.WebviewPanel) {
    const rootPath = (vscode.workspace.workspaceFolders || [])[0];
    if (!rootPath) {
      throw 'illegal project path';
    }

    this.workspacePath = utils.path.compatible(rootPath.uri.path);
    this.projectPath = this.workspacePath;

    // load vspage config
    this.exclude = [];
    const vspageConfigPath = path.join(this.workspacePath, vspageConfigFile);
    if (fs.existsSync(vspageConfigPath)) {
      const config = JSON.parse(fs.readFileSync(vspageConfigPath, 'utf-8'));
      if (config.projectRoot) {
        this.projectPath = path.resolve(this.workspacePath, config.projectRoot);
      }
      if (config.exclude) {
        this.exclude = config.exclude as any;
      }
      if (config.modules) {
        this.modulesMap = config.modules;
      }
    }

    // load mini project config
    this.minirootPath = this.projectPath;
    const miniProjectConfigPath = path.join(this.projectPath, miniProjectConfigFile);
    if (fs.existsSync(miniProjectConfigPath)) {
      const config = JSON.parse(fs.readFileSync(miniProjectConfigPath, 'utf-8'));
      if (config.miniprogramRoot) {
        this.minirootPath = path.resolve(this.projectPath, config.miniprogramRoot);
      }
    }

    // load tsconfig
    this.compilerOptions = {};
    this.reloadTsConfig();

    // init terminal
    const writeEmitter = new vscode.EventEmitter<string>();
    this.terminal = vscode.window.createTerminal({
      name: 'vide',
      pty: {
        onDidWrite: writeEmitter.event,
        open: () => {
          writeEmitter.fire('\x1b[32mVide[0.0.1] extension for vscode.\x1b[0m\r\n');
        },
        close: () => {
          writeEmitter.fire('\x1b[32mBye\x1b[0m');
        },
      },
    } as any as vscode.ExtensionTerminalOptions);
    this.terminal.show(true);

    // init service
    this.service = new Service(this.context.asAbsolutePath(''), this.workspacePath, this.minirootPath, writeEmitter);

    // init vspage
    this.vspage = new VsPage(this.panel.webview, this.service);

    // setup
    this.setup();
  }
  async setup() {
    const port = await this.service.launchService();
    await this.setupView(port);
    await this.setupEvents();
  }
  async setupView(port: number) {
    // Use a nonce to only allow specific scripts to be run
    const { webview } = this.panel;

    this.panel.iconPath = {
      light: vscode.Uri.parse(this.context.asAbsolutePath('logo.svg')),
      dark: vscode.Uri.parse(this.context.asAbsolutePath('logo.svg')),
    };
    this.panel.title = 'VsPage';

    // todo:
    const host = `http://localhost:${port}`;

    webview.html = `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <!--
        <meta http-equiv="Content-Security-Policy" content="default-src * 'unsafe-inline' 'strict-dynamic';">
        --!>
        <meta http-equiv="Content-Security-Policy" content="default-src 'self'; frame-src vscode-webview: http://localhost:*; style-src 'unsafe-inline' ${webview.cspSource}; script-src-elem 'unsafe-inline' localhost:* ${webview.cspSource}; script-src 'unsafe-inline' 'strict-dynamic' localhost:* 'nonce-${this.nonce}';">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
        html, body, #ide {
          margin: 0 !important;
          padding: 0 !important;
          width: 100vw !important;
          min-width: 100vw !important;
          min-height: 100vh !important;
          height: 100vh !important;
        }
        ::-webkit-scrollbar{display:none;}
        </style>
        <script nonce="${this.nonce}">
          window.addEventListener('message', event => {
            if (event.data.toService) {
              VsCodeApi.postMessage(event.data);
            } else {
              ide.contentWindow.postMessage(event.data, '*');
            }
          });
          window.VsCodeApi = acquireVsCodeApi();
          window.onload = function() {
            window.ide = document.getElementById('ide');
          }
        </script>
      </head>
      <body>
        <iframe id=ide seamless="seamless" src="${host}/__ide__/index.html" style="all: unset; border: none;"></iframe>
      </body>
      </html>
     `;
  }
  async setupEvents() {
    vscode.workspace.onDidChangeTextDocument(this.onDidChangeTextDocument.bind(this), null, this.disposables);
    vscode.workspace.onDidSaveTextDocument(this.onDidSaveTextDocument.bind(this), null, this.disposables);
    vscode.workspace.onDidCloseTextDocument(this.onDidCloseTextDocument.bind(this), null, this.disposables);
    vscode.window.onDidChangeActiveTextEditor(this.onDidChangeActiveTextEditor.bind(this), null, this.disposables);
    vscode.window.onDidChangeTextEditorSelection(this.onDidChangeTextEditorSelection.bind(this), null, this.disposables);
    this.panel.webview.onDidReceiveMessage(this.vspage.onDidReceiveMessage.bind(this.vspage), null, this.disposables);
    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programatically
    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
  }
  private onDidChangeTextDocument(e: vscode.TextDocumentChangeEvent) {
    const curPath = utils.path.compatible(e.document.uri.path);
    /** ignore all files without ext */
    const ext = curPath.split('.').pop();
    if (!ext) {
      return;
    }
    if (!/^wxml$/i.test(ext)) {
      return;
    }
    /** not page selected */
    if (!this.curPage) {
      return;
    }
    const absWxmlPath = curPath.replace(/\.json$/, '.wxml');
    const relPagePath = utils.path.relative(this.minirootPath, absWxmlPath).replace(/\.\w+$/, '');
    /** page not matched */
    if (relPagePath !== this.curPagePath) {
      return;
    }
    const src = e.document.getText();
    if (this.curPage.wxml === src) {
      return;
    }
    const data: Partial<PageData> = {
      scoped: md5(`/${relPagePath}`),
      wxml: src,
    };
    this.curPage.wxml = src;
    this.vspage.updatePage(relPagePath, data);
  }
  private onDidSaveTextDocument(e: vscode.TextDocument) {
    const curPath = utils.path.compatible(e.uri.path);
    const relPath = utils.path.relative(this.projectPath, curPath);
    const relPagePath = utils.path.relative(this.minirootPath, curPath)
    if (/^\.+\//.test(relPath)) {
      return;
    }
    if (relPath === 'tsconfig.json') {
      this.reloadTsConfig();
    } else if (relPath === vspageConfigFile) {
      this.reloadVsPageConfig();
    } else if (/(?<!\.d)\.ts/i.test(relPath) && !utils.isMatchedVx(relPath, this.exclude)) {
      const jsFile = curPath.replace(/\.ts$/, '.js');
      const opts: ts.TranspileOptions = {
        compilerOptions: {
          alwaysStrict: true,
          inlineSourceMap: false,
          target: this.compilerOptions.target || ts.ScriptTarget.ESNext,
        },
      };
      const curDir = path.dirname(curPath);
      const modulesMap = this.modulesMap
      const workspacePath = this.workspacePath;
      if (Object.keys(this.modulesMap).length) {
        const moduleMapping = (context: ts.TransformationContext): ts.Transformer<ts.SourceFile> => {
          return (sourceFile: ts.SourceFile) => {
            function visitNode(node: ts.Node): ts.Node {
              if (ts.isImportDeclaration(node)) {
                const moduleSpecifier = node.moduleSpecifier as ts.StringLiteral;
                const mapping = modulesMap[moduleSpecifier.text];
                if (mapping) {
                  const mp = path.resolve(workspacePath, mapping);
                  let rmp = utils.path.relative(curDir, mp);
                  if (!rmp.startsWith('.')) {
                    rmp = `./${rmp}`;
                  }
                  // 创建新的 import 声明
                  const newModuleSpecifier = ts.factory.createStringLiteral(rmp);
                  return ts.factory.createImportDeclaration(
                    node.decorators,
                    node.modifiers,
                    node.importClause,
                    newModuleSpecifier,
                    node.assertClause
                  );
                }
              }
              return ts.visitEachChild(node, visitNode, context);
            }

            return ts.visitNode(sourceFile, visitNode);
          };
        }
        opts.transformers = {
          before: [moduleMapping],
        };
      }
      const rs = ts.transpileModule(e.getText(), opts);
      if (rs) {
        fs.writeFileSync(jsFile, `/* eslint-disable */\n${rs.outputText}`, 'utf-8');
      }
      this.vspage.updateFile(relPagePath, fs.statSync(curPath).mtimeMs);
    } else if (/(?<!\.d)\.wxss/i.test(relPath)) {
      this.vspage.updateFile(relPagePath, fs.statSync(curPath).mtimeMs);
    }
  }
  private onDidCloseTextDocument(e: vscode.TextDocument) {
    const curPath = utils.path.compatible(e.uri.path);
    const relPagePath = utils.path.relative(this.minirootPath, curPath).replace(/\.\w+$/, '');
    /** page chaned? */
    if (relPagePath === this.curPagePath) {
      this.currentEditor = undefined;
    }
  }
  private onDidChangeActiveTextEditor(editor: vscode.TextEditor | undefined) {
    if (!editor) {
      return;
    }

    const curPath = utils.path.compatible(editor.document.uri.path);
    const relPagePath = utils.path.relative(this.minirootPath, curPath).replace(/\.\w+$/, '');
    /** page chaned? */
    if (relPagePath === this.curPagePath) {
      return;
    }

    if (/\.wxml$/.test(curPath)) {
      const pagePath = curPath.replace(/\.wxml$/, '');
      let esmFile = `${pagePath}.ts`;
      if (!fs.existsSync(esmFile)) {
        esmFile = `${pagePath}.js`;
        if (!fs.existsSync(esmFile)) {
          throw 'not js|ts file found';
        }
      }
      this.curPage = {
        scoped: md5(`/${relPagePath}`),
        wxml: editor.document.getText(),
        // wxss: fs.readFileSync(`${pagePath}.wxss`, 'utf-8'),
        // json: JSON.parse(fs.readFileSync(`${pagePath}.json`, 'utf-8')) as any,
      };
      this.vspage.setCurrentPage(relPagePath, this.curPage);
      this.currentEditor = editor;
      this.curPagePath = relPagePath;
      try {
        this.panel.title = path.basename(editor.document.fileName);
      } catch (e) {
        // ignore
      }
    }
  }
  private onDidChangeTextEditorSelection(e: vscode.TextEditorSelectionChangeEvent) {
    if (this.currentEditor !== e.textEditor || !e.selections?.length) return;

    const curPath = utils.path.compatible(e.textEditor.document.uri.path);
    /** ignore all files without ext */
    const ext = curPath.split('.').pop();
    if (!ext) {
      return;
    }
    if (!/^wxml$/i.test(ext)) {
      return;
    }

    const relPagePath = utils.path.relative(this.minirootPath, curPath).replace(/\.\w+$/, '');
    /** page not matched */
    if (relPagePath !== this.curPagePath) {
      return;
    }

    function contentFromPosition(code: string, line: number, charPos: number) {
      const lines = code.split('\n');
      const lastLine = lines[line];
      lines.splice(line);
      return lines.join('\n') + lastLine.substring(0, charPos);
    }

    type Tree = {
      children: Array<Tree>;
    };

    function last(tree: Tree, indices: Array<number>) {
      if (!tree?.children?.length) {
        return;
      }
      const index = tree.children.length - 1;
      indices.push(index);
      last(tree.children[index], indices);
    }

    function pathFromPosition(code: string, line: number, charPos: number): string {
      const partCode = contentFromPosition(code, line, charPos);

      const ast = utils.html.htmlToAst(partCode);
      const paths: Array<number> = [];

      last(ast as any as Tree, paths);

      return paths.join('.');
    }
    const src = e.textEditor.document.getText();
    const astPath = pathFromPosition(src, e.selections[0].active.line, e.selections[0].active.character);
    this.vspage.select(astPath);
  }

  private dispose() {
    // Clean up our resources
    this.panel.dispose();
    this.terminal.dispose();
    this.vspage.dispose();
    this.service.dispose();
    WebView.currentPanel = undefined;
  }

  private reloadTsConfig() {
    const tsconfig = path.join(this.projectPath, 'tsconfig.json');
    if (fs.existsSync(tsconfig)) {
      const { config } = ts.parseConfigFileTextToJson(tsconfig, fs.readFileSync(tsconfig, 'utf-8'));
      if (config) {
        this.compilerOptions = config.compilerOptions || {};
      }
    }
  }
  private reloadVsPageConfig() {
    const vspageConfigPath = path.join(this.workspacePath, vspageConfigFile);
    if (fs.existsSync(vspageConfigPath)) {
      const config = JSON.parse(fs.readFileSync(vspageConfigPath, 'utf-8')) as VsPageConfig;
      if (config.projectRoot) {
        this.projectPath = utils.path.compatible(path.resolve(this.workspacePath, config.projectRoot));
      }
      if (config.exclude) {
        this.exclude = config.exclude as any;
      }
      if (config.modules) {
        this.modulesMap = config.modules;
      } else {
        this.modulesMap = {};
      }
    }
  }
}

/* eslint-disable max-len */
import * as vscode from 'vscode';
import { prepare } from './prepare';

async function setup(context: vscode.ExtensionContext) {
  const { WebView } = require('./webview');
  context.subscriptions.push(vscode.commands.registerCommand('vide', () => {
    WebView.createOrShow(context);
  }));

  if (vscode.window.registerWebviewPanelSerializer) {
    // Make sure we register a serializer in activation event
    vscode.window.registerWebviewPanelSerializer('vide.editor', {
      async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel) {
        webviewPanel.webview.options = {
          // Enable javascript in the webview
          enableScripts: true,
          localResourceRoots: [context.extensionUri]
        };
        WebView.revive(context, webviewPanel);
      },
    });
  }
}

export function activate(context: vscode.ExtensionContext) {
  const rs = prepare(context.extensionPath);
  if (typeof rs === 'boolean') {
    setup(context);
  } else {
    rs.then(() => {
      setup(context);
    })
  }
}
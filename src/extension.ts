import * as vscode from 'vscode';

import { removeUnusedImportsInCurrentFile, removeUnusedImportsInProject } from './extensionActions';

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.removeUnusedImportsInCurrentFile', removeUnusedImportsInCurrentFile)
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.removeUnusedImportsInProject', removeUnusedImportsInProject)
  );
}

export function deactivate(): void {}

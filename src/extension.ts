import * as vscode from 'vscode';
import { removeUnusedImportsInCurrentFile, removeUnusedImportsInProject } from './actions';

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.removeUnusedImportsInCurrentFile', removeUnusedImportsInCurrentFile)
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.removeUnusedImportsInProject', removeUnusedImportsInProject)
  );
}

export function deactivate(): void {}

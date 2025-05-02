import * as vscode from "vscode";
import { removeUnusedImports } from "./imports";

export async function removeUnusedImportsInCurrentFile(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('No active editor found.');
    return;
  }

  const document = editor.document;
  const text = document.getText();
  const { newLines, unusedImportsPresents } = removeUnusedImports(text);

  const edit = new vscode.WorkspaceEdit();
  const fullRange = new vscode.Range(
    document.positionAt(0),
    document.positionAt(text.length)
  );
  if (unusedImportsPresents) {
    edit.replace(document.uri, fullRange, newLines);
    await vscode.workspace.applyEdit(edit);

  }

  vscode.window.showInformationMessage('Unused imports removed from the current file.');
}

export async function removeUnusedImportsInProject(): Promise<void> {
  const config = vscode.workspace.getConfiguration('CleanImports');

  const userInclude: string[] = config.get('includePaths', []);
  const userExclude: string[] = config.get('excludePaths', []);

  let files: vscode.Uri[] = [];

  for (const includePattern of userInclude) {
    const excludeGlob = `{${userExclude.join(',')}}`; // Combinamos las exclusiones
    const matchedFiles = await vscode.workspace.findFiles(includePattern, excludeGlob);
    files.push(...matchedFiles);
  }
  for (const file of files) {
    const document = await vscode.workspace.openTextDocument(file);
    const text = document.getText();
    const { newLines, unusedImportsPresents } = removeUnusedImports(text);
    const edit = new vscode.WorkspaceEdit();
    const fullRange = new vscode.Range(
      document.positionAt(0),
      document.positionAt(text.length)
    );
    if (unusedImportsPresents) {
      edit.replace(document.uri, fullRange, newLines);
      await vscode.workspace.applyEdit(edit);
    }

  }

  vscode.window.showInformationMessage('Unused imports removed from the entire project.');
}


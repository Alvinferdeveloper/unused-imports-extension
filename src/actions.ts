import * as vscode from "vscode";
export function removeUnusedImports(text: string): string {
  const lines = text.split('\n');
  const usedIdentifiers = new Set<string>();
  const importStatements: { line: string; index: number }[] = [];

  // First pass: collect imports and find identifiers used in the code
  lines.forEach((line, index) => {
    const importMatch = line.trim().match(/^import\s+(.*?)\s+from\s+['"].+?['"];?$/);
    if (importMatch) {
      importStatements.push({ line, index });
    } else {
      const matches = line.match(/\b[a-zA-Z_$][a-zA-Z_$0-9]*\b/g);
      if (matches) {
        matches.forEach((id) => usedIdentifiers.add(id));
      }
    }
  });

  // Second pass: filter unused imports
  importStatements.forEach(({ line, index }) => {
    const defaultImportMatch = line.match(/^import\s+([a-zA-Z_$][a-zA-Z_$0-9]*)\s+from/);
    const namedImportMatch = line.match(/import\s+\{\s*([^}]+)\s*\}\s+from/);
    const wildcardImportMatch = line.match(/^import\s+\*\s+as\s+([a-zA-Z_$][a-zA-Z_$0-9]*)\s+from/);

    let isUsed = false;

    if (defaultImportMatch) {
      const defaultImport = defaultImportMatch[1];
      if (usedIdentifiers.has(defaultImport)) {
        isUsed = true;
      }
    }

    if (namedImportMatch) {
      const namedImports = namedImportMatch[1].split(',').map((name) => name.trim());
      const usedNamedImports = namedImports.filter((name) => usedIdentifiers.has(name));

      if (usedNamedImports.length > 0) {
        isUsed = true;
        // Update the import line to include only used named imports
        const updatedLine = `import { ${usedNamedImports.join(', ')} } from` + line.split('from')[1];
        lines[index] = updatedLine;
      }
    }

    if (wildcardImportMatch) {
      const wildcardImport = wildcardImportMatch[1];
      if (usedIdentifiers.has(wildcardImport)) {
        isUsed = true;
      }
    }

    if (!isUsed) {
      lines[index] = ''; // Remove unused import
    }
  });

  return lines.join('\n');
}

export async function removeUnusedImportsInCurrentFile(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('No active editor found.');
    return;
  }

  const document = editor.document;
  const text = document.getText();
  const updatedText = removeUnusedImports(text);

  const edit = new vscode.WorkspaceEdit();
  const fullRange = new vscode.Range(
    document.positionAt(0),
    document.positionAt(text.length)
  );

  edit.replace(document.uri, fullRange, updatedText);
  await vscode.workspace.applyEdit(edit);

  vscode.window.showInformationMessage('Unused imports removed from the current file.');
}

export async function removeUnusedImportsInProject(text: string): Promise<void> {

}


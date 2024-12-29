import * as vscode from "vscode";
import { classifyLines, namedImportAction } from "./imports";
export function removeUnusedImports(text: string): { newLines: string, unusedImportsPresents: boolean } {
  const lines = text.split('\n');
  let unusedImportsPresents = false;

  // First pass: collect imports and find identifiers used in the code
  const { usedIdentifiers, importStatements } = classifyLines(lines);

  // Second pass: filter unused imports
  importStatements.forEach(({ line, index }) => {
    const defaultImportMatch = line.match(/^import\s+([a-zA-Z_$][a-zA-Z_$0-9]*)\s+from/);
    const namedImportMatch = line.match(/import\s+\{\s*([^}]+)\s*\}\s+from/);
    const wildcardImportMatch = line.match(/^import\s+\*\s+as\s+([a-zA-Z_$][a-zA-Z_$0-9]*)\s+from/);
    const typeImportMatch = line.match(/^import\s+type\s+\{\s*([^}]+)\s*\}\s+from/);
    const combinedImportMatch = line.match(/^import\s+([a-zA-Z_$][a-zA-Z_$0-9]*)?,?\s*\{\s*([^}]+)\s*\}\s+from/);


    let isUsed = false;

    if (defaultImportMatch) {
      const defaultImport = defaultImportMatch[1];
      if (usedIdentifiers.has(defaultImport)) {
        isUsed = true;
      }
    }

    else if (namedImportMatch) {
      const namedImports = namedImportMatch[1].split(',').map((name) => name.trim());
      const usedNamedImports = namedImports.filter((name) => {
        return usedIdentifiers.has(name) && !new RegExp(`${name}\s*:`).test(text);
      });
      const namedImport = namedImportAction(usedNamedImports, namedImports, usedIdentifiers, line);
      isUsed = namedImport.isUsed;
      unusedImportsPresents = namedImport.unusedImportsPresents;
      if (namedImport.newLine) {
        lines[index] = namedImport.newLine;
      }
    }

    else if (wildcardImportMatch) {
      const wildcardImport = wildcardImportMatch[1];
      if (usedIdentifiers.has(wildcardImport)) {
        isUsed = true;
      }
    }
    else if (typeImportMatch) {
      const typeImports = typeImportMatch[1].split(',').map((name) => name.trim());
      const usedTypeImports = typeImports.filter((name) => usedIdentifiers.has(name));

      if (usedTypeImports.length > 0) {
        isUsed = true;
        const updatedLine = `import type { ${usedTypeImports.join(', ')} } from` + line.split('from')[1];
        lines[index] = updatedLine;
      }
    }
    else if (combinedImportMatch) {
      const defaultImport = combinedImportMatch[1];
      const namedImports = combinedImportMatch[2].split(',').map((name) => name.trim());

      const usedNamedImports = namedImports.filter((name) => usedIdentifiers.has(name));
      const isDefaultUsed = defaultImport && usedIdentifiers.has(defaultImport);
      if (usedNamedImports.length < namedImports.length || !isDefaultUsed) {
        unusedImportsPresents = true;
      }

      if (isDefaultUsed || usedNamedImports.length > 0) {
        isUsed = true;
        let updatedLine = 'import ';
        if (isDefaultUsed) {
          updatedLine += defaultImport;
        }
        if (isDefaultUsed && usedNamedImports.length > 0) {
          updatedLine += ', ';
        }
        if (usedNamedImports.length > 0) {
          updatedLine += `{ ${usedNamedImports.join(', ')} }`;
        }
        updatedLine += ' from' + line.split('from')[1];
        lines[index] = updatedLine;
      }
    }


    if (!isUsed) {
      unusedImportsPresents = true;
      lines[index] = ''; // Remove unused import
    }
  });
  const newLines = lines.join('\n');
  return { newLines, unusedImportsPresents };
}

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
  const files = await vscode.workspace.findFiles('{app,src}/**/*.{js,jsx,ts,tsx}',
    '**/node_modules/**');

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


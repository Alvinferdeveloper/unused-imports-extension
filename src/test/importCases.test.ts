import * as assert from 'assert';
import * as vscode from 'vscode';
import { removeUnusedImports } from '../imports';  // Asegúrate de que la ruta es correcta

suite('Extension Test Suite', () => {
  suiteTeardown(() => {
    vscode.window.showInformationMessage('All tests done!');
  });

  test('removeUnusedImports - No unused imports', () => {
    const inputText = `
      import { something } from 'module';
      const x = 10;
      const result = something();
    `;
    const result = removeUnusedImports(inputText);
    assert.strictEqual(result.newLines.trim(), inputText.trim());
    assert.strictEqual(result.unusedImportsPresents, false);
  });
});
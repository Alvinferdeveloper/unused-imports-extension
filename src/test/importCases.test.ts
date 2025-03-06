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

  test('removeUnusedImports - Unused default imports', () => {
    const inputText = `
      import 'something' from 'module';
      const x = 10;
    `;
    const result = removeUnusedImports(inputText);

    const expectedText = `
      const x = 10;
    `.trim();
    assert.strictEqual(result.newLines.trim(), expectedText);
    assert.strictEqual(result.unusedImportsPresents, true);
  });

  test('removeUnusedImports - one unused named import on a single line', () => {
    const inputText = `
      import { something } from 'module';
      const x = 10;
    `;
    const result = removeUnusedImports(inputText);

    const expectedText = `
      const x = 10;
    `.trim();
    assert.strictEqual(result.newLines.trim(), expectedText);
    assert.strictEqual(result.unusedImportsPresents, true);
  });

  test('removeUnusedImports - used and unused named imports on a single line', () => {
    const inputText = `
      import { something, anything } from 'module';
      const x = 10;
      const result = something();
    `;
    const result = removeUnusedImports(inputText);

    const expectedText = `
      import { something } from 'module';
      const x = 10;
      const result = something();
    `.trim();
    assert.strictEqual(result.newLines.trim(), expectedText);
    assert.strictEqual(result.unusedImportsPresents, true);
  });

  test('removeUnusedImports - multiple unused imports from different modules', () => {
    const inputText = `
      import { something } from 'module1';
      import { another } from 'module2';
      import { third } from 'module3';
      const x = 10;
    `;
    const result = removeUnusedImports(inputText);
    const expectedText = `
      const x = 10;
    `.trim();
    assert.strictEqual(result.newLines.trim(), expectedText);
    assert.strictEqual(result.unusedImportsPresents, true);
  });

  test('removeUnusedImports - namespace imports', () => {
    const inputText = `
      import * as myModule from 'module';
      const x = 10;
    `;
    const result = removeUnusedImports(inputText);
    const expectedText = `
      const x = 10;
    `.trim();
    assert.strictEqual(result.newLines.trim(), expectedText);
    assert.strictEqual(result.unusedImportsPresents, true);
  });

  test('removeUnusedImports - type imports in TypeScript', () => {
    const inputText = `
      import type { MyType } from 'module';
      import { usedFunction } from 'module';
      const x: MyType = usedFunction();
    `;
    const result = removeUnusedImports(inputText);
    assert.strictEqual(result.newLines.trim(), inputText.trim());
    assert.strictEqual(result.unusedImportsPresents, false);
  });
});
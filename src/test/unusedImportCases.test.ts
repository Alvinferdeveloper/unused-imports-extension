import * as assert from 'assert';
import * as vscode from 'vscode';
import { removeUnusedImports } from '../imports';  // Asegúrate de que la ruta es correcta

suite('Extension Test Suite for unused imports', () => {
  suiteTeardown(() => {
    vscode.window.showInformationMessage('All tests done!');
  });

  test('removeUnusedImports - Unused default imports', () => {
    const inputText = `
      import something from 'module';
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

  test('removeUnusedImports - unused type imports in TypeScript', () => {
    const inputText = `
      import type { UnusedType1, UnusedType2 } from 'types';
      const x = 10;
    `;
    const result = removeUnusedImports(inputText);
    const expectedText = `
      const x = 10;
    `.trim();
    assert.strictEqual(result.newLines.trim(), expectedText);
    assert.strictEqual(result.unusedImportsPresents, true);
  });

  test('removeUnusedImports - mixed used and unused type imports', () => {
    const inputText = `
      import type { UsedType, UnusedType } from 'types';
      const x: UsedType = 10;
    `;
    const result = removeUnusedImports(inputText);
    const expectedText = `
      import type { UsedType } from 'types';
      const x: UsedType = 10;
    `.trim();
    assert.strictEqual(result.newLines.trim(), expectedText);
    assert.strictEqual(result.unusedImportsPresents, true);
  });

  test('removeUnusedImports - unused aliased imports', () => {
    const inputText = `
      import { something as somethingElse } from 'module';
      const x = 10;
    `;
    const result = removeUnusedImports(inputText);
    const expectedText = `
      const x = 10;
    `.trim();
    assert.strictEqual(result.newLines.trim(), expectedText);
    assert.strictEqual(result.unusedImportsPresents, true);
  });

  test('removeUnusedImports - unused default with used named imports', () => {
    const inputText = `
      import defaultExport, { used } from 'module';
      const x = used();
    `;
    const result = removeUnusedImports(inputText);
    const expectedText = `
      import { used } from 'module';
      const x = used();
    `.trim();
    assert.strictEqual(result.newLines.trim(), expectedText);
    assert.strictEqual(result.unusedImportsPresents, true);
  });

  test('removeUnusedImports - unused named with used default imports', () => {
    const inputText = `
      import defaultExport, { unused1, unused2 } from 'module';
      const x = defaultExport();
    `;
    const result = removeUnusedImports(inputText);
    const expectedText = `
      import defaultExport from 'module';
      const x = defaultExport();
    `.trim();
    assert.strictEqual(result.newLines.trim(), expectedText);
    assert.strictEqual(result.unusedImportsPresents, true);
  });

  test('removeUnusedImports - commented code should not prevent removal', () => {
    const inputText = `
      import { unused } from 'module';
      // const x = unused();
      /* const y = unused(); */
      const z = 10;
    `;
    const result = removeUnusedImports(inputText);
    const expectedText = `
      const z = 10;
    `.trim();
    assert.strictEqual(result.newLines.trim(), expectedText);
    assert.strictEqual(result.unusedImportsPresents, true);
  });

  test('removeUnusedImports - string literals should not prevent removal', () => {
    const inputText = `
      import { unused } from 'module';
      const x = "unused";
      const y = \`template literal with unused\`;
    `;
    const result = removeUnusedImports(inputText);
    const expectedText = `
      const x = "unused";
      const y = \`template literal with unused\`;
    `.trim();
    assert.strictEqual(result.newLines.trim(), expectedText);
    assert.strictEqual(result.unusedImportsPresents, true);
  });

  test('removeUnusedImports - object property names should not prevent removal', () => {
    const inputText = `
      import { unused } from 'module';
      const obj = {
        unused: 123,
        'unused': 456
      };
    `;
    const result = removeUnusedImports(inputText);
    const expectedText = `
      const obj = {
        unused: 123,
        'unused': 456
      };
    `.trim();
    assert.strictEqual(result.newLines.trim(), expectedText);
    assert.strictEqual(result.unusedImportsPresents, true);
  });

  test('removeUnusedImports - destructuring should not prevent removal', () => {
    const inputText = `
      import { unused } from 'module';
      const { unused: renamed } = someObject;
    `;
    const result = removeUnusedImports(inputText);
    const expectedText = `
      const { unused: renamed } = someObject;
    `.trim();
    assert.strictEqual(result.newLines.trim(), expectedText);
    assert.strictEqual(result.unusedImportsPresents, true);
  });

  test('removeUnusedImports - multiple type-only imports', () => {
    const inputText = `
      import type { UnusedType } from 'types1';
      import { type AnotherUnused } from 'types2';
      const x = 10;
    `;
    const result = removeUnusedImports(inputText);
    const expectedText = `
      const x = 10;
    `.trim();
    assert.strictEqual(result.newLines.trim(), expectedText);
    assert.strictEqual(result.unusedImportsPresents, true);
  });

});
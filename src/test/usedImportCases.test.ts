import { removeUnusedImports } from '../imports';
import * as assert from 'assert';

suite('Extension Test Suite for used imports', () => {

  test('keep usedImports - default import being used', () => {
    const inputText = `
      import defaultModule from 'module';
      const result = defaultModule.something();
    `;
    const result = removeUnusedImports(inputText);
    assert.strictEqual(result.newLines.trim(), inputText.trim());
    assert.strictEqual(result.unusedImportsPresents, false);
  });

  test('keep usedImports - namespace import being used', () => {
    const inputText = `
      import * as myModule from 'module';
      const result = myModule.something();
    `;
    const result = removeUnusedImports(inputText);
    assert.strictEqual(result.newLines.trim(), inputText.trim());
    assert.strictEqual(result.unusedImportsPresents, false);
  });

  test('keep usedImports - one used import on a single line', () => {
    const inputText = `
      import { something } from 'module';
      const x = 10;
      const result = something();
    `;
    const result = removeUnusedImports(inputText);
    assert.strictEqual(result.newLines.trim(), inputText.trim());
    assert.strictEqual(result.unusedImportsPresents, false);
  });

  test('keep usedImports - multiple used named imports on a single line', () => {
    const inputText = `
    import { something, somethingElse } from 'module';
    const x = 10;
    const result = something();
    const result2 = somethingElse();
  `;
    const result = removeUnusedImports(inputText);
    assert.strictEqual(result.newLines.trim(), inputText.trim());
    assert.strictEqual(result.unusedImportsPresents, false);
  });

  test('keep usedImports - one used import on a single line with type import', () => {
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
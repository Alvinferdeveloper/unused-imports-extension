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

  test('keep usedImports - combined default and named imports being used', () => {
    const inputText = `
      import defaultModule, { namedExport } from 'module';
      const result1 = defaultModule.method();
      const result2 = namedExport();
    `;
    const result = removeUnusedImports(inputText);
    assert.strictEqual(result.newLines.trim(), inputText.trim());
    assert.strictEqual(result.unusedImportsPresents, false);
  });

  test('keep usedImports - aliased imports being used', () => {
    const inputText = `
      import { something as somethingElse } from 'module';
      const result = somethingElse();
    `;
    const result = removeUnusedImports(inputText);
    assert.strictEqual(result.newLines.trim(), inputText.trim());
    assert.strictEqual(result.unusedImportsPresents, false);
  });

  test('keep usedImports - multiple type imports being used', () => {
    const inputText = `
      import type { Type1, Type2 } from 'types';
      const x: Type1 = {};
      const y: Type2 = {};
    `;
    const result = removeUnusedImports(inputText);
    assert.strictEqual(result.newLines.trim(), inputText.trim());
    assert.strictEqual(result.unusedImportsPresents, false);
  });

  test('keep usedImports - mixed type and value imports being used', () => {
    const inputText = `
      import type { Type1 } from 'module';
      import { value1, type Type2 } from 'module';
      const x: Type1 = value1();
      const y: Type2 = {};
    `;
    const result = removeUnusedImports(inputText);
    assert.strictEqual(result.newLines.trim(), inputText.trim());
    assert.strictEqual(result.unusedImportsPresents, false);
  });

  test('keep usedImports - imports used in JSX/TSX', () => {
    const inputText = `
      import { Component } from 'framework';
      function App() {
        return <Component />;
      }
    `;
    const result = removeUnusedImports(inputText);
    assert.strictEqual(result.newLines.trim(), inputText.trim());
    assert.strictEqual(result.unusedImportsPresents, false);
  });

  test('keep usedImports - imports used in object destructuring', () => {
    const inputText = `
      import { something } from 'module';
      const { something: renamed } = someObject;
      something();
    `;
    const result = removeUnusedImports(inputText);
    assert.strictEqual(result.newLines.trim(), inputText.trim());
    assert.strictEqual(result.unusedImportsPresents, false);
  });

});
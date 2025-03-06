import { removeUnusedImports } from '../imports';
import * as assert from 'assert';

suite('Extension Test Suite for used imports', () => {
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
import { importRegexs } from "./constants";

export function removeUnusedImports(text: string): { newLines: string, unusedImportsPresents: boolean } {
    const lines = text.split('\n');
    let unusedImportsPresents = false;
    let isUsed = false;
  
    // First pass: collect imports and find identifiers used in the code
    const { usedIdentifiers, importStatements } = classifyLines(lines);
  
    // Second pass: filter unused imports
    importStatements.forEach(({ line, index }) => {
      const {
        defaultImportMatch,
        namedImportMatch,
        wildcardImportMatch,
        typeImportMatch,
        combinedImportMatch
      } = importMatches(line);
  
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
        const namedImport = namedImportAction(usedNamedImports, namedImports, line);
        isUsed = namedImport.isUsed;
        if(!unusedImportsPresents){
            unusedImportsPresents = namedImport.unusedImportsPresents;
        }
          lines[index] = namedImport.newLine;
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
        const combinedImport = combinedImportAction(namedImports, defaultImport, usedIdentifiers, line);
        isUsed = combinedImport.isUsed;
        unusedImportsPresents = combinedImport.unusedImportsPresents;
        if(combinedImport.newLine){
          lines[index] = combinedImport.newLine;
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
function classifyLines(lines: string[]) {
    const usedIdentifiers = new Set<string>();
    const importStatements: { line: string; index: number }[] = [];
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
    return { usedIdentifiers, importStatements };
}

function namedImportAction(usedNamedImports: string[], namedImports: string[], line: string) {
    let isUsed = false;
    let newLine = line;
    let unusedImportsPresents = false;
    if (usedNamedImports.length > 0 && usedNamedImports.length < namedImports.length) {
        isUsed = true;
        unusedImportsPresents = true;
        const updatedLine = `import { ${usedNamedImports.join(', ')} } from` + line.split('from')[1];
        newLine = updatedLine;
    }else if(usedNamedImports.length === namedImports.length){
        isUsed = true;
    }

    return { isUsed, newLine, unusedImportsPresents };
}

function combinedImportAction(namedImports: string[], defaultImport: string, usedIdentifiers: Set<string>, line: string) {
    const usedNamedImports = namedImports.filter((name) => usedIdentifiers.has(name));
    const isDefaultUsed = defaultImport && usedIdentifiers.has(defaultImport);
    let unusedImportsPresents = false;
    let isUsed = false;
    let newLine = null;
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
        newLine = updatedLine;
    }

    return { isUsed, unusedImportsPresents, newLine };
}

function importMatches(line: string){
    const { 
        DEFAULT_IMPORT,
        NAMED_IMPORT,
        WILD_CARD_IMPORT,
        TYPE_IMPORT,
        COMBINED_IMPORT
    } = importRegexs;
    const defaultImportMatch = line.match(DEFAULT_IMPORT);
    const namedImportMatch = line.match(NAMED_IMPORT);
    const wildcardImportMatch = line.match(WILD_CARD_IMPORT);
    const typeImportMatch = line.match(TYPE_IMPORT);
    const combinedImportMatch = line.match(COMBINED_IMPORT);

    return {
        defaultImportMatch,
        namedImportMatch,
        wildcardImportMatch,
        typeImportMatch,
        combinedImportMatch
    };
}
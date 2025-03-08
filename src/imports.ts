import { classifyLines, countLeadingSpaces, importMatches } from "./utils/imports";

export function removeUnusedImports(text: string): { newLines: string, unusedImportsPresents: boolean } {
    const lines = text.split('\n');
    let unusedImportsPresents = false;
    let linesRemoved = 0;
  
    // First pass: collect imports and find identifiers used in the code
    const { usedIdentifiers, importStatements } = classifyLines(lines);
  
    // Second pass: filter unused imports
    importStatements.forEach(({ line, index }) => {
      let isUsed = false;
      const {
        defaultImportMatch,
        namedImportMatch,
        wildcardImportMatch,
        typeImportMatch,
        combinedImportMatch
      } = importMatches(line.trim());
  
      if (defaultImportMatch) {
        const defaultImport = defaultImportMatch[1];
        if (usedIdentifiers.has(defaultImport)) {
          isUsed = true;
        }
      }
  
      else if (namedImportMatch) {
        const namedImports = namedImportMatch[1].split(',').map((name) => {
          const nameParts = name.trim().split(' ');
          if(nameParts[0] === 'type'){
            return nameParts[1];
          }
          return nameParts[0];
        });
        const usedNamedImports = namedImports.filter((name) => {
          return usedIdentifiers.has(name);
        });
        const namedImport = namedImportAction(usedNamedImports, namedImports, line);
        isUsed = namedImport.isUsed;
        if(!unusedImportsPresents){
            unusedImportsPresents = namedImport.unusedImportsPresents;
        }
          lines[index-linesRemoved] = namedImport.newLine;
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
        if(usedTypeImports.length !== 0){
          isUsed = true;
        }
        if (usedTypeImports.length > 0 && usedTypeImports.length < typeImports.length) {
          const blankSpacesCount = countLeadingSpaces(line);
          unusedImportsPresents = true;
          const updatedLine = `${' '.repeat(blankSpacesCount)}import type { ${usedTypeImports.join(', ')} } from` + line.split('from')[1];
          lines[index-linesRemoved] = updatedLine;
        }
        else {
          lines[index-linesRemoved] = line;
        }
      }
      else if (combinedImportMatch) {
        const defaultImport = combinedImportMatch[1];
        const namedImports = combinedImportMatch[2].split(',').map((name) => name.trim());
        const combinedImport = combinedImportAction(namedImports, defaultImport, usedIdentifiers, line);
        isUsed = combinedImport.isUsed;
        unusedImportsPresents = combinedImport.unusedImportsPresents;
        if(combinedImport.newLine){
          lines[index-linesRemoved] = combinedImport.newLine;
        }
        
      }
  
    
      if (!isUsed) {
        unusedImportsPresents = true;
        lines.splice(index-linesRemoved++, 1); // Remove unused import
      }
    });

    const newLines = lines.join('\n');
    return { newLines, unusedImportsPresents };
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

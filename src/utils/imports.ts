import { importRegexs } from "../constants";
export function importMatches(line: string){
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

export function classifyLines(lines: string[]) {
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
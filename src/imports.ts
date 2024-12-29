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
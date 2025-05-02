export const importRegexs = {
    DEFAULT_IMPORT: /^import\s+([a-zA-Z_$][a-zA-Z_$0-9]*)\s+from/,
    NAMED_IMPORT: /import\s+\{\s*([^}]+)\s*\}\s+from/,
    WILD_CARD_IMPORT: /^import\s+(?:type\s+)?\*\s+as\s+([a-zA-Z_$][a-zA-Z_$0-9]*)\s+from/,
    TYPE_IMPORT: /^import\s+type\s+\{\s*([^}]+)\s*\}\s+from/,
    COMBINED_IMPORT: /^import\s+([a-zA-Z_$][a-zA-Z_$0-9]*)?,?\s*\{\s*([^}]+)\s*\}\s+from/,
    VALID_IDENTIFIER: /(?:(["'])(?:\\.|(?!\1)[^\\])*\1)|\b[a-zA-Z_$][a-zA-Z_$0-9]*\b(?!\s*:)/g,
    COMMENT: /^\s*(\/\/|\/\*|\*\/|\*).*$|.*\/\/\s*$/gm
};
//? Clean and parse JSON strings safely by removing or escaping control characters
export function cleanAndParseJSON<T = any>(
    input: string,
    options: { escapeNewlines?: boolean } = {}
    ): T | null {
    try {
        // Replace control characters (U+0000 to U+001F), except newline/tab if escapeNewlines is true
        const controlCharRegex = options.escapeNewlines
        ? /[\x00-\x08\x0B\x0C\x0E-\x1F]/g // preserve \n (\x0A) and \t (\x09)
        : /[\x00-\x1F]/g;

        let cleaned = input.replace(controlCharRegex, '');

        if (options.escapeNewlines) {
        // Manually escape \n and \t for safe JSON parsing
        cleaned = cleaned
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r')
            .replace(/\t/g, '\\t');
        }

        return JSON.parse(cleaned);
    } catch (error) {
        console.error('Failed to parse JSON:', error);
        return null;
    }
}

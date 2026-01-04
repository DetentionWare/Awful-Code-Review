import { PatternDefinition, PatternMatch, PersonaType } from './types';
/**
 * Pattern definitions for detecting code constructs
 * Each pattern triggers specific personas that have opinions about it
 */
export declare const patterns: Record<string, PatternDefinition>;
export declare class PatternDetector {
    private patterns;
    constructor(customPatterns?: Record<string, PatternDefinition>);
    /**
     * Validate all pattern regexes at construction time.
     * Throws an error if any regex is invalid, making issues visible early.
     */
    private validatePatterns;
    /**
     * Get file extension from filename
     */
    private getExtension;
    /**
     * Check if a pattern applies to a file type
     */
    private patternMatchesFileType;
    /**
     * Detect all patterns in a line of code
     */
    detectInLine(line: string, lineNumber: number, filename: string): PatternMatch[];
    /**
     * Detect patterns in multiple lines
     */
    detectInLines(lines: string[], filename: string): Map<number, PatternMatch[]>;
    /**
     * Get all personas triggered by a set of matches
     */
    getTriggeredPersonas(matches: PatternMatch[]): PersonaType[];
    /**
     * Parse a unified diff and extract changed lines
     */
    parseDiff(patch: string): Array<{
        lineNumber: number;
        content: string;
        isAddition: boolean;
    }>;
}
export declare const defaultDetector: PatternDetector;

import { CommentRecord, ContradictionRule, PersonaType } from './types';
/**
 * Tags that can be applied to comments for contradiction tracking
 */
export type CommentTag = 'pro_abstraction' | 'anti_abstraction' | 'pro_documentation' | 'anti_documentation' | 'pro_performance' | 'anti_performance' | 'pro_testing' | 'anti_testing' | 'pro_types' | 'anti_types' | 'approving' | 'blocking' | 'nitpick' | 'critical' | 'pro_modern' | 'anti_modern' | 'pro_functional' | 'anti_functional' | 'requests_comments' | 'complains_obvious_comments' | 'suggests_change' | 'reports_bug' | 'security_concern' | 'dismissive' | 'vague_concern';
/**
 * Rules for generating contradictions
 */
export declare const contradictionRules: ContradictionRule[];
export declare class ContradictionEngine {
    private commentHistory;
    private rules;
    constructor(rules?: ContradictionRule[]);
    /**
     * Infer tags from a comment's content
     */
    inferTags(comment: string): CommentTag[];
    /**
     * Record a comment for future contradiction potential
     */
    recordComment(file: string, line: number, body: string, persona: PersonaType, explicitTags?: CommentTag[]): void;
    /**
     * Check if we should generate a contradictory comment
     */
    shouldContradict(): {
        should: boolean;
        basedOn: CommentRecord | null;
        contradictWith: string | null;
    };
    /**
     * Generate a contradictory comment based on history
     */
    generateContradiction(): {
        comment: string;
        referencedFile?: string;
        referencedLine?: number;
    } | null;
    /**
     * Clear history (for new PR reviews)
     */
    reset(): void;
    /**
     * Get all recorded comments
     */
    getHistory(): CommentRecord[];
    /**
     * Get tags that have been used
     */
    getUsedTags(): Set<CommentTag>;
}
export declare const defaultContradictionEngine: ContradictionEngine;

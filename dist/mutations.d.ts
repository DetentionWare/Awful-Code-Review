import { Mutation, MutationType } from './types';
/**
 * Mutations transform generated comments to make them worse in specific ways
 */
export declare const mutations: Record<MutationType, Mutation[]>;
/**
 * Severity labels that can be randomly misapplied
 */
export declare const severityLabels: {
    nitpick: string[];
    suggestion: string[];
    important: string[];
    blocker: string[];
};
export declare class MutationEngine {
    private enabledMutations;
    private mutationProbability;
    constructor(enabledMutations?: MutationType[], mutationProbability?: number);
    /**
     * Apply a random mutation to a comment
     */
    applyRandomMutation(comment: string): {
        comment: string;
        applied: Mutation | null;
    };
    /**
     * Apply multiple mutations to a comment
     */
    applyMutations(comment: string, maxMutations?: number): string;
    /**
     * Add a random severity label (possibly wrong)
     */
    addSeverityLabel(comment: string, actualSeverity: 'nitpick' | 'suggestion' | 'important' | 'blocker', mismatchProbability?: number): string;
    /**
     * Generate a contradictory follow-up comment
     */
    generateContradiction(originalComment: string): string | null;
}
export declare const defaultMutationEngine: MutationEngine;

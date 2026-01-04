import { ReviewComment, ComposedReview, ReviewAction, ChaosConfig, AnalyzedFile } from './types';
import { PatternDetector } from './detector';
import { MutationEngine } from './mutations';
import { ContradictionEngine } from './contradictions';
/**
 * Default configuration for chaos
 */
export declare const defaultConfig: ChaosConfig;
export declare class CommentGenerator {
    private config;
    private detector;
    private mutationEngine;
    private contradictionEngine;
    constructor(config?: Partial<ChaosConfig>, detector?: PatternDetector, mutationEngine?: MutationEngine, contradictionEngine?: ContradictionEngine);
    /**
     * Select a persona based on pattern matches
     */
    private selectPersona;
    /**
     * Generate a comment for a pattern match
     */
    private generateComment;
    /**
     * Maybe misdetect the framework
     */
    private maybeWrongFramework;
    /**
     * Select appropriate persona for a contradiction comment based on its content
     */
    private selectContradictionPersona;
    /**
     * Generate all comments for a file
     */
    generateCommentsForFile(file: AnalyzedFile): ReviewComment[];
    /**
     * Generate a review summary
     */
    generateSummary(action: ReviewAction, commentCount: number): string;
    /**
     * Decide on a review action
     */
    decideAction(comments: ReviewComment[]): ReviewAction;
    /**
     * Compose a full review from analyzed files
     */
    composeReview(files: AnalyzedFile[]): ComposedReview;
    /**
     * Reset state for new review
     */
    reset(): void;
}
export declare const defaultGenerator: CommentGenerator;

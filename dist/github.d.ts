import { ComposedReview, FileChange, AnalyzedFile } from './types';
import { PatternDetector } from './detector';
export interface GitHubContext {
    owner: string;
    repo: string;
    pullNumber: number;
    headSha: string;
}
export declare class GitHubClient {
    private octokit;
    private context;
    private detector;
    constructor(token: string, context: GitHubContext, detector?: PatternDetector);
    /**
     * Fetch files changed in the PR
     */
    getChangedFiles(): Promise<FileChange[]>;
    /**
     * Analyze files and extract pattern matches
     */
    analyzeFiles(files: FileChange[]): AnalyzedFile[];
    /**
     * Submit a review with comments
     */
    submitReview(review: ComposedReview): Promise<void>;
    /**
     * Get PR details
     */
    getPRDetails(): Promise<{
        title: string;
        body: string;
        author: string;
        branch: string;
        baseBranch: string;
    }>;
    /**
     * Add a single comment to a specific line
     */
    addLineComment(path: string, line: number, body: string): Promise<void>;
    /**
     * Reply to an existing comment (for contradictions)
     */
    replyToComment(commentId: number, body: string): Promise<void>;
    /**
     * Get existing review comments
     */
    getExistingComments(): Promise<Array<{
        id: number;
        path: string;
        line: number;
        body: string;
    }>>;
}
/**
 * Parse GitHub event context from environment
 */
export declare function parseGitHubContext(): GitHubContext | null;
/**
 * Dry-run output for testing
 */
export declare function formatDryRunOutput(review: ComposedReview): string;

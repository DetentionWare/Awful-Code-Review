"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubClient = void 0;
exports.parseGitHubContext = parseGitHubContext;
exports.formatDryRunOutput = formatDryRunOutput;
const rest_1 = require("@octokit/rest");
const detector_1 = require("./detector");
class GitHubClient {
    constructor(token, context, detector) {
        this.octokit = new rest_1.Octokit({ auth: token });
        this.context = context;
        this.detector = detector ?? detector_1.defaultDetector;
    }
    /**
     * Fetch files changed in the PR
     */
    async getChangedFiles() {
        const { owner, repo, pullNumber } = this.context;
        const response = await this.octokit.pulls.listFiles({
            owner,
            repo,
            pull_number: pullNumber,
            per_page: 100,
        });
        return response.data.map(file => ({
            filename: file.filename,
            patch: file.patch || '',
            additions: file.additions,
            deletions: file.deletions,
            status: file.status,
        }));
    }
    /**
     * Analyze files and extract pattern matches
     */
    analyzeFiles(files) {
        return files.map(file => {
            const extension = file.filename.split('.').pop()?.toLowerCase() || '';
            // Parse the diff to get changed lines
            const changes = this.detector.parseDiff(file.patch);
            // Analyze each line for patterns
            const lines = changes.map(change => ({
                lineNumber: change.lineNumber,
                content: change.content,
                isAddition: change.isAddition,
                patterns: this.detector.detectInLine(change.content, change.lineNumber, file.filename),
            }));
            return {
                filename: file.filename,
                extension,
                lines,
            };
        });
    }
    /**
     * Submit a review with comments
     */
    async submitReview(review) {
        const { owner, repo, pullNumber, headSha } = this.context;
        // Convert our comments to GitHub's format
        const githubComments = review.comments.map(comment => ({
            path: comment.path,
            line: comment.line,
            body: comment.body,
            side: 'RIGHT',
        }));
        // Map our action to GitHub's event
        const eventMap = {
            'APPROVE': 'APPROVE',
            'REQUEST_CHANGES': 'REQUEST_CHANGES',
            'COMMENT': 'COMMENT',
        };
        await this.octokit.pulls.createReview({
            owner,
            repo,
            pull_number: pullNumber,
            commit_id: headSha,
            body: review.summary,
            event: eventMap[review.action],
            comments: githubComments,
        });
    }
    /**
     * Get PR details
     */
    async getPRDetails() {
        const { owner, repo, pullNumber } = this.context;
        const response = await this.octokit.pulls.get({
            owner,
            repo,
            pull_number: pullNumber,
        });
        return {
            title: response.data.title,
            body: response.data.body || '',
            author: response.data.user?.login || 'unknown',
            branch: response.data.head.ref,
            baseBranch: response.data.base.ref,
        };
    }
    /**
     * Add a single comment to a specific line
     */
    async addLineComment(path, line, body) {
        const { owner, repo, pullNumber, headSha } = this.context;
        await this.octokit.pulls.createReviewComment({
            owner,
            repo,
            pull_number: pullNumber,
            commit_id: headSha,
            path,
            line,
            body,
            side: 'RIGHT',
        });
    }
    /**
     * Reply to an existing comment (for contradictions)
     */
    async replyToComment(commentId, body) {
        const { owner, repo, pullNumber } = this.context;
        await this.octokit.pulls.createReplyForReviewComment({
            owner,
            repo,
            pull_number: pullNumber,
            comment_id: commentId,
            body,
        });
    }
    /**
     * Get existing review comments
     */
    async getExistingComments() {
        const { owner, repo, pullNumber } = this.context;
        const response = await this.octokit.pulls.listReviewComments({
            owner,
            repo,
            pull_number: pullNumber,
        });
        return response.data.map(comment => ({
            id: comment.id,
            path: comment.path,
            line: comment.line || comment.original_line || 0,
            body: comment.body,
        }));
    }
}
exports.GitHubClient = GitHubClient;
/**
 * Parse GitHub event context from environment
 */
function parseGitHubContext() {
    const eventPath = process.env.GITHUB_EVENT_PATH;
    if (!eventPath) {
        return null;
    }
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const event = require(eventPath);
        const [owner, repo] = (process.env.GITHUB_REPOSITORY || '').split('/');
        return {
            owner,
            repo,
            pullNumber: event.pull_request?.number || event.number,
            headSha: event.pull_request?.head?.sha || event.after,
        };
    }
    catch {
        return null;
    }
}
/**
 * Dry-run output for testing
 */
function formatDryRunOutput(review) {
    const lines = [];
    lines.push('='.repeat(60));
    lines.push('AWFUL CODE REVIEW - DRY RUN OUTPUT');
    lines.push('='.repeat(60));
    lines.push('');
    lines.push(`Action: ${review.action}`);
    lines.push(`Summary: ${review.summary}`);
    lines.push(`Total Comments: ${review.comments.length}`);
    lines.push(`Contradictions: ${review.contradictionCount}`);
    lines.push('');
    lines.push('-'.repeat(60));
    lines.push('COMMENTS:');
    lines.push('-'.repeat(60));
    for (const comment of review.comments) {
        lines.push('');
        lines.push(`📁 ${comment.path}:${comment.line}`);
        lines.push(`👤 Persona: ${comment.persona}`);
        lines.push(`💬 ${comment.body}`);
    }
    lines.push('');
    lines.push('='.repeat(60));
    return lines.join('\n');
}
//# sourceMappingURL=github.js.map
import { Octokit } from '@octokit/rest';
import { ReviewComment, ComposedReview, ReviewAction, FileChange, AnalyzedFile, AnalyzedLine } from './types';
import { PatternDetector, defaultDetector } from './detector';

export interface GitHubContext {
  owner: string;
  repo: string;
  pullNumber: number;
  headSha: string;
}

export class GitHubClient {
  private octokit: Octokit;
  private context: GitHubContext;
  private detector: PatternDetector;

  constructor(token: string, context: GitHubContext, detector?: PatternDetector) {
    this.octokit = new Octokit({ auth: token });
    this.context = context;
    this.detector = detector ?? defaultDetector;
  }

  /**
   * Fetch files changed in the PR
   */
  async getChangedFiles(): Promise<FileChange[]> {
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
      status: file.status as FileChange['status'],
    }));
  }

  /**
   * Analyze files and extract pattern matches
   */
  analyzeFiles(files: FileChange[]): AnalyzedFile[] {
    return files.map(file => {
      const extension = file.filename.split('.').pop()?.toLowerCase() || '';

      // Parse the diff to get changed lines
      const changes = this.detector.parseDiff(file.patch);

      // Analyze each line for patterns
      const lines: AnalyzedLine[] = changes.map(change => ({
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
  async submitReview(review: ComposedReview): Promise<void> {
    const { owner, repo, pullNumber, headSha } = this.context;

    // Convert our comments to GitHub's format
    const githubComments = review.comments.map(comment => ({
      path: comment.path,
      line: comment.line,
      body: comment.body,
      side: 'RIGHT' as const,
    }));

    // Map our action to GitHub's event
    const eventMap: Record<ReviewAction, 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT'> = {
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
  async getPRDetails(): Promise<{
    title: string;
    body: string;
    author: string;
    branch: string;
    baseBranch: string;
  }> {
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
  async addLineComment(path: string, line: number, body: string): Promise<void> {
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
  async replyToComment(commentId: number, body: string): Promise<void> {
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
  async getExistingComments(): Promise<Array<{
    id: number;
    path: string;
    line: number;
    body: string;
  }>> {
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

/**
 * Parse GitHub event context from environment
 */
export function parseGitHubContext(): GitHubContext | null {
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
  } catch {
    return null;
  }
}

/**
 * Dry-run output for testing
 */
export function formatDryRunOutput(review: ComposedReview): string {
  const lines: string[] = [];

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

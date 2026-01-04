import * as core from '@actions/core';
import * as github from '@actions/github';
import { GitHubClient, parseGitHubContext, formatDryRunOutput } from './github';
import { CommentGenerator, defaultConfig } from './generator';
import { PatternDetector } from './detector';
import { ChaosConfig, PersonaType } from './types';

async function run(): Promise<void> {
  try {
    // Get inputs
    const token = core.getInput('github-token', { required: true });
    const chaosLevel = parseFloat(core.getInput('chaos-level') || '0.7');
    const dryRun = core.getInput('dry-run') === 'true';
    const personasInput = core.getInput('personas');
    const maxComments = parseInt(core.getInput('max-comments') || '15', 10);
    const helpfulRate = parseFloat(core.getInput('helpful-accident-rate') || '0.3');

    // Parse personas if provided
    let enabledPersonas: PersonaType[] | undefined;
    if (personasInput) {
      enabledPersonas = personasInput.split(',').map(p => p.trim()) as PersonaType[];
    }

    // Build configuration
    const config: Partial<ChaosConfig> = {
      chaosLevel,
      maxCommentsTotal: maxComments,
      helpfulAccidentRate: helpfulRate,
    };

    if (enabledPersonas) {
      config.enabledPersonas = enabledPersonas;
    }

    // Get GitHub context
    const context = github.context;
    const pullNumber = context.payload.pull_request?.number;

    if (!pullNumber) {
      core.setFailed('This action only works on pull request events');
      return;
    }

    const ghContext = {
      owner: context.repo.owner,
      repo: context.repo.repo,
      pullNumber,
      headSha: context.payload.pull_request?.head?.sha || '',
    };

    core.info(`🎭 Awful Code Review activated for PR #${pullNumber}`);
    core.info(`Chaos level: ${chaosLevel}`);
    core.info(`Dry run: ${dryRun}`);

    // Initialize clients
    const ghClient = new GitHubClient(token, ghContext);
    const generator = new CommentGenerator(config);
    const detector = new PatternDetector();

    // Fetch and analyze changed files
    core.info('Fetching changed files...');
    const files = await ghClient.getChangedFiles();
    core.info(`Found ${files.length} changed files`);

    // Analyze files for patterns
    core.info('Analyzing code for terrible review opportunities...');
    const analyzedFiles = ghClient.analyzeFiles(files);

    // Generate the terrible review
    core.info('Generating maximally unhelpful feedback...');
    const review = generator.composeReview(analyzedFiles);

    // Output results
    core.info(`Generated ${review.comments.length} terrible comments`);
    core.info(`Review action: ${review.action}`);
    core.info(`Contradictions: ${review.contradictionCount}`);

    if (dryRun) {
      // Just output what we would do
      const output = formatDryRunOutput(review);
      core.info(output);
      core.setOutput('review-action', review.action);
      core.setOutput('comment-count', review.comments.length);
      core.setOutput('dry-run-output', output);
    } else {
      // Actually submit the review
      core.info('Submitting review...');
      await ghClient.submitReview(review);
      core.info('✅ Awful review submitted successfully!');
      core.setOutput('review-action', review.action);
      core.setOutput('comment-count', review.comments.length);
    }

  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(`Awful Code Review failed (ironically): ${error.message}`);
    } else {
      core.setFailed('An unexpected error occurred');
    }
  }
}

run();

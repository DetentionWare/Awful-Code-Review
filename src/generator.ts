import {
  PersonaType,
  PatternMatch,
  ReviewComment,
  ComposedReview,
  ReviewAction,
  ChaosConfig,
  AnalyzedFile,
} from './types';
import { personas, getPersona, getRandomPersona } from './personas/definitions';
import { PatternDetector, defaultDetector } from './detector';
import { MutationEngine, defaultMutationEngine } from './mutations';
import { ContradictionEngine, defaultContradictionEngine } from './contradictions';

/**
 * Default configuration for chaos
 */
export const defaultConfig: ChaosConfig = {
  chaosLevel: 0.7,
  helpfulAccidentRate: 0.3,
  approvalMismatchProbability: 0.4,
  contradictionEnabled: true,
  maxCommentsPerFile: 5,
  maxCommentsTotal: 15,
  enabledPersonas: Object.keys(personas) as PersonaType[],
  severityRandomization: {
    criticalShownAsNitpick: 0.2,
    nitpickShownAsBlocker: 0.3,
  },
  wrongFrameworkDetection: {
    enabled: true,
    probability: 0.15,
  },
  severityLabelProbability: 0.3,
  enthusiasticSummaryProbability: 0.5,
  requestChangesThreshold: 0.6,
};

/**
 * Framework misdetection mappings
 */
const frameworkMisdetections: Record<string, string[]> = {
  jsx: ['Angular', 'Vue', 'Svelte'],
  tsx: ['Angular', 'Vue', 'Svelte'],
  vue: ['React', 'Angular'],
  svelte: ['React', 'Vue'],
  py: ['Python 2', 'Ruby'],
  js: ['TypeScript', 'CoffeeScript'],
  css: ['SASS', 'Less'],
  scss: ['CSS', 'Less'],
};

/**
 * Helpful-but-unhinged suggestions (the 30% good ones)
 */
const helpfulAccidents = [
  "While you're updating this button color, have you considered implementing a full design system?",
  "This would be a great place to add GraphQL.",
  "Have you considered WebAssembly for this?",
  "This could benefit from a message queue architecture.",
  "What if we added real-time collaboration to this feature?",
  "Have you looked into event sourcing for this state management?",
  "This would be a good candidate for a feature flag system.",
  "Consider adding OpenTelemetry instrumentation here.",
  "This could use a circuit breaker pattern.",
  "What's our observability story for this component?",
  "Have you considered adding AI-powered error recovery?",
  "This might be a good time to set up A/B testing infrastructure.",
  "What if we added end-to-end encryption?",
  "Consider implementing optimistic updates for better UX.",
  "This would benefit from a proper caching layer. Redis?",
];

/**
 * Review summary templates
 */
const reviewSummaries = {
  enthusiastic: [
    "LGTM! 🚀",
    "Ship it! 🎉",
    "Great work! 👏",
    "Love the direction here!",
    "This is exactly what we needed!",
  ],
  passive_aggressive: [
    "Some concerns.",
    "A few thoughts.",
    "See comments.",
    "Let's discuss.",
    "Interesting approach.",
  ],
  contradictory: [
    "Approving but I have reservations.",
    "LGTM with blocking comments.",
    "I trust you know what you're doing. (I don't.)",
    "Approved pending discussion about everything.",
    "No major issues (see 12 comments below).",
  ],
  deflecting: [
    "Let's take this offline.",
    "Can we sync on this?",
    "I'd like to loop in the team.",
    "Let's discuss in standup.",
    "Parking this for now.",
  ],
};

export class CommentGenerator {
  private config: ChaosConfig;
  private detector: PatternDetector;
  private mutationEngine: MutationEngine;
  private contradictionEngine: ContradictionEngine;

  constructor(
    config: Partial<ChaosConfig> = {},
    detector: PatternDetector = defaultDetector,
    mutationEngine: MutationEngine = defaultMutationEngine,
    contradictionEngine: ContradictionEngine = defaultContradictionEngine
  ) {
    this.config = { ...defaultConfig, ...config };
    this.detector = detector;
    this.mutationEngine = mutationEngine;
    this.contradictionEngine = contradictionEngine;
  }

  /**
   * Select a persona based on pattern matches
   */
  private selectPersona(matches: PatternMatch[]): PersonaType {
    // Collect all triggered personas
    const triggered = matches.flatMap(m => m.triggersPersonas);

    // Filter to enabled personas
    const enabled = triggered.filter(p => this.config.enabledPersonas.includes(p));

    if (enabled.length === 0) {
      // Pick a random enabled persona
      return this.config.enabledPersonas[
        Math.floor(Math.random() * this.config.enabledPersonas.length)
      ];
    }

    // Pick randomly from triggered personas
    return enabled[Math.floor(Math.random() * enabled.length)];
  }

  /**
   * Generate a comment for a pattern match
   */
  private generateComment(
    file: string,
    line: number,
    matches: PatternMatch[]
  ): ReviewComment | null {
    // Skip based on chaos level
    if (Math.random() > this.config.chaosLevel) {
      return null;
    }

    // Chance of helpful accident
    if (Math.random() < this.config.helpfulAccidentRate) {
      const helpful = helpfulAccidents[Math.floor(Math.random() * helpfulAccidents.length)];
      return {
        path: file,
        line,
        body: helpful,
        persona: 'scope_creep_sage',
        tags: ['scope_creep'],
      };
    }

    const personaType = this.selectPersona(matches);
    const persona = getPersona(personaType);

    if (!persona) {
      return null;
    }

    // Find a response template
    let response: string | null = null;

    // Try pattern-specific responses first
    for (const match of matches) {
      if (persona.responses[match.pattern]) {
        const options = persona.responses[match.pattern];
        response = options[Math.floor(Math.random() * options.length)];
        break;
      }
    }

    // Fall back to generic responses
    if (!response) {
      if (persona.responses.any) {
        response = persona.responses.any[Math.floor(Math.random() * persona.responses.any.length)];
      } else if (persona.genericResponses.length > 0) {
        response = persona.genericResponses[Math.floor(Math.random() * persona.genericResponses.length)];
      }
    }

    if (!response) {
      return null;
    }

    // Maybe add an opening phrase
    if (Math.random() < persona.confidence && persona.openingPhrases.length > 0) {
      const opening = persona.openingPhrases[
        Math.floor(Math.random() * persona.openingPhrases.length)
      ];
      response = `${opening} ${response}`;
    }

    // Apply mutations
    response = this.mutationEngine.applyMutations(response);

    // Maybe add severity label
    if (Math.random() < this.config.severityLabelProbability) {
      const actualSeverity = Math.random() < 0.5 ? 'nitpick' : 'suggestion';
      response = this.mutationEngine.addSeverityLabel(
        response,
        actualSeverity,
        this.config.severityRandomization.nitpickShownAsBlocker
      );
    }

    const comment: ReviewComment = {
      path: file,
      line,
      body: response,
      persona: personaType,
      tags: [],
    };

    // Record for contradiction tracking
    this.contradictionEngine.recordComment(file, line, response, personaType);

    return comment;
  }

  /**
   * Maybe misdetect the framework
   */
  private maybeWrongFramework(extension: string): string | null {
    if (!this.config.wrongFrameworkDetection.enabled) {
      return null;
    }

    if (Math.random() > this.config.wrongFrameworkDetection.probability) {
      return null;
    }

    const options = frameworkMisdetections[extension];
    if (!options || options.length === 0) {
      return null;
    }

    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Select appropriate persona for a contradiction comment based on its content
   */
  private selectContradictionPersona(commentBody: string): PersonaType {
    const lower = commentBody.toLowerCase();

    const dismissivePatterns = [
      'reproduce', 'works', 'environment', 'cache',
      'version', 'configuration', 'your end'
    ];
    const vaguePatterns = [
      'feels', 'concerns', 'something about', 'not sure', 'uncomfortable'
    ];

    if (dismissivePatterns.some(p => lower.includes(p))) {
      return 'works_on_my_machine';
    }
    if (vaguePatterns.some(p => lower.includes(p))) {
      return 'vague_senior';
    }
    return 'chaotic_neutral';
  }

  /**
   * Generate all comments for a file
   */
  generateCommentsForFile(file: AnalyzedFile): ReviewComment[] {
    const comments: ReviewComment[] = [];
    const linesWithPatterns: Array<{ line: number; matches: PatternMatch[] }> = [];

    // Collect all lines with pattern matches
    for (const line of file.lines) {
      if (line.patterns.length > 0 && line.isAddition) {
        linesWithPatterns.push({
          line: line.lineNumber,
          matches: line.patterns,
        });
      }
    }

    // Maybe add a framework misdetection comment at the top
    const wrongFramework = this.maybeWrongFramework(file.extension);
    if (wrongFramework) {
      comments.push({
        path: file.filename,
        line: 1,
        body: `Is this ${wrongFramework}? The patterns look like ${wrongFramework} to me. Consider following ${wrongFramework} best practices.`,
        persona: 'time_traveler',
        tags: ['framework_confusion'],
      });
    }

    // Generate comments for selected lines
    const shuffled = [...linesWithPatterns].sort(() => Math.random() - 0.5);
    const toComment = shuffled.slice(0, this.config.maxCommentsPerFile);

    for (const { line, matches } of toComment) {
      const comment = this.generateComment(file.filename, line, matches);
      if (comment) {
        comments.push(comment);
      }
    }

    // Maybe add a contradiction
    if (this.config.contradictionEnabled && comments.length > 0) {
      const contradiction = this.contradictionEngine.generateContradiction();
      if (contradiction) {
        const targetComment = comments[Math.floor(Math.random() * comments.length)];

        comments.push({
          path: targetComment.path,
          line: targetComment.line,
          body: contradiction.comment,
          persona: this.selectContradictionPersona(contradiction.comment),
          tags: ['contradiction'],
        });
      }
    }

    return comments;
  }

  /**
   * Generate a review summary
   */
  generateSummary(action: ReviewAction, commentCount: number): string {
    // Pick a style based on the action
    let style: keyof typeof reviewSummaries;

    if (action === 'APPROVE') {
      // Configurable chance of contradictory summary when approving
      style = Math.random() < this.config.enthusiasticSummaryProbability ? 'enthusiastic' : 'contradictory';
    } else if (action === 'REQUEST_CHANGES') {
      style = Math.random() < 0.5 ? 'passive_aggressive' : 'deflecting';
    } else {
      style = ['passive_aggressive', 'deflecting', 'contradictory'][
        Math.floor(Math.random() * 3)
      ] as keyof typeof reviewSummaries;
    }

    const options = reviewSummaries[style];
    let summary = options[Math.floor(Math.random() * options.length)];

    // Maybe add a contradictory note
    if (action === 'APPROVE' && commentCount > 3 && Math.random() < 0.3) {
      summary += `\n\n(${commentCount} comments attached, mostly nitpicks. Or are they?)`;
    }

    return summary;
  }

  /**
   * Decide on a review action
   */
  decideAction(comments: ReviewComment[]): ReviewAction {
    const hasBlockers = comments.some(c => c.tags.includes('blocker'));
    const commentCount = comments.length;

    // Base decision
    let action: ReviewAction;
    if (commentCount === 0) {
      action = 'APPROVE';
    } else if (hasBlockers) {
      action = 'REQUEST_CHANGES';
    } else if (commentCount > 5) {
      action = Math.random() < this.config.requestChangesThreshold ? 'REQUEST_CHANGES' : 'COMMENT';
    } else {
      action = Math.random() < 0.5 ? 'APPROVE' : 'COMMENT';
    }

    // Apply approval mismatch chaos
    if (Math.random() < this.config.approvalMismatchProbability) {
      const actions: ReviewAction[] = ['APPROVE', 'REQUEST_CHANGES', 'COMMENT'];
      action = actions[Math.floor(Math.random() * actions.length)];
    }

    return action;
  }

  /**
   * Compose a full review from analyzed files
   */
  composeReview(files: AnalyzedFile[]): ComposedReview {
    this.contradictionEngine.reset();
    const allComments: ReviewComment[] = [];

    for (const file of files) {
      const fileComments = this.generateCommentsForFile(file);
      allComments.push(...fileComments);

      // Respect max total comments
      if (allComments.length >= this.config.maxCommentsTotal) {
        break;
      }
    }

    // Trim to max
    const finalComments = allComments.slice(0, this.config.maxCommentsTotal);

    const action = this.decideAction(finalComments);
    const summary = this.generateSummary(action, finalComments.length);

    // Count actual contradictions
    const contradictionCount = finalComments.filter(c => c.tags.includes('contradiction')).length;

    return {
      action,
      summary,
      comments: finalComments,
      contradictionCount,
    };
  }

  /**
   * Reset state for new review
   */
  reset(): void {
    this.contradictionEngine.reset();
  }
}

export const defaultGenerator = new CommentGenerator();

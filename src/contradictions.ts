import { CommentRecord, ContradictionRule, PersonaType } from './types';

/**
 * Tags that can be applied to comments for contradiction tracking
 */
export type CommentTag =
  | 'pro_abstraction'
  | 'anti_abstraction'
  | 'pro_documentation'
  | 'anti_documentation'
  | 'pro_performance'
  | 'anti_performance'
  | 'pro_testing'
  | 'anti_testing'
  | 'pro_types'
  | 'anti_types'
  | 'approving'
  | 'blocking'
  | 'nitpick'
  | 'critical'
  | 'pro_modern'
  | 'anti_modern'
  | 'pro_functional'
  | 'anti_functional'
  | 'requests_comments'
  | 'complains_obvious_comments'
  | 'suggests_change'
  | 'reports_bug'
  | 'security_concern'
  | 'dismissive'
  | 'vague_concern';

/**
 * Keywords that help categorize comments
 */
const tagKeywords: Record<CommentTag, string[]> = {
  pro_abstraction: ['interface', 'abstract', 'factory', 'extensible', 'decouple', 'layer', 'pattern'],
  anti_abstraction: ['over-engineer', 'too complex', 'overkill', 'simple', 'YAGNI', 'premature'],
  pro_documentation: ['document', 'comment', 'jsdoc', 'explain', 'readme', 'clarity'],
  anti_documentation: ['obvious', 'self-documenting', 'redundant comment', 'unnecessary comment'],
  pro_performance: ['performance', 'optimize', 'fast', 'efficient', 'cache', 'overhead'],
  anti_performance: ['premature optimization', 'readable', 'maintainable'],
  pro_testing: ['test', 'coverage', 'spec', 'unit test', 'integration'],
  anti_testing: ["don't need tests", 'overtested', 'manual testing'],
  pro_types: ['type', 'interface', 'typescript', 'type safety'],
  anti_types: ['any', 'type annotations', 'typescript is overkill'],
  approving: ['LGTM', 'looks good', 'approve', 'ship it', '👍'],
  blocking: ['blocker', 'block', 'cannot merge', 'must fix', 'critical'],
  nitpick: ['nit', 'minor', 'small thing', 'style'],
  critical: ['critical', 'important', 'must', 'blocker', 'security', 'vulnerability', 'bug', 'broken'],
  pro_modern: ['modern', 'latest', 'new', 'cutting edge', 'ES6+', 'async/await'],
  anti_modern: ['legacy', 'proven', 'stable', 'traditional', 'IE11'],
  pro_functional: ['functional', 'immutable', 'pure', 'map/filter/reduce'],
  anti_functional: ['imperative', 'readable', 'loop', 'straightforward'],
  requests_comments: ['add comment', 'needs documentation', 'what does this do'],
  complains_obvious_comments: ['obvious comment', 'self-explanatory', 'comment is redundant'],
  suggests_change: ['should', 'consider', 'change', 'fix', 'update', 'refactor', 'rewrite', 'use instead'],
  reports_bug: ['bug', 'broken', 'fails', 'error', 'crash', 'undefined', 'null', 'issue', 'problem'],
  security_concern: ['security', 'vulnerability', 'attack', 'injection', 'xss', 'sanitize', 'threat'],
  dismissive: ['works for me', 'can\'t reproduce', 'not a bug', 'as designed', 'won\'t fix'],
  vague_concern: ['feels wrong', 'concerns me', 'not sure', 'something about this', 'bothers me'],
};

/**
 * Rules for generating contradictions
 */
export const contradictionRules: ContradictionRule[] = [
  { ifPrevious: 'pro_abstraction', then: 'anti_abstraction', probability: 0.4 },
  { ifPrevious: 'anti_abstraction', then: 'pro_abstraction', probability: 0.4 },
  { ifPrevious: 'requests_comments', then: 'complains_obvious_comments', probability: 0.5 },
  { ifPrevious: 'approving', then: 'blocking', probability: 0.6 }, // Classic LGTM + blockers
  { ifPrevious: 'pro_modern', then: 'anti_modern', probability: 0.35 },
  { ifPrevious: 'pro_functional', then: 'anti_functional', probability: 0.35 },
  { ifPrevious: 'nitpick', then: 'critical', probability: 0.4 },
  { ifPrevious: 'pro_performance', then: 'anti_performance', probability: 0.35 },
  { ifPrevious: 'pro_types', then: 'anti_types', probability: 0.3 },
  { ifPrevious: 'pro_testing', then: 'anti_testing', probability: 0.3 },
  // New: dismissive responses to bug reports and suggested changes
  { ifPrevious: 'reports_bug', then: 'dismissive', probability: 0.45 },
  { ifPrevious: 'security_concern', then: 'dismissive', probability: 0.35 },
  { ifPrevious: 'suggests_change', then: 'dismissive', probability: 0.3 },
  { ifPrevious: 'critical', then: 'dismissive', probability: 0.4 },
  // Vague senior responds to specific technical concerns
  { ifPrevious: 'pro_performance', then: 'vague_concern', probability: 0.25 },
  { ifPrevious: 'pro_abstraction', then: 'vague_concern', probability: 0.25 },
];

/**
 * Contradictory comment templates
 */
const contradictionTemplates: Record<string, string[]> = {
  anti_abstraction: [
    "This is over-engineered. KISS principle.",
    "We don't need this level of abstraction.",
    "YAGNI - we're never going to need this flexibility.",
    "Too many layers here. Just inline it.",
  ],
  pro_abstraction: [
    "This isn't extensible enough. What if requirements change?",
    "Consider extracting an interface here.",
    "This is too tightly coupled.",
    "We should add a layer of indirection.",
  ],
  complains_obvious_comments: [
    "This comment just restates the code. Remove it.",
    "The code is self-documenting. Comments are noise here.",
    "Don't comment what, comment why. Better yet, delete this.",
  ],
  blocking: [
    "Actually, this is a blocker for me.",
    "I can't approve this in its current state.",
    "This needs to be addressed before merge.",
  ],
  anti_modern: [
    "Do we need such a cutting-edge approach? The old way worked.",
    "This syntax isn't supported everywhere.",
    "Consider a more traditional approach.",
  ],
  anti_functional: [
    "This is unreadable. Just use a for loop.",
    "The imperative version was clearer.",
    "Not everything needs to be functional.",
  ],
  critical: [
    "Actually, this is more important than I initially indicated.",
    "On reflection, this is a critical issue.",
    "This should block the PR.",
  ],
  anti_performance: [
    "This optimization is premature. Readability matters more.",
    "Have we actually profiled this? Don't optimize without data.",
    "Clever code is harder to maintain.",
  ],
  anti_types: [
    "These type annotations are just noise.",
    "Just use `any` here, we're moving fast.",
    "TypeScript is slowing us down.",
  ],
  anti_testing: [
    "Do we really need tests for this? It's pretty straightforward.",
    "This seems over-tested.",
    "Manual testing should be sufficient here.",
  ],
  dismissive: [
    "Works on my machine.",
    "Can't reproduce.",
    "Have you tried clearing your cache?",
    "What version of Node are you on?",
    "This works fine in Chrome.",
    "I tested this locally, it's fine.",
    "Are you sure you pulled the latest?",
    "Did you restart the server?",
    "That's an edge case we don't need to handle.",
    "This is by design.",
    "Not a bug, working as intended.",
    "Have you tried turning it off and on again?",
    "This is a user error.",
    "Can you provide more details? I can't help with this.",
    "I don't see how this is possible.",
    "Must be a configuration issue on your end.",
    "This has never been reported before.",
    "I've never seen this happen in production.",
    "Sounds like a you problem.",
    "Have you checked your environment variables?",
  ],
  vague_concern: [
    "Something about this feels off.",
    "I have concerns about the maintainability here.",
    "This doesn't feel right to me.",
    "I'm not sure about this approach.",
    "There's something bothering me about this, but I can't put my finger on it.",
    "This could be better.",
    "Not sure this is the right direction.",
    "I have reservations.",
    "Let me think about this more.",
    "This makes me uncomfortable.",
    "I don't love this.",
    "Something something separation of concerns.",
    "What about the architecture?",
    "This feels like it could cause problems later.",
    "I'm sensing some code smell here.",
  ],
};

export class ContradictionEngine {
  private commentHistory: CommentRecord[] = [];
  private rules: ContradictionRule[];

  constructor(rules: ContradictionRule[] = contradictionRules) {
    this.rules = rules;
  }

  /**
   * Infer tags from a comment's content
   */
  inferTags(comment: string): CommentTag[] {
    const tags: CommentTag[] = [];
    const lowerComment = comment.toLowerCase();

    for (const [tag, keywords] of Object.entries(tagKeywords)) {
      for (const keyword of keywords) {
        if (lowerComment.includes(keyword.toLowerCase())) {
          tags.push(tag as CommentTag);
          break;
        }
      }
    }

    return tags;
  }

  /**
   * Record a comment for future contradiction potential
   */
  recordComment(
    file: string,
    line: number,
    body: string,
    persona: PersonaType,
    explicitTags?: CommentTag[]
  ): void {
    const inferredTags = this.inferTags(body);
    const tags = [...inferredTags, ...(explicitTags || [])];

    this.commentHistory.push({
      file,
      line,
      body,
      tags,
      persona,
    });
  }

  /**
   * Check if we should generate a contradictory comment
   */
  shouldContradict(): { should: boolean; basedOn: CommentRecord | null; contradictWith: string | null } {
    if (this.commentHistory.length === 0) {
      return { should: false, basedOn: null, contradictWith: null };
    }

    // Look through history for contradiction opportunities
    for (const record of this.commentHistory) {
      for (const tag of record.tags) {
        const matchingRule = this.rules.find(r => r.ifPrevious === tag);
        if (matchingRule && Math.random() < matchingRule.probability) {
          return {
            should: true,
            basedOn: record,
            contradictWith: matchingRule.then,
          };
        }
      }
    }

    return { should: false, basedOn: null, contradictWith: null };
  }

  /**
   * Generate a contradictory comment based on history
   */
  generateContradiction(): { comment: string; referencedFile?: string; referencedLine?: number } | null {
    const { should, basedOn, contradictWith } = this.shouldContradict();

    if (!should || !contradictWith || !basedOn) {
      return null;
    }

    const templates = contradictionTemplates[contradictWith];
    if (!templates || templates.length === 0) {
      return null;
    }

    const comment = templates[Math.floor(Math.random() * templates.length)];

    return {
      comment,
      referencedFile: basedOn.file,
      referencedLine: basedOn.line,
    };
  }

  /**
   * Clear history (for new PR reviews)
   */
  reset(): void {
    this.commentHistory = [];
  }

  /**
   * Get all recorded comments
   */
  getHistory(): CommentRecord[] {
    return [...this.commentHistory];
  }

  /**
   * Get tags that have been used
   */
  getUsedTags(): Set<CommentTag> {
    const tags = new Set<CommentTag>();
    for (const record of this.commentHistory) {
      record.tags.forEach(t => tags.add(t as CommentTag));
    }
    return tags;
  }
}

export const defaultContradictionEngine = new ContradictionEngine();

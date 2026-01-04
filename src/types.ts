/**
 * AWFUL CODE REVIEW - Type Definitions
 * A GitHub Action for generating contextually inappropriate code reviews
 */

// ============ Pattern Detection ============

export interface PatternDefinition {
  regex: string;
  fileTypes?: string[];
  triggersPersonas: PersonaType[];
  weight?: number; // likelihood of triggering, 0-1
}

export interface PatternMatch {
  pattern: string;
  lineNumber: number;
  lineContent: string;
  matchedText: string;
  triggersPersonas: PersonaType[];
}

// ============ Personas ============

export type PersonaType =
  | 'security_theater'
  | 'ai_maximalist'
  | 'premature_abstractor'
  | 'dinosaur'
  | 'time_traveler'
  | 'overconfident_beginner'
  | 'optimizer'
  | 'chaos_agent'
  | 'recent_convert'
  | 'formatting_pedant'
  | 'ghost_of_managers_past'
  | 'copy_paste_archaeologist'
  | 'chaotic_neutral'
  | 'documentation_hypocrite'
  | 'executive'
  | 'scope_creep_sage'
  | 'works_on_my_machine'
  | 'bikeshedder'
  | 'dry_absolutist'
  | 'vague_senior';

export interface PersonaDefinition {
  name: PersonaType;
  displayName: string;
  vocabulary: string[];
  openingPhrases: string[];
  confidence: number; // 0-1, how assertive
  wrongness: number; // 0-1, how incorrect
  verbosity: number; // 0-1, how long-winded
  responses: {
    [patternKey: string]: string[];
  };
  genericResponses: string[]; // fallback for any pattern
}

// ============ Mutations ============

export type MutationType =
  | 'confidence_booster'
  | 'false_attribution'
  | 'passive_aggression'
  | 'scope_creep'
  | 'emoji_chaos'
  | 'vague_reference';

export interface Mutation {
  type: MutationType;
  prepend?: string;
  append?: string;
  probability: number;
}

// ============ Contradictions ============

export interface ContradictionRule {
  ifPrevious: string; // tag/category of previous comment
  then: string; // tag/category to contradict with
  probability: number;
}

export interface CommentRecord {
  file: string;
  line: number;
  body: string;
  tags: string[];
  persona: PersonaType;
}

// ============ Review Composition ============

export type ReviewAction = 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT';

export interface ReviewComment {
  path: string;
  line: number;
  body: string;
  persona: PersonaType;
  tags: string[];
}

export interface ComposedReview {
  action: ReviewAction;
  summary: string;
  comments: ReviewComment[];
  contradictionCount: number;
}

// ============ File Analysis ============

export interface FileChange {
  filename: string;
  patch: string;
  additions: number;
  deletions: number;
  status: 'added' | 'removed' | 'modified' | 'renamed';
}

export interface AnalyzedLine {
  lineNumber: number;
  content: string;
  isAddition: boolean;
  patterns: PatternMatch[];
}

export interface AnalyzedFile {
  filename: string;
  extension: string;
  lines: AnalyzedLine[];
  detectedFramework?: string;
  wronglyDetectedFramework?: string; // for maximum chaos
}

// ============ Configuration ============

export interface ChaosConfig {
  chaosLevel: number; // 0-1, probability of commenting on any given file
  helpfulAccidentRate: number; // 0-1, the 30% good-but-unhinged advice
  approvalMismatchProbability: number;
  contradictionEnabled: boolean;
  maxCommentsPerFile: number;
  maxCommentsTotal: number;
  enabledPersonas: PersonaType[];
  severityRandomization: {
    criticalShownAsNitpick: number;
    nitpickShownAsBlocker: number;
  };
  wrongFrameworkDetection: {
    enabled: boolean;
    probability: number;
  };
  // Probability of adding severity labels to comments
  severityLabelProbability: number;
  // Probability of using enthusiastic vs contradictory summary when approving
  enthusiasticSummaryProbability: number;
  // Probability threshold for requesting changes when >5 comments
  requestChangesThreshold: number;
}

// ============ GitHub Action Inputs ============

export interface ActionInputs {
  githubToken: string;
  configPath?: string;
  chaosLevel?: number;
  personas?: PersonaType[];
  dryRun?: boolean;
}

// ============ Utility Types ============

export interface WeightedItem<T> {
  item: T;
  weight: number;
}

export type TemplateVariables = {
  [key: string]: string | number | boolean;
};

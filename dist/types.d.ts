/**
 * AWFUL CODE REVIEW - Type Definitions
 * A GitHub Action for generating contextually inappropriate code reviews
 */
export interface PatternDefinition {
    regex: string;
    fileTypes?: string[];
    triggersPersonas: PersonaType[];
    weight?: number;
}
export interface PatternMatch {
    pattern: string;
    lineNumber: number;
    lineContent: string;
    matchedText: string;
    triggersPersonas: PersonaType[];
}
export type PersonaType = 'security_theater' | 'ai_maximalist' | 'premature_abstractor' | 'dinosaur' | 'time_traveler' | 'overconfident_beginner' | 'optimizer' | 'chaos_agent' | 'recent_convert' | 'formatting_pedant' | 'ghost_of_managers_past' | 'copy_paste_archaeologist' | 'chaotic_neutral' | 'documentation_hypocrite' | 'executive' | 'scope_creep_sage' | 'works_on_my_machine' | 'bikeshedder' | 'dry_absolutist' | 'vague_senior';
export interface PersonaDefinition {
    name: PersonaType;
    displayName: string;
    vocabulary: string[];
    openingPhrases: string[];
    confidence: number;
    wrongness: number;
    verbosity: number;
    responses: {
        [patternKey: string]: string[];
    };
    genericResponses: string[];
}
export type MutationType = 'confidence_booster' | 'false_attribution' | 'passive_aggression' | 'scope_creep' | 'emoji_chaos' | 'vague_reference';
export interface Mutation {
    type: MutationType;
    prepend?: string;
    append?: string;
    probability: number;
}
export interface ContradictionRule {
    ifPrevious: string;
    then: string;
    probability: number;
}
export interface CommentRecord {
    file: string;
    line: number;
    body: string;
    tags: string[];
    persona: PersonaType;
}
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
    wronglyDetectedFramework?: string;
}
export interface ChaosConfig {
    chaosLevel: number;
    helpfulAccidentRate: number;
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
    severityLabelProbability: number;
    enthusiasticSummaryProbability: number;
    requestChangesThreshold: number;
}
export interface ActionInputs {
    githubToken: string;
    configPath?: string;
    chaosLevel?: number;
    personas?: PersonaType[];
    dryRun?: boolean;
}
export interface WeightedItem<T> {
    item: T;
    weight: number;
}
export type TemplateVariables = {
    [key: string]: string | number | boolean;
};

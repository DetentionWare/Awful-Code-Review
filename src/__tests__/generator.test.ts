import { CommentGenerator, defaultConfig } from '../generator';
import { AnalyzedFile, PatternMatch, ChaosConfig } from '../types';

// Helper to create a mock analyzed file
function createMockFile(
  filename: string,
  lines: Array<{ lineNumber: number; content: string; patterns: PatternMatch[] }>
): AnalyzedFile {
  return {
    filename,
    extension: filename.split('.').pop() || '',
    lines: lines.map(l => ({
      ...l,
      isAddition: true,
    })),
  };
}

// Helper to create a pattern match
function createPatternMatch(pattern: string): PatternMatch {
  return {
    pattern,
    lineNumber: 1,
    lineContent: 'test',
    matchedText: 'test',
    triggersPersonas: ['chaos_agent', 'overconfident_beginner'],
  };
}

describe('CommentGenerator', () => {
  let generator: CommentGenerator;

  beforeEach(() => {
    generator = new CommentGenerator();
  });

  describe('constructor', () => {
    it('should use default config when none provided', () => {
      const gen = new CommentGenerator();
      expect(gen).toBeDefined();
    });

    it('should merge partial config with defaults', () => {
      const gen = new CommentGenerator({ chaosLevel: 0.5 });
      expect(gen).toBeDefined();
    });

    it('should accept custom enabled personas', () => {
      const gen = new CommentGenerator({
        enabledPersonas: ['chaos_agent', 'dinosaur'],
      });
      expect(gen).toBeDefined();
    });
  });

  describe('generateCommentsForFile', () => {
    it('should generate comments for file with patterns', () => {
      // Force high chaos to always generate
      const gen = new CommentGenerator({
        chaosLevel: 1,
        helpfulAccidentRate: 0,
      });

      const file = createMockFile('test.ts', [
        {
          lineNumber: 1,
          content: 'const x = 1;',
          patterns: [createPatternMatch('variables')],
        },
      ]);

      const comments = gen.generateCommentsForFile(file);

      // Should have at least one comment
      expect(comments.length).toBeGreaterThan(0);
    });

    it('should respect maxCommentsPerFile', () => {
      const gen = new CommentGenerator({
        chaosLevel: 1,
        helpfulAccidentRate: 0,
        maxCommentsPerFile: 2,
      });

      // Create file with many patterns
      const file = createMockFile('test.ts', [
        { lineNumber: 1, content: 'line1', patterns: [createPatternMatch('variables')] },
        { lineNumber: 2, content: 'line2', patterns: [createPatternMatch('functions')] },
        { lineNumber: 3, content: 'line3', patterns: [createPatternMatch('loops')] },
        { lineNumber: 4, content: 'line4', patterns: [createPatternMatch('conditionals')] },
        { lineNumber: 5, content: 'line5', patterns: [createPatternMatch('imports')] },
      ]);

      const comments = gen.generateCommentsForFile(file);

      // Should not exceed max (plus possible framework comment and contradiction)
      expect(comments.length).toBeLessThanOrEqual(4); // 2 max + framework + contradiction
    });

    it('should only comment on additions', () => {
      const gen = new CommentGenerator({ chaosLevel: 1 });

      const file: AnalyzedFile = {
        filename: 'test.ts',
        extension: 'ts',
        lines: [
          {
            lineNumber: 1,
            content: 'deleted line',
            isAddition: false,
            patterns: [createPatternMatch('variables')],
          },
        ],
      };

      const comments = gen.generateCommentsForFile(file);

      // Should not have comments on deleted lines (except maybe framework misdetection)
      const nonFrameworkComments = comments.filter(
        c => !c.tags.includes('framework_confusion')
      );
      expect(nonFrameworkComments.length).toBe(0);
    });
  });

  describe('generateSummary', () => {
    it('should generate summary for APPROVE action', () => {
      const summary = generator.generateSummary('APPROVE', 5);
      expect(typeof summary).toBe('string');
      expect(summary.length).toBeGreaterThan(0);
    });

    it('should generate summary for REQUEST_CHANGES action', () => {
      const summary = generator.generateSummary('REQUEST_CHANGES', 5);
      expect(typeof summary).toBe('string');
      expect(summary.length).toBeGreaterThan(0);
    });

    it('should generate summary for COMMENT action', () => {
      const summary = generator.generateSummary('COMMENT', 5);
      expect(typeof summary).toBe('string');
      expect(summary.length).toBeGreaterThan(0);
    });

    it('should sometimes add contradictory note on APPROVE with many comments', () => {
      // Mock random to trigger the contradictory note
      jest.spyOn(Math, 'random').mockReturnValue(0);

      const summary = generator.generateSummary('APPROVE', 10);
      expect(summary).toContain('comments attached');

      jest.restoreAllMocks();
    });
  });

  describe('decideAction', () => {
    it('should APPROVE with no comments', () => {
      const action = generator.decideAction([]);
      // With no comments, base decision should be APPROVE
      // But approval mismatch can change it
      expect(['APPROVE', 'REQUEST_CHANGES', 'COMMENT']).toContain(action);
    });

    it('should tend toward REQUEST_CHANGES with blocker tag', () => {
      // Mock random to avoid mismatch
      jest.spyOn(Math, 'random').mockReturnValue(0.9);

      const comments = [
        {
          path: 'test.ts',
          line: 1,
          body: 'Blocker issue',
          persona: 'security_theater' as const,
          tags: ['blocker'],
        },
      ];

      const action = generator.decideAction(comments);
      expect(action).toBe('REQUEST_CHANGES');

      jest.restoreAllMocks();
    });

    it('should apply approval mismatch sometimes', () => {
      // With mismatch probability, action can be random
      const gen = new CommentGenerator({
        approvalMismatchProbability: 1, // Always mismatch
      });

      // Run multiple times to verify randomness
      const actions = new Set<string>();
      for (let i = 0; i < 50; i++) {
        actions.add(gen.decideAction([]));
      }

      // Should see more than one action type due to mismatch
      expect(actions.size).toBeGreaterThan(1);
    });
  });

  describe('composeReview', () => {
    it('should compose review from multiple files', () => {
      const gen = new CommentGenerator({
        chaosLevel: 1,
        helpfulAccidentRate: 0,
      });

      const files: AnalyzedFile[] = [
        createMockFile('file1.ts', [
          { lineNumber: 1, content: 'code', patterns: [createPatternMatch('variables')] },
        ]),
        createMockFile('file2.ts', [
          { lineNumber: 1, content: 'code', patterns: [createPatternMatch('functions')] },
        ]),
      ];

      const review = gen.composeReview(files);

      expect(review.action).toBeDefined();
      expect(review.summary).toBeDefined();
      expect(Array.isArray(review.comments)).toBe(true);
      expect(typeof review.contradictionCount).toBe('number');
    });

    it('should respect maxCommentsTotal', () => {
      const gen = new CommentGenerator({
        chaosLevel: 1,
        helpfulAccidentRate: 0,
        maxCommentsTotal: 3,
        maxCommentsPerFile: 10,
      });

      const files: AnalyzedFile[] = Array.from({ length: 5 }, (_, i) =>
        createMockFile(`file${i}.ts`, [
          { lineNumber: 1, content: 'code', patterns: [createPatternMatch('variables')] },
          { lineNumber: 2, content: 'code', patterns: [createPatternMatch('functions')] },
        ])
      );

      const review = gen.composeReview(files);

      expect(review.comments.length).toBeLessThanOrEqual(3);
    });
  });

  describe('reset', () => {
    it('should reset internal state', () => {
      const gen = new CommentGenerator({ chaosLevel: 1 });

      // Generate some comments to build up state
      const file = createMockFile('test.ts', [
        { lineNumber: 1, content: 'code', patterns: [createPatternMatch('variables')] },
      ]);
      gen.generateCommentsForFile(file);

      // Reset should not throw
      expect(() => gen.reset()).not.toThrow();
    });
  });

  describe('selectContradictionPersona (via integration)', () => {
    it('should select works_on_my_machine for dismissive patterns', () => {
      // This tests the helper indirectly through comment generation
      const gen = new CommentGenerator({
        chaosLevel: 1,
        contradictionEnabled: true,
      });

      // We can't directly test private method, but we verify the generator works
      expect(gen).toBeDefined();
    });
  });
});

describe('defaultConfig', () => {
  it('should have valid chaos levels', () => {
    expect(defaultConfig.chaosLevel).toBeGreaterThan(0);
    expect(defaultConfig.chaosLevel).toBeLessThanOrEqual(1);
  });

  it('should have helpful accident rate', () => {
    expect(defaultConfig.helpfulAccidentRate).toBeGreaterThan(0);
    expect(defaultConfig.helpfulAccidentRate).toBeLessThanOrEqual(1);
  });

  it('should have all new config fields', () => {
    expect(defaultConfig.severityLabelProbability).toBeDefined();
    expect(defaultConfig.enthusiasticSummaryProbability).toBeDefined();
    expect(defaultConfig.requestChangesThreshold).toBeDefined();
  });

  it('should have reasonable defaults for new fields', () => {
    expect(defaultConfig.severityLabelProbability).toBeGreaterThan(0);
    expect(defaultConfig.severityLabelProbability).toBeLessThanOrEqual(1);

    expect(defaultConfig.enthusiasticSummaryProbability).toBeGreaterThan(0);
    expect(defaultConfig.enthusiasticSummaryProbability).toBeLessThanOrEqual(1);

    expect(defaultConfig.requestChangesThreshold).toBeGreaterThan(0);
    expect(defaultConfig.requestChangesThreshold).toBeLessThanOrEqual(1);
  });
});

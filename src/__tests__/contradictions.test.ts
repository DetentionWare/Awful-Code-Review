import { ContradictionEngine, contradictionRules } from '../contradictions';

describe('ContradictionEngine', () => {
  let engine: ContradictionEngine;

  beforeEach(() => {
    engine = new ContradictionEngine();
  });

  describe('inferTags', () => {
    it('should infer pro_abstraction from interface-related comments', () => {
      const tags = engine.inferTags('Consider extracting an interface here');
      expect(tags).toContain('pro_abstraction');
    });

    it('should infer anti_abstraction from YAGNI comments', () => {
      const tags = engine.inferTags("YAGNI - we don't need this complexity");
      expect(tags).toContain('anti_abstraction');
    });

    it('should infer approving from LGTM', () => {
      const tags = engine.inferTags('LGTM! Ship it!');
      expect(tags).toContain('approving');
    });

    it('should infer blocking from blocker keywords', () => {
      const tags = engine.inferTags('This is a blocker - must fix before merge');
      expect(tags).toContain('blocking');
    });

    it('should infer multiple tags from complex comments', () => {
      const tags = engine.inferTags(
        'This should use an interface pattern. Consider the security implications.'
      );
      expect(tags).toContain('pro_abstraction');
      expect(tags).toContain('security_concern');
    });

    it('should be case insensitive', () => {
      const tags = engine.inferTags('CONSIDER USING AN INTERFACE');
      expect(tags).toContain('pro_abstraction');
    });

    it('should infer dismissive from works on my machine patterns', () => {
      const tags = engine.inferTags("Can't reproduce this issue");
      expect(tags).toContain('dismissive');
    });

    it('should infer vague_concern from uncertain language', () => {
      const tags = engine.inferTags('Something about this feels wrong');
      expect(tags).toContain('vague_concern');
    });
  });

  describe('recordComment', () => {
    it('should add comment to history', () => {
      engine.recordComment('file.ts', 10, 'Test comment', 'chaos_agent');

      const history = engine.getHistory();
      expect(history.length).toBe(1);
      expect(history[0].file).toBe('file.ts');
      expect(history[0].line).toBe(10);
    });

    it('should infer tags automatically', () => {
      engine.recordComment(
        'file.ts',
        10,
        'Consider an interface here',
        'premature_abstractor'
      );

      const history = engine.getHistory();
      expect(history[0].tags).toContain('pro_abstraction');
    });

    it('should accept explicit tags', () => {
      engine.recordComment(
        'file.ts',
        10,
        'Some comment',
        'chaos_agent',
        ['nitpick']
      );

      const history = engine.getHistory();
      expect(history[0].tags).toContain('nitpick');
    });

    it('should merge inferred and explicit tags', () => {
      engine.recordComment(
        'file.ts',
        10,
        'LGTM!',
        'chaotic_neutral',
        ['nitpick']
      );

      const history = engine.getHistory();
      expect(history[0].tags).toContain('approving');
      expect(history[0].tags).toContain('nitpick');
    });
  });

  describe('shouldContradict', () => {
    it('should return false with empty history', () => {
      const result = engine.shouldContradict();
      expect(result.should).toBe(false);
      expect(result.basedOn).toBeNull();
    });

    it('should sometimes return true with matching history', () => {
      // Record a comment with approving tag (simpler to test)
      engine.recordComment(
        'file.ts',
        10,
        'LGTM! Ship it!',
        'chaotic_neutral'
      );

      // With enough iterations, should trigger contradiction
      let contradicted = false;
      for (let i = 0; i < 100; i++) {
        const result = engine.shouldContradict();
        if (result.should) {
          contradicted = true;
          // approving -> blocking is a defined rule
          expect(result.contradictWith).toBe('blocking');
          break;
        }
      }

      // This is probabilistic but with 60% chance should hit at least once in 100 tries
      expect(contradicted).toBe(true);
    });
  });

  describe('generateContradiction', () => {
    it('should return null with empty history', () => {
      const result = engine.generateContradiction();
      expect(result).toBeNull();
    });

    it('should generate contradictory comment when triggered', () => {
      // Mock random to always trigger contradiction
      jest.spyOn(Math, 'random').mockReturnValue(0);

      engine.recordComment(
        'file.ts',
        10,
        'Consider an interface here',
        'premature_abstractor'
      );

      const result = engine.generateContradiction();
      expect(result).not.toBeNull();
      expect(result?.comment).toBeDefined();
      expect(result?.referencedFile).toBe('file.ts');
      expect(result?.referencedLine).toBe(10);

      jest.restoreAllMocks();
    });
  });

  describe('reset', () => {
    it('should clear comment history', () => {
      engine.recordComment('file.ts', 10, 'Comment 1', 'chaos_agent');
      engine.recordComment('file.ts', 20, 'Comment 2', 'chaos_agent');

      expect(engine.getHistory().length).toBe(2);

      engine.reset();

      expect(engine.getHistory().length).toBe(0);
    });
  });

  describe('getUsedTags', () => {
    it('should return empty set with no history', () => {
      const tags = engine.getUsedTags();
      expect(tags.size).toBe(0);
    });

    it('should return all unique tags from history', () => {
      engine.recordComment('file.ts', 10, 'LGTM!', 'chaotic_neutral');
      engine.recordComment('file.ts', 20, 'This is a blocker', 'security_theater');

      const tags = engine.getUsedTags();
      expect(tags.has('approving')).toBe(true);
      expect(tags.has('blocking')).toBe(true);
    });
  });
});

describe('contradictionRules', () => {
  it('should have valid probabilities', () => {
    for (const rule of contradictionRules) {
      expect(rule.probability).toBeGreaterThan(0);
      expect(rule.probability).toBeLessThanOrEqual(1);
    }
  });

  it('should include key contradiction pairs', () => {
    const ruleMap = new Map(
      contradictionRules.map(r => [`${r.ifPrevious}->${r.then}`, r])
    );

    // Classic contradictions should exist
    expect(ruleMap.has('pro_abstraction->anti_abstraction')).toBe(true);
    expect(ruleMap.has('approving->blocking')).toBe(true);
    expect(ruleMap.has('reports_bug->dismissive')).toBe(true);
  });
});

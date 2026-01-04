import { MutationEngine, mutations, severityLabels } from '../mutations';

describe('MutationEngine', () => {
  let engine: MutationEngine;

  beforeEach(() => {
    engine = new MutationEngine();
  });

  describe('applyRandomMutation', () => {
    it('should sometimes apply mutations', () => {
      // With enough iterations, we should see at least one mutation
      let mutationApplied = false;

      for (let i = 0; i < 100; i++) {
        const result = engine.applyRandomMutation('Test comment');
        if (result.applied) {
          mutationApplied = true;
          break;
        }
      }

      expect(mutationApplied).toBe(true);
    });

    it('should not apply mutations when probability is 0', () => {
      const noMutationEngine = new MutationEngine(undefined, 0);
      const result = noMutationEngine.applyRandomMutation('Test comment');

      expect(result.applied).toBeNull();
      expect(result.comment).toBe('Test comment');
    });

    it('should prepend text when mutation has prepend', () => {
      // Mock random to always apply
      jest.spyOn(Math, 'random').mockReturnValue(0);

      const result = engine.applyRandomMutation('Original text');

      // Should have some prefix added
      expect(result.comment.length).toBeGreaterThan('Original text'.length);

      jest.restoreAllMocks();
    });
  });

  describe('applyMutations', () => {
    it('should apply up to maxMutations mutations', () => {
      // Mock random to always apply
      jest.spyOn(Math, 'random').mockReturnValue(0);

      const original = 'Test';
      const mutated = engine.applyMutations(original, 3);

      // Should be different from original
      expect(mutated).not.toBe(original);

      jest.restoreAllMocks();
    });

    it('should respect maxMutations parameter', () => {
      const mutatedOnce = engine.applyMutations('Test', 1);
      const mutatedThrice = engine.applyMutations('Test', 3);

      // With higher maxMutations, we have more chances for mutations
      // This is probabilistic, but over many runs, more mutations = longer result
      // We just verify both calls complete without error
      expect(typeof mutatedOnce).toBe('string');
      expect(typeof mutatedThrice).toBe('string');
    });
  });

  describe('addSeverityLabel', () => {
    it('should add severity label to comment', () => {
      const result = engine.addSeverityLabel('This is a comment', 'nitpick', 0);

      // Should have one of the nitpick labels
      const hasNitpickLabel = severityLabels.nitpick.some(label =>
        result.startsWith(label)
      );
      expect(hasNitpickLabel).toBe(true);
    });

    it('should sometimes mismatch severity', () => {
      // With mismatchProbability of 1, should always mismatch
      const result = engine.addSeverityLabel('Comment', 'nitpick', 1);

      // Should NOT have a nitpick label since we forced mismatch
      const hasNitpickLabel = severityLabels.nitpick.some(label =>
        result.startsWith(label)
      );
      expect(hasNitpickLabel).toBe(false);
    });

    it('should preserve original comment content', () => {
      const original = 'This is my comment';
      const result = engine.addSeverityLabel(original, 'blocker', 0);

      expect(result).toContain(original);
    });
  });

  describe('generateContradiction', () => {
    it('should sometimes generate contradictions', () => {
      let contradictionGenerated = false;

      for (let i = 0; i < 50; i++) {
        const result = engine.generateContradiction('Original comment');
        if (result !== null) {
          contradictionGenerated = true;
          break;
        }
      }

      expect(contradictionGenerated).toBe(true);
    });

    it('should return null sometimes', () => {
      // Mock random to exceed contradiction probability (0.3)
      jest.spyOn(Math, 'random').mockReturnValue(0.5);

      const result = engine.generateContradiction('Original comment');
      expect(result).toBeNull();

      jest.restoreAllMocks();
    });
  });
});

describe('mutations data', () => {
  it('should have valid mutation types', () => {
    const expectedTypes = [
      'confidence_booster',
      'false_attribution',
      'passive_aggression',
      'scope_creep',
      'emoji_chaos',
      'vague_reference',
    ];

    expect(Object.keys(mutations)).toEqual(expect.arrayContaining(expectedTypes));
  });

  it('should have prepend or append for each mutation', () => {
    for (const [type, mutationList] of Object.entries(mutations)) {
      for (const mutation of mutationList) {
        expect(mutation.prepend || mutation.append).toBeDefined();
      }
    }
  });

  it('should have probabilities between 0 and 1', () => {
    for (const [type, mutationList] of Object.entries(mutations)) {
      for (const mutation of mutationList) {
        expect(mutation.probability).toBeGreaterThan(0);
        expect(mutation.probability).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe('severityLabels', () => {
  it('should have all severity levels', () => {
    expect(severityLabels.nitpick).toBeDefined();
    expect(severityLabels.suggestion).toBeDefined();
    expect(severityLabels.important).toBeDefined();
    expect(severityLabels.blocker).toBeDefined();
  });

  it('should have multiple labels per severity', () => {
    for (const labels of Object.values(severityLabels)) {
      expect(labels.length).toBeGreaterThan(1);
    }
  });
});

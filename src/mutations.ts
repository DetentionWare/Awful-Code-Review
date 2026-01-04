import { Mutation, MutationType } from './types';

/**
 * Mutations transform generated comments to make them worse in specific ways
 */
export const mutations: Record<MutationType, Mutation[]> = {
  confidence_booster: [
    { type: 'confidence_booster', prepend: 'Actually, ', probability: 0.3 },
    { type: 'confidence_booster', prepend: 'Best practice is to ', probability: 0.25 },
    { type: 'confidence_booster', prepend: "I'm surprised this passed linting—", probability: 0.2 },
    { type: 'confidence_booster', append: ' (this is a blocker for me)', probability: 0.15 },
    { type: 'confidence_booster', prepend: 'Obviously, ', probability: 0.2 },
    { type: 'confidence_booster', prepend: 'As everyone knows, ', probability: 0.15 },
    { type: 'confidence_booster', append: '. This is non-negotiable.', probability: 0.1 },
    { type: 'confidence_booster', prepend: 'Clearly, ', probability: 0.2 },
  ],

  false_attribution: [
    { type: 'false_attribution', prepend: 'Per the style guide, ', probability: 0.25 },
    { type: 'false_attribution', prepend: 'The docs clearly state ', probability: 0.2 },
    { type: 'false_attribution', prepend: 'As discussed in standup, ', probability: 0.15 },
    { type: 'false_attribution', append: ' (see RFC 2119)', probability: 0.1 },
    { type: 'false_attribution', prepend: 'According to our ADR, ', probability: 0.15 },
    { type: 'false_attribution', prepend: 'Per Google/Airbnb style guide, ', probability: 0.2 },
    { type: 'false_attribution', append: ' (this was decided in the architecture meeting)', probability: 0.1 },
    { type: 'false_attribution', prepend: 'As Martin Fowler says, ', probability: 0.15 },
    { type: 'false_attribution', prepend: 'Uncle Bob would say ', probability: 0.15 },
  ],

  passive_aggression: [
    { type: 'passive_aggression', prepend: 'Just curious—', probability: 0.25 },
    { type: 'passive_aggression', prepend: 'Not sure if intentional, but ', probability: 0.2 },
    { type: 'passive_aggression', prepend: 'Maybe I\'m missing something, but ', probability: 0.2 },
    { type: 'passive_aggression', append: ' 🙂', probability: 0.3 },
    { type: 'passive_aggression', prepend: 'No offense, but ', probability: 0.15 },
    { type: 'passive_aggression', prepend: 'I\'m sure you have your reasons, but ', probability: 0.15 },
    { type: 'passive_aggression', append: ' (just my two cents)', probability: 0.2 },
    { type: 'passive_aggression', prepend: 'Feel free to ignore this, but ', probability: 0.15 },
    { type: 'passive_aggression', append: ' ...but what do I know?', probability: 0.1 },
    { type: 'passive_aggression', prepend: 'With all due respect, ', probability: 0.15 },
  ],

  scope_creep: [
    { type: 'scope_creep', append: ' Also, while you\'re in here...', probability: 0.2 },
    { type: 'scope_creep', append: ' This might be a good time to refactor the whole module.', probability: 0.15 },
    { type: 'scope_creep', append: ' We should probably update the tests too.', probability: 0.2 },
    { type: 'scope_creep', append: ' Can you also check the other files that use this pattern?', probability: 0.15 },
    { type: 'scope_creep', append: ' This reminds me, we need to update the documentation.', probability: 0.15 },
    { type: 'scope_creep', append: ' Oh and can you bump the version number while you\'re at it?', probability: 0.1 },
  ],

  emoji_chaos: [
    { type: 'emoji_chaos', append: ' 🤔', probability: 0.2 },
    { type: 'emoji_chaos', append: ' 😬', probability: 0.15 },
    { type: 'emoji_chaos', append: ' 🚀', probability: 0.15 }, // Ironic
    { type: 'emoji_chaos', append: ' 💀', probability: 0.1 },
    { type: 'emoji_chaos', append: ' 🙃', probability: 0.15 },
    { type: 'emoji_chaos', append: ' 👀', probability: 0.2 },
    { type: 'emoji_chaos', append: ' 😅', probability: 0.15 },
    { type: 'emoji_chaos', prepend: '⚠️ ', probability: 0.1 },
    { type: 'emoji_chaos', prepend: '🚨 ', probability: 0.1 },
  ],

  vague_reference: [
    { type: 'vague_reference', prepend: 'Like we discussed, ', probability: 0.2 },
    { type: 'vague_reference', prepend: 'As I mentioned in the other PR, ', probability: 0.15 },
    { type: 'vague_reference', append: ' (you know what I mean)', probability: 0.15 },
    { type: 'vague_reference', prepend: 'Similar to that thing from last sprint, ', probability: 0.15 },
    { type: 'vague_reference', append: ' (see my email)', probability: 0.1 },
    { type: 'vague_reference', prepend: 'Per our conversation, ', probability: 0.15 },
    { type: 'vague_reference', append: ' (this came up in the retro)', probability: 0.1 },
  ],
};

/**
 * Severity labels that can be randomly misapplied
 */
export const severityLabels = {
  nitpick: ['nit:', 'nitpick:', 'minor:', 'style:'],
  suggestion: ['suggestion:', 'consider:', 'idea:', 'thought:'],
  important: ['important:', 'note:', 'please address:', 'fyi:'],
  blocker: ['blocker:', 'BLOCKER:', '🚨:', 'critical:', 'P0:'],
};

export class MutationEngine {
  private enabledMutations: MutationType[];
  private mutationProbability: number;

  constructor(
    enabledMutations: MutationType[] = Object.keys(mutations) as MutationType[],
    mutationProbability: number = 0.4
  ) {
    this.enabledMutations = enabledMutations;
    this.mutationProbability = mutationProbability;
  }

  /**
   * Apply a random mutation to a comment
   */
  applyRandomMutation(comment: string): { comment: string; applied: Mutation | null } {
    if (Math.random() > this.mutationProbability) {
      return { comment, applied: null };
    }

    // Pick a random mutation type
    const mutationType = this.enabledMutations[
      Math.floor(Math.random() * this.enabledMutations.length)
    ];

    const mutationsOfType = mutations[mutationType];
    if (!mutationsOfType || mutationsOfType.length === 0) {
      return { comment, applied: null };
    }

    // Pick a random mutation of that type
    const mutation = mutationsOfType[Math.floor(Math.random() * mutationsOfType.length)];

    // Check if this specific mutation fires based on its probability
    if (Math.random() > mutation.probability) {
      return { comment, applied: null };
    }

    // Apply the mutation
    let mutatedComment = comment;
    if (mutation.prepend) {
      mutatedComment = mutation.prepend + mutatedComment;
    }
    if (mutation.append) {
      mutatedComment = mutatedComment + mutation.append;
    }

    return { comment: mutatedComment, applied: mutation };
  }

  /**
   * Apply multiple mutations to a comment
   */
  applyMutations(comment: string, maxMutations: number = 2): string {
    let result = comment;
    let appliedCount = 0;

    for (let i = 0; i < maxMutations; i++) {
      const { comment: mutated, applied } = this.applyRandomMutation(result);
      if (applied) {
        result = mutated;
        appliedCount++;
      }
    }

    return result;
  }

  /**
   * Add a random severity label (possibly wrong)
   */
  addSeverityLabel(comment: string, actualSeverity: 'nitpick' | 'suggestion' | 'important' | 'blocker', mismatchProbability: number = 0.3): string {
    // Decide if we should mismatch the severity
    let displaySeverity = actualSeverity;

    if (Math.random() < mismatchProbability) {
      // Pick a random different severity
      const allSeverities = Object.keys(severityLabels) as Array<keyof typeof severityLabels>;
      const otherSeverities = allSeverities.filter(s => s !== actualSeverity);
      displaySeverity = otherSeverities[Math.floor(Math.random() * otherSeverities.length)];
    }

    const labels = severityLabels[displaySeverity];
    const label = labels[Math.floor(Math.random() * labels.length)];

    return `${label} ${comment}`;
  }

  /**
   * Generate a contradictory follow-up comment
   */
  generateContradiction(originalComment: string): string | null {
    const contradictions = [
      'Actually, ignore my previous comment.',
      'On second thought, the original approach is fine.',
      'Wait, I see what you\'re doing now. Still disagree though.',
      'Hmm, I take back what I said. Or do I?',
      'Actually this is fine. Actually no. Actually yes.',
      'Disregard my last comment, but also consider it.',
    ];

    if (Math.random() < 0.3) {
      return contradictions[Math.floor(Math.random() * contradictions.length)];
    }

    return null;
  }
}

export const defaultMutationEngine = new MutationEngine();

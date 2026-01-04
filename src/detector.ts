import { PatternDefinition, PatternMatch, PersonaType } from './types';

/**
 * Pattern definitions for detecting code constructs
 * Each pattern triggers specific personas that have opinions about it
 */
export const patterns: Record<string, PatternDefinition> = {
  // JavaScript/TypeScript patterns
  async_await: {
    regex: '\\b(async\\s+function|async\\s*\\(|await\\s+)',
    fileTypes: ['js', 'ts', 'jsx', 'tsx', 'mjs'],
    triggersPersonas: ['dinosaur', 'overconfident_beginner', 'optimizer', 'time_traveler', 'recent_convert', 'security_theater'],
    weight: 0.8,
  },

  arrow_functions: {
    regex: '=>',
    fileTypes: ['js', 'ts', 'jsx', 'tsx'],
    triggersPersonas: ['dinosaur', 'formatting_pedant'],
    weight: 0.5,
  },

  fetch: {
    regex: '\\bfetch\\s*\\(',
    fileTypes: ['js', 'ts', 'jsx', 'tsx'],
    triggersPersonas: ['dinosaur', 'security_theater', 'time_traveler', 'overconfident_beginner', 'optimizer', 'premature_abstractor', 'ai_maximalist'],
    weight: 0.8,
  },

  error_handling: {
    regex: '\\b(try\\s*\\{|catch\\s*\\(|\\.catch\\s*\\()',
    fileTypes: ['js', 'ts', 'jsx', 'tsx', 'py', 'java'],
    triggersPersonas: ['optimizer', 'chaos_agent', 'security_theater', 'overconfident_beginner', 'recent_convert', 'documentation_hypocrite', 'ai_maximalist', 'works_on_my_machine', 'dry_absolutist', 'vague_senior'],
    weight: 0.9,
  },

  null_checks: {
    regex: '(!==?\\s*(null|undefined)|\\?\\.|\\?\\?|\\?.\\s*\\()',
    fileTypes: ['js', 'ts', 'jsx', 'tsx'],
    triggersPersonas: ['overconfident_beginner', 'optimizer', 'chaos_agent'],
    weight: 0.7,
  },

  // React patterns
  react: {
    regex: '(useState|useEffect|useContext|useRef|useMemo|useCallback)',
    fileTypes: ['jsx', 'tsx', 'js', 'ts'],
    triggersPersonas: ['time_traveler', 'premature_abstractor', 'dinosaur', 'overconfident_beginner', 'recent_convert', 'optimizer', 'security_theater', 'ai_maximalist', 'bikeshedder', 'dry_absolutist', 'vague_senior'],
    weight: 0.8,
  },

  react_class: {
    regex: '(extends\\s+(React\\.)?Component|componentDidMount|componentWillUnmount)',
    fileTypes: ['jsx', 'tsx', 'js', 'ts'],
    triggersPersonas: ['recent_convert', 'overconfident_beginner'],
    weight: 0.7,
  },

  // CSS patterns
  css_colors: {
    regex: '(#[0-9a-fA-F]{3,8}|rgb\\(|rgba\\(|hsl\\(|hsla\\()',
    fileTypes: ['css', 'scss', 'less', 'sass', 'jsx', 'tsx', 'vue'],
    triggersPersonas: ['ai_maximalist', 'security_theater', 'premature_abstractor'],
    weight: 0.6,
  },

  css_modern: {
    regex: '(display:\\s*flex|display:\\s*grid|gap:|@container)',
    fileTypes: ['css', 'scss', 'less', 'sass'],
    triggersPersonas: ['dinosaur'],
    weight: 0.7,
  },

  // Import patterns
  imports: {
    regex: '^\\s*(import\\s+|from\\s+[\'"]|require\\s*\\()',
    fileTypes: ['js', 'ts', 'jsx', 'tsx', 'py'],
    triggersPersonas: ['time_traveler', 'recent_convert', 'copy_paste_archaeologist', 'security_theater', 'formatting_pedant'],
    weight: 0.6,
  },

  // Function definitions
  functions: {
    regex: '(function\\s+\\w+|const\\s+\\w+\\s*=\\s*(async\\s*)?\\([^)]*\\)\\s*=>|def\\s+\\w+\\s*\\()',
    fileTypes: ['js', 'ts', 'jsx', 'tsx', 'py'],
    triggersPersonas: ['premature_abstractor', 'optimizer', 'documentation_hypocrite', 'recent_convert', 'overconfident_beginner', 'formatting_pedant', 'bikeshedder', 'dry_absolutist', 'vague_senior'],
    weight: 0.8,
  },

  // Class definitions
  classes: {
    regex: '(class\\s+\\w+|interface\\s+\\w+|type\\s+\\w+\\s*=)',
    fileTypes: ['js', 'ts', 'jsx', 'tsx', 'py', 'java'],
    triggersPersonas: ['premature_abstractor', 'recent_convert'],
    weight: 0.7,
  },

  // Loop patterns
  loops: {
    regex: '(for\\s*\\(|while\\s*\\(|\\.forEach\\s*\\(|\\.map\\s*\\(|\\.filter\\s*\\()',
    fileTypes: ['js', 'ts', 'jsx', 'tsx', 'py', 'java'],
    triggersPersonas: ['recent_convert', 'optimizer', 'ai_maximalist', 'dinosaur', 'overconfident_beginner', 'premature_abstractor'],
    weight: 0.7,
  },

  // Conditional patterns
  conditionals: {
    regex: '(if\\s*\\(|switch\\s*\\(|\\?.*:|&&\\s*\\w+|\\|\\|\\s*\\w+)',
    fileTypes: ['js', 'ts', 'jsx', 'tsx', 'py', 'java'],
    triggersPersonas: ['ai_maximalist', 'premature_abstractor', 'recent_convert'],
    weight: 0.6,
  },

  // String literals
  string_literals: {
    regex: '(["\'][^"\']{10,}["\']|`[^`]+`)',
    fileTypes: ['js', 'ts', 'jsx', 'tsx', 'py', 'java'],
    triggersPersonas: ['ai_maximalist', 'security_theater', 'optimizer'],
    weight: 0.5,
  },

  // Variable declarations
  variables: {
    regex: '(const\\s+\\w+|let\\s+\\w+|var\\s+\\w+)',
    fileTypes: ['js', 'ts', 'jsx', 'tsx'],
    triggersPersonas: ['recent_convert', 'formatting_pedant', 'documentation_hypocrite', 'optimizer', 'overconfident_beginner', 'dinosaur', 'bikeshedder', 'dry_absolutist', 'vague_senior'],
    weight: 0.6,
  },

  // Type annotations
  types: {
    regex: '(:\\s*(string|number|boolean|any|unknown)\\b|<[^>]+>)',
    fileTypes: ['ts', 'tsx'],
    triggersPersonas: ['overconfident_beginner', 'dinosaur', 'optimizer'],
    weight: 0.5,
  },

  // Whitespace patterns (for pedants and deranged optimizers)
  whitespace: {
    regex: '(  +|\\t)',
    fileTypes: ['*'],
    triggersPersonas: ['formatting_pedant', 'optimizer'],
    weight: 0.3,
  },

  // Console logs and debugging
  console: {
    regex: 'console\\.(log|warn|error|debug)',
    fileTypes: ['js', 'ts', 'jsx', 'tsx'],
    triggersPersonas: ['security_theater', 'chaos_agent', 'ghost_of_managers_past'],
    weight: 0.8,
  },

  // Comments (for documentation hypocrite)
  comments: {
    regex: '(\\/\\/.*|\\/\\*[\\s\\S]*?\\*\\/|#.*)',
    fileTypes: ['*'],
    triggersPersonas: ['documentation_hypocrite', 'optimizer'],
    weight: 0.5,
  },

  // Any change (generic triggers) - low weight fallback
  any_change: {
    regex: '.',
    fileTypes: ['*'],
    triggersPersonas: ['scope_creep_sage', 'executive', 'ghost_of_managers_past', 'chaotic_neutral'],
    weight: 0.05,
  },
};

export class PatternDetector {
  private patterns: Record<string, PatternDefinition>;

  constructor(customPatterns?: Record<string, PatternDefinition>) {
    this.patterns = { ...patterns, ...customPatterns };
    this.validatePatterns();
  }

  /**
   * Validate all pattern regexes at construction time.
   * Throws an error if any regex is invalid, making issues visible early.
   */
  private validatePatterns(): void {
    for (const [name, pattern] of Object.entries(this.patterns)) {
      try {
        new RegExp(pattern.regex);
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown error';
        throw new Error(`Invalid regex in pattern "${name}": ${pattern.regex} - ${message}`);
      }
    }
  }

  /**
   * Get file extension from filename
   */
  private getExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  }

  /**
   * Check if a pattern applies to a file type
   */
  private patternMatchesFileType(pattern: PatternDefinition, extension: string): boolean {
    if (!pattern.fileTypes || pattern.fileTypes.includes('*')) {
      return true;
    }
    return pattern.fileTypes.includes(extension);
  }

  /**
   * Detect all patterns in a line of code
   */
  detectInLine(
    line: string,
    lineNumber: number,
    filename: string
  ): PatternMatch[] {
    const extension = this.getExtension(filename);
    const matches: PatternMatch[] = [];

    for (const [patternName, pattern] of Object.entries(this.patterns)) {
      if (!this.patternMatchesFileType(pattern, extension)) {
        continue;
      }

      try {
        const regex = new RegExp(pattern.regex, 'g');
        let match: RegExpExecArray | null;

        while ((match = regex.exec(line)) !== null) {
          // Apply weight as probability of including this match
          if (Math.random() > (pattern.weight ?? 1)) {
            continue;
          }

          matches.push({
            pattern: patternName,
            lineNumber,
            lineContent: line,
            matchedText: match[0],
            triggersPersonas: pattern.triggersPersonas as PersonaType[],
          });
        }
      } catch (e) {
        console.error(`Invalid regex for pattern ${patternName}:`, e);
      }
    }

    return matches;
  }

  /**
   * Detect patterns in multiple lines
   */
  detectInLines(
    lines: string[],
    filename: string
  ): Map<number, PatternMatch[]> {
    const results = new Map<number, PatternMatch[]>();

    lines.forEach((line, index) => {
      const lineNumber = index + 1; // 1-indexed
      const matches = this.detectInLine(line, lineNumber, filename);
      if (matches.length > 0) {
        results.set(lineNumber, matches);
      }
    });

    return results;
  }

  /**
   * Get all personas triggered by a set of matches
   */
  getTriggeredPersonas(matches: PatternMatch[]): PersonaType[] {
    const personas = new Set<PersonaType>();
    matches.forEach(match => {
      match.triggersPersonas.forEach(p => personas.add(p));
    });
    return Array.from(personas);
  }

  /**
   * Parse a unified diff and extract changed lines
   */
  parseDiff(patch: string): Array<{ lineNumber: number; content: string; isAddition: boolean }> {
    const lines = patch.split('\n');
    const changes: Array<{ lineNumber: number; content: string; isAddition: boolean }> = [];
    let currentLine = 0;

    for (const line of lines) {
      // Parse hunk headers like @@ -1,5 +1,6 @@
      const hunkMatch = line.match(/^@@\s*-\d+(?:,\d+)?\s*\+(\d+)(?:,\d+)?\s*@@/);
      if (hunkMatch) {
        currentLine = parseInt(hunkMatch[1], 10);
        continue;
      }

      if (line.startsWith('+') && !line.startsWith('+++')) {
        changes.push({
          lineNumber: currentLine,
          content: line.substring(1),
          isAddition: true,
        });
        currentLine++;
      } else if (line.startsWith('-') && !line.startsWith('---')) {
        // Deletions don't increment the line counter for the new file
        // We still track them for potential comments
        changes.push({
          lineNumber: currentLine,
          content: line.substring(1),
          isAddition: false,
        });
      } else if (!line.startsWith('\\')) {
        // Context lines
        currentLine++;
      }
    }

    return changes;
  }
}

export const defaultDetector = new PatternDetector();

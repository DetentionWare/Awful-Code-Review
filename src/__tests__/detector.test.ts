import { PatternDetector, patterns } from '../detector';

describe('PatternDetector', () => {
  let detector: PatternDetector;

  beforeEach(() => {
    detector = new PatternDetector();
  });

  describe('constructor', () => {
    it('should create detector with default patterns', () => {
      expect(detector).toBeDefined();
    });

    it('should merge custom patterns with defaults', () => {
      const customDetector = new PatternDetector({
        custom_pattern: {
          regex: 'foobar',
          fileTypes: ['js'],
          triggersPersonas: ['chaos_agent'],
          weight: 1.0,
        },
      });
      expect(customDetector).toBeDefined();
    });

    it('should throw on invalid regex pattern', () => {
      expect(() => {
        new PatternDetector({
          bad_pattern: {
            regex: '[invalid(regex',
            fileTypes: ['js'],
            triggersPersonas: ['chaos_agent'],
          },
        });
      }).toThrow(/Invalid regex in pattern "bad_pattern"/);
    });
  });

  describe('detectInLine', () => {
    it('should detect async/await pattern', () => {
      // Mock random to ensure pattern weight check passes
      jest.spyOn(Math, 'random').mockReturnValue(0);

      const matches = detector.detectInLine(
        'async function fetchData() {',
        1,
        'example.ts'
      );

      const asyncMatch = matches.find(m => m.pattern === 'async_await');
      expect(asyncMatch).toBeDefined();
      expect(asyncMatch?.triggersPersonas).toContain('dinosaur');

      jest.restoreAllMocks();
    });

    it('should detect arrow functions', () => {
      // Mock random to ensure pattern weight check passes
      jest.spyOn(Math, 'random').mockReturnValue(0);

      const matches = detector.detectInLine(
        'const fn = (x) => x * 2;',
        1,
        'example.js'
      );

      const arrowMatch = matches.find(m => m.pattern === 'arrow_functions');
      expect(arrowMatch).toBeDefined();

      jest.restoreAllMocks();
    });

    it('should detect React hooks', () => {
      // Mock random to ensure pattern weight check passes
      jest.spyOn(Math, 'random').mockReturnValue(0);

      const matches = detector.detectInLine(
        'const [count, setCount] = useState(0);',
        1,
        'Component.tsx'
      );

      const reactMatch = matches.find(m => m.pattern === 'react');
      expect(reactMatch).toBeDefined();
      expect(reactMatch?.matchedText).toBe('useState');

      jest.restoreAllMocks();
    });

    it('should filter by file type', () => {
      // CSS patterns should not match in JS files
      const matches = detector.detectInLine(
        'display: flex;',
        1,
        'example.js'
      );

      const cssModernMatch = matches.find(m => m.pattern === 'css_modern');
      expect(cssModernMatch).toBeUndefined();
    });

    it('should match CSS patterns in CSS files', () => {
      const matches = detector.detectInLine(
        'display: flex;',
        1,
        'styles.css'
      );

      const cssModernMatch = matches.find(m => m.pattern === 'css_modern');
      expect(cssModernMatch).toBeDefined();
    });

    it('should return empty array for lines with no patterns', () => {
      // Force deterministic behavior by mocking Math.random
      jest.spyOn(Math, 'random').mockReturnValue(0);

      const matches = detector.detectInLine(
        '// just a comment with no patterns',
        1,
        'example.txt'
      );

      // Most patterns won't match this simple comment
      // Filter to just patterns that aren't catch-all
      const nonGenericMatches = matches.filter(m => m.pattern !== 'any_change' && m.pattern !== 'comments');
      expect(nonGenericMatches.length).toBe(0);

      jest.restoreAllMocks();
    });
  });

  describe('detectInLines', () => {
    it('should detect patterns across multiple lines', () => {
      const lines = [
        'import React from "react";',
        'const App = () => {',
        '  const [state, setState] = useState(0);',
        '  return <div>{state}</div>;',
        '};',
      ];

      const results = detector.detectInLines(lines, 'App.tsx');

      // Should have matches on multiple lines
      expect(results.size).toBeGreaterThan(0);
    });

    it('should use 1-based line numbers', () => {
      const lines = ['const x = 1;', 'const y = 2;'];
      const results = detector.detectInLines(lines, 'example.js');

      // Line numbers should start at 1, not 0
      const lineNumbers = Array.from(results.keys());
      expect(lineNumbers.every(n => n >= 1)).toBe(true);
    });
  });

  describe('getTriggeredPersonas', () => {
    it('should collect unique personas from matches', () => {
      const matches = detector.detectInLine(
        'async function fetchData() { await fetch(url); }',
        1,
        'api.ts'
      );

      const personas = detector.getTriggeredPersonas(matches);

      // Should include personas from both async and fetch patterns
      expect(personas).toContain('dinosaur');
      expect(personas).toContain('security_theater');

      // Should not have duplicates
      expect(new Set(personas).size).toBe(personas.length);
    });
  });

  describe('parseDiff', () => {
    it('should parse unified diff format', () => {
      const patch = `@@ -1,3 +1,4 @@
 const x = 1;
+const y = 2;
 const z = 3;
+const w = 4;`;

      const changes = detector.parseDiff(patch);

      // Should have 2 additions
      const additions = changes.filter(c => c.isAddition);
      expect(additions.length).toBe(2);
      expect(additions[0].content).toBe('const y = 2;');
      expect(additions[1].content).toBe('const w = 4;');
    });

    it('should track correct line numbers', () => {
      const patch = `@@ -0,0 +1,3 @@
+line 1
+line 2
+line 3`;

      const changes = detector.parseDiff(patch);

      expect(changes[0].lineNumber).toBe(1);
      expect(changes[1].lineNumber).toBe(2);
      expect(changes[2].lineNumber).toBe(3);
    });

    it('should handle deletions without incrementing line number', () => {
      const patch = `@@ -1,3 +1,2 @@
-removed line
 kept line
 another kept`;

      const changes = detector.parseDiff(patch);

      const deletion = changes.find(c => !c.isAddition);
      expect(deletion).toBeDefined();
      expect(deletion?.content).toBe('removed line');
    });
  });
});

describe('patterns', () => {
  it('should have valid regex for all patterns', () => {
    for (const [name, pattern] of Object.entries(patterns)) {
      expect(() => new RegExp(pattern.regex)).not.toThrow();
    }
  });

  it('should have triggersPersonas for all patterns', () => {
    for (const [name, pattern] of Object.entries(patterns)) {
      expect(pattern.triggersPersonas.length).toBeGreaterThan(0);
    }
  });
});

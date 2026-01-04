"use strict";
/**
 * Demo script to test Awful Code Review locally
 * Run with: npx ts-node src/demo.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
const generator_1 = require("./generator");
const detector_1 = require("./detector");
// Sample code to review (intentionally triggering multiple personas)
const sampleCode = `
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch(\`/api/users/\${userId}\`);
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [userId]);

  if (loading) return <div style={{ color: '#3498db' }}>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="user-profile">
      <h1>{user.name}</h1>
      <p>{user.email !== null ? user.email : 'No email'}</p>
      <button onClick={() => alert('Hello!')}>
        Say Hello
      </button>
    </div>
  );
};

export default UserProfile;
`;
// CSS sample
const sampleCSS = `
.user-profile {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  border-radius: 8px;
}

.user-profile h1 {
  color: #ffffff;
  font-size: 24px;
}

.user-profile button {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
}
`;
function simulateFileAnalysis(filename, code) {
    const detector = new detector_1.PatternDetector();
    const lines = code.split('\n');
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    const analyzedLines = lines.map((content, index) => {
        const lineNumber = index + 1;
        return {
            lineNumber,
            content,
            isAddition: true, // Pretend everything is new
            patterns: detector.detectInLine(content, lineNumber, filename),
        };
    });
    return {
        filename,
        extension,
        lines: analyzedLines,
    };
}
function main() {
    console.log('🎭 AWFUL CODE REVIEW DEMO');
    console.log('='.repeat(60));
    console.log('\n');
    const generator = new generator_1.CommentGenerator({
        chaosLevel: 0.9, // High chaos for demo
        maxCommentsTotal: 20,
        helpfulAccidentRate: 0.3,
    });
    // Analyze our sample files
    const jsxFile = simulateFileAnalysis('UserProfile.jsx', sampleCode);
    const cssFile = simulateFileAnalysis('UserProfile.css', sampleCSS);
    console.log('📁 Analyzing UserProfile.jsx...');
    console.log(`   Found ${jsxFile.lines.filter(l => l.patterns.length > 0).length} lines with triggering patterns\n`);
    console.log('📁 Analyzing UserProfile.css...');
    console.log(`   Found ${cssFile.lines.filter(l => l.patterns.length > 0).length} lines with triggering patterns\n`);
    // Generate the review
    console.log('🎲 Generating terrible review...\n');
    const review = generator.composeReview([jsxFile, cssFile]);
    // Display results
    console.log('='.repeat(60));
    console.log('REVIEW SUMMARY');
    console.log('='.repeat(60));
    console.log(`\nAction: ${review.action}`);
    console.log(`Summary: ${review.summary}`);
    console.log(`Comments: ${review.comments.length}`);
    console.log(`Contradictions: ${review.contradictionCount}`);
    console.log('\n');
    console.log('-'.repeat(60));
    console.log('COMMENTS');
    console.log('-'.repeat(60));
    for (const comment of review.comments) {
        console.log(`\n📍 ${comment.path}:${comment.line}`);
        console.log(`👤 Persona: ${comment.persona}`);
        console.log(`💬 ${comment.body}`);
        if (comment.tags.length > 0) {
            console.log(`🏷️  Tags: ${comment.tags.join(', ')}`);
        }
    }
    console.log('\n');
    console.log('='.repeat(60));
    console.log('END OF AWFUL REVIEW');
    console.log('='.repeat(60));
    // Show some statistics
    console.log('\n📊 PERSONA DISTRIBUTION:');
    const personaCounts = {};
    for (const comment of review.comments) {
        personaCounts[comment.persona] = (personaCounts[comment.persona] || 0) + 1;
    }
    for (const [persona, count] of Object.entries(personaCounts).sort((a, b) => b[1] - a[1])) {
        console.log(`   ${persona}: ${count}`);
    }
}
main();
//# sourceMappingURL=demo.js.map
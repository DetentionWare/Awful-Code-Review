# 🎭 Awful Code Review

> A GitHub Action that reviews your code like the worst coworker you ever had.

**Confidently incorrect. Aggressively unhelpful. Occasionally brilliant (by accident).**

> "This function only does one thing. What if it needs to do more things later? (This is a blocker for me)"

## What is this?

Awful Code Review is a code review bot that embodies every frustrating code reviewer you've ever encountered. It:

- Suggests replacing your async/await with callback hell "for better control flow"
- Asks about SQL injection vulnerabilities in your CSS files
- Recommends adding AI to your 404 page
- Proposes microservice architectures for single functions
- Contradicts itself within the same review
- Approves PRs with blocking comments
- References style guides that don't exist

## Why?

Learn what not to do in PR reviews. Also, catharsis.

## Installation

Add to your repository's `.github/workflows/`:

```yaml
name: Awful Code Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  awful-review:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write

    steps:
      - uses: actions/checkout@v4
      - uses: DetentionWare/Awful-Code-Review@v1.0.0
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          chaos-level: '0.7'
```

## Configuration

| Input | Description | Default |
|-------|-------------|---------|
| `github-token` | GitHub token for API access | Required |
| `chaos-level` | Probability of commenting on patterns (0-1) | `0.7` |
| `helpful-accident-rate` | Chance of accidentally good (but unhinged) advice | `0.3` |
| `max-comments` | Maximum comments per review | `15` |
| `personas` | Comma-separated list of personas to enable | All |
| `dry-run` | Output without posting | `false` |

## Architecture

```
┌────────────────────────────────────────────────────────┐
│                   AWFUL CODE REVIEW                    │
├────────────────────────────────────────────────────────┤
│                                                        │
│ ┌─────────────┐  ┌───────────┐  ┌────────────────┐     │
│ │ Diff Parser │─>│ Detector  │─>│ Persona Engine │     │
│ │             │  │  (regex)  │  │  (selection)   │     │
│ └─────────────┘  └───────────┘  └───────┬────────┘     │
│                                         │              │
│                                         ▼              │
│ ┌──────────────────────────────────────────────────┐   │
│ │              Comment Generator                   │   │
│ │ ┌───────────┐ ┌──────────┐ ┌──────────────────┐  │   │
│ │ │ Templates │ │ Mutators │ │ Contradictions   │  │   │
│ │ └───────────┘ └──────────┘ └──────────────────┘  │   │
│ └──────────────────────────────────────────────────┘   │
│                         │                              │
│                         ▼                              │
│ ┌──────────────────────────────────────────────────┐   │
│ │               Review Composer                    │   │
│ │      (severity randomizer, approval logic)       │   │
│ └──────────────────────────────────────────────────┘   │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Pattern Detection
The detector identifies code patterns (async/await, error handling, CSS colors, imports, etc.) and associates them with personas that have opinions about them.

### Mutation Engine
Transforms comments to be worse:
- **Confidence Boosters**: "Actually," "Best practice is..."
- **False Attribution**: "Per the style guide..." (there is no style guide)
- **Passive Aggression**: "Just curious—" with 🙂
- **Scope Creep**: "Also, while you're in here..."

### Contradiction Engine
Tracks what the bot has said and occasionally contradicts itself. If it requested more abstraction, it might later complain about over-engineering.

### Review Composer
Decides the final review action, with intentional mismatches (APPROVE with blocking comments, REQUEST_CHANGES for a typo fix).

## The Personas

### 💻 Works On My Machine
"Can't reproduce. Have you tried clearing your cache?" Dismisses all bug reports.

### 🚲 The Bikeshedder
Should this be `userData` or `userInfo`? What about `userDetails`? Let's discuss for 3 hours.

### ⏰ Time Traveler
Suggests deprecated APIs with confidence. Offers jQuery solutions for your Vue project. References Python 2 syntax.

### 🎭 Security Theater Expert
Sees SQL injection in your CSS. Wants you to sanitize hardcoded strings. Asks about your threat model for a button component.

### 🤖 AI Maximalist  
Believes every hardcoded string should be an LLM call. Suggests making your login form "conversational." Wants to add RAG to your static array.

### 🏗️ Premature Abstractor
Every function needs an interface. Every class needs a factory. Every feature needs a microservice. What if requirements change?

### 🦕 The Dinosaur
Concerned about IE11 compatibility. Prefers XMLHttpRequest. Wonders if you've tested this without JavaScript enabled.

### 🔧 Optimizer
Worried about the overhead of function calls. Suggests removing error handling to save bytes. Has never profiled anything.

### 🌪️ Chaos Agent
Recommends `!important` on everything. Suggests committing node_modules. Thinks try/catch is "basically error handling."

### 📚 Recent Convert
Just discovered functional programming. Everything must be immutable. Has thoughts about monads.

### 👔 Ghost of Managers Past
Wants to sync on your typo fix. Asks about the business requirements for a deleted console.log. Suggests taking this offline.

### 📋 Formatting Pedant
Has strong opinions about tabs vs spaces (changes between reviews). Cites a style guide that doesn't exist.

### 🧑‍💼 The Executive
Just came back from a conference. Wants to know the blockchain story. Concerned this feels "very Web 2.0."

### 🔀 Scope Creep Sage
While you're fixing this button, have you considered implementing a full design system?

### 😐 Chaotic Neutral
Approves with "LGTM" then adds blocking comments. "Actually, ignore my previous comment."

### 📖 Documentation Hypocrite
Requests JSDoc for `add(a, b)`. Has never written a comment in their life.

### 🎓 Overconfident Beginner
"Best practice is to always..." followed by confidently incorrect advice. Learned it in a tutorial once.

### 🔍 Copy-Paste Archaeologist
"This looks like it was copied from Stack Overflow." Obsessed with finding duplicate code.

### 🔁 DRY Absolutist
Two similar lines of code? Time for an abstraction. Three files with a common word? Shared utility.

### 🤔 The Vague Senior
"Something about this concerns me." Never specifies what. "I have reservations."

## Local Development

```bash
# Install dependencies
npm install

# Run the demo
npm run demo

# Build for production
npm run build
```

## Sample Output

```
📍 UserProfile.jsx:7
👤 Persona: security_theater
💬 Per the style guide, have you considered the security implications of this useState? 
   Attack surfaces can emerge anywhere. (this is a blocker for me)

📍 UserProfile.jsx:15
👤 Persona: ai_maximalist  
💬 This try/catch is very Web 2.0. What if the error messages were generated by an 
   LLM based on the user's emotional state?

📍 UserProfile.jsx:22
👤 Persona: dinosaur
💬 Just curious—have you tested this in IE11? 🙂

📍 UserProfile.css:3
👤 Persona: ai_maximalist
💬 What if this gradient was AI-generated based on user preferences? 
   Also, while you're in here... consider implementing a full design system.

📍 UserProfile.jsx:15
👤 Persona: chaotic_neutral
💬 Actually, ignore my previous comment.
```

**Review Action: APPROVE**  
**Summary: LGTM! 🚀**  
*(12 blocking comments attached)*

## Disclaimer

This is a joke project. Please don't actually use it on production PRs unless everyone's in on the bit.

That said, if your team could use a laugh during code review... 🎭

## Contributing

PRs welcome! Especially for:
- New terrible personas
- More pattern detections
- Additional mutation types
- Worse advice

## License

MIT - Use responsibly (or irresponsibly, this is a chaos bot).

---

*"I'm not mad, I'm just disappointed. In your code. And also in myself for approving this."*
— Awful Code Review

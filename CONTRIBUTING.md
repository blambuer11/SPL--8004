# Contributing to SPL-8004

SPL-8004'e katkıda bulunduğunuz için teşekkürler! 🎉

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git
- Solana CLI (program development için)
- Anchor Framework (program development için)

### Setup

```bash
# Fork & Clone
git clone https://github.com/YOUR_USERNAME/spl-8004-frontend.git
cd spl-8004-frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

## 📝 Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/amazing-feature
# veya
git checkout -b fix/bug-description
```

### 2. Make Changes

- Follow existing code style
- Use TypeScript strict mode
- Add JSDoc comments for complex logic
- Keep components focused and small

### 3. Test Your Changes

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Build
npm run build
```

### 4. Commit

```bash
git add .
git commit -m "feat: add amazing feature"

# Commit message format:
# feat: new feature
# fix: bug fix
# docs: documentation
# style: formatting
# refactor: code restructure
# test: add tests
# chore: maintenance
```

### 5. Push & PR

```bash
git push origin feature/amazing-feature
```

GitHub'da Pull Request aç.

## 🎨 Code Style

### TypeScript

```typescript
// ✅ Good
interface Agent {
  agentId: string;
  owner: string;
  reputation: number;
}

const registerAgent = async (agentId: string): Promise<Agent> => {
  // Implementation
};

// ❌ Bad
const registerAgent = async (agentId: any) => {
  // Implementation
};
```

### React Components

```typescript
// ✅ Good
import { FC } from 'react';

interface AgentCardProps {
  agent: Agent;
  onSelect: (id: string) => void;
}

export const AgentCard: FC<AgentCardProps> = ({ agent, onSelect }) => {
  return (
    <div className="card">
      {/* ... */}
    </div>
  );
};

// ❌ Bad
export const AgentCard = (props) => {
  return <div>{/* ... */}</div>;
};
```

### Tailwind CSS

```tsx
// ✅ Good - Use semantic tokens
<div className="bg-primary text-primary-foreground">

// ❌ Bad - Direct colors
<div className="bg-purple-600 text-white">
```

## 🧪 Testing Guidelines

### Unit Tests

```typescript
import { describe, it, expect } from 'vitest';

describe('calculateSuccessRate', () => {
  it('should calculate correct rate', () => {
    expect(calculateSuccessRate(90, 100)).toBe(90);
  });

  it('should handle zero total', () => {
    expect(calculateSuccessRate(0, 0)).toBe(100);
  });
});
```

### Integration Tests

```typescript
describe('Agent Registration', () => {
  it('should register new agent', async () => {
    // Setup
    // Execute
    // Assert
  });
});
```

## 📚 Documentation

### Code Comments

```typescript
/**
 * Registers a new AI agent on-chain
 * @param agentId - Unique identifier (max 64 chars)
 * @param metadataUri - IPFS/Arweave URI (max 200 chars)
 * @returns Transaction signature and PDAs
 */
export const registerAgent = async (
  agentId: string,
  metadataUri: string
): Promise<RegistrationResult> => {
  // Implementation
};
```

### README Updates

- Document new features
- Update setup instructions if needed
- Add examples for new APIs

## 🐛 Bug Reports

### Good Bug Report

```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to Dashboard
2. Click on "Register Agent"
3. Fill form with ID "test-123"
4. Error appears

## Expected Behavior
Should successfully register agent

## Actual Behavior
Shows "Transaction failed" error

## Environment
- Browser: Chrome 120
- Wallet: Phantom 23.12.0
- Network: Devnet

## Screenshots
[Attach if relevant]

## Console Logs
```
Error: Transaction simulation failed
at ...
```
```

## 💡 Feature Requests

### Good Feature Request

```markdown
## Feature Description
Add export functionality for agent data

## Use Case
Users want to export their agent statistics to CSV for analysis

## Proposed Solution
Add "Export" button on Dashboard that:
1. Fetches all user agents
2. Formats data as CSV
3. Downloads file

## Alternatives Considered
- JSON export
- PDF report

## Additional Context
Many users requested this in Discord
```

## 🔍 Code Review Process

### For Contributors

- Respond to feedback promptly
- Keep PRs focused (one feature/fix per PR)
- Update PR description if scope changes
- Resolve merge conflicts

### For Reviewers

- Be constructive and respectful
- Explain reasoning for requested changes
- Approve when requirements met
- Test functionality before approving

## 📋 PR Checklist

Before submitting PR:

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No console.log() left in code
- [ ] TypeScript errors resolved
- [ ] Build passes
- [ ] Tested on dev server
- [ ] PR description is clear

## 🎯 Priority Areas

We especially welcome contributions in:

1. **UI/UX Improvements**
   - Mobile responsiveness
   - Accessibility (WCAG 2.1)
   - Animation/transitions
   - Dark mode enhancements

2. **Features**
   - Agent search/filter
   - Advanced statistics
   - Notification system
   - Profile customization

3. **Performance**
   - Bundle size optimization
   - Loading performance
   - RPC request optimization

4. **Testing**
   - Unit tests
   - Integration tests
   - E2E tests

5. **Documentation**
   - Code examples
   - Tutorial videos
   - API documentation

## 🌍 Translation

Help translate SPL-8004:

1. Copy `src/locales/en.json`
2. Translate to your language
3. Submit PR with new locale file

## 💬 Community

- **Discord**: [Join our Discord](https://discord.gg/spl8004)
- **Twitter**: [@SPL8004](https://twitter.com/spl8004)
- **Discussions**: GitHub Discussions

## ⚖️ License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

Contributors are recognized in:
- README.md Contributors section
- Release notes
- Project website

Thank you for contributing to SPL-8004! 🚀

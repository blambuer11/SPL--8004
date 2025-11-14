# Contributing to Noema Protocol 🤝

Thank you for your interest in contributing to Noema Protocol! This document provides guidelines and instructions for contributing to our projects.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Community](#community)

---

## 📜 Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm/yarn/bun
- **Rust** 1.70+ and Cargo
- **Solana CLI** 1.16+
- **Anchor** 0.28+
- **Git** for version control

### Setting Up Development Environment

```bash
# Clone the repository
git clone https://github.com/NoemaProtocol/SPL--8004.git
cd SPL--8004

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test
```

### For Solana Programs

```bash
# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Install Anchor
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest

# Build programs
anchor build

# Run tests
anchor test
```

---

## 🔄 Development Workflow

### 1. Fork and Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/REPOSITORY_NAME.git
cd REPOSITORY_NAME

# Add upstream remote
git remote add upstream https://github.com/NoemaProtocol/REPOSITORY_NAME.git
```

### 2. Create a Branch

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/issue-description
```

**Branch Naming Convention:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Adding or updating tests
- `chore/` - Maintenance tasks

### 3. Make Changes

- Write clean, readable code
- Follow our coding standards
- Add tests for new features
- Update documentation as needed
- Commit frequently with clear messages

### 4. Commit Messages

Follow conventional commit format:

```bash
# Format: <type>(<scope>): <subject>

git commit -m "feat(payments): add X402 instant payment support"
git commit -m "fix(staking): resolve cooldown period calculation"
git commit -m "docs(api): update endpoint documentation"
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

### 5. Keep Branch Updated

```bash
# Fetch latest changes
git fetch upstream

# Rebase your branch
git rebase upstream/main

# Or merge if preferred
git merge upstream/main
```

### 6. Push Changes

```bash
git push origin feature/your-feature-name
```

---

## 📝 Pull Request Process

### Before Submitting

- ✅ Run all tests (`npm test` or `anchor test`)
- ✅ Run linter (`npm run lint`)
- ✅ Update documentation
- ✅ Add/update tests for changes
- ✅ Ensure no merge conflicts
- ✅ Rebase on latest main branch

### Submitting a PR

1. **Go to the repository on GitHub**
2. **Click "New Pull Request"**
3. **Select your branch**
4. **Fill out the PR template:**

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Related Issues
Fixes #123
Related to #456

## Screenshots (if applicable)
[Add screenshots here]

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated
```

### Review Process

1. **Automated Checks**
   - CI/CD pipeline runs tests
   - Linting and formatting checks
   - Build verification

2. **Code Review**
   - At least one maintainer approval required
   - Address review comments
   - Make requested changes

3. **Approval & Merge**
   - Squash and merge (preferred)
   - Merge commit (for large features)
   - Rebase and merge (for clean history)

---

## 💻 Coding Standards

### TypeScript/JavaScript

```typescript
// Use TypeScript for type safety
interface AgentData {
  agentId: string;
  reputation: number;
  metadata: string;
}

// Use async/await instead of callbacks
async function registerAgent(data: AgentData): Promise<void> {
  try {
    await client.register(data);
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
}

// Use meaningful variable names
const isValidAgent = checkAgentValidity(agentId);
const totalStakedAmount = calculateTotalStake();
```

### Rust (Anchor Programs)

```rust
// Use descriptive function names
pub fn stake_validator(ctx: Context<StakeValidator>, amount: u64) -> Result<()> {
    // Validate inputs
    require!(amount >= MIN_STAKE, ErrorCode::InsufficientStake);
    
    // Clear error messages
    msg!("Staking {} NOEMA tokens", amount);
    
    // Update state
    let validator = &mut ctx.accounts.validator;
    validator.staked_amount = validator
        .staked_amount
        .checked_add(amount)
        .ok_or(ErrorCode::MathOverflow)?;
    
    Ok(())
}

// Document complex logic
/// Calculates rewards based on APY and time staked
/// 
/// # Arguments
/// * `staked_amount` - Amount of NOEMA staked
/// * `duration_seconds` - Time staked in seconds
/// 
/// # Returns
/// Reward amount in lamports
fn calculate_rewards(staked_amount: u64, duration_seconds: i64) -> u64 {
    // Implementation
}
```

### General Guidelines

- **DRY (Don't Repeat Yourself)**: Extract common logic
- **KISS (Keep It Simple)**: Prefer simple solutions
- **Comments**: Explain *why*, not *what*
- **Error Handling**: Always handle errors gracefully
- **Security**: Validate all inputs, especially in smart contracts

---

## 🧪 Testing Guidelines

### Unit Tests

```typescript
// Test individual functions
describe('AgentRegistry', () => {
  it('should register a new agent', async () => {
    const agentId = 'test-agent-001';
    await registry.register(agentId);
    
    const agent = await registry.getAgent(agentId);
    expect(agent).toBeDefined();
    expect(agent.agentId).toBe(agentId);
  });
  
  it('should reject duplicate agent IDs', async () => {
    const agentId = 'test-agent-001';
    await registry.register(agentId);
    
    await expect(registry.register(agentId))
      .rejects
      .toThrow('Agent already exists');
  });
});
```

### Integration Tests (Anchor)

```rust
#[tokio::test]
async fn test_stake_and_unstake() {
    // Setup
    let mut program_test = ProgramTest::new(
        "spl_8004",
        id(),
        processor!(process_instruction),
    );
    
    // Execute
    let (mut banks_client, payer, recent_blockhash) = 
        program_test.start().await;
    
    // Stake
    let stake_tx = Transaction::new_signed_with_payer(
        &[stake_instruction(amount)],
        Some(&payer.pubkey()),
        &[&payer],
        recent_blockhash,
    );
    banks_client.process_transaction(stake_tx).await.unwrap();
    
    // Verify
    let validator_account = banks_client
        .get_account(validator_pda)
        .await
        .unwrap()
        .unwrap();
    
    let validator = Validator::try_deserialize(&mut &validator_account.data[..]).unwrap();
    assert_eq!(validator.staked_amount, amount);
}
```

### Test Coverage

- Aim for **80%+ coverage** for critical paths
- Test edge cases and error conditions
- Test security vulnerabilities
- Test performance for critical operations

---

## 📖 Documentation

### Code Documentation

```typescript
/**
 * Registers a new AI agent on-chain
 * 
 * @param agentId - Unique identifier for the agent
 * @param metadataUri - IPFS URI containing agent metadata
 * @returns Transaction signature
 * @throws {Error} If agent ID already exists
 * @throws {Error} If wallet is not connected
 * 
 * @example
 * ```typescript
 * const signature = await registerAgent({
 *   agentId: 'my-ai-agent',
 *   metadataUri: 'ipfs://QmXX...'
 * });
 * ```
 */
async function registerAgent(params: RegisterParams): Promise<string> {
  // Implementation
}
```

### README Updates

- Update README.md for significant changes
- Include examples for new features
- Update API documentation
- Add screenshots for UI changes

### Changelog

Update CHANGELOG.md following [Keep a Changelog](https://keepachangelog.com/) format:

```markdown
## [1.2.0] - 2025-01-15

### Added
- X402 instant payment support
- Reputation decay mechanism

### Changed
- Increased minimum stake to 100 NOEMA
- Improved error messages

### Fixed
- Cooldown period calculation bug
- Memory leak in validator loop

### Security
- Fixed reentrancy vulnerability in unstake
```

---

## 🏆 Recognition

Contributors who make significant contributions will be:

- 🌟 Added to CONTRIBUTORS.md
- 🎖️ Acknowledged in release notes
- 💎 Eligible for NOEMA token rewards (future)
- 🎁 Invited to exclusive contributor events

---

## 💬 Community

### Communication Channels

- **GitHub Discussions**: Questions and general discussion
- **Discord**: Real-time chat and community support
- **Twitter**: Announcements and updates
- **Email**: contact@noemaprotocol.xyz

### Getting Help

1. Check existing documentation
2. Search GitHub issues
3. Ask in Discord
4. Create a new issue with detailed information

### Reporting Security Issues

**DO NOT** create public issues for security vulnerabilities.

Email security@noemaprotocol.xyz with:
- Detailed description
- Steps to reproduce
- Potential impact
- Suggested fix (optional)

We'll respond within 48 hours.

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## 🙏 Thank You!

Every contribution, no matter how small, helps make Noema Protocol better for everyone. Thank you for being part of our community!

---

<div align="center">

**Questions?** Open an issue or join our [Discord](https://discord.gg/noemaprotocol)

**Happy Contributing! 🚀**

</div>

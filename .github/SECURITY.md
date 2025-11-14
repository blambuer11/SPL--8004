# Security Policy

## 🔒 Reporting a Vulnerability

The Noema Protocol team takes security seriously. We appreciate your efforts to responsibly disclose your findings.

### 📧 How to Report

**Please DO NOT create public GitHub issues for security vulnerabilities.**

Instead, email us at: **security@noemaprotocol.xyz**

Include:
- **Description**: Detailed explanation of the vulnerability
- **Impact**: Potential consequences if exploited
- **Steps to Reproduce**: Clear instructions to replicate the issue
- **Proof of Concept**: Code or screenshots (optional but helpful)
- **Suggested Fix**: Your ideas for remediation (optional)
- **Your Contact**: Email and/or Discord handle for follow-up

### ⏱️ Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Varies based on severity
  - Critical: 1-7 days
  - High: 7-14 days
  - Medium: 14-30 days
  - Low: 30-90 days

### 🎁 Reward Program

We offer bounties for valid security reports:

| Severity | Reward |
|----------|--------|
| 🔴 Critical | 500-2,000 NOEMA |
| 🟠 High | 200-500 NOEMA |
| 🟡 Medium | 50-200 NOEMA |
| 🟢 Low | 10-50 NOEMA |

*Rewards are determined by severity, impact, and quality of the report.*

---

## 🛡️ Supported Versions

| Version | Supported |
|---------|-----------|
| 1.x.x (Latest) | ✅ |
| 0.9.x | ✅ |
| < 0.9.0 | ❌ |

---

## 🔍 Security Best Practices

### For Smart Contracts

#### ✅ DO:
- Validate all inputs
- Use `require!()` for preconditions
- Implement proper access control
- Check for arithmetic overflow/underflow
- Use checked math operations
- Verify PDA derivations
- Validate signer accounts

```rust
// Good: Input validation
require!(amount > 0, ErrorCode::InvalidAmount);
require!(amount <= MAX_AMOUNT, ErrorCode::AmountTooLarge);

// Good: Checked math
let new_balance = balance
    .checked_add(amount)
    .ok_or(ErrorCode::Overflow)?;
```

#### ❌ DON'T:
- Trust user inputs blindly
- Use unchecked math
- Expose admin functions publicly
- Hardcode sensitive data
- Skip validation checks

```rust
// Bad: No validation
let new_balance = balance + amount; // Can overflow!

// Bad: No access control
pub fn update_config(ctx: Context<UpdateConfig>) { ... }
```

### For Frontend

#### ✅ DO:
- Sanitize user inputs
- Use HTTPS everywhere
- Implement CORS properly
- Validate wallet signatures
- Use environment variables for secrets
- Implement rate limiting
- Log security events

```typescript
// Good: Input sanitization
const sanitizedInput = DOMPurify.sanitize(userInput);

// Good: Wallet verification
const isValid = await verifySignature(message, signature, publicKey);
if (!isValid) throw new Error('Invalid signature');
```

#### ❌ DON'T:
- Store private keys in code
- Trust client-side validation alone
- Expose API keys in frontend
- Allow unlimited API calls
- Use eval() or innerHTML

```typescript
// Bad: Hardcoded secrets
const API_KEY = 'sk_live_...'; // Never do this!

// Bad: Unsafe HTML insertion
element.innerHTML = userInput; // XSS vulnerability!
```

### For Backend/API

#### ✅ DO:
- Use HTTPS/TLS
- Implement authentication
- Rate limit requests
- Validate inputs server-side
- Use prepared statements
- Log security events
- Implement CSRF protection

```typescript
// Good: Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// Good: Input validation
const schema = z.object({
  agentId: z.string().min(1).max(50),
  amount: z.number().positive()
});
```

#### ❌ DON'T:
- Expose stack traces
- Use default credentials
- Trust headers blindly
- Skip input validation
- Log sensitive data

```typescript
// Bad: Exposing errors
res.status(500).json({ error: error.stack }); // Leaks info!

// Bad: No validation
const agentId = req.body.agentId; // Trust nothing!
```

---

## 🚨 Known Security Considerations

### Smart Contracts

1. **Reentrancy**: All transfer functions use checked transfers
2. **Integer Overflow**: Using checked math operations throughout
3. **Access Control**: Role-based permissions on admin functions
4. **PDA Validation**: All PDAs verified before use
5. **Signer Verification**: Required for state-changing operations

### Frontend

1. **XSS Protection**: DOMPurify for user input sanitization
2. **CSRF**: CSRF tokens on state-changing requests
3. **Wallet Security**: Never storing private keys
4. **RPC Security**: Using reputable RPC endpoints

### Infrastructure

1. **DDoS Protection**: Cloudflare protection enabled
2. **Rate Limiting**: API endpoints rate limited
3. **Monitoring**: Real-time security monitoring
4. **Backups**: Regular encrypted backups

---

## 📜 Security Audit History

| Date | Auditor | Scope | Report |
|------|---------|-------|--------|
| TBD | TBD | SPL-8004 Contract | Coming Soon |
| TBD | TBD | X402 Protocol | Coming Soon |

---

## 🔐 Cryptographic Standards

- **Hashing**: SHA-256
- **Signatures**: Ed25519 (Solana standard)
- **Encryption**: AES-256-GCM
- **Key Derivation**: PBKDF2

---

## 📚 Security Resources

- [Solana Security Best Practices](https://docs.solana.com/developing/programming-model/overview)
- [Anchor Security Guidelines](https://www.anchor-lang.com/docs/security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE Top 25](https://cwe.mitre.org/top25/)

---

## 🙏 Acknowledgments

We thank the following researchers for responsible disclosure:

*List will be updated as reports are received and resolved.*

---

## 📞 Contact

- **Security Email**: security@noemaprotocol.xyz
- **General Contact**: contact@noemaprotocol.xyz
- **Discord**: [Join Server](https://discord.gg/noemaprotocol)

---

**Thank you for helping keep Noema Protocol secure! 🙏**

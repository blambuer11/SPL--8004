# SPL-8004 Program

This directory contains the Anchor program implementing the SPL-8004: Trustless AI Agent Identity & Reputation Standard for Solana.

Quick links
- `programs/spl-8004/src/` — Rust source
- `DEPLOYMENT.md` — full deployment guide

Build (local)

```bash
# Ensure Solana CLI and Anchor (avm) are installed
solana --version
avm --version

# Build
cd <repo-root>/spl-8004-program/spl-8004
anchor build
```

Notes
- After deploy, update `declare_id!("<PROGRAM_ID>")` in `programs/spl-8004/src/lib.rs` and `Anchor.toml` entries.
- See `DEPLOYMENT.md` for full instructions.

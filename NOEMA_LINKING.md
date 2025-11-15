# NOEMA ↔ SPL-8004 Validator Linking

This document describes how a wallet's NOEMA validator account is cryptographically linked to its SPL-8004 validator account so that rights / reputation established under SPL-8004 can require NOEMA token stake.

## Overview
The `noema_link` Anchor program creates a `LinkAccount` PDA:
```
seeds = ["noema_link", authority]
```
Fields:
- `authority` (Pubkey): Wallet owner
- `noema_validator` (Pubkey): PDA from NOEMA staking program `["noema_validator", authority]`
- `spl_validator` (Pubkey): PDA from SPL-8004 program `["validator", authority]`
- `created_ts` (i64): Unix timestamp of link creation

Once created, on-chain logic in SPL-8004 can gate instructions (e.g. `claim_rewards`, future `register_agent`, etc.) by asserting that the link PDA exists and that the NOEMA validator holds minimum stake.

## Programs
- SPL-8004 Program ID: `FX7cpN56T49BT4HaMXsJcLgXRpQ54MHbsYmS3qDNzpGm`
- NOEMA Staking Program ID: `iMjAbTmAddZTzEtDcSgbDPJRRdc4eT6mGC9SnK3Gzy8`
- NOEMA Link Program ID (placeholder, replace after deployment): `NoemaLink1111111111111111111111111111111111`

Set `VITE_NOEMA_LINK_PROGRAM_ID` in `.env` for frontend usage.

## Frontend
`src/pages/app/Staking.tsx` now shows link status and a **Link Validators** button. It uses `link-client.ts` which:
- Derives PDAs for NOEMA validator, SPL-8004 validator, and link account.
- Calls the `link` instruction (no arguments).

## Scripts
Run link from CLI (uses local wallet):
```
npm run noema:link
```
This calls `scripts/noema-link.ts` which performs:
1. Load wallet keypair.
2. Check if link PDA exists.
3. If absent, invoke `link` and print resulting account.

## Deployment Steps (Localnet)
1. Generate program keypair:
   ```
   solana-keygen new -o spl_8004/programs/noema_link/noema_link-keypair.json
   ```
2. Replace `declare_id!` in `noema_link/src/lib.rs` and Anchor.toml entries with generated pubkey.
3. Build:
   ```
   cd spl_8004 && anchor build
   ```
4. Deploy:
   ```
   anchor deploy
   ```
5. Update `.env` with final deployed program ID and rebuild frontend.

## Future Integration in SPL-8004
To enforce NOEMA stake for rights:
1. In SPL-8004 instructions that grant rewards or reputation, add an optional account for LinkAccount.
2. Require its seeds and ownership by `noema_link` program.
3. Fetch NOEMA validator account (CPI or client-side preflight) to ensure `stake_amount >= MIN_NOEMA_STAKE`.
4. If absent or insufficient, fail with `MissingNoemaStake` error.

### Planned Changes
- Add `LinkAccount` optional account to `claim_validator_rewards` in SPL-8004.
- Introduce `MIN_NOEMA_STAKE` constant in SPL-8004 config or separate parameter.
- Expose read-only endpoint/API to query combined reputation (SPL-8004 + NOEMA stake weight).

## Security Considerations
- Link is immutable (no update instruction). To revoke, user would need a `unlink` instruction (not yet implemented). Consider adding if necessary.
- Both validator PDAs are derived solely from `authority`; ownership check prevents spoofing.
- No cross-program invocation (CPI) is required for link creation; verification stays cheap.

## Edge Cases
- Attempting to link twice simply finds the existing PDA; frontend handles gracefully.
- If one of the validator accounts does not exist yet, link will fail; user must stake in each protocol first.
- Changing program IDs requires redeploy and environment variable update; stale frontend env will mis-derive PDAs.

## Next Steps Checklist
- [ ] Generate real program ID & deploy `noema_link`.
- [ ] Add SPL-8004 gating logic (read link PDA, verify NOEMA stake).
- [ ] Add metrics aggregation endpoint.
- [ ] Implement optional `unlink` instruction if revocation required.

---
Maintainer: Noema Protocol Engineering
Version: 0.1

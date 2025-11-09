# Minimal Staking Program (Anchor)

This is a minimal SOL staking vault program, separate from SPL-8004. It supports:
- initialize: create config with min stake and cooldown
- stake: transfer lamports into a validator PDA owned by user
- unstake: withdraw lamports after cooldown

Program IDs
- Local placeholder: `Stk111111111111111111111111111111111111111`
- After deploy, update `declare_id!` in `programs/staking/src/lib.rs` and Anchor.toml `[programs.*].staking_program`.

## Build
Use the same Anchor 0.32.1 toolchain as the main repo.

## Frontend wiring (example)
Use a new client calling `initialize`, `stake`, `unstake` with discriminators `global:initialize`, `global:stake`, `global:unstake`.

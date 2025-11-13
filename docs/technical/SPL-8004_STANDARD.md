# SPL-8004 Standard (Draft)

This document summarizes the SPL-8004 standard: Trustless AI Agent Identity & Reputation for Solana.

Specification (short)
- Identity Registry: PDA seeded by ["identity", agent_id]
- Reputation Registry: PDA seeded by ["reputation", identity_pda]
- Validation Registry: PDA seeded by ["validation", identity_pda, task_hash]
- Reward Pool: PDA seeded by ["reward_pool", identity_pda]

Account shapes
- IdentityRegistry: owner: Pubkey, agent_id: String(<=64), metadata_uri: String(<=200), created_at: i64, updated_at: i64, is_active: bool, bump: u8
- ReputationRegistry: agent: Pubkey, score: u64 (0-10000), total_tasks: u64, successful_tasks: u64, failed_tasks: u64, last_updated: i64, stake_amount: u64, bump: u8
- ValidationRegistry: agent: Pubkey, validator: Pubkey, task_hash: [u8;32], approved: bool, timestamp: i64, evidence_uri: String(<=200), bump: u8

Instruction summaries
- initialize_config(commission_rate: u16, treasury: Pubkey)
- register_agent(agent_id: String, metadata_uri: String)
- update_metadata(new_metadata_uri: String)
- submit_validation(task_hash: [u8;32], approved: bool, evidence_uri: String)
- update_reputation()
- deactivate_agent()
- claim_rewards()

Security & Access control
- Only owner may update metadata, deactivate agent, claim rewards.
- Any validator may submit validation.
- Commission collected on validation is transferred to treasury (config.treasury).

Reputation scoring (high level)
- On approved: score increases determined by success rate bands.
- On rejected: score decreases determined by success rate bands.
- Score bounded between 0 and 10000.

This file is a short summary — full spec and IDL live in the repository (`programs/spl-8004/src` and `target/idl`).

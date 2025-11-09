use anchor_lang::prelude::*;

pub const CONFIG_SEED: &str = "config";
pub const VALIDATOR_SEED: &str = "validator";

pub const DEFAULT_MIN_STAKE_LAMPORTS: u64 = 100_000_000; // 0.1 SOL
pub const DEFAULT_UNSTAKE_COOLDOWN: i64 = 7 * 24 * 60 * 60; // 7 days in seconds

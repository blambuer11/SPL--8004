use anchor_lang::prelude::*;

#[account]
pub struct Config {
    pub authority: Pubkey,
    pub min_stake: u64,
    pub unstake_cooldown: i64,
    pub bump: u8,
}

impl Config {
    pub const LEN: usize = 8 + 32 + 8 + 8 + 1;
}

#[account]
pub struct Validator {
    pub owner: Pubkey,
    pub staked_amount: u64,
    pub last_stake_ts: i64,
    pub bump: u8,
}

impl Validator {
    pub const LEN: usize = 8 + 32 + 8 + 8 + 1;
}

use anchor_lang::prelude::*;

pub mod state;
pub mod instructions;
pub mod constants;

use instructions::*;

// Geçici Program ID: deploy sonrası gerçek ID ile güncelleyin.
declare_id!("Fg6PaFpoGXkYsidMpWxqSWYg8GbZ7qkWpwfXFZVbA3Jk");

#[program]
pub mod staking {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, min_stake: Option<u64>, cooldown: Option<i64>) -> Result<()> {
        instructions::initialize::handler(ctx, min_stake, cooldown)
    }

    pub fn stake(ctx: Context<Stake>, amount: u64) -> Result<()> {
        instructions::stake::handler(ctx, amount)
    }

    pub fn unstake(ctx: Context<Unstake>, amount: u64) -> Result<()> {
        instructions::unstake::handler(ctx, amount)
    }
}

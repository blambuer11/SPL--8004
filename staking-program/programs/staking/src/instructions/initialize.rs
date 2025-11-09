use anchor_lang::prelude::*;
use crate::state::*;
use crate::constants::*;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = payer,
        seeds = [CONFIG_SEED.as_bytes()],
        bump,
        space = Config::LEN
    )]
    pub config: Account<'info, Config>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Initialize>, min_stake: Option<u64>, cooldown: Option<i64>) -> Result<()> {
    let bump = ctx.bumps.config;
    let cfg = &mut ctx.accounts.config;
    cfg.authority = ctx.accounts.payer.key();
    cfg.min_stake = min_stake.unwrap_or(DEFAULT_MIN_STAKE_LAMPORTS);
    cfg.unstake_cooldown = cooldown.unwrap_or(DEFAULT_UNSTAKE_COOLDOWN);
    cfg.bump = bump;
    Ok(())
}

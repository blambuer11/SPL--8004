use anchor_lang::prelude::*;
use crate::state::*;
use crate::constants::*;

#[derive(Accounts)]
pub struct Stake<'info> {
    #[account(mut)]
    pub config: Account<'info, Config>,
    #[account(
        init_if_needed,
        payer = staker,
        seeds = [VALIDATOR_SEED.as_bytes(), staker.key().as_ref()],
        bump,
        space = Validator::LEN
    )]
    pub validator: Account<'info, Validator>,
    #[account(mut)]
    pub staker: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Stake>, amount: u64) -> Result<()> {
    require!(amount > 0, StakingError::ZeroAmount);
    let cfg = &ctx.accounts.config;
    require!(amount >= cfg.min_stake, StakingError::BelowMinStake);

    // Transfer lamports from staker to validator PDA (vault)
    let ix = anchor_lang::solana_program::system_instruction::transfer(
        &ctx.accounts.staker.key(),
        &ctx.accounts.validator.key(),
        amount,
    );
    anchor_lang::solana_program::program::invoke(
        &ix,
        &[
            ctx.accounts.staker.to_account_info(),
            ctx.accounts.validator.to_account_info(),
        ],
    )?;

    let clock = Clock::get()?;
    let v = &mut ctx.accounts.validator;
    v.owner = ctx.accounts.staker.key();
    v.staked_amount = v.staked_amount.saturating_add(amount);
    v.last_stake_ts = clock.unix_timestamp;
    v.bump = ctx.bumps.validator;

    Ok(())
}

#[error_code]
pub enum StakingError {
    #[msg("Amount must be > 0")] ZeroAmount,
    #[msg("Amount is below minimum stake") ] BelowMinStake,
}

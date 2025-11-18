use anchor_lang::prelude::*;

use crate::constants::*;
use crate::state::Validator;
use crate::errors::SPL8004Error;

#[derive(Accounts)]
pub struct UnstakeValidator<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        mut,
        seeds = [VALIDATOR_SEED, user.key().as_ref()],
        bump = validator.bump,
        constraint = validator.authority == user.key() @ SPL8004Error::Unauthorized,
    )]
    pub validator: Account<'info, Validator>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<UnstakeValidator>, amount: u64) -> Result<()> {
    let validator = &mut ctx.accounts.validator;
    let clock = Clock::get()?;

    require!(amount <= validator.staked_amount, SPL8004Error::InsufficientStake);
    require!(
        clock.unix_timestamp >= validator.last_stake_timestamp + VALIDATOR_UNSTAKE_COOLDOWN,
        SPL8004Error::RewardClaimTooEarly
    );

    // Transfer lamports back to user
    **validator.to_account_info().try_borrow_mut_lamports()? -= amount;
    **ctx.accounts.user.to_account_info().try_borrow_mut_lamports()? += amount;

    validator.staked_amount = validator.staked_amount.saturating_sub(amount);
    if validator.staked_amount == 0 {
        validator.is_active = false;
    }

    msg!("✅ Validator unstaked {} lamports", amount);
    Ok(())
}

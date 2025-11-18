use anchor_lang::prelude::*;
use anchor_lang::system_program;

use crate::constants::*;
use crate::state::{GlobalConfig, Validator};
use crate::errors::SPL8004Error;

#[derive(Accounts)]
pub struct StakeValidator<'info> {
    #[account(
        mut,
        seeds = [CONFIG_SEED],
        bump = config.bump,
    )]
    pub config: Account<'info, GlobalConfig>,

    #[account(
        mut,
        seeds = [VALIDATOR_SEED, user.key().as_ref()],
        bump,
    )]
    pub validator: Account<'info, Validator>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<StakeValidator>, amount: u64) -> Result<()> {
    require!(amount >= VALIDATOR_MIN_STAKE, SPL8004Error::InsufficientStake);

    let validator = &mut ctx.accounts.validator;
    let user = &ctx.accounts.user;
    let clock = Clock::get()?;

    // Transfer SOL from user to validator account
    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: user.to_account_info(),
                to: validator.to_account_info(),
            },
        ),
        amount,
    )?;

    // Update validator state
    validator.staked_amount = validator.staked_amount.saturating_add(amount);
    validator.is_active = true;
    validator.last_stake_timestamp = clock.unix_timestamp;

    msg!("✅ Validator staked {} lamports", amount);
    Ok(())
}

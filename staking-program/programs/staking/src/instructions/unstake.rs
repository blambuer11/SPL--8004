use anchor_lang::prelude::*;
use crate::state::*;
use crate::constants::*;

#[derive(Accounts)]
pub struct Unstake<'info> {
    #[account(mut, seeds = [CONFIG_SEED.as_bytes()], bump = config.bump)]
    pub config: Account<'info, Config>,
    #[account(mut, seeds = [VALIDATOR_SEED.as_bytes(), staker.key().as_ref()], bump = validator.bump)]
    pub validator: Account<'info, Validator>,
    #[account(mut)]
    pub staker: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Unstake>, amount: u64) -> Result<()> {
    require!(amount > 0, StakingError::ZeroAmount);
    let clock = Clock::get()?;
    let cfg = &ctx.accounts.config;
    let v = &mut ctx.accounts.validator;
    require!(clock.unix_timestamp - v.last_stake_ts >= cfg.unstake_cooldown, StakingError::CooldownNotPassed);
    require!(v.staked_amount >= amount, StakingError::InsufficientStake);

    // Transfer out lamports back to staker
    **v.to_account_info().try_borrow_mut_lamports()? -= amount;
    **ctx.accounts.staker.to_account_info().try_borrow_mut_lamports()? += amount;

    v.staked_amount -= amount;
    Ok(())
}

#[error_code]
pub enum StakingError {
    #[msg("Amount must be > 0")] ZeroAmount,
    #[msg("Cooldown not passed yet")] CooldownNotPassed,
    #[msg("Insufficient staked balance")] InsufficientStake,
}

use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW");

#[program]
pub mod spl_8004 {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let config = &mut ctx.accounts.config;
        config.authority = ctx.accounts.authority.key();
        config.registration_fee = 5_000_000; // 0.005 SOL
        config.validation_fee = 1_000_000;   // 0.001 SOL
        config.validator_min_stake = 100_000_000; // 0.1 SOL
        Ok(())
    }

    pub fn stake_validator(ctx: Context<StakeValidator>, amount: u64) -> Result<()> {
        let config = &ctx.accounts.config;
        require!(amount >= config.validator_min_stake, ErrorCode::InsufficientStake);

        let validator = &mut ctx.accounts.validator;
        let clock = Clock::get()?;

        // Transfer SOL from user to validator PDA
        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.user.to_account_info(),
                    to: ctx.accounts.validator.to_account_info(),
                },
            ),
            amount,
        )?;

        // Initialize or update validator account
        validator.authority = ctx.accounts.user.key();
        validator.staked_amount = validator.staked_amount.checked_add(amount).unwrap();
        validator.is_active = true;
        validator.last_stake_timestamp = clock.unix_timestamp;
        validator.total_validations = 0;

        msg!("Validator staked {} lamports", amount);
        Ok(())
    }

    pub fn unstake_validator(ctx: Context<UnstakeValidator>, amount: u64) -> Result<()> {
        let validator = &mut ctx.accounts.validator;
        let clock = Clock::get()?;

        require!(validator.authority == ctx.accounts.user.key(), ErrorCode::Unauthorized);
        require!(amount <= validator.staked_amount, ErrorCode::InsufficientStake);

        // 7 days cooldown
        let cooldown_period = 7 * 24 * 60 * 60; // 7 days in seconds
        require!(
            clock.unix_timestamp >= validator.last_stake_timestamp + cooldown_period,
            ErrorCode::CooldownNotElapsed
        );

        // Transfer SOL back to user
        **validator.to_account_info().try_borrow_mut_lamports()? -= amount;
        **ctx.accounts.user.to_account_info().try_borrow_mut_lamports()? += amount;

        validator.staked_amount = validator.staked_amount.checked_sub(amount).unwrap();
        
        if validator.staked_amount == 0 {
            validator.is_active = false;
        }

        msg!("Validator unstaked {} lamports", amount);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Config::LEN,
        seeds = [b"config"],
        bump
    )]
    pub config: Account<'info, Config>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct StakeValidator<'info> {
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + Validator::LEN,
        seeds = [b"validator", user.key().as_ref()],
        bump
    )]
    pub validator: Account<'info, Validator>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(seeds = [b"config"], bump)]
    pub config: Account<'info, Config>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UnstakeValidator<'info> {
    #[account(
        mut,
        seeds = [b"validator", user.key().as_ref()],
        bump,
        has_one = authority
    )]
    pub validator: Account<'info, Validator>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Config {
    pub authority: Pubkey,
    pub registration_fee: u64,
    pub validation_fee: u64,
    pub validator_min_stake: u64,
}

impl Config {
    pub const LEN: usize = 32 + 8 + 8 + 8;
}

#[account]
pub struct Validator {
    pub authority: Pubkey,
    pub staked_amount: u64,
    pub is_active: bool,
    pub last_stake_timestamp: i64,
    pub total_validations: u64,
}

impl Validator {
    pub const LEN: usize = 32 + 8 + 1 + 8 + 8;
}

#[error_code]
pub enum ErrorCode {
    #[msg("Insufficient stake amount")]
    InsufficientStake,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Cooldown period has not elapsed")]
    CooldownNotElapsed,
}


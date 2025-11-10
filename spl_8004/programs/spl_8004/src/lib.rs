use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW");

#[program]
pub mod spl_8004 {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let config = &mut ctx.accounts.config;
        config.authority = ctx.accounts.authority.key();
        config.treasury = ctx.accounts.authority.key(); // Initial treasury = deployer
        config.registration_fee = 5_000_000; // 0.005 SOL
        config.validation_fee = 1_000_000;   // 0.001 SOL
        config.validator_min_stake = 100_000_000; // 0.1 SOL
        config.base_apy_bps = 500; // 5% base APY
        config.instant_unstake_fee_bps = 200; // 2% fee for instant unstake
        msg!("SPL-8004 config initialized");
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
        validator.last_reward_claim = clock.unix_timestamp;
        validator.total_validations = 0;
        validator.pending_rewards = 0;

        msg!("Validator staked {} lamports", amount);
        Ok(())
    }

    pub fn claim_validator_rewards(ctx: Context<ClaimValidatorRewards>) -> Result<()> {
        let validator = &mut ctx.accounts.validator;
        let clock = Clock::get()?;
        let config = &ctx.accounts.config;

        require!(validator.authority == ctx.accounts.user.key(), ErrorCode::Unauthorized);
        require!(validator.is_active, ErrorCode::ValidatorNotActive);

        // Calculate rewards: (staked_amount * base_apy_bps * time_elapsed) / (10000 * SECONDS_PER_YEAR)
        let time_elapsed = clock.unix_timestamp - validator.last_reward_claim;
        if time_elapsed > 0 {
            let seconds_per_year: i64 = 31_536_000;
            let annual_reward = (validator.staked_amount as u128)
                .checked_mul(config.base_apy_bps as u128)
                .unwrap() / 10_000;
            let reward = (annual_reward as u128)
                .checked_mul(time_elapsed as u128)
                .unwrap() / (seconds_per_year as u128);
            
            validator.pending_rewards = validator.pending_rewards.checked_add(reward as u64).unwrap();
        }

        let claimable = validator.pending_rewards;
        require!(claimable > 0, ErrorCode::NoRewardsToClaim);
        require!(validator.to_account_info().lamports() >= claimable, ErrorCode::InsufficientFunds);

        // Transfer rewards from validator PDA to user
        **validator.to_account_info().try_borrow_mut_lamports()? -= claimable;
        **ctx.accounts.user.to_account_info().try_borrow_mut_lamports()? += claimable;

        validator.pending_rewards = 0;
        validator.last_reward_claim = clock.unix_timestamp;

        msg!("Claimed {} lamports rewards", claimable);
        Ok(())
    }

    pub fn unstake_validator_instant(ctx: Context<UnstakeValidatorInstant>, amount: u64) -> Result<()> {
        let validator = &mut ctx.accounts.validator;
        let config = &ctx.accounts.config;

        require!(validator.authority == ctx.accounts.user.key(), ErrorCode::Unauthorized);
        require!(amount <= validator.staked_amount, ErrorCode::InsufficientStake);

        // Calculate instant unstake fee (2%)
        let fee = (amount as u128)
            .checked_mul(config.instant_unstake_fee_bps as u128)
            .unwrap() / 10_000;
        let amount_after_fee = amount.checked_sub(fee as u64).unwrap();

        // Transfer fee to treasury
        **validator.to_account_info().try_borrow_mut_lamports()? -= amount;
        **ctx.accounts.treasury.to_account_info().try_borrow_mut_lamports()? += fee as u64;
        **ctx.accounts.user.to_account_info().try_borrow_mut_lamports()? += amount_after_fee;

        validator.staked_amount = validator.staked_amount.checked_sub(amount).unwrap();
        
        if validator.staked_amount == 0 {
            validator.is_active = false;
        }

        msg!("Instant unstake: {} lamports (fee: {})", amount_after_fee, fee);
        Ok(())
    }

    pub fn slash_validator(ctx: Context<SlashValidator>, slash_amount: u64, reason: String) -> Result<()> {
        let config = &ctx.accounts.config;
        let validator = &mut ctx.accounts.validator;

        require!(ctx.accounts.authority.key() == config.authority, ErrorCode::Unauthorized);
        require!(slash_amount <= validator.staked_amount, ErrorCode::InsufficientStake);

        // Transfer slashed amount to treasury
        **validator.to_account_info().try_borrow_mut_lamports()? -= slash_amount;
        **ctx.accounts.treasury.to_account_info().try_borrow_mut_lamports()? += slash_amount;

        validator.staked_amount = validator.staked_amount.checked_sub(slash_amount).unwrap();
        
        if validator.staked_amount < config.validator_min_stake {
            validator.is_active = false;
        }

        msg!("Validator slashed {} lamports. Reason: {}", slash_amount, reason);
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

#[derive(Accounts)]
pub struct ClaimValidatorRewards<'info> {
    #[account(
        mut,
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
pub struct UnstakeValidatorInstant<'info> {
    #[account(
        mut,
        seeds = [b"validator", user.key().as_ref()],
        bump
    )]
    pub validator: Account<'info, Validator>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(seeds = [b"config"], bump)]
    pub config: Account<'info, Config>,
    /// CHECK: Treasury account from config
    #[account(mut)]
    pub treasury: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SlashValidator<'info> {
    #[account(seeds = [b"config"], bump)]
    pub config: Account<'info, Config>,
    #[account(
        mut,
        seeds = [b"validator", validator.authority.as_ref()],
        bump
    )]
    pub validator: Account<'info, Validator>,
    pub authority: Signer<'info>,
    /// CHECK: Treasury account from config
    #[account(mut)]
    pub treasury: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Config {
    pub authority: Pubkey,              // 32
    pub treasury: Pubkey,               // 32
    pub registration_fee: u64,          // 8
    pub validation_fee: u64,            // 8
    pub validator_min_stake: u64,       // 8
    pub base_apy_bps: u16,              // 2 (basis points, e.g., 500 = 5%)
    pub instant_unstake_fee_bps: u16,   // 2 (e.g., 200 = 2%)
}

impl Config {
    pub const LEN: usize = 32 + 32 + 8 + 8 + 8 + 2 + 2; // 92
}

#[account]
pub struct Validator {
    pub authority: Pubkey,           // 32
    pub staked_amount: u64,          // 8
    pub is_active: bool,             // 1
    pub last_stake_timestamp: i64,   // 8
    pub last_reward_claim: i64,      // 8
    pub total_validations: u64,      // 8
    pub pending_rewards: u64,        // 8
}

impl Validator {
    pub const LEN: usize = 32 + 8 + 1 + 8 + 8 + 8 + 8; // 73
}

#[error_code]
pub enum ErrorCode {
    #[msg("Insufficient stake amount")]
    InsufficientStake,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Cooldown period has not elapsed")]
    CooldownNotElapsed,
    #[msg("No rewards to claim")]
    NoRewardsToClaim,
    #[msg("Validator is not active")]
    ValidatorNotActive,
    #[msg("Insufficient funds in account")]
    InsufficientFunds,
}


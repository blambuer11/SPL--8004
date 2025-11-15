use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Mint, Transfer};

// NOTE: declare_id! will be replaced with the generated program id below.
declare_id!("iMjAbTmAddZTzEtDcSgbDPJRRdc4eT6mGC9SnK3Gzy8");

#[program]
pub mod noema_staking {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        base_apy_bps: u16,
        instant_unstake_fee_bps: u16,
        validator_min_stake: u64,
    ) -> Result<()> {
        let config = &mut ctx.accounts.config;
        config.authority = ctx.accounts.authority.key();
        config.treasury = ctx.accounts.treasury.key();
        config.stake_mint = ctx.accounts.stake_mint.key();
        config.base_apy_bps = base_apy_bps;
        config.instant_unstake_fee_bps = instant_unstake_fee_bps;
        config.validator_min_stake = validator_min_stake;
        Ok(())
    }

    pub fn stake_validator(ctx: Context<StakeValidator>, amount: u64) -> Result<()> {
        let config = &ctx.accounts.config;
        require!(amount >= config.validator_min_stake, ErrorCode::InsufficientStake);
        let validator = &mut ctx.accounts.validator;
        let clock = Clock::get()?;

        // transfer NOEMA from user ATA to vault
        let cpi_accounts = Transfer {
            from: ctx.accounts.user_token_account.to_account_info(),
            to: ctx.accounts.vault_token_account.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
        token::transfer(cpi_ctx, amount)?;

        validator.authority = ctx.accounts.user.key();
        validator.staked_amount = validator.staked_amount.checked_add(amount).unwrap();
        validator.is_active = true;
        validator.last_stake_timestamp = clock.unix_timestamp;
        validator.last_reward_claim = clock.unix_timestamp;
        validator.total_validations = 0;
        validator.pending_rewards = 0;
        Ok(())
    }

    pub fn claim_validator_rewards(ctx: Context<ClaimValidatorRewards>) -> Result<()> {
        let validator = &mut ctx.accounts.validator;
        let clock = Clock::get()?;
        let config = &ctx.accounts.config;
        require!(validator.authority == ctx.accounts.user.key(), ErrorCode::Unauthorized);
        require!(validator.is_active, ErrorCode::ValidatorNotActive);

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

        // Transfer rewards from vault to user (vault authority = validator PDA bump as signer)
        let user_key = ctx.accounts.user.key();
        let validator_bump = *ctx.bumps.get("validator").unwrap();
        let signer_seeds: &[&[&[u8]]] = &[&[
            b"noema_validator",
            user_key.as_ref(),
            &[validator_bump],
        ]];
        let validator_info = validator.to_account_info();
        let cpi_accounts = Transfer {
            from: ctx.accounts.vault_token_account.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: validator_info,
        };
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts,
            signer_seeds,
        );
        token::transfer(cpi_ctx, claimable)?;

        validator.pending_rewards = 0;
        validator.last_reward_claim = clock.unix_timestamp;
        Ok(())
    }

    pub fn unstake_validator_instant(ctx: Context<UnstakeValidatorInstant>, amount: u64) -> Result<()> {
        let validator = &mut ctx.accounts.validator;
        let config = &ctx.accounts.config;
        require!(validator.authority == ctx.accounts.user.key(), ErrorCode::Unauthorized);
        require!(amount <= validator.staked_amount, ErrorCode::InsufficientStake);

        let fee = (amount as u128).checked_mul(config.instant_unstake_fee_bps as u128).unwrap() / 10_000;
        let amount_after_fee = amount.checked_sub(fee as u64).unwrap();

        let user_key = ctx.accounts.user.key();
        let validator_bump = *ctx.bumps.get("validator").unwrap();
        let signer_seeds: &[&[&[u8]]] = &[&[
            b"noema_validator",
            user_key.as_ref(),
            &[validator_bump],
        ]];
        let validator_info = validator.to_account_info();

        // Transfer fee to treasury
        let fee_cpi = Transfer {
            from: ctx.accounts.vault_token_account.to_account_info(),
            to: ctx.accounts.treasury_token_account.to_account_info(),
            authority: validator_info.clone(),
        };
        let fee_ctx = CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), fee_cpi, signer_seeds);
        token::transfer(fee_ctx, fee as u64)?;

        // Transfer remainder to user
        let user_cpi = Transfer {
            from: ctx.accounts.vault_token_account.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: validator_info,
        };
        let user_ctx = CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), user_cpi, signer_seeds);
        token::transfer(user_ctx, amount_after_fee)?;

        validator.staked_amount = validator.staked_amount.checked_sub(amount).unwrap();
        if validator.staked_amount == 0 { validator.is_active = false; }
        Ok(())
    }

    pub fn unstake_validator(ctx: Context<UnstakeValidator>, amount: u64) -> Result<()> {
        let validator = &mut ctx.accounts.validator;
        let clock = Clock::get()?;
        let _config = &ctx.accounts.config;
        require!(validator.authority == ctx.accounts.user.key(), ErrorCode::Unauthorized);
        require!(amount <= validator.staked_amount, ErrorCode::InsufficientStake);

        let cooldown_period = 7 * 24 * 60 * 60; // 7 days
        require!(clock.unix_timestamp >= validator.last_stake_timestamp + cooldown_period, ErrorCode::CooldownNotElapsed);

        // Transfer from vault to user (validator PDA as authority)
        let user_key = ctx.accounts.user.key();
        let validator_bump = *ctx.bumps.get("validator").unwrap();
        let signer_seeds: &[&[&[u8]]] = &[&[
            b"noema_validator",
            user_key.as_ref(),
            &[validator_bump],
        ]];
        let validator_info = validator.to_account_info();
        let cpi_accounts = Transfer {
            from: ctx.accounts.vault_token_account.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: validator_info,
        };
        let cpi_ctx = CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), cpi_accounts, signer_seeds);
        token::transfer(cpi_ctx, amount)?;

        validator.staked_amount = validator.staked_amount.checked_sub(amount).unwrap();
        if validator.staked_amount == 0 { validator.is_active = false; }
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Config::LEN,
        seeds = [b"noema_config"],
        bump
    )]
    pub config: Account<'info, Config>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub stake_mint: Account<'info, Mint>,
    /// CHECK: treasury token account for NOEMA mint
    #[account(mut)]
    pub treasury: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct StakeValidator<'info> {
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + Validator::LEN,
        seeds = [b"noema_validator", user.key().as_ref()],
        bump
    )]
    pub validator: Account<'info, Validator>,

    #[account(
        mut,
        seeds = [b"noema_config"],
        bump
    )]
    pub config: Account<'info, Config>,

    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        constraint = user_token_account.owner == user.key(),
        constraint = user_token_account.mint == config.stake_mint
    )]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = stake_mint,
        associated_token::authority = validator
    )]
    pub vault_token_account: Account<'info, TokenAccount>,
    
    pub stake_mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, anchor_spl::associated_token::AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimValidatorRewards<'info> {
    #[account(
        mut,
        seeds = [b"noema_validator", user.key().as_ref()],
        bump
    )]
    pub validator: Account<'info, Validator>,
    #[account(
        seeds = [b"noema_config"],
        bump
    )]
    pub config: Account<'info, Config>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub vault_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct UnstakeValidatorInstant<'info> {
    #[account(
        mut,
        seeds = [b"noema_validator", user.key().as_ref()],
        bump
    )]
    pub validator: Account<'info, Validator>,
    #[account(
        seeds = [b"noema_config"],
        bump
    )]
    pub config: Account<'info, Config>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub vault_token_account: Account<'info, TokenAccount>,
    /// CHECK: treasury NOEMA token account
    #[account(mut)]
    pub treasury_token_account: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct UnstakeValidator<'info> {
    #[account(
        mut,
        seeds = [b"noema_validator", user.key().as_ref()],
        bump
    )]
    pub validator: Account<'info, Validator>,
    #[account(
        seeds = [b"noema_config"],
        bump
    )]
    pub config: Account<'info, Config>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub vault_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct Config {
    pub authority: Pubkey,            // 32
    pub treasury: Pubkey,             // 32
    pub stake_mint: Pubkey,           // 32
    pub validator_min_stake: u64,     // 8
    pub base_apy_bps: u16,            // 2
    pub instant_unstake_fee_bps: u16, // 2
}

impl Config { pub const LEN: usize = 32 + 32 + 32 + 8 + 2 + 2; }

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

impl Validator { pub const LEN: usize = 32 + 8 + 1 + 8 + 8 + 8 + 8; }

#[error_code]
pub enum ErrorCode {
    #[msg("Insufficient stake amount")] InsufficientStake,
    #[msg("Unauthorized")] Unauthorized,
    #[msg("Cooldown period has not elapsed")] CooldownNotElapsed,
    #[msg("No rewards to claim")] NoRewardsToClaim,
    #[msg("Validator is not active")] ValidatorNotActive,
}

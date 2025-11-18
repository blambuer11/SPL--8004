use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("Fma6gBu46bG4SE2rt2QQxUAC9Sc1aFmtELVtwvuJfCQf");

#[program]
pub mod x402_facilitator {
    use super::*;

    pub fn initialize_config(
        ctx: Context<InitializeConfig>,
        authority: Pubkey,
        treasury: Pubkey,
        platform_fee_bps: u16,
    ) -> Result<()> {
        require!(platform_fee_bps <= 1000, ErrorCode::FeeTooHigh);
        let config = &mut ctx.accounts.config;
        config.authority = authority;
        config.treasury = treasury;
        config.platform_fee_bps = platform_fee_bps;
        config.total_payments = 0;
        config.total_volume = 0;
        config.total_fees_collected = 0;
        config.payment_count = 0; // Initialize payment counter
        config.bump = ctx.bumps.config;
        msg!("X402 Facilitator initialized - Fee: {}bps", platform_fee_bps);
        Ok(())
    }

    pub fn create_channel(
        ctx: Context<CreateChannel>,
        recipient: Pubkey,
        max_amount: u64,
        expires_at: i64,
    ) -> Result<()> {
        let channel = &mut ctx.accounts.channel;
        let current_time = Clock::get()?.unix_timestamp;
        require!(expires_at > current_time, ErrorCode::InvalidExpiration);
        channel.sender = ctx.accounts.sender.key();
        channel.recipient = recipient;
        channel.max_amount = max_amount;
        channel.total_paid = 0;
        channel.is_active = true;
        channel.created_at = current_time;
        channel.expires_at = expires_at;
        channel.bump = ctx.bumps.channel;
        msg!("Payment channel created: {} -> {}", ctx.accounts.sender.key(), recipient);
        Ok(())
    }

    pub fn instant_payment(
        ctx: Context<InstantPayment>,
        amount: u64,
        memo: String,
    ) -> Result<()> {
        require!(amount > 0, ErrorCode::InvalidAmount);
        require!(memo.len() <= 200, ErrorCode::MemoTooLong);
        let config = &mut ctx.accounts.config;
        let payment = &mut ctx.accounts.payment;
        let fee = (amount as u128 * config.platform_fee_bps as u128 / 10000) as u64;
        let net_amount = amount.checked_sub(fee).ok_or(ErrorCode::InvalidAmount)?;
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.sender_token_account.to_account_info(),
                to: ctx.accounts.recipient_token_account.to_account_info(),
                authority: ctx.accounts.sender.to_account_info(),
            },
        );
        token::transfer(cpi_ctx, net_amount)?;
        if fee > 0 {
            let fee_cpi_ctx = CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.sender_token_account.to_account_info(),
                    to: ctx.accounts.treasury_token_account.to_account_info(),
                    authority: ctx.accounts.sender.to_account_info(),
                },
            );
            token::transfer(fee_cpi_ctx, fee)?;
        }
        payment.sender = ctx.accounts.sender.key();
        payment.recipient = ctx.accounts.recipient.key();
        payment.amount = amount;
        payment.fee = fee;
        payment.memo = memo;
        payment.status = PaymentStatus::Settled;
        payment.timestamp = Clock::get()?.unix_timestamp;
        payment.bump = ctx.bumps.payment;
        config.total_payments += 1;
        config.total_volume += amount;
        config.total_fees_collected += fee;
        config.payment_count += 1; // Increment counter for next payment
        msg!("Payment settled: {} USDC (fee: {})", net_amount, fee);
        Ok(())
    }

    pub fn create_pending_payment(
        ctx: Context<CreatePendingPayment>,
        amount: u64,
        memo: String,
        expires_in_seconds: i64,
    ) -> Result<()> {
        require!(amount > 0, ErrorCode::InvalidAmount);
        require!(memo.len() <= 200, ErrorCode::MemoTooLong);
        let payment = &mut ctx.accounts.payment;
        let current_time = Clock::get()?.unix_timestamp;
        payment.sender = ctx.accounts.sender.key();
        payment.recipient = ctx.accounts.recipient.key();
        payment.amount = amount;
        payment.fee = 0;
        payment.memo = memo;
        payment.status = PaymentStatus::Pending;
        payment.timestamp = current_time;
        payment.expires_at = current_time + expires_in_seconds;
        payment.bump = ctx.bumps.payment;
        msg!("Pending payment created: {} USDC", amount);
        Ok(())
    }

    pub fn settle_payment(ctx: Context<SettlePayment>) -> Result<()> {
        let payment = &mut ctx.accounts.payment;
        let config = &mut ctx.accounts.config;
        let current_time = Clock::get()?.unix_timestamp;
        require!(payment.status == PaymentStatus::Pending, ErrorCode::PaymentNotPending);
        require!(current_time <= payment.expires_at, ErrorCode::PaymentExpired);
        let fee = (payment.amount as u128 * config.platform_fee_bps as u128 / 10000) as u64;
        let net_amount = payment.amount.checked_sub(fee).ok_or(ErrorCode::InvalidAmount)?;
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.sender_token_account.to_account_info(),
                to: ctx.accounts.recipient_token_account.to_account_info(),
                authority: ctx.accounts.sender.to_account_info(),
            },
        );
        token::transfer(cpi_ctx, net_amount)?;
        if fee > 0 {
            let fee_cpi_ctx = CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.sender_token_account.to_account_info(),
                    to: ctx.accounts.treasury_token_account.to_account_info(),
                    authority: ctx.accounts.sender.to_account_info(),
                },
            );
            token::transfer(fee_cpi_ctx, fee)?;
        }
        payment.fee = fee;
        payment.status = PaymentStatus::Settled;
        config.total_payments += 1;
        config.total_volume += payment.amount;
        config.total_fees_collected += fee;
        msg!("Payment settled: {} USDC (fee: {})", net_amount, fee);
        Ok(())
    }

    pub fn cancel_payment(ctx: Context<CancelPayment>) -> Result<()> {
        let payment = &mut ctx.accounts.payment;
        require!(payment.status == PaymentStatus::Pending, ErrorCode::PaymentNotPending);
        payment.status = PaymentStatus::Cancelled;
        msg!("Payment cancelled");
        Ok(())
    }

    pub fn channel_payment(
        ctx: Context<ChannelPayment>,
        amount: u64,
        memo: String,
    ) -> Result<()> {
        require!(amount > 0, ErrorCode::InvalidAmount);
        require!(memo.len() <= 200, ErrorCode::MemoTooLong);
        let channel = &mut ctx.accounts.channel;
        let config = &mut ctx.accounts.config;
        let payment = &mut ctx.accounts.payment;
        let current_time = Clock::get()?.unix_timestamp;
        require!(channel.is_active, ErrorCode::ChannelNotActive);
        require!(current_time <= channel.expires_at, ErrorCode::ChannelExpired);
        require!(channel.total_paid + amount <= channel.max_amount, ErrorCode::ChannelLimitExceeded);
        let fee = (amount as u128 * config.platform_fee_bps as u128 / 10000) as u64;
        let net_amount = amount.checked_sub(fee).ok_or(ErrorCode::InvalidAmount)?;
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.sender_token_account.to_account_info(),
                to: ctx.accounts.recipient_token_account.to_account_info(),
                authority: ctx.accounts.sender.to_account_info(),
            },
        );
        token::transfer(cpi_ctx, net_amount)?;
        if fee > 0 {
            let fee_cpi_ctx = CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.sender_token_account.to_account_info(),
                    to: ctx.accounts.treasury_token_account.to_account_info(),
                    authority: ctx.accounts.sender.to_account_info(),
                },
            );
            token::transfer(fee_cpi_ctx, fee)?;
        }
        payment.sender = channel.sender;
        payment.recipient = channel.recipient;
        payment.amount = amount;
        payment.fee = fee;
        payment.memo = memo;
        payment.status = PaymentStatus::Settled;
        payment.timestamp = current_time;
        payment.bump = ctx.bumps.payment;
        channel.total_paid += amount;
        config.total_payments += 1;
        config.total_volume += amount;
        config.total_fees_collected += fee;
        msg!("Channel payment: {} USDC (fee: {})", net_amount, fee);
        Ok(())
    }

    pub fn close_channel(ctx: Context<CloseChannel>) -> Result<()> {
        let channel = &mut ctx.accounts.channel;
        channel.is_active = false;
        msg!("Payment channel closed");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeConfig<'info> {
    #[account(init, payer = payer, space = 8 + GlobalConfig::LEN, seeds = [b"config"], bump)]
    pub config: Account<'info, GlobalConfig>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(recipient: Pubkey)]
pub struct CreateChannel<'info> {
    #[account(init, payer = sender, space = 8 + PaymentChannel::LEN, seeds = [b"channel", sender.key().as_ref(), recipient.as_ref()], bump)]
    pub channel: Account<'info, PaymentChannel>,
    #[account(mut)]
    pub sender: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InstantPayment<'info> {
    #[account(init, payer = sender, space = 8 + PaymentRecord::LEN, seeds = [b"payment", sender.key().as_ref(), recipient.key().as_ref(), &config.payment_count.to_le_bytes()], bump)]
    pub payment: Account<'info, PaymentRecord>,
    #[account(mut)]
    pub config: Account<'info, GlobalConfig>,
    #[account(mut)]
    pub sender: Signer<'info>,
    /// CHECK: Recipient address
    pub recipient: UncheckedAccount<'info>,
    #[account(mut)]
    pub sender_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub recipient_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub treasury_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreatePendingPayment<'info> {
    #[account(init, payer = sender, space = 8 + PaymentRecord::LEN, seeds = [b"payment", sender.key().as_ref(), recipient.key().as_ref(), &Clock::get()?.unix_timestamp.to_le_bytes()], bump)]
    pub payment: Account<'info, PaymentRecord>,
    #[account(mut)]
    pub sender: Signer<'info>,
    /// CHECK: Recipient address
    pub recipient: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SettlePayment<'info> {
    #[account(mut, constraint = payment.sender == sender.key() @ ErrorCode::Unauthorized)]
    pub payment: Account<'info, PaymentRecord>,
    #[account(mut)]
    pub config: Account<'info, GlobalConfig>,
    #[account(mut)]
    pub sender: Signer<'info>,
    #[account(mut)]
    pub sender_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub recipient_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub treasury_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct CancelPayment<'info> {
    #[account(mut, constraint = payment.sender == sender.key() @ ErrorCode::Unauthorized)]
    pub payment: Account<'info, PaymentRecord>,
    pub sender: Signer<'info>,
}

#[derive(Accounts)]
pub struct ChannelPayment<'info> {
    #[account(init, payer = sender, space = 8 + PaymentRecord::LEN, seeds = [b"payment", sender.key().as_ref(), channel.recipient.as_ref(), &Clock::get()?.unix_timestamp.to_le_bytes()], bump)]
    pub payment: Account<'info, PaymentRecord>,
    #[account(mut, constraint = channel.sender == sender.key() @ ErrorCode::Unauthorized)]
    pub channel: Account<'info, PaymentChannel>,
    #[account(mut)]
    pub config: Account<'info, GlobalConfig>,
    #[account(mut)]
    pub sender: Signer<'info>,
    #[account(mut)]
    pub sender_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub recipient_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub treasury_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CloseChannel<'info> {
    #[account(mut, constraint = channel.sender == sender.key() @ ErrorCode::Unauthorized)]
    pub channel: Account<'info, PaymentChannel>,
    pub sender: Signer<'info>,
}

#[account]
pub struct GlobalConfig {
    pub authority: Pubkey,
    pub treasury: Pubkey,
    pub platform_fee_bps: u16,
    pub total_payments: u64,
    pub total_volume: u64,
    pub total_fees_collected: u64,
    pub payment_count: u64, // Counter for unique payment PDAs
    pub bump: u8,
}
impl GlobalConfig { pub const LEN: usize = 32 + 32 + 2 + 8 + 8 + 8 + 8 + 1; }

#[account]
pub struct PaymentChannel {
    pub sender: Pubkey,
    pub recipient: Pubkey,
    pub max_amount: u64,
    pub total_paid: u64,
    pub is_active: bool,
    pub created_at: i64,
    pub expires_at: i64,
    pub bump: u8,
}
impl PaymentChannel { pub const LEN: usize = 32 + 32 + 8 + 8 + 1 + 8 + 8 + 1; }

#[account]
pub struct PaymentRecord {
    pub sender: Pubkey,
    pub recipient: Pubkey,
    pub amount: u64,
    pub fee: u64,
    pub memo: String,
    pub status: PaymentStatus,
    pub timestamp: i64,
    pub expires_at: i64,
    pub bump: u8,
}
impl PaymentRecord { pub const LEN: usize = 32 + 32 + 8 + 8 + 204 + 1 + 8 + 8 + 1; }

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum PaymentStatus { Pending, Settled, Cancelled }

#[error_code]
pub enum ErrorCode {
    #[msg("Fee too high (max 1000 bps = 10%)")] FeeTooHigh,
    #[msg("Invalid amount")] InvalidAmount,
    #[msg("Memo too long (max 200 chars)")] MemoTooLong,
    #[msg("Invalid expiration time")] InvalidExpiration,
    #[msg("Payment not pending")] PaymentNotPending,
    #[msg("Payment expired")] PaymentExpired,
    #[msg("Channel not active")] ChannelNotActive,
    #[msg("Channel expired")] ChannelExpired,
    #[msg("Channel limit exceeded")] ChannelLimitExceeded,
    #[msg("Unauthorized")] Unauthorized,
}

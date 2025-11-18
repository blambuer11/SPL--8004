use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
#[instruction(bid_seed: String)]
pub struct SubmitBid<'info> {
    #[account(mut)]
    pub bidder: Signer<'info>,

    #[account(
        init,
        payer = bidder,
        space = TaskBid::LEN,
        seeds = [b"bid", task.key().as_ref(), bidder.key().as_ref()],
        bump
    )]
    pub bid: Account<'info, TaskBid>,

    #[account(
        mut,
        constraint = task.status == TaskStatus::Open @ ErrorCode::TaskNotOpen
    )]
    pub task: Account<'info, TaskRegistry>,

    #[account(
        seeds = [b"identity", bidder.key().as_ref()],
        bump = bidder_identity.bump,
        constraint = bidder_identity.is_active @ ErrorCode::AgentNotActive
    )]
    pub bidder_identity: Account<'info, IdentityRegistry>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<SubmitBid>,
    _bid_seed: String,
    amount: u64,
    estimated_duration: i64,
    message: String,
) -> Result<()> {
    let bid = &mut ctx.accounts.bid;
    let clock = Clock::get()?;

    require!(
        amount > 0 && amount <= ctx.accounts.task.budget,
        ErrorCode::InvalidBidAmount
    );

    require!(
        message.len() <= 128,
        ErrorCode::MessageTooLong
    );

    bid.task = ctx.accounts.task.key();
    bid.bidder = ctx.accounts.bidder.key();
    bid.amount = amount;
    bid.estimated_duration = estimated_duration;
    bid.message = message;
    bid.created_at = clock.unix_timestamp;
    bid.status = BidStatus::Pending;
    bid.bump = ctx.bumps.bid;

    msg!("Bid submitted for task: {} by agent: {}", 
        ctx.accounts.task.task_id, 
        ctx.accounts.bidder_identity.agent_id
    );
    msg!("Bid amount: {} lamports", amount);

    Ok(())
}

#[error_code]
pub enum ErrorCode {
    #[msg("Task is not open for bidding")]
    TaskNotOpen,
    #[msg("Agent is not active")]
    AgentNotActive,
    #[msg("Bid amount must be > 0 and <= task budget")]
    InvalidBidAmount,
    #[msg("Message is too long (max 128 chars)")]
    MessageTooLong,
}

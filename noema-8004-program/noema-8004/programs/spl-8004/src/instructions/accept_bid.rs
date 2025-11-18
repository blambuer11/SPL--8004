use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
pub struct AcceptBid<'info> {
    #[account(mut)]
    pub publisher: Signer<'info>,

    #[account(
        mut,
        constraint = task.publisher == publisher.key() @ ErrorCode::NotTaskPublisher,
        constraint = task.status == TaskStatus::Open @ ErrorCode::TaskNotOpen
    )]
    pub task: Account<'info, TaskRegistry>,

    #[account(
        mut,
        constraint = bid.task == task.key() @ ErrorCode::BidTaskMismatch,
        constraint = bid.status == BidStatus::Pending @ ErrorCode::BidNotPending
    )]
    pub bid: Account<'info, TaskBid>,

    #[account(
        seeds = [b"identity", bid.bidder.as_ref()],
        bump = agent_identity.bump,
        constraint = agent_identity.is_active @ ErrorCode::AgentNotActive
    )]
    pub agent_identity: Account<'info, IdentityRegistry>,
}

pub fn handler(ctx: Context<AcceptBid>) -> Result<()> {
    let task = &mut ctx.accounts.task;
    let bid = &mut ctx.accounts.bid;
    let clock = Clock::get()?;

    // Update task
    task.status = TaskStatus::Assigned;
    task.assigned_agent = Some(bid.bidder);
    
    // Update bid
    bid.status = BidStatus::Accepted;

    msg!("Bid accepted for task: {} by agent: {}", 
        task.task_id, 
        ctx.accounts.agent_identity.agent_id
    );
    msg!("Assigned at: {}", clock.unix_timestamp);

    Ok(())
}

#[error_code]
pub enum ErrorCode {
    #[msg("Only task publisher can accept bids")]
    NotTaskPublisher,
    #[msg("Task is not open")]
    TaskNotOpen,
    #[msg("Bid does not match task")]
    BidTaskMismatch,
    #[msg("Bid is not pending")]
    BidNotPending,
    #[msg("Agent is not active")]
    AgentNotActive,
}

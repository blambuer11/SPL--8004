use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
#[instruction(task_id: String)]
pub struct PublishTask<'info> {
    #[account(mut)]
    pub publisher: Signer<'info>,

    #[account(
        init,
        payer = publisher,
        space = TaskRegistry::LEN,
        seeds = [b"task", task_id.as_bytes()],
        bump
    )]
    pub task_registry: Account<'info, TaskRegistry>,

    #[account(
        seeds = [b"identity", publisher.key().as_ref()],
        bump = identity.bump,
    )]
    pub identity: Account<'info, IdentityRegistry>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<PublishTask>,
    task_id: String,
    title: String,
    description: String,
    budget: u64,
    category: String,
    deadline: Option<i64>,
) -> Result<()> {
    let task = &mut ctx.accounts.task_registry;
    let clock = Clock::get()?;

    require!(
        ctx.accounts.identity.is_active,
        ErrorCode::AgentNotActive
    );

    require!(
        task_id.len() <= 32,
        ErrorCode::TaskIdTooLong
    );

    require!(
        title.len() <= 64,
        ErrorCode::TitleTooLong
    );

    require!(
        description.len() <= 256,
        ErrorCode::DescriptionTooLong
    );

    require!(
        category.len() <= 32,
        ErrorCode::CategoryTooLong
    );

    require!(
        budget > 0,
        ErrorCode::InvalidBudget
    );

    task.task_id = task_id;
    task.publisher = ctx.accounts.publisher.key();
    task.title = title;
    task.description = description;
    task.budget = budget;
    task.category = category;
    task.status = TaskStatus::Open;
    task.assigned_agent = None;
    task.created_at = clock.unix_timestamp;
    task.deadline = deadline;
    task.completed_at = None;
    task.bump = ctx.bumps.task_registry;

    msg!("Task published: {} by {}", task.task_id, task.publisher);
    msg!("Budget: {} lamports", task.budget);

    Ok(())
}

#[error_code]
pub enum ErrorCode {
    #[msg("Agent is not active")]
    AgentNotActive,
    #[msg("Task ID is too long (max 32 chars)")]
    TaskIdTooLong,
    #[msg("Title is too long (max 64 chars)")]
    TitleTooLong,
    #[msg("Description is too long (max 256 chars)")]
    DescriptionTooLong,
    #[msg("Category is too long (max 32 chars)")]
    CategoryTooLong,
    #[msg("Budget must be greater than 0")]
    InvalidBudget,
}

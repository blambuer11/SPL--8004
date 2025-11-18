use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::*;
use crate::constants::*;

/// Validator assigns reputation score to an agent based on performance
/// Only active validators with minimum stake can assign reputation
#[derive(Accounts)]
pub struct AssignReputation<'info> {
    #[account(
        mut,
        seeds = [REPUTATION_SEED, agent.agent_id.as_bytes()],
        bump = reputation.bump,
        constraint = reputation.agent == agent.key()
    )]
    pub reputation: Account<'info, ReputationRegistry>,

    #[account(constraint = agent.is_active @ SPL8004Error::AgentNotActive)]
    pub agent: Account<'info, IdentityRegistry>,

    #[account(
        seeds = [b"validator", validator_authority.key().as_ref()],
        bump = validator.bump,
        constraint = validator.is_active @ SPL8004Error::ValidatorNotActive,
        constraint = validator.staked_amount >= VALIDATOR_MIN_STAKE @ SPL8004Error::InsufficientStake
    )]
    pub validator: Account<'info, Validator>,

    pub validator_authority: Signer<'info>,
}

pub fn handler(
    ctx: Context<AssignReputation>,
    score_delta: i64, // Can be positive or negative
    reason: String,
) -> Result<()> {
    require!(reason.len() <= 200, SPL8004Error::ReasonTooLong);
    require!(score_delta >= -500 && score_delta <= 500, SPL8004Error::InvalidScoreDelta);
    
    let reputation = &mut ctx.accounts.reputation;
    let clock = Clock::get()?;

    // Calculate new score with bounds checking
    let current_score = reputation.score as i64;
    let new_score = current_score.checked_add(score_delta)
        .ok_or(SPL8004Error::ArithmeticOverflow)?;
    
    // Clamp between MIN and MAX reputation score
    let clamped_score = new_score
        .max(MIN_REPUTATION_SCORE as i64)
        .min(MAX_REPUTATION_SCORE as i64) as u64;

    reputation.score = clamped_score;
    reputation.last_updated = clock.unix_timestamp;

    // Update validator's validation count
    let validator = &mut ctx.accounts.validator;
    validator.total_validations = validator.total_validations
        .checked_add(1)
        .ok_or(SPL8004Error::ArithmeticOverflow)?;

    msg!("✅ Reputation assigned!");
    msg!("Agent: {}", ctx.accounts.agent.agent_id);
    msg!("Validator: {}", ctx.accounts.validator_authority.key());
    msg!("Score change: {} → {} (delta: {})", current_score, clamped_score, score_delta);
    msg!("Reason: {}", reason);

    Ok(())
}

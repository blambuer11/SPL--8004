use anchor_lang::prelude::*;

declare_id!("A4Ee2KoPz4y9XyEBta9DyXvKPnWy2GvprDzfVF1PnjtR");

const MAX_VALIDATORS: usize = 10;

#[program]
pub mod spl_fcp {
    use super::*;

    /// Initialize global config
    pub fn initialize_config(
        ctx: Context<InitializeConfig>,
        authority: Pubkey,
        min_stake_for_validator: u64,
    ) -> Result<()> {
        let config = &mut ctx.accounts.config;
        config.authority = authority;
        config.min_stake_for_validator = min_stake_for_validator;
        config.total_validators = 0;
        config.total_consensus_requests = 0;
        config.bump = ctx.bumps.config;
        
        msg!("SPL-FCP Config initialized");
        Ok(())
    }

    /// Register as validator (requires stake)
    pub fn register_validator(
        ctx: Context<RegisterValidator>,
        validator_name: String,
        metadata_uri: String,
    ) -> Result<()> {
        require!(validator_name.len() <= 64, ErrorCode::ValidatorNameTooLong);
        require!(metadata_uri.len() <= 200, ErrorCode::MetadataUriTooLong);

        let validator = &mut ctx.accounts.validator;
        let config = &mut ctx.accounts.config;
        
        validator.owner = ctx.accounts.owner.key();
        validator.name = validator_name;
        validator.metadata_uri = metadata_uri;
        validator.stake_amount = config.min_stake_for_validator;
        validator.is_active = true;
        validator.total_votes = 0;
        validator.registered_at = Clock::get()?.unix_timestamp;
        validator.bump = ctx.bumps.validator;

        config.total_validators += 1;

        msg!("Validator registered: {}", validator.name);
        Ok(())
    }

    /// Request consensus from validators
    pub fn request_consensus(
        ctx: Context<RequestConsensus>,
        agent_id: String,
        action_type: String,
        data_hash: [u8; 32],
        threshold: u8,
        validator_keys: Vec<Pubkey>,
    ) -> Result<()> {
        require!(agent_id.len() <= 32, ErrorCode::AgentIdTooLong);
        require!(action_type.len() <= 64, ErrorCode::ActionTypeTooLong);
        require!(validator_keys.len() <= MAX_VALIDATORS, ErrorCode::TooManyValidators);
        require!(threshold as usize <= validator_keys.len(), ErrorCode::InvalidThreshold);

        let consensus = &mut ctx.accounts.consensus;
        let config = &mut ctx.accounts.config;
        
        consensus.agent_id = agent_id.clone();
        consensus.requester = ctx.accounts.requester.key();
        consensus.action_type = action_type.clone();
        consensus.data_hash = data_hash;
        consensus.threshold = threshold;
        consensus.validator_keys = validator_keys;
        consensus.approvals = 0;
        consensus.rejections = 0;
        consensus.status = ConsensusStatus::Pending;
        consensus.requested_at = Clock::get()?.unix_timestamp;
        consensus.finalized_at = 0;
        consensus.bump = ctx.bumps.consensus;

        config.total_consensus_requests += 1;

        msg!("Consensus requested for agent: {} - {}", agent_id, action_type);
        Ok(())
    }

    /// Cast vote on consensus
    pub fn cast_vote(
        ctx: Context<CastVote>,
        request_id: String,
        approve: bool,
        evidence_uri: String,
    ) -> Result<()> {
        require!(request_id.len() <= 64, ErrorCode::RequestIdTooLong);
        require!(evidence_uri.len() <= 200, ErrorCode::MetadataUriTooLong);

    // Capture keys before taking mutable references to avoid borrow conflicts
    let consensus_key = ctx.accounts.consensus.key();
    let validator_key = ctx.accounts.validator.key();
    let vote = &mut ctx.accounts.vote;
    let consensus = &mut ctx.accounts.consensus;
    let validator = &mut ctx.accounts.validator;
        
        // Check if validator is in the validator list
        require!(
            consensus.validator_keys.contains(&validator_key),
            ErrorCode::ValidatorNotInList
        );

        // Check if consensus is still pending
        require!(
            matches!(consensus.status, ConsensusStatus::Pending),
            ErrorCode::ConsensusAlreadyFinalized
        );

    vote.consensus = consensus_key;
    vote.validator = validator_key;
        vote.request_id = request_id;
        vote.approve = approve;
        vote.evidence_uri = evidence_uri;
        vote.voted_at = Clock::get()?.unix_timestamp;
        vote.bump = ctx.bumps.vote;

        // Update consensus counts
        if approve {
            consensus.approvals += 1;
        } else {
            consensus.rejections += 1;
        }

        validator.total_votes += 1;

        // Check if threshold reached
        if consensus.approvals >= consensus.threshold {
            consensus.status = ConsensusStatus::Approved;
            consensus.finalized_at = Clock::get()?.unix_timestamp;
            msg!("Consensus APPROVED: threshold reached");
        } else if consensus.rejections > (consensus.validator_keys.len() as u8 - consensus.threshold) {
            consensus.status = ConsensusStatus::Rejected;
            consensus.finalized_at = Clock::get()?.unix_timestamp;
            msg!("Consensus REJECTED: too many rejections");
        }

        msg!("Vote cast: approve={}", approve);
        Ok(())
    }

    /// Finalize consensus (timeout)
    pub fn finalize_consensus(
        ctx: Context<FinalizeConsensus>,
    ) -> Result<()> {
        let consensus = &mut ctx.accounts.consensus;
        let now = Clock::get()?.unix_timestamp;
        
        // Check timeout (24 hours)
        require!(
            now - consensus.requested_at > 86400,
            ErrorCode::ConsensusNotTimedOut
        );

        if consensus.approvals >= consensus.threshold {
            consensus.status = ConsensusStatus::Approved;
        } else {
            consensus.status = ConsensusStatus::Rejected;
        }
        
        consensus.finalized_at = now;

        msg!("Consensus finalized by timeout");
        Ok(())
    }
}

// =============================================================================
// CONTEXTS
// =============================================================================

#[derive(Accounts)]
pub struct InitializeConfig<'info> {
    #[account(
        init,
        payer = payer,
        space = 8 + GlobalConfig::LEN,
        seeds = [b"config"],
        bump
    )]
    pub config: Account<'info, GlobalConfig>,
    
    #[account(mut)]
    pub payer: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(validator_name: String)]
pub struct RegisterValidator<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + ValidatorRegistry::LEN,
        seeds = [b"validator", owner.key().as_ref()],
        bump
    )]
    pub validator: Account<'info, ValidatorRegistry>,
    
    #[account(mut)]
    pub config: Account<'info, GlobalConfig>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(agent_id: String, action_type: String)]
pub struct RequestConsensus<'info> {
    #[account(
        init,
        payer = requester,
        space = 8 + ConsensusRequest::LEN,
        seeds = [
            b"consensus",
            agent_id.as_bytes(),
            action_type.as_bytes(),
            requester.key().as_ref()
        ],
        bump
    )]
    pub consensus: Account<'info, ConsensusRequest>,
    
    #[account(mut)]
    pub config: Account<'info, GlobalConfig>,
    
    #[account(mut)]
    pub requester: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(request_id: String)]
pub struct CastVote<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + VoteRecord::LEN,
        seeds = [
            b"vote",
            consensus.key().as_ref(),
            validator.key().as_ref()
        ],
        bump
    )]
    pub vote: Account<'info, VoteRecord>,
    
    #[account(mut)]
    pub consensus: Account<'info, ConsensusRequest>,
    
    #[account(
        mut,
        has_one = owner,
        constraint = validator.is_active @ ErrorCode::ValidatorNotActive
    )]
    pub validator: Account<'info, ValidatorRegistry>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct FinalizeConsensus<'info> {
    #[account(
        mut,
        constraint = matches!(consensus.status, ConsensusStatus::Pending) @ ErrorCode::ConsensusAlreadyFinalized
    )]
    pub consensus: Account<'info, ConsensusRequest>,
}

// =============================================================================
// ACCOUNTS
// =============================================================================

#[account]
pub struct GlobalConfig {
    pub authority: Pubkey,              // 32
    pub min_stake_for_validator: u64,   // 8
    pub total_validators: u64,          // 8
    pub total_consensus_requests: u64,  // 8
    pub bump: u8,                       // 1
}

impl GlobalConfig {
    pub const LEN: usize = 32 + 8 + 8 + 8 + 1;
}

#[account]
pub struct ValidatorRegistry {
    pub owner: Pubkey,              // 32
    pub name: String,               // 4 + 64 = 68
    pub metadata_uri: String,       // 4 + 200 = 204
    pub stake_amount: u64,          // 8
    pub is_active: bool,            // 1
    pub total_votes: u64,           // 8
    pub registered_at: i64,         // 8
    pub bump: u8,                   // 1
}

impl ValidatorRegistry {
    pub const LEN: usize = 32 + 68 + 204 + 8 + 1 + 8 + 8 + 1;
}

#[account]
pub struct ConsensusRequest {
    pub agent_id: String,                       // 4 + 32 = 36
    pub requester: Pubkey,                      // 32
    pub action_type: String,                    // 4 + 64 = 68
    pub data_hash: [u8; 32],                    // 32
    pub threshold: u8,                          // 1
    pub validator_keys: Vec<Pubkey>,            // 4 + (32 * 10) = 324
    pub approvals: u8,                          // 1
    pub rejections: u8,                         // 1
    pub status: ConsensusStatus,                // 1
    pub requested_at: i64,                      // 8
    pub finalized_at: i64,                      // 8
    pub bump: u8,                               // 1
}

impl ConsensusRequest {
    pub const LEN: usize = 36 + 32 + 68 + 32 + 1 + 324 + 1 + 1 + 1 + 8 + 8 + 1;
}

#[account]
pub struct VoteRecord {
    pub consensus: Pubkey,          // 32
    pub validator: Pubkey,          // 32
    pub request_id: String,         // 4 + 64 = 68
    pub approve: bool,              // 1
    pub evidence_uri: String,       // 4 + 200 = 204
    pub voted_at: i64,              // 8
    pub bump: u8,                   // 1
}

impl VoteRecord {
    pub const LEN: usize = 32 + 32 + 68 + 1 + 204 + 8 + 1;
}

// =============================================================================
// ENUMS
// =============================================================================

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum ConsensusStatus {
    Pending,
    Approved,
    Rejected,
}

// =============================================================================
// ERRORS
// =============================================================================

#[error_code]
pub enum ErrorCode {
    #[msg("Agent ID too long (max 32 chars)")]
    AgentIdTooLong,
    
    #[msg("Validator name too long (max 64 chars)")]
    ValidatorNameTooLong,
    
    #[msg("Action type too long (max 64 chars)")]
    ActionTypeTooLong,
    
    #[msg("Request ID too long (max 64 chars)")]
    RequestIdTooLong,
    
    #[msg("Metadata URI too long (max 200 chars)")]
    MetadataUriTooLong,
    
    #[msg("Too many validators (max 10)")]
    TooManyValidators,
    
    #[msg("Invalid threshold")]
    InvalidThreshold,
    
    #[msg("Validator is not active")]
    ValidatorNotActive,
    
    #[msg("Validator not in consensus validator list")]
    ValidatorNotInList,
    
    #[msg("Consensus already finalized")]
    ConsensusAlreadyFinalized,
    
    #[msg("Consensus not timed out yet (24h)")]
    ConsensusNotTimedOut,
}

use anchor_lang::prelude::*;

#[error_code]
pub enum SPL8004Error {
    #[msg("Agent ID exceeds maximum length of 64 characters")]
    AgentIdTooLong,

    #[msg("Metadata URI exceeds maximum length of 200 characters")]
    MetadataUriTooLong,

    #[msg("Evidence URI exceeds maximum length of 200 characters")]
    EvidenceUriTooLong,

    #[msg("Agent is not active")]
    AgentNotActive,

    #[msg("Unauthorized: caller is not the agent owner")]
    Unauthorized,

    #[msg("Invalid reputation score")]
    InvalidReputationScore,

    #[msg("Validation already exists for this task hash")]
    ValidationAlreadyExists,

    #[msg("Insufficient reputation score for this action")]
    InsufficientReputation,

    #[msg("Commission rate exceeds maximum allowed (10%)")]
    InvalidCommissionRate,

    #[msg("Reward claim too early, must wait 24 hours")]
    RewardClaimTooEarly,

    #[msg("No rewards available to claim")]
    NoRewardsAvailable,

    #[msg("Arithmetic overflow")]
    ArithmeticOverflow,

    #[msg("Agent already registered")]
    AgentAlreadyRegistered,

    #[msg("Validator is not active or doesn't meet minimum stake")]
    ValidatorNotActive,

    #[msg("Insufficient stake amount")]
    InsufficientStake,

    #[msg("Reason text exceeds maximum length of 200 characters")]
    ReasonTooLong,

    #[msg("Invalid score delta: must be between -500 and +500")]
    InvalidScoreDelta,

    // Task Management Errors
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

    #[msg("Task is not open for bidding")]
    TaskNotOpen,

    #[msg("Bid amount must be > 0 and <= task budget")]
    InvalidBidAmount,

    #[msg("Message is too long (max 128 chars)")]
    MessageTooLong,

    #[msg("Only task publisher can accept bids")]
    NotTaskPublisher,

    #[msg("Bid does not match task")]
    BidTaskMismatch,

    #[msg("Bid is not pending")]
    BidNotPending,
}

use anchor_lang::prelude::*;

// Program ID updated to new deployment G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW
// (previous old ID was ErnVq9bZK58iJAFHLt1zoaHz8zycMeJ85pLMhuzfQzPV)
declare_id!("G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW");

pub mod state;
pub mod instructions;
pub mod errors;
pub mod constants;

use instructions::*;

#[program]
pub mod spl_8004 {
    use super::*;

    pub fn initialize_config(
        ctx: Context<InitializeConfig>,
        commission_rate: u16,
        treasury: Pubkey,
    ) -> Result<()> {
        instructions::initialize_config::handler(ctx, commission_rate, treasury)
    }

    pub fn register_agent(
        ctx: Context<RegisterAgent>,
        agent_id: String,
        metadata_uri: String,
    ) -> Result<()> {
        instructions::register_agent::handler(ctx, agent_id, metadata_uri)
    }

    pub fn update_metadata(
        ctx: Context<UpdateMetadata>,
        new_metadata_uri: String,
    ) -> Result<()> {
        instructions::update_metadata::handler(ctx, new_metadata_uri)
    }

    pub fn submit_validation(
        ctx: Context<SubmitValidation>,
        task_hash: [u8; 32],
        approved: bool,
        evidence_uri: String,
    ) -> Result<()> {
        instructions::submit_validation::handler(ctx, task_hash, approved, evidence_uri)
    }

    pub fn update_reputation(
        ctx: Context<UpdateReputation>,
    ) -> Result<()> {
        instructions::update_reputation::handler(ctx)
    }

    pub fn deactivate_agent(
        ctx: Context<DeactivateAgent>,
    ) -> Result<()> {
        instructions::deactivate_agent::handler(ctx)
    }

    pub fn claim_rewards(
        ctx: Context<ClaimRewards>,
    ) -> Result<()> {
        instructions::claim_rewards::handler(ctx)
    }

    pub fn stake_validator(
        ctx: Context<StakeValidator>,
        amount: u64,
    ) -> Result<()> {
        instructions::stake_validator::handler(ctx, amount)
    }

    pub fn unstake_validator(
        ctx: Context<UnstakeValidator>,
        amount: u64,
    ) -> Result<()> {
        instructions::unstake_validator::handler(ctx, amount)
    }

    pub fn assign_reputation(
        ctx: Context<AssignReputation>,
        score_delta: i64,
        reason: String,
    ) -> Result<()> {
        instructions::assign_reputation::handler(ctx, score_delta, reason)
    }

    pub fn publish_task(
        ctx: Context<PublishTask>,
        task_id: String,
        title: String,
        description: String,
        budget: u64,
        category: String,
        deadline: Option<i64>,
    ) -> Result<()> {
        instructions::publish_task::handler(ctx, task_id, title, description, budget, category, deadline)
    }

    pub fn submit_bid(
        ctx: Context<SubmitBid>,
        bid_seed: String,
        amount: u64,
        estimated_duration: i64,
        message: String,
    ) -> Result<()> {
        instructions::submit_bid::handler(ctx, bid_seed, amount, estimated_duration, message)
    }

    pub fn accept_bid(
        ctx: Context<AcceptBid>,
    ) -> Result<()> {
        instructions::accept_bid::handler(ctx)
    }
}

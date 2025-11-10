use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};
use mpl_token_metadata::instruction as mpl_instruction;

pub mod constants;
pub mod errors;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("ESEbyYMdhKUQ3h5AyqPwLhvkPhaMgugt3dRd3NXxUsH9");

#[program]
pub mod x404_bridge {
    use super::*;

    /// Initialize X404 bridge config
    pub fn initialize(
        ctx: Context<Initialize>,
        authority: Pubkey,
        treasury: Pubkey,
        platform_fee_bps: u16,
        base_price_lamports: u64,
    ) -> Result<()> {
        instructions::initialize::handler(ctx, authority, treasury, platform_fee_bps, base_price_lamports)
    }

    /// Convert SPL-8004 agent to NFT
    pub fn tokenize_agent(
        ctx: Context<TokenizeAgent>,
        agent_id: Pubkey,
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        instructions::tokenize_agent::handler(ctx, agent_id, name, symbol, uri)
    }

    /// Sync reputation from SPL-8004
    pub fn sync_reputation(
        ctx: Context<SyncReputation>,
        agent_id: Pubkey,
    ) -> Result<()> {
        instructions::sync_reputation::handler(ctx, agent_id)
    }

    /// List NFT for sale
    pub fn list_for_sale(
        ctx: Context<ListForSale>,
        agent_id: Pubkey,
        price: u64,
    ) -> Result<()> {
        instructions::list_for_sale::handler(ctx, agent_id, price)
    }

    /// Delist NFT from marketplace
    pub fn delist(
        ctx: Context<Delist>,
        agent_id: Pubkey,
    ) -> Result<()> {
        instructions::delist::handler(ctx, agent_id)
    }

    /// Purchase listed NFT
    pub fn purchase(
        ctx: Context<Purchase>,
        agent_id: Pubkey,
    ) -> Result<()> {
        instructions::purchase::handler(ctx, agent_id)
    }

    /// Update metadata URI
    pub fn update_metadata(
        ctx: Context<UpdateMetadata>,
        agent_id: Pubkey,
        new_uri: String,
    ) -> Result<()> {
        instructions::update_metadata::handler(ctx, agent_id, new_uri)
    }
}

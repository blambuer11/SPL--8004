use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::state::*;
use crate::errors::*;
use crate::constants::*;

#[derive(Accounts)]
#[instruction(agent_id: Pubkey)]
pub struct ListForSale<'info> {
    #[account(
        seeds = [CONFIG_SEED],
        bump = config.bump
    )]
    pub config: Account<'info, X404Config>,

    #[account(
        mut,
        seeds = [AGENT_NFT_SEED, agent_id.as_ref()],
        bump = agent_nft.bump,
        constraint = agent_nft.owner == seller.key() @ X404Error::NotOwner,
        constraint = !agent_nft.is_listed @ X404Error::AlreadyListed
    )]
    pub agent_nft: Account<'info, AgentNFT>,

    #[account(
        init,
        payer = seller,
        space = Listing::LEN,
        seeds = [LISTING_SEED, agent_id.as_ref()],
        bump
    )]
    pub listing: Account<'info, Listing>,

    #[account(mut)]
    pub seller: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<ListForSale>,
    agent_id: Pubkey,
    price: u64,
) -> Result<()> {
    let config = &ctx.accounts.config;
    let agent_nft = &mut ctx.accounts.agent_nft;
    let listing = &mut ctx.accounts.listing;
    let clock = Clock::get()?;

    require!(!config.paused, X404Error::BridgePaused);

    // Calculate floor price
    let floor_price = agent_nft.calculate_floor_price(config.base_price_lamports);

    require!(
        price >= floor_price,
        X404Error::PriceBelowFloor
    );

    // Initialize listing
    listing.agent_id = agent_id;
    listing.seller = ctx.accounts.seller.key();
    listing.list_price = price;
    listing.floor_price = floor_price;
    listing.listed_at = clock.unix_timestamp;
    listing.expires_at = None; // No expiration by default
    listing.bump = ctx.bumps.listing;

    // Mark as listed
    agent_nft.is_listed = true;

    msg!("NFT listed for sale!");
    msg!("Agent ID: {}", agent_id);
    msg!("Price: {} SOL", price as f64 / 1_000_000_000.0);
    msg!("Floor price: {} SOL", floor_price as f64 / 1_000_000_000.0);

    Ok(())
}

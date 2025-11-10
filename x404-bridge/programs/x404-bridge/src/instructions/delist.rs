use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::*;
use crate::constants::*;

#[derive(Accounts)]
#[instruction(agent_id: Pubkey)]
pub struct Delist<'info> {
    #[account(
        seeds = [CONFIG_SEED],
        bump = config.bump
    )]
    pub config: Account<'info, X404Config>,

    #[account(
        mut,
        seeds = [AGENT_NFT_SEED, agent_id.as_ref()],
        bump = agent_nft.bump,
        constraint = agent_nft.owner == seller.key() @ X404Error::NotOwner
    )]
    pub agent_nft: Account<'info, AgentNFT>,

    #[account(
        mut,
        seeds = [LISTING_SEED, agent_id.as_ref()],
        bump = listing.bump,
        constraint = listing.seller == seller.key() @ X404Error::Unauthorized,
        close = seller
    )]
    pub listing: Account<'info, Listing>,

    #[account(mut)]
    pub seller: Signer<'info>,
}

pub fn handler(
    ctx: Context<Delist>,
    agent_id: Pubkey,
) -> Result<()> {
    let agent_nft = &mut ctx.accounts.agent_nft;

    require!(!ctx.accounts.config.paused, X404Error::BridgePaused);
    require!(agent_nft.is_listed, X404Error::NotListed);

    // Mark as not listed
    agent_nft.is_listed = false;

    msg!("NFT delisted!");
    msg!("Agent ID: {}", agent_id);

    // Listing account closes automatically (returning rent to seller)

    Ok(())
}

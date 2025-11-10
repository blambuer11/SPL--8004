use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};
use crate::state::*;
use crate::errors::*;
use crate::constants::*;

#[derive(Accounts)]
#[instruction(agent_id: Pubkey)]
pub struct Purchase<'info> {
    #[account(
        mut,
        seeds = [CONFIG_SEED],
        bump = config.bump
    )]
    pub config: Account<'info, X404Config>,

    #[account(
        mut,
        seeds = [AGENT_NFT_SEED, agent_id.as_ref()],
        bump = agent_nft.bump
    )]
    pub agent_nft: Account<'info, AgentNFT>,

    #[account(
        mut,
        seeds = [LISTING_SEED, agent_id.as_ref()],
        bump = listing.bump,
        close = seller
    )]
    pub listing: Account<'info, Listing>,

    #[account(address = agent_nft.mint)]
    pub nft_mint: Account<'info, Mint>,

    #[account(
        mut,
        associated_token::mint = nft_mint,
        associated_token::authority = seller,
    )]
    pub seller_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = nft_mint,
        associated_token::authority = buyer,
    )]
    pub buyer_token_account: Account<'info, TokenAccount>,

    /// CHECK: Seller receives payment
    #[account(
        mut,
        address = listing.seller
    )]
    pub seller: AccountInfo<'info>,

    #[account(mut)]
    pub buyer: Signer<'info>,

    /// CHECK: Treasury receives platform fee
    #[account(
        mut,
        address = config.treasury
    )]
    pub treasury: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<Purchase>,
    agent_id: Pubkey,
) -> Result<()> {
    let config = &mut ctx.accounts.config;
    let agent_nft = &mut ctx.accounts.agent_nft;
    let listing = &ctx.accounts.listing;
    let clock = Clock::get()?;

    require!(!config.paused, X404Error::BridgePaused);
    require!(agent_nft.is_listed, X404Error::NotListed);
    require!(
        ctx.accounts.buyer.key() != listing.seller,
        X404Error::CannotPurchaseOwn
    );

    // Check listing not expired
    require!(
        !listing.is_expired(clock.unix_timestamp),
        X404Error::ListingExpired
    );

    // Calculate platform fee
    let platform_fee = (listing.list_price as u128)
        .checked_mul(config.platform_fee_bps as u128)
        .unwrap()
        .checked_div(BPS_DENOMINATOR as u128)
        .unwrap() as u64;

    let seller_amount = listing.list_price
        .checked_sub(platform_fee)
        .ok_or(X404Error::ArithmeticOverflow)?;

    // Transfer platform fee to treasury
    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.buyer.to_account_info(),
                to: ctx.accounts.treasury.to_account_info(),
            },
        ),
        platform_fee,
    )?;

    // Transfer payment to seller
    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.buyer.to_account_info(),
                to: ctx.accounts.seller.to_account_info(),
            },
        ),
        seller_amount,
    )?;

    // Transfer NFT from seller to buyer
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.seller_token_account.to_account_info(),
                to: ctx.accounts.buyer_token_account.to_account_info(),
                authority: ctx.accounts.seller.to_account_info(),
            },
        ),
        1, // Transfer 1 NFT
    )?;

    // Update AgentNFT state
    agent_nft.owner = ctx.accounts.buyer.key();
    agent_nft.total_transfers += 1;
    agent_nft.is_listed = false;

    // Update config stats
    config.total_volume = config.total_volume
        .checked_add(listing.list_price)
        .ok_or(X404Error::ArithmeticOverflow)?;

    msg!("NFT purchased!");
    msg!("Agent ID: {}", agent_id);
    msg!("Price: {} SOL", listing.list_price as f64 / 1_000_000_000.0);
    msg!("Platform fee: {} SOL", platform_fee as f64 / 1_000_000_000.0);
    msg!("Seller receives: {} SOL", seller_amount as f64 / 1_000_000_000.0);
    msg!("New owner: {}", ctx.accounts.buyer.key());

    // Listing account closes automatically

    Ok(())
}

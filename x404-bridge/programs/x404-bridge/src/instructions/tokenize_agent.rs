use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_spl::token::{self, Mint, Token, TokenAccount, MintTo};
use anchor_spl::associated_token::AssociatedToken;
use mpl_token_metadata::state::DataV2;
use crate::state::*;
use crate::errors::*;
use crate::constants::*;
use solana_program::program::invoke_signed;

#[derive(Accounts)]
#[instruction(agent_id: Pubkey)]
pub struct TokenizeAgent<'info> {
    #[account(
        mut,
        seeds = [CONFIG_SEED],
        bump = config.bump
    )]
    pub config: Account<'info, X404Config>,

    #[account(
        init,
        payer = minter,
        space = AgentNFT::LEN,
        seeds = [AGENT_NFT_SEED, agent_id.as_ref()],
        bump
    )]
    pub agent_nft: Account<'info, AgentNFT>,

    #[account(
        init,
        payer = minter,
        mint::decimals = 0,
        mint::authority = agent_nft,
        mint::freeze_authority = agent_nft,
    )]
    pub nft_mint: Account<'info, Mint>,

    #[account(
        init,
        payer = minter,
        associated_token::mint = nft_mint,
        associated_token::authority = minter,
    )]
    pub token_account: Account<'info, TokenAccount>,

    /// CHECK: Metaplex metadata account
    #[account(mut)]
    pub metadata_account: AccountInfo<'info>,

    #[account(mut)]
    pub minter: Signer<'info>,

    /// CHECK: SPL-8004 identity account (validated via CPI)
    pub spl8004_identity: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    
    /// CHECK: Token Metadata Program
    #[account(address = mpl_token_metadata::ID)]
    pub token_metadata_program: AccountInfo<'info>,
}

pub fn handler(
    ctx: Context<TokenizeAgent>,
    agent_id: Pubkey,
    name: String,
    symbol: String,
    uri: String,
) -> Result<()> {
    let config = &mut ctx.accounts.config;
    let agent_nft = &mut ctx.accounts.agent_nft;
    let clock = Clock::get()?;

    // Validations
    require!(!config.paused, X404Error::BridgePaused);
    require!(name.len() <= MAX_NAME_LENGTH, X404Error::NameTooLong);
    require!(symbol.len() <= MAX_SYMBOL_LENGTH, X404Error::SymbolTooLong);
    require!(uri.len() <= MAX_URI_LENGTH, X404Error::InvalidMetadataUri);

    // Mint NFT (supply = 1)
    let seeds = &[
        AGENT_NFT_SEED,
        agent_id.as_ref(),
        &[ctx.bumps.agent_nft],
    ];
    let signer_seeds = &[&seeds[..]];

    token::mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.nft_mint.to_account_info(),
                to: ctx.accounts.token_account.to_account_info(),
                authority: agent_nft.to_account_info(),
            },
            signer_seeds,
        ),
        1, // Mint exactly 1 NFT
    )?;

    // Create Metaplex metadata
    let metadata_infos = vec![
        ctx.accounts.metadata_account.to_account_info(),
        ctx.accounts.nft_mint.to_account_info(),
        agent_nft.to_account_info(),
        ctx.accounts.minter.to_account_info(),
        ctx.accounts.system_program.to_account_info(),
        ctx.accounts.rent.to_account_info(),
    ];

    msg!("Creating Metaplex metadata...");
    invoke_signed(
        &mpl_token_metadata::instruction::create_metadata_accounts_v3(
            *ctx.accounts.token_metadata_program.key,
            *ctx.accounts.metadata_account.key,
            ctx.accounts.nft_mint.key(),
            agent_nft.key(),
            ctx.accounts.minter.key(),
            agent_nft.key(),
            name.clone(),
            symbol.clone(),
            uri.clone(),
            None, // No creators
            0,    // No seller fee
            true, // Update authority is signer
            true, // Is mutable
            None, // No collection
            None, // No uses
            None, // No collection details
        ),
        metadata_infos.as_slice(),
        signer_seeds,
    )?;

    // Initialize AgentNFT account
    agent_nft.agent_id = agent_id;
    agent_nft.mint = ctx.accounts.nft_mint.key();
    agent_nft.owner = ctx.accounts.minter.key();
    agent_nft.original_minter = ctx.accounts.minter.key();
    agent_nft.reputation_score = 0; // Will be synced
    agent_nft.last_reputation_sync = 0;
    agent_nft.metadata_uri = uri;
    agent_nft.minted_at = clock.unix_timestamp;
    agent_nft.total_transfers = 0;
    agent_nft.is_listed = false;
    agent_nft.bump = ctx.bumps.agent_nft;

    // Update config
    config.total_minted += 1;

    msg!("Agent tokenized as NFT!");
    msg!("Agent ID: {}", agent_id);
    msg!("NFT Mint: {}", ctx.accounts.nft_mint.key());
    msg!("Owner: {}", ctx.accounts.minter.key());

    Ok(())
}

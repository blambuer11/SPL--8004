use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::*;
use crate::constants::*;

#[derive(Accounts)]
#[instruction(agent_id: Pubkey)]
pub struct UpdateMetadata<'info> {
    #[account(
        seeds = [CONFIG_SEED],
        bump = config.bump
    )]
    pub config: Account<'info, X404Config>,

    #[account(
        mut,
        seeds = [AGENT_NFT_SEED, agent_id.as_ref()],
        bump = agent_nft.bump,
        constraint = agent_nft.owner == owner.key() @ X404Error::NotOwner
    )]
    pub agent_nft: Account<'info, AgentNFT>,

    /// CHECK: Metaplex metadata account
    #[account(mut)]
    pub metadata_account: AccountInfo<'info>,

    #[account(mut)]
    pub owner: Signer<'info>,

    /// CHECK: Token Metadata Program
    #[account(address = mpl_token_metadata::ID)]
    pub token_metadata_program: AccountInfo<'info>,
}

pub fn handler(
    ctx: Context<UpdateMetadata>,
    agent_id: Pubkey,
    new_uri: String,
) -> Result<()> {
    let agent_nft = &mut ctx.accounts.agent_nft;

    require!(!ctx.accounts.config.paused, X404Error::BridgePaused);
    require!(new_uri.len() <= MAX_URI_LENGTH, X404Error::InvalidMetadataUri);

    // Update Metaplex metadata URI
    let seeds = &[
        AGENT_NFT_SEED,
        agent_id.as_ref(),
        &[agent_nft.bump],
    ];
    let signer_seeds = &[&seeds[..]];

    let metadata_infos = vec![
        ctx.accounts.metadata_account.to_account_info(),
        agent_nft.to_account_info(),
    ];

    invoke_signed(
        &mpl_token_metadata::instruction::update_metadata_accounts_v2(
            *ctx.accounts.token_metadata_program.key,
            *ctx.accounts.metadata_account.key,
            agent_nft.key(),
            None, // No new update authority
            None, // No new data (name/symbol stay same)
            None, // No new primary sale happened
            Some(true), // Is mutable
        ),
        metadata_infos.as_slice(),
        signer_seeds,
    )?;

    // Update AgentNFT state
    agent_nft.metadata_uri = new_uri.clone();

    msg!("Metadata updated!");
    msg!("Agent ID: {}", agent_id);
    msg!("New URI: {}", new_uri);

    Ok(())
}

use solana_program::program::invoke_signed;

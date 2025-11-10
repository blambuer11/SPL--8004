use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::*;
use crate::constants::*;

#[derive(Accounts)]
#[instruction(agent_id: Pubkey)]
pub struct SyncReputation<'info> {
    #[account(
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

    /// CHECK: SPL-8004 reputation account (validated via CPI)
    pub spl8004_reputation: AccountInfo<'info>,

    pub oracle: Signer<'info>, // Anyone can call (permissionless)
}

pub fn handler(
    ctx: Context<SyncReputation>,
    agent_id: Pubkey,
) -> Result<()> {
    let agent_nft = &mut ctx.accounts.agent_nft;
    let clock = Clock::get()?;

    require!(!ctx.accounts.config.paused, X404Error::BridgePaused);

    // TODO: Read reputation from SPL-8004 via CPI or account deserialization
    // For now, simulate reading from account data
    let reputation_data = ctx.accounts.spl8004_reputation.try_borrow_data()?;
    
    // Parse reputation score (assuming it's at offset 40 as u32)
    let reputation_score = u32::from_le_bytes([
        reputation_data[40],
        reputation_data[41],
        reputation_data[42],
        reputation_data[43],
    ]);

    require!(
        reputation_score <= MAX_REPUTATION,
        X404Error::InvalidReputation
    );

    // Update AgentNFT
    let old_reputation = agent_nft.reputation_score;
    agent_nft.reputation_score = reputation_score;
    agent_nft.last_reputation_sync = clock.unix_timestamp;

    msg!("Reputation synced!");
    msg!("Agent ID: {}", agent_id);
    msg!("Old reputation: {}", old_reputation);
    msg!("New reputation: {}", reputation_score);
    msg!("Timestamp: {}", clock.unix_timestamp);

    Ok(())
}

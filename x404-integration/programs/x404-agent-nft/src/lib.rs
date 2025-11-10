use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, MintTo, Transfer};

declare_id!("HPwBe2UiSUEfJj6KZ2aSQcbcP8smb8H1F2t3nx5gU8tU");

#[program]
pub mod x404_agent_nft {
    use super::*;

    /// Tokenize an SPL-8004 agent into an X404 NFT
    pub fn tokenize_agent(
        ctx: Context<TokenizeAgent>,
        agent_id: String,
        initial_price: u64,
        metadata_uri: String,
    ) -> Result<()> {
        let nft = &mut ctx.accounts.nft;
        nft.agent_id = agent_id;
        nft.owner = ctx.accounts.owner.key();
        nft.mint = ctx.accounts.nft_mint.key();
        nft.price = initial_price;
        nft.reputation_score = 5000; // Default score
        nft.metadata_uri = metadata_uri;
        nft.is_listed = false;
        nft.created_at = Clock::get()?.unix_timestamp;
        nft.bump = ctx.bumps.nft;

        // Mint the NFT to owner
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.nft_mint.to_account_info(),
                to: ctx.accounts.owner_token_account.to_account_info(),
                authority: ctx.accounts.nft_mint.to_account_info(),
            },
        );
        token::mint_to(cpi_ctx, 1)?;

        msg!("✅ Agent tokenized: {} -> NFT {}", nft.agent_id, nft.mint);
        Ok(())
    }

    /// Sync reputation from SPL-8004 to X404 NFT
    pub fn sync_reputation(
        ctx: Context<SyncReputation>,
        new_reputation: u32,
    ) -> Result<()> {
        let nft = &mut ctx.accounts.nft;
        nft.reputation_score = new_reputation;
        
        // Dynamic pricing based on reputation
        nft.price = calculate_price_from_reputation(new_reputation);
        
        msg!("📊 Reputation synced: {} -> score {}", nft.agent_id, new_reputation);
        Ok(())
    }

    /// List NFT for sale
    pub fn list_for_sale(ctx: Context<ListForSale>, price: u64) -> Result<()> {
        let nft = &mut ctx.accounts.nft;
        require!(nft.owner == ctx.accounts.owner.key(), ErrorCode::NotOwner);
        
        nft.price = price;
        nft.is_listed = true;
        
        msg!("🏷️ NFT listed: {} for {} lamports", nft.agent_id, price);
        Ok(())
    }

    /// Purchase listed NFT
    pub fn purchase(ctx: Context<Purchase>) -> Result<()> {
        let nft = &mut ctx.accounts.nft;
        require!(nft.is_listed, ErrorCode::NotListed);
        
        // Transfer payment from buyer to seller
        let cpi_ctx = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.buyer.to_account_info(),
                to: ctx.accounts.seller.to_account_info(),
            },
        );
        anchor_lang::system_program::transfer(cpi_ctx, nft.price)?;

        // Transfer NFT from seller to buyer
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.seller_token_account.to_account_info(),
                to: ctx.accounts.buyer_token_account.to_account_info(),
                authority: ctx.accounts.seller.to_account_info(),
            },
        );
        token::transfer(cpi_ctx, 1)?;

        nft.owner = ctx.accounts.buyer.key();
        nft.is_listed = false;
        
        msg!("🎉 NFT purchased: {} by {}", nft.agent_id, ctx.accounts.buyer.key());
        Ok(())
    }
}

/// Helper function to calculate dynamic price based on reputation
fn calculate_price_from_reputation(reputation: u32) -> u64 {
    // Base price: 0.1 SOL (100M lamports)
    let base_price: u64 = 100_000_000;
    
    // Price increases with reputation
    // 5000 score = 1x, 10000 score = 2x, etc.
    let multiplier = (reputation as u64) / 5000;
    base_price * multiplier.max(1)
}

// Contexts
#[derive(Accounts)]
#[instruction(agent_id: String)]
pub struct TokenizeAgent<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + AgentNFT::INIT_SPACE,
        seeds = [b"nft", agent_id.as_bytes()],
        bump
    )]
    pub nft: Account<'info, AgentNFT>,
    
    #[account(
        init,
        payer = owner,
        mint::decimals = 0,
        mint::authority = nft_mint,
        mint::freeze_authority = nft_mint,
    )]
    pub nft_mint: Account<'info, Mint>,
    
    #[account(
        init,
        payer = owner,
        associated_token::mint = nft_mint,
        associated_token::authority = owner,
    )]
    pub owner_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct SyncReputation<'info> {
    #[account(mut)]
    pub nft: Account<'info, AgentNFT>,
    
    #[account(constraint = authority.key() == nft.owner)]
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct ListForSale<'info> {
    #[account(mut)]
    pub nft: Account<'info, AgentNFT>,
    
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct Purchase<'info> {
    #[account(mut)]
    pub nft: Account<'info, AgentNFT>,
    
    #[account(mut)]
    pub seller: SystemAccount<'info>,
    
    #[account(mut)]
    pub seller_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub buyer: Signer<'info>,
    
    #[account(mut)]
    pub buyer_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

// Account structs
#[account]
#[derive(InitSpace)]
pub struct AgentNFT {
    #[max_len(64)]
    pub agent_id: String,
    pub owner: Pubkey,
    pub mint: Pubkey,
    pub price: u64,
    pub reputation_score: u32,
    #[max_len(256)]
    pub metadata_uri: String,
    pub is_listed: bool,
    pub created_at: i64,
    pub bump: u8,
}

// Error codes
#[error_code]
pub enum ErrorCode {
    #[msg("You are not the owner of this NFT")]
    NotOwner,
    #[msg("This NFT is not listed for sale")]
    NotListed,
}

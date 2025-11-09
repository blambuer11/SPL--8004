use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Mint, MintTo, Transfer};

declare_id!("HPwBe2UiSUEfJj6KZ2aSQcbcP8smb8H1F2t3nx5gU8tU");

#[program]
pub mod x404_agent_nft {
    use super::*;

    /// Initialize the X404 program state
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let state = &mut ctx.accounts.state;
        state.authority = ctx.accounts.authority.key();
        state.total_agents = 0;
        state.total_volume = 0;
        state.oracle_pubkey = ctx.accounts.authority.key(); // Initial oracle
        state.bump = ctx.bumps.state;
        
        msg!("X404 Agent NFT Program initialized");
        Ok(())
    }

    /// Mint a new Agent NFT from SPL-8004 identity
    pub fn mint_agent_nft(
        ctx: Context<MintAgentNFT>,
        agent_id: Pubkey,
        metadata_uri: String,
        initial_reputation: u32,
    ) -> Result<()> {
        require!(
            metadata_uri.len() <= 200,
            ErrorCode::MetadataUriTooLong
        );
        require!(
            initial_reputation <= 10000,
            ErrorCode::InvalidReputation
        );

        let agent_nft = &mut ctx.accounts.agent_nft;
        let state = &mut ctx.accounts.state;

        agent_nft.agent_id = agent_id;
        agent_nft.owner = ctx.accounts.owner.key();
        agent_nft.mint = ctx.accounts.mint.key();
        agent_nft.reputation_score = initial_reputation;
        agent_nft.metadata_uri = metadata_uri;
        agent_nft.created_at = Clock::get()?.unix_timestamp;
        agent_nft.last_sync = Clock::get()?.unix_timestamp;
        agent_nft.floor_price = 0;
        agent_nft.total_volume = 0;
        agent_nft.is_listed = false;
        agent_nft.list_price = 0;
        agent_nft.bump = ctx.bumps.agent_nft;

        state.total_agents = state.total_agents.checked_add(1).unwrap();

        // Mint 1 NFT token to owner
        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.state.to_account_info(),
        };
        // Sign with state PDA (seed: ["state"])
        let signer_seeds: &[&[u8]] = &[
            b"state",
            &[ctx.accounts.state.bump],
        ];
        let signer: &[&[&[u8]]] = &[&signer_seeds];
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts,
            signer,
        );
        token::mint_to(cpi_ctx, 1)?;

        emit!(AgentNFTMinted {
            agent_id,
            nft_mint: ctx.accounts.mint.key(),
            owner: ctx.accounts.owner.key(),
            reputation: initial_reputation,
            timestamp: Clock::get()?.unix_timestamp,
        });

        msg!("Agent NFT minted: {} with reputation {}", agent_id, initial_reputation);
        Ok(())
    }

    /// Update reputation score from oracle
    pub fn update_reputation(
        ctx: Context<UpdateReputation>,
        new_score: u32,
    ) -> Result<()> {
        require!(
            new_score <= 10000,
            ErrorCode::InvalidReputation
        );

        let agent_nft = &mut ctx.accounts.agent_nft;
        let old_score = agent_nft.reputation_score;
        
        agent_nft.reputation_score = new_score;
        agent_nft.last_sync = Clock::get()?.unix_timestamp;

        // Recalculate floor price based on reputation
        // Formula: base_price * (1 + reputation/10000)
        let base_price = 1_000_000_000; // 1 SOL in lamports
        agent_nft.floor_price = base_price + (base_price * new_score as u64 / 10000);

        emit!(ReputationUpdated {
            agent_id: agent_nft.agent_id,
            nft_mint: agent_nft.mint,
            old_score,
            new_score,
            new_floor_price: agent_nft.floor_price,
            timestamp: Clock::get()?.unix_timestamp,
        });

        msg!("Reputation updated: {} → {}", old_score, new_score);
        Ok(())
    }

    /// List NFT for sale
    pub fn list_for_sale(
        ctx: Context<ListForSale>,
        price: u64,
    ) -> Result<()> {
        require!(price > 0, ErrorCode::InvalidPrice);

        let agent_nft = &mut ctx.accounts.agent_nft;
        agent_nft.is_listed = true;
        agent_nft.list_price = price;

        emit!(NFTListed {
            agent_id: agent_nft.agent_id,
            nft_mint: agent_nft.mint,
            seller: ctx.accounts.owner.key(),
            price,
            timestamp: Clock::get()?.unix_timestamp,
        });

        msg!("NFT listed for sale at {} lamports", price);
        Ok(())
    }

    /// Delist NFT from sale
    pub fn delist(ctx: Context<Delist>) -> Result<()> {
        let agent_nft = &mut ctx.accounts.agent_nft;
        agent_nft.is_listed = false;
        agent_nft.list_price = 0;

        msg!("NFT delisted from sale");
        Ok(())
    }

    /// Purchase listed NFT
    pub fn purchase(
        ctx: Context<Purchase>,
    ) -> Result<()> {
        let agent_nft = &mut ctx.accounts.agent_nft;
        require!(agent_nft.is_listed, ErrorCode::NotListed);

        let price = agent_nft.list_price;

        // Transfer SOL from buyer to seller
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.buyer.to_account_info(),
                to: ctx.accounts.seller.to_account_info(),
            },
        );
        anchor_lang::system_program::transfer(cpi_context, price)?;

        // Transfer NFT from seller to buyer
        let cpi_accounts = Transfer {
            from: ctx.accounts.seller_token_account.to_account_info(),
            to: ctx.accounts.buyer_token_account.to_account_info(),
            authority: ctx.accounts.seller.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts,
        );
        token::transfer(cpi_ctx, 1)?;

        // Update agent NFT state
        let old_owner = agent_nft.owner;
        agent_nft.owner = ctx.accounts.buyer.key();
        agent_nft.is_listed = false;
        agent_nft.list_price = 0;
        agent_nft.total_volume = agent_nft.total_volume.checked_add(price).unwrap();

        // Update global state
        let state = &mut ctx.accounts.state;
        state.total_volume = state.total_volume.checked_add(price).unwrap();

        emit!(NFTPurchased {
            agent_id: agent_nft.agent_id,
            nft_mint: agent_nft.mint,
            buyer: ctx.accounts.buyer.key(),
            seller: old_owner,
            price,
            timestamp: Clock::get()?.unix_timestamp,
        });

        msg!("NFT purchased for {} lamports", price);
        Ok(())
    }

    /// Update oracle authority (admin only)
    pub fn update_oracle(
        ctx: Context<UpdateOracle>,
        new_oracle: Pubkey,
    ) -> Result<()> {
        let state = &mut ctx.accounts.state;
        state.oracle_pubkey = new_oracle;

        msg!("Oracle updated to: {}", new_oracle);
        Ok(())
    }
}

// ========== ACCOUNTS ==========

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + ProgramState::INIT_SPACE,
        seeds = [b"state"],
        bump
    )]
    pub state: Account<'info, ProgramState>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(agent_id: Pubkey)]
pub struct MintAgentNFT<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + AgentNFT::INIT_SPACE,
        seeds = [b"agent_nft", agent_id.as_ref()],
        bump
    )]
    pub agent_nft: Account<'info, AgentNFT>,

    #[account(
        init,
        payer = owner,
        mint::decimals = 0,
        mint::authority = state,
        seeds = [b"mint", agent_id.as_ref()],
        bump
    )]
    pub mint: Account<'info, Mint>,

    #[account(
        init,
        payer = owner,
        associated_token::mint = mint,
        associated_token::authority = owner
    )]
    pub token_account: Account<'info, TokenAccount>,

    #[account(mut, seeds = [b"state"], bump = state.bump)]
    pub state: Account<'info, ProgramState>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, anchor_spl::associated_token::AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct UpdateReputation<'info> {
    #[account(
        mut,
        seeds = [b"agent_nft", agent_nft.agent_id.as_ref()],
        bump = agent_nft.bump
    )]
    pub agent_nft: Account<'info, AgentNFT>,

    #[account(seeds = [b"state"], bump = state.bump)]
    pub state: Account<'info, ProgramState>,

    #[account(mut, constraint = oracle.key() == state.oracle_pubkey @ ErrorCode::Unauthorized)]
    pub oracle: Signer<'info>,
}

#[derive(Accounts)]
pub struct ListForSale<'info> {
    #[account(
        mut,
        seeds = [b"agent_nft", agent_nft.agent_id.as_ref()],
        bump = agent_nft.bump,
        constraint = agent_nft.owner == owner.key() @ ErrorCode::Unauthorized
    )]
    pub agent_nft: Account<'info, AgentNFT>,

    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct Delist<'info> {
    #[account(
        mut,
        seeds = [b"agent_nft", agent_nft.agent_id.as_ref()],
        bump = agent_nft.bump,
        constraint = agent_nft.owner == owner.key() @ ErrorCode::Unauthorized
    )]
    pub agent_nft: Account<'info, AgentNFT>,

    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct Purchase<'info> {
    #[account(
        mut,
        seeds = [b"agent_nft", agent_nft.agent_id.as_ref()],
        bump = agent_nft.bump
    )]
    pub agent_nft: Account<'info, AgentNFT>,

    #[account(mut, seeds = [b"state"], bump = state.bump)]
    pub state: Account<'info, ProgramState>,

    #[account(mut)]
    pub buyer: Signer<'info>,

    /// CHECK: Seller receives payment
    #[account(mut, constraint = seller.key() == agent_nft.owner @ ErrorCode::Unauthorized)]
    pub seller: AccountInfo<'info>,

    #[account(mut)]
    pub seller_token_account: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = buyer,
        associated_token::mint = agent_nft.mint,
        associated_token::authority = buyer
    )]
    pub buyer_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, anchor_spl::associated_token::AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateOracle<'info> {
    #[account(
        mut,
        seeds = [b"state"],
        bump = state.bump,
        constraint = state.authority == authority.key() @ ErrorCode::Unauthorized
    )]
    pub state: Account<'info, ProgramState>,

    pub authority: Signer<'info>,
}

// ========== STATE ==========

#[account]
#[derive(InitSpace)]
pub struct ProgramState {
    pub authority: Pubkey,
    pub oracle_pubkey: Pubkey,
    pub total_agents: u64,
    pub total_volume: u64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct AgentNFT {
    pub agent_id: Pubkey,           // SPL-8004 identity PDA
    pub owner: Pubkey,              // Current NFT owner
    pub mint: Pubkey,               // NFT mint address
    pub reputation_score: u32,      // Synced from SPL-8004 (0-10000)
    #[max_len(200)]
    pub metadata_uri: String,       // Arweave/IPFS URI
    pub created_at: i64,            // Creation timestamp
    pub last_sync: i64,             // Last reputation sync
    pub floor_price: u64,           // Calculated floor price in lamports
    pub total_volume: u64,          // Lifetime trading volume
    pub is_listed: bool,            // Currently listed for sale
    pub list_price: u64,            // Listed price (if is_listed)
    pub bump: u8,
}

// ========== EVENTS ==========

#[event]
pub struct AgentNFTMinted {
    pub agent_id: Pubkey,
    pub nft_mint: Pubkey,
    pub owner: Pubkey,
    pub reputation: u32,
    pub timestamp: i64,
}

#[event]
pub struct ReputationUpdated {
    pub agent_id: Pubkey,
    pub nft_mint: Pubkey,
    pub old_score: u32,
    pub new_score: u32,
    pub new_floor_price: u64,
    pub timestamp: i64,
}

#[event]
pub struct NFTListed {
    pub agent_id: Pubkey,
    pub nft_mint: Pubkey,
    pub seller: Pubkey,
    pub price: u64,
    pub timestamp: i64,
}

#[event]
pub struct NFTPurchased {
    pub agent_id: Pubkey,
    pub nft_mint: Pubkey,
    pub buyer: Pubkey,
    pub seller: Pubkey,
    pub price: u64,
    pub timestamp: i64,
}

// ========== ERRORS ==========

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Metadata URI too long (max 200 chars)")]
    MetadataUriTooLong,
    #[msg("Invalid reputation score (must be 0-10000)")]
    InvalidReputation,
    #[msg("Invalid price")]
    InvalidPrice,
    #[msg("NFT not listed for sale")]
    NotListed,
}

use anchor_lang::prelude::*;

declare_id!("DTtjXcvxsKHnukZiLtaQ2dHJXC5HtUAwUa9WgsMd3So4");

#[program]
pub mod spl_tap {
    use super::*;

    /// Initialize global config
    pub fn initialize_config(
        ctx: Context<InitializeConfig>,
        authority: Pubkey,
        min_stake_for_issuer: u64,
    ) -> Result<()> {
        let config = &mut ctx.accounts.config;
        config.authority = authority;
        config.min_stake_for_issuer = min_stake_for_issuer;
        config.total_issuers = 0;
        config.total_attestations = 0;
        config.bump = ctx.bumps.config;
        
        msg!("SPL-TAP Config initialized");
        Ok(())
    }

    /// Register as attestation issuer (requires stake)
    pub fn register_issuer(
        ctx: Context<RegisterIssuer>,
        issuer_name: String,
        metadata_uri: String,
    ) -> Result<()> {
        require!(issuer_name.len() <= 64, ErrorCode::IssuerNameTooLong);
        require!(metadata_uri.len() <= 200, ErrorCode::MetadataUriTooLong);

        let issuer = &mut ctx.accounts.issuer;
        let config = &mut ctx.accounts.config;
        
        issuer.owner = ctx.accounts.owner.key();
        issuer.name = issuer_name;
        issuer.metadata_uri = metadata_uri;
        issuer.stake_amount = config.min_stake_for_issuer;
        issuer.is_active = true;
        issuer.total_attestations = 0;
        issuer.registered_at = Clock::get()?.unix_timestamp;
        issuer.bump = ctx.bumps.issuer;

        config.total_issuers += 1;

        msg!("Issuer registered: {}", issuer.name);
        Ok(())
    }

    /// Issue attestation for an agent
    pub fn issue_attestation(
        ctx: Context<IssueAttestation>,
        agent_id: String,
        attestation_type: String,
        claims_uri: String,
        expires_at: i64,
        signature: [u8; 64], // Ed25519 signature
    ) -> Result<()> {
        require!(agent_id.len() <= 32, ErrorCode::AgentIdTooLong);
        require!(attestation_type.len() <= 64, ErrorCode::AttestationTypeTooLong);
        require!(claims_uri.len() <= 200, ErrorCode::MetadataUriTooLong);

    let attestation = &mut ctx.accounts.attestation;
    // Capture issuer pubkey before taking a mutable reference to avoid borrow conflicts
    let issuer_key = ctx.accounts.issuer.key();
    let issuer = &mut ctx.accounts.issuer;
        
    attestation.agent_id = agent_id.clone();
    attestation.issuer = issuer_key;
        attestation.attestation_type = attestation_type.clone();
        attestation.claims_uri = claims_uri;
        attestation.issued_at = Clock::get()?.unix_timestamp;
        attestation.expires_at = expires_at;
        attestation.signature = signature;
        attestation.is_revoked = false;
        attestation.bump = ctx.bumps.attestation;

        issuer.total_attestations += 1;

        msg!("Attestation issued for agent: {} - {}", agent_id, attestation_type);
        Ok(())
    }

    /// Revoke attestation
    pub fn revoke_attestation(
        ctx: Context<RevokeAttestation>,
        reason: String,
    ) -> Result<()> {
        require!(reason.len() <= 200, ErrorCode::ReasonTooLong);

        let attestation = &mut ctx.accounts.attestation;
        attestation.is_revoked = true;

        msg!("Attestation revoked: {}", reason);
        Ok(())
    }

    /// Verify attestation validity
    pub fn verify_attestation(
        ctx: Context<VerifyAttestation>,
    ) -> Result<bool> {
        let attestation = &ctx.accounts.attestation;
        let now = Clock::get()?.unix_timestamp;

        let is_valid = !attestation.is_revoked && 
                      attestation.expires_at > now;

        msg!("Attestation valid: {}", is_valid);
        Ok(is_valid)
    }
}

// =============================================================================
// CONTEXTS
// =============================================================================

#[derive(Accounts)]
pub struct InitializeConfig<'info> {
    #[account(
        init,
        payer = payer,
        space = 8 + GlobalConfig::LEN,
        seeds = [b"config"],
        bump
    )]
    pub config: Account<'info, GlobalConfig>,
    
    #[account(mut)]
    pub payer: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(issuer_name: String)]
pub struct RegisterIssuer<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + IssuerRegistry::LEN,
        seeds = [b"issuer", owner.key().as_ref()],
        bump
    )]
    pub issuer: Account<'info, IssuerRegistry>,
    
    #[account(mut)]
    pub config: Account<'info, GlobalConfig>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(agent_id: String, attestation_type: String)]
pub struct IssueAttestation<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + AttestationRegistry::LEN,
        seeds = [
            b"attestation",
            agent_id.as_bytes(),
            attestation_type.as_bytes(),
            issuer.key().as_ref()
        ],
        bump
    )]
    pub attestation: Account<'info, AttestationRegistry>,
    
    #[account(
        mut,
        has_one = owner,
        constraint = issuer.is_active @ ErrorCode::IssuerNotActive
    )]
    pub issuer: Account<'info, IssuerRegistry>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RevokeAttestation<'info> {
    #[account(
        mut,
        constraint = !attestation.is_revoked @ ErrorCode::AttestationAlreadyRevoked
    )]
    pub attestation: Account<'info, AttestationRegistry>,
    
    #[account(
        has_one = owner,
        constraint = issuer.key() == attestation.issuer @ ErrorCode::UnauthorizedIssuer
    )]
    pub issuer: Account<'info, IssuerRegistry>,
    
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct VerifyAttestation<'info> {
    pub attestation: Account<'info, AttestationRegistry>,
}

// =============================================================================
// ACCOUNTS
// =============================================================================

#[account]
pub struct GlobalConfig {
    pub authority: Pubkey,           // 32
    pub min_stake_for_issuer: u64,   // 8
    pub total_issuers: u64,          // 8
    pub total_attestations: u64,     // 8
    pub bump: u8,                    // 1
}

impl GlobalConfig {
    pub const LEN: usize = 32 + 8 + 8 + 8 + 1;
}

#[account]
pub struct IssuerRegistry {
    pub owner: Pubkey,              // 32
    pub name: String,               // 4 + 64 = 68
    pub metadata_uri: String,       // 4 + 200 = 204
    pub stake_amount: u64,          // 8
    pub is_active: bool,            // 1
    pub total_attestations: u64,    // 8
    pub registered_at: i64,         // 8
    pub bump: u8,                   // 1
}

impl IssuerRegistry {
    pub const LEN: usize = 32 + 68 + 204 + 8 + 1 + 8 + 8 + 1;
}

#[account]
pub struct AttestationRegistry {
    pub agent_id: String,           // 4 + 32 = 36
    pub issuer: Pubkey,             // 32
    pub attestation_type: String,   // 4 + 64 = 68
    pub claims_uri: String,         // 4 + 200 = 204
    pub issued_at: i64,             // 8
    pub expires_at: i64,            // 8
    pub signature: [u8; 64],        // 64
    pub is_revoked: bool,           // 1
    pub bump: u8,                   // 1
}

impl AttestationRegistry {
    pub const LEN: usize = 36 + 32 + 68 + 204 + 8 + 8 + 64 + 1 + 1;
}

// =============================================================================
// ERRORS
// =============================================================================

#[error_code]
pub enum ErrorCode {
    #[msg("Agent ID too long (max 32 chars)")]
    AgentIdTooLong,
    
    #[msg("Issuer name too long (max 64 chars)")]
    IssuerNameTooLong,
    
    #[msg("Attestation type too long (max 64 chars)")]
    AttestationTypeTooLong,
    
    #[msg("Metadata URI too long (max 200 chars)")]
    MetadataUriTooLong,
    
    #[msg("Reason too long (max 200 chars)")]
    ReasonTooLong,
    
    #[msg("Issuer is not active")]
    IssuerNotActive,
    
    #[msg("Attestation already revoked")]
    AttestationAlreadyRevoked,
    
    #[msg("Unauthorized issuer")]
    UnauthorizedIssuer,
}

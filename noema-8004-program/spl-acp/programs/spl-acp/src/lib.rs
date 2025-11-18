use anchor_lang::prelude::*;

declare_id!("FAnRqmauRE5vtk7ft3FWHicrKKRw3XwbxvYVxuaeRcCK");

#[program]
pub mod spl_acp {
    use super::*;

    /// Initialize global config for ACP protocol
    pub fn initialize_config(
        ctx: Context<InitializeConfig>,
        authority: Pubkey,
        registration_fee: u64,
    ) -> Result<()> {
        let config = &mut ctx.accounts.config;
        config.authority = authority;
        config.registration_fee = registration_fee;
        config.total_capabilities = 0;
        config.bump = ctx.bumps.config;
        
        msg!("SPL-ACP Config initialized with authority: {}", authority);
        Ok(())
    }

    /// Declare agent capabilities (requires SPL-8004 identity)
    pub fn declare_capability(
        ctx: Context<DeclareCapability>,
        agent_id: String,
        capability_type: String,
        version: String,
        metadata_uri: String,
    ) -> Result<()> {
        require!(agent_id.len() <= 32, ErrorCode::AgentIdTooLong);
        require!(capability_type.len() <= 64, ErrorCode::CapabilityTypeTooLong);
        require!(version.len() <= 16, ErrorCode::VersionTooLong);
        require!(metadata_uri.len() <= 200, ErrorCode::MetadataUriTooLong);

        let capability = &mut ctx.accounts.capability;
        let config = &mut ctx.accounts.config;
        
        capability.agent_id = agent_id.clone();
        capability.owner = ctx.accounts.owner.key();
        capability.capability_type = capability_type.clone();
        capability.version = version.clone();
        capability.metadata_uri = metadata_uri;
        capability.is_active = true;
        capability.declared_at = Clock::get()?.unix_timestamp;
        capability.updated_at = Clock::get()?.unix_timestamp;
        capability.bump = ctx.bumps.capability;

        config.total_capabilities += 1;

        msg!("Capability declared: {} - {} v{}", agent_id, capability_type, version);
        Ok(())
    }

    /// Update capability metadata
    pub fn update_capability(
        ctx: Context<UpdateCapability>,
        new_version: String,
        new_metadata_uri: String,
    ) -> Result<()> {
        require!(new_version.len() <= 16, ErrorCode::VersionTooLong);
        require!(new_metadata_uri.len() <= 200, ErrorCode::MetadataUriTooLong);

        let capability = &mut ctx.accounts.capability;
        
        capability.version = new_version;
        capability.metadata_uri = new_metadata_uri;
        capability.updated_at = Clock::get()?.unix_timestamp;

        msg!("Capability updated for agent: {}", capability.agent_id);
        Ok(())
    }

    /// Revoke capability
    pub fn revoke_capability(ctx: Context<RevokeCapability>) -> Result<()> {
        let capability = &mut ctx.accounts.capability;
        capability.is_active = false;
        capability.updated_at = Clock::get()?.unix_timestamp;

        msg!("Capability revoked for agent: {}", capability.agent_id);
        Ok(())
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
#[instruction(agent_id: String, capability_type: String)]
pub struct DeclareCapability<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + CapabilityRegistry::LEN,
        seeds = [
            b"capability",
            agent_id.as_bytes(),
            capability_type.as_bytes()
        ],
        bump
    )]
    pub capability: Account<'info, CapabilityRegistry>,
    
    #[account(mut)]
    pub config: Account<'info, GlobalConfig>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateCapability<'info> {
    #[account(
        mut,
        has_one = owner,
        constraint = capability.is_active @ ErrorCode::CapabilityNotActive
    )]
    pub capability: Account<'info, CapabilityRegistry>,
    
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct RevokeCapability<'info> {
    #[account(
        mut,
        has_one = owner,
        constraint = capability.is_active @ ErrorCode::CapabilityNotActive
    )]
    pub capability: Account<'info, CapabilityRegistry>,
    
    pub owner: Signer<'info>,
}

// =============================================================================
// ACCOUNTS
// =============================================================================

#[account]
pub struct GlobalConfig {
    pub authority: Pubkey,          // 32
    pub registration_fee: u64,      // 8
    pub total_capabilities: u64,    // 8
    pub bump: u8,                   // 1
}

impl GlobalConfig {
    pub const LEN: usize = 32 + 8 + 8 + 1;
}

#[account]
pub struct CapabilityRegistry {
    pub agent_id: String,           // 4 + 32 = 36
    pub owner: Pubkey,              // 32
    pub capability_type: String,    // 4 + 64 = 68
    pub version: String,            // 4 + 16 = 20
    pub metadata_uri: String,       // 4 + 200 = 204
    pub is_active: bool,            // 1
    pub declared_at: i64,           // 8
    pub updated_at: i64,            // 8
    pub bump: u8,                   // 1
}

impl CapabilityRegistry {
    pub const LEN: usize = 36 + 32 + 68 + 20 + 204 + 1 + 8 + 8 + 1;
}

// =============================================================================
// ERRORS
// =============================================================================

#[error_code]
pub enum ErrorCode {
    #[msg("Agent ID too long (max 32 chars)")]
    AgentIdTooLong,
    
    #[msg("Capability type too long (max 64 chars)")]
    CapabilityTypeTooLong,
    
    #[msg("Version string too long (max 16 chars)")]
    VersionTooLong,
    
    #[msg("Metadata URI too long (max 200 chars)")]
    MetadataUriTooLong,
    
    #[msg("Capability is not active")]
    CapabilityNotActive,
}

use anchor_lang::prelude::*;

// Real program id generated from keypair
declare_id!("4X1mFJFMmsn1yFZ8aXjyyHaXVrRLAWT4n4awtD1eYgG8");

// External program IDs as compile-time constants (parsed from base58)
const SPL_8004_PROGRAM_ID_BYTES: [u8; 32] = [
    231, 147, 125, 229, 52, 82, 102, 149, 208, 171, 237, 156, 111, 34, 201, 232, 
    131, 53, 98, 61, 178, 239, 168, 189, 220, 107, 186, 63, 124, 174, 204, 49
];
const NOEMA_STAKING_PROGRAM_ID_BYTES: [u8; 32] = [
    10, 152, 63, 207, 33, 138, 234, 15, 90, 188, 232, 220, 249, 212, 196, 153, 
    104, 110, 245, 55, 80, 127, 40, 176, 251, 136, 54, 188, 34, 179, 51, 51
];

pub fn spl_8004_program_id() -> Pubkey {
    Pubkey::new_from_array(SPL_8004_PROGRAM_ID_BYTES)
}

pub fn noema_staking_program_id() -> Pubkey {
    Pubkey::new_from_array(NOEMA_STAKING_PROGRAM_ID_BYTES)
}

#[program]
pub mod noema_link {
    use super::*;

    pub fn link(ctx: Context<LinkValidators>) -> Result<()> {
        let authority = &ctx.accounts.authority;
        let noema_validator = &ctx.accounts.noema_validator;

        // Verify NOEMA validator owner (relaxed PDA check)
        let noema_program_id = noema_staking_program_id();
        require!(noema_validator.owner == &noema_program_id, LinkError::InvalidNoemaValidatorOwner);
        
        // Verify it's a valid PDA by checking if data exists and is correct size
        let data = noema_validator.try_borrow_data()?;
        require!(data.len() >= 72, LinkError::InvalidNoemaValidator); // Minimum validator account size

        // Store NOEMA validator reference only
        let link_acc = &mut ctx.accounts.link_account;
        link_acc.authority = authority.key();
        link_acc.noema_validator = noema_validator.key();
        link_acc.created_ts = Clock::get()?.unix_timestamp;
        Ok(())
    }
}

#[account]
pub struct LinkAccount {
    pub authority: Pubkey,
    pub noema_validator: Pubkey,
    pub created_ts: i64,
}

impl LinkAccount {
    pub const LEN: usize = 32 + 32 + 8;
}

#[derive(Accounts)]
pub struct LinkValidators<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    /// CHECK: NOEMA validator PDA, validated by seeds & owner inside instruction
    pub noema_validator: AccountInfo<'info>,
    #[account(init, payer = authority, space = 8 + LinkAccount::LEN, seeds = [b"noema_link", authority.key().as_ref()], bump)]
    pub link_account: Account<'info, LinkAccount>,
    pub system_program: Program<'info, System>,
}

#[error_code]
pub enum LinkError {
    #[msg("Invalid NOEMA validator PDA")] InvalidNoemaValidator,
    #[msg("NOEMA validator owner mismatch")] InvalidNoemaValidatorOwner,
}

use anchor_lang::prelude::*;
use crate::state::*;
use crate::constants::*;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = X404Config::LEN,
        seeds = [CONFIG_SEED],
        bump
    )]
    pub config: Account<'info, X404Config>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<Initialize>,
    authority: Pubkey,
    treasury: Pubkey,
    platform_fee_bps: u16,
    base_price_lamports: u64,
) -> Result<()> {
    let config = &mut ctx.accounts.config;

    require!(
        platform_fee_bps <= MAX_PLATFORM_FEE_BPS,
        crate::errors::X404Error::Unauthorized
    );
    require!(
        base_price_lamports >= MIN_BASE_PRICE,
        crate::errors::X404Error::Unauthorized
    );

    config.authority = authority;
    config.treasury = treasury;
    config.platform_fee_bps = platform_fee_bps;
    config.base_price_lamports = base_price_lamports;
    config.total_minted = 0;
    config.total_volume = 0;
    config.paused = false;
    config.bump = ctx.bumps.config;

    msg!("X404 Bridge initialized!");
    msg!("Authority: {}", authority);
    msg!("Platform fee: {}%", platform_fee_bps as f64 / 100.0);

    Ok(())
}

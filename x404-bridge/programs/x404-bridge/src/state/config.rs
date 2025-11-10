use anchor_lang::prelude::*;

#[account]
pub struct X404Config {
    pub authority: Pubkey,          // Protocol authority
    pub treasury: Pubkey,           // Fee collection wallet
    pub platform_fee_bps: u16,      // Platform fee (250 = 2.5%)
    pub base_price_lamports: u64,   // Base NFT price (1 SOL default)
    pub total_minted: u32,          // Total NFTs minted
    pub total_volume: u64,          // Total trading volume
    pub paused: bool,               // Emergency pause
    pub bump: u8,                   // PDA bump
}

impl X404Config {
    pub const LEN: usize = 8 +      // discriminator
        32 +                        // authority
        32 +                        // treasury
        2 +                         // platform_fee_bps
        8 +                         // base_price_lamports
        4 +                         // total_minted
        8 +                         // total_volume
        1 +                         // paused
        1;                          // bump
}

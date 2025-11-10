use anchor_lang::prelude::*;

#[account]
pub struct Listing {
    pub agent_id: Pubkey,           // Agent being sold
    pub seller: Pubkey,             // Seller wallet
    pub list_price: u64,            // Listing price in lamports
    pub floor_price: u64,           // Calculated floor price
    pub listed_at: i64,             // Listing timestamp
    pub expires_at: Option<i64>,    // Optional expiration
    pub bump: u8,                   // PDA bump
}

impl Listing {
    pub const LEN: usize = 8 +      // discriminator
        32 +                        // agent_id
        32 +                        // seller
        8 +                         // list_price
        8 +                         // floor_price
        8 +                         // listed_at
        (1 + 8) +                   // expires_at (Option<i64>)
        1;                          // bump

    pub fn is_expired(&self, current_timestamp: i64) -> bool {
        if let Some(expires) = self.expires_at {
            return current_timestamp >= expires;
        }
        false
    }
}

use anchor_lang::prelude::*;

#[account]
pub struct AgentNFT {
    pub agent_id: Pubkey,           // SPL-8004 agent identity
    pub mint: Pubkey,               // NFT mint address
    pub owner: Pubkey,              // Current owner
    pub original_minter: Pubkey,    // Original creator
    pub reputation_score: u32,      // Synced from SPL-8004 (0-10,000)
    pub last_reputation_sync: i64,  // Last sync timestamp
    pub metadata_uri: String,       // Arweave URI
    pub minted_at: i64,             // Creation timestamp
    pub total_transfers: u32,       // Number of ownership changes
    pub is_listed: bool,            // Currently listed for sale
    pub bump: u8,                   // PDA bump
}

impl AgentNFT {
    pub const LEN: usize = 8 +      // discriminator
        32 +                        // agent_id
        32 +                        // mint
        32 +                        // owner
        32 +                        // original_minter
        4 +                         // reputation_score
        8 +                         // last_reputation_sync
        (4 + 200) +                 // metadata_uri (String)
        8 +                         // minted_at
        4 +                         // total_transfers
        1 +                         // is_listed
        1;                          // bump

    /// Calculate floor price based on reputation
    /// Formula: price = base × (1 + reputation/10000)
    pub fn calculate_floor_price(&self, base_price: u64) -> u64 {
        let reputation_multiplier = (self.reputation_score as u128)
            .checked_mul(crate::constants::BPS_DENOMINATOR as u128)
            .unwrap()
            .checked_div(crate::constants::MAX_REPUTATION as u128)
            .unwrap();

        let price = (base_price as u128)
            .checked_mul(crate::constants::BPS_DENOMINATOR as u128 + reputation_multiplier)
            .unwrap()
            .checked_div(crate::constants::BPS_DENOMINATOR as u128)
            .unwrap();

        price as u64
    }
}

use anchor_lang::prelude::*;

// Seeds
pub const CONFIG_SEED: &[u8] = b"config";
pub const AGENT_NFT_SEED: &[u8] = b"agent_nft";
pub const LISTING_SEED: &[u8] = b"listing";
pub const METADATA_SEED: &[u8] = b"metadata";

// Metaplex program ID
pub const METADATA_PROGRAM_ID: &str = "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s";

// Fees
pub const DEFAULT_PLATFORM_FEE_BPS: u16 = 250; // 2.5%
pub const MAX_PLATFORM_FEE_BPS: u16 = 1000; // 10%

// Pricing
pub const MIN_BASE_PRICE: u64 = 100_000_000; // 0.1 SOL
pub const MAX_REPUTATION: u32 = 10_000;

// NFT Metadata
pub const MAX_NAME_LENGTH: usize = 32;
pub const MAX_SYMBOL_LENGTH: usize = 10;
pub const MAX_URI_LENGTH: usize = 200;

// Basis points
pub const BPS_DENOMINATOR: u64 = 10_000;

use anchor_lang::prelude::*;

#[error_code]
pub enum X404Error {
    #[msg("X404 bridge is paused")]
    BridgePaused,

    #[msg("Agent already tokenized")]
    AlreadyTokenized,

    #[msg("Agent not tokenized yet")]
    NotTokenized,

    #[msg("Invalid reputation score")]
    InvalidReputation,

    #[msg("Not NFT owner")]
    NotOwner,

    #[msg("NFT not listed for sale")]
    NotListed,

    #[msg("NFT already listed")]
    AlreadyListed,

    #[msg("Listing expired")]
    ListingExpired,

    #[msg("Price below floor price")]
    PriceBelowFloor,

    #[msg("Insufficient payment")]
    InsufficientPayment,

    #[msg("Invalid metadata URI")]
    InvalidMetadataUri,

    #[msg("Name too long")]
    NameTooLong,

    #[msg("Symbol too long")]
    SymbolTooLong,

    #[msg("Unauthorized")]
    Unauthorized,

    #[msg("Arithmetic overflow")]
    ArithmeticOverflow,

    #[msg("Cannot purchase own NFT")]
    CannotPurchaseOwn,
}

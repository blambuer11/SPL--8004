# X404 NFT Bridge - Solana Program Build Container
# This Dockerfile builds the X404 Anchor program for Solana

FROM rust:1.75-slim as builder

# Install dependencies
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    libudev-dev \
    curl \
    git \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Solana CLI
RUN sh -c "$(curl -sSfL https://release.solana.com/v1.18.0/install)"
ENV PATH="/root/.local/share/solana/install/active_release/bin:${PATH}"

# Install Anchor CLI
RUN cargo install --git https://github.com/coral-xyz/anchor --tag v0.30.1 anchor-cli --locked

# Set working directory
WORKDIR /workspace

# Copy Anchor project files
COPY Anchor.toml ./
COPY programs ./programs
COPY migrations ./migrations

# Build the program
RUN anchor build

# Runtime stage - minimal image for deployment
FROM ubuntu:22.04

# Install Solana CLI for deployment
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
RUN sh -c "$(curl -sSfL https://release.solana.com/v1.18.0/install)"
ENV PATH="/root/.local/share/solana/install/active_release/bin:${PATH}"

# Copy built artifacts
COPY --from=builder /workspace/target/deploy /app/deploy
COPY --from=builder /workspace/target/idl /app/idl

WORKDIR /app

# Default command shows program info
CMD ["sh", "-c", "ls -lh deploy/ && echo '\\n📦 X404 Program artifacts ready for deployment\\n' && echo 'Deploy with: solana program deploy deploy/x404_agent_nft.so --program-id <PROGRAM_ID> --url devnet'"]

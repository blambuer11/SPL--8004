FROM debian:bullseye-slim

# Install prerequisites
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      build-essential pkg-config libssl-dev clang llvm cmake git curl ca-certificates nodejs npm python3 procps libudev-dev wget && \
    rm -rf /var/lib/apt/lists/*

# Install rustup and set toolchain to 1.82.0 (matches Solana 1.20.x SBF toolchain)
RUN curl https://sh.rustup.rs -sSf | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"
RUN rustup toolchain install 1.82.0 && rustup default 1.82.0

# Install Solana using the official installer script pinned to v1.20.6
ENV SOLANA_VERSION=v1.20.6
RUN set -eux; \
  # Use the official installer; it places binaries under ~/.local/share/solana/install/active_release/bin
  curl -sSfL "https://release.solana.com/${SOLANA_VERSION}/install" | sh -s -- -y; \
  # Symlink installed binaries to /usr/local/bin so other tools can find them
  ln -s /root/.local/share/solana/install/active_release/bin/* /usr/local/bin/ || true
ENV PATH="/root/.local/share/solana/install/active_release/bin:${PATH}"

# Install Anchor CLI pinned to v0.32.1
RUN cargo install --locked --git https://github.com/coral-xyz/anchor --tag v0.32.1 anchor-cli

# Workdir will be mounted from host; keep a default
WORKDIR /workspace

# Default entrypoint prints help; build is invoked by the wrapper script which
# mounts the project directory and runs `anchor build`.
CMD ["/bin/bash"]

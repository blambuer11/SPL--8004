FROM debian:bullseye-slim

# Install prerequisites
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      build-essential pkg-config libssl-dev clang llvm cmake git curl ca-certificates nodejs npm python3 procps libudev-dev wget && \
    rm -rf /var/lib/apt/lists/*

# Install rustup and set toolchain to 1.82.0 (compatible with Solana 1.20.x SBF toolchain)
RUN curl https://sh.rustup.rs -sSf | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"
RUN rustup toolchain install 1.82.0 && rustup default 1.82.0

# Install Solana CLI pinned to v1.20.6 (direct tarball install for both x86_64 and aarch64)
ENV SOLANA_VERSION=v1.20.6
RUN set -eux; \
  arch=$(uname -m); \
  case "$arch" in \
    x86_64) solana_arch=x86_64-unknown-linux-gnu ;; \
    aarch64) solana_arch=aarch64-unknown-linux-gnu ;; \
    arm64) solana_arch=aarch64-unknown-linux-gnu ;; \
    *) echo "Unsupported arch: $arch"; exit 1 ;; \
  esac; \
  curl -sSfL "https://release.solana.com/${SOLANA_VERSION}/solana-release-${solana_arch}.tar.bz2" -o /tmp/solana.tar.bz2; \
  mkdir -p /opt/solana && tar -xjf /tmp/solana.tar.bz2 -C /opt/solana --strip-components=1; \
  ln -s /opt/solana/bin/* /usr/local/bin/ || true

# Install Anchor CLI pinned to v0.32.1
RUN cargo install --locked --git https://github.com/coral-xyz/anchor --tag v0.32.1 anchor-cli

# Helpful JS tooling for post-deploy scripts
RUN npm i -g tsx

WORKDIR /workspace
CMD ["/bin/bash"]

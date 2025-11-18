#!/usr/bin/env bash
set -euo pipefail

# Usage: ./docker-build.sh
# Builds a Docker image containing rust/solana/anchor and runs `anchor build`
# in the container. The generated `target/deploy` files will be left in the
# project directory on the host.

IMAGE_NAME="spl-8004-builder:latest"
WORKDIR_ON_HOST="$(cd "$(dirname "$0")" && pwd)"

echo "Building Docker image $IMAGE_NAME (platform=linux/amd64)..."
docker build --platform linux/amd64 -t "$IMAGE_NAME" "$WORKDIR_ON_HOST"

echo "Running container to build program..."
docker run --platform linux/amd64 --rm \
  -v "$WORKDIR_ON_HOST":/workspace \
  -w /workspace \
  -e RUSTUP_TOOLCHAIN=1.76.0 \
  "$IMAGE_NAME" \
  bash -lc "anchor build || (echo 'anchor build failed — showing /workspace target folder contents'; ls -la /workspace || true; exit 1)"

echo "Build finished. Copying artifacts (if any) to host target/deploy..."
ls -la "$WORKDIR_ON_HOST/target" || true

echo "Done. If target/deploy contains .so files, you're ready to deploy with anchor deploy." 

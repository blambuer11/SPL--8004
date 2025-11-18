Docker-based build for SPL-8004

Purpose
-------
This directory contains a lightweight Dockerfile and helper script to build
the Anchor/Solana program in an isolated environment. Use this when the host
Solana toolchain or rustc versions conflict with the program's dependencies.

Quickstart
----------
1. Build and run the container build helper:

```bash
cd spl-8004-program/spl-8004
./docker-build.sh
```

2. If the build succeeds `target/deploy` will contain the program `.so` and
   other artifacts. Then deploy to a local `solana-test-validator` with:

```bash
anchor deploy
```

Notes
-----
- The Dockerfile attempts to install Solana CLI and Anchor CLI inside the
  container. If your environment requires a different Anchor installer or
  specific versions, edit the Dockerfile accordingly.
- The helper script mounts the project directory into the container so the
  generated `target/deploy` appears on the host.

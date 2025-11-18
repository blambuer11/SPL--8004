import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { SplAcp } from "../target/types/spl_acp";
import { SplTap } from "../target/types/spl_tap";
import { SplFcp } from "../target/types/spl_fcp";

describe("Initialize All Configs", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const acpProgramId = new PublicKey("FAnRqmauRE5vtk7ft3FWHicrKKRw3XwbxvYVxuaeRcCK");
  const tapProgramId = new PublicKey("DTtjXcvxsKHnukZiLtaQ2dHJXC5HtUAwUa9WgsMd3So4");
  const fcpProgramId = new PublicKey("A4Ee2KoPz4y9XyEBta9DyXvKPnWy2GvprDzfVF1PnjtR");

  it("Initialize SPL-ACP Config", async () => {
    const program = anchor.workspace.SplAcp as Program<SplAcp>;
    
    const [configPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("config")],
      acpProgramId
    );

    try {
      const configAccount = await provider.connection.getAccountInfo(configPda);
      
      if (configAccount) {
        console.log("⚠️  SPL-ACP Config already initialized!");
        const config = await program.account.globalConfig.fetch(configPda);
        console.log(`   Authority: ${config.authority.toBase58()}`);
        console.log(`   Registration Fee: ${config.registrationFee.toNumber() / 1e9} SOL`);
        return;
      }

      const registrationFee = new anchor.BN(0.01 * 1e9);
      
      const tx = await program.methods
        .initializeConfig(provider.wallet.publicKey, registrationFee)
        .accounts({
          config: configPda,
          payer: provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      console.log("✅ SPL-ACP Config initialized!");
      console.log(`   Transaction: ${tx}`);
      console.log(`   Config PDA: ${configPda.toBase58()}`);
    } catch (error) {
      console.error("❌ Error:", error);
      throw error;
    }
  });

  it("Initialize SPL-TAP Config", async () => {
    const program = anchor.workspace.SplTap as Program<SplTap>;
    
    const [configPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("config")],
      tapProgramId
    );

    try {
      const configAccount = await provider.connection.getAccountInfo(configPda);
      
      if (configAccount) {
        console.log("⚠️  SPL-TAP Config already initialized!");
        const config = await program.account.globalConfig.fetch(configPda);
        console.log(`   Authority: ${config.authority.toBase58()}`);
        console.log(`   Min Stake: ${config.minStakeForIssuer.toNumber() / 1e9} SOL`);
        return;
      }

      const minStake = new anchor.BN(1 * 1e9);
      
      const tx = await program.methods
        .initializeConfig(provider.wallet.publicKey, minStake)
        .accounts({
          config: configPda,
          payer: provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      console.log("✅ SPL-TAP Config initialized!");
      console.log(`   Transaction: ${tx}`);
      console.log(`   Config PDA: ${configPda.toBase58()}`);
    } catch (error) {
      console.error("❌ Error:", error);
      throw error;
    }
  });

  it("Initialize SPL-FCP Config", async () => {
    const program = anchor.workspace.SplFcp as Program<SplFcp>;
    
    const [configPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("config")],
      fcpProgramId
    );

    try {
      const configAccount = await provider.connection.getAccountInfo(configPda);
      
      if (configAccount) {
        console.log("⚠️  SPL-FCP Config already initialized!");
        const config = await program.account.globalConfig.fetch(configPda);
        console.log(`   Authority: ${config.authority.toBase58()}`);
        console.log(`   Min Stake: ${config.minStakeForValidator.toNumber() / 1e9} SOL`);
        return;
      }

      const minStake = new anchor.BN(2 * 1e9);
      
      const tx = await program.methods
        .initializeConfig(provider.wallet.publicKey, minStake)
        .accounts({
          config: configPda,
          payer: provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      console.log("✅ SPL-FCP Config initialized!");
      console.log(`   Transaction: ${tx}`);
      console.log(`   Config PDA: ${configPda.toBase58()}`);
    } catch (error) {
      console.error("❌ Error:", error);
      throw error;
    }
  });
});

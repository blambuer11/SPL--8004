import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { Connection, PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { AnchorWallet } from "@solana/wallet-adapter-react";

// Program ID - Deploy sonrası güncellenecek
export const SPL8004_PROGRAM_ID = new PublicKey("SPL8wVx7ZqKNxJk5H2bF8QyGvM4tN3rP9WdE6fU5Kc2");

// PDA Seeds
const CONFIG_SEED = "config";
const IDENTITY_SEED = "identity";
const REPUTATION_SEED = "reputation";
const VALIDATION_SEED = "validation";
const REWARD_POOL_SEED = "reward_pool";

export class SPL8004Client {
  private connection: Connection;
  private wallet: AnchorWallet;
  private provider: AnchorProvider;
  private programId: PublicKey;

  constructor(connection: Connection, wallet: AnchorWallet, programId?: PublicKey) {
    this.connection = connection;
    this.wallet = wallet;
    this.programId = programId || SPL8004_PROGRAM_ID;
    
    this.provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });
  }

  // PDA Finders
  findConfigPda(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(CONFIG_SEED)],
      this.programId
    );
  }

  findIdentityPda(agentId: string): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(IDENTITY_SEED), Buffer.from(agentId)],
      this.programId
    );
  }

  findReputationPda(identityPda: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(REPUTATION_SEED), identityPda.toBuffer()],
      this.programId
    );
  }

  findRewardPoolPda(identityPda: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(REWARD_POOL_SEED), identityPda.toBuffer()],
      this.programId
    );
  }

  findValidationPda(identityPda: PublicKey, taskHash: Uint8Array): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(VALIDATION_SEED), identityPda.toBuffer(), taskHash],
      this.programId
    );
  }

  // Account getters with proper error handling
  async getIdentity(agentId: string) {
    try {
      const [identityPda] = this.findIdentityPda(agentId);
      const accountInfo = await this.connection.getAccountInfo(identityPda);
      
      if (!accountInfo) return null;
      
      // Parse account data (simplified - real implementation would use IDL)
      return {
        address: identityPda,
        owner: new PublicKey(accountInfo.data.slice(8, 40)),
        agentId: agentId,
        isActive: accountInfo.data[accountInfo.data.length - 2] === 1,
      };
    } catch (error) {
      console.error("Error fetching identity:", error);
      return null;
    }
  }

  async getReputation(agentId: string) {
    try {
      const [identityPda] = this.findIdentityPda(agentId);
      const [reputationPda] = this.findReputationPda(identityPda);
      const accountInfo = await this.connection.getAccountInfo(reputationPda);
      
      if (!accountInfo) return null;

      // Parse reputation data (simplified)
      const dataView = new DataView(accountInfo.data.buffer);
      return {
        address: reputationPda,
        score: Number(dataView.getBigUint64(40, true)),
        totalTasks: Number(dataView.getBigUint64(48, true)),
        successfulTasks: Number(dataView.getBigUint64(56, true)),
        failedTasks: Number(dataView.getBigUint64(64, true)),
      };
    } catch (error) {
      console.error("Error fetching reputation:", error);
      return null;
    }
  }

  async getAllAgents() {
    try {
      // Get all accounts owned by program
      const accounts = await this.connection.getProgramAccounts(this.programId, {
        filters: [
          {
            memcmp: {
              offset: 0,
              bytes: Buffer.from([/* identity discriminator */]).toString('base64'),
            },
          },
        ],
      });

      return accounts.map((account) => ({
        address: account.pubkey,
        // Parse account data
      }));
    } catch (error) {
      console.error("Error fetching all agents:", error);
      return [];
    }
  }

  // Helper to create mock data for development
  getMockAgentData() {
    return [
      {
        agentId: "agent-001",
        owner: this.wallet.publicKey.toString(),
        metadataUri: "https://arweave.net/agent-001",
        reputation: {
          score: 8500,
          totalTasks: 120,
          successfulTasks: 110,
          failedTasks: 10,
        },
        isActive: true,
      },
      {
        agentId: "agent-002",
        owner: this.wallet.publicKey.toString(),
        metadataUri: "https://arweave.net/agent-002",
        reputation: {
          score: 7200,
          totalTasks: 85,
          successfulTasks: 75,
          failedTasks: 10,
        },
        isActive: true,
      },
    ];
  }
}

export const createSPL8004Client = (
  connection: Connection,
  wallet: AnchorWallet,
  programId?: PublicKey
) => {
  return new SPL8004Client(connection, wallet, programId);
};

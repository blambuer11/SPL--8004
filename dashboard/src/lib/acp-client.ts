import { Connection, PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import { AnchorWallet } from "@solana/wallet-adapter-react";

// SPL-ACP Program ID
export const ACP_PROGRAM_ID = new PublicKey("FAnRqmauRE5vtk7ft3FWHicrKKRw3XwbxvYVxuaeRcCK");

const CAPABILITIES_SEED = "capabilities";
const CAPABILITY_SEED = "capability";
const CONFIG_SEED = "config";

export interface AgentCapability {
  name: string;
  version: string;
  inputSchema: string;  // JSON string
  outputSchema: string; // JSON string
}

export interface CapabilitiesAccount {
  agent: PublicKey;
  capabilities: AgentCapability[];
  updatedAt: number;
}

export class ACPClient {
  private connection: Connection;
  private wallet: AnchorWallet;
  private programId: PublicKey;

  constructor(connection: Connection, wallet: AnchorWallet, programId?: PublicKey) {
    this.connection = connection;
    this.wallet = wallet;
    this.programId = programId || ACP_PROGRAM_ID;
  }

  findCapabilitiesPda(agentPubkey: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(CAPABILITIES_SEED), agentPubkey.toBytes()],
      this.programId
    );
  }

  findCapabilityPda(agentId: string, capabilityType: string): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(CAPABILITY_SEED), Buffer.from(agentId), Buffer.from(capabilityType)],
      this.programId
    );
  }

  findConfigPda(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(CONFIG_SEED)],
      this.programId
    );
  }

  private async sha256(data: string): Promise<Uint8Array> {
    const enc = new TextEncoder().encode(data);
    const hash = await (globalThis.crypto as Crypto).subtle.digest("SHA-256", enc as unknown as BufferSource);
    return new Uint8Array(hash);
  }

  private async discriminator(name: string): Promise<Uint8Array> {
    const h = await this.sha256(`global:${name}`);
    return h.slice(0, 8);
  }

  async declareCapabilities(agentPubkey: PublicKey, capabilities: AgentCapability[]): Promise<string> {
    // SPL-ACP uses declare_capability (singular) - send first capability only
    if (capabilities.length === 0) {
      throw new Error("No capabilities provided");
    }
    
    const capability = capabilities[0];
    const agentId = capability.name; // Using name as agent_id
    const capabilityType = capability.name;
    
    const [capabilityPda] = this.findCapabilityPda(agentId, capabilityType);
    const [configPda] = this.findConfigPda();
    const disc = await this.discriminator("declare_capability");
    
    // Parameters: agent_id: String, capability_type: String, version: String, metadata_uri: String
    const agentIdBytes = new TextEncoder().encode(agentId);
    const capabilityTypeBytes = new TextEncoder().encode(capabilityType);
    const versionBytes = new TextEncoder().encode(capability.version);
    const metadataUriBytes = new TextEncoder().encode(JSON.stringify({
      inputSchema: capability.inputSchema,
      outputSchema: capability.outputSchema
    }));

    // Borsh encoding: disc(8) + string_len(4) + string_data + ... (repeat for each string)
    const dataLen = 8 + 4 + agentIdBytes.length + 4 + capabilityTypeBytes.length + 4 + versionBytes.length + 4 + metadataUriBytes.length;
    const data = new Uint8Array(dataLen);
    let offset = 0;

    data.set(disc, offset);
    offset += 8;

    // agent_id
    new DataView(data.buffer).setUint32(offset, agentIdBytes.length, true);
    offset += 4;
    data.set(agentIdBytes, offset);
    offset += agentIdBytes.length;

    // capability_type
    new DataView(data.buffer).setUint32(offset, capabilityTypeBytes.length, true);
    offset += 4;
    data.set(capabilityTypeBytes, offset);
    offset += capabilityTypeBytes.length;

    // version
    new DataView(data.buffer).setUint32(offset, versionBytes.length, true);
    offset += 4;
    data.set(versionBytes, offset);
    offset += versionBytes.length;

    // metadata_uri
    new DataView(data.buffer).setUint32(offset, metadataUriBytes.length, true);
    offset += 4;
    data.set(metadataUriBytes, offset);

    // Accounts: capability, config, owner, system_program
    const ix = new TransactionInstruction({
      programId: this.programId,
      keys: [
        { pubkey: capabilityPda, isSigner: false, isWritable: true },
        { pubkey: configPda, isSigner: false, isWritable: true },
        { pubkey: this.wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: Buffer.from(data),
    });

    return this.send([ix]);
  }

  async getCapabilities(agentPubkey: PublicKey): Promise<CapabilitiesAccount | null> {
    try {
      const [capabilitiesPda] = this.findCapabilitiesPda(agentPubkey);
      const accountInfo = await this.connection.getAccountInfo(capabilitiesPda);
      
      if (!accountInfo || accountInfo.data.length === 0) return null;

      const data = accountInfo.data;
      // Skip discriminator (8 bytes)
      const agentBytes = data.slice(8, 40);
      const agent = new PublicKey(agentBytes);
      
      const capabilitiesLenOffset = 40;
      const capabilitiesLen = new DataView(data.buffer, data.byteOffset).getUint32(capabilitiesLenOffset, true);
      const capabilitiesJson = new TextDecoder().decode(data.slice(capabilitiesLenOffset + 4, capabilitiesLenOffset + 4 + capabilitiesLen));
      const capabilities = JSON.parse(capabilitiesJson) as AgentCapability[];

      const updatedAtOffset = capabilitiesLenOffset + 4 + capabilitiesLen;
      const updatedAt = Number(new DataView(data.buffer, data.byteOffset).getBigInt64(updatedAtOffset, true));

      return { agent, capabilities, updatedAt };
    } catch (error) {
      console.error("Error fetching capabilities:", error);
      return null;
    }
  }

  private async send(ixs: TransactionInstruction[]): Promise<string> {
    const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash();
    const tx = new Transaction({ feePayer: this.wallet.publicKey, blockhash, lastValidBlockHeight });
    tx.add(...ixs);
    const signed = await this.wallet.signTransaction(tx);
    const sig = await this.connection.sendRawTransaction(signed.serialize(), { maxRetries: 3 });
    await this.connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, "confirmed");
    return sig;
  }
}

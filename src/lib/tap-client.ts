import { Connection, PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import { AnchorWallet } from "@solana/wallet-adapter-react";

// SPL-TAP Program ID
export const TAP_PROGRAM_ID = new PublicKey("DTtjXcvxsKHnukZiLtaQ2dHJXC5HtUAwUa9WgsMd3So4");

const ATTESTATION_SEED = "attestation";
const ISSUER_SEED = "issuer";
const CONFIG_SEED = "config";

export interface ToolAttestation {
  toolName: string;
  toolHash: string;
  auditUri: string;
  attestor: PublicKey;
  createdAt: number;
  revoked: boolean;
}

export class TAPClient {
  private connection: Connection;
  private wallet: AnchorWallet;
  private programId: PublicKey;

  constructor(connection: Connection, wallet: AnchorWallet, programId?: PublicKey) {
    this.connection = connection;
    this.wallet = wallet;
    this.programId = programId || TAP_PROGRAM_ID;
  }

  findAttestationPda(agentId: string, attestationType: string, issuer: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(ATTESTATION_SEED), Buffer.from(agentId), Buffer.from(attestationType), issuer.toBytes()],
      this.programId
    );
  }

  findIssuerPda(owner: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(ISSUER_SEED), owner.toBytes()],
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

  async attestTool(toolName: string, toolHash: string, auditUri: string): Promise<string> {
    const agentId = toolName;
    const attestationType = toolHash;
    const issuerPubkey = this.wallet.publicKey;
    
    const [attestationPda] = this.findAttestationPda(agentId, attestationType, issuerPubkey);
    const [issuerPda] = this.findIssuerPda(issuerPubkey);
    const disc = await this.discriminator("issue_attestation");

    // Parameters: agent_id: String, attestation_type: String, claims_uri: String, expires_at: i64, signature: [u8; 64]
    const agentIdBytes = new TextEncoder().encode(agentId);
    const attestationTypeBytes = new TextEncoder().encode(attestationType);
    const claimsUriBytes = new TextEncoder().encode(auditUri);
    const expiresAt = BigInt(Date.now() / 1000 + (365 * 24 * 60 * 60)); // 1 year from now
    const signature = new Uint8Array(64).fill(0); // Dummy signature for now

    // Borsh: disc(8) + agent_id(4+len) + attestation_type(4+len) + claims_uri(4+len) + expires_at(8) + signature(64)
    const dataLen = 8 + 4 + agentIdBytes.length + 4 + attestationTypeBytes.length + 4 + claimsUriBytes.length + 8 + 64;
    const data = new Uint8Array(dataLen);
    let offset = 0;

    data.set(disc, offset);
    offset += 8;

    // agent_id
    new DataView(data.buffer).setUint32(offset, agentIdBytes.length, true);
    offset += 4;
    data.set(agentIdBytes, offset);
    offset += agentIdBytes.length;

    // attestation_type
    new DataView(data.buffer).setUint32(offset, attestationTypeBytes.length, true);
    offset += 4;
    data.set(attestationTypeBytes, offset);
    offset += attestationTypeBytes.length;

    // claims_uri
    new DataView(data.buffer).setUint32(offset, claimsUriBytes.length, true);
    offset += 4;
    data.set(claimsUriBytes, offset);
    offset += claimsUriBytes.length;

    // expires_at (i64)
    new DataView(data.buffer).setBigInt64(offset, expiresAt, true);
    offset += 8;

    // signature [u8; 64]
    data.set(signature, offset);

    // Accounts: attestation, issuer, owner, system_program
    const ix = new TransactionInstruction({
      programId: this.programId,
      keys: [
        { pubkey: attestationPda, isSigner: false, isWritable: true },
        { pubkey: issuerPda, isSigner: false, isWritable: true },
        { pubkey: this.wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: Buffer.from(data),
    });

    return this.send([ix]);
  }

  async verifyAttestation(toolHash: string): Promise<ToolAttestation | null> {
    // For simple verification, we'll try to find any attestation matching this toolHash
    // by scanning program accounts. This is a fallback for the UI.
    try {
      const accounts = await this.connection.getProgramAccounts(this.programId, {
        filters: [
          { memcmp: { offset: 8, bytes: toolHash } }, // Try to match toolHash in data
        ],
      });
      
      if (accounts.length === 0) return null;
      
      // Return the first matching attestation
      const data = accounts[0].account.data;
      return this.parseAttestationData(data);
    } catch (error) {
      console.error('Verification error:', error);
      return null;
    }
  }

  private parseAttestationData(data: Uint8Array): ToolAttestation | null {
    try {
      let offset = 8; // Skip discriminator

      // Read agentId
      const agentIdLen = new DataView(data.buffer, data.byteOffset).getUint32(offset, true);
      offset += 4;
      const toolName = new TextDecoder().decode(data.slice(offset, offset + agentIdLen));
      offset += agentIdLen;

      // Read issuer (32 bytes pubkey)
      const attestor = new PublicKey(data.slice(offset, offset + 32));
      offset += 32;

      // Read attestationType
      const attestationTypeLen = new DataView(data.buffer, data.byteOffset).getUint32(offset, true);
      offset += 4;
      const toolHash = new TextDecoder().decode(data.slice(offset, offset + attestationTypeLen));
      offset += attestationTypeLen;

      // Read claims_uri
      const claimsUriLen = new DataView(data.buffer, data.byteOffset).getUint32(offset, true);
      offset += 4;
      const auditUri = new TextDecoder().decode(data.slice(offset, offset + claimsUriLen));
      offset += claimsUriLen;

      // Read issued_at (i64)
      const createdAt = Number(new DataView(data.buffer, data.byteOffset).getBigInt64(offset, true));
      offset += 8;

      // Skip expires_at
      offset += 8;

      // Skip signature
      offset += 64;

      // Read is_revoked (bool)
      const revoked = data[offset] !== 0;

      return {
        toolName,
        toolHash,
        auditUri,
        attestor,
        createdAt,
        revoked,
      };
    } catch (error) {
      console.error('Parse error:', error);
      return null;
    }
  }

  async verifyAttestationWithDetails(agentId: string, attestationType: string, issuer: PublicKey): Promise<ToolAttestation | null> {
    try {
      const [attestationPda] = this.findAttestationPda(agentId, attestationType, issuer);
      const accountInfo = await this.connection.getAccountInfo(attestationPda);
      
      if (!accountInfo || accountInfo.data.length === 0) return null;

      const data = accountInfo.data;
      let offset = 8; // Skip discriminator

      // Read agentId
      const agentIdLen = new DataView(data.buffer, data.byteOffset).getUint32(offset, true);
      offset += 4;
      const agentIdValue = new TextDecoder().decode(data.slice(offset, offset + agentIdLen));
      offset += agentIdLen;

      // Read issuer (32 bytes pubkey)
      const issuerValue = new PublicKey(data.slice(offset, offset + 32));
      offset += 32;

      // Read attestationType
      const attestationTypeLen = new DataView(data.buffer, data.byteOffset).getUint32(offset, true);
      offset += 4;
      const attestationTypeValue = new TextDecoder().decode(data.slice(offset, offset + attestationTypeLen));
      offset += attestationTypeLen;

      // Read claims_uri
      const claimsUriLen = new DataView(data.buffer, data.byteOffset).getUint32(offset, true);
      offset += 4;
      const auditUri = new TextDecoder().decode(data.slice(offset, offset + claimsUriLen));
      offset += claimsUriLen;

      // Read issued_at (i64)
      const createdAt = Number(new DataView(data.buffer, data.byteOffset).getBigInt64(offset, true));
      offset += 8;

      // Read expires_at (i64)
      offset += 8; // Skip expires_at for now

      // Read signature [u8; 64]
      offset += 64;

      // Read is_revoked (bool - 1 byte)
      const revoked = data[offset] !== 0;

      return {
        toolName: agentIdValue,
        toolHash: attestationTypeValue,
        auditUri,
        attestor: issuerValue,
        createdAt,
        revoked
      };
    } catch (error) {
      console.error("Error verifying attestation:", error);
      return null;
    }
  }

  async revokeAttestation(toolHash: string): Promise<string> {
    throw new Error("revokeAttestation requires agentId, attestationType, and issuerPubkey parameters");
  }

  async revokeAttestationWithDetails(agentId: string, attestationType: string, issuer: PublicKey, reason: string): Promise<string> {
    const [attestationPda] = this.findAttestationPda(agentId, attestationType, issuer);
    const disc = await this.discriminator("revoke_attestation");

    // Parameters: reason: String
    const reasonBytes = new TextEncoder().encode(reason);
    const data = new Uint8Array(8 + 4 + reasonBytes.length);
    let offset = 0;

    data.set(disc, offset);
    offset += 8;

    new DataView(data.buffer).setUint32(offset, reasonBytes.length, true);
    offset += 4;
    data.set(reasonBytes, offset);

    // Accounts: attestation, owner (issuer)
    const ix = new TransactionInstruction({
      programId: this.programId,
      keys: [
        { pubkey: attestationPda, isSigner: false, isWritable: true },
        { pubkey: this.wallet.publicKey, isSigner: true, isWritable: false },
      ],
      data: Buffer.from(data),
    });

    return this.send([ix]);
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

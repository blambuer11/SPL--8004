import { Connection, PublicKey, SystemProgram, Transaction, TransactionInstruction, SendTransactionError } from "@solana/web3.js";
import { AnchorWallet } from "@solana/wallet-adapter-react";

// SPL-TAP Program ID
export const TAP_PROGRAM_ID = new PublicKey("DTtjXcvxsKHnukZiLtaQ2dHJXC5HtUAwUa9WgsMd3So4");

type TapImportMeta = {
  env: {
    VITE_TAP_MIN_STAKE_LAMPORTS?: string;
    VITE_TAP_ISSUER_NAME?: string;
    VITE_TAP_ISSUER_CONTACT?: string;
  };
};

const TAP_ENV = (import.meta as unknown as TapImportMeta).env;

const TAP_MIN_STAKE_LAMPORTS = (() => {
  const raw = (TAP_ENV.VITE_TAP_MIN_STAKE_LAMPORTS || "").trim();
  if (!raw) return 1_000_000_000n; // default: 1 SOL
  try {
    const parsed = BigInt(raw);
    if (parsed < 0n) {
      console.warn(`[TAPClient] VITE_TAP_MIN_STAKE_LAMPORTS cannot be negative. Using absolute value.`);
      return -parsed;
    }
    return parsed;
  } catch {
    console.warn(`[TAPClient] Invalid VITE_TAP_MIN_STAKE_LAMPORTS='${raw}', defaulting to 1 SOL`);
    return 1_000_000_000n;
  }
})();

const TAP_ISSUER_NAME = (TAP_ENV.VITE_TAP_ISSUER_NAME || "Noema Protocol Issuer").trim() || "Noema Protocol Issuer";
const TAP_ISSUER_CONTACT = (TAP_ENV.VITE_TAP_ISSUER_CONTACT || "https://noemaprotocol.xyz").trim() || "https://noemaprotocol.xyz";

const ATTESTATION_SEED = "attestation";
const ISSUER_SEED = "issuer";
const CONFIG_SEED = "config";

const TOOL_NAME_MAX = 32;
const TOOL_HASH_MAX = 64;
const AUDIT_URI_MAX = 200;

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

  findAttestationPda(agentId: string, attestationType: string, issuerAccount: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(ATTESTATION_SEED), Buffer.from(agentId), Buffer.from(attestationType), issuerAccount.toBytes()],
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

  async getConfigAccount(): Promise<{ address: PublicKey; data: Buffer } | null> {
    const [configPda] = this.findConfigPda();
    const info = await this.connection.getAccountInfo(configPda);
    if (!info) return null;
    return { address: configPda, data: Buffer.from(info.data) };
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

  private async ensureConfigInitialized(): Promise<string | null> {
    const current = await this.getConfigAccount();
    if (current) return null;

    console.log("🛠 Initializing TAP config (auto)...");
    const [configPda] = this.findConfigPda();
    const disc = await this.discriminator("initialize_config");

    const data = new Uint8Array(8 + 32 + 8);
    data.set(disc, 0);
    data.set(this.wallet.publicKey.toBytes(), 8);
    new DataView(data.buffer).setBigUint64(40, TAP_MIN_STAKE_LAMPORTS, true);

    const ix = new TransactionInstruction({
      programId: this.programId,
      keys: [
        { pubkey: configPda, isSigner: false, isWritable: true },
        { pubkey: this.wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: Buffer.from(data),
    });

    try {
      const sig = await this.send([ix]);
      console.log("✅ TAP config initialized", sig);
      return sig;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.toLowerCase().includes("already in use") || message.includes("AccountAlreadyInitialized")) {
        console.log("ℹ️  TAP config appears to be initialized by another signer. Continuing.");
        return null;
      }
      throw err;
    }
  }

  async attestTool(toolName: string, toolHash: string, auditUri: string): Promise<string> {
    try {
      console.log('🔐 Starting attestation...', { toolName, toolHash, auditUri });
      
      if (toolName.length === 0 || toolHash.length === 0 || auditUri.length === 0) {
        throw new Error('All fields are required');
      }
      if (toolName.length > TOOL_NAME_MAX) {
        throw new Error(`Tool name must be at most ${TOOL_NAME_MAX} characters (current: ${toolName.length})`);
      }
      if (toolHash.length > TOOL_HASH_MAX) {
        throw new Error(`Tool hash must be at most ${TOOL_HASH_MAX} characters (current: ${toolHash.length})`);
      }
      if (auditUri.length > AUDIT_URI_MAX) {
        throw new Error(`Audit URI must be at most ${AUDIT_URI_MAX} characters (current: ${auditUri.length})`);
      }

      const agentId = toolName;
      const attestationType = toolHash;
      const ownerPubkey = this.wallet.publicKey;
      
      // First check if TAP program is deployed
      console.log('🔍 Checking TAP program deployment...');
      const programInfo = await this.connection.getAccountInfo(this.programId);
      if (!programInfo || !programInfo.executable) {
        console.log('⚠️ TAP program not deployed');
        throw new Error('TAP_NOT_DEPLOYED: Tool Attestation Protocol not available on this network');
      }
      console.log('✅ TAP program deployed');

      console.log('🛠 Ensuring TAP config is initialized...');
      await this.ensureConfigInitialized();
      
      console.log('📍 Finding PDAs...');
      const [issuerPda] = this.findIssuerPda(ownerPubkey);
      const [attestationPda] = this.findAttestationPda(agentId, attestationType, issuerPda);

      const existingAttestation = await this.connection.getAccountInfo(attestationPda);
      if (existingAttestation) {
        console.log('ℹ️  Attestation already exists, skipping creation.');
        const parsed = this.parseAttestationData(existingAttestation.data);
        const issuedAt = parsed?.createdAt ? new Date(parsed.createdAt * 1000).toLocaleString() : 'previously';
        throw new Error(`Attestation already exists for this tool hash (issued ${issuedAt}). Use a new hash or revoke the old attestation first.`);
      }
      
      console.log('✅ PDAs found:', {
        attestationPda: attestationPda.toBase58(),
        issuerPda: issuerPda.toBase58(),
      });
      
      // Check if issuer account exists, if not we need to initialize it first
      console.log('🔍 Checking issuer account...');
      let issuerAccount = await this.connection.getAccountInfo(issuerPda);
      console.log('Issuer account exists:', !!issuerAccount);
      
      // If issuer doesn't exist, we need to register first
      if (!issuerAccount) {
        console.log('📝 Registering issuer first...');
        const registrationSig = await this.registerIssuer();
        console.log('✅ Issuer registered', registrationSig || '(existing)');
        issuerAccount = await this.connection.getAccountInfo(issuerPda);
        if (!issuerAccount) {
          throw new Error('Issuer account still missing after registration. Please retry.');
        }
      }
      
      console.log('⚙️ Building instruction...');
      const disc = await this.discriminator("issue_attestation");

      // Parameters: agent_id: String, attestation_type: String, claims_uri: String, expires_at: i64, signature: [u8; 64]
      const agentIdBytes = new TextEncoder().encode(agentId);
      const attestationTypeBytes = new TextEncoder().encode(attestationType);
      const claimsUriBytes = new TextEncoder().encode(auditUri);
      const currentEpochSeconds = Math.floor(Date.now() / 1000);
      const expiresAt = BigInt(currentEpochSeconds + (365 * 24 * 60 * 60)); // 1 year from now
      const dummySignature = new Uint8Array(64).fill(0); // Dummy signature for now

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
      data.set(dummySignature, offset);

      // Build instruction with proper account keys
      const keys = [
        { pubkey: attestationPda, isSigner: false, isWritable: true },
        { pubkey: issuerPda, isSigner: false, isWritable: true },
        { pubkey: ownerPubkey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ];

      // If issuer account doesn't exist, we might need to add rent sysvar
      if (!issuerAccount) {
        // Some programs require SYSVAR_RENT_PUBKEY for initialization
        // keys.push({ pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false });
      }

      const ix = new TransactionInstruction({
        programId: this.programId,
        keys,
        data: Buffer.from(data),
      });

      // Preflight simulation to avoid prompting wallet when program state is invalid
      try {
        const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash('processed');
        const simTx = new Transaction({ feePayer: this.wallet.publicKey, blockhash, lastValidBlockHeight });
        simTx.add(ix);
        const sim = await this.connection.simulateTransaction(simTx);
        const simValue = (sim as unknown as { value?: { logs?: string[]; err?: unknown } }).value;
        const logs = simValue?.logs ?? [];
        const err = simValue?.err ?? null;
        if (err) {
          const humanReadable = this.describeSimulationFailure(logs, err);
          throw new Error(humanReadable);
        }
      } catch (simErr) {
        if (simErr instanceof Error && simErr.message.includes('Simulation failed')) {
          throw simErr;
        }
        console.warn('Simulation preflight skipped/failed:', simErr);
      }

      console.log('📤 Sending transaction...');
      console.log('Instruction:', {
        programId: this.programId.toBase58(),
        keys: keys.map(k => ({ pubkey: k.pubkey.toBase58(), isSigner: k.isSigner, isWritable: k.isWritable })),
        dataLength: data.length,
      });
      
      const signature = await this.send([ix]);
      console.log('✅ Attestation submitted!', signature);
      return signature;
    } catch (error) {
      console.error('❌ Error in attestTool:', error);
      
      // Better error messages
      if (error instanceof Error) {
        if (error.message.includes('TAP_NOT_DEPLOYED')) {
          throw error; // Pass through our custom error
        } else if (error.message.includes('insufficient')) {
          throw new Error('Insufficient SOL balance for transaction fees');
        } else if (error.message.includes('0x1771')) {
          throw new Error('Account not initialized - TAP program may not be deployed');
        } else if (error.message.includes('0x1')) {
          throw new Error('Insufficient funds to initialize issuer account');
        } else if (error.message.includes('blockhash')) {
          throw new Error('Transaction expired - please retry');
        } else if (error.message.includes('Simulation failed')) {
          throw error;
        }
      }
      
      throw new Error(`Failed to submit attestation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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

  async registerIssuer(): Promise<string | null> {
    try {
      console.log('📝 Registering issuer account...');
      
      const [issuerPda] = this.findIssuerPda(this.wallet.publicKey);
      const existing = await this.connection.getAccountInfo(issuerPda);
      if (existing) {
        console.log('ℹ️  Issuer already registered. Skipping.');
        return null;
      }

      await this.ensureConfigInitialized();

      const configAccount = await this.getConfigAccount();
      if (!configAccount) {
        throw new Error('TAP config not initialized. Unable to register issuer.');
      }
      const disc = await this.discriminator("register_issuer");
      
      // Parameters: name: String, contact_info: String
      const name = TAP_ISSUER_NAME;
      const contactInfo = TAP_ISSUER_CONTACT;
      
      const nameBytes = new TextEncoder().encode(name);
      const contactBytes = new TextEncoder().encode(contactInfo);
      
      const data = new Uint8Array(8 + 4 + nameBytes.length + 4 + contactBytes.length);
      let offset = 0;
      
      data.set(disc, offset);
      offset += 8;
      
      // name
      new DataView(data.buffer).setUint32(offset, nameBytes.length, true);
      offset += 4;
      data.set(nameBytes, offset);
      offset += nameBytes.length;
      
      // contact_info
      new DataView(data.buffer).setUint32(offset, contactBytes.length, true);
      offset += 4;
      data.set(contactBytes, offset);
      
      const ix = new TransactionInstruction({
        programId: this.programId,
        keys: [
          { pubkey: issuerPda, isSigner: false, isWritable: true },
          { pubkey: configAccount.address, isSigner: false, isWritable: true },
          { pubkey: this.wallet.publicKey, isSigner: true, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: Buffer.from(data),
      });
      
      const signature = await this.send([ix]);
      console.log('✅ Issuer registered:', signature);
      return signature;
    } catch (error) {
      console.error('❌ Failed to register issuer:', error);
      const [issuerPda] = this.findIssuerPda(this.wallet.publicKey);
      const issuerAccount = await this.connection.getAccountInfo(issuerPda);
      if (issuerAccount) {
        console.log('ℹ️  Issuer account detected after error, treating as success.');
        return null;
      }
      throw error;
    }
  }

  async revokeAttestation(toolHash: string): Promise<string> {
  throw new Error("revokeAttestation requires agentId, attestationType, and issuer account parameters");
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

  private describeSimulationFailure(logs: string[], err: unknown): string {
    const logSummary = logs.join('\n');
    if (logSummary.includes('already in use')) {
      return 'Simulation failed: attestation account already exists. ' + logSummary;
    }
    if (logSummary.includes('custom program error')) {
      const anchorMessage = this.extractAnchorError(logSummary);
      if (anchorMessage) {
        return `Simulation failed: ${anchorMessage}`;
      }
    }
    return `Simulation failed. Raw logs:\n${logSummary || JSON.stringify(err)}`;
  }

  private extractAnchorError(logs: string): string | null {
    const anchorLine = logs
      .split('\n')
      .find((line) => line.includes('AnchorError') || line.includes('Error Code'));
    if (!anchorLine) return null;
    return anchorLine.replace(/^Program log: /, '').trim();
  }

  private async send(ixs: TransactionInstruction[]): Promise<string> {
    try {
      const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash('confirmed');
      const tx = new Transaction({ 
        feePayer: this.wallet.publicKey, 
        blockhash, 
        lastValidBlockHeight 
      });
      tx.add(...ixs);
      
      const signed = await this.wallet.signTransaction(tx);
      const sig = await this.connection.sendRawTransaction(signed.serialize(), { 
        skipPreflight: false,
        preflightCommitment: 'confirmed',
        maxRetries: 3 
      });
      
      // Wait for confirmation with timeout
      const confirmation = await this.connection.confirmTransaction({ 
        signature: sig, 
        blockhash, 
        lastValidBlockHeight 
      }, "confirmed");

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
      }

      return sig;
    } catch (error) {
      console.error('Transaction send error:', error);
      // Enrich with program logs if possible
      if (error instanceof SendTransactionError) {
        try {
          const logs = await error.getLogs(this.connection);
          const joined = (logs || []).join('\n');
          // Map common Anchor/Program errors to human messages
          if (joined.includes('InstructionFallbackNotFound') || joined.includes('custom program error: 0x65')) {
            throw new Error('Transaction simulation failed: Instruction not found in TAP program. Logs:\n' + joined);
          }
          if (joined.includes('insufficient funds')) {
            throw new Error('Insufficient funds for transaction. Logs:\n' + joined);
          }
          throw new Error((error.message || 'SendTransactionError') + '\nLogs:\n' + joined);
        } catch (_) {
          // Fall through if logs not available
        }
      }
      if (error instanceof Error) {
        if (error.message.includes('0x1')) {
          throw new Error('Insufficient funds for transaction');
        } else if (error.message.includes('blockhash')) {
          throw new Error('Transaction expired - please retry');
        }
      }
      throw error as Error;
    }
  }
}

import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import * as fs from 'fs';

const connection = new Connection('http://localhost:8899', 'confirmed');
const programId = new PublicKey('DTtjXcvxsKHnukZiLtaQ2dHJXC5HtUAwUa9WgsMd3So4');

// Load keypair
const keypairData = JSON.parse(fs.readFileSync('/Users/bl10buer/Desktop/sp8004/my-solana-keypair.json', 'utf8'));
const payer = Keypair.fromSecretKey(Uint8Array.from(keypairData));

async function checkProgram() {
  const info = await connection.getAccountInfo(programId);
  console.log('Program account:', {
    exists: !!info,
    executable: info?.executable,
    owner: info?.owner.toBase58(),
    dataLength: info?.data.length
  });

  // Check for registerIssuer discriminator in program data
  const programDataAddress = PublicKey.findProgramAddressSync(
    [programId.toBuffer()],
    new PublicKey('BPFLoaderUpgradeab1e11111111111111111111111')
  )[0];
  
  const programData = await connection.getAccountInfo(programDataAddress);
  console.log('Program data length:', programData?.data.length);
  
  // Search for the discriminator bytes in program data (0x7fcee04cc2bda3f1 for registerIssuer)
  if (programData?.data) {
    const searchBytes = Buffer.from([0x7f, 0xce, 0xe0, 0x4c, 0xc2, 0xbd, 0xa3, 0xf1]);
    const found = programData.data.indexOf(searchBytes);
    console.log('registerIssuer discriminator found at offset:', found);
    if (found >= 0) {
      console.log('✅ Program contains registerIssuer instruction!');
    } else {
      console.log('❌ Program does NOT contain registerIssuer instruction');
    }
  }
}

checkProgram().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});

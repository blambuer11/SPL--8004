# SPL-8004 Deployment Guide

Complete deployment guide - from Solana program to frontend.

## 🛠️ Prerequisites

### Solana & Anchor

```bash
# Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/v1.18.0/install)"
solana --version

# Anchor Framework
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install 0.30.1
avm use 0.30.1
anchor --version

# Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### Node.js & npm

```bash
# Node.js 18+
node --version
npm --version
```

## 📁 Proje Yapısı

SPL-8004 iki ayrı repository'den oluşur:

```
spl-8004-program/          # Anchor Solana Program
├── programs/
│   └── spl-8004/
│       └── src/
│           ├── lib.rs
│           ├── state.rs
│           ├── errors.rs
│           ├── constants.rs
│           └── instructions/
├── tests/
├── Anchor.toml
└── Cargo.toml

spl-8004-frontend/         # React Frontend (bu repo)
├── src/
│   ├── components/
│   ├── pages/
│   ├── lib/
│   └── hooks/
└── package.json
```

## 🚀 Part 1: Solana Program Deployment

### 1. Anchor Workspace Oluştur

```bash
# Yeni klasör oluştur
mkdir spl-8004-program
cd spl-8004-program

# Anchor init
anchor init spl-8004

# Program kodlarını ekle
# (programs/spl-8004/src/ altına tüm Rust dosyalarını kopyala)
```

### 2. Program Kodları

`programs/spl-8004/src/` dizinine şu dosyaları ekle:

- `lib.rs` - Ana program modülü
- `state.rs` - Account yapıları
- `errors.rs` - Error tanımları
- `constants.rs` - Sabitler
- `instructions/` - Tüm instruction handlers

### 3. Build & Deploy (Devnet)

```bash
# Devnet'e geç
solana config set --url devnet

# Cüzdan oluştur (yoksa)
solana-keygen new --outfile ~/.config/solana/id.json

# Airdrop al
solana airdrop 2

# Build
anchor build

# Program ID'yi al
anchor keys list
# Çıktı: spl_8004: <PROGRAM_ID>

# Program ID'yi güncelle
# 1. programs/spl-8004/src/lib.rs içinde declare_id!("<PROGRAM_ID>")
# 2. Anchor.toml içinde programs.devnet.spl_8004 = "<PROGRAM_ID>"

# Tekrar build
anchor build

# Deploy
anchor deploy --provider.cluster devnet

# Verify
solana program show <PROGRAM_ID> --url devnet
```

### 4. Test (Devnet)

```bash
# Test çalıştır
anchor test --provider.cluster devnet

# Başarılı çıktı:
# ✓ Initializes global config
# ✓ Registers a new AI agent
# ✓ Updates agent metadata
# ✓ Submits validation (approved)
# ✓ Updates reputation after validation
# ✓ Submits another validation (rejected)
# ✓ Fetches final agent stats
# ✓ Deactivates agent
```

## 🎨 Part 2: Frontend Deployment

### 1. Program ID'yi Frontend'e Ekle

```typescript
// src/lib/spl8004-client.ts
export const SPL8004_PROGRAM_ID = new PublicKey("YOUR_DEPLOYED_PROGRAM_ID");
```

### 2. Frontend Build & Deploy

```bash
# Dependencies
npm install

# Development
npm run dev

# Production build
npm run build

# Deploy to Vercel/Netlify
# dist/ klasörünü deploy et
```

### 3. Environment Variables

```env
# .env
VITE_SOLANA_NETWORK=devnet
VITE_RPC_ENDPOINT=https://api.devnet.solana.com
VITE_PROGRAM_ID=<YOUR_DEPLOYED_PROGRAM_ID>
```

## 🌐 Part 3: Mainnet Deployment

### 1. Program Mainnet Deploy

```bash
# Mainnet'e geç
solana config set --url mainnet-beta

# SOL bakiyeni kontrol et (deployment için ~2-5 SOL gerekli)
solana balance

# Build (verifiable)
anchor build --verifiable

# Deploy
anchor deploy --provider.cluster mainnet-beta

# Program ID'yi kaydet
PROGRAM_ID=$(solana program show --programs | grep spl_8004 | awk '{print $1}')
echo "Program ID: $PROGRAM_ID"

# Security: Upgrade authority'yi upgrade için multi-sig'e devret
# veya tamamen kaldır (FINAL - geri alınamaz!)
solana program set-upgrade-authority <PROGRAM_ID> --final
```

### 2. Publish IDL

```bash
# Upload IDL to chain (optional but recommended)
anchor idl init <PROGRAM_ID> -f target/idl/spl_8004.json --provider.cluster mainnet-beta

# Update IDL
anchor idl upgrade <PROGRAM_ID> -f target/idl/spl_8004.json --provider.cluster mainnet-beta
```

### 3. Frontend Production

```typescript
// Production için RPC endpoint güncelle
// src/components/WalletProvider.tsx
const network = WalletAdapterNetwork.Mainnet;
const endpoint = "https://api.mainnet-beta.solana.com";
// VEYA premium RPC kullan: QuickNode, Helius, Triton
```

## 📊 Monitoring & Analytics

### Solana Explorer

```bash
# Program
https://explorer.solana.com/address/<PROGRAM_ID>?cluster=mainnet-beta

# Transactions
https://explorer.solana.com/tx/<TX_SIGNATURE>?cluster=mainnet-beta
```

### SolanaFM

```bash
https://solana.fm/address/<PROGRAM_ID>?cluster=mainnet-beta
```

## 🧪 Testing Checklist

### Devnet Tests

- [ ] Config initialization
- [ ] Agent registration (multiple agents)
- [ ] Metadata update
- [ ] Validation submission (approved)
- [ ] Validation submission (rejected)
- [ ] Reputation update calculation
- [ ] Rewards claim
- [ ] Agent deactivation
- [ ] PDA derivation
- [ ] Commission collection

### Frontend Tests

- [ ] Wallet connection (Phantom, Solflare)
- [ ] Agent registration form
- [ ] Agent list display
- [ ] Validation submission
- [ ] Real-time updates
- [ ] Error handling
- [ ] Mobile responsive

### Security Checklist

- [ ] PDA seeds verified
- [ ] Authority checks implemented
- [ ] Arithmetic overflow protection
- [ ] Account validation
- [ ] Reentrancy protection
- [ ] Input sanitization
- [ ] Rate limiting (frontend)

## 🔒 Security Best Practices

### 1. Audit

```bash
# Solana security audit tools
cargo install cargo-audit
cargo audit

# Anchor security checks
anchor test --skip-deploy
```

### 2. Program Security

- **Authority Management**: Use multi-sig for upgrade authority
- **PDA Security**: Proper seed validation
- **Account Validation**: Verify all account constraints
- **Math Safety**: Use checked arithmetic
- **Testing**: 100% test coverage

### 3. Frontend Security

- **RPC Protection**: Use rate-limited RPC endpoints
- **Transaction Simulation**: Always simulate before sending
- **Error Handling**: Proper error messages
- **Wallet Security**: Never request private keys

## 📚 Resources

- [Solana Documentation](https://docs.solana.com)
- [Anchor Book](https://book.anchor-lang.com)
- [Solana Cookbook](https://solanacookbook.com)
- [Solana Program Library](https://github.com/solana-labs/solana-program-library)

## 🆘 Troubleshooting

### Program Deploy Errors

```bash
# Error: Insufficient funds
solana airdrop 2  # devnet
# mainnet: SOL satın al

# Error: Account already exists
anchor clean
anchor build
anchor deploy --provider.cluster devnet

# Error: Program verification failed
anchor build --verifiable
```

### Frontend Errors

```bash
# Error: Program not found
# -> Program ID'yi kontrol et
# -> Network'ü kontrol et (devnet/mainnet)

# Error: Transaction failed
# -> Wallet SOL bakiyesini kontrol et
# -> RPC endpoint'i kontrol et
# -> Console logs'u incele
```

## 🎯 Next Steps

1. ✅ Devnet'e deploy
2. ✅ Test all instructions
3. ✅ Frontend integration
4. ✅ Security audit (önerilen)
5. ✅ Mainnet deploy
6. ✅ Community launch

## 💡 Tips

- **Devnet Testing**: Önce devnet'te kapsamlı test yap
- **RPC Limits**: Free RPC'ler rate-limited, production için premium RPC kullan
- **Transaction Fees**: Her transaction ~0.000005 SOL
- **Account Rent**: Account'lar rent-exempt olmalı
- **Program Size**: Max 10MB (Anchor ile genelde 200-500KB)

---

**Questions?** Solana Discord'da yardım al: https://discord.gg/solana

---

## 🔄 Program Upgrade / Redeploy (Anchor Upgradable Program)

Bu bölüm mevcut (upgradable) SPL-8004 programının yeni kod ile güncellenmesi (upgrade) için adımları içerir. Explorer'da gördüğünüz üç kritik adresi ayırt edin:

- **Program ID:** `G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW` (transaction gönderirken kullanılan sabit adres)
- **ProgramData (Executable Data):** `7JrGMaFiqiuou2Bvesirerk5LjrjZXMNYkBSBFoSqYhA` (upgrade edilebilir kodun tutulduğu hesap)
- **Upgrade Authority:** `E7iiAKWj43REw4Vy1Lw1Neu86m5HiBX8ER5dKZTmvvvu` (programı değiştirme yetkisine sahip cüzdan)

> Not: Yanlışlıkla ProgramData adresini frontend’e PROGRAM_ID olarak koymak `InstructionFallbackNotFound (0x65)` gibi hatalara yol açar.

### 1. Mevcut Durumu Doğrula
```bash
solana program show G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW --url devnet
# Çıktıda Upgrade Authority = E7iiA... ve ProgramData = 7JrGM... görmelisiniz
```

### 2. IDL ve Instrüksiyon Senkronizasyonu Kontrolü
```bash
anchor idl fetch G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW --provider.cluster devnet > idl-current.json
grep -E '"name": "(stake_validator|claim_validator_rewards|unstake_validator_instant)"' idl-current.json || echo "Eksik instruktor olabilir"
```

Eksik isimler varsa zincirde eski sürüm vardır → upgrade gerekir.

### 3. Temiz Build
```bash
cd spl-8004-program/spl-8004
anchor clean
cargo update
anchor build
```

### 4. Binary Hash Karşılaştırması (Opsiyonel Bütünlük)
```bash
shasum -a 256 target/deploy/spl_8004.so | awk '{print $1}' > local.hash
solana program show G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW --url devnet | grep -i Data > onchain.txt
# Anchor otomatik doğrulama sunmaz; hash kaydını audit klasörünüzde saklayın.
```

### 5. Upgrade İşlemi
Upgrade authority cüzdanınız (E7iiA...) aktif configte olmalı:
```bash
solana config get | grep -i Keypair
# Eğer farklı ise:
solana config set --keypair /PATH/TO/E7iiA_wallet.json

# Program ID zaten declare_id! içinde G8iY... olarak ayarlı olmalı.

anchor deploy --provider.cluster devnet
# veya manuel:
solana program deploy target/deploy/spl_8004.so --program-id G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW --url devnet
```

Başarılıysa yeni slot / güncellenmiş ProgramData lamports değerini görürsünüz.

### 6. IDL Güncellemesi (Eğer layout değiştiyse)
```bash
anchor idl upgrade G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW -f target/idl/spl_8004.json --provider.cluster devnet
anchor idl fetch G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW --provider.cluster devnet > idl-after.json
diff -u idl-current.json idl-after.json || echo "IDL değişiklikleri uygulandı"
```

### 7. Frontend / SDK Senkronizasyonu
```bash
grep -R "G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW" src/lib | wc -l   # Kod referans sayısı
echo "VITE_PROGRAM_ID=G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW" >> .env.local
```
Vite dev sunucusunu yeniden başlat:
```bash
npm run dev
```

### 8. Hızlı Fonksiyon Testleri
```bash
# 1. stake_validator (küçük miktar — min stake şartını sağlayın)
node scripts/test-stake.js
# 2. claim_validator_rewards (yeni reward hesaplaması çalışıyor mu)
node scripts/test-claim.js
```

### 9. Yaygın Hata Teşhisleri
| Hata | Olası Neden | Çözüm |
|------|-------------|-------|
| InstructionFallbackNotFound (0x65) | Eski program versiyonu / yanlış Program ID | IDL fetch ile isimleri doğrula, upgrade et |
| AccountDidNotSerialize | Layout değişmiş, frontend eski parse kullanıyor | Parse fonksiyonunda uzunluk guard ekle (yapıldı) |
| Signature verification failed | Wallet boş / simülasyon iptali | Solana airdrop, tekrar dene |
| InsufficientFunds | Validator PDA bakiyesi reward transferine yetmiyor | Küçük stake arttır, yeniden claim et |

### 10. Upgrade Authority Devri (Opsiyonel Güvenlik)
Upgrade tamamlandıktan sonra mainnet için çoklu-imza veya finalization:
```bash
# Çoklu imza devri (örnek pubkey)
solana program set-upgrade-authority G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW --new-upgrade-authority <MULTISIG_PUBKEY>

# Tamamen kilitle (geri alınamaz)
solana program set-upgrade-authority G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW --final
```

### 11. Otomasyon Script Örneği
`scripts/anchor-upgrade.sh` (oluşturun):
```bash
#!/usr/bin/env bash
set -euo pipefail
PROGRAM_ID="G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW"
CLUSTER="devnet"
echo "[1/6] Clean build"
anchor clean && anchor build
echo "[2/6] Deploy upgrade"
anchor deploy --provider.cluster "$CLUSTER"
echo "[3/6] Fetch IDL"
anchor idl fetch "$PROGRAM_ID" --provider.cluster "$CLUSTER" > idl-after.json
echo "[4/6] Grep critical instructions"
grep -E '"name": "(stake_validator|claim_validator_rewards|unstake_validator_instant)"' idl-after.json || echo "WARN: Missing expected instruction(s)"
echo "[5/6] Show program"
solana program show "$PROGRAM_ID" --url "$CLUSTER"
echo "[6/6] Done"
```

### 12. Post-Upgrade Checklist
- [ ] Explorer’da slot güncellemesi
- [ ] IDL’de yeni instruktorlar görünüyor
- [ ] Frontend env güncellendi ve yeniden başlatıldı
- [ ] Test stake/claim başarılı
- [ ] Eski/legacy klasörler (ör: `spl_8004/` veya `SPL--8004/spl_8004/`) işaretlendi ya da kaldırıldı

## 📌 Güvenlik Notları (Upgrade Spesifik)
- Upgrade binary’sini imzalama / hash kaydı: `shasum -a 256 spl_8004.so` çıktısını audit klasöründe saklayın.
- CI pipeline’da otomatik `anchor build --verifiable` + hash karşılaştırması ekleyin.
- Upgrade authority cüzdanını hot wallet’ta tutmayın; devnet dışında harden edilmiş multisig tercih edin.
- Frontend’e (sadece dev modda) ProgramData adresini gösteren küçük bir debug etiketi ekleyin; production’da gizleyin.

---


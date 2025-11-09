# MAINNET'E GEÇİŞ KILAVUZU

## 📍 ŞU ANKİ DURUM: DEVNET

Tüm servisler şu an **Devnet** üzerinde çalışıyor:

### Aktif Servisler
- ✅ **Frontend**: http://localhost:8080 (Devnet)
- ✅ **Kora Mock RPC**: http://localhost:8090 (Mock)
- ✅ **Facilitator**: http://localhost:3001 (Devnet, MOCK_MODE=false)
- ✅ **Validator API**: http://localhost:4021 (Devnet)

### Mevcut Ayarlar
- **Network**: `solana-devnet`
- **USDC Mint**: `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU` (Devnet)
- **SPL-8004 Program**: `G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW` (Devnet)
- **Solana RPC**: `https://api.devnet.solana.com`

---

## 🚀 MAINNET'E GEÇİŞ ADIMLARI

### 1. Facilitator (.env)
```bash
PORT=3001
KORA_RPC_URL=https://kora-mainnet-rpc.example.com  # ← Gerçek Kora Mainnet RPC
KORA_API_KEY=your_production_api_key_here          # ← Production API Key
KORA_SIGNER_ADDRESS=YourMainnetSignerAddress...    # ← Mainnet Signer
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com # ← Mainnet RPC
NETWORK=solana-mainnet                              # ← Mainnet
USDC_MINT=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v  # ← Mainnet USDC
MOCK_MODE=false
```

### 2. Frontend (.env)
```bash
VITE_SOLANA_NETWORK=mainnet-beta
VITE_RPC_ENDPOINT=https://api.mainnet-beta.solana.com
VITE_PROGRAM_ID=YOUR_MAINNET_PROGRAM_ID_HERE     # ← Mainnet'e deploy edilmiş program ID
VITE_SOLANA_RPC=
UPSTREAM_SOLANA_RPC=https://api.mainnet-beta.solana.com

# X402 Payment Integration
VITE_X402_FACILITATOR_URL=https://your-facilitator.example.com  # ← Production URL
VITE_VALIDATOR_API_URL=https://your-validator.example.com       # ← Production URL
VITE_SPL8004_TREASURY=YourMainnetTreasuryAddress...             # ← Mainnet Treasury
VITE_USDC_MINT=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v     # ← Mainnet USDC
```

### 3. Validator API (.env)
```bash
PORT=4021
NETWORK=solana-mainnet
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
FACILITATOR_URL=https://your-facilitator.example.com
SPL8004_PROGRAM_ID=YOUR_MAINNET_PROGRAM_ID_HERE
TREASURY_ADDRESS=YourMainnetTreasuryAddress...
USDC_MINT=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
```

---

## ⚠️ MAINNET GEÇİŞİ İÇİN GEREKLİLER

### 1. Program Deploy
```bash
# SPL-8004 programını Mainnet'e deploy et
cd /Users/bl10buer/Desktop/sp8004/spl-8004-program/spl-8004
anchor build
anchor deploy --provider.cluster mainnet
# Deploy edilen Program ID'yi not al
```

### 2. Gerçek Kora RPC
- **Kora Mock RPC kapatılmalı** (sadece development için)
- Gerçek Kora production endpoint gerekli
- API key ve signer address al

### 3. Production Infrastructure
- **Facilitator**: Vercel/Railway/Fly.io'ya deploy
- **Validator API**: Vercel/Railway/Fly.io'ya deploy
- **Domain**: HTTPS ile production domain
- **Rate Limiting**: API endpoint'lerine rate limit ekle
- **Monitoring**: Error tracking ve metrics

### 4. Security Checklist
- [ ] Environment variables güvenli şekilde sakla
- [ ] API keys rotate edilebilir
- [ ] CORS ayarları production için configure
- [ ] Rate limiting aktif
- [ ] Payment verification hardening
- [ ] Error messages production-safe (sensitive data leak yok)

---

## 🧪 DEVNET'TE TEST (ŞU AN)

Şu an **Devnet** modunda çalışıyor, yani:

✅ **Avantajlar**:
- Ücretsiz test
- Hızlı iteration
- Hata yapma riski yok
- Devnet faucet'lerden SOL ve USDC al

⚠️ **Limitler**:
- Gerçek para yok
- Test network (bazen yavaş)
- Mainnet production data yok

### Devnet'te Test Nasıl Yapılır?

1. **Phantom Wallet → Settings → Developer Settings → Testnet Mode** aç
2. **Devnet SOL al**: https://faucet.solana.com
3. **Devnet USDC al**: SPL Token faucet kullan veya swap et
4. **http://localhost:8080** → Dashboard → X402 Test
5. **Pay with Phantom** → Approve → Test başarılı!

---

## 🎯 ÖNERİ: ŞİMDİLİK DEVNET'TE KAL

**Sebep**:
1. Mainnet'e geçmek için **gerçek Kora RPC** gerekli (şu an mock)
2. Program **Mainnet'e deploy** edilmeli
3. **Production infrastructure** kurulmalı (hosting, domains, SSL)
4. **Security audit** yapılmalı
5. **Gerçek para** risk var

**Ne Zaman Mainnet'e Geç?**:
- [ ] Devnet'te tüm testler başarılı
- [ ] Kora production RPC hazır
- [ ] Program Mainnet'e deploy edildi
- [ ] Production hosting ready
- [ ] Security audit tamamlandı
- [ ] Rate limiting ve monitoring aktif

---

## 🔄 HIZLI GEÇİŞ (RİSKLİ)

Eğer hemen Mainnet'e geçmek istersen:

```bash
# 1. Facilitator
cd /Users/bl10buer/Desktop/sp8004/spl-8004-program/x402-facilitator
# .env dosyasını yukarıdaki Mainnet ayarlarıyla güncelle
npm run dev

# 2. Validator API
cd /Users/bl10buer/Desktop/sp8004/spl-8004-program/validator-api
# .env dosyasını yukarıdaki Mainnet ayarlarıyla güncelle
npm run dev

# 3. Frontend
cd /Users/bl10buer/Desktop/sp8004/SPL--8004
# .env dosyasını yukarıdaki Mainnet ayarlarıyla güncelle
npm run dev
```

**UYARI**: Bu şekilde geçersen gerçek USDC harcayacaksın!

---

## ✅ SONUÇ

- **Şu An**: ✅ Devnet'te çalışıyor (güvenli test ortamı)
- **Mainnet**: ❌ Henüz değil (production hazırlığı gerekli)
- **Öneri**: Devnet'te testleri tamamla, sonra production planı yap

**Localhost zaten çalışıyor**: http://localhost:8080 🎉

Test yapmak ister misin yoksa Mainnet hazırlığı için detaylı plan mı istiyorsun?

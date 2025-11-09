# Autonomous Agent Payment Automation

Otonom ajanlar arası ödeme sistemleri için script'ler.

## 📋 İçerik

### 1. `auto-pay.mjs` - Periyodik Ödemeler
Ajanlar arası otomatik USDC transferleri için script.

**Özellikler:**
- Yapılandırılabilir interval (saniye)
- Güvenlik limiti (MAX_TX)
- SPL Token transfer
- Explorer link'leri

**Kullanım:**
```bash
# Ortam değişkenlerini ayarla
export PAYER_KEYPAIR_PATH="./my-solana-keypair.json"
export RECIPIENT_PUBKEY="8x7k..."
export AMOUNT_USDC="0.01"
export INTERVAL_SEC="30"
export MAX_TX="10"

# Script'i çalıştır
npm run auto-pay
```

### 2. `delivery-handshake.mjs` - Kimlik Doğrulama + Ödeme
Drone-robot teslimat senaryosu için challenge-response protokolü.

**Senaryo:**
1. Kargo drone eve gelir
2. Ev robotu kapıyı açar
3. İki robot birbirini tanımlar (SPL-8004 kimlik sistemi)
4. Ödeme anında doğrulanır
5. İşlem tamamlanır

**Özellikler:**
- ✅ **On-chain kimlik çözümleme** (SPL-8004 PDA lookup)
- ✅ **Real-time ödeme izleme** (blockchain transaction parsing)
- Ed25519 signature doğrulama (tweetnacl)
- Memo-based handshake data
- Challenge-response protokolü

**Mimari:**
```
┌─────────────┐                    ┌─────────────┐
│   DRONE     │                    │    HOME     │
│  (Payer)    │                    │  (Receiver) │
└──────┬──────┘                    └──────┬──────┘
       │                                  │
       │  1. agentId + ephemeral key      │
       │─────────────────────────────────>│
       │                                  │
       │  2. challenge (nonce+timestamp)  │
       │<─────────────────────────────────│
       │                                  │
       │  3. USDC payment + signed memo   │
       │─────────────────────────────────>│
       │     HANDSHAKE|agentId|ts|nonce   │
       │                                  │
       │  4. Verify signature + amount    │
       │                 ✅               │
       │                                  │
       │  5. Door unlock                  │
       │                 🚪               │
```

**Mod 1: Drone (Payer)**
```bash
export MODE="drone"
export AGENT_ID="agent-home-001"
export PAYER_KEYPAIR_PATH="./drone-wallet.json"
export DELIVERY_FEE_USDC="0.05"

npm run delivery-handshake:drone
```

**Mod 2: Home Robot (Receiver)**
```bash
export MODE="home"
export AGENT_ID="agent-drone-001"
export PAYER_KEYPAIR_PATH="./home-wallet.json"
export DELIVERY_FEE_USDC="0.05"

npm run delivery-handshake:home
```

### 3. `spl8004-resolver.mjs` - Kimlik Çözücü
SPL-8004 program'dan agentId→owner çözümlemesi.

**Fonksiyonlar:**
- `findIdentityPda(agentId)` - PDA hesaplama
- `parseIdentityAccount(data)` - Account data deserialize
- `resolveAgentId(agentId, connection)` - On-chain lookup
- `resolveAgentIdsBatch(agentIds, connection)` - Toplu sorgu

**Örnek:**
```javascript
import { Connection } from '@solana/web3.js';
import { resolveAgentId } from './spl8004-resolver.mjs';

const connection = new Connection('https://api.devnet.solana.com');
const owner = await resolveAgentId('agent-drone-001', connection);
console.log('Owner:', owner.toBase58());
```

## 🔧 Kurulum

1. Bağımlılıkları yükle:
```bash
npm install
```

2. Ortam değişkenlerini yapılandır:
```bash
cp api/automation/.env.automation.example api/automation/.env.automation
# .env.automation dosyasını düzenle
```

3. Wallet keypair'i hazırla:
```bash
solana-keygen new --outfile ./my-solana-keypair.json
# Devnet SOL ve USDC al
```

## 🧪 Test

### On-chain Identity Lookup Test
```bash
node -e "
import('./api/automation/spl8004-resolver.mjs').then(async m => {
  const { Connection } = await import('@solana/web3.js');
  const conn = new Connection('https://api.devnet.solana.com');
  const owner = await m.resolveAgentId('test-agent', conn);
  console.log('Resolved:', owner.toBase58());
});
"
```

### Payment Watch Test
```bash
# Terminal 1: Home robot bekliyor
MODE=home AGENT_ID=agent-drone-001 npm run delivery-handshake:home

# Terminal 2: Drone ödeme gönderiyor
MODE=drone AGENT_ID=agent-home-001 npm run delivery-handshake:drone
```

## 📊 Monitoring

Script'ler console'a detaylı log çıktısı verir:
- ✅ Başarılı işlemler
- ⚠️ Uyarılar (fallback kullanımı)
- ❌ Hatalar
- 🔗 Explorer link'leri

## 🔒 Güvenlik

**Mevcut:**
- Ed25519 signature doğrulama
- Timestamp freshness check
- On-chain identity verification
- Amount validation

**TODO:**
- [ ] Nonce replay protection
- [ ] On-chain receipt PDA
- [ ] Rate limiting
- [ ] Multi-sig support

## 🚀 Production Deployment

1. RPC endpoint'i değiştir (Helius/QuickNode)
2. WebSocket kullan (polling yerine)
3. Redis ekle (nonce tracking için)
4. PM2 ile servis olarak çalıştır
5. Monitoring ekle (Datadog/Grafana)

## 📚 Referanslar

- [SPL-8004 Standard](../../SPL-8004_STANDARD.md)
- [X402 Facilitator](../../spl-8004-program/x402-facilitator/)
- [Solana Token Program](https://spl.solana.com/token)

# 🔗 NOEMA Link Test Rehberi

## Ne Yaptık?

`noema_link` programı, NOEMA token staking ile SPL-8004 validator haklarını birbirine bağlayan bir köprü programıdır.

### Program Detayları
- **Program ID**: `4X1mFJFMmsn1yFZ8aXjyyHaXVrRLAWT4n4awtD1eYgG8`
- **Network**: Devnet
- **Dil**: Rust (Anchor Framework)

---

## 🎯 Amaç ve Faydalar

### 1. **Token Utility** 
NOEMA token artık sadece transfer değil, **validator olmak için zorunlu** hale gelecek.

### 2. **Çift Katmanlı Güvenlik**
```
SPL-8004 Validator Rights = SOL Stake ✅ + NOEMA Stake ✅
```

### 3. **Sybil Saldırı Koruması**
İki farklı staking mekanizması fake validator'ları engeller.

### 4. **Merkezi Olmayan Yönetişim**
NOEMA token sahipleri sistemde söz sahibi olur.

---

## 🧪 Frontend'de Test Etme

### Ön Gereksinimler
1. ✅ Wallet'ta devnet SOL olmalı
2. ✅ Wallet'ta NOEMA token olmalı (faucet ile alabilirsin)
3. ✅ SPL-8004'te validator olmak için SOL stake edilmiş olmalı
4. ✅ NOEMA programında validator olmak için NOEMA stake edilmiş olmalı

### Adım 1: Staking Sayfasına Git
```
http://localhost:8080/app/staking
```

### Adım 2: NOEMA Tab'ına Geç
Sol taraftaki tab listesinde **"NOEMA Staking"** sekmesine tıkla.

### Adım 3: Link Status Kontrol Et
Sayfanın üst kısmında bir kart göreceksin:

```
┌─────────────────────────────────────────┐
│  🔗 Validator Link Status               │
│                                          │
│  Status: Not Linked                     │
│  [Link Validators] Button               │
└─────────────────────────────────────────┘
```

### Adım 4: NOEMA Faucet (Gerekirse)
Eğer NOEMA token'ın yoksa:
1. "Request Devnet Faucet" butonuna tıkla
2. 100 NOEMA token alacaksın
3. 1 saat sonra tekrar alabilirsin

### Adım 5: NOEMA Stake Et
1. Amount alanına stake etmek istediğin miktarı yaz (minimum 1 NOEMA)
2. "Stake NOEMA" butonuna tıkla
3. Wallet onayı ver
4. İşlem başarılı olunca validator account'un oluşur

### Adım 6: Link'i Oluştur
1. Link Status kartındaki **"Link Validators"** butonuna tıkla
2. Wallet ile işlemi onayla
3. Başarılı olursa:
   ```
   Status: Linked ✅
   Created: [timestamp]
   NOEMA Validator: [address]
   SPL Validator: [address]
   ```

---

## 🔍 Link Nasıl Çalışıyor?

### On-Chain İşlem
```rust
// Kullanıcı "Link" butonuna tıklayınca
pub fn link(ctx: Context<LinkValidators>) -> Result<()> {
    // 1. NOEMA validator PDA'yı verify et
    let (expected_noema, _) = find_pda(["noema_validator", user]);
    require!(noema_validator == expected_noema);
    
    // 2. SPL-8004 validator PDA'yı verify et
    let (expected_spl, _) = find_pda(["validator", user]);
    require!(spl_validator == expected_spl);
    
    // 3. Link PDA account oluştur
    link_account.authority = user;
    link_account.noema_validator = noema_validator;
    link_account.spl_validator = spl_validator;
    link_account.created_ts = now();
    
    Ok(())
}
```

### Link PDA Yapısı
```
Seeds: ["noema_link", user_pubkey]
Data:
  - authority: Pubkey         (32 bytes)
  - noema_validator: Pubkey   (32 bytes)
  - spl_validator: Pubkey     (32 bytes)
  - created_ts: i64           (8 bytes)
```

---

## 💡 Gelecekte Ne Olacak?

### Faz 1: Link Oluşturma ✅ (ŞU AN)
Kullanıcılar validator'larını link edebilirler.

### Faz 2: SPL-8004 Entegrasyonu (YAKINDA)
```rust
// SPL-8004 claim_rewards instruction'ına eklenecek
pub fn claim_rewards(ctx: Context<ClaimRewards>) -> Result<()> {
    // Link kontrolü
    let link_pda = find_link_pda(user);
    require!(link_pda.exists(), "Must link validators first");
    
    // NOEMA stake kontrolü
    let noema_validator = load_account(link_pda.noema_validator);
    require!(
        noema_validator.staked_amount >= MIN_NOEMA_STAKE,
        "Insufficient NOEMA stake"
    );
    
    // Reward'ları ver
    transfer_rewards(user, amount);
    Ok(())
}
```

### Faz 3: Dinamik Ağırlıklandırma
```
Validator Power = SOL_stake_weight * NOEMA_stake_weight
```

### Faz 4: Governance
NOEMA stake miktarına göre oy kullanma hakkı.

---

## 🐛 Hata Ayıklama

### "Link account already exists"
✅ Zaten link'lenmiş, tekrar yapmana gerek yok!

### "NOEMA validator not found"
❌ Önce NOEMA stake et, sonra link'le.

### "SPL validator not found"
❌ Önce SOL stake et (SPL-8004'te), sonra link'le.

### "Invalid NOEMA validator PDA"
❌ Yanlış program ID veya seed. Environment değişkenlerini kontrol et.

---

## 📊 Link Sonrası Kontroller

### Browser Console'da
```javascript
// Link account bilgilerini al
const client = createNoemaLinkClient(connection, wallet);
const link = await client.getLinkAccount(wallet.publicKey);

console.log("Link Status:", link);
// {
//   authority: PublicKey,
//   noemaValidator: PublicKey,
//   splValidator: PublicKey,
//   createdTs: BigInt,
//   address: PublicKey
// }
```

### Solana Explorer'da
1. Transaction signature'ı kopyala
2. https://explorer.solana.com/?cluster=devnet adresine git
3. Transaction'ı incele
4. "Program Instruction Logs" bölümünde link PDA adresini gör

### CLI ile
```bash
# Link account'u sorgula
npm run noema:link

# Çıktı:
# Already linked: {
#   authority: '...',
#   noemaValidator: '...',
#   splValidator: '...',
#   createdTs: 1234567890
# }
```

---

## 🎉 Başarı Kriterleri

Link işlemi başarılı olduğunda:
1. ✅ Frontend'de "Linked" durumu görünür
2. ✅ Transaction signature alırsın
3. ✅ Link PDA account blockchain'de oluşmuş olur
4. ✅ İki validator account birbirine bağlanmış olur
5. ✅ Gelecekte SPL-8004 işlemlerinde bu link kontrol edilecek

---

## 🚀 İleriye Dönük Planlama

### Öncelik 1: SPL-8004 Entegrasyonu
`claim_rewards`, `register_agent` gibi fonksiyonlara link kontrolü ekle.

### Öncelik 2: Unlink Fonksiyonu
Kullanıcıların link'i kaldırabilmesi için `unlink` instruction ekle.

### Öncelik 3: Minimum Stake Parametresi
On-chain config'e `MIN_NOEMA_STAKE` parametresi ekle, dinamik yapılabilir.

### Öncelik 4: Metrics Dashboard
Link'li validator'ların istatistiklerini gösteren dashboard.

### Öncelik 5: Multi-sig Support
Birden fazla imzacının onayıyla link oluşturma.

---

## 📞 Destek

Sorularınız için:
- GitHub Issues: SPL--8004/issues
- Documentation: NOEMA_LINKING.md
- Code: `spl_8004/programs/noema_link/src/lib.rs`

---

*Last Updated: 14 Kasım 2025*

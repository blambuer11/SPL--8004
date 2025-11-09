# APP SAYFASINDA X402 TEST ETME KILAVUZU

## 🚀 BAŞLATMA ADIMLARI

### 1. Backend Servislerini Başlat

#### Terminal 1: Facilitator
```bash
cd /Users/bl10buer/Desktop/sp8004/spl-8004-program/x402-facilitator
npm run dev
```
**Beklenen çıktı:**
```
🚀 SPL-8004 X402 Facilitator
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Server running on http://localhost:3001
🌐 Network: solana-devnet
🧪 Mock Mode: ENABLED
```

#### Terminal 2: Validator API
```bash
cd /Users/bl10buer/Desktop/sp8004/spl-8004-program/validator-api
npm run dev
```
**Beklenen çıktı:**
```
[validator-api] listening on http://localhost:4021
```

### 2. Frontend'i Başlat

#### Terminal 3: Frontend
```bash
cd /Users/bl10buer/Desktop/sp8004/SPL--8004
npm run dev
```
**Beklenen çıktı:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

---

## 🧪 TEST ADIMLARI

### Adım 1: Tarayıcıda Aç
1. Tarayıcıda `http://localhost:5173` adresine git
2. **Dashboard** sayfasına tıkla (`/app`)

### Adım 2: Phantom Wallet Bağla
1. Sağ üstte **"Connect Wallet"** butonuna tıkla
2. Phantom wallet'ı seç ve bağlan
3. Wallet bağlandığında Dashboard içeriği görünecek

### Adım 3: X402 Test Sekmesine Git
1. Sol taraftaki sidebar'da **"X402 Rewards"** sekmesine tıkla
2. X402 Payment Test sayfası açılacak

### Adım 4: Endpoint Seç
İki seçenek var:
- **Leaderboard (0.0001 USD)** - GET isteği, top agent'ları listeler
- **Submit Validation (0.001 USD)** - POST isteği, validation gönderir

Birini seç (örnek: Leaderboard)

### Adım 5: İlk Test - Ödemesiz İstek (402 Bekliyoruz)
1. **"Test İsteği Gönder (Ödemesiz)"** butonuna tıkla
2. **Beklenen sonuç:** 
   - Sarı arka planlı "Response Status: 402" kutusu
   - "💳 Ödeme Gerekli!" mesajı
   - Payment requirement detayları:
     ```json
     {
       "version": "x402-demo-1",
       "priceUsd": 0.0001,
       "network": "solana-devnet",
       "receiver": "9x3TDBKE7qFHXmvUUhPMkkSBhLmzazRxQaKwzSrQwcXX",
       "tokenMint": "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
       "facilitator": "http://localhost:3001"
     }
     ```

### Adım 6: Demo - Ödeme Bypass (Simülasyon)
1. 402 response aldıktan sonra, aşağıda **"🔓 Bypass ile Tekrar Dene (Demo)"** butonu görünecek
2. Bu butona tıkla
3. **Beklenen sonuç:**
   - Yeşil arka planlı "Response Status: 200" kutusu
   - "✅ Başarılı!" mesajı
   - Endpoint'in döndürdüğü data:
     - **Leaderboard için:**
       ```json
       {
         "data": [
           { "agentId": "alpha", "score": 9847 },
           { "agentId": "beta", "score": 9234 },
           { "agentId": "gamma", "score": 8956 }
         ]
       }
       ```
     - **Submit Validation için:**
       ```json
       {
         "ok": true,
         "accepted": true,
         "ref": "val_1730752898..."
       }
       ```

### Adım 7: Diğer Endpoint'i Test Et
1. Üstteki butonlardan diğer endpoint'i seç
2. Adım 5 ve 6'yı tekrarla

---

## 🎯 BEKLENENdetayLAR

### 402 Response (Ödeme Gerekli)
```
Status: 402
Toast: "402 Payment Required - Ödeme gerekli!"
UI: Sarı kutu, requirement JSON, ödeme detayları
```

### 200 Response (Başarılı)
```
Status: 200
Toast: "İstek başarılı!"
UI: Yeşil kutu, endpoint data JSON
```

### Bağlantı Hatası
```
Status: 0
Toast: "Bağlantı hatası"
UI: Kırmızı kutu
```

---

## 🔍 SORUN GİDERME

### "Bağlantı hatası" alıyorum
**Çözüm:**
1. Backend servislerin çalıştığını kontrol et:
   ```bash
   curl http://localhost:3001/health
   curl http://localhost:4021/health
   ```
2. Her ikisi de `{"status":"ok"}` dönmeli
3. Dönmüyorsa servisleri yeniden başlat

### Port zaten kulanımda (EADDRINUSE)
**Çözüm:**
```bash
# Hangi süreç kullanıyor?
lsof -i :3001
lsof -i :4021

# Süreci öldür
kill -9 <PID>

# Tekrar başlat
npm run dev
```

### Wallet bağlanamıyorum
**Çözüm:**
1. Phantom extension kurulu mu kontrol et
2. Network'ü Devnet'e çek (Phantom ayarlar > Developer Settings > Testnet Mode)
3. Sayfayı yenile

### 402 yerine direkt 200 geliyor
**Çözüm:**
- Bu normal değil; validator-api'nin 402 middleware'i çalışmıyor demektir
- `validator-api/src/server.ts` dosyasında `requirePayment()` middleware'inin endpoint'lere uygulandığından emin ol

---

## 📚 EK BİLGİLER

### .env Konfigürasyonu
Frontend `.env` dosyası:
```bash
VITE_VALIDATOR_API_URL=http://localhost:4021
VITE_X402_FACILITATOR_URL=http://localhost:3001
VITE_PROGRAM_ID=G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW
```

### Mock Mode Nedir?
- Facilitator'da `MOCK_MODE=true` olduğu için gerçek blockchain transaction'ları yapmaz
- Verify ve settle endpoint'leri sahte yanıt döner
- Gerçek ödeme akışı için `MOCK_MODE=false` yapıp Kora RPC ayarları gerekir

### Gerçek Ödeme Akışı (İleride)
1. Frontend'te 402 gelince "Pay" butonu göster
2. Phantom ile USDC transfer transaction oluştur
3. Facilitator'a gönder (`/verify`, sonra `/settle`)
4. Settle'dan dönen signature'ı header'a ekle
5. Validator API'ye tekrar istek at

---

## ✅ BAŞARILI TEST SONUCU

Tüm adımları tamamladıysan:
- ✅ Backend servisleri çalışıyor
- ✅ Frontend başlatıldı
- ✅ Wallet bağlandı
- ✅ 402 response alındı ve requirement görüldü
- ✅ Bypass ile 200 response alındı ve data görüntülendi

**X402 payment protocol altyapısı tamamen çalışıyor! 🎉**

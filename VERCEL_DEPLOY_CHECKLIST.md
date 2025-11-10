# Vercel Deploy Checklist

Son push: `fix(vercel): explicit route for build-info.json + ensure headers apply` (commit: 613e79a08)

## Beklenen Vercel Deploy Sonuçları
- Build-info erişimi: https://www.noemaprotocol.xyz/build-info.json → JSON döner (commit, branch, builtAt)
- Güvenlik başlıkları:
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff
  - Referrer-Policy: strict-origin-when-cross-origin
  - Permissions-Policy: geolocation=(), microphone=(), camera=()
  - Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
  - Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; ...

## Vercel Proje Ayarları (Kontrol Et)
1. Project Settings → General:
   - Root Directory: **boş** (repo kökü)
   - Framework Preset: Vite veya Other (vercel.json okur)
   
2. Project Settings → Build & Development:
   - Build Command: **npm install && npm run build** (vercel.json'dan alınır veya override)
   - Output Directory: **dist** (vercel.json'dan alınır)
   - Install Command: **npm install**
   
   **Kritik**: Eğer "Override" düğmeleri aktifse ve farklı değerler girilmişse, vercel.json göz ardı edilir. Tüm override'ları kaldır ("Reset" veya "Use vercel.json" seç).

3. Project Settings → Domains:
   - www.noemaprotocol.xyz bu projeye bağlı olmalı (prj_nGLna4gHOihxcSwPDYSPf64A05Yd).
   - Eğer başka bir projeye bağlıysa, o projeden kaldırıp buraya ekle.

4. Environment Variables (opsiyonel):
   - UPSTREAM_SOLANA_RPC (api/solana.ts için)
   - NOEMA_API_KEY (SDK kullanımı için)
   - Diğer API key'ler (varsa)

## Deploy Sonrası Doğrulama Komutları
Deploy bittiğinde (Vercel Deployments sekmesinde "Ready" görünce):

```bash
# 1. Build info kontrolü
curl https://www.noemaprotocol.xyz/build-info.json

# 2. Header kontrolü
npm run check:headers -- https://www.noemaprotocol.xyz /documentation

# 3. Edge fonksiyon testi (api/solana)
npm run test:edge:solana -- https://www.noemaprotocol.xyz
```

### Beklenen Sonuçlar
- build-info.json: commit "613e79a08" veya sonrası; builtAt yakın tarih.
- check:headers: Tüm güvenlik başlıkları "-" yerine değer dolu olmalı.
- test:edge:solana: 200 status (şu an 405 dönüyordu, Vercel'de api/ klasörü edge function olarak algılanmalı).

## Sorun Giderme
- **build-info.json hâlâ 404**: Vercel Build Logs → dist/build-info.json oluşturulmuş mu kontrol et. prebuild script çalışmamış olabilir.
- **Header'lar uygulanmamış**: Project Settings'de vercel.json override edilmiş olabilir; "Use vercel.json" seç.
- **api/solana 405**: Vercel otomatik olarak api/*.ts dosyalarını serverless/edge function olarak algılar. Eğer algılanmıyorsa, Vercel Functions sekmesinde /api/solana görünmüyor demektir; bu durumda api/ klasörünün root'ta olduğundan emin ol (✓).

## Son Kontrol: Vercel Dashboard
- Deployments → en son deployment'ın "Ready" olması.
- Functions sekmesi → /api/solana görünmeli (Edge Function).
- Domains → www.noemaprotocol.xyz bu projeye atanmış olmalı.
- Analytics → Traffic geldiğinde 200 vs 404 oranını izle.

---
**Not**: Eğer deploy sonrası tüm kontroller geçerse ama UI değişiklikleri görünmüyorsa, tarayıcı/CDN cache'idir. Hard refresh (Cmd+Shift+R) veya farklı cihaz/ağ dene.

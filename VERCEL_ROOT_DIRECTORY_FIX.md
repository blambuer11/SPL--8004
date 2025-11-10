# Vercel Deployment Sorun Giderme

## SORUN
- `/api/build-info` ve `/api/solana` endpoint'leri HTML döndürüyor (SPA fallback'e düşüyor)
- `vercel.json` içindeki header'lar uygulanmıyor (hepsi "-")
- Vercel `/api` klasörünü serverless function olarak algılamıyor

## NEDEN
Vercel Project Settings'de **Root Directory** yanlış set edilmiş olabilir veya başka bir override var.

## ÇÖZÜM ADIMLARI

### 1. Vercel Project Settings Kontrolü
Vercel Dashboard → Proje (prj_nGLna4gHOihxcSwPDYSPf64A05Yd) → Settings:

#### A) General Settings
- **Root Directory**: MUTLAKA BOŞ OLMALI (repo root)
  - Eğer bir değer varsa (örn. `dist`, `src`, vs), KALDIR.
  - "Edit" → boş bırak → Save.

#### B) Build & Development Settings
- **Build Command**: boş bırak veya `npm run build`
- **Output Directory**: `dist` (doğru)
- **Install Command**: boş bırak veya `npm install`
- **Framework Preset**: Vite (doğru)

Tüm bu alanlarda "Override" düğmesi AKTİFSE ve farklı bir değer girildiyse, "Reset to Default" veya override'ı kapat.

#### C) Functions
- Functions sekmesinde `/api/build-info` ve `/api/solana` görünmeli.
- Eğer görünmüyorsa, Root Directory yanlış demektir.

### 2. Domain Settings
- **Domains** sekmesi → `www.noemaprotocol.xyz` ve `noemaprotocol.vercel.app` bu projeye atanmış olmalı.
- Başka bir projeye atandıysa, o projeden kaldır ve bu projeye ekle.

### 3. vercel.json Simplification (Yapılacak)
Current config'de routes karmaşık; şu format daha doğru:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist", 
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```
`routes` yerine `rewrites` kullan; `handle: filesystem` zaten default.

### 4. Test Deployment
Root Directory düzeltildikten sonra:
- Vercel Dashboard → Deployments → "Redeploy" (use latest commit)
- Build log'unda şunları kontrol et:
  - "Serverless Functions" başlığı altında `/api/build-info.js` görünmeli
  - Prebuild/postbuild çıktıları (varsa)

Deploy sonrası:
```bash
curl https://www.noemaprotocol.xyz/api/build-info
# Beklenen: {"commit":"...","branch":"main","builtAt":"..."}

curl https://www.noemaprotocol.xyz/api/solana -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'
# Beklenen: JSON response (HTML değil)
```

### 5. Header'lar İçin Alternatif
Eğer `vercel.json` headers çalışmazsa:
- Her API function kendi header'larını set etmeli (CORS için zaten yapılmış).
- Static site için: `public/_headers` dosyası var ama Vercel bunu sadece static hosting'de uygular; SPA için çalışmaz.

## ÖNEMLİ
**Root Directory** en kritik ayar. Eğer bu yanlışsa:
- Vercel `/api` klasörünü görmez.
- `vercel.json` yanlış yerden okunur.
- dist çıktısı yanlış dizinden alınır.

Root Directory'yi düzelt → Redeploy → Test et.

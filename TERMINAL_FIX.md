# Terminal Sorun Giderme

## Terminal Boş/Siyah Görünüyor?

### Hızlı Çözüm 1: VS Code'u Yeniden Başlat
```bash
# Komut Paleti (Cmd+Shift+P)
Developer: Reload Window
```

### Hızlı Çözüm 2: Yeni Terminal Oluştur
1. Terminal menüsü → New Terminal
2. Sağ üstte profil seç → **zsh**
3. Terminalin açılıp açılmadığını kontrol et

### Hızlı Çözüm 3: Manuel Komutlar (Terminalsiz)
Eğer terminal hiç çalışmıyorsa, **iTerm2** veya **macOS Terminal.app** kullan:

```bash
# Proje dizinine git
cd /Users/bl10buer/Desktop/sp8004

# Root proje (port 8080)
npm run dev -- --port 8080

# Agent Aura Sovereign (port 8081)
cd agent-aura-sovereign
npm install  # İlk kez
npm run dev
```

### Kalıcı Çözüm: Global VS Code Ayarları

1. **Komut Paleti** → `Preferences: Open User Settings (JSON)`
2. Aşağıdaki satırları ekle:

```json
{
  "terminal.integrated.gpuAcceleration": "off",
  "terminal.integrated.rendererType": "dom",
  "terminal.integrated.defaultProfile.osx": "zsh",
  "terminal.integrated.profiles.osx": {
    "zsh": {
      "path": "/bin/zsh",
      "args": ["-l"]
    }
  }
}
```

3. VS Code'u yeniden başlat

### Gelişmiş Sorun Giderme

#### Kontrol 1: Developer Tools
```
Komut Paleti → Developer: Toggle Developer Tools
Console sekmesinde "terminal" ile ilgili hata var mı?
```

#### Kontrol 2: Shell Erişimi
Terminal.app veya iTerm2'de:
```bash
echo $SHELL
# /bin/zsh olmalı

which zsh
# /bin/zsh olmalı
```

#### Kontrol 3: VS Code İzinleri
```
Sistem Tercihleri → Güvenlik ve Gizlilik → Gizlilik
→ Tam Disk Erişimi → VS Code'u ekle/etkinleştir
```

#### Kontrol 4: Renderer Modu Değiştir
1. `Cmd+Shift+P` → `Preferences: Open User Settings`
2. Ara: `terminal renderer`
3. Değiştir: `dom` veya `canvas` dene

## Manuel Çalıştırma Komutları

### Root Proje (8080)
```bash
cd /Users/bl10buer/Desktop/sp8004
npm install  # İlk kez
npm run dev -- --port 8080
```
Tarayıcı: http://localhost:8080

### Agent Aura Sovereign (8081)
```bash
cd /Users/bl10buer/Desktop/sp8004/agent-aura-sovereign
npm install  # İlk kez
npm run dev
```
Tarayıcı: http://localhost:8081

### İki Proje Paralel
```bash
# Terminal 1
cd /Users/bl10buer/Desktop/sp8004
npm run dev -- --port 8080

# Terminal 2 (ayrı iTerm/Terminal penceresi)
cd /Users/bl10buer/Desktop/sp8004/agent-aura-sovereign
npm run dev
```

## VS Code Olmadan Çalışma

Eğer VS Code terminali tamamen çalışmıyorsa:

1. **iTerm2 indir**: https://iterm2.com/
2. veya **macOS Terminal.app** kullan (Spotlight → "Terminal")
3. Yukarıdaki manuel komutları çalıştır

### Tek komutla iki terminal sekmesi aç (macOS)

```bash
chmod +x scripts/open-terminals-mac.sh
./scripts/open-terminals-mac.sh
```

Bu script Terminal.app içinde iki sekme açar:
- Sekme 1: Root proje (8080)
- Sekme 2: Agent Aura Sovereign (8081)

## Hâlâ Çözülmezse

1. VS Code'u tamamen kapat (Cmd+Q)
2. Terminal.app aç:
```bash
cd /Users/bl10buer/Desktop/sp8004
code .
```
3. VS Code yeniden açıldıktan sonra terminal aç

veya

VS Code'u tamamen kaldırıp yeniden yükle:
```bash
# Ayarları yedekle
cp -r ~/.vscode ~/vscode-backup
cp ~/.config/Code/User/settings.json ~/settings-backup.json

# VS Code'u kaldır ve yeniden yükle (App Store veya https://code.visualstudio.com/)
```

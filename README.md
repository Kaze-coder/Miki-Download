# Discord Video Downloader Bot

Bot Discord untuk download video dari YouTube, TikTok, Instagram, Twitter, dan platform lainnya.

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Install yt-dlp
Bot ini memerlukan `yt-dlp` untuk download video. Install sesuai OS kamu:

**Windows:**
```bash
pip install yt-dlp
```
atau
```bash
choco install yt-dlp
```

**Mac/Linux:**
```bash
pip install yt-dlp
```
atau
```bash
brew install yt-dlp
```

### 3. Setup Environment Variables
1. Copy `.env.example` ke `.env`
2. Tambahkan Discord bot token ke `.env`:
```
DISCORD_TOKEN=your_token_here
```

### 4. Setup Discord Bot Token
1. Pergi ke [Discord Developer Portal](https://discord.com/developers/applications)
2. Buat aplikasi baru
3. Buat bot user
4. Copy token dan paste ke `.env`
5. Enable intents: `Guilds`, `Guild Messages`, `Direct Messages`

### 5. Invite Bot ke Server
1. Di Developer Portal, buka OAuth2 → URL Generator
2. Select scopes: `bot`
3. Select permissions: `Send Messages`, `Attach Files`, `Embed Links`
4. Copy generated URL dan invite bot ke server kamu

### 6. Jalankan Bot
```bash
npm start
```

---

## Deploy ke Railway

### 1. Push ke GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main
```

### 2. Connect ke Railway
1. Pergi ke [Railway.app](https://railway.app)
2. Login dengan GitHub
3. Klik "New Project"
4. Select "Deploy from GitHub repo"
5. Pilih repo yang udah di-push
6. Railway akan auto-detect Dockerfile

### 3. Setup Environment Variables di Railway
1. Di Railway, buka "Variables" tab
2. Tambahkan:
   - `DISCORD_TOKEN`: (paste bot token kamu)

### 4. Deploy
Railway akan auto-deploy setiap kali ada push ke GitHub

---

## Cara Pakai

Di Discord server, gunakan command:
```
/download url:<URL> format:<MP4|MP3>
```

**Contoh:**
- `/download url:https://www.youtube.com/watch?v=... format:MP4`
- `/download url:https://www.tiktok.com/... format:MP3`
- `/download url:https://www.instagram.com/... format:MP4`

## Fitur

✅ Download dari multiple platform (YouTube, TikTok, Instagram, Twitter, dll)
✅ Format pilihan (MP4 atau MP3)
✅ Auto-delete file setelah dikirim
✅ File size check (max 25MB)
✅ Nice embed messages dengan status
✅ Siap deploy ke Railway

## Catatan

- Max file size: 25MB (Discord limit untuk user biasa)
- Proses download tergantung kecepatan internet
- Beberapa video mungkin tidak bisa didownload karena copyright atau restrictions
- yt-dlp harus ter-install di environment (sudah ter-include di Dockerfile)

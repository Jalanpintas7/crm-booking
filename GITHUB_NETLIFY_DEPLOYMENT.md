# Cara Deploy dari GitHub ke Netlify

## Prerequisites
- Node.js versi 20.19+ (karena menggunakan Svelte 5 + Vite 7)
- Repository GitHub yang sudah ada
- Akun Netlify

## Langkah-langkah Deployment

### 1. Pastikan Kode Sudah di GitHub
```bash
# Push semua perubahan ke GitHub
git add .
git commit -m "Fix Node.js version compatibility for Netlify deployment"
git push origin main
```

### 2. Konfigurasi Netlify

#### A. Buka Netlify
1. Buka [netlify.com](https://netlify.com)
2. Login atau buat akun
3. Klik "New site from Git"

#### B. Pilih Repository
1. Pilih "GitHub" sebagai provider
2. Authorize Netlify untuk mengakses GitHub
3. Pilih repository `crm-booking`

#### C. Konfigurasi Build Settings
**Build command:**
```bash
npm run build
```

**Publish directory:**
```
.svelte-kit/output/client
```

**Node version:**
```
20
```

### 3. Environment Variables (Opsional)
Jika menggunakan Supabase, tambahkan:
- `VITE_SUPABASE_URL`: URL Supabase Anda
- `VITE_SUPABASE_ANON_KEY`: Anon key Supabase Anda

### 4. Deploy
1. Klik "Deploy site"
2. Tunggu proses build selesai
3. Jika berhasil, situs akan live dengan URL Netlify

## Troubleshooting

### Error "Unsupported engine" atau "Not compatible with your version of node/npm"
**Penyebab:** Netlify menggunakan Node.js v18, sedangkan Svelte 5 + Vite 7 membutuhkan Node.js v20+

**Solusi:**
1. File `netlify.toml` sudah dikonfigurasi dengan `NODE_VERSION = "20"`
2. File `.nvmrc` sudah dibuat dengan versi `20.19.0`
3. Package.json sudah memiliki `engines` field yang menentukan versi Node.js

### Error "Encountered dynamic routes"
**Penyebab:** SvelteKit menggunakan dynamic routing

**Solusi:**
- Sudah diperbaiki dengan konfigurasi `adapter-static` dan `prerender: true`
- File `netlify.toml` sudah dikonfigurasi untuk SPA routing

### Error "Not found" saat refresh halaman
**Penyebab:** Client-side routing tidak dikenali server

**Solusi:**
- File `netlify.toml` sudah dikonfigurasi dengan redirects untuk SPA

## File Konfigurasi Penting

### netlify.toml
```toml
[build]
  command = "npm run build"
  publish = ".svelte-kit/output/client"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "20"
```

### .nvmrc
```
20.19.0
```

### package.json (engines field)
```json
"engines": {
  "node": ">=20.19.0",
  "npm": ">=10.0.0"
}
```

## Verifikasi Deployment

### 1. Build Lokal
```bash
npm run build
```

### 2. Test Preview
```bash
npm run preview
```

### 3. Check Netlify Logs
- Buka dashboard Netlify
- Pilih site Anda
- Klik tab "Deploys"
- Lihat log build untuk troubleshooting

## Auto-deploy
Setelah konfigurasi awal:
- Setiap push ke branch `main` akan otomatis trigger deploy
- Netlify akan build ulang dan deploy versi terbaru
- Deploy preview tersedia untuk setiap pull request

## Catatan Penting
- **Node.js Version**: Harus 20.19+ (tidak bisa menggunakan v18)
- **Build Time**: Build pertama mungkin lebih lama karena tidak ada cache
- **Cache**: Netlify akan cache dependencies untuk build selanjutnya
- **Monitoring**: Gunakan Netlify Analytics untuk monitor performa

## Support
Jika masih ada masalah:
1. Check Netlify build logs
2. Pastikan semua file konfigurasi sudah benar
3. Verifikasi versi Node.js di Netlify
4. Test build lokal terlebih dahulu

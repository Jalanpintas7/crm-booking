# Cara Deploy ke Netlify

## Langkah-langkah Deployment

### 1. Build Aplikasi
```bash
npm run build
```

### 2. Upload ke Netlify

#### Opsi A: Drag & Drop
1. Buka [netlify.com](https://netlify.com)
2. Login atau buat akun
3. Drag folder `build` ke area "Deploy manually"
4. Tunggu proses upload dan deploy selesai

#### Opsi B: Git Integration (Recommended)
1. Push kode ke repository GitHub/GitLab
2. Di Netlify, pilih "New site from Git"
3. Pilih repository
4. Set build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.svelte-kit/output/client`
5. Klik "Deploy site"

### 3. Konfigurasi Environment Variables
Jika menggunakan Supabase, tambahkan environment variables di Netlify:
- `VITE_SUPABASE_URL`: URL Supabase Anda
- `VITE_SUPABASE_ANON_KEY`: Anon key Supabase Anda

### 4. Konfigurasi Redirects
File `netlify.toml` sudah dikonfigurasi untuk SPA routing.

## Struktur Build
- Output build ada di folder `build/`
- File utama: `build/index.html`
- Assets ada di folder `build/_app/immutable/`

## Troubleshooting

### Error "Encountered dynamic routes"
- Sudah diperbaiki dengan konfigurasi `adapter-static` dan `prerender: true`

### Error "Not found" saat refresh halaman
- Sudah diperbaiki dengan `fallback: 'index.html'` di `netlify.toml`

### Warning aksesibilitas
- Warning ini tidak menghentikan build, hanya peringatan untuk UX yang lebih baik
- Aplikasi tetap berfungsi normal

## Catatan Penting
- Aplikasi ini menggunakan SPA (Single Page Application) routing
- Semua route akan di-redirect ke `index.html`
- Pastikan Supabase project sudah dikonfigurasi dengan benar
- Test aplikasi setelah deploy untuk memastikan semua fitur berfungsi

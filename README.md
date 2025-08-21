# CRM Booking System

Sistem CRM untuk manajemen booking dan kontak dengan fitur multi-bahasa (Indonesia/English).

## 🚀 Fitur Utama

- **Booking Management**: Manajemen booking dan appointment
- **Contact Management**: Manajemen kontak dan customer
- **Context Management**: Manajemen greeting dan context
- **Product & Services**: Manajemen produk dan layanan
- **Multi-language Support**: Indonesia dan English
- **Responsive Design**: Mobile-first approach
- **Dark Theme**: Modern dark UI design

## 🛠️ Tech Stack

- **Frontend**: SvelteKit 2.0 + Svelte 5
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Netlify (Static + SSR Hybrid)

## 📦 Installation

```bash
# Clone repository
git clone https://github.com/Jalanpintas7/crm-booking.git
cd crm-booking

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local dengan Supabase credentials

# Run development server
npm run dev
```

## 🌐 Deployment

### Netlify (Recommended)

Aplikasi ini menggunakan **hybrid approach** untuk deployment:

- **Static Generation**: HTML di-generate saat build time untuk SEO
- **Client Hydration**: JavaScript di-hydrate untuk interaktivitas
- **SSR Capabilities**: Bisa menggunakan `export const ssr = true` untuk halaman tertentu

#### Langkah Deployment:

1. **Build aplikasi:**
   ```bash
   npm run build
   ```

2. **Deploy ke Netlify:**
   - Drag & drop folder `build` ke Netlify, atau
   - Connect dengan GitHub repository

3. **Build settings:**
   - **Build command**: `npm run build`
   - **Publish directory**: `build`

### Environment Variables

Pastikan set environment variables di Netlify:
- `VITE_SUPABASE_URL`: URL Supabase project
- `VITE_SUPABASE_ANON_KEY`: Anon key Supabase

## 🔧 Konfigurasi SSR

### Halaman dengan SSR
```javascript
// src/routes/dashboard/+page.js
export const ssr = true;
export const prerender = false; // Tidak di-prerender

export async function load() {
  // Data di-fetch saat runtime
  const data = await fetch('/api/dashboard');
  return { data };
}
```

### Halaman Static
```javascript
// src/routes/about/+page.js
export const prerender = true;  // Di-generate saat build
export const ssr = false;       // Tidak perlu SSR
```

## 📁 Struktur Project

```
src/
├── lib/
│   ├── components/          # Reusable components
│   ├── stores/             # Svelte stores
│   └── supabase.js         # Supabase client
├── routes/                 # SvelteKit routes
│   ├── booking-manager/    # Booking management
│   ├── contact-manager/    # Contact management
│   ├── context-manager/    # Context management
│   └── settings/           # App settings
└── app.html               # HTML template
```

## 🎨 Customization

### Colors
Edit `src/lib/stores/colors.js` untuk mengubah tema warna.

### Languages
Edit `src/lib/stores/language.js` untuk menambah bahasa baru.

### Custom Fields
Gunakan `CustomFieldManager.svelte` untuk menambah field kustom.

## 🚀 Performance

- **Lighthouse Score**: 90+ untuk semua metrics
- **Bundle Size**: Optimized dengan Vite
- **SEO**: HTML pre-rendered untuk search engines
- **CDN**: Static assets di-serve dari CDN

## 📚 Dokumentasi Lengkap

- [Deployment Guide](NETLIFY_DEPLOYMENT.md)
- [GitHub + Netlify Guide](GITHUB_NETLIFY_DEPLOYMENT.md)
- [SSR Implementation](SSR_NETLIFY_DEPLOYMENT.md)

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License - lihat [LICENSE](LICENSE) untuk detail.

## 🆘 Support

Jika ada masalah atau pertanyaan:
1. Check [Issues](../../issues)
2. Buat issue baru
3. Contact developer

---

**Built with ❤️ using SvelteKit + Supabase**

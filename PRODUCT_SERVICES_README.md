# Product & Services Management System

Sistem manajemen produk dan layanan yang lengkap dengan fitur CRUD, custom fields, dan upload gambar.

## Fitur Utama

### 1. CRUD Produk & Layanan
- **Create**: Tambah produk/layanan baru dengan form yang lengkap
- **Read**: Tampilkan daftar produk/layanan dengan berbagai view mode
- **Update**: Edit informasi produk/layanan yang sudah ada
- **Delete**: Hapus produk/layanan dengan konfirmasi

### 2. Custom Fields System
- **Dynamic Fields**: Tambah field kustom dengan tipe data yang fleksibel
- **Field Types**: Support untuk text, number, boolean, email, phone, date, URL, select, textarea, dan file
- **Validation**: Aturan validasi yang dapat dikustomisasi
- **Required Fields**: Field yang wajib diisi dapat ditandai

### 3. Image Management
- **Upload Images**: Upload gambar untuk produk/layanan
- **Supabase Storage**: Integrasi dengan Supabase Storage bucket
- **Image Preview**: Preview gambar sebelum dan sesudah upload
- **Automatic Cleanup**: Hapus gambar lama saat update atau delete

### 4. Advanced UI Features
- **Grid & List View**: Toggle antara tampilan grid dan list
- **Search & Filter**: Pencarian berdasarkan nama, deskripsi, kategori
- **Category Filter**: Filter berdasarkan kategori produk
- **Status Filter**: Filter berdasarkan status aktif/nonaktif
- **Sorting**: Urutkan berdasarkan nama, harga, kategori, atau tanggal
- **Responsive Design**: Tampilan yang responsif untuk berbagai ukuran layar

## Struktur Database

### Tabel `price_package`
```sql
CREATE TABLE price_package (
  id SERIAL PRIMARY KEY,
  pakej VARCHAR(255) NOT NULL,
  harga DECIMAL(10,2) NOT NULL DEFAULT 0,
  description TEXT,
  category VARCHAR(100),
  duration VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  custom_fields JSONB,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabel `custom_field_definitions`
```sql
CREATE TABLE custom_field_definitions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  field_type VARCHAR(50) NOT NULL,
  is_required BOOLEAN DEFAULT false,
  placeholder VARCHAR(255),
  description TEXT,
  validation_rules TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Komponen yang Dibuat

### 1. `ProductAndServices.svelte`
Komponen utama untuk mengelola produk dan layanan dengan fitur:
- Form tambah/edit produk
- Tampilan grid dan list
- Search dan filter
- Upload gambar
- Custom fields management

### 2. `CustomFieldManager.svelte`
Komponen untuk mengelola definisi custom fields:
- Tambah/edit custom field definitions
- Konfigurasi tipe data dan validasi
- Manajemen field yang aktif/nonaktif

### 3. `product-services/+page.svelte`
Halaman utama yang menggabungkan kedua komponen dengan:
- Navigation
- Notification system
- Layout yang konsisten

## Fitur Upload Gambar

### Supabase Storage Integration
- **Bucket**: `images`
- **Naming Convention**: `product_{id}_{timestamp}_{filename}`
- **Public URLs**: Otomatis generate public URL untuk gambar
- **Cleanup**: Hapus gambar lama saat update/delete

### Image Processing
- **File Types**: Support untuk semua format gambar
- **Preview**: Real-time preview sebelum upload
- **Validation**: Validasi file type dan size
- **Error Handling**: Handling error upload dengan user feedback

## Custom Fields System

### Field Types Supported
1. **Text**: Input teks biasa
2. **Number**: Input numerik dengan validasi
3. **Boolean**: Checkbox Ya/Tidak
4. **Email**: Input email dengan validasi format
5. **Phone**: Input nomor telepon
6. **Date**: Input tanggal
7. **URL**: Input URL dengan validasi
8. **Select**: Dropdown dengan opsi kustom
9. **Textarea**: Input teks multi-line
10. **File**: Upload file

### Validation Rules
- **Min/Max**: Untuk field number
- **Pattern**: Regex pattern untuk validasi format
- **Required**: Field wajib diisi
- **Custom**: Aturan validasi kustom

## Cara Penggunaan

### 1. Menambah Produk/Layanan Baru
1. Klik tombol "Tambah Produk/Layanan"
2. Isi form dengan informasi lengkap
3. Upload gambar (opsional)
4. Tambah custom fields jika diperlukan
5. Klik "Simpan"

### 2. Mengelola Custom Fields
1. Buka tab "Custom Field Definitions"
2. Klik "Tambah Custom Field"
3. Pilih tipe data dan konfigurasi
4. Simpan definisi field

### 3. Upload Gambar
1. Klik tombol "Upload Image" pada produk
2. Pilih file gambar
3. Preview gambar
4. Klik "Upload Gambar"

### 4. Search dan Filter
1. Gunakan search bar untuk mencari berdasarkan nama/deskripsi
2. Filter berdasarkan kategori
3. Filter berdasarkan status aktif/nonaktif
4. Urutkan berdasarkan kriteria yang diinginkan

## Konfigurasi

### Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Supabase Setup
1. Buat bucket `images` di Supabase Storage
2. Set bucket policy untuk public access
3. Pastikan tabel `price_package` dan `custom_field_definitions` sudah dibuat
4. Set RLS policies sesuai kebutuhan

## Dependencies

### Frontend
- **Svelte**: Framework utama
- **Lucide Svelte**: Icon library
- **Tailwind CSS**: Styling

### Backend
- **Supabase**: Database dan storage
- **PostgreSQL**: Database engine
- **Storage API**: File management

## Keamanan

### RLS Policies
- **Row Level Security**: Implementasi RLS untuk data isolation
- **User Authentication**: Validasi user sebelum akses data
- **File Access Control**: Kontrol akses file berdasarkan user

### Data Validation
- **Input Sanitization**: Sanitasi input user
- **Type Validation**: Validasi tipe data
- **File Type Validation**: Validasi tipe file upload

## Performance

### Optimization
- **Lazy Loading**: Load data sesuai kebutuhan
- **Image Optimization**: Compress dan optimize gambar
- **Caching**: Implementasi caching untuk data yang sering diakses
- **Pagination**: Support pagination untuk data besar

### Monitoring
- **Error Logging**: Log error untuk debugging
- **Performance Metrics**: Monitor response time
- **User Analytics**: Track user behavior

## Troubleshooting

### Common Issues
1. **Image Upload Failed**: Cek bucket permissions dan file size
2. **Custom Fields Not Saving**: Validasi format JSON dan field types
3. **Search Not Working**: Pastikan index database sudah dibuat
4. **Performance Issues**: Cek query optimization dan caching

### Debug Mode
- Enable console logging untuk debugging
- Check network requests di browser dev tools
- Monitor Supabase logs untuk error

## Roadmap

### Future Features
- **Bulk Operations**: Import/export data dalam batch
- **Advanced Analytics**: Dashboard analytics untuk produk
- **API Integration**: REST API untuk external access
- **Multi-language**: Support multiple languages
- **Advanced Search**: Full-text search dengan Elasticsearch
- **Image Processing**: Auto-resize dan optimization
- **Backup System**: Automated backup dan restore

## Support

Untuk pertanyaan atau masalah teknis, silakan buat issue di repository atau hubungi tim development.

---

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Author**: CRM Booking Development Team

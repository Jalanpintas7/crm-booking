# Panduan Integrasi Custom Fields di Booking System

## Overview
Sistem booking sekarang sudah terintegrasi dengan custom fields dari paket layanan. Ketika Anda mengklik edit pada booking, custom fields akan otomatis ter-load dari paket yang terkait.

## Cara Kerja Custom Fields

### 1. Struktur Data di Database
- **Tabel `price_package`**: Memiliki kolom `services` (JSONB) yang berisi custom fields
- **Tabel `bookings`**: Memiliki kolom `services` (JSONB) yang menyimpan nilai custom fields

### 2. Flow Data
```
Paket Layanan → Custom Fields Definition → Booking Form → Database
     ↓                    ↓                    ↓           ↓
price_package.services → formData.custom_fields → booking.services → Supabase
```

### 3. Ketika Edit Booking
1. **Klik Edit** → `openEditModal()` dipanggil
2. **Load Custom Fields** → Dari paket yang terkait (`relatedPackage.services`)
3. **Display Fields** → Custom fields ditampilkan sebagai input form
4. **Save Changes** → Custom fields tersimpan ke database

## Testing Custom Fields

### Test 1: Verifikasi Data Loading
```javascript
// Jalankan di browser console
async function testDataLoading() {
  const [bookingsData, packagesData] = await Promise.all([
    getBookings(),
    getPricePackages()
  ]);
  
  console.log('Bookings:', bookingsData);
  console.log('Packages:', packagesData);
}
```

### Test 2: Test Edit Modal
```javascript
// Simulasi edit modal
function testEditModal() {
  const mockBooking = {
    package_name: 'Paket Basic',
    services: { durasi: '1 jam', kategori: 'Fotografi' }
  };
  
  const mockPackages = [
    {
      pakej: 'Paket Basic',
      services: { durasi: '1 jam', kategori: 'Fotografi' }
    }
  ];
  
  const relatedPackage = mockPackages.find(p => p.pakej === mockBooking.package_name);
  const customFields = relatedPackage?.services || {};
  
  console.log('Custom fields loaded:', customFields);
}
```

## Troubleshooting

### Masalah 1: Custom Fields Tidak Muncul
**Gejala**: Edit modal tidak menampilkan custom fields
**Solusi**: 
1. Pastikan paket memiliki `services` data
2. Periksa console untuk error
3. Jalankan test script

### Masalah 2: Custom Fields Tidak Tersimpan
**Gejala**: Custom fields hilang setelah save
**Solusi**:
1. Periksa mapping `custom_fields` → `services` di database
2. Pastikan `updateBooking()` menggunakan kolom yang benar

### Masalah 3: Data Tidak Sinkron
**Gejala**: Custom fields berbeda antara paket dan booking
**Solusi**:
1. Refresh data dengan `loadData()`
2. Periksa real-time subscription
3. Clear browser cache

## Best Practices

### 1. Struktur Custom Fields
```json
{
  "durasi": "1 jam",
  "kategori": "Fotografi",
  "include_editing": true,
  "max_photos": 50
}
```

### 2. Naming Convention
- Gunakan nama field yang deskriptif
- Hindari spasi dan karakter khusus
- Gunakan lowercase dengan underscore jika perlu

### 3. Validation
- Selalu validasi data sebelum save
- Gunakan default values untuk field yang kosong
- Handle error gracefully

## Monitoring dan Debug

### Console Logs
```javascript
// Tambahkan logging untuk debug
console.log('Package selected:', selectedPackage);
console.log('Custom fields:', selectedPackage.services);
console.log('Booking data:', bookingData);
```

### Database Queries
```sql
-- Periksa custom fields di paket
SELECT pakej, services FROM price_package WHERE services IS NOT NULL;

-- Periksa custom fields di booking
SELECT package_name, services FROM bookings WHERE services IS NOT NULL;
```

## Contoh Implementasi Lengkap

### 1. Paket dengan Custom Fields
```json
{
  "id": 1,
  "pakej": "Paket Wedding Premium",
  "harga": 1500.00,
  "services": {
    "durasi": "8 jam",
    "fotografer": "2 orang",
    "album": "Hardcover 20 halaman",
    "editing": "Full editing",
    "delivery": "2 minggu"
  }
}
```

### 2. Booking dengan Custom Fields
```json
{
  "id": 1,
  "package_name": "Paket Wedding Premium",
  "services": {
    "durasi": "8 jam",
    "fotografer": "2 orang",
    "album": "Hardcover 20 halaman",
    "editing": "Full editing",
    "delivery": "2 minggu",
    "tanggal_acara": "2024-06-15",
    "lokasi": "Hotel Grand Ballroom"
  }
}
```

## Kesimpulan

Sistem custom fields sekarang sudah terintegrasi dengan baik:
✅ **Edit Modal** - Custom fields otomatis ter-load
✅ **Package Selection** - Custom fields ter-update saat paket berubah
✅ **Data Persistence** - Custom fields tersimpan ke database
✅ **Real-time Sync** - Data ter-update secara real-time

Jika ada masalah, gunakan test script dan troubleshooting guide di atas untuk debug.

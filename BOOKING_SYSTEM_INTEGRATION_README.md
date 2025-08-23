# Integrasi Product & Services dengan Booking System

## Overview
Sistem ini telah diperbaiki untuk mengintegrasikan data Product & Services dengan Booking System. Sekarang ketika Anda membuat booking baru, sistem akan otomatis:

1. **Mengisi harga** dari product yang dipilih
2. **Mengisi custom fields** dari services yang telah didefinisikan
3. **Menyimpan package_id** untuk referensi ke product
4. **Menyimpan custom_fields** sebagai JSONB untuk data dinamis

## Fitur yang Ditambahkan

### 1. Auto-fill Custom Fields
- Saat memilih package di form booking, custom fields akan otomatis terisi
- Data diambil dari field `services` di tabel `price_package`
- User bisa mengedit nilai custom fields sebelum menyimpan

### 2. Package ID Reference
- Setiap booking sekarang menyimpan `package_id` yang merujuk ke product
- Memungkinkan tracking dan reporting yang lebih baik
- Foreign key constraint untuk data integrity

### 3. Custom Fields Storage
- Custom fields disimpan sebagai JSONB di database
- Mendukung berbagai tipe data (text, number, boolean, date, dll)
- Index GIN untuk query yang efisien

## Cara Menggunakan

### Langkah 1: Jalankan Migration Database
1. Buka Supabase Dashboard
2. Buka SQL Editor
3. Copy dan paste isi file `database_migration.sql`
4. Jalankan script

### Langkah 2: Buat Product & Services
1. Buka menu "Product & Services"
2. Klik "Tambah Produk/Layanan"
3. Isi nama, harga, dan tambahkan custom fields
4. Simpan product

### Langkah 3: Buat Booking
1. Buka menu "Booking Manager"
2. Klik "Tambah Booking Baru"
3. Pilih contact dan employee
4. Pilih package - harga dan custom fields akan otomatis terisi
5. Edit custom fields jika diperlukan
6. Simpan booking

## Struktur Database

### Tabel `price_package`
```sql
- id (PRIMARY KEY)
- pakej (nama package)
- harga (harga)
- url (opsional)
- services (JSONB - custom fields)
- created_at
```

### Tabel `bookings` (setelah migration)
```sql
- id (PRIMARY KEY)
- contact_id (FOREIGN KEY ke contact)
- employee_id (FOREIGN KEY ke employee)
- date (tanggal booking)
- package_name (nama package)
- total_price (harga total)
- status (status booking)
- package_id (FOREIGN KEY ke price_package)
- custom_fields (JSONB - nilai custom fields)
- created_at
```

## Contoh Custom Fields

### Product: "Paket Wedding Photography"
```json
{
  "durasi": "8 jam",
  "lokasi": "Jakarta",
  "jumlah_foto": "500+",
  "album": "Hard cover",
  "videografi": true
}
```

### Booking akan otomatis terisi:
- **Package Name**: Paket Wedding Photography
- **Harga**: RM 2500
- **Custom Fields**:
  - durasi: 8 jam
  - lokasi: Jakarta
  - jumlah_foto: 500+
  - album: Hard cover
  - videografi: true

## Troubleshooting

### 1. Custom Fields Tidak Muncul
- Pastikan product sudah dibuat dengan custom fields
- Check console browser untuk error
- Pastikan migration database sudah dijalankan

### 2. Harga Tidak Auto-fill
- Pastikan field `harga` di tabel `price_package` terisi
- Check apakah data product sudah dimuat dengan benar

### 3. Error Database
- Jalankan migration database terlebih dahulu
- Pastikan tabel `price_package` dan `bookings` ada
- Check foreign key constraints

## API Functions

### createBooking(bookingData)
```javascript
const bookingData = {
  contact_id: 1,
  employee_id: 2,
  date: '2024-01-15',
  package_name: 'Paket Wedding Photography',
  total_price: 2500,
  status: 'Baru',
  custom_fields: { durasi: '8 jam', lokasi: 'Jakarta' },
  package_id: 1
};
```

### updateBooking(id, bookingData)
- Fungsi yang sama dengan createBooking
- Update booking yang sudah ada

## Keuntungan Integrasi

1. **Data Consistency**: Harga dan custom fields selalu sinkron dengan product
2. **User Experience**: Form booking lebih mudah dan cepat
3. **Data Integrity**: Foreign key constraints mencegah data orphan
4. **Flexibility**: Custom fields mendukung berbagai jenis product
5. **Reporting**: Bisa track booking berdasarkan product dan custom fields

## Next Steps

1. **Analytics Dashboard**: Tambahkan reporting berdasarkan product
2. **Product Performance**: Track product mana yang paling sering dibooking
3. **Custom Field Validation**: Tambahkan validasi untuk custom fields
4. **Bulk Operations**: Import/export product dan booking data
5. **API Integration**: Integrasi dengan sistem eksternal

## Support

Jika ada masalah atau pertanyaan:
1. Check console browser untuk error
2. Pastikan migration database sudah dijalankan
3. Verify struktur tabel sesuai dokumentasi
4. Check network tab untuk API calls

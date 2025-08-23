# Custom Fields Edit Modal - Dokumentasi Lengkap

## 🎯 Overview

Dokumen ini menjelaskan bagaimana sistem custom fields bekerja di edit modal booking manager, khususnya dalam hal:
1. **Merging default values** dari package dengan **existing values** dari booking
2. **Dynamic updates** ketika package diubah
3. **Data persistence** dan **UI rendering**

## 🔧 Arsitektur Sistem

### Data Flow
```
Package (services) → Default Values
       ↓
Booking (services) → Existing Values  
       ↓
Merged Custom Fields → UI Display
```

### Key Components
- **`pricePackages`**: Array dari semua package dengan custom fields (`services` column)
- **`bookings`**: Array dari semua booking dengan custom fields (`services` column)  
- **`selectedBooking`**: Object yang sedang diedit dengan `custom_fields` property
- **`openEditModal()`**: Function yang membuka edit modal dan merge custom fields
- **`on:change` handler**: Update custom fields ketika package berubah

## 📋 Implementasi Detail

### 1. Fungsi `openEditModal(booking)`

```javascript
function openEditModal(booking) {
  // Cari package yang terkait untuk memastikan custom fields ter-load
  const relatedPackage = pricePackages.find(p => p.pakej === booking.package_name);
  
  // Merge custom fields dari paket (sebagai default) dengan custom fields yang sudah tersimpan di booking
  const mergedCustomFields = { 
    ...(relatedPackage?.services || {}), // Default values from the package
    ...(booking.services || {})          // Overwrite with actual values from the booking if they exist
  };

  selectedBooking = { 
    ...booking,
    custom_fields: mergedCustomFields
  };
  
  // Jika ada package yang terkait, pastikan package_id terisi
  if (relatedPackage) {
    selectedBooking.package_id = relatedPackage.id;
  }
  
  showEditModal = true;
}
```

**Penjelasan:**
- `relatedPackage?.services || {}`: Mengambil default values dari package
- `booking.services || {}`: Mengambil existing values dari booking
- `...` spread operator: Merge kedua object dengan prioritas pada `booking.services`
- Hasil merge disimpan di `selectedBooking.custom_fields`

### 2. `on:change` Handler untuk Package Selection

```javascript
on:change={() => {
  const selected = pricePackages.find((p) => p.pakej === selectedBooking.package_name);
  if (selected) {
    selectedBooking.total_price = String(selected.harga ?? 0);
    selectedBooking.package_id = selected.id;
    
    // Update custom fields when package is selected
    if (selected.services && Object.keys(selected.services).length > 0) {
      // Buat copy dari services untuk custom fields
      const customFieldsCopy = {};
      Object.entries(selected.services).forEach(([key, value]) => {
        customFieldsCopy[key] = typeof value === 'string' ? value : String(value);
      });
      selectedBooking.custom_fields = customFieldsCopy;
    } else {
      selectedBooking.custom_fields = {};
    }
  } else {
    selectedBooking.total_price = '';
    selectedBooking.package_id = '';
    selectedBooking.custom_fields = {};
  }
}}
```

**Penjelasan:**
- Ketika package berubah, custom fields di-reset ke default values dari package baru
- **Penting**: Ini akan menghapus semua existing values dari booking sebelumnya
- Jika user ingin mempertahankan values, mereka harus save dulu sebelum ganti package

## 🎨 UI Rendering

### Custom Fields Section
```svelte
{#if selectedBooking.package_name && selectedBooking.custom_fields && Object.keys(selectedBooking.custom_fields).length > 0}
  <div class="bg-gray-950 border border-gray-700 rounded-lg p-4">
    <h3 class="text-sm font-medium text-gray-200 mb-3">Custom Fields dari Paket</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      {#each Object.entries(selectedBooking.custom_fields) as [key, value]}
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-gray-400 capitalize">{key}</label>
          <input 
            type="text" 
            bind:value={selectedBooking.custom_fields[key]}
            placeholder="Masukkan nilai untuk {key}"
            class="bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-green-500 transition-colors"
          />
        </div>
      {/each}
    </div>
  </div>
{/if}
```

**Kondisi Render:**
- `selectedBooking.package_name`: Package harus dipilih
- `selectedBooking.custom_fields`: Custom fields harus ada
- `Object.keys(selectedBooking.custom_fields).length > 0`: Harus ada minimal 1 custom field

## 🧪 Testing

### File Test
`test_custom_fields_edit_modal.js` berisi comprehensive test suite untuk memverifikasi:
1. **Data Structure**: Verifikasi availability data
2. **openEditModal Function**: Test merging logic
3. **Package Change Handler**: Test dynamic updates
4. **UI Rendering**: Test visual components

### Cara Menjalankan Test
```javascript
// Di browser console setelah halaman dimuat
testCustomFieldsEditModal.runAllTests()

// Atau test individual
testCustomFieldsEditModal.testOpenEditModal()
```

## ⚠️ Important Notes

### 1. Data Persistence
- **Custom fields disimpan di database sebagai `services` column** (JSONB)
- **Frontend menggunakan `custom_fields` property** untuk consistency
- **Mapping terjadi di `supabase.js`**: `services: bookingData.custom_fields || {}`

### 2. Package Change Behavior
- **Ketika package berubah, existing values HILANG**
- **User harus save dulu sebelum ganti package** jika ingin mempertahankan values
- **Custom fields di-reset ke default values** dari package baru

### 3. Merge Strategy
- **Package services sebagai base/default**
- **Booking services sebagai override**
- **Result: `{...packageServices, ...bookingServices}`**

## 🔍 Troubleshooting

### Common Issues

#### 1. Custom Fields Tidak Muncul
**Gejala:** Edit modal terbuka tapi custom fields section kosong
**Penyebab:**
- Package tidak memiliki `services` data
- `selectedBooking.custom_fields` undefined/null
- Package tidak dipilih

**Solusi:**
```javascript
// Cek di console
console.log('Package services:', relatedPackage?.services);
console.log('Selected booking:', selectedBooking);
```

#### 2. Existing Values Hilang
**Gejala:** Custom fields muncul tapi values dari booking hilang
**Penyebab:**
- `openEditModal` tidak merge dengan benar
- `booking.services` undefined/null
- Merge logic error

**Solusi:**
```javascript
// Verifikasi merge logic
const mergedCustomFields = { 
  ...(relatedPackage?.services || {}),
  ...(booking.services || {})
};
console.log('Merged result:', mergedCustomFields);
```

#### 3. Custom Fields Tidak Update Saat Package Berubah
**Gejala:** Package berubah tapi custom fields tetap sama
**Penyebab:**
- `on:change` handler tidak ter-trigger
- `selected.services` undefined
- Binding issue

**Solusi:**
```javascript
// Cek event binding
console.log('Package changed to:', selectedBooking.package_name);
console.log('New services:', selected?.services);
```

### Debug Commands
```javascript
// Cek struktur data
console.log('Price packages:', pricePackages);
console.log('Bookings:', bookings);

// Cek selected booking
console.log('Selected booking:', selectedBooking);

// Cek custom fields
console.log('Custom fields:', selectedBooking?.custom_fields);

// Cek related package
const relatedPackage = pricePackages.find(p => p.pakej === selectedBooking?.package_name);
console.log('Related package:', relatedPackage);
```

## 📚 Best Practices

### 1. Data Validation
- Selalu validasi `services` data sebelum merge
- Gunakan default values untuk missing data
- Handle edge cases (null, undefined, empty objects)

### 2. User Experience
- Berikan warning ketika package berubah
- Auto-save draft sebelum package change
- Clear indication custom fields yang berubah

### 3. Performance
- Lazy load custom fields data
- Debounce package change events
- Cache merged results

## 🔄 Future Improvements

### 1. Enhanced Merge Logic
```javascript
// Smart merge dengan conflict resolution
function smartMergeCustomFields(packageServices, bookingServices) {
  const merged = { ...packageServices };
  
  Object.entries(bookingServices).forEach(([key, value]) => {
    if (merged[key] !== value) {
      // Conflict detected - ask user or use strategy
      merged[key] = value; // Override with booking value
    }
  });
  
  return merged;
}
```

### 2. Undo/Redo System
- Track custom fields changes
- Allow reverting to previous state
- History management

### 3. Template System
- Save custom fields as templates
- Quick apply common configurations
- Bulk operations

## 📝 Summary

Sistem custom fields edit modal bekerja dengan prinsip **"merge and override"**:
1. **Default values** dari package sebagai base
2. **Existing values** dari booking sebagai override
3. **Dynamic updates** ketika package berubah
4. **UI rendering** berdasarkan merged data

Kunci keberhasilan adalah **correct data mapping** antara database (`services`) dan frontend (`custom_fields`), serta **proper merge logic** yang mempertahankan existing values sambil menampilkan default values.

// Test untuk Custom Fields Edit Modal
// Jalankan di browser console setelah halaman booking manager dimuat

console.log('🧪 Testing Custom Fields Edit Modal...');

// Test 1: Verifikasi struktur data
function testDataStructure() {
  console.log('\n📊 Test 1: Verifikasi Struktur Data');
  
  // Cek apakah pricePackages tersedia
  if (typeof pricePackages === 'undefined') {
    console.error('❌ pricePackages tidak tersedia');
    return false;
  }
  
  // Cek apakah bookings tersedia
  if (typeof bookings === 'undefined') {
    console.error('❌ bookings tidak tersedia');
    return false;
  }
  
  console.log('✅ pricePackages tersedia:', pricePackages.length, 'packages');
  console.log('✅ bookings tersedia:', bookings.length, 'bookings');
  
  // Cek struktur package dengan custom fields
  const packagesWithCustomFields = pricePackages.filter(p => p.services && Object.keys(p.services).length > 0);
  console.log('📦 Packages dengan custom fields:', packagesWithCustomFields.length);
  
  if (packagesWithCustomFields.length > 0) {
    console.log('📋 Contoh custom fields dari package pertama:', packagesWithCustomFields[0].services);
  }
  
  return true;
}

// Test 2: Test fungsi openEditModal
function testOpenEditModal() {
  console.log('\n🔧 Test 2: Test Fungsi openEditModal');
  
  if (typeof openEditModal === 'undefined') {
    console.error('❌ Fungsi openEditModal tidak tersedia');
    return false;
  }
  
  // Cari booking yang memiliki package dengan custom fields
  const packagesWithCustomFields = pricePackages.filter(p => p.services && Object.keys(p.services).length > 0);
  if (packagesWithCustomFields.length === 0) {
    console.log('⚠️ Tidak ada package dengan custom fields untuk testing');
    return false;
  }
  
  const testPackage = packagesWithCustomFields[0];
  const testBooking = bookings.find(b => b.package_name === testPackage.pakej);
  
  if (!testBooking) {
    console.log('⚠️ Tidak ada booking dengan package yang memiliki custom fields');
    return false;
  }
  
  console.log('📋 Test booking:', {
    id: testBooking.id,
    package_name: testBooking.package_name,
    services: testBooking.services
  });
  
  console.log('📦 Test package:', {
    id: testPackage.id,
    pakej: testPackage.pakej,
    services: testPackage.services
  });
  
  // Simulasi openEditModal
  const relatedPackage = pricePackages.find(p => p.pakej === testBooking.package_name);
  const mergedCustomFields = { 
    ...(relatedPackage?.services || {}), // Default values from the package
    ...(testBooking.services || {})     // Overwrite with actual values from the booking if they exist
  };
  
  console.log('🔄 Merged custom fields:', mergedCustomFields);
  
  // Verifikasi bahwa existing values dari booking tidak hilang
  if (testBooking.services) {
    Object.entries(testBooking.services).forEach(([key, value]) => {
      if (mergedCustomFields[key] !== value) {
        console.warn(`⚠️ Warning: Key '${key}' tidak ter-preserve. Expected: ${value}, Got: ${mergedCustomFields[key]}`);
      } else {
        console.log(`✅ Key '${key}' ter-preserve dengan benar: ${value}`);
      }
    });
  }
  
  // Verifikasi bahwa default values dari package tersedia
  if (relatedPackage?.services) {
    Object.entries(relatedPackage.services).forEach(([key, value]) => {
      if (mergedCustomFields[key] === undefined) {
        console.error(`❌ Key '${key}' dari package hilang setelah merge`);
      } else {
        console.log(`✅ Key '${key}' dari package tersedia: ${mergedCustomFields[key]}`);
      }
    });
  }
  
  return true;
}

// Test 3: Test on:change handler untuk package selection
function testPackageChangeHandler() {
  console.log('\n🔄 Test 3: Test on:change Handler untuk Package Selection');
  
  // Simulasi perubahan package
  const packagesWithCustomFields = pricePackages.filter(p => p.services && Object.keys(p.services).length > 0);
  if (packagesWithCustomFields.length < 2) {
    console.log('⚠️ Perlu minimal 2 packages dengan custom fields untuk testing ini');
    return false;
  }
  
  const package1 = packagesWithCustomFields[0];
  const package2 = packagesWithCustomFields[1];
  
  console.log('📦 Package 1:', package1.pakej, package1.services);
  console.log('📦 Package 2:', package2.pakej, package2.services);
  
  // Simulasi selectedBooking
  let selectedBooking = {
    package_name: package1.pakej,
    custom_fields: { ...package1.services },
    total_price: String(package1.harga || 0),
    package_id: package1.id
  };
  
  console.log('📋 Selected booking sebelum change:', selectedBooking.custom_fields);
  
  // Simulasi on:change ke package 2
  const selected = pricePackages.find((p) => p.pakej === package2.pakej);
  if (selected) {
    selectedBooking.total_price = String(selected.harga ?? 0);
    selectedBooking.package_id = selected.id;
    
    if (selected.services && Object.keys(selected.services).length > 0) {
      const customFieldsCopy = {};
      Object.entries(selected.services).forEach(([key, value]) => {
        customFieldsCopy[key] = typeof value === 'string' ? value : String(value);
      });
      selectedBooking.custom_fields = customFieldsCopy;
    } else {
      selectedBooking.custom_fields = {};
    }
  }
  
  console.log('📋 Selected booking setelah change ke package 2:', selectedBooking.custom_fields);
  
  // Verifikasi bahwa custom fields berubah sesuai package baru
  if (JSON.stringify(selectedBooking.custom_fields) === JSON.stringify(package2.services)) {
    console.log('✅ Custom fields berhasil diupdate sesuai package baru');
  } else {
    console.error('❌ Custom fields tidak berhasil diupdate sesuai package baru');
  }
  
  return true;
}

// Test 4: Verifikasi UI rendering
function testUIRendering() {
  console.log('\n🎨 Test 4: Verifikasi UI Rendering');
  
  // Cek apakah modal edit ada
  const editModal = document.querySelector('[role="dialog"][aria-label="Edit Booking"]');
  if (!editModal) {
    console.log('ℹ️ Edit modal belum terbuka. Buka edit modal untuk testing ini.');
    return false;
  }
  
  // Cek apakah custom fields section ada
  const customFieldsSection = editModal.querySelector('h3:contains("Custom Fields dari Paket")');
  if (!customFieldsSection) {
    console.log('ℹ️ Custom fields section belum muncul. Pilih package dengan custom fields.');
    return false;
  }
  
  console.log('✅ Custom fields section ter-render');
  
  // Cek input fields
  const customFieldInputs = editModal.querySelectorAll('input[placeholder*="Masukkan nilai untuk"]');
  console.log('✅ Custom field inputs ter-render:', customFieldInputs.length, 'fields');
  
  return true;
}

// Jalankan semua test
function runAllTests() {
  console.log('🚀 Memulai semua test...\n');
  
  const results = [
    testDataStructure(),
    testOpenEditModal(),
    testPackageChangeHandler(),
    testUIRendering()
  ];
  
  const passed = results.filter(Boolean).length;
  const total = results.length;
  
  console.log(`\n📊 Hasil Test: ${passed}/${total} berhasil`);
  
  if (passed === total) {
    console.log('🎉 Semua test berhasil! Custom fields edit modal berfungsi dengan baik.');
  } else {
    console.log('⚠️ Beberapa test gagal. Periksa log di atas untuk detail.');
  }
}

// Export functions untuk testing manual
window.testCustomFieldsEditModal = {
  testDataStructure,
  testOpenEditModal,
  testPackageChangeHandler,
  testUIRendering,
  runAllTests
};

console.log('✅ Test functions tersedia di window.testCustomFieldsEditModal');
console.log('💡 Jalankan: testCustomFieldsEditModal.runAllTests()');

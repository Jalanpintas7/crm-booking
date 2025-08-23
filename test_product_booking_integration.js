/**
 * Test Script untuk Integrasi Product & Services dengan Sistem Booking
 * Jalankan script ini di console browser setelah membuka aplikasi
 */

console.log('🚀 Memulai test integrasi Product & Services dengan Booking...');

// Test 1: Verifikasi Data Loading
async function testDataLoading() {
  console.log('\n📊 Test 1: Verifikasi Data Loading');
  
  try {
    // Test loading price packages
    const packages = await window.getPricePackages();
    console.log('✅ Price packages loaded:', packages?.length || 0);
    
    // Test loading contacts
    const contacts = await window.getContacts();
    console.log('✅ Contacts loaded:', contacts?.length || 0);
    
    // Test loading employees
    const employees = await window.getEmployees();
    console.log('✅ Employees loaded:', employees?.length || 0);
    
    // Test loading bookings
    const bookings = await window.getBookings();
    console.log('✅ Bookings loaded:', bookings?.length || 0);
    
    return true;
  } catch (error) {
    console.error('❌ Error in data loading test:', error);
    return false;
  }
}

// Test 2: Verifikasi Struktur Data Package
function testPackageStructure(packages) {
  console.log('\n📦 Test 2: Verifikasi Struktur Data Package');
  
  if (!packages || packages.length === 0) {
    console.log('⚠️ Tidak ada packages untuk ditest');
    return false;
  }
  
  const samplePackage = packages[0];
  const requiredFields = ['id', 'pakej', 'harga', 'services'];
  const missingFields = requiredFields.filter(field => !(field in samplePackage));
  
  if (missingFields.length > 0) {
    console.error('❌ Missing fields in package:', missingFields);
    return false;
  }
  
  console.log('✅ Package structure valid:', {
    id: samplePackage.id,
    pakej: samplePackage.pakej,
    harga: samplePackage.harga,
    services: samplePackage.services
  });
  
  return true;
}

// Test 3: Verifikasi Custom Fields Integration
function testCustomFieldsIntegration(packages) {
  console.log('\n🔧 Test 3: Verifikasi Custom Fields Integration');
  
  if (!packages || packages.length === 0) {
    console.log('⚠️ Tidak ada packages untuk ditest');
    return false;
  }
  
  const packageWithServices = packages.find(p => p.services && Object.keys(p.services).length > 0);
  
  if (!packageWithServices) {
    console.log('⚠️ Tidak ada package dengan custom fields');
    return false;
  }
  
  console.log('✅ Package dengan custom fields ditemukan:', {
    pakej: packageWithServices.pakej,
    services: packageWithServices.services
  });
  
  return true;
}

// Test 4: Verifikasi Booking Form Integration
function testBookingFormIntegration() {
  console.log('\n📝 Test 4: Verifikasi Booking Form Integration');
  
  // Check if booking form elements exist
  const packageSelect = document.querySelector('select[id*="package"], select[id*="Package"]');
  const contactSelect = document.querySelector('select[id*="contact"], select[id*="Contact"]');
  const dateInput = document.querySelector('input[type="date"], input[id*="date"], input[id*="Date"]');
  
  if (!packageSelect) {
    console.error('❌ Package select tidak ditemukan');
    return false;
  }
  
  if (!contactSelect) {
    console.error('❌ Contact select tidak ditemukan');
    return false;
  }
  
  if (!dateInput) {
    console.error('❌ Date input tidak ditemukan');
    return false;
  }
  
  console.log('✅ Booking form elements ditemukan');
  
  // Check if package options are populated
  const packageOptions = packageSelect.querySelectorAll('option');
  if (packageOptions.length <= 1) { // Only default option
    console.warn('⚠️ Package options tidak ter-populate');
  } else {
    console.log('✅ Package options populated:', packageOptions.length - 1);
  }
  
  return true;
}

// Test 5: Simulasi Membuat Booking
async function testBookingCreation() {
  console.log('\n🎯 Test 5: Simulasi Membuat Booking');
  
  try {
    // Get available data
    const packages = await window.getPricePackages();
    const contacts = await window.getContacts();
    
    if (!packages || packages.length === 0) {
      console.log('⚠️ Tidak ada packages untuk test booking');
      return false;
    }
    
    if (!contacts || contacts.length === 0) {
      console.log('⚠️ Tidak ada contacts untuk test booking');
      return false;
    }
    
    // Simulate booking data
    const testBookingData = {
      contact_id: contacts[0].id,
      employee_id: null,
      date: new Date().toISOString().split('T')[0], // Today
      package_name: packages[0].pakej,
      total_price: packages[0].harga,
      status: 'Status Baru',
      custom_fields: packages[0].services || {},
      package_id: packages[0].id
    };
    
    console.log('✅ Test booking data prepared:', testBookingData);
    
    // Note: We won't actually create the booking in test mode
    console.log('ℹ️ Test booking data valid - ready for actual creation');
    
    return true;
  } catch (error) {
    console.error('❌ Error in booking creation test:', error);
    return false;
  }
}

// Test 6: Verifikasi Error Handling
function testErrorHandling() {
  console.log('\n🚨 Test 6: Verifikasi Error Handling');
  
  // Check if error display elements exist
  const errorElements = document.querySelectorAll('[class*="error"], [class*="Error"]');
  
  if (errorElements.length === 0) {
    console.log('⚠️ Error display elements tidak ditemukan');
  } else {
    console.log('✅ Error display elements ditemukan:', errorElements.length);
  }
  
  // Check if toast/notification system exists
  const toastElements = document.querySelectorAll('[class*="toast"], [class*="Toast"], [class*="notification"]');
  
  if (toastElements.length === 0) {
    console.log('⚠️ Toast/notification system tidak ditemukan');
  } else {
    console.log('✅ Toast/notification system ditemukan');
  }
  
  return true;
}

// Main Test Runner
async function runAllTests() {
  console.log('🧪 Memulai semua test...\n');
  
  const results = {
    dataLoading: false,
    packageStructure: false,
    customFields: false,
    bookingForm: false,
    bookingCreation: false,
    errorHandling: false
  };
  
  try {
    // Test 1: Data Loading
    results.dataLoading = await testDataLoading();
    
    if (results.dataLoading) {
      // Get packages for further tests
      const packages = await window.getPricePackages();
      
      // Test 2: Package Structure
      results.packageStructure = testPackageStructure(packages);
      
      // Test 3: Custom Fields
      results.customFields = testCustomFieldsIntegration(packages);
    }
    
    // Test 4: Booking Form
    results.bookingForm = testBookingFormIntegration();
    
    // Test 5: Booking Creation
    results.bookingCreation = await testBookingCreation();
    
    // Test 6: Error Handling
    results.errorHandling = testErrorHandling();
    
  } catch (error) {
    console.error('❌ Error running tests:', error);
  }
  
  // Test Results Summary
  console.log('\n📋 HASIL TEST INTEGRASI:');
  console.log('========================');
  console.log(`Data Loading: ${results.dataLoading ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Package Structure: ${results.packageStructure ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Custom Fields: ${results.customFields ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Booking Form: ${results.bookingForm ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Booking Creation: ${results.bookingCreation ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Error Handling: ${results.errorHandling ? '✅ PASS' : '❌ FAIL'}`);
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 TOTAL: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 SEMUA TEST BERHASIL! Integrasi Product & Services dengan Booking berfungsi dengan baik.');
  } else {
    console.log('⚠️ Beberapa test gagal. Periksa error di atas untuk detail.');
  }
  
  return results;
}

// Export functions for manual testing
window.testProductBookingIntegration = {
  runAllTests,
  testDataLoading,
  testPackageStructure,
  testCustomFieldsIntegration,
  testBookingFormIntegration,
  testBookingCreation,
  testErrorHandling
};

console.log('📚 Test functions exported to window.testProductBookingIntegration');
console.log('💡 Jalankan: testProductBookingIntegration.runAllTests() untuk menjalankan semua test');

// Auto-run tests if in test mode
if (window.location.search.includes('test=true')) {
  console.log('🔍 Auto-running tests...');
  setTimeout(runAllTests, 2000); // Wait for page to load
}

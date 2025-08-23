// Test script untuk memverifikasi custom fields loading
// Jalankan ini di browser console untuk test

console.log('=== Testing Custom Fields Loading ===');

// Test 1: Periksa data yang di-load
async function testDataLoading() {
  console.log('1. Testing data loading...');
  
  try {
    // Load data seperti di loadData()
    const [bookingsData, packagesData] = await Promise.all([
      getBookings(),
      getPricePackages()
    ]);
    
    console.log('Bookings loaded:', bookingsData?.length || 0);
    console.log('Packages loaded:', packagesData?.length || 0);
    
    // Periksa struktur data
    if (bookingsData && bookingsData.length > 0) {
      const firstBooking = bookingsData[0];
      console.log('First booking structure:', {
        id: firstBooking.id,
        package_name: firstBooking.package_name,
        services: firstBooking.services, // Ini yang penting!
        custom_fields: firstBooking.custom_fields
      });
    }
    
    if (packagesData && packagesData.length > 0) {
      const firstPackage = packagesData[0];
      console.log('First package structure:', {
        id: firstPackage.id,
        pakej: firstPackage.pakej,
        services: firstPackage.services // Ini yang penting!
      });
    }
    
  } catch (error) {
    console.error('Error testing data loading:', error);
  }
}

// Test 2: Test openEditModal function
function testOpenEditModal() {
  console.log('2. Testing openEditModal function...');
  
  // Simulasi booking data
  const mockBooking = {
    id: 1,
    package_name: 'Paket Basic',
    services: { durasi: '1 jam', kategori: 'Fotografi' },
    custom_fields: { durasi: '1 jam', kategori: 'Fotografi' }
  };
  
  // Simulasi price packages
  const mockPackages = [
    {
      id: 1,
      pakej: 'Paket Basic',
      services: { durasi: '1 jam', kategori: 'Fotografi' }
    }
  ];
  
  // Simulasi openEditModal
  const relatedPackage = mockPackages.find(p => p.pakej === mockBooking.package_name);
  const selectedBooking = {
    ...mockBooking,
    custom_fields: relatedPackage?.services || mockBooking.custom_fields || {}
  };
  
  if (relatedPackage) {
    selectedBooking.package_id = relatedPackage.id;
  }
  
  console.log('Mock booking:', mockBooking);
  console.log('Related package:', relatedPackage);
  console.log('Selected booking for edit:', selectedBooking);
  
  return selectedBooking;
}

// Test 3: Test package change handler
function testPackageChangeHandler() {
  console.log('3. Testing package change handler...');
  
  const mockSelectedBooking = {
    package_name: 'Paket Premium',
    total_price: '0',
    package_id: '',
    custom_fields: {}
  };
  
  const mockPackages = [
    {
      id: 2,
      pakej: 'Paket Premium',
      services: { durasi: '2 jam', kategori: 'Fotografi', include_editing: true }
    }
  ];
  
  // Simulasi on:change handler
  const selected = mockPackages.find((p) => p.pakej === mockSelectedBooking.package_name);
  if (selected) {
    mockSelectedBooking.total_price = String(selected.harga ?? 0);
    mockSelectedBooking.package_id = selected.id;
    
    if (selected.services && Object.keys(selected.services).length > 0) {
      const customFieldsCopy = {};
      Object.entries(selected.services).forEach(([key, value]) => {
        customFieldsCopy[key] = typeof value === 'string' ? value : String(value);
      });
      mockSelectedBooking.custom_fields = customFieldsCopy;
    } else {
      mockSelectedBooking.custom_fields = {};
    }
  }
  
  console.log('After package change:', mockSelectedBooking);
  return mockSelectedBooking;
}

// Run all tests
async function runAllTests() {
  console.log('Running all tests...\n');
  
  await testDataLoading();
  console.log('\n');
  
  testOpenEditModal();
  console.log('\n');
  
  testPackageChangeHandler();
  console.log('\n');
  
  console.log('=== All tests completed ===');
}

// Run tests
runAllTests();

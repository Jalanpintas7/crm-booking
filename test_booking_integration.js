// Test script untuk memverifikasi integrasi Product & Services dengan Booking System
// Jalankan di browser console atau Node.js environment

// Test 1: Verifikasi data product & services
async function testProductServices() {
  console.log('=== Testing Product & Services ===');
  
  try {
    // Ambil data product
    const products = await getPricePackages();
    console.log('Products loaded:', products.length);
    
    if (products.length > 0) {
      const firstProduct = products[0];
      console.log('First product:', {
        id: firstProduct.id,
        name: firstProduct.pakej,
        price: firstProduct.harga,
        services: firstProduct.services
      });
      
      // Test custom fields
      if (firstProduct.services && Object.keys(firstProduct.services).length > 0) {
        console.log('Custom fields found:', Object.keys(firstProduct.services));
        console.log('Custom fields values:', firstProduct.services);
      } else {
        console.log('No custom fields found in first product');
      }
    } else {
      console.log('No products found - create some products first');
    }
  } catch (error) {
    console.error('Error testing products:', error);
  }
}

// Test 2: Verifikasi form booking
function testBookingForm() {
  console.log('=== Testing Booking Form ===');
  
  // Simulate package selection
  const mockProduct = {
    id: 1,
    pakej: 'Test Package',
    harga: 1000,
    services: {
      durasi: '2 jam',
      lokasi: 'Test Location',
      kategori: 'Test Category'
    }
  };
  
  // Test form data population
  const formData = {
    contact_id: '',
    employee_id: '',
    date: '',
    package_name: '',
    total_price: '',
    status: '',
    custom_fields: {},
    package_id: ''
  };
  
  // Simulate package selection
  const selected = mockProduct;
  if (selected) {
    formData.total_price = String(selected.harga ?? 0);
    formData.package_id = selected.id;
    
    if (selected.services && Object.keys(selected.services).length > 0) {
      const customFieldsCopy = {};
      Object.entries(selected.services).forEach(([key, value]) => {
        customFieldsCopy[key] = typeof value === 'string' ? value : String(value);
      });
      formData.custom_fields = customFieldsCopy;
    } else {
      formData.custom_fields = {};
    }
  }
  
  console.log('Form data after package selection:', formData);
  console.log('Custom fields populated:', Object.keys(formData.custom_fields));
}

// Test 3: Verifikasi API calls
async function testAPICalls() {
  console.log('=== Testing API Calls ===');
  
  try {
    // Test create booking
    const testBookingData = {
      contact_id: 1, // Pastikan contact dengan ID ini ada
      employee_id: 1, // Pastikan employee dengan ID ini ada
      date: '2024-01-15',
      package_name: 'Test Package',
      total_price: 1000,
      status: 'Baru',
      custom_fields: {
        durasi: '2 jam',
        lokasi: 'Test Location'
      },
      package_id: 1 // Pastikan product dengan ID ini ada
    };
    
    console.log('Test booking data:', testBookingData);
    
    // Uncomment baris di bawah untuk test create booking (hati-hati!)
    // const newBooking = await createBooking(testBookingData);
    // console.log('New booking created:', newBooking);
    
  } catch (error) {
    console.error('Error testing API calls:', error);
  }
}

// Test 4: Verifikasi database structure
async function testDatabaseStructure() {
  console.log('=== Testing Database Structure ===');
  
  try {
    // Check available tables
    const tables = await checkAvailableTables();
    console.log('Available tables:', tables.map(t => t.table_name));
    
    // Check if required tables exist
    const requiredTables = ['bookings', 'price_package', 'contact', 'employee'];
    const missingTables = requiredTables.filter(table => 
      !tables.some(t => t.table_name === table)
    );
    
    if (missingTables.length === 0) {
      console.log('✅ All required tables exist');
    } else {
      console.log('❌ Missing tables:', missingTables);
    }
    
  } catch (error) {
    console.error('Error testing database structure:', error);
  }
}

// Test 5: Verifikasi data consistency
async function testDataConsistency() {
  console.log('=== Testing Data Consistency ===');
  
  try {
    const [bookings, products] = await Promise.all([
      getBookings(),
      getPricePackages()
    ]);
    
    console.log('Total bookings:', bookings.length);
    console.log('Total products:', products.length);
    
    // Check if bookings have valid package references
    const bookingsWithPackage = bookings.filter(b => b.package_id);
    const bookingsWithoutPackage = bookings.filter(b => !b.package_id);
    
    console.log('Bookings with package_id:', bookingsWithPackage.length);
    console.log('Bookings without package_id:', bookingsWithoutPackage.length);
    
    // Check custom fields consistency
    const bookingsWithCustomFields = bookings.filter(b => 
      b.custom_fields && Object.keys(b.custom_fields).length > 0
    );
    
    console.log('Bookings with custom fields:', bookingsWithCustomFields.length);
    
    if (bookingsWithCustomFields.length > 0) {
      console.log('Sample custom fields:', bookingsWithCustomFields[0].custom_fields);
    }
    
  } catch (error) {
    console.error('Error testing data consistency:', error);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting integration tests...\n');
  
  await testProductServices();
  console.log('');
  
  testBookingForm();
  console.log('');
  
  await testAPICalls();
  console.log('');
  
  await testDatabaseStructure();
  console.log('');
  
  await testDataConsistency();
  console.log('');
  
  console.log('✅ All tests completed!');
}

// Export functions for manual testing
window.testBookingIntegration = {
  testProductServices,
  testBookingForm,
  testAPICalls,
  testDatabaseStructure,
  testDataConsistency,
  runAllTests
};

// Auto-run tests if in browser
if (typeof window !== 'undefined') {
  console.log('🔧 Test functions loaded. Run testBookingIntegration.runAllTests() to start testing.');
}

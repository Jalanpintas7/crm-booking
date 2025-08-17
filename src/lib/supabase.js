import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key exists:', !!supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test the connection
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Supabase connection error:', error);
  } else {
    console.log('Supabase connected successfully');
  }
});

// Helper functions untuk CRUD operations

// ========== BRAND OPERATIONS ==========
export async function getFirstBrand() {
  try {
    const { data, error } = await supabase
      .from('brand')
      .select('*')
      .order('id', { ascending: true })
      .limit(1);

    if (error) throw error;
    return Array.isArray(data) && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error fetching first brand:', error);
    return null;
  }
}

export async function createBrand(brandData) {
  try {
    // Try multiple possible schemas for brand columns
    const payloads = [
      { name: brandData.name ?? null, description: brandData.description ?? null },
      { brand_name: brandData.name ?? null, description: brandData.description ?? null },
      { nama_brand: brandData.name ?? null, description: brandData.description ?? null },
      { name: brandData.name ?? null, keterangan: brandData.description ?? null },
      { brand_name: brandData.name ?? null, keterangan: brandData.description ?? null },
      { nama_brand: brandData.name ?? null, keterangan: brandData.description ?? null },
      { name: brandData.name ?? null, deskripsi: brandData.description ?? null },
      { brand_name: brandData.name ?? null, deskripsi: brandData.description ?? null },
      { nama_brand: brandData.name ?? null, deskripsi: brandData.description ?? null }
    ];

    let lastError = null;
    for (const payload of payloads) {
      const { data, error } = await supabase
        .from('brand')
        .insert([payload])
        .select()
        .single();
      if (!error) return data;
      lastError = error;
    }
    throw lastError;
  } catch (error) {
    console.error('Error creating brand:', error);
    throw error;
  }
}

export async function updateBrand(id, brandData) {
  try {
    // Try multiple possible schemas for brand columns
    const payloads = [
      { name: brandData.name ?? null, description: brandData.description ?? null },
      { brand_name: brandData.name ?? null, description: brandData.description ?? null },
      { nama_brand: brandData.name ?? null, description: brandData.description ?? null },
      { name: brandData.name ?? null, keterangan: brandData.description ?? null },
      { brand_name: brandData.name ?? null, keterangan: brandData.description ?? null },
      { nama_brand: brandData.name ?? null, keterangan: brandData.description ?? null },
      { name: brandData.name ?? null, deskripsi: brandData.description ?? null },
      { brand_name: brandData.name ?? null, deskripsi: brandData.description ?? null },
      { nama_brand: brandData.name ?? null, deskripsi: brandData.description ?? null }
    ];

    let lastError = null;
    for (const payload of payloads) {
      const { data, error } = await supabase
        .from('brand')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (!error) return data;
      lastError = error;
    }
    throw lastError;
  } catch (error) {
    console.error('Error updating brand:', error);
    throw error;
  }
}

// ========== CONTACT OPERATIONS ==========
export async function getContacts() {
  try {
    console.log('Supabase URL:', supabaseUrl);
    console.log('Supabase client initialized:', !!supabase);
    
    // Check if environment variables are set
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase environment variables not configured');
      throw new Error('Supabase configuration missing. Please check your environment variables.');
    }
    
    const { data, error } = await supabase
      .from('contact')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Supabase error fetching contacts:', error);
      // If table doesn't exist, return empty array instead of throwing
      if (error.code === '42P01') { // Table doesn't exist
        console.warn('Contact table does not exist, returning empty array');
        return [];
      }
      throw error;
    }
    
    console.log('Contacts data from Supabase:', data);
    
    // Process each contact to parse custom_field JSONB to customFields object
    const processedData = (data || []).map(contact => {
      const processedContact = { ...contact };
      
      // Parse custom_field JSONB to customFields object
      if (contact.custom_field) {
        try {
          processedContact.customFields = JSON.parse(contact.custom_field);
        } catch (parseError) {
          console.warn('Error parsing custom_field JSON for contact', contact.id, ':', parseError);
          processedContact.customFields = {};
        }
      } else {
        processedContact.customFields = {};
      }
      
      return processedContact;
    });
    
    return processedData;
  } catch (error) {
    console.error('Error in getContacts function:', error);
    throw error;
  }
}

export async function createContact(contactData) {
  try {
    // Prepare the data for insertion, ensuring customFields is properly formatted as JSONB
    const insertData = {
      id: contactData.id,
      name: contactData.name,
      whatsapp: contactData.whatsapp,
      email: contactData.email,
      custom_field: contactData.customFields ? JSON.stringify(contactData.customFields) : null
    };
    
    console.log('Creating contact with data:', insertData);
    
    const { data, error } = await supabase
      .from('contact')
      .insert([insertData])
      .select();
    
    if (error) {
      console.error('Error creating contact:', error);
      if (error.code === '42P01') { // Table doesn't exist
        throw new Error('Contact table does not exist. Please create the table first.');
      }
      throw error;
    }
    
    // Parse custom_field back to object for frontend use
    const result = data[0];
    if (result.custom_field) {
      try {
        result.customFields = JSON.parse(result.custom_field);
      } catch (parseError) {
        console.warn('Error parsing custom_field JSON:', parseError);
        result.customFields = {};
      }
    } else {
      result.customFields = {};
    }
    
    return result;
  } catch (error) {
    console.error('Error in createContact function:', error);
    throw error;
  }
}

export async function updateContact(id, contactData) {
  try {
    // Prepare the data for update, ensuring customFields is properly formatted as JSONB
    const updateData = {
      name: contactData.name,
      whatsapp: contactData.whatsapp,
      email: contactData.email,
      custom_field: contactData.customFields ? JSON.stringify(contactData.customFields) : null
    };
    
    console.log('Updating contact with data:', updateData);
    
    const { data, error } = await supabase
      .from('contact')
      .update(updateData)
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('Error updating contact:', error);
      if (error.code === '42P01') { // Table doesn't exist
        throw new Error('Contact table does not exist. Please create the table first.');
      }
      throw error;
    }
    
    // Parse custom_field back to object for frontend use
    const result = data[0];
    if (result.custom_field) {
      try {
        result.customFields = JSON.parse(result.custom_field);
      } catch (parseError) {
        console.warn('Error parsing custom_field JSON:', parseError);
        result.customFields = {};
      }
    } else {
      result.customFields = {};
    }
    
    return result;
  } catch (error) {
    console.error('Error in updateContact function:', error);
    throw error;
  }
}

export async function deleteContact(id) {
  try {
    const { error } = await supabase
      .from('contact')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting contact:', error);
      if (error.code === '42P01') { // Table doesn't exist
        throw new Error('Contact table does not exist. Please create the table first.');
      }
      throw error;
    }
    return true;
  } catch (error) {
    console.error('Error in deleteContact function:', error);
    throw error;
  }
}

// ========== CUSTOM FIELD DEFINITIONS OPERATIONS ==========
export async function getCustomFieldDefinitions() {
  try {
    const { data, error } = await supabase
      .from('custom_field_definitions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching custom field definitions:', error);
      // If table doesn't exist, return empty array
      if (error.code === '42P01') {
        console.warn('Custom field definitions table does not exist, returning empty array');
        return [];
      }
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getCustomFieldDefinitions function:', error);
    return [];
  }
}

export async function createCustomFieldDefinition(definitionData) {
  try {
    const { data, error } = await supabase
      .from('custom_field_definitions')
      .insert([definitionData])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating custom field definition:', error);
      if (error.code === '42P01') {
        throw new Error('Custom field definitions table does not exist. Please create the table first.');
      }
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in createCustomFieldDefinition function:', error);
    throw error;
  }
}

export async function updateCustomFieldDefinition(id, definitionData) {
  try {
    const { data, error } = await supabase
      .from('custom_field_definitions')
      .update(definitionData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating custom field definition:', error);
      if (error.code === '42P01') {
        throw new Error('Custom field definitions table does not exist. Please create the table first.');
      }
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in updateCustomFieldDefinition function:', error);
    throw error;
  }
}

export async function deleteCustomFieldDefinition(id) {
  try {
    const { error } = await supabase
      .from('custom_field_definitions')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting custom field definition:', error);
      if (error.code === '42P01') {
        throw new Error('Custom field definitions table does not exist. Please create the table first.');
      }
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteCustomFieldDefinition function:', error);
    throw error;
  }
}

// ========== BOOKINGS OPERATIONS ==========
export async function getBookings() {
  try {
    // Try the query with foreign key joins first
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        contact:contact_id (id, name, whatsapp, email),
        employee:employee_id (id, name, whatsapp)
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      // Fallback: Get bookings without joins and manually populate relations
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (bookingsError) {
        console.error('Error fetching bookings:', bookingsError);
        return [];
      }
      
      if (!bookingsData || bookingsData.length === 0) {
        return [];
      }
      
      // Get all contacts and employees separately
      const [contactsData, employeesData] = await Promise.all([
        getContacts(),
        getEmployees()
      ]);
      
      // Manually join the data
      const enrichedBookings = bookingsData.map(booking => {
        const contact = contactsData.find(c => c.id === booking.contact_id);
        const employee = employeesData.find(e => e.id === booking.employee_id);
        
        return {
          ...booking,
          contact: contact || null,
          employee: employee || null
        };
      });
      
      return enrichedBookings;
    }
    
    return data || [];
    
  } catch (e) {
    console.error('Error in getBookings:', e);
    return [];
  }
}

export async function createBooking(bookingData) {
  // Format data sesuai struktur SQL baru
  const now = new Date();
  // Konversi ke GMT+7 (WIB) dan format sebagai text
  const gmtPlus7 = new Date(now.getTime() + (7 * 60 * 60 * 1000));
  
  const formattedData = {
    ...bookingData,
    // created_at sebagai text dengan timezone GMT+7
    created_at: gmtPlus7.toISOString().replace('Z', '+07:00'),
    // date tetap sebagai timestamp without timezone tapi dalam format yang benar
    date: bookingData.date,
    // status default 'Akan Datang' jika tidak ada
    status: bookingData.status || 'Akan Datang'
  };

  const { data, error } = await supabase
    .from('bookings')
    .insert([formattedData])
    .select(`
      *,
      contact:contact_id (id, name, whatsapp, email),
      employee:employee_id (id, name, whatsapp)
    `);
  
  if (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
  return data[0];
}

export async function updateBooking(id, bookingData) {
  // Format data untuk update sesuai struktur SQL baru
  const formattedData = {
    ...bookingData
    // Tidak perlu mengubah created_at karena itu hanya di-set saat create
    // date tetap dalam format yang diterima database
    // status bisa diupdate jika diperlukan
  };

  const { data, error } = await supabase
    .from('bookings')
    .update(formattedData)
    .eq('id', id)
    .select(`
      *,
      contact:contact_id (id, name, whatsapp, email),
      employee:employee_id (id, name, whatsapp)
    `);
  
  if (error) {
    console.error('Error updating booking:', error);
    throw error;
  }
  
  return data[0];
}

export async function deleteBooking(id) {
  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting booking:', error);
    throw error;
  }
  return true;
}

// Hapus banyak booking sekaligus
export async function deleteBookingsBulk(ids) {
  if (!Array.isArray(ids) || ids.length === 0) return true;
  const { error } = await supabase
    .from('bookings')
    .delete()
    .in('id', ids);

  if (error) {
    console.error('Error bulk deleting bookings:', error);
    throw error;
  }
  return true;
}

// ========== EMPLOYEE OPERATIONS ==========
export async function getEmployees() {
  const { data, error } = await supabase
    .from('employee')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching employees:', error);
    return [];
  }
  return data || [];
}

export async function createEmployee(employeeData) {
  const { data, error } = await supabase
    .from('employee')
    .insert([employeeData])
    .select();
  
  if (error) {
    console.error('Error creating employee:', error);
    throw error;
  }
  return data[0];
}

export async function updateEmployee(id, employeeData) {
  try {
    const { data, error } = await supabase
      .from('employee')
      .update(employeeData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating employee:', error);
    throw error;
  }
}

export async function deleteEmployee(id) {
  try {
    const { error } = await supabase
      .from('employee')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting employee:', error);
    throw error;
  }
}

// ========== PRICE PACKAGE OPERATIONS ==========
export async function checkAvailableTables() {
  try {
    console.log('Checking available tables...');
    
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name');
    
    if (error) {
      console.error('Error checking tables:', error);
      return [];
    }
    
    console.log('Available tables:', data);
    return data || [];
  } catch (err) {
    console.error('Error in checkAvailableTables:', err);
    return [];
  }
}

export async function getPricePackages() {
  try {
    console.log('Fetching price packages from price_package table...');
    
    // First, let's check if the table exists and get its structure
    const { data: tableInfo, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'price_package');
    
    if (tableError) {
      console.error('Error checking table existence:', tableError);
    } else {
      console.log('Table info:', tableInfo);
    }
    
    // Try to fetch data from price_package table
    const { data, error } = await supabase
      .from('price_package')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching price packages:', error);
      
      // If table doesn't exist, try alternative table names
      if (error.code === '42P01') { // Table doesn't exist
        console.log('price_package table not found, trying alternative names...');
        
        const alternativeTables = ['price_packages', 'packages', 'products', 'services'];
        
        for (const tableName of alternativeTables) {
          try {
            console.log(`Trying table: ${tableName}`);
            const { data: altData, error: altError } = await supabase
              .from(tableName)
              .select('*')
              .order('created_at', { ascending: false });
            
            if (!altError && altData) {
              console.log(`Found data in ${tableName} table:`, altData);
              return altData;
            }
          } catch (altErr) {
            console.log(`Table ${tableName} not accessible:`, altErr.message);
          }
        }
      }
      
      return [];
    }
    
    console.log('Successfully fetched price packages:', data);
    return data || [];
  } catch (err) {
    console.error('Unexpected error in getPricePackages:', err);
    return [];
  }
}

export async function createPricePackage(packageData) {
  const { data, error } = await supabase
    .from('price_package')
    .insert([packageData])
    .select();
  
  if (error) {
    console.error('Error creating price package:', error);
    throw error;
  }
  return data[0];
}

export async function updatePricePackage(id, packageData) {
  const { data, error } = await supabase
    .from('price_package')
    .update(packageData)
    .eq('id', id)
    .select();
  
  if (error) {
    console.error('Error updating price package:', error);
    throw error;
  }
  return data[0];
}

export async function deletePricePackage(id) {
  const { error } = await supabase
    .from('price_package')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting price package:', error);
    throw error;
  }
  return true;
}

// ========== AVAILABILITY OPERATIONS ==========
export async function getAvailability() {
  const { data, error } = await supabase
    .from('availability')
    .select('*')
    .order('day');
  
  if (error) {
    console.error('Error fetching availability:', error);
    return [];
  }
  return data || [];
}

export async function createAvailability(availabilityData) {
  const { data, error } = await supabase
    .from('availability')
    .insert([availabilityData])
    .select();
  
  if (error) {
    console.error('Error creating availability:', error);
    throw error;
  }
  return data[0];
}

export async function updateAvailability(id, availabilityData) {
  const { data, error } = await supabase
    .from('availability')
    .update(availabilityData)
    .eq('id', id)
    .select();
  
  if (error) {
    console.error('Error updating availability:', error);
    throw error;
  }
  return data[0];
}

export async function deleteAvailability(id) {
  const { error } = await supabase
    .from('availability')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting availability:', error);
    throw error;
  }
  return true;
}

export async function updateAvailabilityByDay(day, availabilityData) {
  const { data, error } = await supabase
    .from('availability')
    .update(availabilityData)
    .eq('day', day)
    .select();
  
  if (error) {
    console.error('Error updating availability:', error);
    throw error;
  }
  
  return data[0];
}

// ========== HOLIDAY OPERATIONS ==========
export async function getHolidays() {
  const { data, error } = await supabase
    .from('holiday')
    .select('*')
    .order('date');
  
  if (error) {
    console.error('Error fetching holidays:', error);
    return [];
  }
  return data || [];
}

export async function createHoliday(holidayData) {
  const { data, error } = await supabase
    .from('holiday')
    .insert([holidayData])
    .select();
  
  if (error) {
    console.error('Error creating holiday:', error);
    throw error;
  }
  return data[0];
}

export async function deleteHoliday(id) {
  const { error } = await supabase
    .from('holiday')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting holiday:', error);
    throw error;
  }
  return true;
}

// ========== DASHBOARD STATISTICS ==========
export async function getDashboardStats() {
  try {
    // Get total contacts
    const { count: totalContacts } = await supabase
      .from('contact')
      .select('*', { count: 'exact', head: true });

    // Get total bookings
    const { count: totalBookings } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true });

    // Get pending bookings (future dates)
    const { count: pendingBookings } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .gt('date', new Date().toISOString());

    // Get new contacts today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: newContactsToday } = await supabase
      .from('contact')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    return {
      totalContacts: totalContacts || 0,
      totalBookings: totalBookings || 0,
      pendingBookings: pendingBookings || 0,
      newContactsToday: newContactsToday || 0
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalContacts: 0,
      totalBookings: 0,
      pendingBookings: 0,
      newContactsToday: 0
    };
  }
}

// Colors/Status Management Functions
export async function getColors() {
  try {
    const { data, error } = await supabase
      .from('colors')
      .select('*')
      .order('id');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching colors:', error);
    throw error;
  }
}

export async function createColor(colorData) {
  try {
    const { data, error } = await supabase
      .from('colors')
      .insert([colorData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating color:', error);
    throw error;
  }
}

export async function updateColor(id, colorData) {
  try {
    const { data, error } = await supabase
      .from('colors')
      .update(colorData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating color:', error);
    throw error;
  }
}

export async function deleteColor(id) {
  try {
    const { error } = await supabase
      .from('colors')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting color:', error);
    throw error;
  }
}

export async function resetToDefaultColors() {
  try {
    // First, delete all existing colors
    const { error: deleteError } = await supabase
      .from('colors')
      .delete()
      .neq('id', 0); // Delete all records
    
    if (deleteError) throw deleteError;
    
    // Insert default colors
    const defaultColors = [
      { custom_status: 'Baru', code_color: '#3b82f6' },
      { custom_status: 'Dalam Proses', code_color: '#f59e0b' },
      { custom_status: 'Selesai', code_color: '#22c55e' }
    ];
    
    const { data, error } = await supabase
      .from('colors')
      .insert(defaultColors)
      .select();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error resetting to default colors:', error);
    throw error;
  }
}

// ========== GREETING MESSAGE (WHATSAPP BOT) OPERATIONS ==========
export async function getGreetingMessages() {
  try {
    const { data, error } = await supabase
      .from('greeting_message')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching greeting messages:', error);
    return [];
  }
}

export async function createGreetingMessage(greetingData) {
  try {
    const payload = {
      title: greetingData.title || null,
      message: greetingData.message,
      is_active: typeof greetingData.is_active === 'boolean' ? greetingData.is_active : true
    };

    const { data, error } = await supabase
      .from('greeting_message')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating greeting message:', error);
    throw error;
  }
}

export async function updateGreetingMessage(id, greetingData) {
  try {
    const payload = {
      title: greetingData.title ?? null,
      message: greetingData.message,
      is_active: greetingData.is_active
    };

    const { data, error } = await supabase
      .from('greeting_message')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating greeting message:', error);
    throw error;
  }
}

export async function deleteGreetingMessage(id) {
  try {
    const { error } = await supabase
      .from('greeting_message')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting greeting message:', error);
    throw error;
  }
}

// ========== RAG CONTEXT OPERATIONS ==========
function mapRagRowToContext(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    customFields: Array.isArray(row.custom_fields) ? row.custom_fields : []
  };
}

export async function getRagContexts() {
  try {
    const { data, error } = await supabase
      .from('rag_contexts')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapRagRowToContext);
  } catch (error) {
    console.error('Error fetching RAG contexts:', error);
    return [];
  }
}

export async function createRagContext(contextData) {
  try {
    const payload = {
      name: contextData.name,
      description: contextData.description,
      custom_fields: Array.isArray(contextData.customFields) ? contextData.customFields : []
    };
    const { data, error } = await supabase
      .from('rag_contexts')
      .insert([payload])
      .select()
      .single();
    if (error) throw error;
    return mapRagRowToContext(data);
  } catch (error) {
    console.error('Error creating RAG context:', error);
    throw error;
  }
}

export async function updateRagContext(id, contextData) {
  try {
    const payload = {
      name: contextData.name,
      description: contextData.description,
      custom_fields: Array.isArray(contextData.customFields) ? contextData.customFields : [],
      updated_at: new Date().toISOString()
    };
    const { data, error } = await supabase
      .from('rag_contexts')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return mapRagRowToContext(data);
  } catch (error) {
    console.error('Error updating RAG context:', error);
    throw error;
  }
}

export async function deleteRagContext(id) {
  try {
    const { error } = await supabase
      .from('rag_contexts')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting RAG context:', error);
    throw error;
  }
}

// ========== CHART DATA FUNCTIONS ==========
export async function getChartData(period = 'yesterday') {
  try {
    let startDate, endDate;
    const now = new Date();
    
    // Set timezone to GMT+7
    const gmtPlus7 = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    
    switch (period) {
      case 'yesterday':
        startDate = new Date(gmtPlus7);
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'last_7_days':
        startDate = new Date(gmtPlus7);
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(gmtPlus7);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'last_30_days':
        startDate = new Date(gmtPlus7);
        startDate.setDate(startDate.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(gmtPlus7);
        endDate.setHours(23, 59, 59, 999);
        break;
      default:
        startDate = new Date(gmtPlus7);
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);
    }

    // Get bookings within the period
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (bookingsError) {
      console.error('Error fetching bookings for chart:', bookingsError);
      return getEmptyChartData();
    }

    // Get all available statuses from colors table
    let { data: colors, error: colorsError } = await supabase
      .from('colors')
      .select('custom_status, code_color')
      .order('id');

    if (colorsError) {
      console.error('Error fetching colors for chart:', colorsError);
      return getEmptyChartData();
    }

    // If no colors defined, create default status
    if (!colors || colors.length === 0) {
      colors = [
        { custom_status: 'Akan Datang', code_color: '#3b82f6' },
        { custom_status: 'Dalam Proses', code_color: '#f59e0b' },
        { custom_status: 'Selesai', code_color: '#22c55e' },
        { custom_status: 'Dibatalkan', code_color: '#ef4444' }
      ];
    }

    // Calculate statistics by status
    const statusStats = {};
    let totalBookings = 0;
    let totalIncome = 0;

    // Initialize stats for each status
    colors.forEach(color => {
      statusStats[color.custom_status] = {
        count: 0,
        percentage: 0,
        color: color.code_color
      };
    });

    // Count bookings by status
    bookings.forEach(booking => {
      const status = booking.status || colors[0]?.custom_status || 'Akan Datang';
      if (statusStats[status]) {
        statusStats[status].count++;
        totalBookings++;
      } else {
        // If status not found in defined colors, add to first status
        const firstStatus = colors[0]?.custom_status || 'Akan Datang';
        if (statusStats[firstStatus]) {
          statusStats[firstStatus].count++;
          totalBookings++;
        }
      }
      if (booking.total_price) {
        totalIncome += parseFloat(booking.total_price) || 0;
      }
    });

    // Calculate percentages
    Object.keys(statusStats).forEach(status => {
      statusStats[status].percentage = totalBookings > 0 
        ? Math.round((statusStats[status].count / totalBookings) * 100) 
        : 0;
    });

    // Get new contacts in the period
    const { count: newContacts } = await supabase
      .from('contact')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    // Get cancelled bookings (assuming cancelled status exists)
    const cancelledStatus = colors.find(c => 
      c.custom_status.toLowerCase().includes('batal') || 
      c.custom_status.toLowerCase().includes('cancel') ||
      c.custom_status.toLowerCase().includes('dibatalkan')
    );
    const cancelledCount = cancelledStatus ? statusStats[cancelledStatus.custom_status]?.count || 0 : 0;

    // Get rescheduled bookings
    const rescheduledStatus = colors.find(c => 
      c.custom_status.toLowerCase().includes('jadual') || 
      c.custom_status.toLowerCase().includes('schedule') ||
      c.custom_status.toLowerCase().includes('semula')
    );
    const rescheduledCount = rescheduledStatus ? statusStats[rescheduledStatus.custom_status]?.count || 0 : 0;

    // Get no-show bookings
    const noShowStatus = colors.find(c => 
      c.custom_status.toLowerCase().includes('hadir') || 
      c.custom_status.toLowerCase().includes('show') ||
      c.custom_status.toLowerCase().includes('tidak')
    );
    const noShowCount = noShowStatus ? statusStats[noShowStatus.custom_status]?.count || 0 : 0;

    return {
      period,
      totalBookings,
      totalIncome,
      newContacts: newContacts || 0,
      cancelledBookings: cancelledCount,
      rescheduledBookings: rescheduledCount,
      noShowBookings: noShowCount,
      statusStats,
      colors: colors.map(c => ({ name: c.custom_status, color: c.code_color }))
    };

  } catch (error) {
    console.error('Error fetching chart data:', error);
    return getEmptyChartData();
  }
}

function getEmptyChartData() {
  return {
    period: 'yesterday',
    totalBookings: 0,
    totalIncome: 0,
    newContacts: 0,
    cancelledBookings: 0,
    rescheduledBookings: 0,
    noShowBookings: 0,
    statusStats: {},
    colors: []
  };
}

// ========== COMPLETED BOOKINGS INCOME DATA ==========
export async function getCompletedBookingsIncome(period = 'yesterday') {
  try {
    let startDate, endDate;
    const now = new Date();
    
    // Set timezone to GMT+7
    const gmtPlus7 = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    
    switch (period) {
      case 'yesterday':
        startDate = new Date(gmtPlus7);
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'last_7_days':
        startDate = new Date(gmtPlus7);
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(gmtPlus7);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'last_30_days':
        startDate = new Date(gmtPlus7);
        startDate.setDate(startDate.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(gmtPlus7);
        endDate.setHours(23, 59, 59, 999);
        break;
      default:
        startDate = new Date(gmtPlus7);
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);
    }

    // Get all available statuses from colors table to identify completed statuses
    let { data: colors, error: colorsError } = await supabase
      .from('colors')
      .select('custom_status, code_color')
      .order('id');

    if (colorsError) {
      console.error('Error fetching colors for completed income:', colorsError);
      return 0;
    }

    // If no colors defined, use default completed status
    let completedStatuses = ['Selesai', 'Completed', 'Selesai'];
    if (colors && colors.length > 0) {
      // Find statuses that indicate completion
      completedStatuses = colors
        .filter(color => 
          color.custom_status.toLowerCase().includes('selesai') ||
          color.custom_status.toLowerCase().includes('completed') ||
          color.custom_status.toLowerCase().includes('siap') ||
          color.custom_status.toLowerCase().includes('done') ||
          color.custom_status.toLowerCase().includes('finish')
        )
        .map(color => color.custom_status);
    }

    // If no completed statuses found, use the last status as completed
    if (completedStatuses.length === 0 && colors && colors.length > 0) {
      completedStatuses = [colors[colors.length - 1].custom_status];
    }

    // Get completed bookings within the period
    const { data: completedBookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('total_price, status')
      .in('status', completedStatuses)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (bookingsError) {
      console.error('Error fetching completed bookings for income:', bookingsError);
      return 0;
    }

    // Calculate total income from completed bookings
    const totalIncome = completedBookings?.reduce((sum, booking) => 
      sum + (parseFloat(booking.total_price) || 0), 0) || 0;

    return totalIncome;
  } catch (error) {
    console.error('Error fetching completed bookings income:', error);
    return 0;
  }
}

// ========== AMOUNT RECEIVED CHART DATA ==========
export async function getAmountReceivedData(period = 'last_30_days') {
  try {
    let days = 30;
    if (period === 'yesterday') days = 1;
    else if (period === 'last_7_days') days = 7;

    const data = [];
    const now = new Date();
    const gmtPlus7 = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(gmtPlus7);
      date.setDate(date.getDate() - i);
      
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Get bookings for this day
      const { data: dayBookings } = await supabase
        .from('bookings')
        .select('total_price')
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString());

      const dayIncome = dayBookings?.reduce((sum, booking) => 
        sum + (parseFloat(booking.total_price) || 0), 0) || 0;

      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
        amount: dayIncome
      });
    }

    return data;
  } catch (error) {
    console.error('Error fetching amount received data:', error);
    return [];
  }
}

// ========== STORAGE: IMAGES BUCKET ==========
export const IMAGE_BUCKET = 'images';

// Dapatkan URL publik untuk path gambar (butuh bucket public atau signed URL)
export function getPublicUrlForImage(path) {
  try {
    const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path);
    return data?.publicUrl || '';
  } catch (error) {
    console.error('Error generating public URL:', error);
    return '';
  }
}

// List file di root bucket images (non-recursive)
export async function listBucketImages(prefix = '') {
  try {
    const { data, error } = await supabase.storage
      .from(IMAGE_BUCKET)
      .list(prefix, { limit: 100, offset: 0, sortBy: { column: 'name', order: 'desc' } });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error listing images:', error);
    return [];
  }
}

// Upload file baru ke bucket images
export async function uploadImageToBucket(file, filename) {
  try {
    const path = filename;
    const { data, error } = await supabase.storage
      .from(IMAGE_BUCKET)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file?.type || 'application/octet-stream'
      });
    if (error) throw error;
    return data; // { path, id, ... }
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

// Replace/Upsert konten file pada path yang sama
export async function upsertImageToPath(file, path) {
  try {
    const { data, error } = await supabase.storage
      .from(IMAGE_BUCKET)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file?.type || 'application/octet-stream'
      });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error upserting image:', error);
    throw error;
  }
}

// Hapus file berdasarkan path
export async function deleteImageFromBucket(path) {
  try {
    const { error } = await supabase.storage
      .from(IMAGE_BUCKET)
      .remove([path]);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}

// Rename/move file dari fromPath ke toPath
export async function renameImagePath(fromPath, toPath) {
  try {
    const { data, error } = await supabase.storage
      .from(IMAGE_BUCKET)
      .move(fromPath, toPath);
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error renaming image:', error);
    throw error;
  }
}
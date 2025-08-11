import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions untuk CRUD operations

// ========== CONTACT OPERATIONS ==========
export async function getContacts() {
  const { data, error } = await supabase
    .from('contact')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching contacts:', error);
    return [];
  }
  return data || [];
}

export async function createContact(contactData) {
  const { data, error } = await supabase
    .from('contact')
    .insert([contactData])
    .select();
  
  if (error) {
    console.error('Error creating contact:', error);
    throw error;
  }
  return data[0];
}

export async function updateContact(id, contactData) {
  const { data, error } = await supabase
    .from('contact')
    .update(contactData)
    .eq('id', id)
    .select();
  
  if (error) {
    console.error('Error updating contact:', error);
    throw error;
  }
  return data[0];
}

export async function deleteContact(id) {
  const { error } = await supabase
    .from('contact')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting contact:', error);
    throw error;
  }
  return true;
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

// ========== PRICE PACKAGE OPERATIONS ==========
export async function getPricePackages() {
  const { data, error } = await supabase
    .from('price_package')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching price packages:', error);
    return [];
  }
  return data || [];
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
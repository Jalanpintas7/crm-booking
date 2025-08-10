import { writable } from 'svelte/store';

// Create a writable store for language
export const currentLanguage = writable('ms'); // 'ms' for Malay, 'en' for English

// Language data
export const translations = {
  ms: {
    // Navigation
    'home': 'Laman Utama',
    'bookings': 'Tempahan',
    'contact_manager': 'Pengurus Kenalan',
    'settings': 'Tetapan',
    'context_manager': 'Pengurus Konteks',
    'booking_manager': 'Pengurus Tempahan',
    
    // Dashboard
    'dashboard': 'Dashboard',
    'overview': 'Ringkasan aktiviti hari ini',
    'total_contacts': 'Total Contacts',
    'total_bookings': 'Total Bookings',
    'pending_bookings': 'Pending Bookings',
    'new_contacts_today': 'New Contacts Today',
    
    // Analytics
    'analytics': 'Analytics',
    'recent_booking': 'Recent Booking',
    'recent_contacts': 'Recent Contacts',
    'no_bookings': 'Tiada tempahan baru',
    'no_income': 'Tiada pendapatan',
    'no_bookings_period': 'Belum ada tempahan untuk',
    'no_income_period': 'Belum ada pendapatan untuk',
    
         // Common
     'my_account': 'Akaun Saya',
     'logout': 'Log Keluar',
     'language': 'Bahasa',
     
     // Booking Manager
     'booking_manager_title': 'Pengurus Tempahan',
     'add_new_booking': 'Tambah Tempahan Baru',
     'client_name': 'Nama Pelanggan',
     'date': 'Tarikh',
     'package_name': 'Nama Pakej',
     'amount': 'Jumlah',
     'status': 'Status',
     'actions': 'Tindakan',
     'completed': 'Selesai',
     'upcoming': 'Akan Datang',
     'past': 'Lepas',
     'today': 'Hari Ini',
     'upcoming_bookings': 'Tempahan Akan Datang',
     'drag_drop_instruction': '💡 Seret dan lepas card untuk mengubah status tempahan',
     'booking_moved': 'Tempahan "{name}" dipindahkan ke {status}',
     'delete': 'Padam',
     'cancel': 'Batal',
     'save': 'Simpan',
     'filter_all': 'Semua',
     'filter_completed': 'Selesai',
     'filter_upcoming': 'Akan Datang',
     'view_table': 'Senarai',
     'view_kanban': 'Kanban',
     'view_calendar': 'Kalendar',
     'view': 'Paparan',
     'search': 'Cari',
     'search_placeholder': 'Cari nama pelanggan atau pakej...',
     'filter': 'Penapis',
     'from': 'Dari',
     'to': 'Hingga',
     'batch_trash': 'Pindah ke Tong Sampah',
     'export': 'Eksport',
     'phone': 'Telefon',
     'enter_client_name': 'Masukkan nama pelanggan',
     'enter_phone': 'Masukkan nombor telefon',
     'enter_package_name': 'Masukkan nama pakej',
     'deal_by': 'Deal Oleh',
     'enter_deal_by': 'Pilih deal oleh',
     'booking_details': 'Butiran Tempahan',
     'edit': 'Sunting',
     'edit_booking': 'Sunting Tempahan',
     'close': 'Tutup',
     'prev': 'Sebelum',
     'next': 'Seterus',
     'page': 'Halaman',
     'bookings': 'tempahan',
     'no_bookings_message': 'Tiada tempahan dijumpai. Cuba ubah penapis atau tambah tempahan baru.'
  },
  en: {
    // Navigation
    'home': 'Home',
    'booking manager': 'Booking Manager',
    'contact_manager': 'Contact Manager',
    'settings': 'Settings',
    'context_manager': 'Context Manager',
    
    // Dashboard
    'dashboard': 'Dashboard',
    'overview': 'Today\'s activity overview',
    'total_contacts': 'Total Contacts',
    'total_bookings': 'Total Bookings',
    'pending_bookings': 'Pending Bookings',
    'new_contacts_today': 'New Contacts Today',
    
    // Analytics
    'analytics': 'Analytics',
    'recent_booking': 'Recent Booking',
    'recent_contacts': 'Recent Contacts',
    'no_bookings': 'No new bookings',
    'no_income': 'No income',
    'no_bookings_period': 'No bookings for',
    'no_income_period': 'No income for',
    
         // Common
     'my_account': 'My Account',
     'logout': 'Logout',
     'language': 'Language',
     
     // Booking Manager
     'booking_manager_title': 'Booking Manager',
     'add_new_booking': 'Add New Booking',
     'client_name': 'Client Name',
     'date': 'Date',
     'package_name': 'Package Name',
     'amount': 'Amount',
     'status': 'Status',
     'actions': 'Actions',
     'completed': 'Completed',
     'upcoming': 'Upcoming',
     'past': 'Past',
     'today': 'Today',
     'upcoming_bookings': 'Upcoming Bookings',
     'drag_drop_instruction': '💡 Drag and drop cards to change booking status',
     'booking_moved': 'Booking "{name}" moved to {status}',
     'delete': 'Delete',
     'cancel': 'Cancel',
     'save': 'Save',
     'filter_all': 'All',
     'filter_completed': 'Completed',
     'filter_upcoming': 'Upcoming',
     'view_table': 'Table',
     'view_kanban': 'Kanban',
     'view_calendar': 'Calendar',
     'view': 'View',
     'search': 'Search',
     'search_placeholder': 'Search client name or package...',
     'filter': 'Filter',
     'from': 'From',
     'to': 'To',
     'batch_trash': 'Move to Trash',
     'export': 'Export',
     'phone': 'Phone',
     'enter_client_name': 'Enter client name',
     'enter_phone': 'Enter phone number',
     'enter_package_name': 'Enter package name',
     'deal_by': 'Deal By',
     'enter_deal_by': 'Select deal by',
     'booking_details': 'Booking Details',
     'edit': 'Edit',
     'edit_booking': 'Edit Booking',
     'close': 'Close',
     'prev': 'Previous',
     'next': 'Next',
     'page': 'Page',
     'bookings': 'bookings',
     'no_bookings_message': 'No bookings found. Try changing filters or add a new booking.'
  }
};

// Function to get translation
export function t(key) {
  const current = currentLanguage.get();
  return translations[current]?.[key] || key;
}

// Function to toggle language
export function toggleLanguage() {
  const current = currentLanguage.get();
  currentLanguage.set(current === 'ms' ? 'en' : 'ms');
} 
<script>
  import { onMount } from 'svelte';
  import { currentLanguage, translations } from '../../lib/stores/language.js';
  import { getBookings, createBooking, updateBooking, deleteBooking, getContacts, getEmployees, getPricePackages } from '../../lib/supabase.js';
  import { Trash2, BarChart3, Table, ClipboardList, Calendar, Eye, Edit, CheckCircle, AlertTriangle, Download, RefreshCw } from 'lucide-svelte';

  $: language = $currentLanguage;
  $: currentTranslations = translations[language] || translations.ms;

  function t(key) {
    return currentTranslations[key] || key;
  }

  // State variables
  let loading = true;
  let error = null;
  let contacts = [];
  let employees = [];
  let pricePackages = [];

  let bookings = [];

  let showForm = false;
  let showViewModal = false;
  let showEditModal = false;
  let showDeleteConfirm = false;
  let showCalendarDayModal = false;
  let selectedBooking = null;
  let selectedCalendarDay = null;
  let selectedFilter = 'all';
  let startDate = '';
  let endDate = '';
  let viewMode = 'table';
  let searchTerm = '';
  let sortOrder = 'asc';
  let page = 1;
  let perPage = 5;
  let selectedIds = {};
  let allSelected = false;
  let showToast = false;
  let toastMessage = '';
  let toastType = 'success'; // 'success', 'error', 'warning'
  let draggedBooking = null;
  let dragOverColumn = null;
  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();
  let isSubmitting = false;
  let isRefreshing = false;

  let formData = {
    contact_id: '',
    employee_id: '',
    date: '',
    package_name: '',
    total_price: '',
    status: 'Akan Datang'
  };

  // Load data on component mount
  onMount(async () => {
    await loadData();
    setupKeyboardShortcuts();
  });

  function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + N untuk tambah booking baru
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        if (!showForm) showForm = true;
      }
      
      // Ctrl/Cmd + R untuk refresh
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        loadData();
      }
      
      // Escape untuk tutup modal
      if (e.key === 'Escape') {
        if (showForm) showForm = false;
        if (showViewModal) showViewModal = false;
        if (showEditModal) showEditModal = false;
        if (showDeleteConfirm) showDeleteConfirm = false;
      }
    });
  }

  async function loadData() {
    try {
      loading = true;
      error = null;
      
      // Load all data in parallel
      const [bookingsData, contactsData, employeesData, packagesData] = await Promise.all([
        getBookings(),
        getContacts(),
        getEmployees(),
        getPricePackages()
      ]);
      
      bookings = bookingsData;
      contacts = contactsData;
      employees = employeesData;
      pricePackages = packagesData;
    } catch (err) {
      error = 'Gagal memuat data. Silakan coba lagi.';
      console.error('Error loading data:', err);
    } finally {
      loading = false;
    }
  }

  async function refreshData() {
    isRefreshing = true;
    await loadData();
    isRefreshing = false;
    showToastMessage('Data berhasil diperbarui', 'success');
  }

  function showToastMessage(message, type = 'success') {
    toastMessage = message;
    toastType = type;
    showToast = true;
    setTimeout(() => showToast = false, 3000);
  }

  $: filteredBookings = !loading ? getFilteredBookings() : [];
  $: kanbanColumns = !loading ? getKanbanColumns() : {'Akan Datang': [], 'Sedang Berlangsung': [], 'Selesai': []};
  $: calendarData = !loading ? getCalendarData() : [];
  $: totalPages = Math.ceil(filteredBookings.length / perPage);
  $: pagedBookings = filteredBookings.slice((page - 1) * perPage, page * perPage);

  function getFilteredBookings() {
    // Pastikan bookings sudah dimuat
    if (!bookings || bookings.length === 0) {
      return [];
    }
    
    let filtered = bookings.filter(b => {
      // Jika tidak ada search term, tampilkan semua
      if (!searchTerm.trim()) return true;
      
      const contactName = b.contact?.name || '';
      const packageName = b.package_name || '';
      return (contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
              packageName.toLowerCase().includes(searchTerm.toLowerCase()));
    });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedFilter === 'upcoming') {
      filtered = filtered.filter(b => new Date(b.date) > today);
    } else if (selectedFilter === 'past') {
      filtered = filtered.filter(b => new Date(b.date) < today);
    }
    
    if (startDate || endDate) {
      filtered = filtered.filter(b => {
        const d = new Date(b.date);
        const start = startDate ? new Date(startDate) : new Date('1900-01-01');
        const end = endDate ? new Date(endDate) : new Date('2100-12-31');
        return d >= start && d <= end;
      });
    }
    
    return filtered.sort((a, b) =>
      sortOrder === 'asc' ? 
      new Date(a.date) - new Date(b.date) : 
      new Date(b.date) - new Date(a.date)
    );
  }

  function getKanbanColumns() {
    // Pastikan data sudah dimuat sebelum memproses
    if (!filteredBookings || filteredBookings.length === 0) {
      return {
        'Akan Datang': [],
        'Sedang Berlangsung': [],
        'Selesai': []
      };
    }
    
    return {
      'Akan Datang': filteredBookings.filter(b => (b.status || 'Akan Datang') === 'Akan Datang'),
      'Sedang Berlangsung': filteredBookings.filter(b => (b.status || 'Akan Datang') === 'Sedang Berlangsung'),
      'Selesai': filteredBookings.filter(b => (b.status || 'Akan Datang') === 'Selesai')
    };
  }

  function getCalendarData() {
    // Pastikan data sudah dimuat sebelum memproses
    if (!filteredBookings || filteredBookings.length === 0) {
      return [];
    }
    
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const calendar = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= lastDay || calendar.length < 42) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayBookings = filteredBookings.filter(b => b.date === dateStr);
      
      calendar.push({
        date: new Date(currentDate),
        dateStr,
        isCurrentMonth: currentDate.getMonth() === currentMonth,
        isToday: dateStr === new Date().toISOString().split('T')[0],
        bookings: dayBookings
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return calendar;
  }

  function changeMonth(delta) {
    const newDate = new Date(currentYear, currentMonth + delta, 1);
    currentMonth = newDate.getMonth();
    currentYear = newDate.getFullYear();
  }

  async function addBooking() {
    if (formData.contact_id && formData.date && formData.package_name && formData.total_price) {
      try {
        isSubmitting = true;
        const bookingData = {
          contact_id: formData.contact_id,
          employee_id: formData.employee_id || null,
          date: formData.date,
          package_name: formData.package_name,
          total_price: parseFloat(formData.total_price),
          status: formData.status || 'Akan Datang'
        };
        
        const newBooking = await createBooking(bookingData);
        bookings = [newBooking, ...bookings];
        
        // Reset form
        formData = { 
          contact_id: '', 
          employee_id: '', 
          date: '', 
          package_name: '', 
          total_price: '',
          status: 'Akan Datang'
        };
        showForm = false;
        showToastMessage('Booking berhasil ditambah', 'success');
      } catch (err) {
        error = 'Gagal menambah booking. Silakan coba lagi.';
        console.error('Error adding booking:', err);
        showToastMessage('Gagal menambah booking', 'error');
      } finally {
        isSubmitting = false;
      }
    }
  }

  async function deleteBookingHandler(id) {
    try {
      await deleteBooking(id);
      bookings = bookings.filter(b => b.id !== id);
      selectedIds = { ...selectedIds, [id]: false };
      showToastMessage('Booking berhasil dihapus', 'success');
    } catch (err) {
      error = 'Gagal menghapus booking. Silakan coba lagi.';
      console.error('Error deleting booking:', err);
    }
  }

  function confirmDelete(booking) {
    selectedBooking = booking;
    showDeleteConfirm = true;
  }

  async function confirmDeleteHandler() {
    if (selectedBooking && selectedBooking.id) {
      try {
        isSubmitting = true;
        await deleteBooking(selectedBooking.id);
        bookings = bookings.filter(b => b.id !== selectedBooking.id);
        selectedIds = { ...selectedIds, [selectedBooking.id]: false };
        showDeleteConfirm = false;
        selectedBooking = null;
        showToastMessage('Booking berhasil dihapus', 'success');
      } catch (err) {
        error = 'Gagal menghapus booking. Silakan coba lagi.';
        console.error('Error deleting booking:', err);
      } finally {
        isSubmitting = false;
      }
    }
  }

  function batchMoveToTrash() {
    bookings = bookings.map(b => selectedIds[b.id] ? { ...b, status: 'trashed' } : b);
    selectedIds = {};
    allSelected = false;
  }

  function toggleSelectBooking(id) {
    selectedIds = { ...selectedIds, [id]: !selectedIds[id] };
    allSelected = pagedBookings.every(b => selectedIds[b.id]);
  }

  function toggleSelectAll() {
    allSelected = !allSelected;
    pagedBookings.forEach(b => selectedIds = { ...selectedIds, [b.id]: allSelected });
  }

  function openViewModal(booking) {
    selectedBooking = booking;
    showViewModal = true;
  }

  function openEditModal(booking) {
    selectedBooking = { ...booking };
    showEditModal = true;
  }

  function openCalendarDayModal(day) {
    selectedCalendarDay = day;
    showCalendarDayModal = true;
  }

  async function saveEditBooking() {
    try {
      isSubmitting = true;
      const updatedData = {
        contact_id: selectedBooking.contact_id,
        employee_id: selectedBooking.employee_id || null,
        date: selectedBooking.date,
        package_name: selectedBooking.package_name,
        total_price: parseFloat(selectedBooking.total_price),
        status: selectedBooking.status || 'Akan Datang'
      };
      
      const updatedBooking = await updateBooking(selectedBooking.id, updatedData);
      bookings = bookings.map(b => b.id === selectedBooking.id ? updatedBooking : b);
      showEditModal = false;
      showToastMessage('Booking berhasil diperbarui', 'success');
    } catch (err) {
      error = 'Gagal memperbarui booking. Silakan coba lagi.';
      console.error('Error updating booking:', err);
      showToastMessage('Gagal memperbarui booking', 'error');
    } finally {
      isSubmitting = false;
    }
  }

  function sortByDate() {
    sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
  }

  function nextPage() {
    if (page < totalPages) page++;
  }

  function prevPage() {
    if (page > 1) page--;
  }

  function exportBookings() {
    try {
      const exportData = filteredBookings.map(booking => ({
        'Nama Pelanggan': booking.contact?.name || 'N/A',
        'Telefon': booking.contact?.whatsapp || 'N/A',
        'Email': booking.contact?.email || 'N/A',
        'Tarikh': formatDate(booking.date),
        'Pakej': booking.package_name,
        'Pekerja': booking.employee?.name || 'Tidak ditentukan',
        'Jumlah': formatCurrency(booking.total_price),
        'Status': getStatusText(booking.status)
      }));

      // Convert to CSV
      const headers = Object.keys(exportData[0]);
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => headers.map(header => `"${row[header]}"`).join(','))
      ].join('\n');

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `booking_data_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToastMessage('Data berhasil diexport ke CSV', 'success');
    } catch (err) {
      console.error('Error exporting data:', err);
      showToastMessage('Gagal mengexport data', 'error');
    }
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ms-MY', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  function formatCurrency(amount) {
    return `RM${parseFloat(amount).toLocaleString('ms-MY', { minimumFractionDigits: 2 })}`;
  }

  function getStatusColor(status) {
    switch(status) {
      case 'Akan Datang':
        return '#f59e0b'; // Orange
      case 'Sedang Berlangsung':
        return '#3b82f6'; // Blue
      case 'Selesai':
        return '#22c55e'; // Green
      default:
        return '#6b7280'; // Gray (fallback)
    }
  }

  function getStatusText(status) {
    return status || 'Akan Datang';
  }

  function handleDragStart(event, booking) {
    if (!booking || !booking.id) {
      console.error('Invalid booking for drag start:', booking);
      return;
    }
    draggedBooking = booking;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/html', event.target.outerHTML);
  }

  function handleDragOver(event, columnType) {
    event.preventDefault();
    dragOverColumn = columnType;
  }

  function handleDragEnter(event) {
    event.preventDefault();
  }

  async function handleDrop(event, targetColumn) {
    event.preventDefault();
    
    // Simpan referensi booking di awal untuk menghindari race condition
    const currentDraggedBooking = draggedBooking;
    
    // Reset drag state immediately to prevent multiple calls
    draggedBooking = null;
    dragOverColumn = null;
    
    if (currentDraggedBooking && currentDraggedBooking.id && targetColumn) {
      try {
        // Update status di database
        const updatedBooking = await updateBooking(currentDraggedBooking.id, { 
          status: targetColumn 
        });
        
        // Pastikan updatedBooking valid
        if (!updatedBooking || !updatedBooking.id) {
          console.error('Invalid response from updateBooking:', updatedBooking);
          throw new Error('Invalid response from database');
        }
        
        // Update local state using saved reference
        bookings = bookings.map(booking => {
          if (booking && booking.id === currentDraggedBooking.id) {
            return updatedBooking;
          }
          return booking;
        });
        
        // Clear any existing error
        error = null;
        
        toastMessage = `Status booking diubah ke: ${targetColumn}`;
        showToast = true;
        setTimeout(() => showToast = false, 3000);
        
      } catch (err) {
        console.error('Error updating booking status:', err);
        error = 'Gagal mengubah status booking. Silakan coba lagi.';
        
        // Refresh data untuk memastikan state konsisten
        setTimeout(() => {
          loadData();
          error = null; // Clear error after reload
        }, 1000);
      }
    }
  }

  function handleDragEnd() {
    draggedBooking = null;
    dragOverColumn = null;
  }
</script>

<div class="min-h-[calc(100vh-100px)] mt-10 w-full max-w-none p-0">
  <div class="flex justify-between items-center mb-8 px-5 max-w-6xl mx-auto">
    <div>
      <h1 class="text-3xl font-semibold text-gray-200">{t('booking_manager_title')}</h1>
      {#if !loading && bookings.length > 0}
        <div class="flex items-center gap-4 mt-2 text-sm text-gray-400">
          <span class="flex items-center gap-1">
            <div class="w-2 h-2 bg-orange-500 rounded-full"></div>
            {bookings.filter(b => b.status === 'Akan Datang').length} Akan Datang
          </span>
          <span class="flex items-center gap-1">
            <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
            {bookings.filter(b => b.status === 'Sedang Berlangsung').length} Sedang Berlangsung
          </span>
          <span class="flex items-center gap-1">
            <div class="w-2 h-2 bg-green-500 rounded-full"></div>
            {bookings.filter(b => b.status === 'Selesai').length} Selesai
          </span>
        </div>
      {/if}
    </div>
    <button class="bg-green-500 text-white border-none px-6 py-3 rounded-md text-sm font-medium hover:bg-green-600 transition-colors" on:click={() => showForm = true}>
      + {t('add_new_booking')}
    </button>
  </div>

  <div class="mb-8 px-5 max-w-6xl mx-auto">
    <!-- Keyboard Shortcuts Info -->
    <div class="bg-gray-800 border border-gray-600 rounded-lg p-3 mb-4">
      <div class="flex items-center gap-2 text-sm text-gray-300">
        <span class="font-medium">⌨️ Keyboard Shortcuts:</span>
        <span class="bg-gray-700 px-2 py-1 rounded text-xs">Ctrl+N</span>
        <span class="text-gray-400">Tambah Booking</span>
        <span class="bg-gray-700 px-2 py-1 rounded text-xs">Ctrl+R</span>
        <span class="text-gray-400">Refresh Data</span>
        <span class="bg-gray-700 px-2 py-1 rounded text-xs">Esc</span>
        <span class="text-gray-400">Tutup Modal</span>
      </div>
    </div>
    
    <div class="flex flex-wrap gap-5 items-end mb-5 bg-gray-900 p-5 rounded-lg border border-gray-700">
      <div class="flex flex-col gap-1 min-w-[150px]">
        <label for="filter" class="text-sm font-medium text-gray-200">{t('filter')}:</label>
        <select id="filter" bind:value={selectedFilter} class="bg-gray-950 border border-gray-700 rounded-md px-3 py-2 text-gray-200 text-sm h-[34px]">
          <option value="all">{t('filter_all')}</option>
          <option value="upcoming">{t('filter_upcoming')}</option>
          <option value="past">{t('filter_completed')}</option>
        </select>
      </div>
      <div class="flex flex-wrap gap-4">
        <div class="flex flex-col gap-1 min-w-[150px]">
          <label for="startDate" class="text-sm font-medium text-gray-200">{t('from')}:</label>
          <input type="date" id="startDate" bind:value={startDate} class="bg-gray-950 border border-gray-700 rounded-md px-3 py-2 text-gray-200 text-sm h-[34px]" />
        </div>
        <div class="flex flex-col gap-1 min-w-[150px]">
          <label for="endDate" class="text-sm font-medium text-gray-200">{t('to')}:</label>
          <input type="date" id="endDate" bind:value={endDate} class="bg-gray-950 border border-gray-700 rounded-md px-3 py-2 text-gray-200 text-sm h-[34px]" />
        </div>
      </div>
      <div class="flex flex-col gap-1 min-w-[200px] flex-1">
        <label for="search" class="text-sm font-medium text-gray-200">{t('search')}:</label>
        <input type="text" id="search" placeholder={t('search_placeholder')} bind:value={searchTerm} class="bg-gray-950 border border-gray-700 rounded-md px-3 py-2 text-gray-200 text-sm h-[34px]" />
      </div>
      <div class="flex gap-2 items-center h-[34px]">
        <label class="sr-only">Actions</label>
        <button class="bg-blue-500 text-white border-none px-4 py-2 rounded-md text-sm hover:bg-blue-600 transition-colors h-[34px] flex items-center gap-1" on:click={batchMoveToTrash} disabled={Object.values(selectedIds).filter(Boolean).length === 0}>
          <Trash2 size={16} />
          {t('batch_trash')}
        </button>
        <button class="bg-blue-500 text-white border-none px-4 py-2 rounded-md text-sm hover:bg-blue-600 transition-colors h-[34px] flex items-center gap-1" on:click={exportBookings}>
          <Download size={16} />
          {t('export')}
        </button>
        <button class="bg-green-500 text-white border-none px-4 py-2 rounded-md text-sm hover:bg-green-600 transition-colors h-[34px] flex items-center gap-1" on:click={refreshData} disabled={isRefreshing}>
          <RefreshCw size={16} class={isRefreshing ? 'animate-spin' : ''} />
          {isRefreshing ? 'Memuat...' : 'Refresh'}
        </button>
      </div>
    </div>

    <div class="flex items-center gap-4">
      <span class="text-sm font-medium text-gray-200">{t('view')}:</span>
      <div class="inline-flex bg-gray-900 border border-gray-700 rounded-lg overflow-hidden" role="group" aria-label="Tukar tampilan">
        <button
          type="button"
          class="flex items-center gap-1.5 px-3 py-2 bg-transparent border-none text-gray-200 cursor-pointer hover:bg-gray-800 {viewMode === 'table' ? 'bg-gray-800 text-green-500' : ''}"
          on:click={() => viewMode = 'table'}
          aria-pressed={viewMode === 'table'}
          title="Tampilan Senarai"
        >
          <Table size={16} />
          Senarai
        </button>
        <button
          type="button"
          class="flex items-center gap-1.5 px-3 py-2 bg-transparent border-none text-gray-200 cursor-pointer hover:bg-gray-800 {viewMode === 'kanban' ? 'bg-gray-800 text-green-500' : ''}"
          on:click={() => viewMode = 'kanban'}
          aria-pressed={viewMode === 'kanban'}
          title="Tampilan Kanban"
        >
          <ClipboardList size={16} />
          Kanban
        </button>
        <button
          type="button"
          class="flex items-center gap-1.5 px-3 py-2 bg-transparent border-none text-gray-200 cursor-pointer hover:bg-gray-800 {viewMode === 'calendar' ? 'bg-gray-800 text-green-500' : ''}"
          on:click={() => viewMode = 'calendar'}
          aria-pressed={viewMode === 'calendar'}
          title="Tampilan Kalendar"
        >
          <Calendar size={16} />
          Kalendar
        </button>
      </div>
      {#if viewMode === 'kanban'}
        <div class="text-xs text-gray-400 mt-2 text-center px-2 py-2 bg-gray-950 rounded border border-gray-700">{t('drag_drop_instruction')}</div>
      {/if}
    </div>
  </div>

  {#if showForm}
    <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]" on:click={() => showForm = false}>
      <div class="bg-gray-900 rounded-xl p-8 w-11/12 max-w-2xl border border-gray-700 shadow-2xl" on:click|stopPropagation>
        <div class="flex justify-between items-center mb-8">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Calendar size={20} class="text-green-500" />
            </div>
            <h2 class="text-2xl font-bold text-gray-200">{t('add_new_booking')}</h2>
          </div>
          <button class="bg-gray-800 hover:bg-gray-700 border-none text-gray-400 text-2xl cursor-pointer w-10 h-10 flex items-center justify-center hover:text-gray-200 rounded-full transition-all" on:click={() => showForm = false}>×</button>
        </div>
        
        <form class="grid grid-cols-1 md:grid-cols-2 gap-6" on:submit|preventDefault={addBooking}>
          <!-- Client Information Section -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
              <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
              Maklumat Pelanggan
            </h3>
            
            <div class="space-y-3">
              <div class="flex flex-col gap-2">
                <label for="contact_id" class="text-sm font-medium text-gray-200 flex items-center gap-2">
                  <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
                  {t('client_name')}
                </label>
                <select id="contact_id" bind:value={formData.contact_id} required class="bg-gray-950 border border-gray-600 rounded-lg px-4 py-3.5 text-gray-200 text-sm cursor-pointer focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all">
                  <option value="">Pilih Kontak</option>
                  {#each contacts as contact}
                    <option value={contact.id}>{contact.name}</option>
                  {/each}
                </select>
              </div>
              
              <div class="flex flex-col gap-2">
                <label for="employee_id" class="text-sm font-medium text-gray-200 flex items-center gap-2">
                  <span class="w-2 h-2 bg-purple-500 rounded-full"></span>
                  {t('employee')} <span class="text-xs text-gray-400">(Opsional)</span>
                </label>
                <select id="employee_id" bind:value={formData.employee_id} class="bg-gray-800 border border-gray-600 rounded-lg px-4 py-3.5 text-gray-200 text-sm cursor-pointer focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all">
                  <option value="">Pilih Pekerja</option>
                  {#each employees as employee}
                    <option value={employee.id}>{employee.name}</option>
                  {/each}
                </select>
              </div>
            </div>
          </div>

          <!-- Booking Details Section -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
              <span class="w-2 h-2 bg-green-500 rounded-full"></span>
              Butiran Tempahan
            </h3>
            
            <div class="space-y-3">
              <div class="flex flex-col gap-2">
                <label for="date" class="text-sm font-medium text-gray-200 flex items-center gap-2">
                  <Calendar size={18} class="text-white" />
                  {t('date')}
                </label>
                <input type="date" id="date" bind:value={formData.date} required class="bg-gray-950 border border-gray-600 rounded-lg px-4 py-3.5 text-gray-200 text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all" />
              </div>
              
              <div class="flex flex-col gap-2">
                <label for="package_name" class="text-sm font-medium text-gray-200 flex items-center gap-2">
                  <span class="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  {t('package_name')}
                </label>
                <select id="package_name" bind:value={formData.package_name} required class="bg-gray-950 border border-gray-600 rounded-lg px-4 py-3.5 text-gray-200 text-sm cursor-pointer focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all">
                  <option value="">Pilih Pakej</option>
                  {#each pricePackages as pkg}
                    <option value={pkg.pakej}>{pkg.pakej} - RM{pkg.harga}</option>
                  {/each}
                </select>
              </div>
              
              <div class="flex flex-col gap-2">
                <label for="total_price" class="text-sm font-medium text-gray-200 flex items-center gap-2">
                  <span class="w-2 h-2 bg-red-500 rounded-full"></span>
                  {t('amount')} <span class="text-xs text-gray-400">(RM)</span>
                </label>
                <input type="number" id="total_price" bind:value={formData.total_price} step="0.01" placeholder="0.00" required class="bg-gray-950 border border-gray-600 rounded-lg px-4 py-3.5 text-gray-200 text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all" />
              </div>
              
              <div class="flex flex-col gap-2">
                <label for="status" class="text-sm font-medium text-gray-200 flex items-center gap-2">
                  <span class="w-2 h-2 bg-indigo-500 rounded-full"></span>
                  Status
                </label>
                <select id="status" bind:value={formData.status} required class="bg-gray-950 border border-gray-600 rounded-lg px-4 py-3.5 text-gray-200 text-sm cursor-pointer focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all">
                  <option value="Akan Datang">Akan Datang</option>
                  <option value="Sedang Berlangsung">Sedang Berlangsung</option>
                  <option value="Selesai">Selesai</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="md:col-span-2 flex gap-4 justify-end pt-6 border-t border-gray-700">
            <button type="button" class="bg-gray-800 hover:bg-gray-700 border border-gray-600 text-gray-300 px-8 py-3.5 rounded-lg text-sm font-medium hover:text-white transition-all" on:click={() => showForm = false}>
              {t('cancel')}
            </button>
            <button type="submit" class="bg-green-500 hover:bg-green-600 text-white border-none px-8 py-3.5 rounded-lg text-sm font-medium shadow-lg hover:shadow-xl transition-all" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}

  {#if showViewModal}
    <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]" on:click={() => showViewModal = false}>
      <div class="bg-gray-900 rounded-lg p-8 w-11/12 max-w-lg border border-gray-700" on:click|stopPropagation>
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl text-gray-200">{t('booking_details')}</h2>
          <button class="bg-none border-none text-gray-400 text-2xl cursor-pointer w-8 h-8 flex items-center justify-center hover:text-gray-200" on:click={() => showViewModal = false}>×</button>
        </div>
        <div class="flex flex-col gap-5">
          <div class="flex justify-between items-center py-3 border-b border-gray-700">
            <span class="font-semibold text-gray-400 min-w-[120px]">{t('client_name')}:</span>
            <span class="text-gray-200 text-right flex-1 ml-4">{selectedBooking.contact?.name || 'N/A'}</span>
          </div>
          <div class="flex justify-between items-center py-3 border-b border-gray-700">
            <span class="font-semibold text-gray-400 min-w-[120px]">{t('phone')}:</span>
            <span class="text-gray-200 text-right flex-1 ml-4">
              {selectedBooking.contact?.whatsapp || 'N/A'}
              {#if selectedBooking.contact?.whatsapp}
                <a href={`https://wa.me/${selectedBooking.contact.whatsapp.replace(/[^0-9]/g,'')}`} target="_blank" class="inline-flex items-center gap-1 ml-2 opacity-80 hover:opacity-100 transition-opacity">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" width="18" alt="WA" />
                </a>
              {/if}
            </span>
          </div>
          {#if selectedBooking.contact?.email}
            <div class="flex justify-between items-center py-3 border-b border-gray-700">
              <span class="font-semibold text-gray-400 min-w-[120px]">Email:</span>
              <span class="text-gray-200 text-right flex-1 ml-4">{selectedBooking.contact.email}</span>
            </div>
          {/if}
          <div class="flex justify-between items-center py-3 border-b border-gray-700">
            <span class="font-semibold text-gray-400 min-w-[120px]">{t('date')}:</span>
            <span class="text-gray-200 text-right flex-1 ml-4">{formatDate(selectedBooking.date)}</span>
          </div>
          <div class="flex justify-between items-center py-3 border-b border-gray-700">
            <span class="font-semibold text-gray-400 min-w-[120px]">{t('package_name')}:</span>
            <span class="text-gray-200 text-right flex-1 ml-4">{selectedBooking.package_name}</span>
          </div>
          <div class="flex justify-between items-center py-3 border-b border-gray-700">
            <span class="font-semibold text-gray-400 min-w-[120px]">{t('amount')}:</span>
            <span class="text-gray-200 text-right flex-1 ml-4">{formatCurrency(selectedBooking.total_price)}</span>
          </div>
          <div class="flex justify-between items-center py-3 border-b border-gray-700">
            <span class="font-semibold text-gray-400 min-w-[120px]">{t('employee')}:</span>
            <span class="text-gray-200 text-right flex-1 ml-4">{selectedBooking.employee?.name || 'Tidak ditentukan'}</span>
          </div>
          <div class="flex justify-between items-center py-3">
            <span class="font-semibold text-gray-400 min-w-[120px]">Status:</span>
            <span class="text-gray-200 text-right flex-1 ml-4">
              <span class="px-2 py-1 rounded text-xs font-medium text-white" style="background-color: {getStatusColor(selectedBooking.status)}">
                {selectedBooking.status || 'Akan Datang'}
              </span>
            </span>
          </div>
          <div class="flex gap-3 justify-end mt-2.5">
            <button class="bg-green-500 text-white border-none px-6 py-3 rounded-md text-sm font-medium hover:bg-green-600 transition-colors" on:click={() => { showViewModal = false; openEditModal(selectedBooking); }}>{t('edit')}</button>
            <button class="bg-none border border-gray-700 text-gray-400 px-6 py-3 rounded-md text-sm hover:border-green-500 hover:text-green-500 transition-colors" on:click={() => showViewModal = false}>{t('close')}</button>
          </div>
        </div>
      </div>
    </div>
  {/if}

  {#if showEditModal}
    <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]" on:click={() => showEditModal = false}>
      <div class="bg-gray-900 rounded-lg p-8 w-11/12 max-w-lg border border-gray-700" on:click|stopPropagation>
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl text-gray-200">{t('edit_booking')}</h2>
          <button class="bg-none border-none text-gray-400 text-2xl cursor-pointer w-8 h-8 flex items-center justify-center hover:text-gray-200" on:click={() => showEditModal = false}>×</button>
        </div>
        <form class="flex flex-col gap-5" on:submit|preventDefault={saveEditBooking}>
          <div class="flex flex-col gap-2">
            <label for="editContactId" class="text-sm font-medium text-gray-200">{t('client_name')}</label>
            <select id="editContactId" bind:value={selectedBooking.contact_id} required class="bg-gray-950 border border-gray-700 rounded-md px-3 py-3 text-gray-200 text-sm cursor-pointer focus:outline-none focus:border-green-500 transition-colors">
              <option value="">{t('choose_contact')}</option>
              {#each contacts as contact}
                <option value={contact.id}>{contact.name}</option>
              {/each}
            </select>
          </div>
          <div class="flex flex-col gap-2">
            <label for="editEmployeeId" class="text-sm font-medium text-gray-200">{t('employee')} (Opsional)</label>
            <select id="editEmployeeId" bind:value={selectedBooking.employee_id} class="bg-gray-950 border border-gray-700 rounded-md px-3 py-3 text-gray-200 text-sm cursor-pointer focus:outline-none focus:border-green-500 transition-colors">
              <option value="">{t('choose_employee')}</option>
              {#each employees as employee}
                <option value={employee.id}>{employee.name}</option>
              {/each}
            </select>
          </div>
          <div class="flex flex-col gap-2">
            <label for="editDate" class="text-sm font-medium text-gray-200">{t('date')}</label>
            <input type="date" id="editDate" bind:value={selectedBooking.date} required class="bg-gray-950 border border-gray-700 rounded-md px-3 py-3 text-gray-200 text-sm focus:outline-none focus:border-green-500 transition-colors" />
          </div>
          <div class="flex flex-col gap-2">
            <label for="editPackageName" class="text-sm font-medium text-gray-200">{t('package_name')}</label>
            <select id="editPackageName" bind:value={selectedBooking.package_name} required class="bg-gray-950 border border-gray-700 rounded-md px-3 py-3 text-gray-200 text-sm cursor-pointer focus:outline-none focus:border-green-500 transition-colors">
              <option value="">{t('choose_package')}</option>
              {#each pricePackages as pkg}
                <option value={pkg.pakej}>{pkg.pakej} - RM{pkg.harga}</option>
              {/each}
            </select>
          </div>
          <div class="flex flex-col gap-2">
            <label for="editAmount" class="text-sm font-medium text-gray-200">{t('amount')} (RM)</label>
            <input type="number" id="editAmount" bind:value={selectedBooking.total_price} step="0.01" placeholder="0.00" required class="bg-gray-950 border border-gray-700 rounded-md px-3 py-3 text-gray-200 text-sm focus:outline-none focus:border-green-500 transition-colors" />
          </div>
          <div class="flex flex-col gap-2">
            <label for="editStatus" class="text-sm font-medium text-gray-200">Status</label>
            <select id="editStatus" bind:value={selectedBooking.status} required class="bg-gray-950 border border-gray-700 rounded-md px-3 py-3 text-gray-200 text-sm cursor-pointer focus:outline-none focus:border-green-500 transition-colors">
              <option value="Akan Datang">Akan Datang</option>
              <option value="Sedang Berlangsung">Sedang Berlangsung</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>
          <div class="flex gap-3 justify-end mt-2.5">
            <button type="button" class="bg-none border border-gray-700 text-gray-400 px-6 py-3 rounded-md text-sm hover:border-green-500 hover:text-green-500 transition-colors" on:click={() => showEditModal = false}>{t('cancel')}</button>
            <button type="submit" class="bg-green-500 text-white border-none px-6 py-3 rounded-md text-sm font-medium hover:bg-green-600 transition-colors" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}

  {#if showDeleteConfirm}
    <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]" on:click={() => showDeleteConfirm = false}>
      <div class="bg-gray-900 rounded-lg p-8 w-11/12 max-w-md border border-gray-700" on:click|stopPropagation>
        <div class="flex items-center gap-3 mb-6">
          <div class="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
            <AlertTriangle size={24} class="text-red-500" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-200">Konfirmasi Hapus</h2>
            <p class="text-sm text-gray-400">Tindakan ini tidak dapat dibatalkan</p>
          </div>
        </div>
        
        <div class="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-600">
          <p class="text-gray-200 text-sm mb-2">Anda akan menghapus booking untuk:</p>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-400">Pelanggan:</span>
              <span class="text-gray-200 font-medium">{selectedBooking?.contact?.name || 'N/A'}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Tarikh:</span>
              <span class="text-gray-200 font-medium">{selectedBooking?.date ? formatDate(selectedBooking.date) : 'N/A'}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Pakej:</span>
              <span class="text-gray-200 font-medium">{selectedBooking?.package_name || 'N/A'}</span>
            </div>
          </div>
        </div>
        
        <div class="flex gap-3 justify-end">
          <button type="button" class="bg-gray-800 hover:bg-gray-700 border border-gray-600 text-gray-300 px-6 py-3 rounded-md text-sm font-medium hover:text-white transition-all" on:click={() => showDeleteConfirm = false}>
            Batal
          </button>
          <button type="button" class="bg-red-500 hover:bg-red-600 text-white border-none px-6 py-3 rounded-md text-sm font-medium transition-all" on:click={confirmDeleteHandler} disabled={isSubmitting}>
            {isSubmitting ? 'Menghapus...' : 'Hapus Booking'}
          </button>
        </div>
      </div>
    </div>
  {/if}

  {#if error}
    <div class="bg-red-600 text-white px-5 py-3 rounded-md mx-auto mb-5 max-w-6xl flex justify-between items-center">
      <p class="text-sm">{error}</p>
      <button class="bg-white/20 text-white border-none px-3 py-1.5 rounded text-xs hover:bg-white/30 transition-colors" on:click={loadData}>Coba Lagi</button>
    </div>
  {/if}

  <div class="px-5 max-w-6xl mx-auto">
    {#if loading}
      <div class="text-center py-16 text-gray-400">
        <div class="animate-spin w-8 h-8 border-4 border-gray-600 border-t-green-500 rounded-full mx-auto mb-4"></div>
        <p class="text-base">Memuat data booking...</p>
        <p class="text-sm text-gray-500 mt-2">Mohon tunggu sebentar</p>
      </div>
    {:else if bookings.length === 0}
      <div class="text-center py-16 text-gray-400">
        <Calendar size={32} class="mx-auto mb-5" />
        <h3 class="text-lg text-gray-200 mb-2.5">Tiada Booking Dijumpai</h3>
        <p class="text-sm">Belum ada booking dalam sistem. Klik "Tambah Booking Baru" untuk mula.</p>
        <button class="bg-green-500 text-white border-none px-6 py-3 rounded-md text-sm font-medium hover:bg-green-600 transition-colors mt-5" on:click={() => showForm = true}>
          + Tambah Booking Baru
        </button>
      </div>
    {:else if filteredBookings.length === 0 && !loading}
      <div class="text-center py-16 text-gray-400">
        <Calendar size={32} class="mx-auto mb-5" />
        {#if bookings.length === 0}
          <h3 class="text-lg text-gray-200 mb-2.5">Belum Ada Booking</h3>
          <p class="text-sm">Belum ada booking yang tersimpan di sistem.</p>
          <button class="bg-green-500 text-white border-none px-3 py-1.5 rounded text-xs hover:bg-green-600 transition-colors mt-2.5" on:click={() => showForm = true}>
            Tambah Booking Pertama
          </button>
        {:else}
          <h3 class="text-lg text-gray-200 mb-2.5">Tiada Booking Memenuhi Filter</h3>
          <p class="text-sm">Terdapat {bookings.length} booking di sistem, tetapi tiada yang memenuhi kriteria filter semasa.</p>
          <button class="bg-green-500 text-white border-none px-3 py-1.5 rounded text-xs hover:bg-green-600 transition-colors mt-2.5" on:click={() => { searchTerm = ''; selectedFilter = 'all'; startDate = ''; endDate = ''; }}>
            Reset Filter
          </button>
        {/if}
      </div>
    {:else}
      {#if viewMode === 'table'}
        <div class="overflow-x-auto bg-gray-900 rounded-lg border border-gray-700">
          <table class="w-full border-collapse">
            <thead>
              <tr>
                <th class="bg-gray-950 text-gray-200 px-3 py-4 text-left font-semibold text-sm border-b border-gray-700"><input type="checkbox" bind:checked={allSelected} on:change={toggleSelectAll} /></th>
                <th class="bg-gray-950 text-gray-200 px-3 py-4 text-left font-semibold text-sm border-b border-gray-700">{t('client_name')}</th>
                <th class="bg-gray-950 text-gray-200 px-3 py-4 text-left font-semibold text-sm border-b border-gray-700">{t('phone')}</th>
                <th on:click={sortByDate} class="bg-gray-950 text-gray-200 px-3 py-4 text-left font-semibold text-sm border-b border-gray-700 cursor-pointer">{t('date')} {sortOrder === 'asc' ? '↑' : '↓'}</th>
                <th class="bg-gray-950 text-gray-200 px-3 py-4 text-left font-semibold text-sm border-b border-gray-700">{t('package_name')}</th>
                <th class="bg-gray-950 text-gray-200 px-3 py-4 text-left font-semibold text-sm border-b border-gray-700">{t('employee')}</th>
                <th class="bg-gray-950 text-gray-200 px-3 py-4 text-left font-semibold text-sm border-b border-gray-700">{t('amount')}</th>
                <th class="bg-gray-950 text-gray-200 px-3 py-4 text-left font-semibold text-sm border-b border-gray-700">Status</th>
                <th class="bg-gray-950 text-gray-200 px-3 py-4 text-left font-semibold text-sm border-b border-gray-700">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {#each pagedBookings as booking (booking.id)}
                <tr class="hover:bg-gray-950">
                  <td class="px-3 py-4 border-b border-gray-700 text-gray-200"><input type="checkbox" bind:checked={selectedIds[booking.id]} on:change={() => toggleSelectBooking(booking.id)} /></td>
                  <td class="px-3 py-4 border-b border-gray-700 text-gray-200 font-semibold">{booking.contact?.name || 'N/A'}</td>
                  <td class="px-3 py-4 border-b border-gray-700 text-gray-200">
                    {#if booking.contact?.whatsapp}
                      <a href={`https://wa.me/${booking.contact.whatsapp.replace(/[^0-9]/g,'')}`} target="_blank" class="inline-flex items-center gap-1 text-gray-200 no-underline">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" width="18" alt="WA" />
                        {booking.contact.whatsapp}
                      </a>
                    {:else}
                      N/A
                    {/if}
                  </td>
                  <td class="px-3 py-4 border-b border-gray-700 text-gray-200">{formatDate(booking.date)}</td>
                  <td class="px-3 py-4 border-b border-gray-700 text-gray-200">{booking.package_name}</td>
                  <td class="px-3 py-4 border-b border-gray-700 text-gray-200">{booking.employee?.name || '-'}</td>
                  <td class="px-3 py-4 border-b border-gray-700 text-green-500 font-semibold">{formatCurrency(booking.total_price)}</td>
                  <td class="px-3 py-4 border-b border-gray-700 text-gray-200">
                    <span class="px-2 py-1 rounded text-xs font-medium text-white" style="background-color: {getStatusColor(booking.status)}">
                      {getStatusText(booking.status)}
                    </span>
                  </td>
                  <td class="px-3 py-4 border-b border-gray-700">
                    <button class="bg-none border-none text-gray-400 p-1 rounded text-lg hover:bg-white/10 transition-colors" on:click={() => openViewModal(booking)} title={t('view')}>
                      <Eye size={16} />
                    </button>
                    <button class="bg-none border-none text-gray-400 p-1 rounded text-lg hover:bg-white/10 transition-colors" on:click={() => openEditModal(booking)} title={t('edit')}>
                      <Edit size={16} />
                    </button>
                    <button class="bg-none border-none text-red-500 p-1 rounded text-lg hover:bg-red-500/10 transition-colors" on:click={() => confirmDelete(booking)} title={t('delete')}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
          <div class="flex items-center gap-2.5 p-4 justify-center">
            <button on:click={prevPage} disabled={page === 1} class="bg-blue-500 text-white border-none px-4 py-2 rounded-md text-sm hover:bg-blue-600 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">{t('prev')}</button>
            <span class="text-gray-200">{t('page')} {page} / {totalPages}</span>
            <button on:click={nextPage} disabled={page === totalPages} class="bg-blue-500 text-white border-none px-4 py-2 rounded-md text-sm hover:bg-blue-600 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">{t('next')}</button>
          </div>
        </div>
      {:else if viewMode === 'kanban'}
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
          {#each ['Akan Datang', 'Sedang Berlangsung', 'Selesai'] as column}
            <div 
              class="bg-gray-900 rounded-lg p-5 border border-gray-700 min-h-[400px] transition-all {dragOverColumn === column ? 'bg-gray-950 border-green-500 scale-102 shadow-inner' : ''}" 
              on:dragover={(e) => handleDragOver(e, column)}
              on:dragenter={handleDragEnter}
              on:drop={(e) => handleDrop(e, column)}
            >
              <h3 class="text-lg font-semibold text-gray-200 mb-2.5 flex items-center gap-1" style="color: {getStatusColor(column)}">
                <Calendar size={16} />
                {column}
              </h3>
              <div class="text-sm text-gray-400 mb-5">{kanbanColumns[column].length} booking</div>
              {#each kanbanColumns[column] as booking}
                <div 
                  class="bg-gray-950 border border-gray-700 rounded-md p-4 mb-4 hover:border-green-500 hover:-translate-y-0.5 hover:shadow-md transition-all cursor-grab active:cursor-grabbing" 
                  draggable="true"
                  on:dragstart={(e) => handleDragStart(e, booking)}
                  on:dragend={handleDragEnd}
                >
                  <div class="flex justify-between items-center mb-2.5 gap-2">
                    <div class="text-xs text-gray-600 cursor-grab select-none mr-2">⋮⋮</div>
                    <strong class="text-sm font-medium text-gray-200 flex-1">{booking.contact?.name || 'N/A'}</strong>
                    <button class="bg-none border-none text-red-500 text-lg cursor-pointer" on:click={() => deleteBookingHandler(booking.id)} title={t('delete')}>×</button>
                  </div>
                  <div class="flex flex-col gap-1.5 mb-2.5">
                    <div class="text-sm font-medium text-gray-200">{booking.package_name}</div>
                    <div class="text-xs text-gray-400">{formatDate(booking.date)}</div>
                    <div class="text-sm font-semibold text-green-500">{formatCurrency(booking.total_price)}</div>
                    <div class="text-xs text-gray-400">Employee: {booking.employee?.name || 'Tidak ditentukan'}</div>
                    <div class="text-xs text-gray-400">
                      {#if booking.contact?.whatsapp}
                        <a href={`https://wa.me/${booking.contact.whatsapp.replace(/[^0-9]/g,'')}`} target="_blank" class="inline-flex items-center gap-1 text-gray-400 no-underline">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" width="18" alt="WA" />
                          {booking.contact.whatsapp}
                        </a>
                      {:else}
                        N/A
                      {/if}
                    </div>
                  </div>
                  <div class="flex justify-end gap-1">
                    <button class="bg-none border-none text-gray-400 p-1 text-lg hover:bg-white/10 transition-colors" on:click={() => openViewModal(booking)} title={t('view')}>👁️</button>
                    <button class="bg-none border-none text-gray-400 p-1 text-lg hover:bg-white/10 transition-colors" on:click={() => openEditModal(booking)} title={t('edit')}>✏️</button>
                  </div>
                </div>
              {/each}
            </div>
          {/each}
        </div>
      {:else if viewMode === 'calendar'}
        <div class="bg-gray-900 rounded-xl p-6 mt-5 border border-gray-700 shadow-lg">
          <!-- Calendar Header -->
          <div class="flex items-center justify-between mb-6">
            <button class="bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600 px-4 py-2 rounded-lg text-lg hover:text-white transition-all" on:click={() => changeMonth(-1)}>
              <span class="text-xl">‹</span>
            </button>
            <h2 class="text-2xl font-bold text-gray-200">
              {new Date(currentYear, currentMonth).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
            </h2>
            <button class="bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600 px-4 py-2 rounded-lg text-lg hover:text-white transition-all" on:click={() => changeMonth(1)}>
              <span class="text-xl">›</span>
            </button>
          </div>
          
          <!-- Calendar Navigation -->
          <div class="flex items-center justify-center mb-4">
            <button class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all" on:click={() => changeMonth(0)}>
              Bulan Ini
            </button>
          </div>
          
          <div class="flex flex-col">
            <!-- Day Headers -->
            <div class="grid grid-cols-7 gap-1 mb-3">
              <div class="text-center text-sm font-bold text-gray-300 py-3 bg-gray-800 rounded-lg">Min</div>
              <div class="text-center text-sm font-bold text-gray-300 py-3 bg-gray-800 rounded-lg">Sen</div>
              <div class="text-center text-sm font-bold text-gray-300 py-3 bg-gray-800 rounded-lg">Sel</div>
              <div class="text-center text-sm font-bold text-gray-300 py-3 bg-gray-800 rounded-lg">Rab</div>
              <div class="text-center text-sm font-bold text-gray-300 py-3 bg-gray-800 rounded-lg">Kam</div>
              <div class="text-center text-sm font-bold text-gray-300 py-3 bg-gray-800 rounded-lg">Jum</div>
              <div class="text-center text-sm font-bold text-gray-300 py-3 bg-gray-800 rounded-lg">Sab</div>
            </div>
            
            <!-- Calendar Grid -->
            <div class="grid grid-cols-7 gap-1">
              {#each calendarData as day}
                <div 
                  class="min-h-[120px] p-2 relative transition-all duration-200 hover:scale-105 hover:shadow-lg {day.isCurrentMonth ? 'bg-gray-800 border border-gray-600' : 'bg-gray-950 border border-gray-800 text-gray-500'} {day.isToday ? 'bg-blue-900 border-blue-400 border-2' : ''} {day.bookings.length > 0 ? 'bg-green-900/30 border-green-500/50' : ''}"
                >
                  <!-- Date Number -->
                  <div class="text-sm font-bold text-gray-200 mb-2 flex items-center justify-between">
                    <span>{day.date.getDate()}</span>
                    {#if day.bookings.length > 0}
                      <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                    {/if}
                  </div>
                  
                  <!-- Bookings -->
                  {#if day.bookings.length > 0}
                    <div class="space-y-1">
                      {#each day.bookings.slice(0, 3) as booking}
                        <div class="bg-gradient-to-r from-green-500 to-green-600 text-white p-2 rounded-lg text-xs cursor-pointer hover:from-green-600 hover:to-green-700 transition-all shadow-md" on:click={() => openViewModal(booking)}>
                          <div class="font-bold mb-1 text-[10px] uppercase tracking-wide">{booking.contact?.name || 'N/A'}</div>
                          <div class="text-[9px] opacity-90">{booking.package_name}</div>
                          <div class="text-[8px] opacity-80 mt-1 flex items-center justify-between">
                            <span>RM {booking.total_price}</span>
                            <span class="px-1 py-0.5 bg-white/20 rounded text-[7px]">{booking.status}</span>
                          </div>
                        </div>
                      {/each}
                      {#if day.bookings.length > 3}
                        <div class="bg-gray-600 text-white px-2 py-1 rounded-lg text-[9px] text-center font-medium">
                          +{day.bookings.length - 3} lagi
                        </div>
                      {/if}
                    </div>
                  {:else}
                    <!-- Empty Day Indicator -->
                    <div class="text-[8px] text-gray-500 text-center mt-8">
                      Kosong
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          </div>
          
          <!-- Calendar Legend -->
          <div class="mt-6 pt-4 border-t border-gray-700">
            <div class="flex items-center justify-center gap-6 text-sm">
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 bg-blue-900 border-2 border-blue-400 rounded"></div>
                <span class="text-gray-300">Hari Ini</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                <span class="text-gray-300">Ada Tempahan</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 bg-gray-800 border border-gray-600 rounded"></div>
                <span class="text-gray-300">Bulan Ini</span>
              </div>
            </div>
          </div>
        </div>
      {/if}
    {/if}
  </div>

  {#if showToast}
    <div class="fixed top-5 right-5 z-[2000] animate-slideIn">
      <div class="px-4 py-3 rounded-md flex items-center gap-2 shadow-lg min-w-[300px] {toastType === 'success' ? 'bg-green-500 text-white' : toastType === 'error' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-white'}">
        {#if toastType === 'success'}
          <CheckCircle size={16} />
        {:else if toastType === 'error'}
          <AlertTriangle size={16} />
        {:else}
          <AlertTriangle size={16} />
        {/if}
        <span class="text-sm font-medium">{toastMessage}</span>
      </div>
    </div>
  {/if}
</div>

<style>
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .animate-spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  /* Custom date picker styling untuk tema hitam */
  input[type="date"]::-webkit-calendar-picker-indicator {
    background-color: #000000 !important;
    color: #ffffff !important;
    border-radius: 4px;
    padding: 4px;
    cursor: pointer;
    filter: invert(1);
  }

  input[type="date"]::-webkit-calendar-picker-indicator:hover {
    background-color: #333333 !important;
  }

  /* Untuk Firefox */
  input[type="date"]::-moz-calendar-picker-indicator {
    background-color: #000000 !important;
    color: #ffffff !important;
    border-radius: 4px;
    padding: 4px;
    cursor: pointer;
    filter: invert(1);
  }

  /* Untuk Edge */
  input[type="date"]::-ms-clear,
  input[type="date"]::-ms-expand {
    background-color: #000000 !important;
    color: #ffffff !important;
    border-radius: 4px;
    padding: 4px;
    cursor: pointer;
    filter: invert(1);
  }

  /* Styling untuk kalender dropdown */
  input[type="date"]::-webkit-datetime-edit {
    color: #e5e7eb !important;
  }

  input[type="date"]::-webkit-datetime-edit-fields-wrapper {
    color: #e5e7eb !important;
  }

  input[type="date"]::-webkit-datetime-edit-text {
    color: #e5e7eb !important;
  }

  input[type="date"]::-webkit-datetime-edit-month-field {
    color: #e5e7eb !important;
  }

  input[type="date"]::-webkit-datetime-edit-day-field {
    color: #e5e7eb !important;
  }

  input[type="date"]::-webkit-datetime-edit-year-field {
    color: #e5e7eb !important;
  }

  /* Kalender dropdown popup - tema hitam */
  input[type="date"]::-webkit-calendar-picker {
    background-color: #1f2937 !important;
    color: #ffffff !important;
    border: 1px solid #374151 !important;
    border-radius: 8px !important;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5) !important;
  }

  /* Styling untuk kalender popup */
  ::-webkit-calendar-picker {
    background-color: #1f2937 !important;
    color: #ffffff !important;
    border: 1px solid #374151 !important;
    border-radius: 8px !important;
  }

  /* Untuk Firefox calendar popup */
  ::-moz-calendar-picker {
    background-color: #1f2937 !important;
    color: #ffffff !important;
    border: 1px solid #374151 !important;
    border-radius: 8px !important;
  }

  /* Custom styling untuk kalender dropdown */
  input[type="date"]:focus::-webkit-calendar-picker-indicator {
    background-color: #000000 !important;
  }

  /* Override browser default calendar styling */
  input[type="date"]::-webkit-inner-spin-button,
  input[type="date"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Kalender popup styling */
  ::-webkit-calendar-picker-indicator {
    background-color: #000000 !important;
    color: #ffffff !important;
    border-radius: 4px !important;
    padding: 4px !important;
    cursor: pointer !important;
    filter: invert(1) !important;
  }

  /* Firefox calendar popup */
  ::-moz-calendar-picker-indicator {
    background-color: #000000 !important;
    color: #ffffff !important;
    border-radius: 4px !important;
    padding: 4px !important;
    cursor: pointer !important;
    filter: invert(1) !important;
  }

  /* Edge calendar popup */
  ::-ms-calendar-picker-indicator {
    background-color: #000000 !important;
    color: #ffffff !important;
    border-radius: 4px !important;
    padding: 4px !important;
    cursor: pointer !important;
    filter: invert(1) !important;
  }
</style>
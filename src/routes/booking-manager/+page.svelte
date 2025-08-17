<script>
  import { onMount, onDestroy, tick } from 'svelte';
  import { currentLanguage, translations } from '../../lib/stores/language.js';
  import { colors } from '../../lib/stores/colors.js';
  import { supabase, getBookings, createBooking, updateBooking, deleteBooking, deleteBookingsBulk, getContacts, getEmployees, getPricePackages } from '../../lib/supabase.js';
  import { Trash2, BarChart3, Table, ClipboardList, Calendar, Eye, Edit, CheckCircle, AlertTriangle, Download, RefreshCw, GripVertical } from 'lucide-svelte';
  import { DatePicker } from '$lib';

  $: language = $currentLanguage;
  $: currentTranslations = translations[language] || translations.ms;
  
  // Create reactive variables for all translated text to ensure immediate updates
  $: bookingManagerTitleText = currentTranslations['booking_manager_title'] || 'booking_manager_title';
  $: addNewBookingText = currentTranslations['add_new_booking'] || 'add_new_booking';
  $: clientNameText = currentTranslations['client_name'] || 'client_name';
  $: dateText = currentTranslations['date'] || 'date';
  $: packageNameText = currentTranslations['package_name'] || 'package_name';
  $: amountText = currentTranslations['amount'] || 'amount';
  $: statusText = currentTranslations['status'] || 'status';
  $: actionsText = currentTranslations['actions'] || 'actions';
  $: completedText = currentTranslations['completed'] || 'completed';
  $: upcomingText = currentTranslations['upcoming'] || 'upcoming';
  $: pastText = currentTranslations['past'] || 'past';
  $: todayText = currentTranslations['today'] || 'today';
  $: upcomingBookingsText = currentTranslations['upcoming_bookings'] || 'upcoming_bookings';
  $: dragDropInstructionText = currentTranslations['drag_drop_instruction'] || 'drag_drop_instruction';
  $: deleteText = currentTranslations['delete'] || 'delete';
  $: cancelText = currentTranslations['cancel'] || 'cancel';
  $: saveText = currentTranslations['save'] || 'save';
  $: filterAllText = currentTranslations['filter_all'] || 'filter_all';
  $: filterCompletedText = currentTranslations['filter_completed'] || 'filter_completed';
  $: filterUpcomingText = currentTranslations['filter_upcoming'] || 'filter_upcoming';
  $: viewTableText = currentTranslations['view_table'] || 'view_table';
  $: viewKanbanText = currentTranslations['view_kanban'] || 'view_kanban';
  $: viewCalendarText = currentTranslations['view_calendar'] || 'view_calendar';
  $: viewText = currentTranslations['view'] || 'view';
  $: searchText = currentTranslations['search'] || 'search';
  $: searchPlaceholderText = currentTranslations['search_placeholder'] || 'search_placeholder';
  $: filterText = currentTranslations['filter'] || 'filter';
  $: fromText = currentTranslations['from'] || 'from';
  $: toText = currentTranslations['to'] || 'to';
  $: batchTrashText = currentTranslations['batch_trash'] || 'batch_trash';
  $: exportText = currentTranslations['export'] || 'export';
  $: phoneText = currentTranslations['phone'] || 'phone';
  $: enterClientNameText = currentTranslations['enter_client_name'] || 'enter_client_name';
  $: enterPhoneText = currentTranslations['enter_phone'] || 'enter_phone';
  $: enterPackageNameText = currentTranslations['enter_package_name'] || 'enter_package_name';
  $: dealByText = currentTranslations['deal_by'] || 'deal_by';
  $: enterDealByText = currentTranslations['enter_deal_by'] || 'enter_deal_by';
  $: bookingDetailsText = currentTranslations['booking_details'] || 'booking_details';
  $: editText = currentTranslations['edit'] || 'edit';
  $: editBookingText = currentTranslations['edit_booking'] || 'edit_booking';
  $: closeText = currentTranslations['close'] || 'close';
  $: prevText = currentTranslations['prev'] || 'prev';
  $: nextText = currentTranslations['next'] || 'next';
  $: pageText = currentTranslations['page'] || 'page';
  $: bookingsText = currentTranslations['bookings'] || 'bookings';
  $: noBookingsMessageText = currentTranslations['no_bookings_message'] || 'no_bookings_message';
  $: chooseContactText = currentTranslations['choose_contact'] || 'choose_contact';
  $: chooseEmployeeText = currentTranslations['choose_employee'] || 'choose_employee';
  $: choosePackageText = currentTranslations['choose_package'] || 'choose_package';
  $: employeeText = currentTranslations['employee'] || 'employee';
  $: selectAllText = currentTranslations['select_all'] || 'select_all';
  $: selectedText = currentTranslations['selected'] || 'selected';
  $: deleteSelectedText = currentTranslations['delete_selected'] || 'delete_selected';
  $: chooseDateText = currentTranslations['choose_date'] || 'choose_date';
  $: loadingText = currentTranslations['loading'] || 'loading';
  $: refreshText = currentTranslations['refresh'] || 'refresh';
  $: statusBaruText = currentTranslations['status_baru'] || 'status_baru';
  $: dalamProsesText = currentTranslations['dalam_proses'] || 'dalam_proses';
  $: selesaiText = currentTranslations['selesai'] || 'selesai';
  $: keyboardShortcutsText = currentTranslations['keyboard_shortcuts'] || 'keyboard_shortcuts';
  $: tambahBookingText = currentTranslations['tambah_booking'] || 'tambah_booking';
  $: refreshDataText = currentTranslations['refresh_data'] || 'refresh_data';
  $: tutupModalText = currentTranslations['tutup_modal'] || 'tutup_modal';
  $: tukarTampilanText = currentTranslations['tukar_tampilan'] || 'tukar_tampilan';
  $: tampilanSenaraiText = currentTranslations['tampilan_senarai'] || 'tampilan_senarai';
  $: tampilanKanbanText = currentTranslations['tampilan_kanban'] || 'tampilan_kanban';
  $: tampilanKalendarText = currentTranslations['tampilan_kalendar'] || 'tampilan_kalendar';
  $: noBookingsInSystemText = currentTranslations['no_bookings_in_system'] || 'no_bookings_in_system';
  $: noBookingsTitleText = currentTranslations['no_bookings_title'] || 'no_bookings_title';
  $: noBookingsDescriptionText = currentTranslations['no_bookings_description'] || 'no_bookings_description';
  $: noBookingsFoundText = currentTranslations['no_bookings_found'] || 'no_bookings_found';
  $: addFirstBookingText = currentTranslations['add_first_booking'] || 'add_first_booking';
  $: statusChangedText = currentTranslations['status_changed'] || 'status_changed';
  $: tryAgainText = currentTranslations['try_again'] || 'try_again';
  $: loadingBookingsText = currentTranslations['loading_bookings'] || 'loading_bookings';
  $: pleaseWaitText = currentTranslations['please_wait'] || 'please_wait';
  $: noBookingsMatchFilterText = currentTranslations['no_bookings_match_filter'] || 'no_bookings_match_filter';
  $: bookingsInSystemText = currentTranslations['bookings_in_system'] || 'bookings_in_system';
  $: resetFilterText = currentTranslations['reset_filter'] || 'reset_filter';
  $: addNewBookingButtonText = currentTranslations['add_new_booking'] || 'add_new_booking';
  $: bulkActionsText = currentTranslations['bulk_actions'] || 'bulk_actions';
  $: confirmDeleteText = currentTranslations['confirm_delete'] || 'confirm_delete';
  $: addBookingText = currentTranslations['add_booking'] || 'add_booking';
  $: actionCannotBeUndoneText = currentTranslations['action_cannot_be_undone'] || 'action_cannot_be_undone';
  $: failedChangeStatusText = currentTranslations['failed_change_status'] || 'failed_change_status';
  
  // Force immediate reactivity when language changes
  $: {
    if (language) {
      // This ensures all translated text updates immediately when language changes
      bookingManagerTitleText, addNewBookingText, clientNameText, dateText, packageNameText,
      amountText, statusText, actionsText, completedText, upcomingText, pastText, todayText,
      upcomingBookingsText, dragDropInstructionText, deleteText, cancelText, saveText,
      filterAllText, filterCompletedText, filterUpcomingText, viewTableText, viewKanbanText,
      viewCalendarText, viewText, searchText, searchPlaceholderText, filterText, fromText,
      toText, batchTrashText, exportText, phoneText, enterClientNameText, enterPhoneText,
      enterPackageNameText, dealByText, enterDealByText, bookingDetailsText, editText,
      editBookingText, closeText, prevText, nextText, pageText, bookingsText,
      noBookingsMessageText, chooseContactText, chooseEmployeeText, choosePackageText,
      employeeText, selectAllText, selectedText, deleteSelectedText, chooseDateText,
      loadingText, refreshText, statusBaruText, dalamProsesText, selesaiText,
      keyboardShortcutsText, tambahBookingText, refreshDataText, tutupModalText,
      tukarTampilanText, tampilanSenaraiText, tampilanKanbanText, tampilanKalendarText,
      noBookingsInSystemText, noBookingsTitleText, noBookingsDescriptionText,
      noBookingsFoundText, addFirstBookingText, statusChangedText, tryAgainText,
      loadingBookingsText, pleaseWaitText, noBookingsMatchFilterText, bookingsInSystemText, resetFilterText,
      addNewBookingButtonText, bulkActionsText, confirmDeleteText, addBookingText, actionCannotBeUndoneText,
      failedChangeStatusText;
    }
  }

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
  let sortBy = 'date'; // Kolom yang sedang di-sort: 'date', 'package_name', 'employee', 'total_price', 'status', 'client_name'
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
  let bookingsChannel = null;
  let kanbanVersion = 0;
  let isKanbanRefreshing = false;
  let animatingCards = new Set();
  let kanbanFadeTransition = false;
  let refreshTimeout = null;

  let formData = {
    contact_id: '',
    employee_id: '',
    date: '',
    package_name: '',
    total_price: '',
    status: ''
  };

  // Set default status from database colors
  $: if ($colors.length > 0 && !formData.status) {
    formData.status = $colors[0].custom_status;
  }

  // Get default status from database colors
  $: defaultStatus = $colors.length > 0 ? $colors[0].custom_status : 'Status Baru';

  // Load data on component mount
  onMount(async () => {
    await loadData();
    setupKeyboardShortcuts();
    setupRealtime();
  });

  onDestroy(() => {
    if (bookingsChannel) {
      try {
        supabase.removeChannel(bookingsChannel);
      } catch (e) {
        console.warn('Gagal melepas channel realtime:', e);
      }
      bookingsChannel = null;
    }
    
    // Cleanup timeout
    if (refreshTimeout) {
      clearTimeout(refreshTimeout);
      refreshTimeout = null;
    }
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
    kanbanVersion += 1;
  }

  function showToastMessage(message, type = 'success') {
    toastMessage = message;
    toastType = type;
    showToast = true;
    setTimeout(() => showToast = false, 3000);
  }

  // Reactive statements dengan dependensi eksplisit untuk memastikan update UI langsung
  $: filteredBookings = !loading ? getFilteredBookings(bookings, searchTerm, selectedFilter, startDate, endDate, sortBy, sortOrder, defaultStatus) : [];
  $: _forceKanbanRerender = kanbanVersion; // trigger deps
  $: kanbanColumns = !loading ? getKanbanColumns() : getEmptyKanbanColumns();
  $: calendarData = !loading ? getCalendarData() : [];
  $: totalPages = Math.ceil(filteredBookings.length / perPage);
  $: pagedBookings = filteredBookings.slice((page - 1) * perPage, page * perPage);
  
  // Variabel untuk tracking perubahan sorting
  let previousSortBy = sortBy;
  let previousSortOrder = sortOrder;
  
  // Reset halaman ke 1 ketika sorting berubah untuk pengalaman user yang lebih baik
  $: {
    if (sortBy !== previousSortBy || sortOrder !== previousSortOrder) {
      page = 1;
      previousSortBy = sortBy;
      previousSortOrder = sortOrder;
    }
  }

  function getFilteredBookings(bookings, searchTerm, selectedFilter, startDate, endDate, sortBy, sortOrder, defaultStatus) {
    // Pastikan bookings sudah dimuat
    if (!bookings || bookings.length === 0) {
      return [];
    }
    
    let filtered = bookings.map(b => ({ ...b })).filter(b => {
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
    
    // Terapkan sorting berdasarkan kolom yang dipilih
    return filtered.sort((a, b) => {
      let valueA, valueB;
      
      switch (sortBy) {
        case 'client_name':
          valueA = (a.contact?.name || '').toLowerCase();
          valueB = (b.contact?.name || '').toLowerCase();
          break;
        case 'package_name':
          valueA = (a.package_name || '').toLowerCase();
          valueB = (b.package_name || '').toLowerCase();
          break;
        case 'employee':
          valueA = (a.employee?.name || '').toLowerCase();
          valueB = (b.employee?.name || '').toLowerCase();
          break;
        case 'total_price':
          valueA = parseFloat(a.total_price) || 0;
          valueB = parseFloat(b.total_price) || 0;
          break;
        case 'status':
          valueA = (a.status || defaultStatus).toLowerCase();
          valueB = (b.status || defaultStatus).toLowerCase();
          break;
        case 'date':
        default:
          valueA = new Date(a.date);
          valueB = new Date(b.date);
          break;
      }
      
      if (sortBy === 'date' || sortBy === 'total_price') {
        // Untuk angka dan tanggal
        return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
      } else {
        // Untuk string
        if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
        if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      }
    });
  }

  function getKanbanColumns() {
    // Pastikan data sudah dimuat sebelum memproses
    if (!filteredBookings || filteredBookings.length === 0) {
      // Return empty columns based on available statuses from database
      const statusColumns = {};
      $colors.forEach(color => {
        statusColumns[color.custom_status] = [];
      });
      return statusColumns;
    }
    
    // Force shallow copy to membantu re-render saat array referensial sama
    const fb = filteredBookings.map(b => ({ ...b }));
    
    // Create dynamic columns based on database colors
    const statusColumns = {};
    $colors.forEach(color => {
      statusColumns[color.custom_status] = fb.filter(b => (b.status || defaultStatus) === color.custom_status);
    });
    
    return statusColumns;
  }

  function getEmptyKanbanColumns() {
    const columns = {};
    $colors.forEach(color => {
      columns[color.custom_status] = [];
    });
    return columns;
  }

  // Helper untuk normalisasi tanggal ke format YYYY-MM-DD
  function toDateOnlyString(input) {
    if (!input) return '';
    // Jika string format 'YYYY-MM-DD' atau ISO, ambil bagian tanggal saja tanpa konversi timezone
    if (typeof input === 'string') {
      const m1 = input.match(/^\d{4}-\d{2}-\d{2}/);
      if (m1) return m1[0];
    }
    // Jika Date object, gunakan komponen lokal
    const d = input instanceof Date ? input : new Date(input);
    if (isNaN(d)) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function enrichBooking(rawBooking) {
    if (!rawBooking) return rawBooking;
    const contact = contacts.find((c) => c.id === rawBooking.contact_id) || null;
    const employee = employees.find((e) => e.id === rawBooking.employee_id) || null;
    return { ...rawBooking, contact, employee };
  }

  function setupRealtime() {
    try {
      bookingsChannel = supabase
        .channel('bookings-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, (payload) => {
          const eventType = payload.eventType;
          if (eventType === 'INSERT') {
            const newBooking = enrichBooking(payload.new);
            // Hindari duplikasi
            bookings = [newBooking, ...bookings.filter((b) => b.id !== newBooking.id)];
            kanbanVersion += 1;
          } else if (eventType === 'UPDATE') {
            const updated = enrichBooking(payload.new);
            bookings = bookings.map((b) => (b.id === updated.id ? { ...b, ...updated } : b));
            kanbanVersion += 1;
          } else if (eventType === 'DELETE') {
            const deletedId = payload.old?.id;
            if (deletedId) {
              bookings = bookings.filter((b) => b.id !== deletedId);
              kanbanVersion += 1;
            }
          }
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            // console.log('Realtime bookings subscribed');
          }
        });
    } catch (e) {
      console.error('Gagal setup realtime bookings:', e);
    }
  }

  async function refreshKanbanSilent() {
    try {
      isKanbanRefreshing = true;
      
      // Tambahkan delay kecil untuk transisi yang lebih smooth
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const fresh = await getBookings();
      bookings = fresh;
      kanbanVersion += 1;
      
      // Tidak perlu toast untuk refresh senyap
    } catch (e) {
      console.error('Gagal refresh kanban:', e);
      showToastMessage('Gagal menyinkronkan data', 'error');
    } finally {
      isKanbanRefreshing = false;
    }
  }

  async function refreshDataWithAnimation() {
    // Debounce untuk mencegah multiple calls
    if (refreshTimeout) {
      clearTimeout(refreshTimeout);
    }
    
    refreshTimeout = setTimeout(async () => {
      try {
        // Mulai animasi fade dan set loading state
        kanbanFadeTransition = true;
        isRefreshing = true;
        
        // Tunggu animasi fade out selesai
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Refresh data LENGKAP seperti tombol refresh - ini yang penting!
        await loadData();
        kanbanVersion += 1;
        
        // Tunggu sebentar untuk memastikan render
        await tick();
        
        // Fade in dengan data baru
        setTimeout(() => {
          kanbanFadeTransition = false;
          isRefreshing = false;
        }, 100);
        
        // Tambahkan toast untuk konfirmasi
        showToastMessage('Data berhasil disinkronkan', 'success');
        
      } catch (e) {
        console.error('Gagal refresh data:', e);
        kanbanFadeTransition = false;
        isRefreshing = false;
        showToastMessage('Gagal menyinkronkan data', 'error');
      }
    }, 300); // Kurangi debounce untuk responsiveness yang lebih baik
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
      const dateStr = toDateOnlyString(currentDate);
      const dayBookings = filteredBookings.filter(b => toDateOnlyString(b.date) === dateStr);
      
      calendar.push({
        date: new Date(currentDate),
        dateStr,
        isCurrentMonth: currentDate.getMonth() === currentMonth,
        isToday: dateStr === toDateOnlyString(new Date()),
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

  function goToCurrentMonth() {
    const today = new Date();
    currentMonth = today.getMonth();
    currentYear = today.getFullYear();
  }

  async function addBooking() {
    if (formData.contact_id && formData.date && formData.package_name) {
      try {
        isSubmitting = true;
        const totalPriceNum = parseFloat(formData.total_price);
        const bookingData = {
          contact_id: formData.contact_id,
          employee_id: formData.employee_id || null,
          date: formData.date,
          package_name: formData.package_name,
          total_price: Number.isFinite(totalPriceNum) ? totalPriceNum : 0,
          status: formData.status || defaultStatus
        };
        
        const newBooking = await createBooking(bookingData);
        bookings = [newBooking, ...bookings];
        await loadData();
        
        // Reset form
        formData = { 
          contact_id: '', 
          employee_id: '', 
          date: '', 
          package_name: '', 
          total_price: '',
          status: defaultStatus
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
      // Pastikan UI ter-refresh sepenuhnya
      await loadData();
      kanbanVersion += 1;
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
        // Refresh data agar semua tampilan (table/kanban/calendar) sinkron
        await loadData();
        kanbanVersion += 1;
        showToastMessage('Booking berhasil dihapus', 'success');
      } catch (err) {
        error = 'Gagal menghapus booking. Silakan coba lagi.';
        console.error('Error deleting booking:', err);
      } finally {
        isSubmitting = false;
      }
    }
  }

  async function bulkDeleteSelected() {
    try {
      const ids = Object.entries(selectedIds)
        .filter(([, isSelected]) => Boolean(isSelected))
        .map(([id]) => id);
      if (ids.length === 0) return;
      isSubmitting = true;
      const idsNum = ids.map((v) => Number(v));
      await deleteBookingsBulk(idsNum);
      bookings = bookings.filter(b => !idsNum.includes(b.id));
      selectedIds = {};
      allSelected = false;
      // Muat ulang data untuk memastikan konsistensi dan memicu re-render penuh
      await loadData();
      kanbanVersion += 1;
      showToastMessage(`${ids.length} booking berhasil dihapus`, 'success');
    } catch (err) {
      console.error('Error bulk deleting bookings:', err);
      showToastMessage('Gagal menghapus beberapa booking', 'error');
    } finally {
      isSubmitting = false;
    }
  }

  function toggleSelectBooking(id, checked) {
    selectedIds = { ...selectedIds, [id]: checked };
    allSelected = pagedBookings.every(b => !!selectedIds[b.id]);
  }

  function toggleSelectAll() {
    const target = !allSelected;
    const next = { ...selectedIds };
    pagedBookings.forEach(b => { next[b.id] = target; });
    selectedIds = next;
    allSelected = target;
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
      const totalPriceNum = parseFloat(selectedBooking.total_price);
      const updatedData = {
        contact_id: selectedBooking.contact_id,
        employee_id: selectedBooking.employee_id || null,
        date: selectedBooking.date,
        package_name: selectedBooking.package_name,
        total_price: Number.isFinite(totalPriceNum) ? totalPriceNum : 0,
        status: selectedBooking.status || defaultStatus
      };
      
      const updatedBooking = await updateBooking(selectedBooking.id, updatedData);
      bookings = bookings.map(b => b.id === selectedBooking.id ? updatedBooking : b);
      await loadData();
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

  function sortData(column) {
    if (sortBy === column) {
      // Jika kolom yang sama diklik, toggle order
      sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      // Jika kolom berbeda, set kolom baru dan default asc
      sortBy = column;
      sortOrder = 'asc';
    }
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
    // Get color from database colors store
    const colorData = $colors.find(color => color.custom_status === status);
    if (colorData) {
      return colorData.code_color;
    }
    
    // Fallback to first available color if status not found
    if ($colors.length > 0) {
      return $colors[0].code_color;
    }
    
    // Ultimate fallback color
    return '#6b7280'; // Gray
  }

  function getStatusText(status) {
    return status || defaultStatus;
  }

  function getTranslatedStatusText(statusText) {
    // Map status text to translation keys
    const statusMap = {
      'Status Baru': 'status_baru',
      'Dalam Proses': 'dalam_proses',
      'Selesai': 'selesai'
    };
    
    const translationKey = statusMap[statusText];
    if (translationKey) {
      return currentTranslations[translationKey] || statusText;
    }
    return statusText;
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
    
    // Reset drag state segera agar tidak double-trigger
    draggedBooking = null;
    dragOverColumn = null;
    
    if (currentDraggedBooking && currentDraggedBooking.id && targetColumn) {
      try {
        // Langsung update di database tanpa optimistic update
        const updatedBooking = await updateBooking(currentDraggedBooking.id, { status: targetColumn });
        
        if (!updatedBooking || !updatedBooking.id) {
          console.error('Invalid response from updateBooking:', updatedBooking);
          throw new Error('Invalid response from database');
        }
        
        // Refresh data lengkap dari database untuk memastikan sinkronisasi sempurna
        await loadData();
        kanbanVersion += 1;
        
        error = null;
        toastMessage = statusChangedText.replace('{status}', targetColumn);
        toastType = 'success';
        showToast = true;
        setTimeout(() => (showToast = false), 3000);
        
      } catch (err) {
        console.error('Error updating booking status:', err);
        
        // Refresh data untuk memastikan UI sinkron dengan database
        await loadData();
        kanbanVersion += 1;
        
        toastMessage = failedChangeStatusText;
        toastType = 'error';
        showToast = true;
        setTimeout(() => (showToast = false), 3000);
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
              <h1 class="text-3xl font-semibold text-gray-200">{bookingManagerTitleText}</h1>
      {#if !loading && bookings.length > 0}
                  <div class="flex items-center gap-4 mt-2 text-sm text-gray-400">
            {#each $colors as color}
              <span class="flex items-center gap-1">
                <div class="w-2 h-2 rounded-full" style="background-color: {color.code_color}"></div>
                {bookings.filter(b => getStatusText(b.status) === color.custom_status).length} {getTranslatedStatusText(color.custom_status)}
              </span>
            {/each}
          </div>
      {/if}
    </div>
    <button class="bg-green-500 text-white border-none px-6 py-3 rounded-md text-sm font-medium hover:bg-green-600 transition-colors" on:click={() => showForm = true}>
              + {addNewBookingText}
    </button>
  </div>

  <div class="mb-8 px-5 max-w-6xl mx-auto">
    <!-- Keyboard Shortcuts Info -->
    <div class="bg-gray-800 border border-gray-600 rounded-lg p-3 mb-4">
      <div class="flex items-center gap-2 text-sm text-gray-300">
        <span class="font-medium">{keyboardShortcutsText}</span>
        <span class="bg-gray-700 px-2 py-1 rounded text-xs">Ctrl+N</span>
        <span class="text-gray-400">{tambahBookingText}</span>
        <span class="bg-gray-700 px-2 py-1 rounded text-xs">Ctrl+R</span>
        <span class="text-gray-400">{refreshDataText}</span>
        <span class="bg-gray-700 px-2 py-1 rounded text-xs">Esc</span>
        <span class="text-gray-400">{tutupModalText}</span>
      </div>
    </div>
    
    <div class="flex flex-wrap gap-5 items-end mb-5 bg-gray-900 p-5 rounded-lg border border-gray-700">
      <div class="flex flex-col gap-1 min-w-[150px]">
        <label for="filter" class="text-sm font-medium text-gray-200">{filterText}:</label>
        <select id="filter" bind:value={selectedFilter} class="bg-gray-950 border border-gray-700 rounded-md px-3 py-2 text-gray-200 text-sm h-[46px]">
                      <option value="all">{filterAllText}</option>
            <option value="upcoming">{filterUpcomingText}</option>
            <option value="past">{filterCompletedText}</option>
        </select>
      </div>
      <div class="flex flex-wrap gap-4">
        <div class="flex flex-col gap-1 min-w-[150px]">
          <label for="startDate" class="text-sm font-medium text-gray-200">{fromText}:</label>
          <DatePicker id="startDate" bind:value={startDate} returnType="string" placeholder="YYYY-MM-DD" class="w-full" />
        </div>
        <div class="flex flex-col gap-1 min-w-[150px]">
          <label for="endDate" class="text-sm font-medium text-gray-200">{toText}:</label>
          <DatePicker id="endDate" bind:value={endDate} returnType="string" placeholder="YYYY-MM-DD" class="w-full" />
        </div>
      </div>
      <div class="flex flex-col gap-1 min-w-[200px] flex-1">
        <label for="search" class="text-sm font-medium text-gray-200">{searchText}:</label>
        <input type="text" id="search" placeholder={searchPlaceholderText} bind:value={searchTerm} class="bg-gray-950 border border-gray-700 rounded-md px-3 py-2 text-gray-200 text-sm h-[46px]" />
      </div>
      <div class="flex gap-2 items-center h-[34px]" role="group" aria-labelledby="bulk-actions-label">
        <span id="bulk-actions-label" class="sr-only">{bulkActionsText}</span>
        <button class="bg-blue-500 text-white border-none px-4 py-2 rounded-md text-sm hover:bg-blue-600 transition-colors h-[34px] flex items-center gap-1" on:click={bulkDeleteSelected} disabled={Object.values(selectedIds).filter(Boolean).length === 0}>
          <Trash2 size={16} />
          {deleteSelectedText}
        </button>
        <button class="bg-blue-500 text-white border-none px-4 py-2 rounded-md text-sm hover:bg-blue-600 transition-colors h-[34px] flex items-center gap-1" on:click={exportBookings}>
          <Download size={16} />
          {exportText}
        </button>
        <button class="bg-green-500 text-white border-none px-4 py-2 rounded-md text-sm hover:bg-green-600 transition-colors h-[34px] flex items-center gap-1" on:click={refreshData} disabled={isRefreshing}>
          <RefreshCw size={16} class={isRefreshing ? 'animate-spin' : ''} />
          {isRefreshing ? loadingText : refreshText}
        </button>
      </div>
    </div>

    <div class="flex items-center gap-4">
              <span class="text-sm font-medium text-gray-200">{viewText}:</span>
      <div class="inline-flex bg-gray-900 border border-gray-700 rounded-lg overflow-hidden" role="group" aria-label={tukarTampilanText}>
        <button
          type="button"
          class="flex items-center gap-1.5 px-3 py-2 bg-transparent border-none text-gray-200 cursor-pointer hover:bg-gray-800 {viewMode === 'table' ? 'bg-gray-800 text-green-500' : ''}"
          on:click={() => viewMode = 'table'}
          aria-pressed={viewMode === 'table'}
          title={tampilanSenaraiText}
        >
          <Table size={16} />
          {viewTableText}
        </button>
        <button
          type="button"
          class="flex items-center gap-1.5 px-3 py-2 bg-transparent border-none text-gray-200 cursor-pointer hover:bg-gray-800 {viewMode === 'kanban' ? 'bg-gray-800 text-green-500' : ''}"
          on:click={() => viewMode = 'kanban'}
          aria-pressed={viewMode === 'kanban'}
          title={tampilanKanbanText}
        >
          <ClipboardList size={16} />
          {viewKanbanText}
        </button>
        <button
          type="button"
          class="flex items-center gap-1.5 px-3 py-2 bg-transparent border-none text-gray-200 cursor-pointer hover:bg-gray-800 {viewMode === 'calendar' ? 'bg-gray-800 text-green-500' : ''}"
          on:click={() => viewMode = 'calendar'}
          aria-pressed={viewMode === 'calendar'}
          title={tampilanKalendarText}
        >
          <Calendar size={16} />
          {viewCalendarText}
        </button>
      </div>
      {#if viewMode === 'kanban'}
        <div class="text-xs text-gray-400 mt-2 text-center px-2 py-2 bg-gray-950 rounded border border-gray-700">{dragDropInstructionText}</div>
      {/if}
    </div>
  </div>

  {#if showForm}
          <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]" on:click={() => showForm = false} role="dialog" aria-modal="true" aria-label={addBookingText} tabindex="-1" on:keydown={(e) => { if (e.key === 'Escape') showForm = false; }}>
      <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
      <div class="bg-gray-900 rounded-lg p-8 w-11/12 max-w-lg border border-gray-700" on:click|stopPropagation on:keydown|stopPropagation role="document">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl text-gray-200">{addNewBookingText}</h2>
          <button class="bg-none border-none text-gray-400 text-2xl cursor-pointer w-8 h-8 flex items-center justify-center hover:text-gray-200" on:click={() => showForm = false}>×</button>
        </div>

        <form class="flex flex-col gap-5" on:submit|preventDefault={addBooking}>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <label for="newContactId" class="text-sm font-medium text-gray-200">{clientNameText}</label>
              <select id="newContactId" bind:value={formData.contact_id} required class="bg-gray-950 border border-gray-700 rounded-md px-3 py-3 text-gray-200 text-sm cursor-pointer focus:outline-none focus:border-green-500 transition-colors">
                <option value="">{chooseContactText}</option>
                {#each contacts as contact}
                  <option value={contact.id}>{contact.name}</option>
                {/each}
              </select>
            </div>
            <div class="flex flex-col gap-2">
              <label for="newEmployeeId" class="text-sm font-medium text-gray-200">{employeeText} (Opsional)</label>
              <select id="newEmployeeId" bind:value={formData.employee_id} class="bg-gray-950 border border-gray-700 rounded-md px-3 py-3 text-gray-200 text-sm cursor-pointer focus:outline-none focus:border-green-500 transition-colors">
                <option value="">{chooseEmployeeText}</option>
                {#each employees as employee}
                  <option value={employee.id}>{employee.name}</option>
                {/each}
              </select>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <label for="newDate" class="text-sm font-medium text-gray-200">{dateText}</label>
              <DatePicker id="newDate" bind:value={formData.date} required returnType="string" placeholder="YYYY-MM-DD" />
            </div>
            <div class="flex flex-col gap-2">
              <label for="newPackageName" class="text-sm font-medium text-gray-200">{packageNameText}</label>
              <select id="newPackageName" bind:value={formData.package_name} required class="bg-gray-950 border border-gray-700 rounded-md px-3 py-3 text-gray-200 text-sm cursor-pointer focus:outline-none focus:border-green-500 transition-colors"
                on:change={() => {
                  const selected = pricePackages.find((p) => p.pakej === formData.package_name);
                  formData.total_price = selected ? String(selected.harga ?? 0) : formData.total_price;
                }}
              >
                <option value="">{choosePackageText}</option>
                {#each pricePackages as pkg}
                  <option value={pkg.pakej}>{pkg.pakej} - RM{pkg.harga}</option>
                {/each}
              </select>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <label for="newAmount" class="text-sm font-medium text-gray-200">{amountText} (RM)</label>
              <input type="number" id="newAmount" bind:value={formData.total_price} step="0.01" placeholder="0.00" class="bg-gray-950 border border-gray-700 rounded-md px-3 py-3 text-gray-200 text-sm focus:outline-none focus:border-green-500 transition-colors" />
            </div>
            <div class="flex flex-col gap-2">
              <label for="newStatus" class="text-sm font-medium text-gray-200">{statusText}</label>
              <select id="newStatus" bind:value={formData.status} required class="bg-gray-950 border border-gray-700 rounded-md px-3 py-3 text-gray-200 text-sm cursor-pointer focus:outline-none focus:border-green-500 transition-colors">
                {#each $colors as color}
                  <option value={color.custom_status}>{color.custom_status}</option>
                {/each}
              </select>
            </div>
          </div>
          
          <div class="flex gap-3 justify-end mt-2.5">
            <button type="button" class="bg-none border border-gray-700 text-gray-400 px-6 py-3 rounded-md text-sm hover:border-green-500 hover:text-green-500 transition-colors" on:click={() => showForm = false}>{cancelText}</button>
            <button type="submit" class="bg-green-500 text-white border-none px-6 py-3 rounded-md text-sm font-medium hover:bg-green-600 transition-colors" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : saveText}
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}

  {#if showCalendarDayModal}
    <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]" on:click={() => showCalendarDayModal = false} role="dialog" aria-modal="true" aria-label="Detail Hari" tabindex="-1" on:keydown={(e) => { if (e.key === 'Escape') showCalendarDayModal = false; }}>
      <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
      <div class="bg-gray-900 rounded-lg p-6 w-11/12 max-w-lg border border-gray-700" on:click|stopPropagation on:keydown|stopPropagation role="document">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl text-gray-200">{selectedCalendarDay?.date ? selectedCalendarDay.date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : ''}</h2>
          <button class="bg-none border-none text-gray-400 text-2xl cursor-pointer w-8 h-8 flex items-center justify-center hover:text-gray-200" on:click={() => showCalendarDayModal = false}>×</button>
        </div>

        {#if selectedCalendarDay?.bookings?.length > 0}
          <div class="space-y-3 max-h-[60vh] overflow-auto pr-1">
            {#each selectedCalendarDay.bookings as booking (booking.id)}
              <div class="bg-gray-800 border border-gray-700 rounded-lg p-3">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="text-gray-200 font-semibold">{booking.contact?.name || 'N/A'}</div>
                    <div class="text-xs text-gray-400">{booking.package_name}</div>
                  </div>
                  <div class="text-right">
                    <div class="text-green-400 font-semibold">{formatCurrency(booking.total_price)}</div>
                    <span class="px-2 py-0.5 rounded text-[10px] text-white" style="background-color: {getStatusColor(booking.status)}">{getStatusText(booking.status)}</span>
                  </div>
                </div>
                <div class="mt-2 text-xs text-gray-400 flex items-center gap-3">
                  <span>{booking.employee?.name || 'Tidak ditentukan'}</span>
                  {#if booking.contact?.whatsapp}
                    <a href={`https://wa.me/${booking.contact.whatsapp.replace(/[^0-9]/g,'')}`} target="_blank" class="inline-flex items-center gap-1 text-gray-300 no-underline hover:text-white transition-colors">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" width="14" alt="WA" />
                      {booking.contact.whatsapp}
                    </a>
                  {/if}
                </div>
                <div class="mt-3 flex justify-end gap-2">
                  <button class="bg-transparent border border-gray-700 text-gray-300 px-3 py-1.5 rounded text-xs hover:border-green-500 hover:text-green-500" on:click={() => { showCalendarDayModal = false; openViewModal(booking); }}>Lihat</button>
                  <button class="bg-green-600 text-white border-none px-3 py-1.5 rounded text-xs hover:bg-green-700" on:click={() => { showCalendarDayModal = false; openEditModal(booking); }}>Edit</button>
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <div class="text-center text-gray-400 py-6">Tidak ada booking pada hari ini.</div>
        {/if}
      </div>
    </div>
  {/if}

  {#if showViewModal}
    <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]" on:click={() => showViewModal = false} role="dialog" aria-modal="true" aria-label="Detail Booking" tabindex="-1" on:keydown={(e) => { if (e.key === 'Escape') showViewModal = false; }}>
      <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
      <div class="bg-gray-900 rounded-lg p-8 w-11/12 max-w-lg border border-gray-700" on:click|stopPropagation on:keydown|stopPropagation role="document">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl text-gray-200">{bookingDetailsText}</h2>
          <button class="bg-none border-none text-gray-400 text-2xl cursor-pointer w-8 h-8 flex items-center justify-center hover:text-gray-200" on:click={() => showViewModal = false}>×</button>
        </div>
        <div class="flex flex-col gap-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <span class="font-semibold text-gray-400">{clientNameText}:</span>
              <span class="text-gray-200">{selectedBooking.contact?.name || 'N/A'}</span>
            </div>
            <div class="flex flex-col gap-2">
              <span class="font-semibold text-gray-400">{phoneText}:</span>
              <span class="text-gray-200">
                {selectedBooking.contact?.whatsapp || 'N/A'}
                {#if selectedBooking.contact?.whatsapp}
                  <a href={`https://wa.me/${selectedBooking.contact.whatsapp.replace(/[^0-9]/g,'')}`} target="_blank" class="inline-flex items-center gap-1 ml-2 opacity-80 hover:opacity-100 transition-opacity">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" width="18" alt="WA" />
                  </a>
                {/if}
              </span>
            </div>
          </div>
          
          {#if selectedBooking.contact?.email}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex flex-col gap-2">
                <span class="font-semibold text-gray-400">Email:</span>
                <span class="text-gray-200">{selectedBooking.contact.email}</span>
              </div>
              <div class="flex flex-col gap-2">
                <span class="font-semibold text-gray-400">{dateText}:</span>
                <span class="text-gray-200">{formatDate(selectedBooking.date)}</span>
              </div>
            </div>
          {:else}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex flex-col gap-2">
                <span class="font-semibold text-gray-400">{dateText}:</span>
                <span class="text-gray-200">{formatDate(selectedBooking.date)}</span>
              </div>
              <div class="flex flex-col gap-2">
                <span class="font-semibold text-gray-400">{packageNameText}:</span>
                <span class="text-gray-200">{selectedBooking.package_name}</span>
              </div>
            </div>
          {/if}
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <span class="font-semibold text-gray-400">{amountText}:</span>
              <span class="text-gray-200">{formatCurrency(selectedBooking.total_price)}</span>
            </div>
            <div class="flex flex-col gap-2">
              <span class="font-semibold text-gray-400">{employeeText}:</span>
              <span class="text-gray-200">{selectedBooking.employee?.name || 'Tidak ditentukan'}</span>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <span class="font-semibold text-gray-400">Status:</span>
              <span class="text-gray-200">
                <span class="px-2 py-1 rounded text-xs font-medium text-white" style="background-color: {getStatusColor(selectedBooking.status)}">
                  {selectedBooking.status || defaultStatus}
                </span>
              </span>
            </div>
            <div class="flex flex-col gap-2">
              <!-- Empty space for alignment -->
            </div>
          </div>
          <div class="flex gap-3 justify-end mt-2.5">
            <button class="bg-green-500 text-white border-none px-6 py-3 rounded-md text-sm font-medium hover:bg-green-600 transition-colors" on:click={() => { showViewModal = false; openEditModal(selectedBooking); }}>{editText}</button>
            <button class="bg-none border border-gray-700 text-gray-400 px-6 py-3 rounded-md text-sm hover:border-green-500 hover:text-green-500 transition-colors" on:click={() => showViewModal = false}>{closeText}</button>
          </div>
        </div>
      </div>
    </div>
  {/if}

  {#if showEditModal}
    <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]" on:click={() => showEditModal = false} role="dialog" aria-modal="true" aria-label="Edit Booking" tabindex="-1" on:keydown={(e) => { if (e.key === 'Escape') showEditModal = false; }}>
      <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
      <div class="bg-gray-900 rounded-lg p-8 w-11/12 max-w-lg border border-gray-700" on:click|stopPropagation on:keydown|stopPropagation role="document">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl text-gray-200">{editBookingText}</h2>
          <button class="bg-none border-none text-gray-400 text-2xl cursor-pointer w-8 h-8 flex items-center justify-center hover:text-gray-200" on:click={() => showEditModal = false}>×</button>
        </div>
        <form class="flex flex-col gap-5" on:submit|preventDefault={saveEditBooking}>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <label for="editContactId" class="text-sm font-medium text-gray-200">{clientNameText}</label>
              <select id="editContactId" bind:value={selectedBooking.contact_id} required class="bg-gray-950 border border-gray-700 rounded-md px-3 py-3 text-gray-200 text-sm cursor-pointer focus:outline-none focus:border-green-500 transition-colors">
                <option value="">{chooseContactText}</option>
                {#each contacts as contact}
                  <option value={contact.id}>{contact.name}</option>
                {/each}
              </select>
            </div>
            <div class="flex flex-col gap-2">
              <label for="editEmployeeId" class="text-sm font-medium text-gray-200">{employeeText} (Opsional)</label>
              <select id="editEmployeeId" bind:value={selectedBooking.employee_id} class="bg-gray-950 border border-gray-700 rounded-md px-3 py-3 text-gray-200 text-sm cursor-pointer focus:outline-none focus:border-green-500 transition-colors">
                <option value="">{chooseEmployeeText}</option>
                {#each employees as employee}
                  <option value={employee.id}>{employee.name}</option>
                {/each}
              </select>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <label for="editDate" class="text-sm font-medium text-gray-200">{dateText}</label>
              <DatePicker id="editDate" bind:value={selectedBooking.date} required returnType="string" placeholder="YYYY-MM-DD" />
            </div>
            <div class="flex flex-col gap-2">
              <label for="editPackageName" class="text-sm font-medium text-gray-200">{packageNameText}</label>
              <select id="editPackageName" bind:value={selectedBooking.package_name} required class="bg-gray-950 border border-gray-700 rounded-md px-3 py-3 text-gray-200 text-sm cursor-pointer focus:outline-none focus:border-green-500 transition-colors"
                on:change={() => {
                  const selected = pricePackages.find((p) => p.pakej === selectedBooking.package_name);
                  selectedBooking.total_price = selected ? String(selected.harga ?? 0) : selectedBooking.total_price;
                }}
              >
                <option value="">{choosePackageText}</option>
                {#each pricePackages as pkg}
                  <option value={pkg.pakej}>{pkg.pakej} - RM{pkg.harga}</option>
                {/each}
              </select>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <label for="editAmount" class="text-sm font-medium text-gray-200">{amountText} (RM)</label>
              <input type="number" id="editAmount" bind:value={selectedBooking.total_price} step="0.01" placeholder="0.00" class="bg-gray-950 border border-gray-700 rounded-md px-3 py-3 text-gray-200 text-sm focus:outline-none focus:border-green-500 transition-colors" />
            </div>
            <div class="flex flex-col gap-2">
              <label for="editStatus" class="text-sm font-medium text-gray-200">{statusText}</label>
              <select id="editStatus" bind:value={selectedBooking.status} required class="bg-gray-950 border border-gray-700 rounded-md px-3 py-3 text-gray-200 text-sm cursor-pointer focus:outline-none focus:border-green-500 transition-colors">
                {#each $colors as color}
                  <option value={color.custom_status}>{color.custom_status}</option>
                {/each}
              </select>
            </div>
          </div>
          <div class="flex gap-3 justify-end mt-2.5">
            <button type="button" class="bg-none border border-gray-700 text-gray-400 px-6 py-3 rounded-md text-sm hover:border-green-500 hover:text-green-500 transition-colors" on:click={() => showEditModal = false}>{cancelText}</button>
            <button type="submit" class="bg-green-500 text-white border-none px-6 py-3 rounded-md text-sm font-medium hover:bg-green-600 transition-colors" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : saveText}
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}

  {#if showDeleteConfirm}
          <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]" on:click={() => showDeleteConfirm = false} role="dialog" aria-modal="true" aria-label={confirmDeleteText} tabindex="-1" on:keydown={(e) => { if (e.key === 'Escape') showDeleteConfirm = false; }}>
      <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
      <div class="bg-gray-900 rounded-lg p-8 w-11/12 max-w-md border border-gray-700" on:click|stopPropagation on:keydown|stopPropagation role="document">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
            <AlertTriangle size={24} class="text-red-500" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-200">{confirmDeleteText}</h2>
                          <p class="text-sm text-gray-400">{actionCannotBeUndoneText}</p>
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
      <button class="bg-white/20 text-white border-none px-3 py-1.5 rounded text-xs hover:bg-white/30 transition-colors" on:click={loadData}>{tryAgainText}</button>
    </div>
  {/if}

  <div class="px-5 max-w-6xl mx-auto">
    {#if loading}
      <div class="text-center py-16 text-gray-400">
        <div class="animate-spin w-8 h-8 border-4 border-gray-600 border-t-green-500 rounded-full mx-auto mb-4"></div>
        <p class="text-base">{loadingBookingsText}</p>
        <p class="text-sm text-gray-500 mt-2">{pleaseWaitText}</p>
      </div>
    {:else if bookings.length === 0}
      <div class="text-center py-16 text-gray-400">
        <Calendar size={32} class="mx-auto mb-5" />
                  <h3 class="text-lg text-gray-200 mb-2.5">{noBookingsFoundText}</h3>
        <p class="text-sm">{noBookingsInSystemText}</p>
        <button class="bg-green-500 text-white border-none px-6 py-3 rounded-md text-sm font-medium hover:bg-green-600 transition-colors mt-5" on:click={() => showForm = true}>
          + {addNewBookingButtonText}
        </button>
      </div>
    {:else if filteredBookings.length === 0 && !loading}
      <div class="text-center py-16 text-gray-400">
        <Calendar size={32} class="mx-auto mb-5" />
        {#if bookings.length === 0}
                  <h3 class="text-lg text-gray-200 mb-2.5">{noBookingsTitleText}</h3>
        <p class="text-sm">{noBookingsDescriptionText}</p>
          <button class="bg-green-500 text-white border-none px-3 py-1.5 rounded text-xs hover:bg-green-600 transition-colors mt-2.5" on:click={() => showForm = true}>
                          {addFirstBookingText}
          </button>
        {:else}
          <h3 class="text-lg text-gray-200 mb-2.5">{noBookingsMatchFilterText}</h3>
          <p class="text-sm">{bookingsInSystemText.replace('{count}', bookings.length)}</p>
          <button class="bg-green-500 text-white border-none px-3 py-1.5 rounded text-xs hover:bg-green-600 transition-colors mt-2.5" on:click={() => { searchTerm = ''; selectedFilter = 'all'; startDate = ''; endDate = ''; }}>
            {resetFilterText}
          </button>
        {/if}
      </div>
    {:else}
      {#if viewMode === 'table'}
        <div class="overflow-x-auto bg-gray-900 rounded-lg border border-gray-700">
          <table class="w-full border-collapse">
            <thead>
              <tr>
                <th class="bg-gray-950 text-gray-200 px-3 py-4 text-left font-semibold text-sm border-b border-gray-700">
                  <input type="checkbox" checked={pagedBookings.length > 0 && pagedBookings.every(b => !!selectedIds[b.id])} on:change={toggleSelectAll} />
                </th>
                <th on:click={() => sortData('client_name')} class="bg-gray-950 text-gray-200 px-3 py-4 text-left font-semibold text-sm border-b border-gray-700 cursor-pointer hover:bg-gray-800 transition-colors select-none">
                  <div class="flex items-center justify-between">
                    <span>{clientNameText}</span>
                    <span class="text-xs">
                      {#if sortBy === 'client_name'}
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      {:else}
                        ↕
                      {/if}
                    </span>
                  </div>
                </th>
                <th class="bg-gray-950 text-gray-200 px-3 py-4 text-left font-semibold text-sm border-b border-gray-700">{phoneText}</th>
                <th on:click={() => sortData('date')} class="bg-gray-950 text-gray-200 px-3 py-4 text-left font-semibold text-sm border-b border-gray-700 cursor-pointer hover:bg-gray-800 transition-colors select-none">
                  <div class="flex items-center justify-between">
                    <span>{dateText}</span>
                    <span class="text-xs">
                      {#if sortBy === 'date'}
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      {:else}
                        ↕
                      {/if}
                    </span>
                  </div>
                </th>
                <th on:click={() => sortData('package_name')} class="bg-gray-950 text-gray-200 px-3 py-4 text-left font-semibold text-sm border-b border-gray-700 cursor-pointer hover:bg-gray-800 transition-colors select-none">
                  <div class="flex items-center justify-between">
                    <span>{packageNameText}</span>
                    <span class="text-xs">
                      {#if sortBy === 'package_name'}
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      {:else}
                        ↕
                      {/if}
                    </span>
                  </div>
                </th>
                <th on:click={() => sortData('employee')} class="bg-gray-950 text-gray-200 px-3 py-4 text-left font-semibold text-sm border-b border-gray-700 cursor-pointer hover:bg-gray-800 transition-colors select-none">
                  <div class="flex items-center justify-between">
                    <span>{employeeText}</span>
                    <span class="text-xs">
                      {#if sortBy === 'employee'}
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      {:else}
                        ↕
                      {/if}
                    </span>
                  </div>
                </th>
                <th on:click={() => sortData('total_price')} class="bg-gray-950 text-gray-200 px-3 py-4 text-left font-semibold text-sm border-b border-gray-700 cursor-pointer hover:bg-gray-800 transition-colors select-none">
                  <div class="flex items-center justify-between">
                    <span>{amountText}</span>
                    <span class="text-xs">
                      {#if sortBy === 'total_price'}
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      {:else}
                        ↕
                      {/if}
                    </span>
                  </div>
                </th>
                <th on:click={() => sortData('status')} class="bg-gray-950 text-gray-200 px-3 py-4 text-left font-semibold text-sm border-b border-gray-700 cursor-pointer hover:bg-gray-800 transition-colors select-none">
                  <div class="flex items-center justify-between">
                    <span>{statusText}</span>
                    <span class="text-xs">
                      {#if sortBy === 'status'}
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      {:else}
                        ↕
                      {/if}
                    </span>
                  </div>
                </th>
                <th class="bg-gray-950 text-gray-200 px-3 py-4 text-left font-semibold text-sm border-b border-gray-700">{actionsText}</th>
              </tr>
            </thead>
            <tbody>
              {#each pagedBookings as booking (booking.id)}
                <tr class="hover:bg-gray-950">
                  <td class="px-3 py-4 border-b border-gray-700 text-gray-200">
                    <input type="checkbox" checked={!!selectedIds[booking.id]} on:change={(e) => toggleSelectBooking(booking.id, e.currentTarget.checked)} />
                  </td>
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
                    <button class="bg-none border-none text-gray-400 p-1 rounded text-lg hover:bg-white/10 transition-colors" on:click={() => openViewModal(booking)} title={viewText}>
                      <Eye size={16} />
                    </button>
                    <button class="bg-none border-none text-gray-400 p-1 rounded text-lg hover:bg-white/10 transition-colors" on:click={() => openEditModal(booking)} title={editText}>
                      <Edit size={16} />
                    </button>
                    <button class="bg-none border-none text-red-500 p-1 rounded text-lg hover:bg-red-500/10 transition-colors" on:click={() => confirmDelete(booking)} title={deleteText}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
          <div class="flex items-center gap-2.5 p-4 justify-center">
            <button on:click={prevPage} disabled={page === 1} class="bg-blue-500 text-white border-none px-4 py-2 rounded-md text-sm hover:bg-blue-600 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">{prevText}</button>
            <span class="text-gray-200">{pageText} {page} / {totalPages}</span>
            <button on:click={nextPage} disabled={page === totalPages} class="bg-blue-500 text-white border-none px-4 py-2 rounded-md text-sm hover:bg-blue-600 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">{nextText}</button>
          </div>
        </div>
      {:else if viewMode === 'kanban'}
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5 transition-opacity duration-300 {kanbanFadeTransition ? 'opacity-50' : 'opacity-100'}">
          {#each $colors as color}
            <div 
              class="bg-gray-900 rounded-lg p-5 border border-gray-700 min-h-[400px] transition-all relative {dragOverColumn === color.custom_status ? 'bg-gray-950 border-green-500 scale-[1.01] shadow-inner' : ''} {isKanbanRefreshing ? 'animate-kanbanPulse' : ''} {kanbanFadeTransition ? 'animate-refreshGlow' : ''}" 
              on:dragover={(e) => handleDragOver(e, color.custom_status)}
              on:dragenter={handleDragEnter}
              on:drop={(e) => handleDrop(e, color.custom_status)}
              role="list"
              aria-label={color.custom_status}
            >
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-200 flex items-center gap-2" style="color: {color.code_color}">
                  <Calendar size={16} />
                  {color.custom_status}
                  {#if kanbanFadeTransition}
                    <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  {/if}
                </h3>
                <span class="text-xs px-2 py-1 rounded bg-gray-800 border border-gray-700 text-gray-300 transition-all">
                  {kanbanColumns[color.custom_status]?.length || 0} booking
                  {#if isKanbanRefreshing}
                    <RefreshCw size={12} class="inline ml-1 animate-spin" />
                  {/if}
                </span>
              </div>
              {#each kanbanColumns[color.custom_status] || [] as booking (booking.id)}
                <div 
                  class="group bg-gray-950/80 backdrop-blur border border-gray-800 rounded-lg p-4 mb-4 hover:border-green-500/60 hover:-translate-y-0.5 hover:shadow-md transition-all cursor-grab active:cursor-grabbing animate-slideInFromLeft" 
                  draggable="true"
                  on:dragstart={(e) => handleDragStart(e, booking)}
                  on:dragend={handleDragEnd}
                  style="border-left: 3px solid {color.code_color}; animation-delay: {(kanbanColumns[color.custom_status] || []).indexOf(booking) * 50}ms"
                  role="listitem"
                  aria-grabbed={draggedBooking && draggedBooking.id === booking.id ? 'true' : 'false'}
                >
                  <div class="flex items-start gap-2 mb-3">
                    <GripVertical size={16} class="text-gray-600 mt-1 select-none" />
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center justify-between gap-2">
                        <strong class="text-sm font-semibold text-gray-200 truncate">{booking.contact?.name || 'N/A'}</strong>
                        <button class="bg-transparent border-none text-red-500 p-1 rounded hover:bg-red-500/10 transition-colors" on:click={() => deleteBookingHandler(booking.id)} title={deleteText}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div class="mt-1 grid grid-cols-2 gap-2 text-xs">
                        <div class="text-gray-300 font-medium truncate">{booking.package_name}</div>
                        <div class="text-gray-400 text-right truncate">{formatDate(booking.date)}</div>
                        <div class="text-green-500 font-semibold">{formatCurrency(booking.total_price)}</div>
                        <div class="text-gray-400 text-right truncate">{booking.employee?.name || 'Tidak ditentukan'}</div>
                      </div>
                      <div class="mt-2 text-xs text-gray-400 truncate">
                        {#if booking.contact?.whatsapp}
                          <a href={`https://wa.me/${booking.contact.whatsapp.replace(/[^0-9]/g,'')}`} target="_blank" class="inline-flex items-center gap-1 text-gray-400 no-underline hover:text-gray-200 transition-colors">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" width="14" alt="WA" />
                            {booking.contact.whatsapp}
                          </a>
                        {:else}
                          N/A
                        {/if}
                      </div>
                    </div>
                  </div>
                  <div class="flex justify-end gap-1 pt-1">
                    <button class="bg-transparent border-none text-gray-400 p-1 rounded hover:bg-white/10 transition-colors" on:click={() => openViewModal(booking)} title={viewText}>
                      <Eye size={16} />
                    </button>
                    <button class="bg-transparent border-none text-gray-400 p-1 rounded hover:bg-white/10 transition-colors" on:click={() => openEditModal(booking)} title={editText}>
                      <Edit size={16} />
                    </button>
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
            <button class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all" on:click={goToCurrentMonth}>
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
                  class="min-h-[120px] p-2 relative transition-all duration-200 hover:scale-105 hover:shadow-lg {day.isCurrentMonth ? 'bg-gray-800 border border-gray-600' : 'bg-gray-950 border border-gray-800 text-gray-500'} {day.isToday ? 'bg-blue-900 border-blue-400 border-2' : ''}"
                  role="button"
                  tabindex="0"
                  on:click={() => openCalendarDayModal(day)}
                  on:keydown={(e) => { if(e.key==='Enter' || e.key===' ') { e.preventDefault(); openCalendarDayModal(day); } }}
                  style={(!day.isToday && day.bookings.length > 0) ? `border-color: ${getStatusColor(day.bookings[0].status)};` : ''}
                >
                  <!-- Date Number -->
                  <div class="text-sm font-bold text-gray-200 mb-2 flex items-center justify-between">
                    <span>{day.date.getDate()}</span>
                    {#if day.bookings.length > 0}
                      <span class="w-2 h-2 rounded-full" style="background-color: {getStatusColor(day.bookings[0].status)}"></span>
                    {/if}
                  </div>
                  
                  <!-- Bookings -->
                  {#if day.bookings.length > 0}
                    <div class="space-y-1">
                      {#each day.bookings.slice(0, 3) as booking}
                        <button type="button" class="w-full text-left text-white p-2 rounded-lg text-xs transition-all shadow-md" style="background-color: {getStatusColor(booking.status)}" on:click|stopPropagation={() => openViewModal(booking)}>
                          <div class="font-bold mb-1 text-[10px] uppercase tracking-wide">{booking.contact?.name || 'N/A'}</div>
                          <div class="text-[9px] opacity-90">{booking.package_name}</div>
                          <div class="text-[8px] opacity-80 mt-1 flex items-center justify-between">
                            <span>RM {booking.total_price}</span>
                            <span class="px-1 py-0.5 bg-white/20 rounded text-[7px]">{getStatusText(booking.status)}</span>
                          </div>
                        </button>
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

  /* Animasi halus saat kanban refresh senyap */
  .animate-kanbanPulse {
    animation: kanbanPulse 0.6s ease-in-out;
  }
  @keyframes kanbanPulse {
    0% { box-shadow: 0 0 0 0 rgba(34,197,94,0.0); }
    30% { box-shadow: 0 0 0 6px rgba(34,197,94,0.08); }
    60% { box-shadow: 0 0 0 3px rgba(34,197,94,0.05); }
    100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.0); }
  }

  /* Animasi slide in untuk kartu kanban */
  .animate-slideInFromLeft {
    animation: slideInFromLeft 0.5s ease-out forwards;
  }
  @keyframes slideInFromLeft {
    0% {
      opacity: 0;
      transform: translateX(-20px) translateY(10px);
    }
    100% {
      opacity: 1;
      transform: translateX(0) translateY(0);
    }
  }

  /* Animasi pulse halus untuk indikator refresh */
  .animate-refreshGlow {
    animation: refreshGlow 1s ease-in-out infinite;
  }
  @keyframes refreshGlow {
    0%, 100% {
      box-shadow: 0 0 5px rgba(34,197,94,0.3);
    }
    50% {
      box-shadow: 0 0 15px rgba(34,197,94,0.6), 0 0 25px rgba(34,197,94,0.3);
    }
  }

</style>
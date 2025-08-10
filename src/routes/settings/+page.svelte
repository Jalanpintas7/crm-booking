<script>
  import { currentLanguage, translations } from '../../lib/stores/language.js';
  import { getAvailability, getHolidays, getPricePackages, createPricePackage, updatePricePackage, deletePricePackage, createHoliday, deleteHoliday, updateAvailabilityByDay } from '../../lib/supabase.js';
  import { Settings, User, Bell, Shield, Palette, Database, HelpCircle, LogOut, Plus, Trash2 } from 'lucide-svelte';
  import { onMount } from 'svelte';
  
  $: language = $currentLanguage;
  $: currentTranslations = translations[language] || translations.ms;

  function t(key) {
    return currentTranslations[key] || key;
  }

  // State variables
  let loading = true;
  let error = null;
  
  // Modal notification state
  let showNotification = false;
  let notificationMessage = '';
  let notificationType = 'success'; // 'success' or 'error'
  
  // Availability data from database
  let availabilityData = [];

  let selectedDate = '';
  let holidayDescription = '';
  let isHoliday = false;
  let selectedMonth = new Date().getMonth();
  let selectedYear = new Date().getFullYear();
  
  // Data from Supabase
  let holidays = [];
  let packages = [];

  async function saveAvailability() {
    try {
      console.log('Saving availability data:', availabilityData);
      
      // Save each day's availability to database
      for (const dayData of availabilityData) {
        const dataToSave = {
          start_date: formatTimeForDB(dayData.start_date),
          end_date: formatTimeForDB(dayData.end_date),
          is_active: Boolean(dayData.is_active) // Ensure it's a proper boolean
        };
        
        // Convert English day name to Malay for database
        const malayDay = mapDayToMalay(dayData.day);
        console.log(`Saving ${dayData.day} (${malayDay}):`, dataToSave);
        
        await updateAvailabilityByDay(malayDay, dataToSave);
      }
      
      // Show success message
      console.log('Availability settings saved successfully');
      showNotificationModal('Tetapan ketersediaan berjaya disimpan!', 'success');
      
      // Reload data to ensure consistency
      await loadDataFromSupabase();
    } catch (err) {
      error = 'Gagal menyimpan tetapan ketersediaan. Silakan coba lagi.';
      console.error('Error saving availability:', err);
      showNotificationModal('Ralat: ' + err.message, 'error');
    }
  }

  async function addHoliday() {
    if (selectedDate && holidayDescription) {
      try {
        const holidayData = {
          date: selectedDate,
          description: holidayDescription,
          isHoliday: isHoliday
        };
        const newHoliday = await createHoliday(holidayData);
        holidays = [...holidays, newHoliday];
        
        // Reset form
        selectedDate = '';
        holidayDescription = '';
        isHoliday = false;
      } catch (err) {
        error = 'Gagal menambah cuti. Silakan coba lagi.';
        console.error('Error adding holiday:', err);
      }
    }
  }

  async function deleteHolidayHandler(id) {
    try {
      await deleteHoliday(id);
      holidays = holidays.filter(holiday => holiday.id !== id);
    } catch (err) {
      error = 'Gagal menghapus cuti. Silakan coba lagi.';
      console.error('Error deleting holiday:', err);
    }
  }

  function getMonthName(monthIndex) {
    const months = [
      'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
      'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'
    ];
    return months[monthIndex];
  }

  function getHolidaysInMonth(month, year) {
    return holidays.filter(holiday => {
      const holidayDate = new Date(holiday.date);
      return holidayDate.getMonth() === month && holidayDate.getFullYear() === year;
    });
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ms-MY', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  function formatTimeForInput(timeString) {
    // Convert HH:MM:SS to HH:MM for HTML time input
    if (!timeString) return '09:00';
    return timeString.substring(0, 5);
  }

  function formatTimeForDB(timeString) {
    // Convert HH:MM to HH:MM:SS for database
    if (!timeString) return '09:00:00';
    return timeString.length === 5 ? timeString + ':00' : timeString;
  }

  function mapDayToMalay(englishDay) {
    const dayMapping = {
      'monday': 'Isnin',
      'tuesday': 'Selasa', 
      'wednesday': 'Rabu',
      'thursday': 'Khamis',
      'friday': 'Jumaat',
      'saturday': 'Sabtu',
      'sunday': 'Ahad'
    };
    return dayMapping[englishDay] || englishDay;
  }

  function mapDayToEnglish(malayDay) {
    const dayMapping = {
      'Isnin': 'monday',
      'Selasa': 'tuesday',
      'Rabu': 'wednesday', 
      'Khamis': 'thursday',
      'Jumaat': 'friday',
      'Sabtu': 'saturday',
      'Ahad': 'sunday'
    };
    return dayMapping[malayDay] || malayDay;
  }

  function showNotificationModal(message, type = 'success') {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    
    // Auto hide after 3 seconds
    setTimeout(() => {
      showNotification = false;
    }, 3000);
  }

  function hideNotification() {
    showNotification = false;
  }

  const days = [
    { key: 'monday', label: 'Isnin' },
    { key: 'tuesday', label: 'Selasa' },
    { key: 'wednesday', label: 'Rabu' },
    { key: 'thursday', label: 'Khamis' },
    { key: 'friday', label: 'Jumaat' },
    { key: 'saturday', label: 'Sabtu' },
    { key: 'sunday', label: 'Ahad' }
  ];

  const months = [
    { value: 0, label: 'Januari' },
    { value: 1, label: 'Februari' },
    { value: 2, label: 'Mac' },
    { value: 3, label: 'April' },
    { value: 4, label: 'Mei' },
    { value: 5, label: 'Jun' },
    { value: 6, label: 'Julai' },
    { value: 7, label: 'Ogos' },
    { value: 8, label: 'September' },
    { value: 9, label: 'Oktober' },
    { value: 10, label: 'November' },
    { value: 11, label: 'Disember' }
  ];

  const years = [2024, 2025, 2026, 2027, 2028];

  // Brand & Custom Settings (stored in localStorage)
  let brand = { name: 'Nama Usaha' };
  let statuses = [
    { id: 1, name: 'Baru', color: '#3b82f6' },
    { id: 2, name: 'Dalam Proses', color: '#f59e0b' },
    { id: 3, name: 'Selesai', color: '#22c55e' }
  ];

  const STORAGE_KEY = 'app_settings_v1';

  onMount(async () => {
    // Load local settings from localStorage
    try {
      const savedRaw = localStorage.getItem(STORAGE_KEY);
      if (savedRaw) {
        const saved = JSON.parse(savedRaw);
        if (saved.brand) brand = saved.brand;
        if (Array.isArray(saved.statuses)) statuses = saved.statuses;
      }
    } catch {}

    // Load data from Supabase
    await loadDataFromSupabase();
  });

  async function loadDataFromSupabase() {
    try {
      loading = true;
      error = null;

      // Load data in parallel
      const [holidaysData, packagesData, availabilityDataFromDB] = await Promise.all([
        getHolidays(),
        getPricePackages(),
        getAvailability()
      ]);

      holidays = holidaysData;
      packages = packagesData.map(pkg => ({
        id: pkg.id,
        name: pkg.pakej,
        price: pkg.harga
      }));

      // Process availability data from DB
      const daysOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      
      // Create availability data array with default values for missing days
      availabilityData = daysOrder.map(day => {
        // Find existing data by converting the day name to Malay for comparison
        const malayDay = mapDayToMalay(day);
        const existingData = availabilityDataFromDB.find(item => item.day === malayDay);
        
        if (existingData) {
          return {
            id: existingData.id,
            day: day, // Keep using English day names internally
            start_date: formatTimeForInput(existingData.start_date) || '09:00',
            end_date: formatTimeForInput(existingData.end_date) || '18:00',
            is_active: Boolean(existingData.is_active) // Ensure it's a proper boolean
          };
        } else {
          // Create default entry for days not in database
          return {
            id: null, // Will be created when saved
            day: day,
            start_date: '09:00',
            end_date: '18:00',
            is_active: day !== 'saturday' && day !== 'sunday' // Default: weekdays enabled
          };
        }
      });

    } catch (err) {
      error = 'Gagal memuat data dari server. Silakan coba lagi.';
      console.error('Error loading data from Supabase:', err);
    } finally {
      loading = false;
    }
  }

  $: saveAllSettings();

  function saveAllSettings() {
    try {
      const payload = { brand, statuses, packages };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {}
  }

  function addStatus() {
    const newItem = { id: Date.now(), name: 'Status Baru', color: '#64748b' };
    statuses = [...statuses, newItem];
  }

  function removeStatus(id) {
    statuses = statuses.filter((s) => s.id !== id);
  }

  async function addPackage() {
    try {
      const packageData = {
        pakej: 'Pakej Baru',
        harga: 0
      };
      const newPkg = await createPricePackage(packageData);
      packages = [...packages, {
        id: newPkg.id,
        name: newPkg.pakej,
        price: newPkg.harga
      }];
    } catch (err) {
      error = 'Gagal menambah pakej. Silakan coba lagi.';
      console.error('Error adding package:', err);
    }
  }

  async function removePackage(id) {
    try {
      await deletePricePackage(id);
      packages = packages.filter((p) => p.id !== id);
    } catch (err) {
      error = 'Gagal menghapus pakej. Silakan coba lagi.';
      console.error('Error deleting package:', err);
    }
  }

  async function updatePackage(id, name, price) {
    try {
      const packageData = {
        pakej: name,
        harga: parseFloat(price) || 0
      };
      await updatePricePackage(id, packageData);
    } catch (err) {
      error = 'Gagal memperbarui pakej. Silakan coba lagi.';
      console.error('Error updating package:', err);
    }
  }
</script>

<div class="min-h-[calc(100vh-100px)] mt-10 w-full max-w-none p-0">
  <div class="flex justify-between items-center mb-8 px-5 max-w-6xl mx-auto">
    <h1 class="text-3xl font-semibold text-gray-200 m-0">Tetapan</h1>
  </div>

  {#if error}
    <div class="bg-red-600 text-white p-3 rounded-md mb-5 max-w-6xl mx-auto flex justify-between items-center">
      <p class="m-0 text-sm">{error}</p>
      <button class="bg-white/20 text-white border-0 px-3 py-1.5 rounded text-xs cursor-pointer transition-colors hover:bg-white/30" on:click={loadDataFromSupabase}>
        Muat Ulang
      </button>
    </div>
  {/if}

  {#if loading}
    <div class="px-5 max-w-6xl mx-auto">
      <div class="text-center py-15 text-gray-400">
        <p class="m-0 text-base">Memuat tetapan...</p>
      </div>
    </div>
  {:else}
    <div class="px-5 max-w-6xl mx-auto">
      <!-- Brand Info -->
      <div class="bg-neutral-900 rounded-lg p-8 border border-neutral-700 mb-8">
        <h2 class="text-xl font-semibold text-gray-200 m-0 mb-2.5">Maklumat Brand</h2>
        <p class="text-gray-400 text-sm m-0 mb-6">Tetapkan nama brand/perusahaan anda</p>
        <div class="flex flex-col gap-2">
          <label for="brandName" class="text-gray-200 text-sm font-medium">Nama Brand</label>
          <input 
            id="brandName" 
            type="text" 
            bind:value={brand.name} 
            placeholder="Masukkan nama brand" 
            class="bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2.5 text-gray-200 text-sm transition-colors focus:outline-none focus:border-green-500"
          />
        </div>
      </div>

      <!-- Date Availability Settings -->
      <div class="bg-neutral-900 rounded-lg p-8 border border-neutral-700 mb-8">
        <h2 class="text-xl font-semibold text-gray-200 m-0 mb-2.5">Tetapan Ketersediaan Tarikh</h2>
        <p class="text-gray-400 text-sm m-0 mb-6">Tetapkan hari dan masa yang tersedia untuk tempahan</p>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 mb-6">
          {#each availabilityData as dayData, index}
            <div class="bg-neutral-950 rounded-md p-5 border border-neutral-700">
              <div class="mb-4">
                <label class="flex items-center gap-2.5 cursor-pointer">
                  <input 
                    type="checkbox" 
                    bind:checked={dayData.is_active}
                    class="w-4.5 h-4.5 accent-green-500"
                  />
                  <span class="text-gray-200 text-base font-medium">{days[index]?.label || dayData.day}</span>
                </label>
              </div>
              <div class="flex gap-4 {!dayData.is_active ? 'opacity-50' : ''}">
                <div class="flex flex-col gap-1.5 flex-1">
                  <label for={`start-${dayData.day}`} class="text-gray-400 text-xs">Mula:</label>
                  <input 
                    id={`start-${dayData.day}`}
                    type="time" 
                    bind:value={dayData.start_date}
                    disabled={!dayData.is_active}
                    class="bg-neutral-800 border border-neutral-700 rounded px-2 py-2 text-gray-200 text-sm transition-colors focus:outline-none focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div class="flex flex-col gap-1.5 flex-1">
                  <label for={`end-${dayData.day}`} class="text-gray-400 text-xs">Tamat:</label>
                  <input 
                    id={`end-${dayData.day}`}
                    type="time" 
                    bind:value={dayData.end_date}
                    disabled={!dayData.is_active}
                    class="bg-neutral-800 border border-neutral-700 rounded px-2 py-2 text-gray-200 text-sm transition-colors focus:outline-none focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          {/each}
        </div>
        
        <button 
          class="bg-green-500 text-white border-0 px-6 py-3 rounded-md text-sm font-medium cursor-pointer transition-colors hover:bg-green-600" 
          on:click={saveAvailability}
        >
          Simpan Ketersediaan
        </button>
      </div>

      <!-- Holiday Management -->
      <div class="bg-neutral-900 rounded-lg p-8 border border-neutral-700 mb-8">
        <h2 class="text-xl font-semibold text-gray-200 m-0 mb-2.5">Pengurusan Cuti</h2>
        <p class="text-gray-400 text-sm m-0 mb-6">Tambah dan urus tarikh cuti</p>
        
        <div class="bg-neutral-950 rounded-md p-5 border border-neutral-700 mb-6">
          <div class="flex flex-col md:flex-row gap-5 mb-4">
            <div class="flex flex-col gap-2 flex-1">
              <label for="holidayDate" class="text-gray-200 text-sm font-medium">Tarikh</label>
              <input 
                type="date" 
                id="holidayDate"
                bind:value={selectedDate}
                required
                class="bg-neutral-800 border border-neutral-700 rounded-md px-3 py-3 text-gray-200 text-sm transition-colors focus:outline-none focus:border-green-500"
              />
            </div>
            <div class="flex flex-col gap-2 flex-1">
              <label for="holidayDescription" class="text-gray-200 text-sm font-medium">Keterangan</label>
              <input 
                type="text" 
                id="holidayDescription"
                bind:value={holidayDescription}
                placeholder="Masukkan keterangan cuti"
                required
                class="bg-neutral-800 border border-neutral-700 rounded-md px-3 py-3 text-gray-200 text-sm transition-colors focus:outline-none focus:border-green-500 placeholder:text-neutral-600"
              />
            </div>
          </div>
          
          <div class="flex flex-col md:flex-row gap-5">
            <div class="flex flex-col gap-2 flex-1">
              <label class="flex items-center gap-2.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  bind:checked={isHoliday}
                  class="w-4.5 h-4.5 accent-green-500"
                />
                <span class="text-gray-200 text-sm">Cuti</span>
              </label>
            </div>
            <button 
              class="bg-green-500 text-white border-0 px-6 py-3 rounded-md text-sm font-medium cursor-pointer transition-colors hover:bg-green-600 self-end"
              on:click={addHoliday}
            >
              Tambah Cuti
            </button>
          </div>
        </div>

        <!-- Holiday List -->
        <div class="bg-neutral-950 rounded-md p-5 border border-neutral-700">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
            <h3 class="text-gray-200 text-lg m-0">Senarai Cuti</h3>
            <div class="flex gap-2.5 justify-center">
              <select 
                bind:value={selectedMonth}
                class="bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-gray-200 text-sm cursor-pointer focus:outline-none focus:border-green-500"
              >
                {#each months as month}
                  <option value={month.value}>{month.label}</option>
                {/each}
              </select>
              <select 
                bind:value={selectedYear}
                class="bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-gray-200 text-sm cursor-pointer focus:outline-none focus:border-green-500"
              >
                {#each years as year}
                  <option value={year}>{year}</option>
                {/each}
              </select>
            </div>
          </div>
          
          <div class="flex flex-col gap-2.5">
            {#if getHolidaysInMonth(selectedMonth, selectedYear).length === 0}
              <div class="text-center py-8 text-gray-400">
                <p class="m-0">Tiada cuti untuk {getMonthName(selectedMonth)} {selectedYear}</p>
              </div>
            {:else}
              {#each getHolidaysInMonth(selectedMonth, selectedYear) as holiday}
                <div class="flex justify-between items-center bg-neutral-800 rounded-md p-4 border border-neutral-700">
                  <div class="flex flex-col gap-1.5">
                    <div class="text-gray-200 text-base font-semibold">{formatDate(holiday.date)}</div>
                    <div class="text-gray-400 text-sm">{holiday.description}</div>
                    <div class="text-green-500 text-xs font-medium">
                      {holiday.isHoliday ? 'Cuti' : 'Bukan Cuti'}
                    </div>
                  </div>
                  <button 
                    class="bg-transparent border-0 text-red-400 text-lg cursor-pointer p-1.5 rounded transition-colors hover:bg-red-400/10"
                    on:click={() => deleteHolidayHandler(holiday.id)}
                    title="Padam cuti"
                  >
                    ×
                  </button>
                </div>
              {/each}
            {/if}
          </div>
        </div>
      </div>

      <!-- Custom Statuses -->
      <div class="bg-neutral-900 rounded-lg p-8 border border-neutral-700 mb-8">
        <h2 class="text-xl font-semibold text-gray-200 m-0 mb-2.5">Custom Status</h2>
        <p class="text-gray-400 text-sm m-0 mb-6">Tambah, padam, dan ubah warna status</p>
        <div class="flex flex-col gap-2.5">
          {#each statuses as status (status.id)}
            <div class="flex items-center gap-2.5 bg-neutral-950 border border-neutral-700 rounded-md p-2.5">
              <input
                class="bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2.5 text-gray-200 text-sm flex-1"
                type="text"
                bind:value={status.name}
                placeholder="Nama status"
              />
              <input
                class="w-10 h-8 border border-neutral-700 rounded-md bg-neutral-800 p-0"
                type="color"
                bind:value={status.color}
                aria-label={`Warna untuk ${status.name}`}
              />
              <span class="inline-block w-6 h-6 rounded-full border border-neutral-700 ml-1" style={`background:${status.color}`}></span>
              <button class="inline-flex items-center justify-center w-8 h-8 bg-red-500/20 text-red-400 border-0 rounded cursor-pointer transition-colors hover:bg-red-500/30" on:click={() => removeStatus(status.id)} title="Padam status">
                <Trash2 size={16} />
              </button>
            </div>
          {/each}
        </div>
        <button class="inline-flex items-center gap-2 bg-green-500 text-white border-0 px-3.5 py-2.5 rounded-md text-sm cursor-pointer mt-3" on:click={addStatus}>
          <Plus size={16}/> Tambah Status
        </button>
      </div>

      <!-- Packages & Pricing -->
      <div class="bg-neutral-900 rounded-lg p-8 border border-neutral-700 mb-8">
        <h2 class="text-xl font-semibold text-gray-200 m-0 mb-2.5">Pakej & Harga</h2>
        <p class="text-gray-400 text-sm m-0 mb-6">Tambah, padam, dan ubah nama serta harga pakej</p>
        <div class="flex flex-col gap-2.5">
          {#each packages as pkg (pkg.id)}
            <div class="flex items-center gap-2.5 bg-neutral-950 border border-neutral-700 rounded-md p-2.5">
              <input 
                class="bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2.5 text-gray-200 text-sm flex-1"
                type="text" 
                bind:value={pkg.name} 
                placeholder="Nama pakej"
                on:blur={() => updatePackage(pkg.id, pkg.name, pkg.price)}
              />
              <div class="inline-flex items-center border border-neutral-700 rounded-md overflow-hidden">
                <span class="bg-neutral-700 text-gray-400 px-2.5 py-2 border-r border-neutral-700">RM</span>
                <input 
                  class="bg-neutral-800 border-0 px-3 py-2.5 text-gray-200 text-sm w-20"
                  type="number" 
                  min="0" 
                  step="1" 
                  bind:value={pkg.price}
                  on:blur={() => updatePackage(pkg.id, pkg.name, pkg.price)}
                />
              </div>
              <button class="inline-flex items-center justify-center w-8 h-8 bg-red-500/20 text-red-400 border-0 rounded cursor-pointer transition-colors hover:bg-red-500/30" on:click={() => removePackage(pkg.id)} title="Padam pakej">
                <Trash2 size={16} />
              </button>
            </div>
          {/each}
        </div>
        <button class="inline-flex items-center gap-2 bg-green-500 text-white border-0 px-3.5 py-2.5 rounded-md text-sm cursor-pointer mt-3" on:click={addPackage}>
          <Plus size={16}/> Tambah Pakej
        </button>
      </div>
    </div>
  {/if}

  <!-- Notification Modal -->
  {#if showNotification}
    <div 
      class="fixed inset-0 bg-black/60 flex justify-center items-center z-[1000] animate-[fadeIn_0.2s_ease-out] p-5"
      role="dialog" 
      aria-modal="true"
      tabindex="-1"
      on:click={hideNotification}
      on:keydown={(e) => e.key === 'Escape' && hideNotification()}
    >
      <div class={`bg-neutral-800 rounded-xl border max-w-md w-full animate-[slideIn_0.3s_ease-out] shadow-[0_10px_30px_rgba(0,0,0,0.4)] relative ${notificationType === 'success' ? 'border-green-500 shadow-[0_10px_30px_rgba(34,197,94,0.1)]' : 'border-red-400 shadow-[0_10px_30px_rgba(239,68,68,0.1)]'}`}>
        <div class="flex items-start p-6 gap-4 relative pr-12">
          <div class={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full mt-0.5 ${notificationType === 'success' ? 'bg-green-500/15 text-green-500' : 'bg-red-400/15 text-red-400'}`}>
            {#if notificationType === 'success'}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            {:else}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12 C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            {/if}
          </div>
          <div class="flex-1 text-gray-200 text-sm leading-6 font-normal m-0 break-words">
            {notificationMessage}
          </div>
          <button 
            class="absolute top-3 right-3 bg-white/5 border border-white/10 text-gray-400 cursor-pointer p-1.5 rounded-md transition-all duration-200 flex items-center justify-center w-7 h-7 flex-shrink-0 hover:bg-white/10 hover:border-white/20 hover:text-gray-200 hover:scale-105 active:scale-95"
            on:click={hideNotification}
            aria-label="Tutup notifikasi"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideIn {
    from { 
      opacity: 0; 
      transform: translateY(-20px) scale(0.95); 
    }
    to { 
      opacity: 1; 
      transform: translateY(0) scale(1); 
    }
  }

  /* Mobile responsive adjustments */
  @media (max-width: 768px) {
    .min-h-\[calc\(100vh-100px\)\] {
      padding: 0 15px;
    }
    
    .text-3xl {
      font-size: 1.5rem;
    }
    
    .p-8 {
      padding: 20px;
    }
    
    .grid-cols-1.lg\:grid-cols-2.xl\:grid-cols-3 {
      grid-template-columns: 1fr;
      gap: 15px;
    }
    
    .flex.gap-4 {
      flex-direction: column;
      gap: 10px;
    }
    
    .flex.flex-col.md\:flex-row.gap-5 {
      flex-direction: column;
      gap: 15px;
    }
    
    .flex.flex-col.md\:flex-row.justify-between.items-start.md\:items-center.gap-4 {
      flex-direction: column;
      gap: 15px;
      align-items: stretch;
    }
    
    .flex.gap-2\.5.justify-center {
      justify-content: center;
    }
    
    /* Notification Modal Mobile */
    .fixed.inset-0.bg-black\/60.flex.justify-center.items-center {
      padding: 15px;
      align-items: flex-start;
      padding-top: 60px;
    }
    
    .max-w-md {
      max-width: 100%;
      border-radius: 8px;
    }
    
    .flex.items-start.p-6.gap-4.relative.pr-12 {
      padding: 20px;
      gap: 12px;
      padding-right: 45px;
    }
    
    .w-10.h-10 {
      width: 36px;
      height: 36px;
    }
    
    .text-sm.leading-6 {
      font-size: 14px;
      line-height: 1.4;
    }
    
    .absolute.top-3.right-3 {
      top: 10px;
      right: 10px;
      width: 26px;
      height: 26px;
      padding: 5px;
    }
  }

  @media (max-width: 480px) {
    .text-3xl {
      font-size: 1.25rem;
    }
    
    .p-8 {
      padding: 15px;
    }
    
    .text-xl {
      font-size: 18px;
    }
    
    .p-5 {
      padding: 15px;
    }
    
    /* Extra small screens notification modal */
    .fixed.inset-0.bg-black\/60.flex.justify-center.items-center {
      padding: 10px;
      padding-top: 40px;
    }
    
    .max-w-md {
      border-radius: 6px;
    }
    
    .flex.items-start.p-6.gap-4.relative.pr-12 {
      padding: 16px;
      gap: 10px;
      padding-right: 40px;
    }
    
    .w-10.h-10 {
      width: 32px;
      height: 32px;
    }
    
    .text-sm.leading-6 {
      font-size: 13px;
      line-height: 1.3;
    }
    
    .absolute.top-3.right-3 {
      top: 8px;
      right: 8px;
      width: 24px;
      height: 24px;
      padding: 4px;
      border-radius: 4px;
    }
    
    .absolute.top-3.right-3 svg {
      width: 14px;
      height: 14px;
    }
  }
</style>
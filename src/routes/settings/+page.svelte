<script>
  import { currentLanguage, translations } from '../../lib/stores/language.js';
  import { getAvailability, getHolidays, getPricePackages, createPricePackage, updatePricePackage, deletePricePackage, updateAvailabilityByDay, getColors, createColor, updateColor, deleteColor, resetToDefaultColors, getFirstBrand, createBrand, updateBrand } from '../../lib/supabase.js';
  import { colors, refreshColors } from '../../lib/stores/colors.js';
  import { Settings, User, Bell, Shield, Palette, Database, HelpCircle, LogOut, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-svelte';
  import { onMount } from 'svelte';
  import HolidayManagement from '../../lib/components/HolidayManagement.svelte';
  
  $: language = $currentLanguage;
  $: currentTranslations = translations[language] || translations.ms;
  
  // Create reactive variables for all translated text to ensure immediate updates
  $: customStatusText = currentTranslations['custom_status'] || 'custom_status';
  $: customStatusDescriptionText = currentTranslations['custom_status_description'] || 'custom_status_description';
  $: addStatusText = currentTranslations['add_status'] || 'add_status';
  $: resetToDefaultText = currentTranslations['reset_to_default'] || 'reset_to_default';
  $: statusUpdatedText = currentTranslations['status_updated'] || 'status_updated';
  $: statusAddedText = currentTranslations['status_added'] || 'status_added';
  $: statusDeletedText = currentTranslations['status_deleted'] || 'status_deleted';
  $: resetSuccessText = currentTranslations['reset_success'] || 'reset_success';
  $: settingsTitleText = currentTranslations['settings_title'] || 'settings_title';
  $: brandInfoText = currentTranslations['brand_info'] || 'brand_info';
  $: brandInfoDescriptionText = currentTranslations['brand_info_description'] || 'brand_info_description';
  $: brandNameText = currentTranslations['brand_name'] || 'brand_name';
  $: enterBrandNameText = currentTranslations['enter_brand_name'] || 'enter_brand_name';
  $: dateAvailabilitySettingsText = currentTranslations['date_availability_settings'] || 'date_availability_settings';
  $: dateAvailabilityDescriptionText = currentTranslations['date_availability_description'] || 'date_availability_description';
  $: startText = currentTranslations['start'] || 'start';
  $: endText = currentTranslations['end'] || 'end';
  $: saveAvailabilityText = currentTranslations['save_availability'] || 'save_availability';
  $: maxAppointmentText = currentTranslations['max_appointment'] || 'max_appointment';
  $: holidayManagementText = currentTranslations['holiday_management'] || 'holiday_management';
  $: holidayManagementDescriptionText = currentTranslations['holiday_management_description'] || 'holiday_management_description';
  $: dateText = currentTranslations['date'] || 'date';
  $: descriptionText = currentTranslations['description'] || 'description';
  $: addHolidayText = currentTranslations['add_holiday'] || 'add_holiday';
  $: loadingSettingsText = currentTranslations['loading_settings'] || 'loading_settings';
  $: holidayText = currentTranslations['holiday'] || 'holiday';
  $: notHolidayText = currentTranslations['not_holiday'] || 'not_holiday';
  $: holidayListText = currentTranslations['holiday_list'] || 'holiday_list';
  $: noHolidaysForMonthText = currentTranslations['no_holidays_for_month'] || 'no_holidays_for_month';
  $: deleteHolidayText = currentTranslations['delete_holiday'] || 'delete_holiday';
  $: statusNameText = currentTranslations['status_name'] || 'status_name';
  $: colorForStatusText = currentTranslations['color_for_status'] || 'color_for_status';
  $: deleteStatusText = currentTranslations['delete_status'] || 'delete_status';
  $: packagesPricingText = currentTranslations['packages_pricing'] || 'packages_pricing';
  $: packagesDescriptionText = currentTranslations['packages_description'] || 'packages_description';
  $: packageNameText = currentTranslations['package_name'] || 'package_name';
  $: addPackageText = currentTranslations['add_package'] || 'add_package';
  $: deletePackageText = currentTranslations['delete_package'] || 'delete_package';
  $: holidayAddedSuccessText = currentTranslations['holiday_added_success'] || 'holiday_added_success';
  $: holidayAddedFailedText = currentTranslations['holiday_added_failed'] || 'holiday_added_failed';
  $: holidayDeletedSuccessText = currentTranslations['holiday_deleted_success'] || 'holiday_deleted_success';
  $: holidayDeletedFailedText = currentTranslations['holiday_deleted_failed'] || 'holiday_deleted_failed';
  
  // Force immediate reactivity when language changes
  $: {
    if (language) {
      // This ensures all translated text updates immediately when language changes
      customStatusText, customStatusDescriptionText, addStatusText, resetToDefaultText,
      statusUpdatedText, statusAddedText, statusDeletedText, resetSuccessText, settingsTitleText,
      brandInfoText, brandInfoDescriptionText, brandNameText, enterBrandNameText,
      dateAvailabilitySettingsText, dateAvailabilityDescriptionText, startText, endText,
      saveAvailabilityText, maxAppointmentText, holidayManagementText, holidayManagementDescriptionText,
      dateText, descriptionText, addHolidayText, loadingSettingsText,
      holidayText, notHolidayText, holidayListText, noHolidaysForMonthText, deleteHolidayText,
      statusNameText, colorForStatusText, deleteStatusText, packagesPricingText,
      packagesDescriptionText, packageNameText, addPackageText, deletePackageText,
      holidayAddedSuccessText, holidayAddedFailedText, holidayDeletedSuccessText, holidayDeletedFailedText;
    }
  }

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

  // Holiday state is managed at parent level and bound to child component
  let selectedMonth = new Date().getMonth();
  let selectedYear = new Date().getFullYear();

  // Data from Supabase
  let holidays = [];
  let packages = [];
  // Active tab below brand info: 'availability' | 'holidays' | 'statuses' | 'packages'
  let activeTab = 'availability';
  
  // Reactive version for forcing holiday list updates (similar to Kanban)
  let holidayListVersion = 0;

  async function saveAvailability() {
    try {
      console.log('Saving availability data:', availabilityData);
      
      // Save each day's availability to database
      for (const dayData of availabilityData) {
        const dataToSave = {
          start_date: formatTimeForDB(dayData.start_date),
          end_date: formatTimeForDB(dayData.end_date),
          is_active: Boolean(dayData.is_active), // Ensure it's a proper boolean
          max_appointment: parseInt(dayData.max_appointment) || 10 // Ensure it's a number
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

  // Holiday section logic moved into HolidayManagement component

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

  // months/years moved into HolidayManagement component

  // Brand & Custom Settings (stored in localStorage)
  let brand = { id: null, name: 'Nama Usaha', description: '' };
  let statuses = [];

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
      const [holidaysData, packagesData, availabilityDataFromDB, colorsData, brandData] = await Promise.all([
        getHolidays(),
        getPricePackages(),
        getAvailability(),
        getColors(),
        getFirstBrand()
      ]);

      holidays = holidaysData;
      // Force holiday list to update after loading data
      holidayListVersion += 1;
      
      packages = packagesData.map(pkg => ({
        id: pkg.id,
        name: pkg.pakej,
        price: pkg.harga
      }));
      
      // Load colors from database
      statuses = colorsData.map(color => ({
        id: color.id,
        name: color.custom_status,
        color: color.code_color
      }));

      // Load brand first row (support name or brand_name column)
      if (brandData) {
        brand = {
          id: brandData.id,
          name: (brandData.name ?? brandData.brand_name ?? 'Nama Usaha'),
          description: (brandData.description ?? brandData.keterangan ?? '')
        };
      }

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
            is_active: Boolean(existingData.is_active), // Ensure it's a proper boolean
            max_appointment: existingData.max_appointment || 10 // Default to 10 if not set
          };
        } else {
          // Create default entry for days not in database
          return {
            id: null, // Will be created when saved
            day: day,
            start_date: '09:00',
            end_date: '18:00',
            is_active: day !== 'saturday' && day !== 'sunday', // Default: weekdays enabled
            max_appointment: 10 // Default max appointment per day
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

  async function saveBrand() {
    try {
      if (brand.id) {
        const updated = await updateBrand(brand.id, { name: brand.name, description: brand.description });
        const newName = updated.name ?? updated.brand_name ?? updated.nama_brand ?? brand.name;
        const newDesc = updated.description ?? updated.keterangan ?? updated.deskripsi ?? brand.description;
        brand = { id: updated.id, name: newName, description: newDesc };
        showNotificationModal('Maklumat brand berjaya dikemas kini!', 'success');
      } else {
        const created = await createBrand({ name: brand.name, description: brand.description });
        const newName = created.name ?? created.brand_name ?? created.nama_brand ?? brand.name;
        const newDesc = created.description ?? created.keterangan ?? created.deskripsi ?? brand.description;
        brand = { id: created.id, name: newName, description: newDesc };
        showNotificationModal('Maklumat brand berjaya disimpan!', 'success');
      }
    } catch (err) {
      console.error('Error saving brand:', err);
      showNotificationModal('Ralat menyimpan brand: ' + (err?.message || 'Gagal'), 'error');
    }
  }

  async function addStatus() {
    try {
      const newColor = await createColor({
        custom_status: 'Status Baru',
        code_color: '#64748b'
      });
      
      statuses = [...statuses, {
        id: newColor.id,
        name: newColor.custom_status,
        color: newColor.code_color
      }];
      
      // Refresh the colors store
      refreshColors();
      
      showNotificationModal(t('status_added'), 'success');
    } catch (err) {
      error = 'Gagal menambah status. Silakan coba lagi.';
      console.error('Error adding status:', err);
      showNotificationModal('Ralat: ' + err.message, 'error');
    }
  }

  async function removeStatus(id) {
    try {
      await deleteColor(id);
      statuses = statuses.filter((s) => s.id !== id);
      
      // Refresh the colors store
      refreshColors();
      
      showNotificationModal(t('status_deleted'), 'success');
    } catch (err) {
      error = 'Gagal memadam status. Silakan coba lagi.';
      console.error('Error deleting status:', err);
      showNotificationModal('Ralat: ' + err.message, 'error');
    }
  }

  async function updateStatus(id, name, color) {
    try {
      await updateColor(id, {
        custom_status: name,
        code_color: color
      });
      
      // Update local state
      statuses = statuses.map(s => 
        s.id === id ? { ...s, name, color } : s
      );
      
      // Refresh the colors store
      refreshColors();
      
      showNotificationModal(t('status_updated'), 'success');
    } catch (err) {
      error = 'Gagal mengemas kini status. Silakan coba lagi.';
      console.error('Error updating status:', err);
      showNotificationModal('Ralat: ' + err.message, 'error');
    }
  }

  async function resetToDefault() {
    try {
      const defaultColors = await resetToDefaultColors();
      statuses = defaultColors.map(color => ({
        id: color.id,
        name: color.custom_status,
        color: color.code_color
      }));
      
      // Refresh the colors store
      refreshColors();
      
      showNotificationModal(t('reset_success'), 'success');
    } catch (err) {
      error = 'Gagal mengembalikan ke default. Silakan coba lagi.';
      console.error('Error resetting to default:', err);
      showNotificationModal('Ralat: ' + err.message, 'error');
    }
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
    <h1 class="text-3xl font-semibold text-gray-200 m-0">{settingsTitleText}</h1>
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
        <p class="m-0 text-base">{loadingSettingsText}</p>
      </div>
    </div>
  {:else}
    <div class="px-5 max-w-6xl mx-auto">
      <!-- Brand Info -->
      <div class="bg-neutral-900 rounded-lg p-8 border border-neutral-700 mb-8">
        <h2 class="text-xl font-semibold text-gray-200 m-0 mb-2.5">{brandInfoText}</h2>
        <p class="text-gray-400 text-sm m-0 mb-6">{brandInfoDescriptionText}</p>
        <div class="flex flex-col gap-2">
          <label for="brandName" class="text-gray-200 text-sm font-medium">{brandNameText}</label>
          <input 
            id="brandName" 
            type="text" 
            bind:value={brand.name} 
            placeholder={enterBrandNameText} 
            class="bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2.5 text-gray-200 text-sm transition-colors focus:outline-none focus:border-green-500"
          />
          <label for="brandDescription" class="text-gray-200 text-sm font-medium mt-3">{descriptionText}</label>
          <textarea
            id="brandDescription"
            rows="3"
            bind:value={brand.description}
            placeholder={t('description')}
            class="bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2.5 text-gray-200 text-sm transition-colors focus:outline-none focus:border-green-500"
          ></textarea>
          <div class="mt-4">
            <button class="bg-green-500 text-white border-0 px-6 py-3 rounded-md text-sm font-medium cursor-pointer transition-colors hover:bg-green-600" on:click={saveBrand}>
              {t('save')}
            </button>
          </div>
        </div>
      </div>

      <!-- Tabs below Brand Info -->
      <div class="mb-6">
        <div role="tablist" aria-label="Settings tabs" class="flex flex-wrap gap-2 border-b border-neutral-700">
          <button role="tab" aria-selected={activeTab === 'availability'} class={`px-4 py-2 text-sm rounded-t-md border border-neutral-700 border-b-0 ${activeTab === 'availability' ? 'bg-neutral-900 text-green-400' : 'bg-neutral-800 text-gray-400 hover:text-gray-200'}`} on:click={() => (activeTab = 'availability')}>
            {dateAvailabilitySettingsText}
          </button>
          <button role="tab" aria-selected={activeTab === 'holidays'} class={`px-4 py-2 text-sm rounded-t-md border border-neutral-700 border-b-0 ${activeTab === 'holidays' ? 'bg-neutral-900 text-green-400' : 'bg-neutral-800 text-gray-400 hover:text-gray-200'}`} on:click={() => (activeTab = 'holidays')}>
            {holidayManagementText}
          </button>
          <button role="tab" aria-selected={activeTab === 'statuses'} class={`px-4 py-2 text-sm rounded-t-md border border-neutral-700 border-b-0 ${activeTab === 'statuses' ? 'bg-neutral-900 text-green-400' : 'bg-neutral-800 text-gray-400 hover:text-gray-200'}`} on:click={() => (activeTab = 'statuses')}>
            {customStatusText}
          </button>
          <button role="tab" aria-selected={activeTab === 'packages'} class={`px-4 py-2 text-sm rounded-t-md border border-neutral-700 border-b-0 ${activeTab === 'packages' ? 'bg-neutral-900 text-green-400' : 'bg-neutral-800 text-gray-400 hover:text-gray-200'}`} on:click={() => (activeTab = 'packages')}>
            {packagesPricingText}
          </button>
        </div>
      </div>

      {#if activeTab === 'availability'}
        <!-- Date Availability Settings -->
        <div class="bg-neutral-900 rounded-lg p-8 border border-neutral-700 mb-8">
          <h2 class="text-xl font-semibold text-gray-200 m-0 mb-2.5">{dateAvailabilitySettingsText}</h2>
          <p class="text-gray-400 text-sm m-0 mb-6">{dateAvailabilityDescriptionText}</p>
          
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
                    <label for={`start-${dayData.day}`} class="text-gray-400 text-xs">{startText}:</label>
                    <input 
                      id={`start-${dayData.day}`}
                      type="time" 
                      bind:value={dayData.start_date}
                      disabled={!dayData.is_active}
                      class="bg-neutral-800 border border-neutral-700 rounded px-2 py-2 text-gray-200 text-sm transition-colors focus:outline-none focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div class="flex flex-col gap-1.5 flex-1">
                    <label for={`end-${dayData.day}`} class="text-gray-400 text-xs">{endText}:</label>
                    <input 
                      id={`end-${dayData.day}`}
                      type="time" 
                      bind:value={dayData.end_date}
                      disabled={!dayData.is_active}
                      class="bg-neutral-800 border border-neutral-700 rounded px-2 py-2 text-gray-200 text-sm transition-colors focus:outline-none focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
                
                <!-- Max Appointment Field -->
                <div class="flex flex-col gap-1.5 pt-2.5 {!dayData.is_active ? 'opacity-50' : ''}">
                  <label for={`max-${dayData.day}`} class="text-gray-400 text-xs">{maxAppointmentText}:</label>
                  <div class="flex items-center gap-2">
                    <input 
                      id={`max-${dayData.day}`}
                      type="number" 
                      min="1"
                      max="100"
                      bind:value={dayData.max_appointment}
                      disabled={!dayData.is_active}
                      class="flex-1 bg-neutral-800 border border-neutral-700 rounded px-2 py-2 text-gray-200 text-sm transition-colors focus:outline-none focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <div class="flex flex-col">
                      <button 
                        type="button"
                        class="w-6 h-6 flex items-center justify-center bg-neutral-700 border border-neutral-600 text-gray-300 hover:bg-neutral-600 hover:text-gray-200 transition-colors rounded-t-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        on:click={() => dayData.max_appointment = Math.min(100, (dayData.max_appointment || 0) + 1)}
                        disabled={!dayData.is_active || (dayData.max_appointment || 0) >= 100}
                      >
                        <ChevronUp size={12} />
                      </button>
                      <button 
                        type="button"
                        class="w-6 h-6 flex items-center justify-center bg-neutral-700 border border-neutral-600 text-gray-300 hover:bg-neutral-600 hover:text-gray-200 transition-colors rounded-b-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        on:click={() => dayData.max_appointment = Math.max(1, (dayData.max_appointment || 0) - 1)}
                        disabled={!dayData.is_active || (dayData.max_appointment || 0) <= 1}
                      >
                        <ChevronDown size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            {/each}
          </div>
          
          <button 
            class="bg-green-500 text-white border-0 px-6 py-3 rounded-md text-sm font-medium cursor-pointer transition-colors hover:bg-green-600" 
            on:click={saveAvailability}
          >
            {saveAvailabilityText}
          </button>
        </div>
      {/if}

      {#if activeTab === 'holidays'}
        <!-- Holiday Management -->
        {#key holidayListVersion}
          <HolidayManagement
            bind:holidays={holidays}
            bind:holidayListVersion={holidayListVersion}
            bind:selectedMonth
            bind:selectedYear
            {holidayManagementText}
            {holidayManagementDescriptionText}
            {dateText}
            {descriptionText}
            {addHolidayText}
            {holidayText}
            {notHolidayText}
            {holidayListText}
            {noHolidaysForMonthText}
            {deleteHolidayText}
            {holidayAddedSuccessText}
            {holidayAddedFailedText}
            {holidayDeletedSuccessText}
            {holidayDeletedFailedText}
            showNotificationModal={showNotificationModal}
            setError={(msg) => (error = msg)}
          />
        {/key}
      {/if}

      {#if activeTab === 'statuses'}
        <!-- Custom Statuses -->
        <div class="bg-neutral-900 rounded-lg p-8 border border-neutral-700 mb-8">
          <h2 class="text-xl font-semibold text-gray-200 m-0 mb-2.5">{customStatusText}</h2>
          <p class="text-gray-400 text-sm m-0 mb-6">{customStatusDescriptionText}</p>
          <div class="flex flex-col gap-2.5">
            {#each statuses as status (status.id)}
              <div class="flex items-center gap-2.5 bg-neutral-950 border border-neutral-700 rounded-md p-2.5">
                <input
                  class="bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2.5 text-gray-200 text-sm flex-1"
                  type="text"
                  bind:value={status.name}
                  placeholder={statusNameText}
                  on:blur={() => updateStatus(status.id, status.name, status.color)}
                />
                <input
                  class="w-10 h-8 border border-neutral-700 rounded-md bg-neutral-800 p-0"
                  type="color"
                  bind:value={status.color}
                  aria-label={`${colorForStatusText} untuk ${status.name}`}
                  on:change={() => updateStatus(status.id, status.name, status.color)}
                />
                <span class="inline-block w-6 h-6 rounded-full border border-neutral-700 ml-1" style={`background:${status.color}`}></span>
                <button class="inline-flex items-center justify-center w-8 h-8 bg-red-500/20 text-red-400 border-0 rounded cursor-pointer transition-colors hover:bg-red-500/30" on:click={() => removeStatus(status.id)} title={deleteStatusText}>
                  <Trash2 size={16} />
                </button>
              </div>
            {/each}
          </div>
          <div class="flex gap-3 mt-3">
            <button class="inline-flex items-center gap-2 bg-green-500 text-white border-0 px-3.5 py-2.5 rounded-md text-sm cursor-pointer" on:click={addStatus}>
              <Plus size={16}/> {addStatusText}
            </button>
            <button class="inline-flex items-center gap-2 bg-blue-500 text-white border-0 px-3.5 py-2.5 rounded-md text-sm cursor-pointer" on:click={resetToDefault}>
              {resetToDefaultText}
            </button>
          </div>
        </div>
      {/if}

      {#if activeTab === 'packages'}
        <!-- Packages & Pricing -->
        <div class="bg-neutral-900 rounded-lg p-8 border border-neutral-700 mb-8">
          <h2 class="text-xl font-semibold text-gray-200 m-0 mb-2.5">{packagesPricingText}</h2>
          <p class="text-gray-400 text-sm m-0 mb-6">{packagesDescriptionText}</p>
          <div class="flex flex-col gap-2.5">
            {#each packages as pkg (pkg.id)}
              <div class="flex items-center gap-2.5 bg-neutral-950 border border-neutral-700 rounded-md p-2.5">
                <input 
                  class="bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2.5 text-gray-200 text-sm flex-1"
                  type="text" 
                  bind:value={pkg.name} 
                  placeholder={packageNameText}
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
                <button class="inline-flex items-center justify-center w-8 h-8 bg-red-500/20 text-red-400 border-0 rounded cursor-pointer transition-colors hover:bg-red-500/30" on:click={() => removePackage(pkg.id)} title={deletePackageText}>
                  <Trash2 size={16} />
                </button>
              </div>
            {/each}
          </div>
          <button class="inline-flex items-center gap-2 bg-green-500 text-white border-0 px-3.5 py-2.5 rounded-md text-sm cursor-pointer mt-3" on:click={addPackage}>
            <Plus size={16}/> {addPackageText}
          </button>
        </div>
      {/if}
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

  /* Custom styling for time input icons */
  input[type="time"]::-webkit-calendar-picker-indicator {
    filter: invert(1);
    opacity: 0.7;
  }
  
  input[type="time"]::-webkit-calendar-picker-indicator:hover {
    opacity: 1;
  }
  
  /* Firefox and other browsers */
  input[type="time"]::-moz-calendar-picker-indicator {
    filter: invert(1);
    opacity: 0.7;
  }
  
  input[type="time"]::-moz-calendar-picker-indicator:hover {
    opacity: 1;
  }
  
  /* Edge and IE */
  input[type="time"]::-ms-clear,
  input[type="time"]::-ms-expand {
    filter: invert(1);
    opacity: 0.7;
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
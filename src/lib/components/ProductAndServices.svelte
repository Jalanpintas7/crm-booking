<script>
  import { currentLanguage, translations } from '../stores/language.js';
  import { 
    getPricePackages, 
    createPricePackage, 
    updatePricePackage, 
    deletePricePackage,
    uploadImageToBucket,
    deleteImageFromBucket,
    getPublicUrlForImage,
    checkAvailableTables
  } from '../supabase.js';
  import { Plus, Trash2, Edit3, Save, X, Upload, Image as ImageIcon, Settings, Grid, List, Link } from 'lucide-svelte';
  import { onMount } from 'svelte';

  $: language = $currentLanguage;
  $: currentTranslations = translations[language] || translations.ms;
  
  // Create reactive variables for all translated text
  $: packagesPricingText = currentTranslations['packages_pricing'] || 'packages_pricing';
  $: packagesDescriptionText = currentTranslations['packages_description'] || 'packages_description';
  $: packageNameText = currentTranslations['package_name'] || 'package_name';
  $: addPackageText = currentTranslations['add_package'] || 'add_package';
  $: deletePackageText = currentTranslations['delete_package'] || 'delete_package';
  $: productServicesText = 'Product & Services';
  $: productServicesDescriptionText = 'Kelola produk dan layanan yang tersedia untuk booking';

  // Props
  export let showNotificationModal = () => {};

  // State variables
  let packages = [];
  let filteredPackages = [];
  let error = null;
  let loading = false;
  let editingId = null;
  let showCustomFieldsModal = false;
  let showProductDetailsModal = false;
  let selectedPackage = null;
  let selectedProductForDetails = null;
  let productBookings = [];
  let customFields = [];
  let newCustomField = { key: '', value: '', type: 'text' };
  let imageFile = null;
  let imagePreview = null;
  let showImageUploadModal = false;

  // View mode
  let viewMode = 'grid'; // 'grid' or 'list'

  // Form data for new/edit package - sesuai dengan tabel price_package
  let formData = {
    pakej: '',
    harga: 0,
    url: '',
    services: {}
  };

  const fieldTypes = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'boolean', label: 'Boolean (Ya/Tidak)' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'date', label: 'Date' },
    { value: 'url', label: 'URL' }
  ];

  onMount(async () => {
    console.log('Component mounted, checking available tables...');
    await checkAvailableTables();
    await loadPackages();
  });

  // Watch for changes in packages
  $: {
    filteredPackages = [...packages];
    console.log('Packages updated:', packages.length);
    console.log('Filtered packages updated:', filteredPackages.length);
  }

  async function loadPackages() {
    try {
      loading = true;
      console.log('Loading packages...');
      
      const packagesData = await getPricePackages();
      console.log('Raw packages data:', packagesData);
      
      if (!packagesData || packagesData.length === 0) {
        console.log('No packages data received');
        packages = [];
        return;
      }
      
      packages = packagesData.map(pkg => {
        console.log('Processing package:', pkg);
        console.log('Package services:', pkg.services);
        console.log('Services type:', typeof pkg.services);
        console.log('Services keys:', Object.keys(pkg.services || {}));
        console.log('Services is null?', pkg.services === null);
        console.log('Services is undefined?', pkg.services === undefined);
        console.log('Services is empty object?', JSON.stringify(pkg.services) === '{}');
        
        // Handle different possible column names
        const processedPkg = {
          id: pkg.id,
          pakej: pkg.pakej || pkg.name || pkg.package_name || pkg.title || '',
          harga: pkg.harga || pkg.price || pkg.cost || 0,
          url: pkg.url || pkg.link || pkg.website || '',
          services: pkg.services || pkg.details || pkg.attributes || {},
          created_at: pkg.created_at || pkg.created || new Date().toISOString()
        };
        
        console.log('Processed package:', processedPkg);
        console.log('Processed services:', processedPkg.services);
        console.log('Processed services type:', typeof processedPkg.services);
        console.log('Processed services keys:', Object.keys(processedPkg.services || {}));
        console.log('Processed services length:', Object.keys(processedPkg.services || {}).length);
        return processedPkg;
      });
      
      console.log('Final processed packages:', packages);
      console.log('Packages array length:', packages.length);
      console.log('First package:', packages[0]);
      console.log('First package services:', packages[0]?.services);
      
      // Test specific package
      if (packages.length > 0) {
        const testPkg = packages[0];
        console.log('=== TESTING FIRST PACKAGE ===');
        console.log('Test package services:', testPkg.services);
        console.log('Test services type:', typeof testPkg.services);
        console.log('Test services keys:', Object.keys(testPkg.services || {}));
        console.log('Test services length:', Object.keys(testPkg.services || {}).length);
        console.log('Test services entries:', Object.entries(testPkg.services || {}));
        
        // Test conditional logic
        console.log('Test: pkg.services exists?', !!testPkg.services);
        console.log('Test: Object.keys(pkg.services).length > 0?', Object.keys(testPkg.services || {}).length > 0);
        console.log('Test: pkg.services && Object.keys(pkg.services).length > 0?', testPkg.services && Object.keys(testPkg.services).length > 0);
      }
    } catch (err) {
      error = 'Gagal memuat data produk dan layanan. Silakan coba lagi.';
      console.error('Error loading packages:', err);
    } finally {
      loading = false;
    }
  }

  function startEdit(pkg) {
    editingId = pkg.id;
    formData = { ...pkg };
    
    // Inisialisasi customFields dengan data yang ada atau array kosong
    if (pkg.services && Object.keys(pkg.services).length > 0) {
      customFields = Object.entries(pkg.services).map(([key, value]) => ({
        key,
        value: typeof value === 'object' ? JSON.stringify(value) : String(value),
        type: typeof value === 'number' ? 'number' : 
              typeof value === 'boolean' ? 'boolean' : 'text'
      }));
    } else {
      customFields = [];
    }
    
    // Reset image preview for editing
    imagePreview = null;
    imageFile = null;
  }

  function cancelEdit() {
    editingId = null;
    formData = {
      pakej: '',
      harga: 0,
      url: '',
      services: {}
    };
    customFields = [];
    imageFile = null;
    imagePreview = null;
  }

  async function savePackage() {
    try {
      // Process custom fields into services object
      const processedServices = {};
      customFields.forEach(field => {
        if (field.key.trim()) {
          let value = field.value;
          if (field.type === 'number') {
            value = parseFloat(value) || 0;
          } else if (field.type === 'boolean') {
            value = value === 'true' || value === 'Ya';
          }
          processedServices[field.key.trim()] = value;
        }
      });

      const packageData = {
        pakej: formData.pakej,
        harga: parseFloat(formData.harga) || 0,
        url: formData.url,
        services: processedServices,
        created_at: new Date().toISOString() // Tambahkan timestamp
      };

      if (editingId && editingId !== 'new') {
        await updatePricePackage(editingId, packageData);
        showNotificationModal('Produk/Layanan berjaya dikemas kini!', 'success');
      } else {
        const newPackage = await createPricePackage(packageData);
        console.log('New package created:', newPackage);
        showNotificationModal('Produk/Layanan berjaya ditambah!', 'success');
      }

      await loadPackages();
      cancelEdit();
    } catch (err) {
      error = 'Gagal menyimpan produk/layanan. Silakan coba lagi.';
      console.error('Error saving package:', err);
      showNotificationModal('Ralat: ' + err.message, 'error');
    }
  }

  async function removePackage(id) {
    try {
      await deletePricePackage(id);
      packages = packages.filter((p) => p.id !== id);
      showNotificationModal('Produk/Layanan berjaya dihapus!', 'success');
    } catch (err) {
      error = 'Gagal menghapus produk/layanan. Silakan coba lagi.';
      console.error('Error deleting package:', err);
      showNotificationModal('Ralat: ' + err.message, 'error');
    }
  }

  function openCustomFieldsModal(pkg) {
    selectedPackage = pkg;
    customFields = Object.entries(pkg.services || {}).map(([key, value]) => ({
      key,
      value: typeof value === 'object' ? JSON.stringify(value) : String(value),
      type: typeof value === 'number' ? 'number' : 
            typeof value === 'boolean' ? 'boolean' : 'text'
    }));
    showCustomFieldsModal = true;
  }

  async function openProductDetailsModal(pkg) {
    console.log('Opening product details modal for:', pkg);
    
    selectedProductForDetails = pkg;
    productBookings = [];
    
    try {
      // Fetch bookings yang menggunakan package ini
      console.log('Fetching bookings for package:', pkg.pakej);
      
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select(`
          id,
          contact_id,
          date,
          package_name,
          total_price,
          status,
          services,
          created_at,
          contact (
            name,
            whatsapp,
            email
          )
        `)
        .eq('package_name', pkg.pakej)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching bookings:', error);
      } else {
        console.log('Bookings found:', bookings);
        productBookings = bookings || [];
      }
      
    } catch (err) {
      console.error('Error in openProductDetailsModal:', err);
    }
    
    showProductDetailsModal = true;
  }

  function closeCustomFieldsModal() {
    showCustomFieldsModal = false;
    selectedPackage = null;
    customFields = [];
    newCustomField = { key: '', value: '', type: 'text' };
  }

  function closeProductDetailsModal() {
    showProductDetailsModal = false;
    selectedProductForDetails = null;
    productBookings = [];
  }

  function addCustomField() {
    if (newCustomField.key.trim()) {
      customFields = [...customFields, { ...newCustomField }];
      newCustomField = { key: '', value: '', type: 'text' };
    }
  }

  function addCustomFieldToForm() {
    if (newCustomField.key.trim()) {
      customFields = [...customFields, { ...newCustomField }];
      newCustomField = { key: '', value: '', type: 'text' };
    }
  }

  function removeCustomField(index) {
    customFields = customFields.filter((_, i) => i !== index);
  }

  async function saveCustomFields() {
    try {
      const processedServices = {};
      customFields.forEach(field => {
        if (field.key.trim()) {
          let value = field.value;
          if (field.type === 'number') {
            value = parseFloat(value) || 0;
          } else if (field.type === 'boolean') {
            value = value === 'true' || value === 'Ya';
          }
          processedServices[field.key.trim()] = value;
        }
      });

      // Update package dengan services yang baru
      const updatedPackage = await updatePricePackage(selectedPackage.id, {
        services: processedServices,
        updated_at: new Date().toISOString() // Tambahkan timestamp update
      });

      // Update local data
      const index = packages.findIndex(p => p.id === selectedPackage.id);
      if (index !== -1) {
        packages[index] = { ...packages[index], ...updatedPackage };
        packages = [...packages];
      }

      showNotificationModal('Services berjaya disimpan!', 'success');
      closeCustomFieldsModal();
    } catch (err) {
      error = 'Gagal menyimpan services. Silakan coba lagi.';
      console.error('Error saving services:', err);
      showNotificationModal('Ralat: ' + err.message, 'error');
    }
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat('ms-MY', {
      style: 'currency',
      currency: 'MYR'
    }).format(amount);
  }

  function formatDate(dateString) {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
</script>

<div class="bg-neutral-900 rounded-lg p-8 border border-neutral-700 mb-8">
  <div class="flex justify-between items-center mb-6">
    <div>
      <h2 class="text-xl font-semibold text-gray-200 m-0 mb-2.5">{productServicesText}</h2>
      <p class="text-gray-400 text-sm m-0">{productServicesDescriptionText}</p>
    </div>
    
    <!-- Tombol Tambah Produk/Layanan -->
    <button 
      class="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg"
      on:click={() => {
        editingId = 'new';
        customFields = [];
        newCustomField = { key: '', value: '', type: 'text' };
      }}
    >
      <Plus size={16} />
      Tambah Produk/Layanan
    </button>
  </div>
  
  {#if error}
    <div class="bg-red-600 text-white p-3 rounded-md mb-5 flex justify-between items-center">
      <p class="m-0 text-sm">{error}</p>
      <button class="bg-white/20 text-white border-0 px-3 py-1.5 rounded text-xs cursor-pointer transition-colors hover:bg-white/30" on:click={loadPackages}>
        Muat Ulang
      </button>
    </div>
  {/if}

  <!-- Add/Edit Form -->
  {#if editingId !== null || !packages.length}
    <div class="bg-neutral-950 border border-neutral-700 rounded-lg p-6 mb-6">
      <h3 class="text-lg font-medium text-gray-200 mb-4">
        {editingId ? 'Edit Produk/Layanan' : 'Tambah Produk/Layanan Baru'}
      </h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label for="product-name" class="block text-sm font-medium text-gray-300 mb-2">Nama Produk/Layanan *</label>
          <input 
            id="product-name"
            type="text" 
            bind:value={formData.pakej}
            placeholder="Masukkan nama produk/layanan"
            class="w-full bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-green-500"
          />
        </div>
        
        <div>
          <label for="product-price" class="block text-sm font-medium text-gray-300 mb-2">Harga *</label>
          <div class="inline-flex items-center border border-neutral-700 rounded-md overflow-hidden w-full">
            <span class="bg-neutral-700 text-gray-400 px-3 py-2.5 border-r border-neutral-700">RM</span>
            <input 
              id="product-price"
              type="number" 
              min="0" 
              step="1000"
              bind:value={formData.harga}
              placeholder="0"
              class="bg-neutral-800 border-0 px-3 py-2.5 text-gray-200 text-sm w-full"
            />
          </div>
        </div>
        
        <div>
          <label for="product-url" class="block text-sm font-medium text-gray-300 mb-2">URL</label>
          <div class="relative">
            <Link size={16} class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              id="product-url"
              type="url" 
              bind:value={formData.url}
              placeholder="https://example.com"
              class="w-full bg-neutral-800 border border-neutral-700 rounded-md pl-10 pr-3 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-green-500"
            />
          </div>
        </div>
        

      </div>
      
      <!-- Services Section -->
      <div class="mb-6">
        <label for="services-section" class="block text-sm font-medium text-gray-300 mb-2">Services (Custom Fields)</label>
        
        <!-- Input untuk menambah field baru -->
        <div class="bg-neutral-900 border border-neutral-700 rounded-lg p-4 mb-4">
          <h4 class="text-sm font-medium text-gray-300 mb-3">Tambah Service Field Baru</h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <input 
              type="text" 
              bind:value={newCustomField.key}
              placeholder="Nama field (contoh: kategori, durasi, deskripsi)"
              class="bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-green-500"
            />
            <input 
              type="text" 
              bind:value={newCustomField.value}
              placeholder="Nilai field"
              class="bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-green-500"
            />
            <select 
              bind:value={newCustomField.type}
              class="bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-green-500"
            >
              {#each fieldTypes as type}
                <option value={type.value}>{type.label}</option>
              {/each}
            </select>
          </div>
          <button 
            type="button"
            class="inline-flex items-center gap-2 bg-blue-500 text-white border-0 px-4 py-2 rounded text-sm cursor-pointer transition-colors hover:bg-blue-600"
            on:click={addCustomFieldToForm}
          >
            <Plus size={16} />
            Tambah Service Field
          </button>
        </div>
        
        <!-- Daftar field yang sudah ada -->
        <div class="space-y-3">
          {#if customFields.length > 0}
            <h4 class="text-sm font-medium text-gray-300 mb-3">Service Fields yang Ada</h4>
            {#each customFields as field, index}
              <div class="flex items-center gap-3 bg-neutral-900 border border-neutral-700 rounded-lg p-3">
                <input 
                  type="text" 
                  bind:value={field.key}
                  placeholder="Nama field"
                  class="flex-1 bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-green-500"
                />
                <input 
                  type="text" 
                  bind:value={field.value}
                  placeholder="Nilai field"
                  class="flex-1 bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-green-500"
                />
                <select 
                  bind:value={field.type}
                  class="bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-green-500"
                >
                  {#each fieldTypes as type}
                    <option value={type.value}>{type.label}</option>
                  {/each}
                </select>
                <button 
                  type="button"
                  class="bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-2 rounded text-sm cursor-pointer hover:bg-red-500/30"
                  on:click={() => removeCustomField(index)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            {/each}
          {:else}
            <div class="text-center py-4 text-gray-400 text-sm">
              Belum ada service fields. Tambahkan field baru di atas.
            </div>
          {/if}
        </div>
      </div>
      
      <div class="flex gap-3">
        <button 
          class="bg-green-500 text-white border-0 px-6 py-2.5 rounded-md text-sm font-medium cursor-pointer transition-colors hover:bg-green-600 flex items-center gap-2"
          on:click={savePackage}
        >
          <Save size={16} />
          {editingId ? 'Update' : 'Simpan'}
        </button>
        <button 
          class="bg-neutral-600 text-white border-0 px-6 py-2.5 rounded-md text-sm font-medium cursor-pointer transition-colors hover:bg-neutral-700"
          on:click={cancelEdit}
        >
          Batal
        </button>
      </div>
    </div>
  {/if}

     <!-- Search and Filter Bar -->
   {#if packages && packages.length > 0}
    <div class="bg-neutral-950 border border-neutral-700 rounded-lg p-4 mb-6">
             <div class="flex justify-end">
         <!-- View Mode Toggle -->
         <div class="flex items-center gap-2">
           <button 
             class="p-2 rounded-md transition-colors {viewMode === 'grid' ? 'bg-green-500/20 text-green-400' : 'bg-neutral-700 text-gray-400 hover:text-gray-200'}"
             on:click={() => viewMode = 'grid'}
             title="Grid View"
           >
             <Grid size={20} />
           </button>
           <button 
             class="p-2 rounded-md transition-colors {viewMode === 'list' ? 'bg-green-500/20 text-green-400' : 'bg-neutral-700 text-gray-400 hover:text-gray-200'}"
             on:click={() => viewMode = 'list'}
             title="List View"
           >
             <List size={20} />
           </button>
         </div>
       </div>

             <!-- Results Count -->
       <div class="mt-3 text-sm text-gray-400">
         Menampilkan {packages.length} dari {packages.length} produk/layanan
       </div>
    </div>
  {/if}

  <!-- Packages List -->
  {#if loading}
    <div class="text-center py-8">
      <div class="animate-spin w-8 h-8 border-4 border-neutral-600 border-t-green-500 rounded-full mx-auto mb-4"></div>
      <p class="text-gray-400">Memuat data...</p>
    </div>
     {:else if !packages || packages.length === 0}
    <div class="text-center py-8 text-gray-400">
      <p class="mb-4">Belum ada produk/layanan</p>
      <button 
        class="bg-green-500 text-white border-0 px-6 py-2.5 rounded-md text-sm font-medium cursor-pointer transition-colors hover:bg-green-600 flex items-center gap-2 mx-auto"
        on:click={() => {
          editingId = 'new';
          customFields = [];
          newCustomField = { key: '', value: '', type: 'text' };
        }}
      >
        <Plus size={16} />
        Tambah Produk/Layanan Pertama
      </button>
    </div>

  {:else}
    <!-- Grid View -->
    {#if viewMode === 'grid'}
             <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {#each packages as pkg (pkg.id)}
          <div class="bg-neutral-950 border border-neutral-700 rounded-lg overflow-hidden hover:border-neutral-600 transition-colors">
            <!-- Content -->
            <div class="p-4">
              <div class="flex items-start justify-between mb-2">
                <h4 class="text-lg font-medium text-gray-200 mb-1 line-clamp-2">{pkg.pakej}</h4>
              </div>
              
              <!-- Services Preview -->
              <div class="mb-3">
                <div class="text-xs text-gray-500">
                  Klik "Lihat Product" untuk melihat booking dengan custom fields
                </div>
                

              </div>
              
              <!-- Price -->
              <div class="text-xl font-bold text-green-400 mb-3">
                {formatCurrency(pkg.harga)}
              </div>
              
              <!-- URL if available -->
              {#if pkg.url}
                <div class="mb-3">
                  <a 
                    href={pkg.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm"
                  >
                    <Link size={14} />
                    Lihat Detail
                  </a>
                </div>
              {/if}
              
              <!-- View Product Details Button -->
              <div class="mb-3">
                <button 
                  class="inline-flex items-center gap-1 text-green-400 hover:text-green-300 text-sm cursor-pointer"
                  on:click={() => openProductDetailsModal(pkg)}
                  title="Lihat Detail Product"
                >
                  <Link size={14} />
                  Lihat Product
                </button>
              </div>
              
              <!-- Actions -->
              <div class="flex items-center gap-2">
                <button 
                  class="bg-neutral-900 border border-gray-300 text-gray-300 p-2 rounded cursor-pointer transition-colors hover:bg-neutral-800 flex items-center justify-center"
                  on:click={() => startEdit(pkg)}
                  title="Edit"
                >
                  <Edit3 size={16} />
                </button>
                
                <button 
                  class="bg-neutral-900 border border-gray-300 text-gray-300 p-2 rounded cursor-pointer transition-colors hover:bg-neutral-800 flex items-center justify-center"
                  on:click={() => openCustomFieldsModal(pkg)}
                  title="Services"
                >
                  <Settings size={16} />
                </button>
                
                <button 
                  class="bg-neutral-900 border border-red-500 text-red-500 p-2 rounded cursor-pointer transition-colors hover:bg-neutral-800 flex items-center justify-center"
                  on:click={() => removePackage(pkg.id)}
                  title="Hapus"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <!-- List View -->
             <div class="space-y-4">
         {#each packages as pkg (pkg.id)}
          <div class="bg-neutral-950 border border-neutral-700 rounded-lg p-4">
            <div class="flex items-start gap-4">
              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between mb-2">
                  <div>
                    <h4 class="text-lg font-medium text-gray-200 mb-1">{pkg.pakej}</h4>
                  </div>
                  <div class="text-right">
                    <div class="text-xl font-bold text-green-400 mb-1">
                      {formatCurrency(pkg.harga)}
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-xs text-gray-400">
                        {formatDate(pkg.created_at)}
                      </span>

                    </div>
                  </div>
                </div>
                
                <!-- Services Preview -->
                <div class="mb-3">
                  <div class="text-xs text-gray-500">
                    Klik "Lihat Product" untuk melihat booking dengan custom fields
                  </div>
                </div>
                
                <!-- URL if available -->
                {#if pkg.url}
                  <div class="mb-3">
                    <a 
                      href={pkg.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      class="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm"
                    >
                      <Link size={14} />
                      Lihat Detail
                    </a>
                  </div>
                {/if}
                
                <!-- View Product Details Button -->
                <div class="mb-3">
                  <button 
                    class="inline-flex items-center gap-1 text-green-400 hover:text-green-300 text-sm cursor-pointer"
                    on:click={() => openProductDetailsModal(pkg)}
                    title="Lihat Detail Product"
                  >
                    <Link size={14} />
                    Lihat Product
                  </button>
                </div>
                
                <!-- Actions -->
                <div class="flex items-center gap-2">
                  <button 
                    class="bg-neutral-900 border border-gray-300 text-gray-300 p-2 rounded cursor-pointer transition-colors hover:bg-neutral-800 flex items-center justify-center"
                    on:click={() => startEdit(pkg)}
                    title="Edit"
                  >
                    <Edit3 size={16} />
                  </button>
                  
                  <button 
                    class="bg-neutral-900 border border-gray-300 text-gray-300 p-2 rounded cursor-pointer transition-colors hover:bg-neutral-800 flex items-center justify-center"
                    on:click={() => openCustomFieldsModal(pkg)}
                    title="Services"
                  >
                    <Settings size={16} />
                  </button>
                  
                  <button 
                    class="bg-neutral-900 border border-red-500 text-red-500 p-2 rounded cursor-pointer transition-colors hover:bg-neutral-800 flex items-center justify-center"
                    on:click={() => removePackage(pkg.id)}
                    title="Hapus"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
    
    
  {/if}
</div>

<!-- Custom Fields Modal -->
{#if showCustomFieldsModal}
  <div class="fixed inset-0 bg-black/60 flex justify-center items-center z-[1000] p-5">
    <div class="bg-neutral-800 rounded-xl border border-neutral-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-semibold text-gray-200">Services - {selectedPackage.pakej}</h3>
          <button 
            class="text-gray-400 hover:text-gray-200 transition-colors"
            on:click={closeCustomFieldsModal}
          >
            <X size={24} />
          </button>
        </div>
        
        <!-- Add New Service Field -->
        <div class="bg-neutral-900 border border-neutral-700 rounded-lg p-4 mb-6">
          <h4 class="text-lg font-medium text-gray-200 mb-4">Tambah Service Field Baru</h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <input 
              type="text" 
              bind:value={newCustomField.key}
              placeholder="Nama field (contoh: kategori, durasi, deskripsi)"
              class="bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-green-500"
            />
            <input 
              type="text" 
              bind:value={newCustomField.value}
              placeholder="Nilai field"
              class="bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-green-500"
            />
            <select 
              bind:value={newCustomField.type}
              class="bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-green-500"
            >
              {#each fieldTypes as type}
                <option value={type.value}>{type.label}</option>
              {/each}
            </select>
          </div>
          <button 
            class="bg-green-500 text-white border-0 px-4 py-2 rounded text-sm cursor-pointer transition-colors hover:bg-green-600"
            on:click={addCustomField}
          >
            Tambah Field
          </button>
        </div>
        
        <!-- Existing Service Fields -->
        {#if customFields.length > 0}
          <div class="space-y-3 mb-6">
            <h4 class="text-lg font-medium text-gray-200">Service Fields yang Ada</h4>
            {#each customFields as field, index}
              <div class="flex items-center gap-3 bg-neutral-900 border border-neutral-700 rounded-lg p-3">
                <div class="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input 
                    type="text" 
                    bind:value={field.key}
                    class="bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-green-500"
                  />
                  <input 
                    type="text" 
                    bind:value={field.value}
                    class="bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-green-500"
                  />
                  <select 
                    bind:value={field.type}
                    class="bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-green-500"
                  >
                    {#each fieldTypes as type}
                      <option value={type.value}>{type.label}</option>
                    {/each}
                  </select>
                </div>
                <button 
                  class="bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-2 rounded text-sm cursor-pointer hover:bg-red-500/30"
                  on:click={() => removeCustomField(index)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            {/each}
          </div>
        {/if}
        
        <!-- Action Buttons -->
        <div class="flex gap-3 justify-end">
          <button 
            class="bg-neutral-600 text-white border-0 px-6 py-2.5 rounded text-sm cursor-pointer transition-colors hover:bg-neutral-700"
            on:click={closeCustomFieldsModal}
          >
            Batal
          </button>
          <button 
            class="bg-green-500 text-white border-0 px-6 py-2.5 rounded text-sm cursor-pointer transition-colors hover:bg-green-600"
            on:click={saveCustomFields}
          >
            Simpan Services
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- Product Details Modal -->
{#if showProductDetailsModal && selectedProductForDetails}
  <div class="fixed inset-0 bg-black/60 flex justify-center items-center z-[1000] p-5">
    <div class="bg-neutral-800 rounded-xl border border-neutral-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-semibold text-gray-200">Detail Product - {selectedProductForDetails.pakej}</h3>
          <button 
            class="text-gray-400 hover:text-gray-200 transition-colors"
            on:click={closeProductDetailsModal}
          >
            <X size={24} />
          </button>
        </div>
        
        <!-- Product Basic Info -->
        <div class="bg-neutral-900 border border-neutral-700 rounded-lg p-4 mb-6">
          <h4 class="text-lg font-medium text-gray-200 mb-4">Informasi Dasar</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Nama Product</label>
              <p class="text-gray-200 text-lg font-semibold">{selectedProductForDetails.pakej}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Harga</label>
              <p class="text-green-400 text-xl font-bold">{formatCurrency(selectedProductForDetails.harga)}</p>
            </div>
            {#if selectedProductForDetails.url}
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-300 mb-2">URL</label>
                <a 
                  href={selectedProductForDetails.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="text-blue-400 hover:text-blue-300 text-sm break-all"
                >
                  {selectedProductForDetails.url}
                </a>
              </div>
            {/if}
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-300 mb-2">Tanggal Dibuat</label>
              <p class="text-gray-200">{formatDate(selectedProductForDetails.created_at)}</p>
            </div>
          </div>
        </div>
        
        <!-- Bookings dengan Custom Fields Section -->
        <div class="bg-neutral-900 border border-neutral-700 rounded-lg p-4 mb-6">
          <h4 class="text-lg font-medium text-gray-200 mb-4">Bookings dengan Custom Fields</h4>
          
          <!-- Debug Info -->
          <div class="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3 mb-4">
            <div class="text-yellow-400 text-sm">
              <strong>Debug Info:</strong><br>
              Total Bookings: {productBookings.length}<br>
              Package Name: {selectedProductForDetails.pakej}
            </div>
          </div>
          
          {#if productBookings.length > 0}
            <div class="space-y-4">
              {#each productBookings as booking}
                <div class="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
                  <!-- Booking Info -->
                  <div class="flex items-center justify-between mb-3">
                    <div>
                      <h5 class="text-sm font-medium text-gray-200">Booking #{booking.id}</h5>
                      <p class="text-xs text-gray-400">
                        {booking.contact?.name || 'N/A'} • 
                        {booking.date ? new Date(booking.date).toLocaleDateString('id-ID') : 'N/A'} • 
                        <span class="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-400">
                          {booking.status}
                        </span>
                      </p>
                    </div>
                    <div class="text-right">
                      <p class="text-sm font-medium text-green-400">
                        Rp {(booking.total_price || 0).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                  
                  <!-- Custom Fields -->
                  {#if booking.services && Object.keys(booking.services).length > 0}
                    <div class="border-t border-neutral-700 pt-3">
                      <h6 class="text-xs font-medium text-gray-300 mb-2">Custom Fields:</h6>
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {#each Object.entries(booking.services) as [key, value]}
                          <div class="bg-neutral-900 border border-neutral-600 rounded-lg p-3">
                            <div class="text-xs font-medium text-gray-400 mb-1">{key}</div>
                            <div class="text-sm text-gray-200">
                              {#if typeof value === 'boolean'}
                                <span class="px-2 py-1 rounded text-xs {value ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}">
                                  {value ? 'Ya' : 'Tidak'}
                                </span>
                              {:else if typeof value === 'number'}
                                <span class="text-blue-400 font-medium">{value}</span>
                              {:else}
                                <span class="text-gray-200">{value || '-'}</span>
                              {/if}
                            </div>
                          </div>
                        {/each}
                      </div>
                    </div>
                  {:else}
                    <div class="border-t border-neutral-700 pt-3">
                      <p class="text-xs text-gray-500">Tidak ada custom fields untuk booking ini</p>
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          {:else}
            <div class="text-center py-8">
              <div class="text-gray-400 text-sm mb-2">Belum ada booking untuk produk ini</div>
              <p class="text-xs text-gray-500">Custom fields akan muncul ketika ada booking yang menggunakan produk ini</p>
            </div>
          {/if}
        </div>
        
        <!-- Action Buttons -->
        <div class="flex gap-3 justify-end">
          <button 
            class="bg-neutral-600 text-white border-0 px-6 py-2.5 rounded text-sm cursor-pointer transition-colors hover:bg-neutral-700"
            on:click={closeProductDetailsModal}
          >
            Tutup
          </button>
          <button 
            class="bg-green-500 text-white border-0 px-6 py-2.5 rounded text-sm cursor-pointer transition-colors hover:bg-green-600"
            on:click={() => {
              closeProductDetailsModal();
              openCustomFieldsModal(selectedProductForDetails);
            }}
          >
            Edit Custom Fields
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>

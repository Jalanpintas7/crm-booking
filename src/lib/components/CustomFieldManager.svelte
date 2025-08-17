<script>
  import { currentLanguage, translations } from '../stores/language.js';
  import { 
    getCustomFieldDefinitions, 
    createCustomFieldDefinition, 
    updateCustomFieldDefinition, 
    deleteCustomFieldDefinition 
  } from '../supabase.js';
  import { Plus, Trash2, Edit3, Save, X, Settings } from 'lucide-svelte';
  import { onMount } from 'svelte';

  $: language = $currentLanguage;
  $: currentTranslations = translations[language] || translations.ms;

  // Props
  export let showNotificationModal = () => {};

  // State variables
  let customFields = [];
  let loading = false;
  let error = null;
  let editingId = null;
  let showForm = false;

  // Form data
  let formData = {
    name: '',
    field_type: 'text',
    is_required: false,
    placeholder: '',
    description: '',
    validation_rules: '',
    is_active: true
  };

  const fieldTypes = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'boolean', label: 'Boolean (Ya/Tidak)' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'date', label: 'Date' },
    { value: 'url', label: 'URL' },
    { value: 'select', label: 'Dropdown/Select' },
    { value: 'textarea', label: 'Text Area' },
    { value: 'file', label: 'File Upload' }
  ];

  onMount(async () => {
    await loadCustomFields();
  });

  async function loadCustomFields() {
    try {
      loading = true;
      const data = await getCustomFieldDefinitions();
      customFields = data || [];
    } catch (err) {
      error = 'Gagal memuat custom field definitions. Silakan coba lagi.';
      console.error('Error loading custom fields:', err);
    } finally {
      loading = false;
    }
  }

  function startEdit(field) {
    editingId = field.id;
    formData = { ...field };
    showForm = true;
  }

  function startAdd() {
    editingId = null;
    formData = {
      name: '',
      field_type: 'text',
      is_required: false,
      placeholder: '',
      description: '',
      validation_rules: '',
      is_active: true
    };
    showForm = true;
  }

  function cancelForm() {
    editingId = null;
    showForm = false;
    formData = {
      name: '',
      field_type: 'text',
      is_required: false,
      placeholder: '',
      description: '',
      validation_rules: '',
      is_active: true
    };
  }

  async function saveCustomField() {
    try {
      if (!formData.name.trim()) {
        showNotificationModal('Nama field harus diisi!', 'error');
        return;
      }

      if (editingId) {
        await updateCustomFieldDefinition(editingId, formData);
        showNotificationModal('Custom field berjaya dikemas kini!', 'success');
      } else {
        await createCustomFieldDefinition(formData);
        showNotificationModal('Custom field berjaya ditambah!', 'success');
      }

      await loadCustomFields();
      cancelForm();
    } catch (err) {
      error = 'Gagal menyimpan custom field. Silakan coba lagi.';
      console.error('Error saving custom field:', err);
      showNotificationModal('Ralat: ' + err.message, 'error');
    }
  }

  async function removeCustomField(id) {
    try {
      await deleteCustomFieldDefinition(id);
      await loadCustomFields();
      showNotificationModal('Custom field berjaya dihapus!', 'success');
    } catch (err) {
      error = 'Gagal menghapus custom field. Silakan coba lagi.';
      console.error('Error deleting custom field:', err);
      showNotificationModal('Ralat: ' + err.message, 'error');
    }
  }

  function getFieldTypeLabel(value) {
    const type = fieldTypes.find(t => t.value === value);
    return type ? type.label : value;
  }
</script>

<div class="bg-neutral-900 rounded-lg p-8 border border-neutral-700 mb-8">
  <div class="flex items-center justify-between mb-6">
    <div>
      <h2 class="text-xl font-semibold text-gray-200 m-0 mb-2.5">Custom Field Definitions</h2>
      <p class="text-gray-400 text-sm m-0">Kelola definisi custom fields untuk produk dan layanan</p>
    </div>
    <button 
      class="bg-green-500 text-white border-0 px-4 py-2.5 rounded-md text-sm font-medium cursor-pointer transition-colors hover:bg-green-600 flex items-center gap-2"
      on:click={startAdd}
    >
      <Plus size={16} />
      Tambah Custom Field
    </button>
  </div>

  {#if error}
    <div class="bg-red-600 text-white p-3 rounded-md mb-5 flex justify-between items-center">
      <p class="m-0 text-sm">{error}</p>
      <button class="bg-white/20 text-white border-0 px-3 py-1.5 rounded text-xs cursor-pointer transition-colors hover:bg-white/30" on:click={loadCustomFields}>
        Muat Ulang
      </button>
    </div>
  {/if}

  <!-- Add/Edit Form -->
  {#if showForm}
    <div class="bg-neutral-950 border border-neutral-700 rounded-lg p-6 mb-6">
      <h3 class="text-lg font-medium text-gray-200 mb-4">
        {editingId ? 'Edit Custom Field' : 'Tambah Custom Field Baru'}
      </h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Nama Field *</label>
          <input 
            type="text" 
            bind:value={formData.name}
            placeholder="Contoh: warna, ukuran, bahan"
            class="w-full bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-green-500"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Tipe Data *</label>
          <select 
            bind:value={formData.field_type}
            class="w-full bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-green-500"
          >
            {#each fieldTypes as type}
              <option value={type.value}>{type.label}</option>
            {/each}
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Placeholder</label>
          <input 
            type="text" 
            bind:value={formData.placeholder}
            placeholder="Contoh: Pilih warna..."
            class="w-full bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-green-500"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Deskripsi</label>
          <input 
            type="text" 
            bind:value={formData.description}
            placeholder="Deskripsi field..."
            class="w-full bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-green-500"
          />
        </div>
      </div>
      
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-300 mb-2">Aturan Validasi</label>
        <textarea
          bind:value={formData.validation_rules}
          rows="2"
          placeholder="Contoh: min:0, max:100, pattern:^[A-Za-z]+$"
          class="w-full bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-green-500"
        ></textarea>
      </div>
      
      <div class="flex items-center gap-4 mb-6">
        <label class="flex items-center gap-2">
          <input 
            type="checkbox" 
            bind:checked={formData.is_required}
            class="w-4 h-4 text-green-600 bg-neutral-800 border-neutral-700 rounded focus:ring-green-500"
          />
          <span class="text-sm text-gray-300">Wajib diisi</span>
        </label>
        
        <label class="flex items-center gap-2">
          <input 
            type="checkbox" 
            bind:checked={formData.is_active}
            class="w-4 h-4 text-green-600 bg-neutral-800 border-neutral-700 rounded focus:ring-green-500"
          />
          <span class="text-sm text-gray-300">Aktif</span>
        </label>
      </div>
      
      <div class="flex gap-3">
        <button 
          class="bg-green-500 text-white border-0 px-6 py-2.5 rounded-md text-sm font-medium cursor-pointer transition-colors hover:bg-green-600 flex items-center gap-2"
          on:click={saveCustomField}
        >
          <Save size={16} />
          {editingId ? 'Update' : 'Simpan'}
        </button>
        <button 
          class="bg-neutral-600 text-white border-0 px-6 py-2.5 rounded-md text-sm font-medium cursor-pointer transition-colors hover:bg-neutral-700"
          on:click={cancelForm}
        >
          Batal
        </button>
      </div>
    </div>
  {/if}

  <!-- Custom Fields List -->
  {#if loading}
    <div class="text-center py-8">
      <div class="animate-spin w-8 h-8 border-4 border-neutral-600 border-t-green-500 rounded-full mx-auto mb-4"></div>
      <p class="text-gray-400">Memuat data...</p>
    </div>
  {:else if customFields.length === 0}
    <div class="text-center py-8 text-gray-400">
      <Settings size={48} class="mx-auto mb-4 text-neutral-600" />
      <p class="mb-4">Belum ada custom field definitions</p>
      <button 
        class="bg-green-500 text-white border-0 px-6 py-2.5 rounded-md text-sm font-medium cursor-pointer transition-colors hover:bg-green-600 flex items-center gap-2 mx-auto"
        on:click={startAdd}
      >
        <Plus size={16} />
        Tambah Custom Field Pertama
      </button>
    </div>
  {:else}
    <div class="space-y-3">
      {#each customFields as field (field.id)}
        <div class="bg-neutral-950 border border-neutral-700 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <h4 class="text-lg font-medium text-gray-200">{field.name}</h4>
                <span class="inline-block bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-full">
                  {getFieldTypeLabel(field.field_type)}
                </span>
                {#if field.is_required}
                  <span class="inline-block bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded-full">
                    Wajib
                  </span>
                {/if}
                <span class={`px-2 py-1 rounded-full text-xs font-medium ${
                  field.is_active 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {field.is_active ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
              
              {#if field.description}
                <p class="text-gray-400 text-sm mb-2">{field.description}</p>
              {/if}
              
              {#if field.placeholder}
                <p class="text-gray-500 text-xs">Placeholder: {field.placeholder}</p>
              {/if}
              
              {#if field.validation_rules}
                <p class="text-gray-500 text-xs">Validasi: {field.validation_rules}</p>
              {/if}
            </div>
            
            <div class="flex items-center gap-2">
              <button 
                class="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1.5 rounded text-xs cursor-pointer transition-colors hover:bg-blue-500/30 flex items-center gap-1"
                on:click={() => startEdit(field)}
              >
                <Edit3 size={14} />
                Edit
              </button>
              
              <button 
                class="bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1.5 rounded text-xs cursor-pointer transition-colors hover:bg-red-500/30 flex items-center gap-1"
                on:click={() => removeCustomField(field.id)}
              >
                <Trash2 size={14} />
                Hapus
              </button>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

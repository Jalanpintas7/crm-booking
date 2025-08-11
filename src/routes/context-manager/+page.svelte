<script>
  import { currentLanguage, translations } from '../../lib/stores/language.js';
  import { FileText, Plus, Search, Filter } from 'lucide-svelte';
  
  $: language = $currentLanguage;
  $: currentTranslations = translations[language] || translations.ms;
  
  // Create reactive variables for all translated text to ensure immediate updates
  $: contextManagerText = currentTranslations['context_manager'] || 'context_manager';
  $: addContextText = currentTranslations['add_context'] || 'add_context';
  $: editContextText = currentTranslations['edit_context'] || 'edit_context';
  $: deleteContextText = currentTranslations['delete_context'] || 'delete_context';
  $: contextNameText = currentTranslations['context_name'] || 'context_name';
  $: contextDescriptionText = currentTranslations['context_description'] || 'context_description';
  $: customFieldsText = currentTranslations['custom_fields'] || 'custom_fields';
  $: addCustomFieldText = currentTranslations['add_custom_field'] || 'add_custom_field';
  $: fieldTitleText = currentTranslations['field_title'] || 'field_title';
  $: fieldValueText = currentTranslations['field_value'] || 'field_value';
  $: saveText = currentTranslations['save'] || 'save';
  $: cancelText = currentTranslations['cancel'] || 'cancel';
  $: closeText = currentTranslations['close'] || 'close';
  $: searchText = currentTranslations['search'] || 'search';
  $: filterText = currentTranslations['filter'] || 'filter';
  $: noContextsText = currentTranslations['no_contexts'] || 'no_contexts';
  $: addNewContextText = currentTranslations['add_new_context'] || 'add_new_context';
  $: contextDetailsText = currentTranslations['context_details'] || 'context_details';
  $: confirmDeleteText = currentTranslations['confirm_delete'] || 'confirm_delete';
  $: deleteWarningText = currentTranslations['delete_warning'] || 'delete_warning';
  $: yesText = currentTranslations['yes'] || 'yes';
  $: noText = currentTranslations['no'] || 'no';
  $: successText = currentTranslations['success'] || 'success';
  $: errorText = currentTranslations['error'] || 'error';
  $: contextAddedText = currentTranslations['context_added'] || 'context_added';
  $: contextUpdatedText = currentTranslations['context_updated'] || 'context_updated';
  $: contextDeletedText = currentTranslations['context_deleted'] || 'context_deleted';
  
  // Force immediate reactivity when language changes
  $: {
    if (language) {
      // This ensures all translated text updates immediately when language changes
      contextManagerText, addContextText, editContextText, deleteContextText, contextNameText,
      contextDescriptionText, customFieldsText, addCustomFieldText, fieldTitleText, fieldValueText,
      saveText, cancelText, closeText, searchText, filterText, noContextsText, addNewContextText,
      contextDetailsText, confirmDeleteText, deleteWarningText, yesText, noText, successText,
      errorText, contextAddedText, contextUpdatedText, contextDeletedText;
    }
  }

  function t(key) {
    return currentTranslations[key] || key;
  }

  let contexts = [
    {
      id: 1,
      name: 'Studio Fotografi Kuala Lumpur',
      description: 'Studio fotografi profesional untuk acara pernikahan dan event',
      customFields: [
        { title: 'Kapasiti', value: '50 orang' },
        { title: 'Jam Operasi', value: '09:00 - 18:00' },
        { title: 'Kemudahan', value: 'Parking, WiFi, AC' }
      ]
    },
    {
      id: 2,
      name: 'Venue Event Shah Alam',
      description: 'Tempat acara mewah untuk majlis perkahwinan dan korporat',
      customFields: [
        { title: 'Kapasiti', value: '200 orang' },
        { title: 'Katering', value: 'Tersedia' },
        { title: 'Dekorasi', value: 'Termasuk' }
      ]
    },
    {
      id: 3,
      name: 'Taman Rekreasi Putrajaya',
      description: 'Lokasi fotografi outdoor yang indah untuk sesi foto',
      customFields: [
        { title: 'Bayaran Masuk', value: 'RM 10/org' },
        { title: 'Jam Buka', value: '07:00 - 19:00' },
        { title: 'Kemudahan', value: 'Tandas, Parking' }
      ]
    },
    {
      id: 4,
      name: 'Hotel Grand Melaka',
      description: 'Hotel 5 bintang untuk majlis dan acara korporat',
      customFields: [
        { title: 'Bilik', value: '150 bilik' },
        { title: 'Ballroom', value: '3 buah' },
        { title: 'Restoran', value: '2 restoran' }
      ]
    },
    {
      id: 5,
      name: 'Pusat Konvensyen Penang',
      description: 'Pusat konvensyen moden untuk acara besar',
      customFields: [
        { title: 'Kapasiti', value: '1000 orang' },
        { title: 'Teknologi', value: 'AV System' },
        { title: 'Parking', value: '500 kereta' }
      ]
    }
  ];
  let showForm = false;
  let editingContext = null;
  let currentPage = 1;
  let itemsPerPage = 6;
  
  let formData = {
    name: '',
    description: '',
    customFields: []
  };

  let newCustomField = {
    title: '',
    value: ''
  };

  function addContext() {
    if (formData.name && formData.description) {
      if (editingContext) {
        // Edit existing context
        contexts = contexts.map(context => 
          context.id === editingContext.id 
            ? { ...formData, id: editingContext.id }
            : context
        );
      } else {
        // Add new context
        contexts = [...contexts, { ...formData, id: Date.now() }];
      }
      resetForm();
    }
  }

  function editContext(context) {
    editingContext = context;
    formData = {
      name: context.name,
      description: context.description,
      customFields: [...context.customFields]
    };
    showForm = true;
  }

  function resetForm() {
    formData = {
      name: '',
      description: '',
      customFields: []
    };
    newCustomField = {
      title: '',
      value: ''
    };
    editingContext = null;
    showForm = false;
  }

  function deleteContext(id) {
    contexts = contexts.filter(context => context.id !== id);
  }

  function addCustomField() {
    if (newCustomField.title && newCustomField.value) {
      formData.customFields = [...formData.customFields, { ...newCustomField }];
      newCustomField = {
        title: '',
        value: ''
      };
    }
  }

  function removeCustomField(index) {
    formData.customFields = formData.customFields.filter((_, i) => i !== index);
  }

  // Pagination
  $: totalPages = Math.ceil(contexts.length / itemsPerPage);
  $: startIndex = (currentPage - 1) * itemsPerPage;
  $: endIndex = startIndex + itemsPerPage;
  $: paginatedContexts = contexts.slice(startIndex, endIndex);

  function nextPage() {
    if (currentPage < totalPages) {
      currentPage++;
    }
  }

  function prevPage() {
    if (currentPage > 1) {
      currentPage--;
    }
  }

  function goToPage(page) {
    if (page >= 1 && page <= totalPages) {
      currentPage = page;
    }
  }
</script>

<div class="min-h-[calc(100vh-100px)] mt-10 w-full max-w-none p-0">
  <div class="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-8 px-5 max-w-6xl mx-auto">
    <h1 class="text-3xl md:text-2xl font-semibold text-gray-200 m-0">{contextManagerText}</h1>
    <button class="bg-green-500 text-white border-0 px-6 py-3 rounded-md text-sm font-medium cursor-pointer transition-colors hover:bg-green-600 w-full md:w-auto" on:click={() => showForm = true}>
      + {addContextText}
    </button>
  </div>

  {#if showForm}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]" on:click={resetForm} role="dialog" tabindex="-1">
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
      <div class="bg-neutral-800 rounded-lg p-8 w-[90%] max-w-2xl border border-neutral-700 max-h-[90vh] overflow-y-auto" on:click|stopPropagation role="document">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-gray-200 m-0 text-xl">{editingContext ? 'Edit Konteks' : 'Tambah Konteks Baru'}</h2>
          <button class="bg-transparent border-0 text-gray-400 text-2xl cursor-pointer p-0 w-8 h-8 flex items-center justify-center hover:text-gray-200" on:click={resetForm}>×</button>
        </div>
        
        <form class="flex flex-col gap-5" on:submit|preventDefault={addContext}>
          <div class="flex flex-col gap-2">
            <label for="name" class="text-gray-200 text-sm font-medium">Nama</label>
            <input 
              type="text" 
              id="name"
              bind:value={formData.name}
              placeholder="Masukkan nama konteks"
              required
              class="bg-neutral-950 border border-neutral-700 rounded-md px-3 py-3 text-gray-200 text-sm transition-colors font-inherit focus:outline-none focus:border-green-500 placeholder:text-neutral-600"
            />
          </div>
          
          <div class="flex flex-col gap-2">
            <label for="description" class="text-gray-200 text-sm font-medium">Deskripsi</label>
            <textarea 
              id="description"
              bind:value={formData.description}
              placeholder="Masukkan deskripsi konteks"
              rows="4"
              required
              class="bg-neutral-950 border border-neutral-700 rounded-md px-3 py-3 text-gray-200 text-sm transition-colors font-inherit resize-y min-h-[80px] focus:outline-none focus:border-green-500 placeholder:text-neutral-600"
            ></textarea>
          </div>
          
          <!-- Custom Fields -->
          <div class="border border-neutral-700 rounded-md p-5 bg-neutral-950">
            <h3 class="text-gray-200 text-base m-0 mb-4">Medan Tambahan</h3>
            <div class="mb-4">
              <div class="flex flex-col md:flex-row gap-2.5 items-end">
                <input 
                  type="text" 
                  bind:value={newCustomField.title}
                  placeholder="Judul medan"
                  class="flex-1 bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-green-500"
                />
                <input 
                  type="text" 
                  bind:value={newCustomField.value}
                  placeholder="Nilai medan"
                  class="flex-1 bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-green-500"
                />
                <button type="button" class="bg-green-500 text-white border-0 px-3 py-2 rounded text-base cursor-pointer transition-colors hover:bg-green-600" on:click={addCustomField}>
                  +
                </button>
              </div>
            </div>
            
            {#if formData.customFields.length > 0}
              <div class="flex flex-col gap-2">
                {#each formData.customFields as field, index}
                  <div class="flex items-center gap-2.5 bg-neutral-800 px-3 py-2 rounded border border-neutral-700">
                    <span class="text-green-500 font-medium text-sm">{field.title}:</span>
                    <span class="text-gray-200 text-sm flex-1">{field.value}</span>
                    <button 
                      type="button" 
                      class="bg-transparent border-0 text-red-400 text-base cursor-pointer p-0.5 rounded transition-colors hover:bg-red-400/10"
                      on:click={() => removeCustomField(index)}
                    >
                      ×
                    </button>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
          
          <div class="flex gap-3 justify-end mt-2.5">
            <button type="button" class="bg-transparent border border-neutral-700 text-gray-400 px-6 py-3 rounded-md text-sm cursor-pointer transition-all hover:border-green-500 hover:text-green-500" on:click={resetForm}>
              Batal
            </button>
            <button type="submit" class="bg-green-500 text-white border-0 px-6 py-3 rounded-md text-sm font-medium cursor-pointer transition-colors hover:bg-green-600">
              {editingContext ? 'Update Konteks' : 'Simpan Konteks'}
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}

  <div class="mt-5 px-5 max-w-6xl mx-auto">
    {#if contexts.length === 0}
      <div class="text-center py-15 text-gray-400">
        <FileText size={32} class="mx-auto mb-4" />
        <h3 class="text-gray-200 m-0 mb-2.5 text-lg">Tiada konteks lagi</h3>
        <p class="m-0 text-sm">Klik "Tambah Konteks" untuk menambah konteks pertama anda</p>
      </div>
    {:else}
      <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {#each paginatedContexts as context (context.id)}
          <div class="bg-neutral-800 rounded-lg p-5 border border-neutral-700 transition-colors hover:border-green-500">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-gray-200 text-lg font-semibold m-0">{context.name}</h3>
              <div class="flex gap-2 items-center">
                <button 
                  class="bg-transparent border-0 text-green-500 text-base cursor-pointer p-1 rounded transition-colors hover:bg-green-500/10"
                  on:click={() => editContext(context)}
                  title="Edit konteks"
                >
                  ✏️
                </button>
                <button 
                  class="bg-transparent border-0 text-red-400 text-xl cursor-pointer p-1 rounded transition-colors hover:bg-red-400/10"
                  on:click={() => deleteContext(context.id)}
                  title="Padam konteks"
                >
                  ×
                </button>
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <div class="flex flex-col gap-0.5">
                <span class="text-gray-400 text-xs">Deskripsi:</span>
                <span class="text-gray-200 text-sm font-medium">{context.description}</span>
              </div>
              {#if context.customFields.length > 0}
                <div class="flex flex-col gap-1.5">
                  <span class="text-gray-400 text-xs">Medan Tambahan:</span>
                  {#each context.customFields as field}
                    <div class="flex gap-2 bg-neutral-950 px-2.5 py-1.5 rounded border border-neutral-700">
                      <span class="text-green-500 text-xs font-medium">{field.title}:</span>
                      <span class="text-gray-200 text-xs">{field.value}</span>
                    </div>
                  {/each}
                </div>
              {/if}
            </div>
          </div>
        {/each}
      </div>
      
      {#if totalPages > 1}
        <div class="flex flex-col md:flex-row justify-center items-center gap-2.5 md:gap-2.5 mt-8 p-5">
          <button 
            class="bg-neutral-800 border border-neutral-700 text-gray-200 px-4 py-2 rounded-md text-sm cursor-pointer transition-all hover:bg-green-500 hover:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            on:click={prevPage} 
            disabled={currentPage === 1}
          >
            « Sebelum
          </button>
          
          <div class="flex gap-1.5 flex-wrap justify-center">
            {#each Array(totalPages) as _, i}
              <button 
                class="bg-neutral-800 border border-neutral-700 text-gray-200 px-3 py-2 rounded-md text-sm cursor-pointer transition-all min-w-[40px] hover:bg-neutral-700 {currentPage === i + 1 ? 'bg-green-500 border-green-500 text-white' : ''}"
                on:click={() => goToPage(i + 1)}
              >
                {i + 1}
              </button>
            {/each}
          </div>
          
          <button 
            class="bg-neutral-800 border border-neutral-700 text-gray-200 px-4 py-2 rounded-md text-sm cursor-pointer transition-all hover:bg-green-500 hover:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            on:click={nextPage} 
            disabled={currentPage === totalPages}
          >
            Seterusnya »
          </button>
        </div>
      {/if}
    {/if}
  </div>
</div>

<style>
  /* Mobile responsive adjustments */
  @media (max-width: 768px) {
    .text-3xl.md\:text-2xl {
      font-size: 1.5rem;
    }
    
    .px-5 {
      padding-left: 15px;
      padding-right: 15px;
    }
    
    .w-\[90\%\] {
      width: 95%;
      margin: 20px;
    }
    
    .grid-cols-1.lg\:grid-cols-2.xl\:grid-cols-3 {
      grid-template-columns: 1fr;
    }
    
    .flex.flex-col.md\:flex-row.gap-2\.5.items-end {
      flex-direction: column;
      gap: 10px;
    }
    
    .flex.flex-col.md\:flex-row.justify-center.items-center {
      flex-direction: column;
      gap: 15px;
    }
    
    .flex.gap-1\.5.flex-wrap.justify-center {
      flex-wrap: wrap;
      justify-content: center;
    }
  }

  @media (max-width: 480px) {
    .text-3xl.md\:text-2xl {
      font-size: 1.25rem;
    }
    
    .p-5 {
      padding: 15px;
    }
    
    .text-lg {
      font-size: 1rem;
    }
    
    .gap-0\.5 {
      gap: 1px;
    }
  }
</style>
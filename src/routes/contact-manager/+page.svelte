<script>
  import { onMount } from 'svelte';
  import { currentLanguage, translations } from '../../lib/stores/language.js';
  import { getContacts, createContact, updateContact, deleteContact } from '../../lib/supabase.js';
  import { Users, UserPlus, Search, Filter, Plus, Eye, Edit, Trash2, Table as TableIcon, LayoutGrid } from 'lucide-svelte';
  
  $: language = $currentLanguage;
  $: currentTranslations = translations[language] || translations.ms;

  function t(key) {
    return currentTranslations[key] || key;
  }

  let contacts = [];
  let loading = true;
  let error = null;
  let showForm = false;
  let showViewModal = false;
  let showEditModal = false;
  let viewContact = null;
  let editData = { id: null, name: '', whatsapp: '', email: '' };
  let viewMode = 'card'; // 'card' | 'table'
  let selectedIds = {};
  $: selectedCount = Object.values(selectedIds).filter(Boolean).length;
  $: isAllSelected = contacts.length > 0 && contacts.every((c) => selectedIds[c.id]);
  
  let formData = {
    name: '',
    whatsapp: '',
    email: ''
  };

  // Load contacts on component mount
  onMount(async () => {
    await loadContacts();
  });

  async function loadContacts() {
    try {
      loading = true;
      error = null;
      contacts = await getContacts();
    } catch (err) {
      error = 'Gagal memuat data kontak. Silakan coba lagi.';
      console.error('Error loading contacts:', err);
    } finally {
      loading = false;
    }
  }

  async function addContact() {
    if (formData.name && formData.whatsapp) {
      try {
        // Generate UUID for contact ID
        const contactId = crypto.randomUUID();
        const contactData = {
          id: contactId,
          name: formData.name,
          whatsapp: formData.whatsapp,
          email: formData.email || null
        };
        
        const newContact = await createContact(contactData);
        contacts = [newContact, ...contacts];
        
        // reset selections and form
        selectedIds = {};
        formData = {
          name: '',
          whatsapp: '',
          email: ''
        };
        showForm = false;
      } catch (err) {
        error = 'Gagal menambah kontak. Silakan coba lagi.';
        console.error('Error adding contact:', err);
      }
    }
  }

  async function deleteContactHandler(id) {
    try {
      await deleteContact(id);
      contacts = contacts.filter(contact => contact.id !== id);
      const { [id]: _removed, ...rest } = selectedIds;
      selectedIds = rest;
    } catch (err) {
      error = 'Gagal menghapus kontak. Silakan coba lagi.';
      console.error('Error deleting contact:', err);
    }
  }

  function openViewModal(contact) {
    viewContact = { ...contact };
    showViewModal = true;
  }

  function openEditModal(contact) {
    editData = { 
      id: contact.id, 
      name: contact.name, 
      whatsapp: contact.whatsapp || '', 
      email: contact.email || ''
    };
    showEditModal = true;
  }

  async function saveEdit() {
    if (!editData.name || !editData.whatsapp) return;
    
    try {
      const updatedContact = await updateContact(editData.id, {
        name: editData.name,
        whatsapp: editData.whatsapp,
        email: editData.email || null
      });
      
      contacts = contacts.map((c) => (c.id === editData.id ? updatedContact : c));
      showEditModal = false;
    } catch (err) {
      error = 'Gagal memperbarui kontak. Silakan coba lagi.';
      console.error('Error updating contact:', err);
    }
  }

  function toggleSelectAll() {
    if (isAllSelected) {
      selectedIds = {};
    } else {
      const next = {};
      for (const c of contacts) next[c.id] = true;
      selectedIds = next;
    }
  }

  async function bulkDeleteSelected() {
    if (selectedCount === 0) return;
    
    try {
      const idsToDelete = Object.entries(selectedIds)
        .filter(([, v]) => v)
        .map(([k]) => k);
      
      // Delete contacts one by one (could be optimized with batch delete)
      await Promise.all(idsToDelete.map(id => deleteContact(id)));
      
      contacts = contacts.filter((c) => !idsToDelete.includes(c.id));
      selectedIds = {};
    } catch (err) {
      error = 'Gagal menghapus kontak terpilih. Silakan coba lagi.';
      console.error('Error bulk deleting contacts:', err);
    }
  }
</script>

<div class="min-h-[calc(100vh-100px)] mt-10 w-full max-w-none p-0">
  <div class="flex justify-between items-center mb-8 px-5 max-w-6xl mx-auto">
    <h1 class="text-3xl font-semibold text-gray-200">{t('page_title')}</h1>
    <div class="flex items-center gap-3">
      <div class="inline-flex bg-gray-900 border border-gray-700 rounded-lg overflow-hidden" role="group" aria-label="Tukar tampilan">
        <button
          type="button"
          class="flex items-center gap-1.5 px-3 py-2 bg-transparent border-none text-gray-200 cursor-pointer hover:bg-gray-800 {viewMode === 'card' ? 'bg-gray-800 text-green-500' : ''}"
          on:click={() => viewMode = 'card'}
          aria-pressed={viewMode === 'card'}
          title="Tampilan Kartu"
        >
          <LayoutGrid size={16} />
          Kartu
        </button>
        <button
          type="button"
          class="flex items-center gap-1.5 px-3 py-2 bg-transparent border-none text-gray-200 cursor-pointer hover:bg-gray-800 {viewMode === 'table' ? 'bg-gray-800 text-green-500' : ''}"
          on:click={() => viewMode = 'table'}
          aria-pressed={viewMode === 'table'}
          title="Tampilan Tabel"
        >
          <TableIcon size={16} />
          Tabel
        </button>
      </div>

      <button class="flex items-center gap-1 bg-green-500 text-white border-none px-6 py-3 rounded-md text-sm font-medium hover:bg-green-600 transition-colors" on:click={() => showForm = true}>
        <UserPlus size={16} />
        Tambah Kenalan
      </button>
    </div>
  </div>

  {#if selectedCount > 0}
    <div class="flex justify-between items-center py-2.5 px-5 bg-green-950 border border-green-900 text-green-200 rounded-lg max-w-6xl mx-auto mb-4">
      <div class="flex items-center gap-2">
        <input id="select-all-top" type="checkbox" checked={isAllSelected} on:change={toggleSelectAll} />
        <label for="select-all-top">Pilih semua</label>
        <span class="ml-2 text-sm text-gray-400">{selectedCount} dipilih</span>
      </div>
      <div class="flex items-center gap-2">
        <button class="flex items-center gap-1 bg-red-500 text-white border-none px-3.5 py-2.5 rounded-md text-sm hover:bg-red-600 transition-colors" on:click={bulkDeleteSelected} title="Padam yang dipilih">
          <Trash2 size={16} /> Hapus Terpilih
        </button>
      </div>
    </div>
  {/if}

  {#if showForm}
    <div
  class="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]"
      role="button"
      tabindex="0"
      on:click={() => showForm = false}
      on:keydown={(e) => (e.key === 'Escape' || e.key === 'Enter') && (showForm = false)}
    >
      <div class="bg-gray-900 rounded-lg p-8 w-11/12 max-w-lg border border-gray-700" role="dialog" aria-modal="true" tabindex="0" on:click|stopPropagation on:keydown|stopPropagation>
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl text-gray-200">Tambah Kenalan Baru</h2>
          <button class="bg-none border-none text-gray-400 text-2xl cursor-pointer w-8 h-8 flex items-center justify-center hover:text-gray-200" on:click={() => showForm = false}>×</button>
        </div>
        
        <form class="flex flex-col gap-5" on:submit|preventDefault={addContact}>
          <div class="flex flex-col gap-2">
            <label for="name" class="text-sm font-medium text-gray-200">Nama</label>
            <input 
              type="text" 
              id="name"
              bind:value={formData.name}
              placeholder="Masukkan nama"
              required
              class="bg-gray-950 border border-gray-700 rounded-md px-3 py-3 text-gray-200 text-sm focus:outline-none focus:border-green-500 transition-colors"
            />
          </div>
          
          <div class="flex flex-col gap-2">
            <label for="whatsapp" class="text-sm font-medium text-gray-200">WhatsApp</label>
            <input 
              type="tel" 
              id="whatsapp"
              bind:value={formData.whatsapp}
              placeholder="Masukkan nombor WhatsApp"
              required
              class="bg-gray-950 border border-gray-700 rounded-md px-3 py-3 text-gray-200 text-sm focus:outline-none focus:border-green-500 transition-colors"
            />
          </div>
          
          <div class="flex flex-col gap-2">
            <label for="email" class="text-sm font-medium text-gray-200">Email (Opsional)</label>
            <input 
              type="email" 
              id="email"
              bind:value={formData.email}
              placeholder="Masukkan email"
              class="bg-gray-950 border border-gray-700 rounded-md px-3 py-3 text-gray-200 text-sm focus:outline-none focus:border-green-500 transition-colors"
            />
          </div>
          
          <div class="flex gap-3 justify-end mt-2.5">
            <button type="button" class="bg-none border border-gray-700 text-gray-400 px-6 py-3 rounded-md text-sm hover:border-green-500 hover:text-green-500 transition-colors" on:click={() => showForm = false}>
              Batal
            </button>
            <button type="submit" class="bg-green-500 text-white border-none px-6 py-3 rounded-md text-sm font-medium hover:bg-green-600 transition-colors">
              Simpan Kenalan
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}

  {#if error}
    <div class="bg-red-600 text-white px-5 py-3 rounded-md mx-auto mb-5 max-w-6xl flex justify-between items-center">
      <p class="text-sm">{error}</p>
      <button class="bg-white/20 text-white border-none px-3 py-1.5 rounded text-xs hover:bg-white/30 transition-colors" on:click={loadContacts}>Coba Lagi</button>
    </div>
  {/if}

  <div class="mt-5 px-5 max-w-6xl mx-auto">
    {#if loading}
      <div class="text-center py-16 text-gray-400">
        <p class="text-base">Memuat kontak...</p>
      </div>
    {:else if contacts.length === 0}
      <div class="text-center py-16 text-gray-400">
        <Users size={32} class="mx-auto mb-5" />
        <h3 class="text-lg text-gray-200 mb-2.5">Tiada kenalan lagi</h3>
        <p class="text-sm">Klik "Tambah Kenalan" untuk menambah kenalan pertama anda</p>
      </div>
    {:else}
      {#if viewMode === 'card'}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {#each contacts as contact (contact.id)}
            <div class="bg-gray-900 rounded-lg p-5 border border-gray-700 hover:border-green-500 transition-colors">
              <div class="flex justify-between items-center mb-4">
                <div class="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={!!selectedIds[contact.id]}
                    on:change={(e) => (selectedIds = { ...selectedIds, [contact.id]: e.target.checked })}
                    aria-label={`Pilih ${contact.name}`}
                  />
                  <h3 class="text-lg font-semibold text-gray-200">{contact.name}</h3>
                </div>
                <div class="flex items-center gap-2">
                  <button class="flex items-center justify-center w-8 h-8 rounded-md border border-gray-700 bg-gray-900 text-gray-200 hover:border-green-500 transition-colors" title="Lihat" on:click={() => openViewModal(contact)}>
                    <Eye size={16} />
                  </button>
                  <button class="flex items-center justify-center w-8 h-8 rounded-md border border-gray-700 bg-gray-900 text-gray-200 hover:border-green-500 transition-colors" title="Edit" on:click={() => openEditModal(contact)}>
                    <Edit size={16} />
                  </button>
                  <button class="flex items-center justify-center w-8 h-8 rounded-md border border-red-500 bg-gray-900 text-red-500 hover:border-red-600 transition-colors" title="Padam" on:click={() => deleteContactHandler(contact.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div class="flex flex-col gap-2">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-400">WhatsApp:</span>
                  <span class="text-sm font-medium text-gray-200">{contact.whatsapp}</span>
                </div>
                {#if contact.email}
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-400">Email:</span>
                    <span class="text-sm font-medium text-gray-200">{contact.email}</span>
                  </div>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <div class="w-full overflow-x-auto">
          <table class="w-full border-collapse bg-gray-900 border border-gray-700 rounded-lg">
            <thead>
              <tr>
                <th class="w-10 px-3 py-3 border-b border-gray-700 bg-gray-950 text-gray-200 font-semibold text-left">
                  <input id="select-all" type="checkbox" checked={isAllSelected} on:change={toggleSelectAll} />
                </th>
                <th class="px-3 py-3 border-b border-gray-700 bg-gray-950 text-gray-200 font-semibold text-left">Nama</th>
                <th class="px-3 py-3 border-b border-gray-700 bg-gray-950 text-gray-200 font-semibold text-left">WhatsApp</th>
                <th class="px-3 py-3 border-b border-gray-700 bg-gray-950 text-gray-200 font-semibold text-left">Email</th>
                <th class="w-36 px-3 py-3 border-b border-gray-700 bg-gray-950 text-gray-200 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {#each contacts as contact (contact.id)}
                <tr>
                  <td class="px-3 py-3 border-b border-gray-700 text-gray-200">
                    <input
                      type="checkbox"
                      checked={!!selectedIds[contact.id]}
                      on:change={(e) => (selectedIds = { ...selectedIds, [contact.id]: e.target.checked })}
                      aria-label={`Pilih ${contact.name}`}
                    />
                  </td>
                  <td class="px-3 py-3 border-b border-gray-700 text-gray-200">{contact.name}</td>
                  <td class="px-3 py-3 border-b border-gray-700 text-gray-200">{contact.whatsapp}</td>
                  <td class="px-3 py-3 border-b border-gray-700 text-gray-200">{contact.email || '-'}</td>
                  <td class="px-3 py-3 border-b border-gray-700 text-right">
                    <div class="flex items-center gap-2 justify-end">
                      <button class="flex items-center justify-center w-8 h-8 rounded-md border border-gray-700 bg-gray-900 text-gray-200 hover:border-green-500 transition-colors" title="Lihat" on:click={() => openViewModal(contact)}>
                        <Eye size={16} />
                      </button>
                      <button class="flex items-center justify-center w-8 h-8 rounded-md border border-gray-700 bg-gray-900 text-gray-200 hover:border-green-500 transition-colors" title="Edit" on:click={() => openEditModal(contact)}>
                        <Edit size={16} />
                      </button>
                      <button class="flex items-center justify-center w-8 h-8 rounded-md border border-red-500 bg-gray-900 text-red-500 hover:border-red-600 transition-colors" title="Padam" on:click={() => deleteContactHandler(contact.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    {/if}
  </div>

  {#if showViewModal && viewContact}
    <div
  class="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]"
      role="button"
      tabindex="0"
      on:click={() => (showViewModal = false)}
      on:keydown={(e) => (e.key === 'Escape' || e.key === 'Enter') && (showViewModal = false)}
    >
      <div class="bg-gray-900 rounded-lg p-8 w-11/12 max-w-lg border border-gray-700" role="dialog" aria-modal="true" tabindex="0" on:click|stopPropagation on:keydown|stopPropagation>
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl text-gray-200">Detail Kenalan</h2>
          <button class="bg-none border-none text-gray-400 text-2xl cursor-pointer w-8 h-8 flex items-center justify-center hover:text-gray-200" on:click={() => (showViewModal = false)}>×</button>
        </div>
        <div class="flex flex-col gap-2">
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-400">Nama:</span>
            <span class="text-sm font-medium text-gray-200">{viewContact.name}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-400">WhatsApp:</span>
            <span class="text-sm font-medium text-gray-200">{viewContact.whatsapp}</span>
          </div>
          {#if viewContact.email}
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-400">Email:</span>
              <span class="text-sm font-medium text-gray-200">{viewContact.email}</span>
            </div>
          {/if}
        </div>
        <div class="flex justify-end mt-2.5">
          <button type="button" class="bg-none border border-gray-700 text-gray-400 px-6 py-3 rounded-md text-sm hover:border-green-500 hover:text-green-500 transition-colors" on:click={() => (showViewModal = false)}>Tutup</button>
        </div>
      </div>
    </div>
  {/if}

  {#if showEditModal}
    <div
  class="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]"
      role="button"
      tabindex="0"
      on:click={() => (showEditModal = false)}
      on:keydown={(e) => (e.key === 'Escape' || e.key === 'Enter') && (showEditModal = false)}
    >
      <div class="bg-gray-900 rounded-lg p-8 w-11/12 max-w-lg border border-gray-700" role="dialog" aria-modal="true" tabindex="0" on:click|stopPropagation on:keydown|stopPropagation>
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl text-gray-200">Edit Kenalan</h2>
          <button class="bg-none border-none text-gray-400 text-2xl cursor-pointer w-8 h-8 flex items-center justify-center hover:text-gray-200" on:click={() => (showEditModal = false)}>×</button>
        </div>
        <form class="flex flex-col gap-5" on:submit|preventDefault={saveEdit}>
          <div class="flex flex-col gap-2">
            <label for="edit-name" class="text-sm font-medium text-gray-200">Nama</label>
            <input
              id="edit-name"
              type="text"
              bind:value={editData.name}
              placeholder="Masukkan nama"
              required
              class="bg-gray-950 border border-gray-700 rounded-md px-3 py-3 text-gray-200 text-sm focus:outline-none focus:border-green-500 transition-colors"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label for="edit-whatsapp" class="text-sm font-medium text-gray-200">WhatsApp</label>
            <input
              id="edit-whatsapp"
              type="tel"
              bind:value={editData.whatsapp}
              placeholder="Masukkan nombor WhatsApp"
              required
              class="bg-gray-950 border border-gray-700 rounded-md px-3 py-3 text-gray-200 text-sm focus:outline-none focus:border-green-500 transition-colors"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label for="edit-email" class="text-sm font-medium text-gray-200">Email (Opsional)</label>
            <input
              id="edit-email"
              type="email"
              bind:value={editData.email}
              placeholder="Masukkan email"
              class="bg-gray-950 border border-gray-700 rounded-md px-3 py-3 text-gray-200 text-sm focus:outline-none focus:border-green-500 transition-colors"
            />
          </div>
          <div class="flex gap-3 justify-end mt-2.5">
            <button type="button" class="bg-none border border-gray-700 text-gray-400 px-6 py-3 rounded-md text-sm hover:border-green-500 hover:text-green-500 transition-colors" on:click={() => (showEditModal = false)}>Batal</button>
            <button type="submit" class="bg-green-500 text-white border-none px-6 py-3 rounded-md text-sm font-medium hover:bg-green-600 transition-colors">Simpan Perubahan</button>
          </div>
        </form>
      </div>
    </div>
  {/if}
</div>
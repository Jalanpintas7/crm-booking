<script>
  import { onMount } from 'svelte';
  import { currentLanguage, translations } from '../../lib/stores/language.js';
  import { getContacts, createContact, updateContact, deleteContact } from '../../lib/supabase.js';
  import { Users, UserPlus, Search, Filter, Plus, Eye, Edit, Trash2, Table as TableIcon, LayoutGrid } from 'lucide-svelte';
  
  $: language = $currentLanguage;
  $: currentTranslations = translations[language] || translations.ms;
  
  // Create reactive variables for all translated text to ensure immediate updates
  $: pageTitleText = currentTranslations['page_title'] || 'page_title';
  $: addContactText = currentTranslations['add_contact'] || 'add_contact';
  $: searchText = currentTranslations['search'] || 'search';
  $: filterText = currentTranslations['filter'] || 'filter';
  $: viewText = currentTranslations['view'] || 'view';
  $: editText = currentTranslations['edit'] || 'edit';
  $: deleteText = currentTranslations['delete'] || 'delete';
  $: saveText = currentTranslations['save'] || 'save';
  $: cancelText = currentTranslations['cancel'] || 'cancel';
  $: closeText = currentTranslations['close'] || 'close';
  $: nameText = currentTranslations['name'] || 'name';
  $: emailText = currentTranslations['email'] || 'email';
  $: phoneText = currentTranslations['phone'] || 'phone';
  $: actionsText = currentTranslations['actions'] || 'actions';
  $: loadingText = currentTranslations['loading'] || 'loading';
  $: noContactsText = currentTranslations['no_contacts'] || 'no_contacts';
  $: addNewContactText = currentTranslations['add_new_contact'] || 'add_new_contact';
  $: contactDetailsText = currentTranslations['contact_details'] || 'contact_details';
  $: editContactText = currentTranslations['edit_contact'] || 'edit_contact';
  $: deleteContactText = currentTranslations['delete_contact'] || 'delete_contact';
  $: confirmDeleteText = currentTranslations['confirm_delete'] || 'confirm_delete';
  $: deleteWarningText = currentTranslations['delete_warning'] || 'delete_warning';
  $: yesText = currentTranslations['yes'] || 'yes';
  $: noText = currentTranslations['no'] || 'no';
  $: successText = currentTranslations['success'] || 'success';
  $: errorText = currentTranslations['error'] || 'error';
  $: contactAddedText = currentTranslations['contact_added'] || 'contact_added';
  $: contactUpdatedText = currentTranslations['contact_updated'] || 'contact_updated';
  $: contactDeletedText = currentTranslations['contact_deleted'] || 'contact_deleted';
  $: failedLoadContactsText = currentTranslations['failed_load_contacts'] || 'failed_load_contacts';
  $: failedAddContactText = currentTranslations['failed_add_contact'] || 'failed_add_contact';
  $: failedUpdateContactText = currentTranslations['failed_update_contact'] || 'failed_update_contact';
  $: failedDeleteContactText = currentTranslations['failed_delete_contact'] || 'failed_delete_contact';
  $: cardViewText = currentTranslations['card_view'] || 'card_view';
  $: tableViewText = currentTranslations['table_view'] || 'table_view';
  $: cardText = currentTranslations['card'] || 'card';
  $: tableText = currentTranslations['table'] || 'table';
  $: addContactButtonText = currentTranslations['add_contact'] || 'add_contact';
  $: switchViewText = currentTranslations['switch_view'] || 'switch_view';
  $: selectAllText = currentTranslations['select_all'] || 'select_all';
  $: selectedText = currentTranslations['selected'] || 'selected';
  $: deleteSelectedText = currentTranslations['delete_selected'] || 'delete_selected';
  $: addNewContactText = currentTranslations['add_new_contact'] || 'add_new_contact';
  $: nameLabelText = currentTranslations['name'] || 'name';
  $: whatsappLabelText = currentTranslations['whatsapp'] || 'whatsapp';
  $: emailLabelText = currentTranslations['email'] || 'email';
  $: optionalText = currentTranslations['optional'] || 'optional';
  $: enterNameText = currentTranslations['enter_name'] || 'enter_name';
  $: enterWhatsappText = currentTranslations['enter_whatsapp'] || 'enter_whatsapp';
  $: enterEmailText = currentTranslations['enter_email'] || 'enter_email';
  $: onlyNumbersAllowedText = currentTranslations['only_numbers_allowed'] || 'only_numbers_allowed';
  $: cancelText = currentTranslations['cancel'] || 'cancel';
  $: saveContactText = currentTranslations['save_contact'] || 'save_contact';
  $: tryAgainText = currentTranslations['try_again'] || 'try_again';
  $: loadingContactsText = currentTranslations['loading_contacts'] || 'loading_contacts';
  $: noContactsText = currentTranslations['no_contacts'] || 'no_contacts';
  $: clickAddContactText = currentTranslations['click_add_contact'] || 'click_add_contact';
  $: viewText = currentTranslations['view'] || 'view';
  $: editText = currentTranslations['edit'] || 'edit';
  $: deleteText = currentTranslations['delete'] || 'delete';
  $: selectText = currentTranslations['select'] || 'select';
  $: actionsText = currentTranslations['actions'] || 'actions';
  $: contactDetailsText = currentTranslations['contact_details'] || 'contact_details';
  $: closeText = currentTranslations['close'] || 'close';
  $: editContactText = currentTranslations['edit_contact'] || 'edit_contact';
  $: saveChangesText = currentTranslations['save_changes'] || 'save_changes';
  $: failedLoadContactsText = currentTranslations['failed_load_contacts'] || 'failed_load_contacts';
  $: failedAddContactText = currentTranslations['failed_add_contact'] || 'failed_add_contact';
  $: failedUpdateContactText = currentTranslations['failed_update_contact'] || 'failed_update_contact';
  $: failedDeleteContactText = currentTranslations['failed_delete_contact'] || 'failed_delete_contact';
  $: failedDeleteSelectedText = currentTranslations['failed_delete_selected'] || 'failed_delete_selected';
  
  // Force immediate reactivity when language changes
  $: {
    if (language) {
      // This ensures all translated text updates immediately when language changes
      pageTitleText, addContactText, searchText, filterText, viewText, editText, deleteText,
      saveText, cancelText, closeText, nameText, emailText, phoneText, actionsText,
      loadingText, noContactsText, addNewContactText, contactDetailsText, editContactText,
      deleteContactText, confirmDeleteText, deleteWarningText, yesText, noText,
      successText, errorText, contactAddedText, contactUpdatedText, contactDeletedText,
      failedLoadContactsText, failedAddContactText, failedUpdateContactText, failedDeleteContactText,
      cardViewText, tableViewText, cardText, tableText, addContactButtonText,
      switchViewText, selectAllText, selectedText, deleteSelectedText, addNewContactText,
      nameLabelText, whatsappLabelText, emailLabelText, optionalText, enterNameText,
      enterWhatsappText, enterEmailText, onlyNumbersAllowedText, cancelText, saveContactText,
      tryAgainText, loadingContactsText, noContactsText, clickAddContactText, viewText,
      editText, deleteText, selectText, actionsText, contactDetailsText, closeText,
      editContactText, saveChangesText, failedLoadContactsText, failedAddContactText,
      failedUpdateContactText, failedDeleteContactText, failedDeleteSelectedText;
    }
  }

  function t(key) {
    return currentTranslations[key] || key;
  }

  // Function to restrict input to numbers only
  function restrictToNumbers(event) {
    const input = event.target;
    const value = input.value;
    const numbersOnly = value.replace(/[^0-9]/g, '');
    
    if (value !== numbersOnly) {
      input.value = numbersOnly;
      // Update the bound value for Svelte
      if (input.id === 'whatsapp') {
        formData.whatsapp = numbersOnly;
      } else if (input.id === 'edit-whatsapp') {
        editData.whatsapp = numbersOnly;
      }
    }
    
    // Limit length to reasonable phone number length (max 15 digits)
    if (numbersOnly.length > 15) {
      const truncated = numbersOnly.substring(0, 15);
      input.value = truncated;
      if (input.id === 'whatsapp') {
        formData.whatsapp = truncated;
      } else if (input.id === 'edit-whatsapp') {
        editData.whatsapp = truncated;
      }
    }
  }

  // Function to prevent non-numeric key presses
  function preventNonNumeric(event) {
    const key = event.key;
    const allowedKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    
    if (!allowedKeys.includes(key)) {
      event.preventDefault();
    }
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
       error = failedLoadContactsText;
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
         error = failedAddContactText;
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
       error = failedDeleteContactText;
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
       error = failedUpdateContactText;
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
       error = failedDeleteSelectedText;
       console.error('Error bulk deleting contacts:', err);
     }
  }
</script>

<div class="min-h-[calc(100vh-100px)] mt-10 w-full max-w-none p-0">
  <div class="flex justify-between items-center mb-8 px-5 max-w-6xl mx-auto">
    <h1 class="text-3xl font-semibold text-gray-200">{pageTitleText}</h1>
    <div class="flex items-center gap-3">
      <div class="inline-flex bg-gray-900 border border-gray-700 rounded-lg overflow-hidden" role="group" aria-label={switchViewText}>
        <button
          type="button"
          class="flex items-center gap-1.5 px-3 py-2 bg-transparent border-none text-gray-200 cursor-pointer hover:bg-gray-800 {viewMode === 'card' ? 'bg-gray-800 text-green-500' : ''}"
          on:click={() => viewMode = 'card'}
          aria-pressed={viewMode === 'card'}
          title={cardViewText}
        >
          <LayoutGrid size={16} />
          {cardText}
        </button>
        <button
          type="button"
          class="flex items-center gap-1.5 px-3 py-2 bg-transparent border-none text-gray-200 cursor-pointer hover:bg-gray-800 {viewMode === 'table' ? 'bg-gray-800 text-green-500' : ''}"
          on:click={() => viewMode = 'table'}
          aria-pressed={viewMode === 'table'}
          title={tableViewText}
        >
          <TableIcon size={16} />
          {tableText}
        </button>
      </div>

      <button class="flex items-center gap-1 bg-green-500 text-white border-none px-6 py-3 rounded-md text-sm font-medium hover:bg-green-600 transition-colors" on:click={() => showForm = true}>
        <UserPlus size={16} />
        {addContactButtonText}
      </button>
    </div>
  </div>

  {#if selectedCount > 0}
    <div class="flex justify-between items-center py-2.5 px-5 bg-green-950 border border-green-900 text-green-200 rounded-lg max-w-6xl mx-auto mb-4">
      <div class="flex items-center gap-2">
        <input id="select-all-top" type="checkbox" checked={isAllSelected} on:change={toggleSelectAll} />
        <label for="select-all-top">{selectAllText}</label>
        <span class="ml-2 text-sm text-gray-400">{selectedCount} {selectedText}</span>
      </div>
      <div class="flex items-center gap-2">
                  <button class="flex items-center gap-1 bg-red-500 text-white border-none px-3.5 py-2.5 rounded-md text-sm hover:bg-red-600 transition-colors" on:click={bulkDeleteSelected} title={deleteSelectedText}>
            <Trash2 size={16} /> {deleteSelectedText}
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
          <h2 class="text-xl text-gray-200">{addNewContactText}</h2>
          <button class="bg-none border-none text-gray-400 text-2xl cursor-pointer w-8 h-8 flex items-center justify-center hover:text-gray-200" on:click={() => showForm = false}>×</button>
        </div>
        
        <form class="flex flex-col gap-5" on:submit|preventDefault={addContact}>
          <div class="flex flex-col gap-2">
            <label for="name" class="text-sm font-medium text-gray-200">{nameLabelText}</label>
            <input 
              type="text" 
              id="name"
              bind:value={formData.name}
              placeholder={enterNameText}
              required
              class="bg-gray-950 border border-gray-700 rounded-md px-3 py-3 text-gray-200 text-sm focus:outline-none focus:border-green-500 transition-colors"
            />
          </div>
          
          <div class="flex flex-col gap-2">
            <label for="whatsapp" class="text-sm font-medium text-gray-200">{whatsappLabelText}</label>
            <input 
              type="tel" 
              id="whatsapp"
              bind:value={formData.whatsapp}
              placeholder={enterWhatsappText}
              required
              class="bg-gray-950 border border-gray-700 rounded-md px-3 py-3 text-gray-200 text-sm focus:outline-none focus:border-green-500 transition-colors"
              on:input={restrictToNumbers}
              on:keydown={preventNonNumeric}
            />
            <p class="text-xs text-gray-500">{onlyNumbersAllowedText}</p>
          </div>
          
          <div class="flex flex-col gap-2">
            <label for="email" class="text-sm font-medium text-gray-200">{emailLabelText} ({optionalText})</label>
            <input 
              type="email" 
              id="email"
              bind:value={formData.email}
              placeholder={enterEmailText}
              class="bg-gray-950 border border-gray-700 rounded-md px-3 py-3 text-gray-200 text-sm focus:outline-none focus:border-green-500 transition-colors"
            />
          </div>
          
          <div class="flex gap-3 justify-end mt-2.5">
            <button type="button" class="bg-none border border-gray-700 text-gray-400 px-6 py-3 rounded-md text-sm hover:border-green-500 hover:text-green-500 transition-colors" on:click={() => showForm = false}>
              {cancelText}
            </button>
            <button type="submit" class="bg-green-500 text-white border-none px-6 py-3 rounded-md text-sm font-medium hover:bg-green-600 transition-colors">
              {saveContactText}
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}

  {#if error}
    <div class="bg-red-600 text-white px-5 py-3 rounded-md mx-auto mb-5 max-w-6xl flex justify-between items-center">
      <p class="text-sm">{error}</p>
      <button class="bg-white/20 text-white border-none px-3 py-1.5 rounded text-xs hover:bg-white/30 transition-colors" on:click={loadContacts}>{tryAgainText}</button>
    </div>
  {/if}

  <div class="mt-5 px-5 max-w-6xl mx-auto">
    {#if loading}
      <div class="text-center py-16 text-gray-400">
        <p class="text-base">{loadingContactsText}</p>
      </div>
    {:else if contacts.length === 0}
      <div class="text-center py-16 text-gray-400">
        <Users size={32} class="mx-auto mb-5" />
        <h3 class="text-lg text-gray-200 mb-2.5">{noContactsText}</h3>
        <p class="text-sm">{clickAddContactText}</p>
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
                    aria-label={`${selectText} ${contact.name}`}
                  />
                  <h3 class="text-lg font-semibold text-gray-200">{contact.name}</h3>
                </div>
                <div class="flex items-center gap-2">
                  <button class="flex items-center justify-center w-8 h-8 rounded-md border border-gray-700 bg-gray-900 text-gray-200 hover:border-green-500 transition-colors" title={viewText} on:click={() => openViewModal(contact)}>
                    <Eye size={16} />
                  </button>
                  <button class="flex items-center justify-center w-8 h-8 rounded-md border border-gray-700 bg-gray-900 text-gray-200 hover:border-green-500 transition-colors" title={editText} on:click={() => openEditModal(contact)}>
                    <Edit size={16} />
                  </button>
                  <button class="flex items-center justify-center w-8 h-8 rounded-md border border-red-500 bg-gray-900 text-red-500 hover:border-red-600 transition-colors" title={deleteText} on:click={() => deleteContactHandler(contact.id)}>
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
                <th class="px-3 py-3 border-b border-gray-700 bg-gray-950 text-gray-200 font-semibold text-left">{nameLabelText}</th>
                <th class="px-3 py-3 border-b border-gray-700 bg-gray-950 text-gray-200 font-semibold text-left">{whatsappLabelText}</th>
                <th class="px-3 py-3 border-b border-gray-700 bg-gray-950 text-gray-200 font-semibold text-left">{emailLabelText}</th>
                <th class="w-36 px-3 py-3 border-b border-gray-700 bg-gray-950 text-gray-200 font-semibold text-right">{actionsText}</th>
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
                      aria-label={`${selectText} ${contact.name}`}
                    />
                  </td>
                  <td class="px-3 py-3 border-b border-gray-700 text-gray-200">{contact.name}</td>
                  <td class="px-3 py-3 border-b border-gray-700 text-gray-200">{contact.whatsapp}</td>
                  <td class="px-3 py-3 border-b border-gray-700 text-gray-200">{contact.email || '-'}</td>
                  <td class="px-3 py-3 border-b border-gray-700 text-right">
                    <div class="flex items-center gap-2 justify-end">
                      <button class="flex items-center justify-center w-8 h-8 rounded-md border border-gray-700 bg-gray-900 text-gray-200 hover:border-green-500 transition-colors" title={viewText} on:click={() => openViewModal(contact)}>
                        <Eye size={16} />
                      </button>
                      <button class="flex items-center justify-center w-8 h-8 rounded-md border border-gray-700 bg-gray-900 text-gray-200 hover:border-green-500 transition-colors" title={editText} on:click={() => openEditModal(contact)}>
                        <Edit size={16} />
                      </button>
                      <button class="flex items-center justify-center w-8 h-8 rounded-md border border-red-500 bg-gray-900 text-red-500 hover:border-red-600 transition-colors" title={deleteText} on:click={() => deleteContactHandler(contact.id)}>
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
          <h2 class="text-xl text-gray-200">{contactDetailsText}</h2>
          <button class="bg-none border-none text-gray-400 text-2xl cursor-pointer w-8 h-8 flex items-center justify-center hover:text-gray-200" on:click={() => (showViewModal = false)}>×</button>
        </div>
        <div class="flex flex-col gap-2">
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-400">{nameLabelText}:</span>
            <span class="text-sm font-medium text-gray-200">{viewContact.name}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-400">{whatsappLabelText}:</span>
            <span class="text-sm font-medium text-gray-200">{viewContact.whatsapp}</span>
          </div>
          {#if viewContact.email}
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-400">{emailLabelText}:</span>
              <span class="text-sm font-medium text-gray-200">{viewContact.email}</span>
            </div>
          {/if}
        </div>
        <div class="flex justify-end mt-2.5">
          <button type="button" class="bg-none border border-gray-700 text-gray-400 px-6 py-3 rounded-md text-sm hover:border-green-500 hover:text-green-500 transition-colors" on:click={() => (showViewModal = false)}>{closeText}</button>
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
          <h2 class="text-xl text-gray-200">{editContactText}</h2>
          <button class="bg-none border-none text-gray-400 text-2xl cursor-pointer w-8 h-8 flex items-center justify-center hover:text-gray-200" on:click={() => (showEditModal = false)}>×</button>
        </div>
        <form class="flex flex-col gap-5" on:submit|preventDefault={saveEdit}>
          <div class="flex flex-col gap-2">
            <label for="edit-name" class="text-sm font-medium text-gray-200">{nameLabelText}</label>
            <input
              id="edit-name"
              type="text"
              bind:value={editData.name}
              placeholder={enterNameText}
              required
              class="bg-gray-950 border border-gray-700 rounded-md px-3 py-3 text-gray-200 text-sm focus:outline-none focus:border-green-500 transition-colors"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label for="edit-whatsapp" class="text-sm font-medium text-gray-200">{whatsappLabelText}</label>
            <input
              id="edit-whatsapp"
              type="tel"
              bind:value={editData.whatsapp}
              placeholder={enterWhatsappText}
              required
              class="bg-gray-950 border border-gray-700 rounded-md px-3 py-3 text-gray-200 text-sm focus:outline-none focus:border-green-500 transition-colors"
              on:input={restrictToNumbers}
              on:keydown={preventNonNumeric}
            />
            <p class="text-xs text-gray-500">{onlyNumbersAllowedText}</p>
          </div>
          <div class="flex flex-col gap-2">
            <label for="edit-email" class="text-sm font-medium text-gray-200">{emailLabelText} ({optionalText})</label>
            <input
              id="edit-email"
              type="email"
              bind:value={editData.email}
              placeholder={enterEmailText}
              class="bg-gray-950 border border-gray-700 rounded-md px-3 py-3 text-gray-200 text-sm focus:outline-none focus:border-green-500 transition-colors"
            />
          </div>
          <div class="flex gap-3 justify-end mt-2.5">
            <button type="button" class="bg-none border border-gray-700 text-gray-400 px-6 py-3 rounded-md text-sm hover:border-green-500 hover:text-green-500 transition-colors" on:click={() => (showEditModal = false)}>{cancelText}</button>
            <button type="submit" class="bg-green-500 text-white border-none px-6 py-3 rounded-md text-sm font-medium hover:bg-green-600 transition-colors">{saveChangesText}</button>
          </div>
        </form>
      </div>
    </div>
  {/if}
</div>
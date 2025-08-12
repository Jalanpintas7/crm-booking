<script>
  import { onMount } from 'svelte';
  import { currentLanguage, translations } from '../../lib/stores/language.js';
  import { getContacts, createContact, updateContact, deleteContact } from '../../lib/supabase.js';
  import { Users, UserPlus, Search, Filter, Plus, Eye, Edit, Trash2, Table as TableIcon, LayoutGrid, Settings } from 'lucide-svelte';
  
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
  $: saveContactText = currentTranslations['save_contact'] || 'save_contact';
  $: tryAgainText = currentTranslations['try_again'] || 'try_again';
  $: loadingContactsText = currentTranslations['loading_contacts'] || 'loading_contacts';
  $: clickAddContactText = currentTranslations['click_add_contact'] || 'click_add_contact';
  $: selectText = currentTranslations['select'] || 'select';
  $: saveChangesText = currentTranslations['save_changes'] || 'save_changes';
  $: failedDeleteSelectedText = currentTranslations['failed_delete_selected'] || 'failed_delete_selected';
  $: customFieldsText = currentTranslations['custom_fields'] || 'custom_fields';
  $: addCustomFieldText = currentTranslations['add_custom_field'] || 'add_custom_field';
  $: fieldNameText = currentTranslations['field_name'] || 'field_name';
  $: fieldTypeText = currentTranslations['field_type'] || 'field_type';
  $: fieldTypeTextType = currentTranslations['field_type_text'] || 'field_type_text';
  $: fieldTypeNumberType = currentTranslations['field_type_number'] || 'field_type_number';
  $: fieldTypeBooleanType = currentTranslations['field_type_boolean'] || 'field_type_boolean';
  $: fieldTypeEmailType = currentTranslations['field_type_email'] || 'field_type_email';
  $: fieldTypePhoneType = currentTranslations['field_type_phone'] || 'field_type_phone';
  $: fieldTypeDateType = currentTranslations['field_type_date'] || 'field_type_date';
  $: fieldTypeUrlType = currentTranslations['field_type_url'] || 'field_type_url';
  $: fieldRequiredText = currentTranslations['field_required'] || 'field_required';
  $: fieldPlaceholderText = currentTranslations['field_placeholder'] || 'field_placeholder';
  $: fieldNamePlaceholderText = currentTranslations['field_name_placeholder'] || 'field_name_placeholder';
  $: saveCustomFieldText = currentTranslations['save_custom_field'] || 'save_custom_field';
  $: customFieldAddedText = currentTranslations['custom_field_added'] || 'custom_field_added';
  $: customFieldDeletedText = currentTranslations['custom_field_deleted'] || 'custom_field_deleted';
  $: failedAddCustomFieldText = currentTranslations['failed_add_custom_field'] || 'failed_add_custom_field';
  $: failedDeleteCustomFieldText = currentTranslations['failed_delete_custom_field'] || 'failed_delete_custom_field';
  $: manageCustomFieldsText = currentTranslations['manage_custom_fields'] || 'manage_custom_fields';
  
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
      failedUpdateContactText, failedDeleteContactText, failedDeleteSelectedText,
      customFieldsText, addCustomFieldText, fieldNameText, fieldTypeText, fieldTypeTextType,
      fieldTypeNumberType, fieldTypeBooleanType, fieldTypeEmailType, fieldTypePhoneType,
      fieldTypeDateType, fieldTypeUrlType, fieldRequiredText, fieldPlaceholderText,
      fieldNamePlaceholderText, saveCustomFieldText, customFieldAddedText, customFieldDeletedText,
      failedAddCustomFieldText, failedDeleteCustomFieldText, manageCustomFieldsText;
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
  let showCustomFieldModal = false;
  let viewContact = null;
  let editData = { id: null, name: '', whatsapp: '', email: '', customFields: {} };
  let customFields = [];
  let newCustomField = {
    name: '',
    type: 'text',
    required: false
  };
  let viewMode = 'card'; // 'card' | 'table'
  let selectedIds = {};
  $: selectedCount = Object.values(selectedIds).filter(Boolean).length;
  $: isAllSelected = contacts.length > 0 && contacts.every((c) => selectedIds[c.id]);
  
  let formData = {
    name: '',
    whatsapp: '',
    email: '',
    customFields: {}
  };

  // Load contacts on component mount
  onMount(async () => {
    await loadContacts();
    
    // Initialize with some example custom fields for testing
    customFields = [
      {
        id: '1',
        name: 'Jabatan',
        type: 'text',
        required: false
      },
      {
        id: '2',
        name: 'Umur',
        type: 'number',
        required: false
      },
      {
        id: '3',
        name: 'Status Aktif',
        type: 'boolean',
        required: false
      }
    ];
  });

  async function loadContacts() {
    try {
      loading = true;
      error = null;
      console.log('Loading contacts...');
      contacts = await getContacts();
      console.log('Contacts loaded successfully:', contacts);
    } catch (err) {
      error = failedLoadContactsText;
      console.error('Error loading contacts:', err);
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
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
          email: formData.email || null,
          customFields: formData.customFields || {}
        };
        
        const newContact = await createContact(contactData);
        contacts = [newContact, ...contacts];
        
        // reset selections and form
        selectedIds = {};
        formData = {
          name: '',
          whatsapp: '',
          email: '',
          customFields: {}
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
    viewContact = { 
      ...contact,
      customFields: contact.customFields || {}
    };
    showViewModal = true;
  }

  function openEditModal(contact) {
    editData = { 
      id: contact.id, 
      name: contact.name, 
      whatsapp: contact.whatsapp || '', 
      email: contact.email || '',
      customFields: contact.customFields || {}
    };
    showEditModal = true;
  }

  async function saveEdit() {
    if (!editData.name || !editData.whatsapp) return;
    
    try {
      const updatedContact = await updateContact(editData.id, {
        name: editData.name,
        whatsapp: editData.whatsapp,
        email: editData.email || null,
        customFields: editData.customFields || {}
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

  // Custom Field Management Functions
  function addCustomField() {
    if (!newCustomField.name.trim()) return;
    
    const field = {
      id: crypto.randomUUID(),
      name: newCustomField.name.trim(),
      type: newCustomField.type,
      required: newCustomField.required
    };
    
    customFields = [...customFields, field];
    
    // Reset form
    newCustomField = {
      name: '',
      type: 'text',
      required: false
    };
    
    // Show success message
    error = null;
    // You can add a success notification here if needed
  }

  function deleteCustomField(index) {
    customFields = customFields.filter((_, i) => i !== index);
  }

  function resetCustomFieldForm() {
    newCustomField = {
      name: '',
      type: 'text',
      required: false
    };
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

      <button class="flex items-center gap-1 bg-blue-500 text-white border-none px-4 py-3 rounded-md text-sm font-medium hover:bg-blue-600 transition-colors" on:click={() => showCustomFieldModal = true}>
        <Settings size={16} />
        {manageCustomFieldsText}
      </button>
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
          
          <!-- Custom Fields -->
          {#if customFields.length > 0}
            <div class="border-t border-gray-700 pt-4">
              <h3 class="text-sm font-medium text-gray-200 mb-3">{customFieldsText}</h3>
              <div class="flex flex-col gap-3">
                {#each customFields as field (field.id)}
                  <div class="flex flex-col gap-2">
                    <label for={`custom-${field.id}`} class="text-sm font-medium text-gray-200">
                      {field.name}
                      {#if field.required}
                        <span class="text-red-400 ml-1">*</span>
                      {/if}
                    </label>
                    {#if field.type === 'text' || field.type === 'email' || field.type === 'url' || field.type === 'phone'}
                      <input 
                        type={field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : 'text'}
                        id={`custom-${field.id}`}
                        bind:value={formData.customFields[field.id]}
                        placeholder={`Masukkan ${field.name.toLowerCase()}`}
                        required={field.required}
                        class="bg-gray-950 border border-gray-700 rounded-md px-3 py-3 text-gray-200 text-sm focus:outline-none focus:border-green-500 transition-colors"
                      />
                    {:else if field.type === 'number'}
                      <input 
                        type="number"
                        id={`custom-${field.id}`}
                        bind:value={formData.customFields[field.id]}
                        placeholder={`Masukkan ${field.name.toLowerCase()}`}
                        required={field.required}
                        class="bg-gray-950 border border-gray-700 rounded-md px-3 py-3 text-gray-200 text-sm focus:outline-none focus:border-green-500 transition-colors"
                      />
                    {:else if field.type === 'date'}
                      <input 
                        type="date"
                        id={`custom-${field.id}`}
                        bind:value={formData.customFields[field.id]}
                        required={field.required}
                        class="bg-gray-950 border border-gray-700 rounded-md px-3 py-3 text-gray-200 text-sm focus:outline-none focus:border-green-500 transition-colors"
                      />
                    {:else if field.type === 'boolean'}
                      <div class="flex items-center gap-2">
                        <input 
                          type="checkbox"
                          id={`custom-${field.id}`}
                          bind:checked={formData.customFields[field.id]}
                          class="w-4 h-4 accent-green-500"
                        />
                        <label for={`custom-${field.id}`} class="text-sm text-gray-200">Ya</label>
                      </div>
                    {/if}
                  </div>
                {/each}
              </div>
            </div>
          {/if}
          
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
      <div class="flex-1">
        <p class="text-sm font-medium">{error}</p>
        <p class="text-xs opacity-80 mt-1">Jika masalah berlanjut, periksa konfigurasi Supabase dan pastikan tabel 'contact' sudah dibuat.</p>
      </div>
      <button class="bg-white/20 text-white border-none px-3 py-1.5 rounded text-xs hover:bg-white/30 transition-colors ml-4" on:click={loadContacts}>{tryAgainText}</button>
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
                
                <!-- Custom Fields in Card View -->
                {#if customFields.length > 0 && contact.customFields}
                  {#each customFields as field (field.id)}
                    {#if contact.customFields[field.id]}
                      <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-400">{field.name}:</span>
                        <span class="text-sm font-medium text-gray-200">
                          {#if field.type === 'boolean'}
                            {contact.customFields[field.id] ? 'Ya' : 'Tidak'}
                          {:else}
                            {contact.customFields[field.id]}
                          {/if}
                        </span>
                      </div>
                    {/if}
                  {/each}
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
                {#if customFields.length > 0}
                  {#each customFields as field (field.id)}
                    <th class="px-3 py-3 border-b border-gray-700 bg-gray-950 text-gray-200 font-semibold text-left">{field.name}</th>
                  {/each}
                {/if}
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
                  {#if customFields.length > 0}
                    {#each customFields as field (field.id)}
                      <td class="px-3 py-3 border-b border-gray-700 text-gray-200">
                        {#if contact.customFields && contact.customFields[field.id]}
                          {#if field.type === 'boolean'}
                            {contact.customFields[field.id] ? 'Ya' : 'Tidak'}
                          {:else}
                            {contact.customFields[field.id]}
                          {/if}
                        {:else}
                          -
                        {/if}
                      </td>
                    {/each}
                  {/if}
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
          
          <!-- Custom Fields in View Modal -->
          {#if customFields.length > 0 && viewContact.customFields}
            {#each customFields as field (field.id)}
              {#if viewContact.customFields[field.id]}
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-400">{field.name}:</span>
                  <span class="text-sm font-medium text-gray-200">
                    {#if field.type === 'boolean'}
                      {viewContact.customFields[field.id] ? 'Ya' : 'Tidak'}
                    {:else}
                      {viewContact.customFields[field.id]}
                    {/if}
                  </span>
                </div>
              {/if}
            {/each}
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
          
          <!-- Custom Fields in Edit Form -->
          {#if customFields.length > 0}
            <div class="border-t border-gray-700 pt-4">
              <h3 class="text-sm font-medium text-gray-200 mb-3">{customFieldsText}</h3>
              <div class="flex flex-col gap-3">
                {#each customFields as field (field.id)}
                  <div class="flex flex-col gap-2">
                    <label for={`edit-custom-${field.id}`} class="text-sm font-medium text-gray-200">
                      {field.name}
                      {#if field.required}
                        <span class="text-red-400 ml-1">*</span>
                      {/if}
                    </label>
                    {#if field.type === 'text' || field.type === 'email' || field.type === 'url' || field.type === 'phone'}
                      <input 
                        type={field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : 'text'}
                        id={`edit-custom-${field.id}`}
                        bind:value={editData.customFields[field.id]}
                        placeholder={`Masukkan ${field.name.toLowerCase()}`}
                        required={field.required}
                        class="bg-gray-950 border border-gray-700 rounded-md px-3 py-3 text-gray-200 text-sm focus:outline-none focus:border-green-500 transition-colors"
                      />
                    {:else if field.type === 'number'}
                      <input 
                        type="number"
                        id={`edit-custom-${field.id}`}
                        bind:value={editData.customFields[field.id]}
                        placeholder={`Masukkan ${field.name.toLowerCase()}`}
                        required={field.required}
                        class="bg-gray-950 border border-gray-700 rounded-md px-3 py-3 text-gray-200 text-sm focus:outline-none focus:border-green-500 transition-colors"
                      />
                    {:else if field.type === 'date'}
                      <input 
                        type="date"
                        id={`edit-custom-${field.id}`}
                        bind:value={editData.customFields[field.id]}
                        required={field.required}
                        class="bg-gray-950 border border-gray-700 rounded-md px-3 py-3 text-gray-200 text-sm focus:outline-none focus:border-green-500 transition-colors"
                      />
                    {:else if field.type === 'boolean'}
                      <div class="flex items-center gap-2">
                        <input 
                          type="checkbox"
                          id={`edit-custom-${field.id}`}
                          bind:checked={editData.customFields[field.id]}
                          class="w-4 h-4 accent-green-500"
                        />
                        <label for={`edit-custom-${field.id}`} class="text-sm text-gray-200">Ya</label>
                      </div>
                    {/if}
                  </div>
                {/each}
              </div>
            </div>
          {/if}
          <div class="flex gap-3 justify-end mt-2.5">
            <button type="button" class="bg-none border border-gray-700 text-gray-400 px-6 py-3 rounded-md text-sm hover:border-green-500 hover:text-green-500 transition-colors" on:click={() => (showEditModal = false)}>{cancelText}</button>
            <button type="submit" class="bg-green-500 text-white border-none px-6 py-3 rounded-md text-sm font-medium hover:bg-green-600 transition-colors">{saveChangesText}</button>
          </div>
        </form>
      </div>
    </div>
  {/if}

  {#if showCustomFieldModal}
    <div
      class="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]"
      role="button"
      tabindex="0"
      on:click={() => showCustomFieldModal = false}
      on:keydown={(e) => (e.key === 'Escape' || e.key === 'Enter') && (showCustomFieldModal = false)}
    >
      <div class="bg-gray-900 rounded-lg p-8 w-11/12 max-w-2xl border border-gray-700" role="dialog" aria-modal="true" tabindex="0" on:click|stopPropagation on:keydown|stopPropagation>
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl text-gray-200">{manageCustomFieldsText}</h2>
          <button class="bg-none border-none text-gray-400 text-2xl cursor-pointer w-8 h-8 flex items-center justify-center hover:text-gray-200" on:click={() => showCustomFieldModal = false}>×</button>
        </div>
        
        <!-- Add New Custom Field Form -->
        <div class="bg-gray-950 rounded-lg p-6 border border-gray-700 mb-6">
          <h3 class="text-lg text-gray-200 mb-4">{addCustomFieldText}</h3>
          <form class="flex flex-col gap-4" on:submit|preventDefault={addCustomField}>
            <div class="flex flex-col gap-2">
              <label for="fieldName" class="text-sm font-medium text-gray-200">{fieldNameText}</label>
              <input 
                type="text" 
                id="fieldName"
                bind:value={newCustomField.name}
                placeholder={fieldNamePlaceholderText}
                required
                class="bg-gray-950 border border-gray-700 rounded-md px-3 py-3 text-gray-200 text-sm focus:outline-none focus:border-green-500 transition-colors"
              />
            </div>
            
            <div class="flex flex-col gap-2">
              <label for="fieldType" class="text-sm font-medium text-gray-200">{fieldTypeText}</label>
              <select 
                id="fieldType"
                bind:value={newCustomField.type}
                class="bg-gray-950 border border-gray-700 rounded-md px-3 py-3 text-gray-200 text-sm focus:outline-none focus:border-green-500 transition-colors"
              >
                <option value="text">{fieldTypeTextType}</option>
                <option value="number">{fieldTypeNumberType}</option>
                <option value="boolean">{fieldTypeBooleanType}</option>
                <option value="email">{fieldTypeEmailType}</option>
                <option value="phone">{fieldTypePhoneType}</option>
                <option value="date">{fieldTypeDateType}</option>
                <option value="url">{fieldTypeUrlType}</option>
              </select>
            </div>
            
            <div class="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="fieldRequired"
                bind:checked={newCustomField.required}
                class="w-4 h-4 accent-green-500"
              />
              <label for="fieldRequired" class="text-sm text-gray-200">{fieldRequiredText}</label>
            </div>
            
            <div class="flex gap-3 justify-end">
              <button type="button" class="bg-none border border-gray-700 text-gray-400 px-6 py-3 rounded-md text-sm hover:border-green-500 hover:text-green-500 transition-colors" on:click={() => showCustomFieldModal = false}>
                {cancelText}
              </button>
              <button type="submit" class="bg-green-500 text-white border-none px-6 py-3 rounded-md text-sm font-medium hover:bg-green-600 transition-colors">
                {saveCustomFieldText}
              </button>
            </div>
          </form>
        </div>
        
        <!-- Existing Custom Fields List -->
        <div class="bg-gray-950 rounded-lg p-6 border border-gray-700">
          <h3 class="text-lg text-gray-200 mb-4">{customFieldsText}</h3>
          {#if customFields.length === 0}
            <p class="text-gray-400 text-sm">{fieldPlaceholderText}</p>
          {:else}
            <div class="flex flex-col gap-3">
              {#each customFields as field, index (field.id || index)}
                <div class="flex items-center justify-between bg-gray-900 rounded-md p-3 border border-gray-700">
                  <div class="flex flex-col gap-1">
                    <span class="text-gray-200 font-medium">{field.name}</span>
                    <div class="flex items-center gap-4 text-xs text-gray-400">
                      <span>{field.type}</span>
                      {#if field.required}
                        <span class="px-2 py-1 bg-red-500/20 text-red-400 rounded">{fieldRequiredText}</span>
                      {/if}
                    </div>
                  </div>
                  <button 
                    class="bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1.5 rounded text-sm hover:bg-red-500/30 transition-colors"
                    on:click={() => deleteCustomField(index)}
                  >
                    {deleteText}
                  </button>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>
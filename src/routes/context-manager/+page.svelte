<script>
  import { currentLanguage, translations } from '../../lib/stores/language.js';
  import { FileText, Plus, Search, Filter, Edit, Trash2 } from 'lucide-svelte';
  import { onMount } from 'svelte';
  import { getGreetingMessages, createGreetingMessage, updateGreetingMessage, deleteGreetingMessage, getRagContexts, createRagContext, updateRagContext, deleteRagContext } from '../../lib/supabase.js';
  
  $: language = $currentLanguage;
  $: currentTranslations = translations[language] || translations.ms;
  
  // Create reactive variables for all translated text to ensure immediate updates
  $: contextManagerText = currentTranslations['context_manager'] || 'context_manager';
  $: addContextText = currentTranslations['add_context'] || 'add_context';
  $: editContextText = currentTranslations['edit_context'] || 'edit_context';
  $: deleteContextText = currentTranslations['delete_context'] || 'delete_context';
  $: contextNameText = currentTranslations['context_name'] || 'context_name';
  $: contextContentText = currentTranslations['context_content'] || 'context_content';
  $: enterContextNameText = currentTranslations['enter_context_name'] || 'enter_context_name';
  $: enterContextContentText = currentTranslations['enter_context_content'] || 'enter_context_content';
  $: customFieldsText = currentTranslations['custom_fields'] || 'custom_fields';
  $: addCustomFieldText = currentTranslations['add_custom_field'] || 'add_custom_field';
  $: fieldTitleText = currentTranslations['field_title'] || 'field_title';
  $: fieldValueText = currentTranslations['field_value'] || 'field_value';
  $: saveText = currentTranslations['save'] || 'save';
  $: saveContextText = currentTranslations['save_context'] || 'save_context';
  $: updateContextText = currentTranslations['update_context'] || 'update_context';
  $: cancelText = currentTranslations['cancel'] || 'cancel';
  $: closeText = currentTranslations['close'] || 'close';
  $: searchText = currentTranslations['search'] || 'search';
  $: filterText = currentTranslations['filter'] || 'filter';
  $: noContextsText = currentTranslations['no_contexts'] || 'no_contexts';
  $: clickAddContextText = currentTranslations['click_add_context'] || 'click_add_context';
  $: contextDetailsText = currentTranslations['context_details'] || 'context_details';
  $: confirmDeleteText = currentTranslations['confirm_delete'] || 'confirm_delete';
  $: deleteWarningText = currentTranslations['delete_warning'] || 'delete_warning';
  $: yesText = currentTranslations['yes'] || 'yes';
  $: noText = currentTranslations['no'] || 'no';
  $: successText = currentTranslations['success'] || 'success';
  $: errorText = currentTranslations['error'] || 'error';
  $: contextAddedText = currentTranslations['context_added_success'] || 'context_added_success';
  $: contextUpdatedText = currentTranslations['context_updated_success'] || 'context_updated_success';
  $: contextDeletedText = currentTranslations['context_deleted_success'] || 'context_deleted_success';
  $: ragContextText = currentTranslations['rag_context'] || 'rag_context';
  $: greetingMessageText = currentTranslations['greeting_message'] || 'greeting_message';
  $: addGreetingText = currentTranslations['add_greeting'] || 'add_greeting';
  $: editGreetingText = currentTranslations['edit_greeting'] || 'edit_greeting';
  $: deleteGreetingText = currentTranslations['delete_greeting'] || 'delete_greeting';
  $: greetingTitleText = currentTranslations['greeting_title'] || 'greeting_title';
  $: greetingContentText = currentTranslations['greeting_content'] || 'greeting_content';
  $: greetingTitleExampleText = currentTranslations['greeting_title_example'] || 'greeting_title_example';
  $: greetingMessagePlaceholderText = currentTranslations['greeting_message_placeholder'] || 'greeting_message_placeholder';
  $: saveGreetingText = currentTranslations['save_greeting'] || 'save_greeting';
  $: updateGreetingText = currentTranslations['update_greeting'] || 'update_greeting';
  $: loadingGreetingsText = currentTranslations['loading_greetings'] || 'loading_greetings';
  $: noGreetingsText = currentTranslations['no_greetings'] || 'no_greetings';
  $: clickAddGreetingMessageText = currentTranslations['click_add_greeting_message'] || 'click_add_greeting_message';
  $: activeText = currentTranslations['active'] || 'active';
  $: inactiveText = currentTranslations['inactive'] || 'inactive';
  $: toggleActiveText = currentTranslations['toggle_active'] || 'toggle_active';
  $: noTitleText = currentTranslations['no_title'] || 'no_title';
  $: optionalText = currentTranslations['optional'] || 'optional';
  $: prevText = currentTranslations['prev'] || 'prev';
  $: nextText = currentTranslations['next'] || 'next';
  
  // Force immediate reactivity when language changes
  $: {
    if (language) {
      // This ensures all translated text updates immediately when language changes
      contextManagerText, addContextText, editContextText, deleteContextText, contextNameText,
      contextContentText, enterContextNameText, enterContextContentText, customFieldsText, 
      addCustomFieldText, fieldTitleText, fieldValueText, saveText, saveContextText, updateContextText,
      cancelText, closeText, searchText, filterText, noContextsText, clickAddContextText,
      contextDetailsText, confirmDeleteText, deleteWarningText, yesText, noText, successText,
      errorText, contextAddedText, contextUpdatedText, contextDeletedText, ragContextText,
      greetingMessageText, addGreetingText, editGreetingText, deleteGreetingText, greetingTitleText,
      greetingContentText, greetingTitleExampleText, greetingMessagePlaceholderText, saveGreetingText,
      updateGreetingText, loadingGreetingsText, noGreetingsText, clickAddGreetingMessageText,
      activeText, inactiveText, toggleActiveText, noTitleText, optionalText, prevText, nextText;
    }
  }

  // Tabs
  let activeTab = 'rag'; // 'rag' | 'greeting'
  function setActiveTab(tab) {
    activeTab = tab;
    if (tab === 'greeting') {
      // Prefetch greeting messages when switching to the tab
      fetchGreetingMessages();
    }
  }

  let contexts = [];
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

  async function fetchRagContexts() {
    try {
      const data = await getRagContexts();
      contexts = Array.isArray(data) ? data : [];
    } catch (e) {
      console.error(e);
    }
  }

  async function addContext() {
    if (formData.name && formData.description) {
      try {
        if (editingContext) {
          const updated = await updateRagContext(editingContext.id, formData);
          contexts = contexts.map(context => (context.id === updated.id ? updated : context));
        } else {
          const created = await createRagContext(formData);
          contexts = [created, ...contexts];
        }
        resetForm();
      } catch (e) {
        console.error(e);
      }
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

  async function deleteContext(id) {
    try {
      await deleteRagContext(id);
      contexts = contexts.filter(context => context.id !== id);
    } catch (e) {
      console.error(e);
    }
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

  // ========== GREETING MESSAGE (WHATSAPP BOT) ==========
  let greetings = [];
  let isLoadingGreetings = false;
  let showGreetingForm = false;
  let editingGreeting = null;
  let greetingForm = {
    title: '',
    message: '',
    is_active: true
  };

  async function fetchGreetingMessages() {
    try {
      isLoadingGreetings = true;
      const data = await getGreetingMessages();
      greetings = Array.isArray(data) ? data : [];
    } catch (e) {
      console.error(e);
    } finally {
      isLoadingGreetings = false;
    }
  }

  function resetGreetingForm() {
    greetingForm = { title: '', message: '', is_active: true };
    editingGreeting = null;
    showGreetingForm = false;
  }

  async function saveGreeting() {
    try {
      if (!greetingForm.message || greetingForm.message.trim() === '') return;
      if (editingGreeting) {
        const updated = await updateGreetingMessage(editingGreeting.id, greetingForm);
        // sync local state
        greetings = greetings.map((g) => (g.id === updated.id ? updated : g));
      } else {
        const created = await createGreetingMessage(greetingForm);
        greetings = [created, ...greetings];
      }
      resetGreetingForm();
    } catch (e) {
      console.error(e);
    }
  }

  function editGreetingMessageLocal(item) {
    editingGreeting = item;
    greetingForm = {
      title: item.title || '',
      message: item.message || '',
      is_active: !!item.is_active
    };
    showGreetingForm = true;
  }

  async function removeGreetingMessage(id) {
    try {
      await deleteGreetingMessage(id);
      greetings = greetings.filter((g) => g.id !== id);
    } catch (e) {
      console.error(e);
    }
  }

  async function toggleGreetingActive(item) {
    try {
      const updated = await updateGreetingMessage(item.id, {
        title: item.title,
        message: item.message,
        is_active: !item.is_active
      });
      greetings = greetings.map((g) => (g.id === updated.id ? updated : g));
    } catch (e) {
      console.error(e);
    }
  }

  onMount(() => {
    fetchRagContexts();
    // Optional: prefetch greetings on mount
    // fetchGreetingMessages();
  });
</script>

<div class="min-h-[calc(100vh-100px)] mt-10 w-full max-w-none p-0">
  <div class="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-4 px-5 max-w-6xl mx-auto">
    <h1 class="text-3xl md:text-2xl font-semibold text-gray-200 m-0">{contextManagerText}</h1>
    {#if activeTab === 'rag'}
      <button class="bg-green-500 text-white border-0 px-6 py-3 rounded-md text-sm font-medium cursor-pointer transition-colors hover:bg-green-600 w-full md:w-auto" on:click={() => showForm = true}>
        + {addContextText}
      </button>
    {:else if activeTab === 'greeting'}
      <button class="bg-green-500 text-white border-0 px-6 py-3 rounded-md text-sm font-medium cursor-pointer transition-colors hover:bg-green-600 w-full md:w-auto" on:click={() => showGreetingForm = true}>
        + {addGreetingText}
      </button>
    {/if}
  </div>

  <!-- Tabs -->
  <div class="px-5 max-w-6xl mx-auto mb-6">
    <div class="flex gap-2">
      <button class="px-4 py-2 rounded-md text-sm border transition-colors {activeTab === 'rag' ? 'bg-green-500 border-green-500 text-white' : 'bg-neutral-800 border-neutral-700 text-gray-200 hover:bg-neutral-700'}" on:click={() => setActiveTab('rag')}>
        {ragContextText}
      </button>
      <button class="px-4 py-2 rounded-md text-sm border transition-colors {activeTab === 'greeting' ? 'bg-green-500 border-green-500 text-white' : 'bg-neutral-800 border-neutral-700 text-gray-200 hover:bg-neutral-700'}" on:click={() => setActiveTab('greeting')}>
        {greetingMessageText}
      </button>
    </div>
  </div>

  {#if activeTab === 'rag' && showForm}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]" on:click={resetForm} role="dialog" tabindex="-1">
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
      <div class="bg-neutral-800 rounded-lg p-8 w-[90%] max-w-2xl border border-neutral-700 max-h-[90vh] overflow-y-auto" on:click|stopPropagation role="document">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-gray-200 m-0 text-xl">{editingContext ? editContextText : addContextText}</h2>
          <button class="bg-transparent border-0 text-gray-400 text-2xl cursor-pointer p-0 w-8 h-8 flex items-center justify-center hover:text-gray-200" on:click={resetForm}>×</button>
        </div>
        
        <form class="flex flex-col gap-5" on:submit|preventDefault={addContext}>
          <div class="flex flex-col gap-2">
            <label for="name" class="text-gray-200 text-sm font-medium">{contextNameText}</label>
            <input 
              type="text" 
              id="name"
              bind:value={formData.name}
              placeholder={enterContextNameText}
              required
              class="bg-neutral-950 border border-neutral-700 rounded-md px-3 py-3 text-gray-200 text-sm transition-colors font-inherit focus:outline-none focus:border-green-500 placeholder:text-neutral-600"
            />
          </div>
          
          <div class="flex flex-col gap-2">
            <label for="description" class="text-gray-200 text-sm font-medium">{contextContentText}</label>
            <textarea 
              id="description"
              bind:value={formData.description}
              placeholder={enterContextContentText}
              rows="4"
              required
              class="bg-neutral-950 border border-neutral-700 rounded-md px-3 py-3 text-gray-200 text-sm transition-colors font-inherit resize-y min-h-[80px] focus:outline-none focus:border-green-500 placeholder:text-neutral-600"
            ></textarea>
          </div>
          
          <!-- Custom Fields -->
          <div class="border border-neutral-700 rounded-md p-5 bg-neutral-950">
            <h3 class="text-gray-200 text-base m-0 mb-4">{customFieldsText}</h3>
            <div class="mb-4">
              <div class="flex flex-col md:flex-row gap-2.5 items-end">
                <input 
                  type="text" 
                  bind:value={newCustomField.title}
                  placeholder={fieldTitleText}
                  class="flex-1 bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-green-500"
                />
                <input 
                  type="text" 
                  bind:value={newCustomField.value}
                  placeholder={fieldValueText}
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
                  <div class="flex items-start gap-2.5 bg-neutral-800 px-3 py-2 rounded border border-neutral-700 min-w-0">
                    <span class="text-green-500 font-medium text-sm flex-shrink-0">{field.title}:</span>
                    <span class="text-gray-200 text-sm flex-1 break-words overflow-hidden">{field.value}</span>
                    <button 
                      type="button" 
                      class="bg-transparent border-0 text-red-400 text-base cursor-pointer p-0.5 rounded transition-colors hover:bg-red-400/10 flex-shrink-0"
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
              {cancelText}
            </button>
            <button type="submit" class="bg-green-500 text-white border-0 px-6 py-3 rounded-md text-sm font-medium cursor-pointer transition-colors hover:bg-green-600">
              {editingContext ? updateContextText : saveContextText}
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}

  {#if activeTab === 'rag'}
    <div class="mt-5 px-5 max-w-6xl mx-auto">
      {#if contexts.length === 0}
        <div class="text-center py-15 text-gray-400">
          <FileText size={32} class="mx-auto mb-4" />
          <h3 class="text-gray-200 m-0 mb-2.5 text-lg">{noContextsText}</h3>
          <p class="m-0 text-sm">{clickAddContextText}</p>
        </div>
      {:else}
        <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {#each paginatedContexts as context (context.id)}
            <div class="bg-neutral-800 rounded-lg p-5 border border-neutral-700 transition-colors hover:border-green-500">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-gray-200 text-lg font-semibold m-0">{context.name}</h3>
                <div class="flex gap-2 items-center">
                  <button class="flex items-center justify-center w-8 h-8 rounded-md border border-gray-700 bg-gray-900 text-gray-200 hover:border-green-500 transition-colors" title={editContextText} on:click={() => editContext(context)}>
                    <Edit size={16} />
                  </button>
                  <button class="flex items-center justify-center w-8 h-8 rounded-md border border-red-500 bg-gray-900 text-red-500 hover:border-red-600 transition-colors" title={deleteContextText} on:click={() => deleteContext(context.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div class="flex flex-col gap-2">
                <div class="flex flex-col gap-0.5">
                  <span class="text-gray-400 text-xs">{contextContentText}:</span>
                  <span class="text-gray-200 text-sm font-medium">{context.description}</span>
                </div>
                {#if context.customFields.length > 0}
                  <div class="flex flex-col gap-1.5">
                    <span class="text-gray-400 text-xs">{customFieldsText}:</span>
                    {#each context.customFields as field}
                      <div class="flex flex-col sm:flex-row gap-1 sm:gap-2 bg-neutral-950 px-2.5 py-1.5 rounded border border-neutral-700 min-w-0">
                        <span class="text-green-500 text-xs font-medium flex-shrink-0">{field.title}:</span>
                        <span class="text-gray-200 text-xs break-words overflow-hidden">{field.value}</span>
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
              « {prevText}
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
              {nextText} »
            </button>
          </div>
        {/if}
      {/if}
    </div>
  {:else if activeTab === 'greeting'}
    <!-- Greeting message tab -->
    {#if showGreetingForm}
      <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]" on:click={resetGreetingForm} role="dialog" tabindex="-1" on:keydown={(e) => e.key === 'Escape' && resetGreetingForm()}>
        <div class="bg-neutral-800 rounded-lg p-8 w-[90%] max-w-2xl border border-neutral-700 max-h-[90vh] overflow-y-auto" on:click|stopPropagation role="document" tabindex="-1">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-gray-200 m-0 text-xl">{editingGreeting ? editGreetingText : addGreetingText}</h2>
            <button class="bg-transparent border-0 text-gray-400 text-2xl cursor-pointer p-0 w-8 h-8 flex items-center justify-center hover:text-gray-200" on:click={resetGreetingForm}>×</button>
          </div>
          <form class="flex flex-col gap-5" on:submit|preventDefault={saveGreeting}>
            <div class="flex flex-col gap-2">
              <label for="greet-title" class="text-gray-200 text-sm font-medium">{greetingTitleText} ({optionalText})</label>
              <input 
                id="greet-title"
                type="text"
                bind:value={greetingForm.title}
                placeholder={greetingTitleExampleText}
                class="bg-neutral-950 border border-neutral-700 rounded-md px-3 py-3 text-gray-200 text-sm transition-colors font-inherit focus:outline-none focus:border-green-500 placeholder:text-neutral-600"
              />
            </div>
            <div class="flex flex-col gap-2">
              <label for="greet-message" class="text-gray-200 text-sm font-medium">{greetingContentText}</label>
              <textarea
                id="greet-message"
                rows="5"
                bind:value={greetingForm.message}
                placeholder={greetingMessagePlaceholderText}
                required
                class="bg-neutral-950 border border-neutral-700 rounded-md px-3 py-3 text-gray-200 text-sm transition-colors font-inherit resize-y min-h-[100px] focus:outline-none focus:border-green-500 placeholder:text-neutral-600"
              ></textarea>
            </div>
            <div class="flex items-center gap-2">
              <input id="greet-active" type="checkbox" bind:checked={greetingForm.is_active} class="accent-green-500 w-4 h-4" />
              <label for="greet-active" class="text-gray-200 text-sm">{activeText}</label>
            </div>
            <div class="flex gap-3 justify-end mt-2.5">
              <button type="button" class="bg-transparent border border-neutral-700 text-gray-400 px-6 py-3 rounded-md text-sm cursor-pointer transition-all hover:border-green-500 hover:text-green-500" on:click={resetGreetingForm}>
                {cancelText}
              </button>
              <button type="submit" class="bg-green-500 text-white border-0 px-6 py-3 rounded-md text-sm font-medium cursor-pointer transition-colors hover:bg-green-600">
                {editingGreeting ? updateGreetingText : saveGreetingText}
              </button>
            </div>
          </form>
        </div>
      </div>
    {/if}

    <div class="mt-5 px-5 max-w-6xl mx-auto">
      {#if isLoadingGreetings}
        <div class="text-center py-15 text-gray-400">{loadingGreetingsText}</div>
      {:else if greetings.length === 0}
        <div class="text-center py-15 text-gray-400">
          <FileText size={32} class="mx-auto mb-4" />
          <h3 class="text-gray-200 m-0 mb-2.5 text-lg">{noGreetingsText}</h3>
          <p class="m-0 text-sm">{clickAddGreetingMessageText}</p>
        </div>
      {:else}
        <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {#each greetings as g (g.id)}
            <div class="bg-neutral-800 rounded-lg p-5 border border-neutral-700 transition-colors hover:border-green-500">
              <div class="flex justify-between items-start gap-3 mb-3">
                <div class="flex-1">
                  <h3 class="text-gray-200 text-lg font-semibold m-0">{g.title || noTitleText}</h3>
                  <div class="text-xs mt-1">
                    {#if g.is_active}
                      <span class="px-2 py-1 rounded bg-green-500/10 text-green-400 border border-green-600/30">{activeText}</span>
                    {:else}
                      <span class="px-2 py-1 rounded bg-neutral-700 text-gray-300 border border-neutral-600">{inactiveText}</span>
                    {/if}
                  </div>
                </div>
                <div class="flex gap-2 items-center">
                  <button class="flex items-center justify-center w-8 h-8 rounded-md border border-gray-700 bg-gray-900 text-gray-200 hover:border-green-500 transition-colors" title={editGreetingText} on:click={() => editGreetingMessageLocal(g)}>
                    <Edit size={16} />
                  </button>
                  <button class="flex items-center justify-center w-8 h-8 rounded-md border border-red-500 bg-gray-900 text-red-500 hover:border-red-600 transition-colors" title={deleteGreetingText} on:click={() => removeGreetingMessage(g.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div class="text-gray-200 text-sm whitespace-pre-wrap">{g.message}</div>
              <div class="mt-4 flex items-center gap-2">
                <span class="text-xs text-gray-400">{toggleActiveText}</span>
                <button class="px-3 py-1 text-xs rounded border {g.is_active ? 'bg-green-500 border-green-500 text-white' : 'bg-neutral-800 border-neutral-700 text-gray-200 hover:bg-neutral-700'}" on:click={() => toggleGreetingActive(g)}>
                  {g.is_active ? activeText : inactiveText}
                </button>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  /* Custom field text wrapping */
  .break-words {
    word-wrap: break-word;
    word-break: break-word;
    overflow-wrap: break-word;
  }
  
  .overflow-hidden {
    overflow: hidden;
  }
  
  .min-w-0 {
    min-width: 0;
  }
  
  .flex-shrink-0 {
    flex-shrink: 0;
  }

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
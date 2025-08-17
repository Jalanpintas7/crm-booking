<script>
  import { onMount } from 'svelte';
  import { Eye, Edit, Trash2 } from 'lucide-svelte';
  import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from '../supabase.js';

  export let titleText = 'Pekerja';
  export let descriptionText = '';
  export let nameLabelText = 'Nama';
  export let whatsappLabelText = 'WhatsApp';
  export let emailLabelText = 'Email';
  export let addEmployeeText = 'Tambah Pekerja';
  export let saveText = 'Simpan';
  export let cancelText = 'Batal';
  export let editText = 'Edit';
  export let deleteText = 'Hapus';
  export let employeeDetailsText = 'Detail Pekerja';
  export let editEmployeeText = 'Edit Pekerja';
  export let closeText = 'Tutup';
  export let loadingText = 'Memuat...';
  export let emptyText = 'Belum ada pekerja';

  let employees = [];
  let loading = true;
  let error = null;
  let showCreate = false;
  let showView = false;
  let showEdit = false;
  let viewItem = null;
  let form = { name: '', whatsapp: '', email: '' };
  let editForm = { id: null, name: '', whatsapp: '', email: '' };

  onMount(loadEmployees);

  async function loadEmployees() {
    try {
      loading = true;
      error = null;
      employees = await getEmployees();
    } catch (e) {
      error = 'Gagal memuat pekerja';
    } finally {
      loading = false;
    }
  }

  async function addEmployee() {
    if (!form.name || !form.whatsapp) return;
    try {
      const created = await createEmployee({
        name: form.name,
        whatsapp: form.whatsapp,
        email: form.email || null
      });
      employees = [created, ...employees];
      form = { name: '', whatsapp: '', email: '' };
      showCreate = false;
    } catch (e) {
      error = 'Gagal menambah pekerja';
    }
  }

  async function saveEdit() {
    if (!editForm.name || !editForm.whatsapp) return;
    try {
      const updated = await updateEmployee(editForm.id, {
        name: editForm.name,
        whatsapp: editForm.whatsapp,
        email: editForm.email || null
      });
      employees = employees.map((e) => (e.id === editForm.id ? updated : e));
      showEdit = false;
    } catch (e) {
      error = 'Gagal mengemas kini pekerja';
    }
  }

  async function removeEmployee(id) {
    try {
      await deleteEmployee(id);
      employees = employees.filter((e) => e.id !== id);
    } catch (e) {
      error = 'Gagal menghapus pekerja';
    }
  }

  function restrictToNumbers(event) {
    const input = event.target;
    const numbersOnly = String(input.value || '').replace(/[^0-9]/g, '');
    if (numbersOnly !== input.value) input.value = numbersOnly;
    if (input.id === 'whatsapp') form.whatsapp = numbersOnly;
    if (input.id === 'edit-whatsapp') editForm.whatsapp = numbersOnly;
    if (numbersOnly.length > 15) {
      const trimmed = numbersOnly.slice(0, 15);
      input.value = trimmed;
      if (input.id === 'whatsapp') form.whatsapp = trimmed;
      if (input.id === 'edit-whatsapp') editForm.whatsapp = trimmed;
    }
  }

  function preventNonNumeric(event) {
    const allowed = ['0','1','2','3','4','5','6','7','8','9','Backspace','Delete','Tab','Enter','ArrowLeft','ArrowRight','Home','End'];
    if (!allowed.includes(event.key)) event.preventDefault();
  }
</script>

<div class="bg-neutral-900 rounded-lg p-8 border border-neutral-700 mb-8">
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
    <div>
      <h2 class="text-xl font-semibold text-gray-200 m-0 mb-1">{titleText}</h2>
      {#if descriptionText}
        <p class="text-gray-400 text-sm m-0">{descriptionText}</p>
      {/if}
    </div>
    <button class="bg-green-500 text-white border-0 px-6 py-3 rounded-md text-sm font-medium cursor-pointer transition-colors hover:bg-green-600 self-start" on:click={() => showCreate = true}>
      {addEmployeeText}
    </button>
  </div>

  {#if loading}
    <div class="text-center py-12 text-gray-400">{loadingText}</div>
  {:else if employees.length === 0}
    <div class="text-center py-12 text-gray-400">{emptyText}</div>
  {:else}
    <div class="w-full overflow-x-auto">
      <table class="w-full min-w-[640px] border-collapse bg-neutral-950 border border-neutral-700 rounded-lg">
        <thead>
          <tr>
            <th class="px-3 py-3 border-b border-neutral-700 bg-neutral-900 text-gray-200 text-left">{nameLabelText}</th>
            <th class="px-3 py-3 border-b border-neutral-700 bg-neutral-900 text-gray-200 text-left">{whatsappLabelText}</th>
            <th class="px-3 py-3 border-b border-neutral-700 bg-neutral-900 text-gray-200 text-left">{emailLabelText}</th>
            <th class="w-36 px-3 py-3 border-b border-neutral-700 bg-neutral-900 text-gray-200 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {#each employees as emp (emp.id)}
            <tr>
              <td class="px-3 py-3 border-b border-neutral-700 text-gray-200">{emp.name}</td>
              <td class="px-3 py-3 border-b border-neutral-700 text-gray-200">{emp.whatsapp}</td>
              <td class="px-3 py-3 border-b border-neutral-700 text-gray-200">{emp.email || '-'}</td>
              <td class="px-3 py-3 border-b border-neutral-700 text-right">
                <div class="flex items-center gap-2 justify-end">
                  <button class="flex items-center justify-center w-8 h-8 rounded-md border border-neutral-700 bg-neutral-900 text-gray-200 hover:border-green-500 transition-colors" title={employeeDetailsText} on:click={() => { viewItem = emp; showView = true; }}>
                    <Eye size={16} />
                  </button>
                  <button class="flex items-center justify-center w-8 h-8 rounded-md border border-neutral-700 bg-neutral-900 text-gray-200 hover:border-green-500 transition-colors" title={editText} on:click={() => { editForm = { id: emp.id, name: emp.name, whatsapp: emp.whatsapp || '', email: emp.email || '' }; showEdit = true; }}>
                    <Edit size={16} />
                  </button>
                  <button class="flex items-center justify-center w-8 h-8 rounded-md border border-red-500 bg-neutral-900 text-red-500 hover:border-red-600 transition-colors" title={deleteText} on:click={() => removeEmployee(emp.id)}>
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
</div>

{#if showCreate}
  <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]" role="button" tabindex="0" on:click={() => showCreate = false} on:keydown={(e) => (e.key === 'Escape' || e.key === 'Enter') && (showCreate = false)}>
    <div class="bg-gray-900 rounded-lg p-6 sm:p-8 w-11/12 max-w-lg border border-gray-700" role="dialog" aria-modal="true" tabindex="0" on:click|stopPropagation on:keydown|stopPropagation>
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl text-gray-200 m-0">{addEmployeeText}</h2>
        <button class="bg-none border-none text-gray-400 text-2xl cursor-pointer w-8 h-8 flex items-center justify-center hover:text-gray-200" on:click={() => showCreate = false}>×</button>
      </div>
      <form class="flex flex-col gap-4 sm:gap-5" on:submit|preventDefault={addEmployee}>
        <div class="flex flex-col gap-2">
          <label for="name" class="text-sm font-medium text-gray-200">{nameLabelText}</label>
          <input id="name" type="text" bind:value={form.name} class="bg-gray-950 border border-gray-700 rounded-md px-3 py-3 text-gray-200 text-sm focus:outline-none focus:border-green-500 transition-colors" required />
        </div>
        <div class="flex flex-col gap-2">
          <label for="whatsapp" class="text-sm font-medium text-gray-200">{whatsappLabelText}</label>
          <input id="whatsapp" type="tel" bind:value={form.whatsapp} class="bg-gray-950 border border-gray-700 rounded-md px-3 py-3 text-gray-200 text-sm focus:outline-none focus:border-green-500 transition-colors" required on:input={restrictToNumbers} on:keydown={preventNonNumeric} />
          <p class="text-xs text-gray-500">Hanya angka</p>
        </div>
        <div class="flex flex-col gap-2">
          <label for="email" class="text-sm font-medium text-gray-200">{emailLabelText}</label>
          <input id="email" type="email" bind:value={form.email} class="bg-gray-950 border border-gray-700 rounded-md px-3 py-3 text-gray-200 text-sm focus:outline-none focus:border-green-500 transition-colors" />
        </div>
        <div class="flex gap-2 sm:gap-3 justify-end mt-2.5">
          <button type="button" class="bg-none border border-gray-700 text-gray-400 px-6 py-3 rounded-md text-sm hover:border-green-500 hover:text-green-500 transition-colors" on:click={() => showCreate = false}>{cancelText}</button>
          <button type="submit" class="bg-green-500 text-white border-none px-6 py-3 rounded-md text-sm font-medium hover:bg-green-600 transition-colors">{saveText}</button>
        </div>
      </form>
    </div>
  </div>
{/if}

{#if showView && viewItem}
  <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]" role="button" tabindex="0" on:click={() => showView = false} on:keydown={(e) => (e.key === 'Escape' || e.key === 'Enter') && (showView = false)}>
    <div class="bg-gray-900 rounded-lg p-6 sm:p-8 w-11/12 max-w-lg border border-gray-700" role="dialog" aria-modal="true" tabindex="0" on:click|stopPropagation on:keydown|stopPropagation>
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl text-gray-200 m-0">{employeeDetailsText}</h2>
        <button class="bg-none border-none text-gray-400 text-2xl cursor-pointer w-8 h-8 flex items-center justify-center hover:text-gray-200" on:click={() => showView = false}>×</button>
      </div>
      <div class="flex flex-col gap-2">
        <div class="flex justify-between items-center"><span class="text-sm text-gray-400">{nameLabelText}:</span><span class="text-sm font-medium text-gray-200">{viewItem.name}</span></div>
        <div class="flex justify-between items-center"><span class="text-sm text-gray-400">{whatsappLabelText}:</span><span class="text-sm font-medium text-gray-200">{viewItem.whatsapp}</span></div>
        {#if viewItem.email}
          <div class="flex justify-between items-center"><span class="text-sm text-gray-400">{emailLabelText}:</span><span class="text-sm font-medium text-gray-200">{viewItem.email}</span></div>
        {/if}
      </div>
      <div class="flex justify-end mt-2.5">
        <button type="button" class="bg-none border border-gray-700 text-gray-400 px-6 py-3 rounded-md text-sm hover:border-green-500 hover:text-green-500 transition-colors" on:click={() => showView = false}>{closeText}</button>
      </div>
    </div>
  </div>
{/if}

{#if showEdit}
  <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]" role="button" tabindex="0" on:click={() => showEdit = false} on:keydown={(e) => (e.key === 'Escape' || e.key === 'Enter') && (showEdit = false)}>
    <div class="bg-gray-900 rounded-lg p-6 sm:p-8 w-11/12 max-w-lg border border-gray-700" role="dialog" aria-modal="true" tabindex="0" on:click|stopPropagation on:keydown|stopPropagation>
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl text-gray-200 m-0">{editEmployeeText}</h2>
        <button class="bg-none border-none text-gray-400 text-2xl cursor-pointer w-8 h-8 flex items-center justify-center hover:text-gray-200" on:click={() => showEdit = false}>×</button>
      </div>
      <form class="flex flex-col gap-4 sm:gap-5" on:submit|preventDefault={saveEdit}>
        <div class="flex flex-col gap-2">
          <label for="edit-name" class="text-sm font-medium text-gray-200">{nameLabelText}</label>
          <input id="edit-name" type="text" bind:value={editForm.name} class="bg-gray-950 border border-gray-700 rounded-md px-3 py-3 text-gray-200 text-sm focus:outline-none focus:border-green-500 transition-colors" required />
        </div>
        <div class="flex flex-col gap-2">
          <label for="edit-whatsapp" class="text-sm font-medium text-gray-200">{whatsappLabelText}</label>
          <input id="edit-whatsapp" type="tel" bind:value={editForm.whatsapp} class="bg-gray-950 border border-gray-700 rounded-md px-3 py-3 text-gray-200 text-sm focus:outline-none focus:border-green-500 transition-colors" required on:input={restrictToNumbers} on:keydown={preventNonNumeric} />
          <p class="text-xs text-gray-500">Hanya angka</p>
        </div>
        <div class="flex flex-col gap-2">
          <label for="edit-email" class="text-sm font-medium text-gray-200">{emailLabelText}</label>
          <input id="edit-email" type="email" bind:value={editForm.email} class="bg-gray-950 border border-gray-700 rounded-md px-3 py-3 text-gray-200 text-sm focus:outline-none focus:border-green-500 transition-colors" />
        </div>
        <div class="flex gap-2 sm:gap-3 justify-end mt-2.5">
          <button type="button" class="bg-none border border-gray-700 text-gray-400 px-6 py-3 rounded-md text-sm hover:border-green-500 hover:text-green-500 transition-colors" on:click={() => showEdit = false}>{cancelText}</button>
          <button type="submit" class="bg-green-500 text-white border-none px-6 py-3 rounded-md text-sm font-medium hover:bg-green-600 transition-colors">{saveText}</button>
        </div>
      </form>
    </div>
  </div>
{/if}



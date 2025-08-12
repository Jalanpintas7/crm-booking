<script>
  import { createHoliday, deleteHoliday } from '../supabase.js';
  import DatePicker from './DatePicker.svelte';

  // Bind-able props for parent state synchronization
  export let holidays = [];
  export let holidayListVersion = 0;

  // Functions passed from parent
  export let showNotificationModal = (message, type) => {};
  export let setError = (message) => {};

  // Translated texts passed from parent for reactivity with language changes
  export let holidayManagementText = 'Pengurusan Cuti';
  export let holidayManagementDescriptionText = '';
  export let dateText = 'Tarikh';
  export let descriptionText = 'Deskripsi';
  export let addHolidayText = 'Tambah Cuti';
  export let holidayText = 'Cuti';
  export let notHolidayText = 'Bukan Cuti';
  export let holidayListText = 'Senarai Cuti';
  export let noHolidaysForMonthText = 'Tiada cuti';
  export let deleteHolidayText = 'Padam';
  export let holidayAddedSuccessText = 'Cuti berjaya ditambah!';
  export let holidayAddedFailedText = 'Gagal menambah cuti. Cuba lagi.';
  export let holidayDeletedSuccessText = 'Cuti berjaya dipadam!';
  export let holidayDeletedFailedText = 'Gagal memadam cuti. Cuba lagi.';

  // Local state for this component
  let selectedDate = '';
  let holidayDescription = '';
  let isHoliday = false;
  
  // Make month/year bindable to persist across rebuilds
  export let selectedMonth = new Date().getMonth();
  export let selectedYear = new Date().getFullYear();

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

  $: holidaysInMonth = getHolidaysInMonth(selectedMonth, selectedYear);
  $: _forceHolidayListRerender = holidayListVersion; // keep behavior consistent
  $: { if (holidays.length >= 0) { holidaysInMonth; } }

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

  async function addHolidayHandler() {
    if (selectedDate && holidayDescription) {
      try {
        const holidayData = {
          date: selectedDate,
          description: holidayDescription,
          isHoliday: isHoliday
        };
        const newHoliday = await createHoliday(holidayData);
        holidays = [...holidays, newHoliday];
        holidayListVersion += 1;
        selectedDate = '';
        holidayDescription = '';
        isHoliday = false;
        showNotificationModal(holidayAddedSuccessText, 'success');
      } catch (err) {
        setError(holidayAddedFailedText);
        console.error('Error adding holiday:', err);
        showNotificationModal('Ralat: ' + err.message, 'error');
      }
    }
  }

  async function deleteHolidayHandler(id) {
    try {
      await deleteHoliday(id);
      holidays = holidays.filter(holiday => holiday.id !== id);
      holidayListVersion += 1;
      showNotificationModal(holidayDeletedSuccessText, 'success');
    } catch (err) {
      setError(holidayDeletedFailedText);
      console.error('Error deleting holiday:', err);
      showNotificationModal('Ralat: ' + err.message, 'error');
    }
  }
</script>

<div class="bg-neutral-900 rounded-lg p-8 border border-neutral-700 mb-8">
  <h2 class="text-xl font-semibold text-gray-200 m-0 mb-2.5">{holidayManagementText}</h2>
  <p class="text-gray-400 text-sm m-0 mb-6">{holidayManagementDescriptionText}</p>

  <div class="bg-neutral-950 rounded-md p-5 border border-neutral-700 mb-6">
    <div class="flex flex-col md:flex-row gap-5 mb-4">
      <div class="flex flex-col gap-2 flex-1">
        <label for="holidayDate" class="text-gray-200 text-sm font-medium">{dateText}</label>
        <DatePicker
          id="holidayDate"
          name="holidayDate"
          bind:value={selectedDate}
          placeholder={dateText}
          required
        />
      </div>
      <div class="flex flex-col gap-2 flex-1">
        <label for="holidayDescription" class="text-gray-200 text-sm font-medium">{descriptionText}</label>
        <input
          type="text"
          id="holidayDescription"
          bind:value={holidayDescription}
          placeholder={descriptionText}
          required
          class="w-full bg-gray-950 border border-gray-600 rounded-lg h-[46px] px-4 text-gray-200 text-sm transition-all focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 placeholder-gray-400"
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
          <span class="text-gray-200 text-sm">{holidayText}</span>
        </label>
      </div>
      <button
        class="bg-green-500 text-white border-0 px-6 py-3 rounded-md text-sm font-medium cursor-pointer transition-colors hover:bg-green-600 self-end"
        on:click={addHolidayHandler}
      >
        {addHolidayText}
      </button>
    </div>
  </div>

  <div class="bg-neutral-950 rounded-md p-5 border border-neutral-700">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
      <h3 class="text-gray-200 text-lg m-0">{holidayListText}</h3>
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
      {#if holidaysInMonth.length === 0}
        <div class="text-center py-8 text-gray-400">
          <p class="m-0">{noHolidaysForMonthText}</p>
        </div>
      {:else}
        {#each holidaysInMonth as holiday}
          <div class="flex justify-between items-center bg-neutral-800 rounded-md p-4 border border-neutral-700">
            <div class="flex flex-col gap-1.5">
              <div class="text-gray-200 text-base font-semibold">{formatDate(holiday.date)}</div>
              <div class="text-gray-400 text-sm">{holiday.description}</div>
              <div class="text-green-500 text-xs font-medium">
                {holiday.isHoliday ? holidayText : notHolidayText}
              </div>
            </div>
            <button
              class="bg-transparent border-0 text-red-400 text-lg cursor-pointer p-1.5 rounded transition-colors hover:bg-red-400/10"
              on:click={() => deleteHolidayHandler(holiday.id)}
              title={deleteHolidayText}
            >
              ×
            </button>
          </div>
        {/each}
      {/if}
    </div>
  </div>
</div>



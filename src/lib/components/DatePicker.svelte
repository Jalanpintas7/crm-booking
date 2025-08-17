<script>
  import { onMount, createEventDispatcher } from 'svelte';
  import { t } from '$lib/stores/language.js';

  // Props
  export let value = null; // Date | string | null
  export let placeholder = t('choose_date');
  export let disabled = false;
  export let clearable = true;
  export let firstDayOfWeek = 1; // 1 = Senin
  export let minDate = null; // Date | null
  export let maxDate = null; // Date | null
  export let format = 'yyyy-MM-dd';
  export let name = '';
  export let id = '';
  export let required = false;
  // returnType controls returned value when selecting a date
  // 'string' -> 'yyyy-MM-dd' (default), 'date' -> Date object
  export let returnType = 'string';

  // Internal state
  let isOpen = false;
  let focusedDate = null; // Date pointer for keyboard nav
  let viewYear;
  let viewMonth; // 0-11
  let inputEl;
  let popoverEl;

  const today = new Date();
  const dispatch = createEventDispatcher();

  const MONTHS_ID = [
    'Januari','Februari','Maret','April','Mei','Juni',
    'Juli','Agustus','September','Oktober','November','Desember'
  ];
  const WEEKDAYS_SHORT_ID = ['M','S','S','R','K','J','S']; // Mulai Senin

  function toDate(d) {
    if (!d) return null;
    if (d instanceof Date) return new Date(d.getTime());
    const parsed = new Date(d);
    return isNaN(parsed) ? null : parsed;
  }

  function clampToMinMax(date) {
    if (!date) return date;
    const min = toDate(minDate);
    const max = toDate(maxDate);
    let out = new Date(date);
    if (min && out < startOfDay(min)) out = startOfDay(min);
    if (max && out > startOfDay(max)) out = startOfDay(max);
    return out;
  }

  function startOfDay(d) {
    const nd = new Date(d);
    nd.setHours(0,0,0,0);
    return nd;
  }

  function sameDay(a, b) {
    if (!a || !b) return false;
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  function formatDate(date, pattern = format) {
    if (!date) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    if (pattern === 'yyyy-MM-dd') return `${y}-${m}-${d}`;
    if (pattern === 'dd/MM/yyyy') return `${d}/${m}/${y}`;
    // fallback to locale
    return date.toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }

  function daysInMonth(year, monthIdx) {
    return new Date(year, monthIdx + 1, 0).getDate();
  }

  function buildCalendar(year, month, fdow = 1) {
    const days = [];
    const firstOfMonth = new Date(year, month, 1);
    const lastOfMonth = new Date(year, month + 1, 0);
    const startDay = (firstOfMonth.getDay() + 6) % 7; // 0=Mon .. 6=Sun
    const leading = (startDay - (fdow === 1 ? 0 : 6) + 7) % 7;
    const totalDays = daysInMonth(year, month);
    const totalCells = Math.ceil((leading + totalDays) / 7) * 7;

    for (let i = 0; i < totalCells; i++) {
      const date = new Date(year, month, i - leading + 1);
      const inThisMonth = date.getMonth() === month;
      const disabled = isDisabledDate(date);
      days.push({ date, isOutside: !inThisMonth, disabled });
    }
    return days;
  }

  function open() {
    if (disabled) return;
    isOpen = true;
    const initial = toDate(value) || today;
    viewYear = initial.getFullYear();
    viewMonth = initial.getMonth();
    focusedDate = new Date(initial);
    // position update on next tick
    requestAnimationFrame(() => positionPopover());
  }

  function close() {
    isOpen = false;
  }

  function toggle() { isOpen ? close() : open(); }

  function isDisabledDate(date) {
    const min = toDate(minDate);
    const max = toDate(maxDate);
    if (min && startOfDay(date) < startOfDay(min)) return true;
    if (max && startOfDay(date) > startOfDay(max)) return true;
    return false;
  }

  function selectDate(date) {
    if (isDisabledDate(date)) return;
    const picked = startOfDay(date);
    value = returnType === 'date' ? picked : formatDate(picked, 'yyyy-MM-dd');
    focusedDate = picked;
    dispatch('change', { value });
    close();
  }

  function goMonth(delta) {
    const dt = new Date(viewYear, viewMonth + delta, 1);
    viewYear = dt.getFullYear();
    viewMonth = dt.getMonth();
    // keep focus in view
    focusedDate = new Date(viewYear, viewMonth, Math.min(focusedDate?.getDate() || 1, daysInMonth(viewYear, viewMonth)));
  }

  function onKeyDown(e) {
    if (!isOpen) return;
    const key = e.key;
    if (key === 'Escape') {
      e.preventDefault();
      close();
      return;
    }
    let deltaDays = 0;
    if (key === 'ArrowLeft') deltaDays = -1;
    else if (key === 'ArrowRight') deltaDays = 1;
    else if (key === 'ArrowUp') deltaDays = -7;
    else if (key === 'ArrowDown') deltaDays = 7;
    else if (key === 'PageUp') { goMonth(-1); return; }
    else if (key === 'PageDown') { goMonth(1); return; }
    else if (key === 'Home') { focusedDate = new Date(viewYear, viewMonth, 1); return; }
    else if (key === 'End') { focusedDate = new Date(viewYear, viewMonth, daysInMonth(viewYear, viewMonth)); return; }
    else if (key === 'Enter' || key === ' ') { e.preventDefault(); selectDate(focusedDate); return; }

    if (deltaDays !== 0) {
      e.preventDefault();
      const next = new Date(focusedDate || new Date(viewYear, viewMonth, 1));
      next.setDate(next.getDate() + deltaDays);
      focusedDate = clampToMinMax(next);
      // adjust view if moved to different month
      viewYear = focusedDate.getFullYear();
      viewMonth = focusedDate.getMonth();
    }
  }

  function clickOutside(node, cb) {
    const onClick = (e) => {
      // Check if click is outside both the input and the popover
      const inputContainer = inputEl;
      const popoverContainer = popoverEl;
      
      if (!inputContainer?.contains(e.target) && !popoverContainer?.contains(e.target)) {
        cb?.();
      }
    };
    document.addEventListener('pointerdown', onClick, true);
    return { destroy() { document.removeEventListener('pointerdown', onClick, true); } };
  }

  function positionPopover() {
    if (!inputEl || !popoverEl) return;
    
    // Reset styles first
    popoverEl.style.top = '';
    popoverEl.style.bottom = '';
    popoverEl.style.left = '';
    popoverEl.style.right = '';
    
    const inputRect = inputEl.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    // Estimate popover dimensions (we'll adjust after first render)
    const estimatedPopoverHeight = 320; // Approximate height
    const estimatedPopoverWidth = 270; // Approximate width
    
    // Calculate available space
    const spaceBelow = viewportHeight - inputRect.bottom;
    const spaceAbove = inputRect.top;
    
    // Position vertically
    if (spaceBelow >= estimatedPopoverHeight || spaceBelow > spaceAbove) {
      // Show below
      popoverEl.style.top = `${inputRect.bottom + 8}px`;
    } else {
      // Show above
      popoverEl.style.bottom = `${viewportHeight - inputRect.top + 8}px`;
    }
    
    // Position horizontally - align with input
    const leftPosition = Math.max(8, inputRect.left);
    const rightPosition = Math.max(8, viewportWidth - inputRect.right);
    
    if (leftPosition + estimatedPopoverWidth > viewportWidth - 8) {
      // Adjust if popover would overflow right
      popoverEl.style.right = '8px';
    } else {
      // Align with input left edge
      popoverEl.style.left = `${leftPosition}px`;
    }
    
    // After positioning, adjust if needed based on actual popover size
    setTimeout(() => {
      const actualPopoverRect = popoverEl.getBoundingClientRect();
      
      // Check if popover goes outside viewport
      if (actualPopoverRect.right > viewportWidth - 8) {
        popoverEl.style.left = `${viewportWidth - actualPopoverRect.width - 8}px`;
      }
      
      if (actualPopoverRect.left < 8) {
        popoverEl.style.left = '8px';
      }
    }, 0);
  }

  onMount(() => {
    const onResize = () => { 
      if (isOpen) {
        // Add a small delay to ensure DOM is updated
        setTimeout(() => positionPopover(), 0);
      }
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
    };
  });
</script>

<div class="dp-root" data-open={isOpen} on:keydown={onKeyDown} {...$$restProps}>
  <div
    class="dp-input bg-gray-950 border border-gray-600 rounded-lg h-[46px] px-4 text-gray-200 text-sm transition-all focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-500/20 cursor-pointer"
    class:dp-disabled={disabled}
    bind:this={inputEl}
    role="button"
    tabindex="0"
    aria-haspopup="dialog"
    aria-expanded={isOpen}
    on:click={toggle}
    on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } }}
  >
    <input
      class="dp-input-field placeholder-gray-400 h-full"
      {name}
      {id}
      {required}
      type="text"
      placeholder={placeholder}
      value={formatDate(toDate(value))}
      readonly
      disabled={disabled}
    />
    {#if clearable && value && !disabled}
      <button class="dp-clear-btn text-gray-400 hover:text-gray-200" type="button" aria-label="Bersihkan" on:click={(e) => { e.stopPropagation(); value = null; dispatch('change', { value }); }}>&times;</button>
    {/if}
    <svg class="dp-icon text-gray-400" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 11h10v2H7zM19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v13c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 15H5V9h14v10z"/></svg>
  </div>

  {#if isOpen}
    <div class="dp-popover-wrapper" use:clickOutside={() => close()}>
      <div class="dp-popover" bind:this={popoverEl} role="dialog" aria-label="Kalender">
        <div class="dp-header">
          <button class="dp-nav" type="button" aria-label="Bulan sebelumnya" on:click={() => goMonth(-1)}>&#x2039;</button>
          <div class="dp-month-label">{MONTHS_ID[viewMonth]} {viewYear}</div>
          <button class="dp-nav" type="button" aria-label="Bulan berikutnya" on:click={() => goMonth(1)}>&#x203A;</button>
        </div>
        <div class="dp-weekdays">
          {#each Array.from({ length: 7 }) as _, i}
            <div class="dp-weekday">{WEEKDAYS_SHORT_ID[(i + (firstDayOfWeek === 1 ? 0 : 6)) % 7]}</div>
          {/each}
        </div>

        {#key `${viewYear}-${viewMonth}`}
          <div class="dp-grid">
            {#each buildCalendar(viewYear, viewMonth, firstDayOfWeek) as cell}
              <button
                type="button"
                class="dp-cell {cell.isOutside ? 'dp-out' : ''} {sameDay(toDate(value), cell.date) ? 'dp-selected' : ''} {sameDay(startOfDay(today), cell.date) ? 'dp-today' : ''}"
                aria-pressed={sameDay(toDate(value), cell.date)}
                disabled={cell.disabled}
                on:click={() => selectDate(cell.date)}
              >{cell.date.getDate()}</button>
            {/each}
          </div>
        {/key}
      </div>
    </div>
  {/if}
</div>

<style>
  :global(:root) {
    --dp-bg: #0b0f1a;
    --dp-surface: #0f172a;
    --dp-text: #e5e7eb;
    --dp-muted: #94a3b8;
    --dp-accent: #2563eb;
    --dp-border: #1f2937;
    --dp-hover: rgba(255,255,255,0.06);
    --dp-selected: #334155;
    --dp-radius: 10px;
  }

  .dp-root { position: relative; display: inline-block; width: 100%; }

  .dp-input {
    display: flex; 
    align-items: center; 
    gap: 8px; 
    width: 100%;
    cursor: pointer; 
    box-sizing: border-box;
    overflow: hidden;
    position: relative;
  }
  .dp-input.dp-disabled { opacity: .6; cursor: not-allowed; }

  .dp-input-field { 
    flex: 1; 
    background: transparent; 
    border: 0; 
    outline: none; 
    font: inherit; 
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .dp-clear-btn { 
    background: transparent; 
    border: 0; 
    font-size: 18px; 
    line-height: 1; 
    cursor: pointer; 
    padding: 0;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }

  .dp-icon { 
    width: 18px; 
    height: 18px; 
    flex-shrink: 0;
  }

  .dp-popover-wrapper { 
    position: fixed; 
    top: 0; 
    left: 0; 
    right: 0; 
    bottom: 0; 
    z-index: 50; 
    pointer-events: none;
  }
  .dp-popover {
    position: absolute; 
    min-width: 270px; 
    width: max-content;
    background: var(--dp-bg); 
    color: var(--dp-text);
    border: 1px solid var(--dp-border); 
    border-radius: var(--dp-radius);
    box-shadow: 0 12px 30px rgba(0,0,0,.45); 
    padding: 8px; 
    user-select: none;
    pointer-events: auto;
  }

  .dp-header { display: flex; align-items: center; justify-content: space-between; padding: 6px 6px 8px; }
  .dp-month-label { font-weight: 600; letter-spacing: .2px; }
  .dp-nav { background: transparent; color: var(--dp-text); border: 1px solid var(--dp-border); border-radius: 8px; width: 32px; height: 32px; cursor: pointer; }
  .dp-nav:hover { background: var(--dp-hover); }

  .dp-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; padding: 4px 6px; }
  .dp-weekday { text-align: center; color: var(--dp-muted); font-size: 12px; }

  .dp-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; padding: 4px 6px 8px; }
  .dp-cell {
    border: 1px solid transparent; border-radius: 8px; height: 36px; text-align: center; color: var(--dp-text); cursor: pointer; background: transparent;
  }
  .dp-cell:hover { background: var(--dp-hover); }
  .dp-cell.dp-out { color: var(--dp-muted); }
  .dp-cell:disabled { opacity: .4; cursor: not-allowed; }
  .dp-cell.dp-selected { background: var(--dp-selected); color: var(--dp-text); }
  .dp-cell.dp-today { outline: 1px dashed var(--dp-muted); }
</style>



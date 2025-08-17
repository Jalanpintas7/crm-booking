<script>
  import { onMount, createEventDispatcher } from 'svelte';

  export let webhookUrl = '';

  const STORAGE_KEY = 'workflow_toggle_active_v1';
  const dispatch = createEventDispatcher();

  let isActive = false;
  let pendingState = null;
  let showConfirm = false;
  let sending = false;
  let feedback = { message: '', type: '' }; // type: 'success' | 'error'

  onMount(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'true' || saved === 'false') {
        isActive = saved === 'true';
      }
    } catch {}
  });

  function openConfirm(nextState) {
    pendingState = Boolean(nextState);
    showConfirm = true;
  }

  function cancelConfirm() {
    showConfirm = false;
    pendingState = null;
    // Revert the switch visual state
    // setTimeout ensures DOM updates after checkbox click
    setTimeout(() => {
      document.getElementById('workflow-switch')?.focus();
    }, 0);
  }

  async function confirmAndSend() {
    if (pendingState === null) return;
    try {
      sending = true;
      feedback = { message: '', type: '' };
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activate: pendingState })
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      isActive = pendingState;
      try { localStorage.setItem(STORAGE_KEY, String(isActive)); } catch {}
      feedback = { message: `Workflow berhasil ${isActive ? 'diaktifkan' : 'dinonaktifkan'}.`, type: 'success' };
      dispatch('changed', { active: isActive });
    } catch (err) {
      feedback = { message: `Gagal mengirim ke webhook: ${err?.message || 'Tidak diketahui'}`, type: 'error' };
    } finally {
      sending = false;
      showConfirm = false;
      pendingState = null;
    }
  }
</script>

<div class="bg-neutral-900 rounded-lg p-8 border border-neutral-700 mb-8">
  <h2 class="text-xl font-semibold text-gray-200 m-0 mb-2.5">On/Off Workflow</h2>
  <p class="text-gray-400 text-sm m-0 mb-6">Aktifkan atau nonaktifkan workflow n8n. Perubahan akan dikirim via webhook.</p>

  <div class="flex items-center justify-between bg-neutral-950 border border-neutral-700 rounded-md p-4">
    <div class="flex flex-col">
      <span class="text-gray-200 text-sm font-medium">Status Workflow</span>
      <span class="text-gray-400 text-xs">{isActive ? 'Aktif' : 'Nonaktif'}</span>
    </div>

    <label class="inline-flex items-center cursor-pointer select-none">
      <input
        id="workflow-switch"
        type="checkbox"
        class="sr-only peer"
        checked={isActive}
        on:click|preventDefault={() => openConfirm(!isActive)}
        on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openConfirm(!isActive); } }}
        aria-label="Toggle workflow"
      />
      <div class="w-11 h-6 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:bg-green-500 transition-colors relative">
        <div class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
      </div>
    </label>
  </div>

  {#if feedback.message}
    <div class={`mt-4 text-sm px-3 py-2 rounded border ${feedback.type === 'success' ? 'text-green-400 border-green-600 bg-green-500/10' : 'text-red-400 border-red-600 bg-red-500/10'}`}>{feedback.message}</div>
  {/if}
</div>

{#if showConfirm}
  <div 
    class="fixed inset-0 bg-black/60 flex justify-center items-center z-[1000] p-5"
    role="dialog" aria-modal="true" tabindex="-1"
  >
    <div class="bg-neutral-800 rounded-xl border border-neutral-700 max-w-md w-full shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
      <div class="p-6">
        <h3 class="text-lg font-semibold text-gray-100 m-0 mb-2">Konfirmasi</h3>
        <p class="text-gray-300 text-sm m-0 mb-5">
          {pendingState ? 'Aktifkan' : 'Nonaktifkan'} workflow sekarang?
        </p>
        <div class="flex gap-3 justify-end">
          <button 
            class="px-4 py-2 rounded-md text-sm bg-neutral-700 text-gray-200 border border-neutral-600 hover:bg-neutral-600 disabled:opacity-60"
            on:click={cancelConfirm}
            disabled={sending}
          >Batal</button>
          <button 
            class="px-4 py-2 rounded-md text-sm text-white border disabled:opacity-60 disabled:cursor-not-allowed {pendingState ? 'bg-green-600 border-green-500 hover:bg-green-500' : 'bg-red-600 border-red-500 hover:bg-red-500'}"
            on:click={confirmAndSend}
            disabled={sending}
          >{sending ? 'Memproses...' : (pendingState ? 'Aktifkan' : 'Nonaktifkan')}</button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
  /* no extra styles */
</style>


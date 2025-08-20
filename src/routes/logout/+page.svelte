<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { logout } from '../../lib/stores/auth.js';
  
  onMount(() => {
    logout();
    goto('/login');
  });
</script>

<div class="min-h-screen bg-gray-900 flex items-center justify-center">
  <div class="text-center">
    <div class="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
    <p class="text-gray-400">Logging out...</p>
  </div>
</div>

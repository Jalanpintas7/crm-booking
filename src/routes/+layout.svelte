<script>
  import '../app.css';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import Navigation from '$lib/components/Navigation.svelte';
  
  // Get data from layout.js
  export let data;
  
  $: isAuthenticated = data.isAuthenticated;
  $: user = data.user;
  $: currentPath = $page.url.pathname;
  $: isLoginPage = currentPath === '/login';
  
  // Auto-redirect logic - only run on client side
  $: {
    if (browser && isAuthenticated && isLoginPage) {
      // User is authenticated but on login page - redirect to dashboard
      goto('/');
    } else if (browser && !isAuthenticated && !isLoginPage) {
      // User is not authenticated but trying to access protected page - redirect to login
      goto('/login');
    }
  }
</script>

{#if browser && isAuthenticated && !isLoginPage}
  <!-- User is authenticated and not on login page - show dashboard -->
  <div class="app">
    <Navigation />
    <main>
      <slot />
    </main>
  </div>
{:else if browser && !isAuthenticated && isLoginPage}
  <!-- User is not authenticated and on login page - show login -->
  <main>
    <slot />
  </main>
{:else}
  <!-- Loading state or redirecting -->
  <div class="min-h-screen bg-gray-900 flex items-center justify-center">
    <div class="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
{/if}

<style>
  .app {
    min-height: 100vh;
    min-height: 100dvh;
    background-color: #0f0f0f;
    color: #e5e5e5;
    display: flex;
    flex-direction: column;
  }

  main {
    width: 100%;
    max-width: none;
    margin: 0;
    padding: 0 0 2rem 0;
    flex: 1 1 auto;
    box-sizing: border-box;
  }
  
  /* For login page, remove padding and margin */
  main:only-child {
    padding: 0 !important;
    margin: 0 !important;
  }
  
  /* Global background for all pages */
  :global(body) {
    margin: 0;
    padding: 0;
    background-color: #0f0f0f;
    min-height: 100vh;
    overflow-x: hidden;
  }
  
  /* Ensure all pages have consistent background */
  :global(*) {
    box-sizing: border-box;
  }
</style>

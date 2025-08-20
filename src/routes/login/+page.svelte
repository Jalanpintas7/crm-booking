<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { currentLanguage, translations } from '../../lib/stores/language.js';
  import { authStore, login } from '../../lib/stores/auth.js';
  import { Eye, EyeOff, Lock, User, Building2 } from 'lucide-svelte';
  
  $: language = $currentLanguage;
  $: currentTranslations = translations[language] || translations.ms;
  
  let username = '';
  let password = '';
  let showPassword = false;
  let isLoading = false;
  let errorMessage = '';
  let successMessage = '';
  

  
  async function handleLogin() {
    if (!username.trim() || !password.trim()) {
      errorMessage = t('please_fill_all_fields');
      return;
    }
    
    isLoading = true;
    errorMessage = '';
    successMessage = '';
    
    try {
      const result = await login(username, password);
      
             if (result.success) {
         successMessage = result.message;
         // Redirect to dashboard after successful login
         setTimeout(() => {
           window.location.href = '/';
         }, 1000);
       } else {
         errorMessage = result.message;
       }
    } catch (error) {
      errorMessage = t('login_error');
      console.error('Login error:', error);
    } finally {
      isLoading = false;
    }
  }
  
  function handleKeyPress(event) {
    if (event.key === 'Enter') {
      handleLogin();
    }
  }
  
  function t(key) {
    return currentTranslations[key] || key;
  }
</script>

<div class="min-h-screen flex items-center justify-center p-4 relative">
  <div class="w-full max-w-md">
    <!-- Logo/Brand Section -->
    <div class="text-center mb-8">
      <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl mb-4 shadow-2xl">
        <Building2 size={40} class="text-white" />
      </div>
      <h1 class="text-3xl font-bold text-white mb-2">CRM Booking</h1>
      <p class="text-gray-400 text-sm">Sistem Pengurusan Tempahan & Kenalan</p>
    </div>
    
    <!-- Login Card -->
    <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 shadow-2xl p-8">
      <div class="text-center mb-6">
        <h2 class="text-2xl font-semibold text-white mb-2">{t('login_title')}</h2>
        <p class="text-gray-400 text-sm">{t('login_subtitle')}</p>
      </div>
      
      <!-- Error Message -->
      {#if errorMessage}
        <div class="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p class="text-red-400 text-sm">{errorMessage}</p>
        </div>
      {/if}
      
      <!-- Success Message -->
      {#if successMessage}
        <div class="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
          <p class="text-green-400 text-sm">{successMessage}</p>
        </div>
      {/if}
      
      <!-- Login Form -->
      <form on:submit|preventDefault={handleLogin} class="space-y-4">
        <!-- Username Field -->
        <div>
          <label for="username" class="block text-sm font-medium text-gray-300 mb-2">
            {t('username')}
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User size={20} class="text-gray-400" />
            </div>
            <input
              id="username"
              type="text"
              bind:value={username}
              on:keypress={handleKeyPress}
              placeholder={t('enter_username')}
              class="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-200"
              required
            />
          </div>
        </div>
        
        <!-- Password Field -->
        <div>
          <label for="password" class="block text-sm font-medium text-gray-300 mb-2">
            {t('password')}
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock size={20} class="text-gray-400" />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              bind:value={password}
              on:keypress={handleKeyPress}
              placeholder={t('enter_password')}
              class="w-full pl-10 pr-12 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-200"
              required
            />
            <button
              type="button"
              on:click={() => showPassword = !showPassword}
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 transition-colors"
            >
              {#if showPassword}
                <EyeOff size={20} />
              {:else}
                <Eye size={20} />
              {/if}
            </button>
          </div>
        </div>
        
        <!-- Login Button -->
        <button
          type="submit"
          disabled={isLoading}
          class="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {#if isLoading}
            <div class="flex items-center justify-center">
              <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              {t('processing')}
            </div>
          {:else}
            {t('login_button')}
          {/if}
        </button>
      </form>
      

    </div>
    
    <!-- Footer -->
    <div class="text-center mt-6">
      <p class="text-gray-500 text-xs">
        {t('copyright')}
      </p>
    </div>
  </div>
</div>

<style>
  
  
  /* Custom scrollbar for webkit browsers */
  ::-webkit-scrollbar {
    width: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: #1f2937;
  }
  
  ::-webkit-scrollbar-thumb {
    background: #4b5563;
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: #6b7280;
  }
  
  /* Smooth transitions */
  * {
    transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
  }
  
  /* Ensure login container covers full height */
  .min-h-screen {
    min-height: 100vh;
    min-height: 100dvh;
  }
</style>

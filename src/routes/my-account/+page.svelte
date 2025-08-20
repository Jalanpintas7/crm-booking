<script>
    import { currentLanguage, translations } from '../../lib/stores/language.js';
  import { authStore, logout } from '../../lib/stores/auth.js';
  import { User, Mail, Shield, Calendar, LogOut } from 'lucide-svelte';
  import { goto } from '$app/navigation';
  
  $: language = $currentLanguage;
  $: currentTranslations = translations[language] || translations.ms;
  
           async function handleLogout() {
           try {
             await logout();
             // Redirect to login page after logout
             setTimeout(() => {
               window.location.href = '/login';
             }, 100);
           } catch (error) {
             console.error('Logout error:', error);
           }
         }
  
  function t(key) {
    return currentTranslations[key] || key;
  }
</script>

<div class="min-h-screen p-6">
  <div class="max-w-4xl mx-auto">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-white mb-2">{t('my_account')}</h1>
      <p class="text-gray-400">{t('manage_your_account_settings')}</p>
    </div>
    
         <div class="flex justify-center">
       <!-- Profile Card -->
       <div class="w-full max-w-md">
         <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
           <div class="text-center mb-6">
             <div class="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
               <User size={48} class="text-white" />
             </div>
             <h3 class="text-xl font-semibold text-white">
               {$authStore.user?.displayName || $authStore.user?.username || 'Pengguna'}
             </h3>
             <p class="text-gray-400 text-sm">
               {$authStore.user?.role || 'Admin'}
             </p>
           </div>
           
                       <div class="space-y-3">
              <div class="flex items-center gap-3 text-gray-300">
                <Mail size={16} class="text-gray-400" />
                <span class="text-sm">{$authStore.user?.username || 'N/A'}</span>
              </div>
              <div class="flex items-center gap-3 text-gray-300">
                <Shield size={16} class="text-gray-400" />
                <span class="text-sm">{t('account_status')}: <span class="text-green-500">{t('active')}</span></span>
              </div>
              <div class="flex items-center gap-3 text-gray-300">
                <Calendar size={16} class="text-gray-400" />
                <span class="text-sm">{t('member_since')}: {new Date().toLocaleDateString('ms-MY')}</span>
              </div>
            </div>
            
            <!-- Logout Button -->
            <div class="mt-6 pt-4 border-t border-gray-700">
              <button
                on:click={handleLogout}
                class="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                <LogOut size={16} />
                {t('logout')}
              </button>
            </div>
         </div>
       </div>
     </div>
  </div>
</div>

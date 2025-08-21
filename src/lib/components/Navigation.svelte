<script>
  import { page } from '$app/stores';
  import { currentLanguage, translations, toggleLanguage, setLanguage } from '../stores/language.js';
  import { authStore, logout } from '../stores/auth.js';
  import { Globe, ChevronDown, Check, User } from 'lucide-svelte';
  import { onMount } from 'svelte';
  import { getFirstBrand } from '../supabase.js';
  import { goto } from '$app/navigation';
  
  $: currentPath = $page.url.pathname;
  $: language = $currentLanguage;
  $: currentTranslations = translations[language] || translations.ms;
  
  // Create reactive variables for all translated text to ensure immediate updates
  $: homeText = currentTranslations['home'] || 'home';
  $: bookingManagerText = currentTranslations['booking_manager'] || 'booking_manager';
  $: contactManagerText = currentTranslations['contact_manager'] || 'contact_manager';
  $: settingsText = currentTranslations['settings'] || 'settings';
  $: contextManagerText = currentTranslations['context_manager'] || 'context_manager';
  $: myAccountText = currentTranslations['my_account'] || 'my_account';
  $: logoutText = currentTranslations['logout'] || 'logout';
  
  // Force immediate reactivity when language changes
  $: {
    if (language) {
      // This ensures all translated text updates immediately when language changes
      homeText, bookingManagerText, contactManagerText, settingsText, contextManagerText, myAccountText, logoutText;
    }
  }
  
  let showMobileMenu = false;
  let showLanguageDropdown = false;
  let profileButtonEl;
  let profileModalEl;

  function toggleMobileMenu() {
    showMobileMenu = !showMobileMenu;
    if (showMobileMenu) {
      // Position modal after it's rendered
      setTimeout(() => positionProfileModal(), 10);
    }
  }

  function closeMobileMenu() {
    showMobileMenu = false;
  }

  function toggleLanguageDropdown() {
    showLanguageDropdown = !showLanguageDropdown;
  }

  function closeLanguageDropdown() {
    showLanguageDropdown = false;
  }

     function positionProfileModal() {
     if (!profileButtonEl || !profileModalEl) return;
     
     // Check if mobile view
     const isMobile = window.innerWidth <= 768;
     
     if (isMobile) {
       // For mobile, use CSS centering instead of JavaScript positioning
       return;
     }
     
     // Reset styles first
     profileModalEl.style.top = '';
     profileModalEl.style.bottom = '';
     profileModalEl.style.left = '';
     profileModalEl.style.right = '';
     
     const buttonRect = profileButtonEl.getBoundingClientRect();
     const viewportHeight = window.innerHeight;
     const viewportWidth = window.innerWidth;
     
     // Estimate modal dimensions (approximate based on content)
     const estimatedModalHeight = 320; // Approximate height including mobile nav
     const estimatedModalWidth = 280; // Approximate width
     
     // Calculate available space
     const spaceBelow = viewportHeight - buttonRect.bottom;
     const spaceAbove = buttonRect.top;
     
     // Position vertically
     if (spaceBelow >= estimatedModalHeight || spaceBelow > spaceAbove) {
       // Show below
       profileModalEl.style.top = `${buttonRect.bottom + 8}px`;
     } else {
       // Show above
       profileModalEl.style.bottom = `${viewportHeight - buttonRect.top + 8}px`;
     }
     
     // Position horizontally - align with button right edge
     const leftPosition = Math.max(8, buttonRect.right - estimatedModalWidth);
     
     if (leftPosition + estimatedModalWidth > viewportWidth - 8) {
       // Adjust if modal would overflow right
       profileModalEl.style.right = '8px';
     } else if (leftPosition < 8) {
       // Adjust if modal would overflow left
       profileModalEl.style.left = '8px';
     } else {
       // Align with button right edge
       profileModalEl.style.left = `${leftPosition}px`;
     }
     
     // After positioning, adjust if needed based on actual modal size
     setTimeout(() => {
       const actualModalRect = profileModalEl.getBoundingClientRect();
       
       // Check if modal goes outside viewport
       if (actualModalRect.right > viewportWidth - 8) {
         profileModalEl.style.left = `${viewportWidth - actualModalRect.width - 8}px`;
       }
       
       if (actualModalRect.left < 8) {
         profileModalEl.style.left = '8px';
       }
       
       // Check if modal goes below viewport
       if (actualModalRect.bottom > viewportHeight - 8) {
         profileModalEl.style.top = `${viewportHeight - actualModalRect.height - 8}px`;
       }
     }, 0);
   }

  function selectLanguage(lang) {
    // Use the new setLanguage function which handles localStorage
    setLanguage(lang);
    
    // Close the dropdown
    showLanguageDropdown = false;
  }

  function t(key) {
    return currentTranslations[key] || key;
  }
  
  async function handleLogout() {
    try {
      await logout();
      closeMobileMenu();
      // Redirect to login page after logout
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
  
  // Brand name from Supabase
  let brandName = 'CRMBooking';
  onMount(async () => {
    try {
      const firstBrand = await getFirstBrand();
      if (firstBrand && firstBrand.name) {
        brandName = firstBrand.name;
      }
    } catch (e) {
      // fallback keep default
      console.error('Gagal memuat brand dari Supabase:', e);
    }
  });

     // Close dropdown when clicking outside
   function handleClickOutside(event) {
     if (showLanguageDropdown && !event.target.closest('.language-dropdown-container')) {
       showLanguageDropdown = false;
     }
     if (showMobileMenu && !event.target.closest('.profile-modal-container') && !event.target.closest('button[aria-label="Toggle user menu"]')) {
       showMobileMenu = false;
     }
   }

     // Handle window resize and scroll
   function handleWindowEvents() {
     if (showMobileMenu) {
       // Add a small delay to ensure DOM is updated
       setTimeout(() => positionProfileModal(), 0);
     }
   }
   
   // Add event listeners for better positioning
   onMount(() => {
     const handleResize = () => {
       if (showMobileMenu) {
         setTimeout(() => positionProfileModal(), 0);
       }
     };
     
     const handleScroll = () => {
       if (showMobileMenu) {
         setTimeout(() => positionProfileModal(), 0);
       }
     };
     
     window.addEventListener('resize', handleResize);
     window.addEventListener('scroll', handleScroll, true);
     
     return () => {
       window.removeEventListener('resize', handleResize);
       window.removeEventListener('scroll', handleScroll, true);
     };
   });
</script>

 <svelte:window on:click={handleClickOutside} on:resize={handleWindowEvents} on:scroll={handleWindowEvents} on:keydown={(e) => { if (e.key === 'Escape' && showMobileMenu) showMobileMenu = false; }} />

<!-- Main Navigation -->
<nav class="bg-gray-900 border-b border-gray-700 px-5 h-15 flex items-center">
  <div class="flex justify-between items-center w-full max-w-6xl mx-auto">
    <!-- Left Side: Logo & Navigation -->
    <div class="flex items-center gap-8">
      <!-- Logo -->
      <div class="flex items-center gap-2">
        <span class="text-white font-bold text-lg">{brandName}</span>
        <div class="w-2 h-2 bg-green-500 rounded-full"></div>
      </div>
      
      <!-- Desktop Navigation Links -->
      <div class="hidden md:flex gap-8">
        <a 
          href="/" 
          class="text-gray-400 hover:text-gray-200 text-sm py-2 relative transition-colors duration-200 {currentPath === '/' ? 'text-gray-200' : ''}"
        >
          {homeText}
          {#if currentPath === '/'}
            <div class="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-green-500"></div>
          {/if}
        </a>
        <a 
          href="/booking-manager" 
          class="text-gray-400 hover:text-gray-200 text-sm py-2 relative transition-colors duration-200 {currentPath === '/booking-manager' ? 'text-gray-200' : ''}"
        >
          {bookingManagerText}
          {#if currentPath === '/booking-manager'}
            <div class="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-green-500"></div>
          {/if}
        </a>
        <a 
          href="/contact-manager" 
          class="text-gray-400 hover:text-gray-200 text-sm py-2 relative transition-colors duration-200 {currentPath === '/contact-manager' ? 'text-gray-200' : ''}"
        >
          {contactManagerText}
          {#if currentPath === '/contact-manager'}
            <div class="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-green-500"></div>
          {/if}
        </a>
        <a 
          href="/settings" 
          class="text-gray-400 hover:text-gray-200 text-sm py-2 relative transition-colors duration-200 {currentPath === '/settings' ? 'text-gray-200' : ''}"
        >
          {settingsText}
          {#if currentPath === '/settings'}
            <div class="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-green-500"></div>
          {/if}
        </a>
                 <a 
           href="/context-manager" 
           class="text-gray-400 hover:text-gray-200 text-sm py-2 relative transition-colors duration-200 {currentPath === '/context-manager' ? 'text-gray-200' : ''}"
         >
           {contextManagerText}
           {#if currentPath === '/context-manager'}
             <div class="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-green-500"></div>
           {/if}
         </a>

      </div>
    </div>

    <!-- Right Side: Language Selector & User Avatar -->
    <div class="flex items-center gap-4">
      <!-- Language Dropdown -->
      <div class="relative language-dropdown-container">
        <button 
          class="flex items-center gap-2 border border-gray-700 hover:border-green-500 hover:text-green-500 rounded-md px-3 py-1.5 text-gray-400 text-sm cursor-pointer transition-all duration-200 md:gap-1.5 md:px-2 md:py-1 md:text-xs"
          on:click={toggleLanguageDropdown}
        >
          <Globe size={14} />
          <span class="font-medium hidden md:inline">{language === 'ms' ? 'MS' : 'EN'}</span>
          <ChevronDown 
            size={10} 
            class="transition-transform duration-200 {showLanguageDropdown ? 'rotate-180' : 'rotate-0'}" 
          />
        </button>
        
        <!-- Language Options Dropdown -->
        {#if showLanguageDropdown}
          <div 
            class="absolute top-full right-0 mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-xl min-w-45 z-50 overflow-hidden"
            on:click|stopPropagation
            role="menu"
            aria-label="Language options"
            tabindex="-1"
          >
            <button 
              type="button"
              class="w-full flex items-center gap-2.5 px-4 py-3 text-gray-200 cursor-pointer transition-all duration-200 border-b border-gray-700 hover:bg-gray-800 hover:text-green-500 {language === 'ms' ? 'bg-green-500 text-gray-900' : ''}"
              on:click={() => selectLanguage('ms')}
              on:keydown={(e) => e.key === 'Enter' && selectLanguage('ms')}
            >
              <span class="text-base">🇲🇾</span>
              <span class="flex-1 text-sm font-medium">Bahasa Melayu</span>
              {#if language === 'ms'}
                <Check size={12} class="font-bold" />
              {/if}
            </button>
            <button 
              type="button"
              class="w-full flex items-center gap-2.5 px-4 py-3 text-gray-200 cursor-pointer transition-all duration-200 hover:bg-gray-800 hover:text-green-500 {language === 'en' ? 'bg-green-500 text-gray-900' : ''}"
              on:click={() => selectLanguage('en')}
              on:keydown={(e) => e.key === 'Enter' && selectLanguage('en')}
            >
              <span class="text-base">🇺🇸</span>
              <span class="flex-1 text-sm font-medium">English</span>
              {#if language === 'en'}
                <Check size={12} class="font-bold" />
              {/if}
            </button>
          </div>
        {/if}
      </div>

             <!-- User Avatar -->
       <button 
         type="button"
         class="text-green-500 hover:text-green-600 hover:border-green-600 cursor-pointer transition-colors duration-200 bg-gray-900 border-2 border-green-500 rounded-full w-9 h-9 flex items-center justify-center"
         bind:this={profileButtonEl}
         on:click={toggleMobileMenu}
         on:keydown={(e) => e.key === 'Enter' && toggleMobileMenu()}
         aria-label="Toggle user menu"
       >
         <User size={16} />
       </button>
    </div>
  </div>
</nav>

 <!-- User Account Modal -->
 {#if showMobileMenu}
        <div 
       class="fixed inset-0 bg-black/20 md:bg-black/10 z-50"
       on:click={closeMobileMenu}
       on:keydown={(e) => e.key === 'Escape' && closeMobileMenu()}
       role="dialog"
       aria-modal="true"
       aria-label="User account menu"
       tabindex="-1"
     >
            <div 
         class="profile-modal-container bg-gray-900 rounded-lg p-5 w-70 max-w-[280px] border border-gray-700 shadow-2xl backdrop-blur-sm"
         bind:this={profileModalEl}
         on:click|stopPropagation
         role="document"
         tabindex="-1"
       >
      <!-- User Information Section -->
      <div class="flex items-center gap-4 mb-5 pb-4 border-b border-gray-700">
        <div class="flex-shrink-0">
          <div class="w-10 h-10 rounded-full relative bg-teal-600 flex items-center justify-center overflow-hidden">
            <!-- Background teal circle -->
            <div class="absolute inset-0 bg-teal-600 rounded-full"></div>
            <!-- Green crescent overlay -->
            <div class="absolute top-0 right-0 w-5 h-5 bg-green-500" style="border-radius: 50% 0 0 50%;"></div>
            <!-- User icon -->
            <User size={16} class="relative z-10 text-white" />
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-gray-200 text-sm font-semibold mb-0.5 truncate">
            {$authStore.user?.username || 'Pengguna'}
          </div>
          <div class="text-gray-400 text-xs mb-1 truncate">
            {$authStore.user?.role || 'Admin'}
          </div>
        </div>
      </div>
      
             <!-- Account Options -->
       <div class="flex flex-col">
         <a 
           href="/my-account"
           class="text-gray-200 hover:text-green-500 no-underline text-sm py-2.5 transition-colors duration-200 cursor-pointer w-full text-left"
           on:click={closeMobileMenu}
         >
           {myAccountText}
         </a>
         
         <button 
           class="text-gray-200 hover:text-red-500 no-underline text-sm py-2.5 transition-colors duration-200 cursor-pointer w-full text-left"
           on:click={handleLogout}
         >
           {logoutText}
         </button>
       </div>
      
             <!-- Mobile Navigation (visible only on mobile) -->
       <div class="flex flex-col mt-4 pt-4 border-t border-gray-700 block md:hidden">
        <a 
          href="/" 
          class="text-gray-200 hover:text-green-500 no-underline text-sm py-2.5 transition-colors duration-200 {currentPath === '/' ? 'text-green-500' : ''}"
          on:click={closeMobileMenu}
        >
          {homeText}
        </a>
        <a 
          href="/booking-manager" 
          class="text-gray-200 hover:text-green-500 no-underline text-sm py-2.5 transition-colors duration-200 {currentPath === '/booking-manager' ? 'text-green-500' : ''}"
          on:click={closeMobileMenu}
        >
          {bookingManagerText}
        </a>
        <a 
          href="/contact-manager" 
          class="text-gray-200 hover:text-green-500 no-underline text-sm py-2.5 transition-colors duration-200 {currentPath === '/contact-manager' ? 'text-green-500' : ''}"
          on:click={closeMobileMenu}
        >
          {contactManagerText}
        </a>
        <a 
          href="/settings" 
          class="text-gray-200 hover:text-green-500 no-underline text-sm py-2.5 transition-colors duration-200 {currentPath === '/settings' ? 'text-green-500' : ''}"
          on:click={closeMobileMenu}
        >
          {settingsText}
        </a>
                 <a 
           href="/context-manager" 
           class="text-gray-200 hover:text-green-500 no-underline text-sm py-2.5 transition-colors duration-200 {currentPath === '/context-manager' ? 'text-green-500' : ''}"
           on:click={closeMobileMenu}
         >
           {contextManagerText}
         </a>
             </div>
     </div>
   </div>
 {/if}

<style>
  .profile-modal-container {
    position: absolute;
    z-index: 60;
    min-width: 250px;
    animation: slideIn 0.2s ease-out;
  }
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @media (max-width: 768px) {
    .profile-modal-container {
      position: fixed;
      top: 50% !important;
      left: 50% !important;
      transform: translate(-50%, -50%);
      right: auto !important;
      bottom: auto !important;
      animation: fadeIn 0.2s ease-out;
    }
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
  }
</style>
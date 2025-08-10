<script>
  import { onMount } from 'svelte';
  import { currentLanguage, translations } from '../lib/stores/language.js';
  import { getDashboardStats } from '../lib/supabase.js';
  import { Users, Calendar, Clock, UserPlus, TrendingUp, DollarSign, Activity, CalendarDays } from 'lucide-svelte';
  
  $: language = $currentLanguage;
  $: currentTranslations = translations[language] || translations.ms;
  
  // Data real dari Supabase
  let totalContacts = 0;
  let totalBookings = 0;
  let pendingBookings = 0;
  let newContactsToday = 0;
  let loading = true;
  let error = null;

  // Load dashboard stats on component mount
  onMount(async () => {
    await loadDashboardStats();
  });

  async function loadDashboardStats() {
    try {
      loading = true;
      error = null;
      const stats = await getDashboardStats();
      totalContacts = stats.totalContacts;
      totalBookings = stats.totalBookings;
      pendingBookings = stats.pendingBookings;
      newContactsToday = stats.newContactsToday;
    } catch (err) {
      error = 'Gagal memuat statistik dashboard';
      console.error('Error loading dashboard stats:', err);
    } finally {
      loading = false;
    }
  }

  // Data untuk analytics (konten sebelumnya)
  let selectedPeriod = 'Yesterday';
  const periods = ['Yesterday', 'Last 7 days', 'Last 30 days'];
  
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  });

  // Data dummy untuk analytics
  let meetingsBooked = 24;
  let insights = [
    { label: 'Tempahan Baru', value: 8, change: '+12%', positive: true },
    { label: 'Pendapatan', value: 'RM 15,420', change: '+8%', positive: true },
    { label: 'Pelanggan Aktif', value: 12, change: '+5%', positive: true },
    { label: 'Tempahan Batal', value: 2, change: '-3%', positive: false }
  ];
  let popularPages = [
    { page: '/booking-manager', views: 156, change: '+12%' },
    { page: '/contact-manager', views: 89, change: '+8%' },
    { page: '/context-manager', views: 67, change: '+15%' },
    { page: '/settings', views: 45, change: '+5%' },
    { page: '/', views: 34, change: '+2%' }
  ];
  let amountReceived = [
    { month: 'Jan', amount: 12500 },
    { month: 'Feb', amount: 15800 },
    { month: 'Mac', amount: 14200 },
    { month: 'Apr', amount: 18900 },
    { month: 'Mei', amount: 16500 },
    { month: 'Jun', amount: 22000 }
  ];

  function t(key) {
    return currentTranslations[key] || key;
  }
</script>

<div class="min-h-screen mt-10 w-full max-w-none p-0">
  <!-- Page Header -->
  <div class="mb-10 px-5 max-w-6xl mx-auto">
    <h1 class="text-3xl font-semibold text-gray-200 mb-2">{t('dashboard')}</h1>
    <p class="text-gray-400 text-base">{t('overview')}</p>
  </div>

  <!-- Error Message -->
  {#if error}
    <div class="bg-red-600 text-white px-5 py-3 rounded-md mx-auto mb-5 max-w-6xl flex justify-between items-center">
      <p class="text-sm">{error}</p>
      <button 
        class="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1.5 rounded text-xs transition-colors"
        on:click={loadDashboardStats}
      >
        Muat Ulang
      </button>
    </div>
  {/if}

  <!-- Dashboard Cards -->
  <div class="flex flex-wrap lg:flex-nowrap gap-5 px-5 max-w-6xl mx-auto">
    <!-- Total Contacts Card -->
    <div class="flex-1 min-w-72 lg:min-w-0 bg-gray-900 rounded-xl p-6 border border-gray-700 shadow-xl flex items-center gap-5 hover:-translate-y-0.5 hover:shadow-2xl hover:border-green-500 transition-all duration-200">
      <div class="flex-shrink-0">
        <div class="w-15 h-15 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
          <Users size={24} color="white" />
        </div>
      </div>
      <div class="flex-1">
        <div class="text-4xl font-bold text-gray-200 mb-2">{loading ? '...' : totalContacts}</div>
        <div class="text-base font-medium text-gray-200 opacity-90 mb-2">{t('total_contacts')}</div>
        <div class="h-0.5 bg-gray-200 opacity-30 rounded-full"></div>
      </div>
    </div>

    <!-- Total Bookings Card -->
    <div class="flex-1 min-w-72 lg:min-w-0 bg-gray-900 rounded-xl p-6 border border-gray-700 shadow-xl flex items-center gap-5 hover:-translate-y-0.5 hover:shadow-2xl hover:border-green-500 transition-all duration-200">
      <div class="flex-shrink-0">
        <div class="w-15 h-15 bg-green-600 rounded-xl flex items-center justify-center shadow-lg">
          <Calendar size={24} color="white" />
        </div>
      </div>
      <div class="flex-1">
        <div class="text-4xl font-bold text-gray-200 mb-2">{loading ? '...' : totalBookings}</div>
        <div class="text-base font-medium text-gray-200 opacity-90 mb-2">{t('total_bookings')}</div>
        <div class="h-0.5 bg-gray-200 opacity-30 rounded-full"></div>
      </div>
    </div>

    <!-- Pending Bookings Card -->
    <div class="flex-1 min-w-72 lg:min-w-0 bg-gray-900 rounded-xl p-6 border border-gray-700 shadow-xl flex items-center gap-5 hover:-translate-y-0.5 hover:shadow-2xl hover:border-green-500 transition-all duration-200">
      <div class="flex-shrink-0">
        <div class="w-15 h-15 bg-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
          <Clock size={24} color="white" />
        </div>
      </div>
      <div class="flex-1">
        <div class="text-4xl font-bold text-gray-200 mb-2">{loading ? '...' : pendingBookings}</div>
        <div class="text-base font-medium text-gray-200 opacity-90 mb-2">{t('pending_bookings')}</div>
        <div class="h-0.5 bg-gray-200 opacity-30 rounded-full"></div>
      </div>
    </div>

    <!-- New Contacts Today Card -->
    <div class="flex-1 min-w-72 lg:min-w-0 bg-gray-900 rounded-xl p-6 border border-gray-700 shadow-xl flex items-center gap-5 hover:-translate-y-0.5 hover:shadow-2xl hover:border-green-500 transition-all duration-200">
      <div class="flex-shrink-0">
        <div class="w-15 h-15 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg">
          <UserPlus size={24} color="white" />
        </div>
      </div>
      <div class="flex-1">
        <div class="text-4xl font-bold text-gray-200 mb-2">{loading ? '...' : newContactsToday}</div>
        <div class="text-base font-medium text-gray-200 opacity-90 mb-2">{t('new_contacts_today')}</div>
        <div class="h-0.5 bg-gray-200 opacity-30 rounded-full"></div>
      </div>
    </div>
  </div>

  <!-- Analytics Section -->
  <div class="mt-15 px-5 max-w-6xl mx-auto">
    <!-- Analytics Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-5">
      <div class="flex flex-col gap-1">
        <h2 class="text-3xl font-semibold text-gray-200 flex items-center gap-2">
          {t('analytics')}
        </h2>
        <p class="text-gray-400 text-sm">{formattedDate}</p>
      </div>
      
      <!-- Period Selector -->
      <div class="flex gap-2.5 w-full md:w-auto justify-center">
        {#each periods as period}
          <button 
            class="border border-gray-700 text-gray-400 px-4 py-2 rounded-md text-sm cursor-pointer transition-all duration-200 hover:border-green-500 hover:text-green-500 {selectedPeriod === period ? 'bg-green-500 border-green-500 text-white' : ''}"
            on:click={() => selectedPeriod = period}
          >
            {period}
          </button>
        {/each}
      </div>
    </div>

    <!-- Dashboard Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-5 mb-5">
      <!-- Meetings Booked Card -->
      <div class="lg:col-span-1 bg-gray-900 rounded-lg p-6 border border-gray-700 min-h-48">
        <div class="flex justify-between items-center mb-5">
          <h3 class="text-lg font-medium text-gray-200">{t('recent_booking')}</h3>
          <div class="text-gray-400 text-xl font-bold cursor-pointer">⋮</div>
        </div>
        <div class="text-center">
          {#if meetingsBooked > 0}
            <div class="text-5xl font-semibold text-gray-200 mb-2">{meetingsBooked}</div>
            <div class="text-gray-400 text-base">{selectedPeriod}</div>
          {:else}
            <div class="flex flex-col items-center justify-center text-center p-5 min-h-30">
              <CalendarDays size={32} class="mb-3 opacity-60 text-gray-400" />
              <div class="text-gray-200 text-base font-medium mb-1">{t('no_bookings')}</div>
              <div class="text-gray-400 text-sm opacity-80">{t('no_bookings_period')} {selectedPeriod.toLowerCase()}</div>
            </div>
          {/if}
        </div>
      </div>

      <!-- Insights Card -->
      <div class="lg:col-span-2 bg-gray-900 rounded-lg p-6 border border-gray-700 min-h-75">
        <div class="flex justify-between items-center mb-5">
          <h3 class="text-lg font-medium text-gray-200">Insights</h3>
        </div>
        
        <!-- Chart Container -->
        <div class="flex mb-6">
          <div class="flex flex-col justify-between mr-4 text-xs text-gray-400 h-38 pr-2">
            <div class="text-right">4</div>
            <div class="text-right">3</div>
            <div class="text-right">2</div>
            <div class="text-right">1</div>
            <div class="text-right">0</div>
          </div>
          <div class="flex-1 h-38 bg-gray-950 rounded border border-gray-700"></div>
        </div>

        <!-- Stats -->
        <div class="flex flex-col gap-5">
          <div class="flex items-center gap-4">
            <div class="flex gap-1 min-w-24">
              <span class="text-gray-200 text-base">0%</span>
              <span class="text-gray-400 text-base">(0)</span>
            </div>
            <div class="text-gray-400 text-base flex-1">Cancelled</div>
            <div class="h-1.5 bg-green-500 rounded-full w-0"></div>
          </div>
          <div class="flex items-center gap-4">
            <div class="flex gap-1 min-w-24">
              <span class="text-gray-200 text-base">0%</span>
              <span class="text-gray-400 text-base">(0)</span>
            </div>
            <div class="text-gray-400 text-base flex-1">Rescheduled</div>
            <div class="h-1.5 bg-green-500 rounded-full w-0"></div>
          </div>
          <div class="flex items-center gap-4">
            <div class="flex gap-1 min-w-24">
              <span class="text-gray-200 text-base">0%</span>
              <span class="text-gray-400 text-base">(0)</span>
            </div>
            <div class="text-gray-400 text-base flex-1">No show</div>
            <div class="h-1.5 bg-green-500 rounded-full w-0"></div>
          </div>
        </div>
      </div>

      <!-- Amount Received Card -->
      <div class="lg:col-span-1 bg-gray-900 rounded-lg p-6 border border-gray-700 min-h-48">
        <div class="flex justify-between items-center mb-5">
          <h3 class="text-lg font-medium text-gray-200">{t('recent_contacts')}</h3>
        </div>
        <div class="text-center">
          {#if amountReceived && amountReceived.length > 0}
            <div class="text-5xl font-semibold text-gray-200 mb-2">$0</div>
            <div class="text-gray-400 text-base">{selectedPeriod}</div>
          {:else}
            <div class="flex flex-col items-center justify-center text-center p-5 min-h-30">
              <DollarSign size={32} class="mb-3 opacity-60 text-gray-400" />
              <div class="text-gray-200 text-base font-medium mb-1">{t('no_income')}</div>
              <div class="text-gray-400 text-sm opacity-80">{t('no_income_period')} {selectedPeriod.toLowerCase()}</div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>
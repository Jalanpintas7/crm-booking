<script>
  import { onMount } from 'svelte';
  import { currentLanguage, translations } from '../lib/stores/language.js';
  import { getDashboardStats } from '../lib/supabase.js';
  import { Users, Calendar, Clock, UserPlus, TrendingUp, DollarSign, Activity, CalendarDays } from 'lucide-svelte';
  
  $: language = $currentLanguage;
  $: currentTranslations = translations[language] || translations.ms;
  
  // Create reactive variables for all translated text to ensure immediate updates
  $: dashboardText = currentTranslations['dashboard'] || 'dashboard';
  $: overviewText = currentTranslations['overview'] || 'overview';
  $: totalContactsText = currentTranslations['total_contacts'] || 'total_contacts';
  $: totalBookingsText = currentTranslations['total_bookings'] || 'total_bookings';
  $: pendingBookingsText = currentTranslations['pending_bookings'] || 'pending_bookings';
  $: newContactsTodayText = currentTranslations['new_contacts_today'] || 'new_contacts_today';
  $: analyticsText = currentTranslations['analytics'] || 'analytics';
  $: recentBookingText = currentTranslations['recent_booking'] || 'recent_booking';
  $: recentContactsText = currentTranslations['recent_contacts'] || 'recent_contacts';
  $: newBookingsText = currentTranslations['new_bookings'] || 'new_bookings';
  $: incomeText = currentTranslations['income'] || 'income';
  $: activeCustomersText = currentTranslations['active_customers'] || 'active_customers';
  $: cancelledBookingsText = currentTranslations['cancelled_bookings'] || 'cancelled_bookings';
  $: reloadText = currentTranslations['reload'] || 'reload';
  $: failedLoadStatsText = currentTranslations['failed_load_stats'] || 'failed_load_stats';
  $: noBookingsText = currentTranslations['no_bookings'] || 'no_bookings';
  $: noIncomeText = currentTranslations['no_income'] || 'no_income';
  $: noBookingsPeriodText = currentTranslations['no_bookings_period'] || 'no_bookings_period';
  $: noIncomePeriodText = currentTranslations['no_income_period'] || 'no_income_period';
  $: rescheduledText = currentTranslations['rescheduled'] || 'rescheduled';
  $: noShowText = currentTranslations['no_show'] || 'no_show';
  $: insightsText = currentTranslations['insights'] || 'insights';
  $: yesterdayText = currentTranslations['yesterday'] || 'yesterday';
  $: last7DaysText = currentTranslations['last_7_days'] || 'last_7_days';
  $: last30DaysText = currentTranslations['last_30_days'] || 'last_30_days';
  
  // Force immediate reactivity when language changes
  $: {
    if (language) {
      // This ensures all translated text updates immediately when language changes
      dashboardText, overviewText, totalContactsText, totalBookingsText, pendingBookingsText, 
      newContactsTodayText, analyticsText, recentBookingText, recentContactsText, 
      newBookingsText, incomeText, activeCustomersText, cancelledBookingsText, reloadText, failedLoadStatsText,
      noBookingsText, noIncomeText, noBookingsPeriodText, noIncomePeriodText, rescheduledText, noShowText,
      insightsText, yesterdayText, last7DaysText, last30DaysText;
    }
  }
  
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
      error = failedLoadStatsText;
      console.error('Error loading dashboard stats:', err);
    } finally {
      loading = false;
    }
  }

  // Data untuk analytics (konten sebelumnya)
  let selectedPeriod = 'yesterday';
  $: periods = [
    { key: 'yesterday', text: yesterdayText },
    { key: 'last_7_days', text: last7DaysText },
    { key: 'last_30_days', text: last30DaysText }
  ];
  
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  });

  // Data dummy untuk analytics - update when language changes
  $: insights = [
    { label: newBookingsText, value: 8, change: '+12%', positive: true },
    { label: incomeText, value: 'RM 15,420', change: '+8%', positive: true },
    { label: activeCustomersText, value: 12, change: '+5%', positive: true },
    { label: cancelledBookingsText, value: 2, change: '-3%', positive: false }
  ];
  
  let meetingsBooked = 24;
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
    <h1 class="text-3xl font-semibold text-gray-200 mb-2">{dashboardText}</h1>
    <p class="text-gray-400 text-base">{overviewText}</p>
  </div>

  <!-- Error Message -->
  {#if error}
    <div class="bg-red-600 text-white px-5 py-3 rounded-md mx-auto mb-5 max-w-6xl flex justify-between items-center">
      <p class="text-sm">{error}</p>
      <button 
        class="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1.5 rounded text-xs transition-colors"
        on:click={loadDashboardStats}
      >
        {reloadText}
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
        <div class="text-base font-medium text-gray-200 opacity-90 mb-2">{totalContactsText}</div>
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
        <div class="text-base font-medium text-gray-200 opacity-90 mb-2">{totalBookingsText}</div>
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
        <div class="text-base font-medium text-gray-200 opacity-90 mb-2">{pendingBookingsText}</div>
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
        <div class="text-base font-medium text-gray-200 opacity-90 mb-2">{newContactsTodayText}</div>
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
          {analyticsText}
        </h2>
        <p class="text-gray-400 text-sm">{formattedDate}</p>
      </div>
      
      <!-- Period Selector -->
      <div class="flex gap-2.5 w-full md:w-auto justify-center">
        {#each periods as period}
          <button 
            class="border border-gray-700 text-gray-400 px-4 py-2 rounded-md text-sm cursor-pointer transition-all duration-200 hover:border-green-500 hover:text-green-500 {selectedPeriod === period.key ? 'bg-green-500 border-green-500 text-white' : ''}"
            on:click={() => selectedPeriod = period.key}
          >
            {period.text}
          </button>
        {/each}
      </div>
    </div>

    <!-- Dashboard Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-5 mb-5">
      <!-- Meetings Booked Card -->
      <div class="lg:col-span-1 bg-gray-900 rounded-lg p-6 border border-gray-700 min-h-48">
        <div class="flex justify-between items-center mb-5">
          <h3 class="text-lg font-medium text-gray-200">{recentBookingText}</h3>
          <div class="text-gray-400 text-xl font-bold cursor-pointer">⋮</div>
        </div>
        <div class="text-center">
          {#if meetingsBooked > 0}
            <div class="text-5xl font-semibold text-gray-200 mb-2">{meetingsBooked}</div>
            <div class="text-gray-400 text-base">{periods.find(p => p.key === selectedPeriod)?.text || selectedPeriod}</div>
          {:else}
            <div class="flex flex-col items-center justify-center text-center p-5 min-h-30">
              <CalendarDays size={32} class="mb-3 opacity-60 text-gray-400" />
                             <div class="text-gray-200 text-base font-medium mb-1">{noBookingsText}</div>
               <div class="text-gray-400 text-sm opacity-80">{noBookingsPeriodText} {(periods.find(p => p.key === selectedPeriod)?.text || selectedPeriod).toLowerCase()}</div>
            </div>
          {/if}
        </div>
      </div>

      <!-- Insights Card -->
      <div class="lg:col-span-2 bg-gray-900 rounded-lg p-6 border border-gray-700 min-h-75">
        <div class="flex justify-between items-center mb-5">
          <h3 class="text-lg font-medium text-gray-200">{insightsText}</h3>
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
            <div class="text-gray-400 text-base flex-1">{cancelledBookingsText}</div>
            <div class="h-1.5 bg-green-500 rounded-full w-0"></div>
          </div>
          <div class="flex items-center gap-4">
            <div class="flex gap-1 min-w-24">
              <span class="text-gray-200 text-base">0%</span>
              <span class="text-gray-400 text-base">(0)</span>
            </div>
            <div class="text-gray-400 text-base flex-1">{rescheduledText}</div>
            <div class="h-1.5 bg-green-500 rounded-full w-0"></div>
          </div>
          <div class="flex items-center gap-4">
            <div class="flex gap-1 min-w-24">
              <span class="text-gray-400 text-base">0%</span>
              <span class="text-gray-400 text-base">(0)</span>
            </div>
            <div class="text-gray-400 text-base flex-1">{noShowText}</div>
            <div class="h-1.5 bg-green-500 rounded-full w-0"></div>
          </div>
        </div>
      </div>

      <!-- Amount Received Card -->
      <div class="lg:col-span-1 bg-gray-900 rounded-lg p-6 border border-gray-700 min-h-48">
        <div class="flex justify-between items-center mb-5">
          <h3 class="text-lg font-medium text-gray-200">{recentContactsText}</h3>
        </div>
        <div class="text-center">
          {#if amountReceived && amountReceived.length > 0}
            <div class="text-5xl font-semibold text-gray-200 mb-2">$0</div>
            <div class="text-gray-400 text-base">{periods.find(p => p.key === selectedPeriod)?.text || selectedPeriod}</div>
          {:else}
            <div class="flex flex-col items-center justify-center text-center p-5 min-h-30">
              <DollarSign size={32} class="mb-3 opacity-60 text-gray-400" />
                             <div class="text-gray-200 text-base font-medium mb-1">{noIncomeText}</div>
               <div class="text-gray-400 text-sm opacity-80">{noIncomePeriodText} {(periods.find(p => p.key === selectedPeriod)?.text || selectedPeriod).toLowerCase()}</div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>
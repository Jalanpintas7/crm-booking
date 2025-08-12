<script>
  import { onMount } from 'svelte';
  import { currentLanguage, translations } from '../lib/stores/language.js';
  import { getDashboardStats, getChartData, getAmountReceivedData, getCompletedBookingsIncome } from '../lib/supabase.js';
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

  // Chart data
  let chartData = {
    period: 'yesterday',
    totalBookings: 0,
    totalIncome: 0,
    newContacts: 0,
    cancelledBookings: 0,
    rescheduledBookings: 0,
    noShowBookings: 0,
    statusStats: {},
    colors: []
  };
  let amountReceivedData = [];
  let completedBookingsIncome = 0;
  let chartLoading = true;

  // Load dashboard stats on component mount
  onMount(async () => {
    await loadDashboardStats();
    await loadChartData();
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

  async function loadChartData() {
    try {
      chartLoading = true;
      const [chartResult, amountResult, completedIncome] = await Promise.all([
        getChartData(selectedPeriod),
        getAmountReceivedData(selectedPeriod),
        getCompletedBookingsIncome(selectedPeriod)
      ]);
      chartData = chartResult;
      amountReceivedData = amountResult;
      completedBookingsIncome = completedIncome;
    } catch (err) {
      console.error('Error loading chart data:', err);
    } finally {
      chartLoading = false;
    }
  }

  // Data untuk analytics (konten sebelumnya)
  let selectedPeriod = 'yesterday';
  $: periods = [
    { key: 'yesterday', text: yesterdayText },
    { key: 'last_7_days', text: last7DaysText },
    { key: 'last_30_days', text: last30DaysText }
  ];
  
  // Watch for period changes and reload chart data
  $: if (selectedPeriod) {
    loadChartData();
  }
  
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  });

  // Reactive insights based on chart data
  $: insights = [
    { 
      label: newBookingsText, 
      value: chartData.totalBookings, 
      change: chartData.totalBookings > 0 ? '+12%' : '0%', 
      positive: chartData.totalBookings > 0 
    },
    { 
      label: incomeText, 
      value: `RM ${completedBookingsIncome.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}`, 
      change: completedBookingsIncome > 0 ? '+8%' : '0%', 
      positive: completedBookingsIncome > 0 
    },
    { 
      label: activeCustomersText, 
      value: chartData.newContacts, 
      change: chartData.newContacts > 0 ? '+5%' : '0%', 
      positive: chartData.newContacts > 0 
    },
    { 
      label: cancelledBookingsText, 
      value: chartData.cancelledBookings, 
      change: chartData.cancelledBookings > 0 ? '-3%' : '0%', 
      positive: false 
    },
    { 
      label: rescheduledText, 
      value: chartData.rescheduledBookings, 
      change: chartData.rescheduledBookings > 0 ? '+2%' : '0%', 
      positive: true 
    },
    { 
      label: noShowText, 
      value: chartData.noShowBookings, 
      change: chartData.noShowBookings > 0 ? '-1%' : '0%', 
      positive: false 
    }
  ];

  function t(key) {
    return currentTranslations[key] || key;
  }

  function formatCurrency(amount) {
    return `RM ${parseFloat(amount).toLocaleString('ms-MY', { minimumFractionDigits: 2 })}`;
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
        <button 
          class="border border-gray-700 text-gray-400 px-4 py-2 rounded-md text-sm cursor-pointer transition-all duration-200 hover:border-green-500 hover:text-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          on:click={loadChartData}
          disabled={chartLoading}
        >
          {chartLoading ? 'Memuat...' : '⟳'}
        </button>
      </div>
    </div>

    <!-- Dashboard Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-5">
      <!-- Meetings Booked Card -->
      <div class="lg:col-span-1 bg-gray-900 rounded-lg p-6 border border-gray-700 min-h-48">
        <div class="flex justify-between items-center mb-5">
          <h3 class="text-lg font-medium text-gray-200">{recentBookingText}</h3>
          <div class="text-gray-400 text-xl font-bold cursor-pointer">⋮</div>
        </div>
        <div class="text-center">
          {#if chartLoading}
            <div class="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-200 mb-2">...</div>
            <div class="text-gray-400 text-base">{periods.find(p => p.key === selectedPeriod)?.text || selectedPeriod}</div>
          {:else if chartData.totalBookings > 0}
            <div class="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-200 mb-2">{chartData.totalBookings}</div>
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
      <div class="lg:col-span-3 bg-gray-900 rounded-lg p-6 border border-gray-700 min-h-75">
        <div class="flex justify-between items-center mb-5">
          <h3 class="text-lg font-medium text-gray-200">{insightsText}</h3>
          <div class="flex items-center gap-2 text-sm text-gray-400">
            <span>Total: {chartData.totalBookings}</span>
            <span>•</span>
            <span>Income: {formatCurrency(completedBookingsIncome)}</span>
          </div>
        </div>
        
        <!-- Chart Container -->
        <div class="flex mb-6">
          <div class="flex flex-col justify-between mr-4 text-xs text-gray-400 h-38 pr-2">
            <div class="text-right">100%</div>
            <div class="text-right">75%</div>
            <div class="text-right">50%</div>
            <div class="text-right">25%</div>
            <div class="text-right">0%</div>
          </div>
          <div class="flex-1 h-38 bg-gray-950 rounded border border-gray-700 relative">
            <!-- Chart Legend -->
            {#if !chartLoading && Object.keys(chartData.statusStats).length > 0}
              <div class="absolute top-2 right-2 flex flex-wrap gap-2">
                {#each Object.entries(chartData.statusStats) as [status, stats]}
                  <div class="flex items-center gap-1 text-xs">
                    <div class="w-3 h-3 rounded" style="background-color: {stats.color};"></div>
                    <span class="text-gray-300">{status}</span>
                  </div>
                {/each}
              </div>
            {/if}
                      {#if chartLoading}
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="flex flex-col items-center gap-2">
                <div class="w-6 h-6 border-2 border-gray-600 border-t-green-500 rounded-full animate-spin"></div>
                <div class="text-gray-400 text-sm">Memuat data...</div>
              </div>
            </div>
            {:else if Object.keys(chartData.statusStats).length === 0}
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="text-gray-400 text-sm">Tiada data untuk tempoh ini</div>
              </div>
            {:else}
              <!-- Chart bars -->
              <div class="flex items-end justify-around h-full px-4 py-2">
                {#each Object.entries(chartData.statusStats) as [status, stats]}
                  <div class="flex flex-col items-center group relative">
                    <div 
                      class="w-8 rounded-t transition-all duration-300 hover:opacity-80 hover:scale-105 cursor-pointer"
                      style="height: {stats.percentage}%; background-color: {stats.color};"
                      title="{status}: {stats.count} tempahan ({stats.percentage}%)"
                    ></div>
                    <!-- Enhanced tooltip -->
                    <div class="absolute bottom-full mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                      <div class="font-medium">{status}</div>
                      <div>{stats.count} tempahan</div>
                      <div>{stats.percentage}%</div>
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        </div>

        <!-- Stats -->
        <div class="flex flex-col gap-5">
          {#if chartLoading}
            <div class="flex items-center gap-4">
              <div class="flex gap-1 min-w-24">
                <span class="text-gray-400 text-base">...</span>
                <span class="text-gray-400 text-base">(...)</span>
              </div>
              <div class="text-gray-400 text-base flex-1">Memuat...</div>
              <div class="h-1.5 bg-gray-600 rounded-full w-0"></div>
            </div>
          {:else if Object.keys(chartData.statusStats).length === 0}
            <div class="flex items-center gap-4">
              <div class="flex gap-1 min-w-24">
                <span class="text-gray-400 text-base">0%</span>
                <span class="text-gray-400 text-base">(0)</span>
              </div>
              <div class="text-gray-400 text-base flex-1">Tiada data</div>
              <div class="h-1.5 bg-gray-600 rounded-full w-0"></div>
            </div>
          {:else}
            {#each Object.entries(chartData.statusStats) as [status, stats]}
              <div class="flex items-center gap-4">
                <div class="flex gap-1 min-w-24">
                  <span class="text-gray-200 text-base">{stats.percentage}%</span>
                  <span class="text-gray-400 text-base">({stats.count})</span>
                </div>
                <div class="text-gray-400 text-base flex-1">{status}</div>
                <div 
                  class="h-1.5 rounded-full transition-all duration-300"
                  style="width: {stats.percentage}%; background-color: {stats.color};"
                ></div>
              </div>
            {/each}
          {/if}
        </div>

        <!-- Summary Insights -->
        {#if !chartLoading && Object.keys(chartData.statusStats).length > 0}
          <div class="mt-6 pt-6 border-t border-gray-700">
            <h4 class="text-sm font-medium text-gray-300 mb-3">Ringkasan {periods.find(p => p.key === selectedPeriod)?.text || selectedPeriod}</h4>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div class="bg-gray-800 rounded p-3">
                <div class="text-gray-400 mb-1">Tempahan Baru</div>
                <div class="text-lg font-semibold text-green-400">{chartData.newContacts}</div>
              </div>
              <div class="bg-gray-800 rounded p-3">
                <div class="text-gray-400 mb-1">Dibatalkan</div>
                <div class="text-lg font-semibold text-red-400">{chartData.cancelledBookings}</div>
              </div>
              <div class="bg-gray-800 rounded p-3">
                <div class="text-gray-400 mb-1">Ditunda</div>
                <div class="text-lg font-semibold text-yellow-400">{chartData.rescheduledBookings}</div>
              </div>
              <div class="bg-gray-800 rounded p-3">
                <div class="text-gray-400 mb-1">Tidak Hadir</div>
                <div class="text-lg font-semibold text-orange-400">{chartData.noShowBookings}</div>
              </div>
            </div>
          </div>
        {/if}
      </div>

      <!-- Amount Received Card -->
      <div class="lg:col-span-1 bg-gray-900 rounded-lg p-6 border border-gray-700 min-h-48">
        <div class="flex justify-between items-center mb-5">
          <h3 class="text-lg font-medium text-gray-200">{incomeText}</h3>
        </div>
        <div class="text-center">
          {#if chartLoading}
            <div class="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-200 mb-2">...</div>
            <div class="text-gray-400 text-base">{periods.find(p => p.key === selectedPeriod)?.text || selectedPeriod}</div>
          {:else if completedBookingsIncome > 0}
            <div class="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-200 mb-2 break-words">{formatCurrency(completedBookingsIncome)}</div>
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
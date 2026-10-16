<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4" :class="{ 'dark': isDark }">
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" @click="close"></div>
    
    <!-- Modal -->
    <div class="relative w-full max-w-5xl bg-white dark:bg-[#2a2a2a] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transform transition-all text-left">
      
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/10 shrink-0">
        <div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <svg class="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ title }}
          </h3>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {{ $t('admin_dashboard.showing_items', { count: data.length }) }}
          </p>
        </div>
        <button @click="close" class="p-2 mr-[-8px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors focus:outline-none">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Body -->
      <div class="flex-1 overflow-auto bg-gray-50/50 dark:bg-[#242424] p-6 custom-scrollbar">
        
        <!-- Loading State -->
        <div v-if="loading" class="flex flex-col items-center justify-center py-12">
            <svg class="animate-spin h-8 w-8 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-gray-500 dark:text-gray-400 font-medium">{{ $t('dashboard.loading') }}</span>
        </div>

        <!-- Empty State -->
        <div v-else-if="!data || data.length === 0" class="flex flex-col items-center justify-center py-12 text-center">
            <div class="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                <svg class="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
            </div>
            <p class="text-gray-500 dark:text-gray-400 font-medium text-lg">{{ $t('admin_dashboard.no_data') }}</p>
        </div>

        <!-- TICKET TABLE -->
        <div v-else-if="type === 'ticket'" class="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#2a2a2a] overflow-hidden shadow-sm">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-gray-700 dark:text-gray-300">
              <thead class="text-xs uppercase bg-gray-50 dark:bg-black/20 text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-white/10">
                <tr>
                  <th class="px-6 py-4 font-semibold tracking-wider">{{ $t('admin_dashboard.col_ticket_no') }}</th>
                  <th class="px-6 py-4 font-semibold tracking-wider">{{ $t('admin_dashboard.col_subject') }}</th>
                  <th class="px-6 py-4 font-semibold tracking-wider">{{ $t('admin_dashboard.col_status') }}</th>
                  <th class="px-6 py-4 font-semibold tracking-wider">{{ $t('admin_dashboard.col_user') }}</th>
                  <th class="px-6 py-4 font-semibold tracking-wider">{{ $t('admin_dashboard.col_time') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-white/5">
                <tr 
                  v-for="item in data" 
                  :key="item.ticket_id" 
                  @click="goToTicket(item.ticket_id)"
                  class="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer group"
                >
                  <td class="px-6 py-4 whitespace-nowrap font-mono text-blue-500 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400">{{ item.ticket_no }}</td>
                  <td class="px-6 py-4">
                      <div class="font-medium text-gray-900 dark:text-white">{{ item.subject }}</div>
                      <div class="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{{ item.ticket_type === 'INCIDENT' ? $t('ticket_detail.type_incident') : $t('ticket_detail.type_support') }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase border bg-opacity-10" :class="getStatusStyle(item.status)">
                      {{ item.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex flex-shrink-0 items-center justify-center text-white text-xs font-bold shadow-sm">
                          {{ item.requester_name ? item.requester_name.substring(0,2).toUpperCase() : 'UK' }}
                      </div>
                      <div class="flex flex-col">
                          <span class="font-medium text-gray-900 dark:text-white">{{ item.requester_name || 'Unknown' }}</span>
                          <span class="text-[11px] text-gray-500 dark:text-gray-400">{{ item.department || 'N/A' }}</span>
                      </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400 text-xs">{{ formatDate(item.created_at) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ASSET TABLE -->
        <div v-else-if="type === 'asset'" class="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#2a2a2a] overflow-hidden shadow-sm">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-gray-700 dark:text-gray-300">
              <thead class="text-xs uppercase bg-gray-50 dark:bg-black/20 text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-white/10">
                <tr>
                  <th class="px-6 py-4 font-semibold tracking-wider">{{ $t('admin_dashboard.col_asset_name') }}</th>
                  <th class="px-6 py-4 font-semibold tracking-wider">{{ $t('admin_dashboard.fixed_asset_label') }} / IP</th>
                  <th class="px-6 py-4 font-semibold tracking-wider">{{ $t('admin_dashboard.col_user_dept') }}</th>
                  <th class="px-6 py-4 font-semibold tracking-wider">{{ $t('admin_dashboard.col_system_info') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-white/5">
                <tr 
                  v-for="item in data" 
                  :key="item.computer_id" 
                  class="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                >
                  <td class="px-6 py-4 font-bold text-gray-900 dark:text-white">{{ item.hostname || $t('admin_dashboard.unnamed_asset') }}</td>
                  <td class="px-6 py-4">
                      <div v-if="item.fixed_asset" class="font-bold text-gray-900 dark:text-white">{{ item.fixed_asset }}</div>
                      <div class="text-xs font-mono text-gray-500 dark:text-gray-400 mt-0.5">{{ item.ip_address || $t('admin_dashboard.no_ip') }}</div>
                  </td>
                  <td class="px-6 py-4">
                      <div class="font-medium text-gray-900 dark:text-white">{{ item.owner_name || $t('admin_dashboard.no_user') }}</div>
                      <div class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ item.department || 'N/A' }}</div>
                  </td>
                  <td class="px-6 py-4">
                      <div class="text-sm text-gray-900 dark:text-gray-300">{{ item.os_version || 'N/A' }}</div>
                      <div class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ item.total_ram_gb ? item.total_ram_gb + 'GB RAM' : 'N/A' }}</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-[#2a2a2a] shrink-0 text-right rounded-b-2xl">
        <button @click="close" class="px-5 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 shadow-sm">
          {{ $t('button.close') }}
        </button>
      </div>
      
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useTheme } from '@/composables/useTheme';

const { isDark } = useTheme();

const props = defineProps({
    isOpen: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    title: { type: String, default: 'Details' },
    data: { type: Array, default: () => [] },
    type: { type: String, default: 'ticket', validator: (v) => ['ticket', 'asset'].includes(v) }
});

const emit = defineEmits(['update:isOpen']);
const router = useRouter();

const close = () => {
    emit('update:isOpen', false);
};

const goToTicket = (id) => {
    close();
    router.push(`/app/tickets/${id}`);
};

const getStatusStyle = (status) => {
    switch(status) {
        case 'WAITING APPROVE': return 'text-yellow-600 dark:text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
        case 'OPEN': case 'NEW': return 'text-orange-500 dark:text-orange-400 border-orange-500/30 bg-orange-500/10';
        case 'PENDING': return 'text-orange-400 dark:text-orange-300 border-orange-400/30 bg-orange-400/10';
        case 'IN PROGRESS': return 'text-blue-500 dark:text-blue-400 border-blue-500/30 bg-blue-500/10';
        case 'RESOLVED': case 'CLOSED': return 'text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
        default: return 'text-gray-600 dark:text-gray-400 border-gray-500/30 bg-gray-500/10';
    }
};

const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('th-TH', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
    });
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.5); border-radius: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(107, 114, 128, 0.8); }
</style>

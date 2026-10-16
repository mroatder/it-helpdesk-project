<template>
  <div class="p-6 font-sans min-h-screen flex flex-col transition-colors" :class="isDark ? 'text-gray-300' : 'text-[#444746]'">
    
    <div class="flex-1">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">{{ $t('my_tickets.title') }}</h1>
      </div>
      <div class="rounded-2xl shadow-lg overflow-hidden border flex flex-col relative min-h-[400px] transition-all duration-300" 
           :class="isDark ? 'bg-[#333333] border-white/10 shadow-md' : 'bg-[#ffffff] border-[rgba(0,0,0,0.08)] shadow-[0_1px_2px_0_rgba(60,64,67,0.30)]'">

        
        <div v-if="loading" class="absolute inset-0 z-20 flex flex-col items-center justify-center backdrop-blur-sm transition-all duration-300"
             :class="isDark ? 'bg-[#333333]/80' : 'bg-white/80'">
            <svg class="animate-spin h-10 w-10 text-blue-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-sm font-medium transition-colors" :class="isDark ? 'text-gray-300' : 'text-[#727775]'">{{ $t('my_tickets.loading') }}</span>
        </div>

        <div class="overflow-x-auto flex-1">
          <table class="w-full text-left transition-colors" :class="isDark ? 'text-gray-300' : 'text-[#444746]'">
            <thead class="uppercase text-[11px] tracking-wider sticky top-0 z-10 font-bold transition-colors"
                   :class="isDark ? 'bg-[#2a2a2a] text-gray-400' : 'bg-[#f1f3f4] text-[#727775]'">
              <tr>
                <th class="px-6 py-4">{{ $t('my_tickets.col_no') }}</th>
                <th class="px-6 py-4">{{ $t('my_tickets.col_subject') }}</th>
                <th class="px-6 py-4">{{ $t('my_tickets.col_status') }}</th>
                <th class="px-6 py-4">{{ $t('my_tickets.col_assignee') }}</th>
                <th class="px-6 py-4">{{ $t('my_tickets.col_date') }}</th>
                <th class="px-6 py-4 text-right">{{ $t('my_tickets.col_action') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y transition-colors" :class="isDark ? 'divide-white/5' : 'divide-[rgba(0,0,0,0.08)]'">
              
              <tr v-if="!loading && tickets.length === 0">
                  <td colspan="6" class="text-center py-10 text-gray-500 flex flex-col items-center justify-center gap-2"> 
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      <span>{{ $t('my_tickets.no_history') }}</span>
                  </td>
              </tr>

              <tr v-for="ticket in paginatedTickets" :key="ticket.ticket_id" 
                  class="transition-colors duration-150 group border-l-4 border-transparent"
                  :class="isDark ? 'hover:bg-[#3a3a3a]' : 'hover:bg-[#f8f9fa]'">
                <td class="px-6 py-4 font-mono font-medium transition-colors" :class="isDark ? 'text-blue-400 group-hover:text-blue-300' : 'text-blue-600 group-hover:text-blue-700'">{{ ticket.ticket_no }}</td>
                <td class="px-6 py-4 font-medium transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">{{ formatSubject(ticket.subject) }}</td>
                
                <td class="px-6 py-4">
                  <span class="px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wide" :class="getStatusClass(ticket.status)">
                    {{ ticket.status === 'WAITING APPROVE' ? 'WAITING APPROVAL' : ticket.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm">
                  <div class="flex items-center gap-2">
                      <div v-if="ticket.technician_name" 
                           class="w-7 h-7 rounded-full flex items-center justify-center text-[10px] text-white font-bold shadow-sm uppercase flex-shrink-0"
                           :class="isDark ? 'bg-gradient-to-br from-gray-600 to-gray-700' : 'bg-gradient-to-br from-blue-400 to-blue-500'">
                          {{ ticket.technician_name.charAt(0) }}
                      </div>
                      <span :class="isDark ? 'text-gray-400' : 'text-[#444746]'">{{ ticket.technician_name || '-' }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-xs transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#9aa0a6]'">
                  {{ formatDate(ticket.created_at) }}
                </td>
                <td class="px-6 py-4 text-right">
                  <button 
                      @click="goToDetail(ticket.ticket_id)"
                      class="text-sm font-medium hover:underline transition-all opacity-80 group-hover:opacity-100 flex items-center gap-1 ml-auto"
                      :class="isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'"
                  >
                      {{ $t('my_tickets.btn_detail') }}
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="sticky bottom-0 z-40 py-0 flex justify-center mt-auto">
      <Pagination 
        :current-page="currentPage"
        :total-pages="totalPages"
        @page-changed="changePage"
      />
    </div>

  </div>
</template>

<script setup>
import { ref, computed, getCurrentInstance, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { useTheme } from '@/composables/useTheme';
import Pagination from '../../components/Pagination.vue'; 
import { useI18n } from 'vue-i18n';

const { isDark } = useTheme();
const { proxy } = getCurrentInstance();
const $api = proxy.$api; 
const userStore = useUserStore();
const router = useRouter();
const route = useRoute();
const { t } = useI18n(); 

const tickets = ref([]);
const loading = ref(false);
const currentPage = ref(Number(route.query.page) || 1);
const itemsPerPage = 12;

const getUserId = () => {
    const user = userStore.currentUser || userStore.userProfile; 
    return user?.user_id?.toString() || user?.id?.toString() || null;
};

const getAuthOptions = () => {
    const token = userStore.getAuthToken;
    if (!token) return null;
    return { headers: { Authorization: `Bearer ${token}` } };
};

const fetchData = async () => {
    loading.value = true;
    try {
        const userId = getUserId();
        const options = getAuthOptions();
        if(!userId || !$api || !options) {
            loading.value = false;
            return;
        }
        
        const res = await $api.get(`/tickets/my-tickets/${userId}`, options);
        
        if (res.data.success) {
            let rawTickets = res.data.data;

            // ✅ Normalize Status และลบรายการซ้ำ
            const uniqueTicketsMap = new Map();
            rawTickets.forEach(ticket => {
                if (!uniqueTicketsMap.has(ticket.ticket_id)) {
                    
                    let dbStatus = (ticket.status || 'NEW').toUpperCase();
                    let normalizedStatus = dbStatus;
                    
                    // จัดการชื่อสถานะให้สอดคล้องกับหน้า AllTickets
                    if (dbStatus === 'IN PROGRESS') normalizedStatus = 'IN PROGRESS';
                    // WAITING APPROVE คงไว้แบบมีช่องว่างตาม DB

                    uniqueTicketsMap.set(ticket.ticket_id, {
                        ...ticket,
                        status: normalizedStatus
                    });
                }
            });

            tickets.value = Array.from(uniqueTicketsMap.values());
        }
    } catch (error) {
        console.error("Error fetching my tickets:", error);
    } finally {
        loading.value = false;
    }
};

watch(() => getUserId(), (newId) => {
    if (newId && userStore.isLoggedIn) fetchData();
}, { immediate: true });

const totalPages = computed(() => Math.ceil(tickets.value.length / itemsPerPage));
const paginatedTickets = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    return tickets.value.slice(start, start + itemsPerPage);
});

const changePage = (page) => { 
    currentPage.value = page; 
    router.replace({ query: { ...route.query, page } });
};

const goToDetail = (id) => {
    router.push({ query: { ...route.query, page: currentPage.value } });
    router.push(`/app/my-tickets/${id}`);
};

const formatSubject = (subject) => {
    if (!subject) return '-';
    const parts = subject.split(' - ');
    return parts.length > 1 ? parts[parts.length - 1] : subject;
};

const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('th-TH', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
};

// 🎨 ปรับปรุงสีสถานะให้ตรงกันทั้งหมด
const getStatusClass = (status) => {
    switch (status) {
        case 'WAITING APPROVE': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
        case 'NEW': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        case 'PENDING': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
        case 'IN PROGRESS': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        case 'RESOLVED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        case 'REJECTED': return 'bg-red-500/10 text-red-400 border-red-500/20';
        default: return isDark.value ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' : 'bg-[#f1f3f4] text-[#727775] border-[rgba(0,0,0,0.08)]';
    }
};
</script>
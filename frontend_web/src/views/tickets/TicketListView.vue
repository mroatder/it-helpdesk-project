<template>
  <div class="p-4 font-sans max-w-full mx-auto pb-8 ticket-list-container transition-colors" :class="isDark ? 'text-gray-300' : 'text-[#444746]'"> 
    
    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-4 gap-4">
      <div class="flex-shrink-0">
        <h2 class="text-3xl font-bold tracking-tight transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">{{ $t('ticket_list.title') }}</h2>
        <p class="text-sm mt-1 transition-colors" :class="isDark ? 'text-gray-400' : 'text-[#727775]'">{{ $t('ticket_list.subtitle') }}</p>
      </div>

      <div class="flex flex-wrap gap-3 w-full lg:w-auto justify-end">
          
          <div class="relative min-w-[220px] flex-1 lg:flex-none">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
            </span>
            <input 
                type="text" 
                v-model="searchText" 
                :placeholder="$t('ticket_list.search_placeholder')" 
                class="w-full pl-9 p-2.5 rounded-lg border focus:ring-1 focus:ring-blue-500 transition-all text-sm shadow-sm"
                :class="isDark ? 'bg-[#282A2C] text-white border-white/5 placeholder-gray-500' : 'bg-white text-[#1f1f1f] border-[rgba(0,0,0,0.12)] placeholder-[#9aa0a6]'"
            >
          </div>

          <select v-model="filterStatus" 
                  class="p-2.5 rounded-lg border focus:ring-1 focus:ring-blue-500 text-sm cursor-pointer shadow-sm transition-all"
                  :class="isDark ? 'bg-[#282A2C] text-white border-white/5 hover:bg-[#333538]' : 'bg-white text-[#1f1f1f] border-[rgba(0,0,0,0.12)] hover:bg-gray-50'">
            <option value="">{{ $t('ticket_list.filter_all_status') }}</option>
            <option value="WAITING APPROVE">{{ $t('ticket_list.filter_status_waiting_approval') }}</option> 
            <option value="NEW">{{ $t('ticket_list.filter_status_new') }}</option>
            <option value="PENDING">{{ $t('ticket_list.filter_status_pending') }}</option>
            <option value="IN PROGRESS">{{ $t('ticket_list.filter_status_progress') }}</option>
            <option value="RESOLVED">{{ $t('ticket_list.filter_status_resolved') }}</option>
            <option value="REJECTED">{{ $t('ticket_list.filter_status_rejected') }}</option>
        </select>
        
          <select v-model="filterPriority" 
                  class="p-2.5 rounded-lg border focus:ring-1 focus:ring-blue-500 text-sm cursor-pointer shadow-sm transition-all"
                  :class="isDark ? 'bg-[#282A2C] text-white border-white/5 hover:bg-[#333538]' : 'bg-white text-[#1f1f1f] border-[rgba(0,0,0,0.12)] hover:bg-gray-50'">
              <option value="">{{ $t('ticket_list.filter_priority_placeholder') }}</option>
              <option value="LOW">{{ $t('ticket_list.filter_priority_low') }}</option>
              <option value="MEDIUM">{{ $t('ticket_list.filter_priority_medium') }}</option>
              <option value="HIGH">{{ $t('ticket_list.filter_priority_high') }}</option>
              <option value="VERY_HIGH">{{ $t('ticket_list.filter_priority_critical') }}</option>
          </select>
      </div>
    </div>

    <div class="text-center">
        <div class="rounded-xl shadow-xl border relative min-h-[500px] mx-auto inline-block max-w-full table-card-fix transition-all duration-300"
             :class="isDark ? 'bg-[#282A2C] border-white/5 shadow-black/20' : 'bg-white border-[rgba(0,0,0,0.08)] shadow-[0_1px_3px_0_rgba(60,64,67,0.30)]'">
            
            <div v-if="loading" class="absolute inset-0 z-20 flex flex-col items-center justify-center backdrop-blur-sm transition-all duration-300"
                 :class="isDark ? 'bg-[#282A2C]/80' : 'bg-white/80'">
                <svg class="animate-spin h-10 w-10 text-blue-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span class="text-sm font-medium transition-colors" :class="isDark ? 'text-gray-300' : 'text-[#727775]'">{{ $t('ticket_list.loading') }}</span>
            </div>

            <div class="overflow-x-auto"> 
                <table class="divide-y table-auto transition-colors" :class="isDark ? 'divide-white/5' : 'divide-[rgba(0,0,0,0.06)]'"> 
                    <thead class="text-xs uppercase font-semibold tracking-wider sticky top-0 z-10 transition-colors"
                           :class="isDark ? 'bg-[#1A1C1E] text-gray-400' : 'bg-[#f1f3f4] text-[#727775]'">
                        <tr class="text-center"> 
                            <th class="px-6 py-4 fixed-width-col-80 whitespace-nowrap">{{ $t('ticket_list.col_no') }}</th> 
                            <th class="px-6 py-4 fixed-width-col-350">{{ $t('ticket_list.col_subject') }}</th> 
                            <th class="px-6 py-4 hidden sm:table-cell fixed-width-col-128 whitespace-nowrap">{{ $t('ticket_list.col_status') }}</th>
                            <th class="px-6 py-4 hidden md:table-cell fixed-width-col-112 whitespace-nowrap">{{ $t('ticket_list.col_priority') }}</th>
                            <th class="px-6 py-4 hidden lg:table-cell fixed-width-col-350">{{ $t('ticket_list.col_requester') }}</th>
                            <th class="px-6 py-4 fixed-width-col-96 whitespace-nowrap">{{ $t('ticket_list.col_actions') }}</th>
                        </tr>
                    </thead>
                    
                    <tbody class="divide-y transition-colors" :class="isDark ? 'divide-white/5' : 'divide-[rgba(0,0,0,0.06)]'">
                        <tr v-for="ticket in paginatedTickets" :key="ticket.ticket_id" 
                            class="transition-colors group"
                            :class="isDark ? 'hover:bg-[#333538]' : 'hover:bg-[#f8f9fa]'">
                            
                            <td class="px-6 py-4 font-mono font-medium whitespace-nowrap transition-colors"
                                :class="isDark ? 'text-blue-400' : 'text-blue-600'">
                                {{ ticket.ticket_no }}
                            </td>
                            
                            <td class="px-6 py-4 cursor-pointer" @click="goToTicketDetail(ticket.ticket_id)">
                                <div class="font-medium truncate transition-colors" 
                                     :class="isDark ? 'text-white' : 'text-[#1f1f1f]'" :title="ticket.subject">{{ ticket.subject }}</div> 
                                <div class="text-xs mt-1 flex items-center justify-center gap-1 transition-colors"
                                     :class="isDark ? 'text-gray-500' : 'text-[#9aa0a6]'"> 
                                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    <span class="hidden md:inline">{{ formatDate(ticket.created_at) }}</span>
                                    <span class="md:hidden">{{ formatDate(ticket.created_at).split(' ')[0] }}</span>
                                </div>
                            </td>

                            <td class="px-6 py-4 hidden sm:table-cell">
                                <div class="flex justify-center">
                                    <span 
                                        :class="getStatusClasses(ticket.status)"
                                        class="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm min-w-[110px] inline-block text-center border transition-all"
                                    >
                                        {{ ticket.status === 'WAITING APPROVE' ? (isDark ? 'Waiting Approval' : 'WAITING APPROVE') : ticket.status }}
                                    </span>
                                </div>
                            </td>

                            <td class="px-6 py-4 hidden md:table-cell">
                                <div class="flex justify-center">
                                    <span 
                                        :class="getPriorityClasses(ticket.priority)"
                                        class="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm min-w-[90px] inline-block text-center border transition-all"
                                    >
                                        {{ ticket.priority }}
                                    </span>
                                </div>
                            </td>
                                                        
                            <td class="px-6 py-4 whitespace-nowrap text-sm hidden lg:table-cell transition-colors"
                                :class="isDark ? 'text-gray-300' : 'text-[#444746]'">
                                {{ ticket.requester_name || 'Unknown' }}
                            </td>

                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex items-center justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                    <button @click="goToTicketDetail(ticket.ticket_id)" 
                                            class="p-1.5 rounded-lg transition-colors" 
                                            :class="isDark ? 'text-blue-400 hover:text-white hover:bg-blue-600' : 'text-blue-600 hover:bg-blue-50'"
                                            title="View Details">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </button>
                                    <button @click="deleteTicket(ticket.ticket_id)" 
                                            class="p-1.5 rounded-lg transition-colors" 
                                            :class="isDark ? 'text-red-400 hover:text-white hover:bg-red-600' : 'text-red-600 hover:bg-red-50'"
                                            title="Delete Ticket">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                        
                        <tr v-if="!loading && paginatedTickets.length === 0">
                            <td colspan="6" class="px-6 py-12 text-center transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">
                                <div class="flex flex-col items-center justify-center">
                                    <svg class="w-12 h-12 mb-3 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                                    </svg>
                                    <p>{{ $t('ticket_list.not_found') }}</p>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    
    <div v-if="filteredTickets.length > 0" class="mt-6 flex justify-center pb-4">
      <Pagination 
        :current-page="currentPage"
        :total-pages="totalPages"
        @page-changed="changePage"
      />
    </div>

  </div>
</template>

<script setup>
import { ref, computed, inject, onMounted, watch, getCurrentInstance } from 'vue';
import { useRouter, useRoute } from 'vue-router'; 
import Pagination from '../../components/Pagination.vue'; 
import { useModalStore } from '@/stores/modalStore';
import { useI18n } from 'vue-i18n';
import { useTheme } from '@/composables/useTheme';
import { useUserStore } from '@/stores/userStore';
import { useTicketStore } from '@/stores/ticketStore';

const { isDark } = useTheme();

const { proxy } = getCurrentInstance();
const $api = proxy.$api; 
const userStore = useUserStore(); 

const { t } = useI18n(); 
const router = useRouter();
const route = useRoute();
const modal = useModalStore();
const ticketStore = useTicketStore();




const allTickets = ref([]);
const loading = ref(false);
const searchText = ref(route.query.search || sessionStorage.getItem('ticket_filter_search') || '');
const filterStatus = ref(route.query.status || sessionStorage.getItem('ticket_filter_status') || '');
const filterPriority = ref(route.query.priority || sessionStorage.getItem('ticket_filter_priority') || '');

const itemsPerPage = 9; 
const currentPage = ref(Number(route.query.page) || Number(sessionStorage.getItem('ticket_filter_page')) || 1);

const syncFilters = () => {
    const query = {};
    if (filterStatus.value) query.status = filterStatus.value;
    if (filterPriority.value) query.priority = filterPriority.value;
    if (searchText.value) query.search = searchText.value;
    if (currentPage.value > 1) query.page = currentPage.value;

    sessionStorage.setItem('ticket_filter_status', filterStatus.value || '');
    sessionStorage.setItem('ticket_filter_priority', filterPriority.value || '');
    sessionStorage.setItem('ticket_filter_search', searchText.value || '');
    sessionStorage.setItem('ticket_filter_page', currentPage.value || 1);

    router.replace({ query }).catch(() => {});
};

// Auth Header Helper
const getAuthOptions = () => {
    const token = userStore.getAuthToken;
    if (!token) {
        console.error("Authorization Token missing.");
        return null;
    }
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

// 🛑 Fetch Tickets logic
const fetchTickets = async () => {
    loading.value = true;
    if (!$api) return;
    const options = getAuthOptions();
    if (!options) {
        loading.value = false;
        return;
    }
    
    try {
        const res = await $api.get('/tickets/all', options); 
        if(res.data.success) {
            let rawTickets = res.data.data;

            const uniqueTicketsMap = new Map();
            rawTickets.forEach(ticket => {
                if (!uniqueTicketsMap.has(ticket.ticket_id)) {
                    
                    // 🟢 Normalize Status สำหรับการแสดงผล
                    let dbStatus = (ticket.status || 'NEW').toUpperCase();
                    
                    // จัดการชื่อให้ตรงกับ Option ที่ตั้งไว้
                    let normalizedStatus = dbStatus;
                    if (dbStatus === 'IN PROGRESS') {
                        normalizedStatus = 'IN PROGRESS';
                    } else if (dbStatus === 'WAITING APPROVE') {
                        normalizedStatus = 'WAITING APPROVE';
                    }

                    const processedTicket = {
                        ...ticket,
                        status: normalizedStatus, 
                        priority: (ticket.priority || 'MEDIUM').toUpperCase()
                    };
                    uniqueTicketsMap.set(ticket.ticket_id, processedTicket);
                }
            });

            allTickets.value = Array.from(uniqueTicketsMap.values());
        }
    } catch (err) {
        if (err._isHandled) return;
        console.error(err);
        if(modal) modal.alert(t('ticket_list.error_loading'), t('modal.error'), 'error');
    } finally {
        loading.value = false;
    }
};

const filteredTickets = computed(() => {
    return allTickets.value.filter(ticket => {
        const tObj = ticket;
        const search = searchText.value.toLowerCase().trim();
        const textMatch = !search || 
            (tObj.ticket_no && tObj.ticket_no.toLowerCase().includes(search)) ||
            (tObj.subject && tObj.subject.toLowerCase().includes(search)) ||
            (tObj.requester_name && tObj.requester_name.toLowerCase().includes(search)) ||
            (tObj.requester_dept && tObj.requester_dept.toLowerCase().includes(search)) ||
            (tObj.department && tObj.department.toLowerCase().includes(search));
        
        const statusMatch = !filterStatus.value || tObj.status === filterStatus.value;
        const priorityMatch = !filterPriority.value || tObj.priority === filterPriority.value;
        
        return textMatch && statusMatch && priorityMatch;
    });
});

const totalItems = computed(() => filteredTickets.value.length);
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage));

const paginatedTickets = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredTickets.value.slice(start, end);
});

watch([searchText, filterStatus, filterPriority], () => {
    currentPage.value = 1;
    syncFilters();
});

const changePage = (page) => {
    currentPage.value = page;
    syncFilters();
};

const deleteTicket = async (id) => {
    const confirmed = await modal.confirm(t('ticket_list.confirm_delete'), t('ticket_list.delete_title'));
    if (!confirmed) return;

    if (!$api) return;
    const options = getAuthOptions();
    if (!options) return;

    try {
        // 🎯 เปลี่ยนจาก $api.delete เป็น $api.put เพื่อทำ Soft Delete
        const res = await $api.put(`/tickets/soft-delete/${id}`, {}, options); 
        
        if (res.data.success) {
            modal.alert(t('ticket_list.delete_success'), t('create_ticket.success_title'), 'success');
            await ticketStore.fetchCounts();
            fetchTickets(); // โหลดรายการใหม่ (ตัวที่ถูกลบจะไม่ขึ้นมาแล้ว)
        }
    } catch (err) {
        modal.alert(t('ticket_list.delete_error'), t('ticket_list.delete_title'), 'error');
    }
};

const goToTicketDetail = (id) => {
    syncFilters();
    router.push(`/app/tickets/${id}`);
};

const formatDate = (dateStr) => {
    if(!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('th-TH', { 
        year: 'numeric', month: '2-digit', day: '2-digit', 
        hour: '2-digit', minute: '2-digit'
    });
};

const getStatusClasses = (status) => {
    switch (status) {
        case 'WAITING APPROVE': 
            return isDark.value ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-amber-50 text-amber-700 border-amber-200';
        
        case 'REJECTED': 
            return isDark.value ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-red-50 text-red-700 border-red-200';

        case 'NEW': 
            return isDark.value ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'bg-sky-50 text-sky-700 border-sky-200';
        
        case 'PENDING': 
            return isDark.value ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-orange-50 text-orange-700 border-orange-200';
        
        case 'IN PROGRESS': 
            return isDark.value ? 'bg-lime-500/20 text-lime-400 border border-lime-500/30' : 'bg-lime-50 text-lime-700 border-lime-200';
        
        case 'RESOLVED': 
            return isDark.value ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-purple-50 text-purple-700 border-purple-200';
            
        default: 
            return isDark.value ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700';
    }
};

const getPriorityClasses = (priority) => {
    switch (priority) {
        case 'LOW': return isDark.value ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200';
        case 'MEDIUM': return isDark.value ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 'bg-yellow-50 text-yellow-700 border-yellow-200';
        case 'HIGH': return isDark.value ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-orange-50 text-orange-700 border-orange-200';
        case 'VERY_HIGH': return isDark.value ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-red-50 text-red-700 border-red-200';
        default: return isDark.value ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600';
    }
};

onMounted(() => {
    if (userStore.isLoggedIn) {
        fetchTickets();
    }
});
</script>

<style scoped>
.overflow-x-auto {
    width: fit-content;
    max-width: 100%;
}

.fixed-width-col-80 { width: 4.16vw; min-width: 80px; }
.fixed-width-col-350 { width: 18.22vw; min-width: 250px; } 
.fixed-width-col-128 { width: 6.66vw; min-width: 100px; }
.fixed-width-col-112 { width: 5.83vw; min-width: 90px; }
.fixed-width-col-96 { width: 5.0vw; min-width: 80px; }

@media (max-width: 1161px) {
    .ticket-list-container {
        font-size: 13px;
    }
    .fixed-width-col-350 { min-width: 200px; }
    .fixed-width-col-128 { min-width: 80px; }
}

@media (max-width: 900px) {
    .ticket-list-container {
        font-size: 12px;
    }
    .fixed-width-col-350 { min-width: 150px; }
}
</style>
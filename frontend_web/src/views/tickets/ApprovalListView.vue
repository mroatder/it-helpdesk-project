<template>
  <div class="p-6 font-sans max-w-full mx-auto pb-20 transition-colors" :class="isDark ? 'text-gray-300' : 'text-[#444746]'">
    
    <div class="flex justify-between items-end mb-6">
      <div>
        <h2 class="text-3xl font-extrabold tracking-tight transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">{{ $t('approval_list.title') }}</h2>
        <p class="text-sm mt-1 transition-colors" :class="isDark ? 'text-gray-400' : 'text-[#727775]'">{{ $t('approval_list.subtitle') }}</p>
      </div>
      <button v-on:click="fetchPendingApprovals" class="p-2.5 rounded-xl transition-all border shadow-sm active:scale-95 flex items-center gap-2"
              :class="isDark ? 'text-gray-400 hover:text-white bg-[#1A1C1E] border-white/10 hover:bg-[#282A2C]' : 'text-[#727775] hover:text-[#1f1f1f] bg-white border-gray-200 hover:bg-gray-50'">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
      </button>
    </div>

    <div class="rounded-2xl overflow-hidden shadow-2xl border transition-all flex flex-col relative w-full"
         :class="isDark ? 'bg-[#1A1C1E] border-white/10' : 'bg-white border-[rgba(0,0,0,0.12)]'">
        <table class="min-w-full border-collapse text-left">
            <thead class="text-[10px] font-bold uppercase tracking-wider transition-colors"
                   :class="isDark ? 'bg-[#282A2C] text-gray-500' : 'bg-gray-50 text-[#727775]'">
                <tr>
                    <th class="px-6 py-4 border-b transition-colors" :class="isDark ? 'border-white/5' : 'border-[rgba(0,0,0,0.08)]'">{{ $t('approval_list.col_no') }}</th>
                    <th class="px-6 py-4 border-b transition-colors" :class="isDark ? 'border-white/5' : 'border-[rgba(0,0,0,0.08)]'">{{ $t('approval_list.col_subject') }}</th>
                    <th class="px-6 py-4 border-b transition-colors" :class="isDark ? 'border-white/5' : 'border-[rgba(0,0,0,0.08)]'">{{ $t('approval_list.col_requester') }}</th>
                    <th class="px-6 py-4 border-b transition-colors" :class="isDark ? 'border-white/5' : 'border-[rgba(0,0,0,0.08)]'">{{ $t('approval_list.col_priority') }}</th>
                    <th class="px-6 py-4 border-b transition-colors" :class="isDark ? 'border-white/5' : 'border-[rgba(0,0,0,0.08)]'">{{ $t('approval_list.col_date') }}</th>
                    <th class="px-6 py-4 border-b text-right transition-colors" :class="isDark ? 'border-white/5' : 'border-[rgba(0,0,0,0.08)]'">{{ $t('approval_list.col_action') }}</th>
                </tr>
            </thead>
            <tbody class="text-sm">
                <tr v-for="item in paginatedList" v-bind:key="item.ticket_id" 
                    class="transition-all border-b"
                    :class="[
                         isDark ? 'hover:bg-white/[0.02] border-white/5' : 'hover:bg-blue-50/30 border-[rgba(0,0,0,0.04)]',
                         'last:border-0'
                    ]"
                >
                    <td class="px-6 py-4 font-mono text-blue-500 text-[10px] font-bold cursor-pointer hover:underline" v-on:click="goToDetail(item.ticket_id)">
                        {{ item.ticket_no }}
                    </td>
                    <td class="px-6 py-4">
                        <div class="font-bold transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">{{ item.subject }}</div>
                        <div class="text-[10px] font-bold tracking-tighter truncate max-w-xs transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ item.description }}</div>
                    </td>
                    <td class="px-6 py-4">
                        <div class="font-bold transition-colors" :class="isDark ? 'text-gray-300' : 'text-[#444746]'">{{ item.requester_name }}</div>
                        <div class="text-[10px] font-bold transition-colors uppercase" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ item.requester_dept }}</div>
                    </td>
                    <td class="px-6 py-4">
                        <span :class="getUrgencyClasses(item.user_urgency)" 
                            class="px-2.5 py-0.5 inline-flex text-[10px] leading-4 font-bold rounded-full uppercase border">
                            {{ item.user_urgency || 'NORMAL' }}
                        </span>

                        <span v-if="item.user_urgency === 'URGENT'" 
                            class="text-[10px] font-bold flex items-center gap-1 mt-1 animate-pulse uppercase tracking-tight transition-colors"
                            :class="isDark ? 'text-rose-400' : 'text-rose-600'">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            {{ $t('approval_list.urgent_label') }}
                        </span>
                    </td>
                    <td class="px-6 py-4 text-[10px] font-bold transition-colors" :class="isDark ? 'text-gray-400' : 'text-[#727775]'">
                        {{ formatDate(item.requested_at) }}
                    </td>
                    <td class="px-6 py-4 text-right">
                        <div class="flex items-center justify-end gap-2">
                            <button 
                                v-on:click="goToDetail(item.ticket_id)"
                                class="px-4 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 active:scale-95 shadow-sm"
                                :class="isDark ? 'border-white/10 text-gray-400 hover:text-white hover:bg-white/5' : 'border-gray-200 text-[#727775] hover:text-[#1f1f1f] hover:bg-gray-50'"
                            >
                                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                {{ $t('approval_list.btn_view') }}
                            </button>
                            <button 
                                v-on:click="handleAction(item, 'REJECTED')"
                                class="px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm"
                                :class="isDark ? 'border border-red-500/30 text-red-500 hover:bg-red-500/20' : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:text-red-700'"
                            >
                                {{ $t('approval_list.btn_reject') }}
                            </button>
                            <button 
                                v-on:click="handleAction(item, 'APPROVED')"
                                class="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white text-xs font-bold shadow-lg shadow-green-600/20 transition-all active:scale-95"
                            >
                                {{ $t('approval_list.btn_approve') }}
                            </button>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>

        <div v-if="pendingList.length === 0" class="p-12 text-center flex flex-col items-center transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">
            <div class="w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors shadow-inner"
                 :class="isDark ? 'bg-[#282A2C]' : 'bg-gray-100'">
                <svg class="w-8 h-8 transition-colors" :class="isDark ? 'text-gray-600' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
            </div>
            <p class="font-bold text-sm">{{ $t('approval_list.no_data') }}</p>
        </div>
    </div>

    <!-- Pagination Container -->
    <div class="py-4 flex flex-col items-center">
        <Pagination 
          :current-page="currentPage"
          :total-pages="totalPages"
          @page-changed="changePage"
        />
    </div>

  </div>
</template>
<script setup>
import { ref, onMounted, computed, getCurrentInstance, watch } from 'vue'; 
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { useModalStore } from '@/stores/modalStore';
import { useI18n } from 'vue-i18n';
import { useTheme } from '@/composables/useTheme';
import Pagination from '../../components/Pagination.vue';

const { isDark } = useTheme();

const { proxy } = getCurrentInstance(); 
const $api = proxy.$api; 
const userStore = useUserStore(); 

const { t } = useI18n(); 
const router = useRouter();
const route = useRoute();
const modal = useModalStore();

const pendingList = ref([]);
const currentUser = computed(() => userStore.userProfile);

const currentPage = ref(Number(route.query.page) || 1);
const itemsPerPage = 10;

const totalPages = computed(() => Math.ceil(pendingList.value.length / itemsPerPage));
const paginatedList = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    return pendingList.value.slice(start, start + itemsPerPage);
});

const changePage = (page) => {
    currentPage.value = page;
    router.replace({ query: { ...route.query, page } });
    const scrollContainer = document.querySelector('.custom-scroll-wrapper');
    if (scrollContainer) scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
};

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

const fetchPendingApprovals = async () => {
    // ต้องรอให้ currentUser มีค่า ID ก่อน
    if (!currentUser.value || !currentUser.value.id || !$api) return;

    const options = getAuthOptions();
    if (!options) return;

    try {
        const res = await $api.get(`/tickets/approvals/pending/${currentUser.value.id}`, options);
        if(res.data.success) {
            pendingList.value = res.data.data;
        }
    } catch (err) {
        console.error("Fetch Approvals Error:", err);
    }
};

const handleAction = async (ticket, status) => {
    const actionText = status === 'APPROVED' ? t('approval_list.action_approve') : t('approval_list.action_reject');
    
    const confirmed = await modal.confirm(
        t('approval_list.confirm_msg', { action: actionText, ticketNo: ticket.ticket_no }), 
        t('approval_list.confirm_title')
    );
    
    if(!confirmed) return;

    if (!currentUser.value.id || !$api) return;
    const options = getAuthOptions();
    if (!options) return;

    try {
        await $api.post(`/tickets/${ticket.ticket_id}/approve`, {
            status: status,
            actor_id: currentUser.value.id
        }, options);

        modal.alert(t('approval_list.alert_success'), t('approval_list.success_title'), 'success');
        fetchPendingApprovals(); 

    } catch (err) {
        modal.alert(t('approval_list.alert_error'), t('approval_list.error_title'), 'error');
    }
};

const goToDetail = (id) => {
    router.push({ query: { ...route.query, page: currentPage.value } });
    router.push(`/app/approvals/${id}`);
};

const formatDate = (dateStr) => {
    if(!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('th-TH', { 
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

const getUrgencyClasses = (urgency) => {
    switch (urgency) {
        case 'NORMAL': 
            return isDark.value ? 'text-sky-400 border-sky-400/20 bg-sky-500/10' : 'text-sky-600 border-sky-200 bg-sky-50';
        case 'URGENT': 
            return isDark.value ? 'text-rose-400 border-rose-400/20 bg-rose-500/10' : 'text-rose-600 border-rose-200 bg-rose-50';
        default: 
            return isDark.value ? 'text-gray-400 border-gray-500/20 bg-gray-500/10' : 'text-gray-500 border-gray-200 bg-gray-100';
    }
};

onMounted(() => {
    watch(() => currentUser.value?.id, (newId) => {
        if (newId && userStore.isLoggedIn) {
            fetchPendingApprovals();
        }
    }, { immediate: true });
});
</script>
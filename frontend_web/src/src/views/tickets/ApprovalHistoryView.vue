<template>
  <div class="p-6 font-sans max-w-full mx-auto text-gray-300 pb-24">
    
    <div class="flex justify-between items-end mb-6">
      <div>
        <h2 class="text-3xl font-bold text-white tracking-tight">{{ $t('approval_history.title') }}</h2>
        <p class="text-gray-400 text-sm mt-1">{{ $t('approval_history.subtitle') }}</p>
      </div>
      <button v-on:click="fetchHistory" class="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>

    <div class="bg-[#282A2C] rounded-xl shadow-xl border border-white/5 relative min-h-[400px] mb-6">
        <div v-if="loading" class="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#282A2C]/80 backdrop-blur-sm rounded-xl">
            <svg class="animate-spin h-10 w-10 text-blue-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-white/5 text-left">
              <thead class="bg-[#1A1C1E] text-gray-400 text-xs uppercase font-semibold tracking-wider">
                  <tr>
                      <th class="px-6 py-4">{{ $t('approval_history.col_no') }}</th>
                      <th class="px-6 py-4">{{ $t('approval_history.col_subject') }}</th>
                      <th class="px-6 py-4">{{ $t('approval_history.col_requester') }}</th>
                      <th class="px-6 py-4 text-center">{{ $t('approval_history.col_result') }}</th>
                      <th class="px-6 py-4">{{ $t('approval_history.col_date') }}</th>
                      <th class="px-6 py-4 text-right">{{ $t('approval_history.col_view') }}</th>
                  </tr>
              </thead>
              <tbody class="divide-y divide-white/5 text-sm">
                  <tr v-for="item in paginatedHistory" v-bind:key="item.ticket_id" class="hover:bg-[#333538] transition-colors group">
                      <td class="px-6 py-4 font-mono text-blue-400 font-medium cursor-pointer" v-on:click="goToDetail(item.ticket_id)">{{ item.ticket_no }}</td>
                      <td class="px-6 py-4"><div class="text-white font-medium">{{ item.subject }}</div></td>
                      <td class="px-6 py-4"><div class="text-gray-300">{{ item.requester_name }}</div></td>
                      <td class="px-6 py-4 text-center">
                          <span class="px-2 py-1 rounded text-[10px] font-bold border uppercase"
                              v-bind:class="item.approval_status === 'APPROVED' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'">
                              {{ item.approval_status === 'APPROVED' ? $t('approval_history.status_approved') : $t('approval_history.status_rejected') }}
                          </span>
                      </td>
                      <td class="px-6 py-4 text-gray-400 text-xs">{{ formatDate(item.approved_at) }}</td>
                      <td class="px-6 py-4 text-right">
                          <button v-on:click="goToDetail(item.ticket_id)" class="text-gray-400 hover:text-white transition-colors">
                              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          </button>
                      </td>
                  </tr>
              </tbody>
          </table>
        </div>

        <div v-if="!loading && historyList.length === 0" class="p-12 text-center text-gray-500 flex flex-col items-center">
            <div class="w-16 h-16 bg-[#333538] rounded-full flex items-center justify-center mb-4 opacity-50">
                <svg class="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            </div>
            <p>{{ $t('approval_history.no_data') }}</p>
        </div>
    </div>

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
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { useI18n } from 'vue-i18n';
import Pagination from '../../components/Pagination.vue'; 

const { proxy } = getCurrentInstance();
const $api = proxy.$api; 
const userStore = useUserStore();
const { t } = useI18n();
const router = useRouter();

const historyList = ref([]);
const loading = ref(false); 
const currentUser = computed(() => userStore.userProfile);

const currentPage = ref(1);
const itemsPerPage = 10;

const getAuthOptions = () => {
    const token = userStore.getAuthToken;
    if (!token) return null;
    return { headers: { Authorization: `Bearer ${token}` } };
};

const fetchHistory = async () => {
    if (!currentUser.value || !currentUser.value.id || !$api) return;
    const options = getAuthOptions();
    if (!options) return;

    loading.value = true; 
    try {
        const res = await $api.get(`/tickets/approvals/history/${currentUser.value.id}`, options);
        if(res.data.success) {
            historyList.value = res.data.data;
            currentPage.value = 1; 
        }
    } catch (err) {
        console.error("Fetch History Error:", err);
    } finally {
        loading.value = false; 
    }
};

const totalPages = computed(() => Math.ceil(historyList.value.length / itemsPerPage));
const paginatedHistory = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    return historyList.value.slice(start, start + itemsPerPage);
});

const changePage = (page) => {
    currentPage.value = page;
    // เลื่อนขึ้นด้านบนของพื้นที่ Scroll (คือ CustomScroll ใน MainLayout)
    const scrollContainer = document.querySelector('.custom-scroll-wrapper');
    if (scrollContainer) {
        scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

const goToDetail = (id) => {
    router.push(`/app/approvals/${id}`);
};

const formatDate = (dateStr) => {
    if(!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleString('th-TH', { 
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
        timeZone: 'UTC' 
    });
};

onMounted(() => {
    watch(() => currentUser.value?.id, (newId) => {
        if (newId && userStore.isLoggedIn) {
            fetchHistory();
        }
    }, { immediate: true });
});
</script>
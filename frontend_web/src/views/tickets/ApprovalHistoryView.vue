<template>
  <div class="p-6 font-sans max-w-7xl mx-auto pb-24 transition-colors" :class="isDark ? 'text-gray-300' : 'text-[#444746]'">
    
    <div class="flex justify-between items-end mb-6">
      <div>
        <h2 class="text-3xl font-extrabold tracking-tight transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">{{ $t('approval_history.title') }}</h2>
        <p class="text-sm mt-1 transition-colors" :class="isDark ? 'text-gray-400' : 'text-[#727775]'">{{ $t('approval_history.subtitle') }}</p>
      </div>
      <button v-on:click="fetchHistory" class="p-2.5 rounded-xl transition-all border shadow-sm active:scale-95 flex items-center gap-2"
              :class="isDark ? 'text-gray-400 hover:text-white bg-[#1A1C1E] border-white/10 hover:bg-[#282A2C]' : 'text-[#727775] hover:text-[#1f1f1f] bg-white border-gray-200 hover:bg-gray-50'">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>

    <div class="rounded-2xl shadow-xl border relative min-h-[400px] mb-6 overflow-hidden transition-all"
         :class="isDark ? 'bg-[#1A1C1E] border-white/10' : 'bg-white border-[rgba(0,0,0,0.12)]'">
        
        <div v-if="loading" class="absolute inset-0 z-20 flex flex-col items-center justify-center backdrop-blur-sm transition-colors"
             :class="isDark ? 'bg-[#1A1C1E]/80' : 'bg-white/80'">
            <svg class="animate-spin h-10 w-10 text-blue-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        </div>

        <div class="overflow-x-auto w-full">
          <table class="min-w-full border-collapse text-left">
              <thead class="text-[10px] font-bold uppercase tracking-wider transition-colors"
                     :class="isDark ? 'bg-[#282A2C] text-gray-500' : 'bg-gray-50 text-[#727775]'">
                  <tr>
                      <th class="px-6 py-4 border-b transition-colors" :class="isDark ? 'border-white/5' : 'border-[rgba(0,0,0,0.08)]'">{{ $t('approval_history.col_no') }}</th>
                      <th class="px-6 py-4 border-b transition-colors" :class="isDark ? 'border-white/5' : 'border-[rgba(0,0,0,0.08)]'">{{ $t('approval_history.col_subject') }}</th>
                      <th class="px-6 py-4 border-b transition-colors" :class="isDark ? 'border-white/5' : 'border-[rgba(0,0,0,0.08)]'">{{ $t('approval_history.col_requester') }}</th>
                      <th class="px-6 py-4 border-b text-center transition-colors" :class="isDark ? 'border-white/5' : 'border-[rgba(0,0,0,0.08)]'">{{ $t('approval_history.col_result') }}</th>
                      <th class="px-6 py-4 border-b transition-colors" :class="isDark ? 'border-white/5' : 'border-[rgba(0,0,0,0.08)]'">{{ $t('approval_history.col_date') }}</th>
                      <th class="px-6 py-4 border-b text-right transition-colors" :class="isDark ? 'border-white/5' : 'border-[rgba(0,0,0,0.08)]'">{{ $t('approval_history.col_view') }}</th>
                  </tr>
              </thead>
              <tbody class="text-sm">
                  <tr v-for="item in paginatedHistory" v-bind:key="item.ticket_id" 
                      class="transition-all border-b group"
                      :class="[
                           isDark ? 'hover:bg-white/[0.02] border-white/5' : 'hover:bg-blue-50/30 border-[rgba(0,0,0,0.04)]',
                           'last:border-0'
                      ]"
                  >
                      <td class="px-6 py-4 font-mono text-blue-500 text-[10px] font-bold cursor-pointer hover:underline" v-on:click="goToDetail(item.ticket_id)">{{ item.ticket_no }}</td>
                      <td class="px-6 py-4"><div class="font-bold transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">{{ item.subject }}</div></td>
                      <td class="px-6 py-4"><div class="font-bold transition-colors" :class="isDark ? 'text-gray-300' : 'text-[#444746]'">{{ item.requester_name }}</div></td>
                      <td class="px-6 py-4 text-center">
                          <span class="px-2.5 py-0.5 inline-flex text-[10px] leading-4 font-bold rounded-full uppercase border"
                              v-bind:class="item.approval_status === 'APPROVED' ? (isDark ? 'text-green-400 border-green-500/20 bg-green-500/10' : 'text-green-600 border-green-200 bg-green-50') : (isDark ? 'text-red-400 border-red-500/20 bg-red-500/10' : 'text-red-600 border-red-200 bg-red-50')">
                              {{ item.approval_status === 'APPROVED' ? $t('approval_history.status_approved') : $t('approval_history.status_rejected') }}
                          </span>
                      </td>
                      <td class="px-6 py-4 text-[10px] font-bold transition-colors" :class="isDark ? 'text-gray-400' : 'text-[#727775]'">{{ formatDate(item.approved_at) }}</td>
                      <td class="px-6 py-4 text-right">
                          <button v-on:click="goToDetail(item.ticket_id)" class="p-2 transition-colors rounded-lg active:scale-95 flex items-center justify-end w-full"
                                  :class="isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-[#727775] hover:text-[#1f1f1f] hover:bg-gray-50'">
                              <svg class="w-5 h-5 mx-0 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          </button>
                      </td>
                  </tr>
              </tbody>
          </table>
        </div>

        <div v-if="!loading && historyList.length === 0" class="p-12 text-center flex flex-col items-center transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">
            <div class="w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors shadow-inner"
                 :class="isDark ? 'bg-[#282A2C]' : 'bg-gray-100'">
                <svg class="w-8 h-8 transition-colors" :class="isDark ? 'text-gray-600' : 'text-gray-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            </div>
            <p class="font-bold text-sm">{{ $t('approval_history.no_data') }}</p>
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
import { useI18n } from 'vue-i18n';
import Pagination from '../../components/Pagination.vue'; 
import { useTheme } from '@/composables/useTheme';

const { isDark } = useTheme();

const { proxy } = getCurrentInstance();
const $api = proxy.$api; 
const userStore = useUserStore();
const { t } = useI18n();
const router = useRouter();
const route = useRoute();

const historyList = ref([]);
const loading = ref(false); 
const currentUser = computed(() => userStore.userProfile);

const currentPage = ref(Number(route.query.page) || 1);
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
            // ไม่ reset currentPage เพื่อให้คงหน้าที่เลือกไว้
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
    router.replace({ query: { ...route.query, page } });
    const scrollContainer = document.querySelector('.custom-scroll-wrapper');
    if (scrollContainer) {
        scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

const goToDetail = (id) => {
    router.push({ query: { ...route.query, page: currentPage.value } });
    router.push(`/app/approvals/${id}`);
};

const formatDate = (dateStr) => {
    if(!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleString('th-TH', { 
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
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
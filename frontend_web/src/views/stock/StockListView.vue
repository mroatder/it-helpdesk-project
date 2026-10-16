<template>
  <div class="p-6 font-sans max-w-7xl mx-auto pb-8 transition-colors" :class="isDark ? 'text-gray-300' : 'text-[#444746]'">
    
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
      <div>
        <h2 class="text-2xl font-bold tracking-wide flex items-center gap-2 transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
          {{ $t('stock_list.title') }}
        </h2>
        <p class="text-sm mt-1 transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ $t('stock_list.subtitle', { count: stocks.length }) }}</p>
      </div>

      <div class="flex flex-col md:flex-row items-center gap-3 flex-1 justify-end">
        <div class="w-full md:w-64 relative group">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-4 w-4 transition-colors" :class="isDark ? 'text-gray-500 group-focus-within:text-orange-400' : 'text-[#727775] group-focus-within:text-orange-500'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <input 
            v-model="searchQuery" 
            type="text" 
            :placeholder="$t('stock_list.search_placeholder')" 
            class="w-full text-sm rounded-lg border transition-all outline-none pl-10 p-2.5 shadow-sm"
            :class="isDark 
              ? 'bg-[#1A1C1E] text-gray-200 border-white/10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 placeholder-gray-600 hover:border-white/20' 
              : 'bg-white text-[#1f1f1f] border-[rgba(0,0,0,0.12)] focus:border-orange-500 focus:ring-1 focus:ring-orange-500 placeholder-[#727775] hover:border-[rgba(0,0,0,0.24)]'"
          >
        </div>

        <button 
          @click="openModal()" 
          class="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-green-900/10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
          {{ $t('stock_list.add_item') }}
        </button>
      </div>
    </div>

    <div class="bg-transparent rounded-xl border overflow-hidden shadow-lg mb-6 transition-colors"
         :class="isDark ? 'border-gray-700 bg-[#1e2327] shadow-black/50' : 'border-[rgba(0,0,0,0.08)] bg-white'">
      <table class="w-full text-left text-sm">
        <thead class="font-bold uppercase text-xs tracking-wider border-b transition-colors"
               :class="isDark ? 'bg-[#161a1d] text-gray-400 border-gray-700' : 'bg-gray-50 text-[#727775] border-[rgba(0,0,0,0.06)]'">
          <tr>
            <th class="px-6 py-4">{{ $t('stock_list.col_name') }}</th>
            <th class="px-6 py-4 text-center">{{ $t('stock_list.col_qty') }}</th>
            <th class="px-6 py-4 text-center">{{ $t('stock_list.col_min') }}</th>
            <th class="px-6 py-4 text-center">{{ $t('stock_list.col_status') }}</th>
            <th class="px-6 py-4 text-right">{{ $t('stock_list.col_action') }}</th>
          </tr>
        </thead>
        <tbody class="divide-y transition-colors" :class="isDark ? 'divide-gray-800' : 'divide-[rgba(0,0,0,0.06)]'">
          <tr v-if="loading">
             <td colspan="5" class="px-6 py-12 text-center text-gray-500">{{ $t('stock_list.loading') }}</td>
          </tr>
          <tr v-else-if="paginatedStocks.length === 0">
             <td colspan="5" class="px-6 py-12 text-center text-gray-500">{{ $t('stock_list.no_data') }}</td>
          </tr>
          <tr v-else v-for="item in paginatedStocks" :key="item.part_id" class="transition-colors" :class="isDark ? 'hover:bg-[#252a30]' : 'hover:bg-gray-50'">
            
            <td class="px-6 py-4 font-medium transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">
               {{ item.part_name }}
            </td>

            <td class="px-6 py-4 text-center">
               <span :class="`font-mono font-bold ${item.qty_on_hand <= item.min_stock ? 'text-red-400' : 'text-green-400'}`">
                 {{ item.qty_on_hand }}
               </span>
            </td>

            <td class="px-6 py-4 text-center text-gray-500">
               {{ item.min_stock }}
            </td>

            <td class="px-6 py-4 text-center">
               <span v-if="item.qty_on_hand === 0" 
                     class="text-[10px] px-2 py-1 rounded border transition-colors"
                     :class="isDark ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-50 text-red-700 border-red-100'">
                 {{ $t('stock_list.status_out') }}
               </span>
               <span v-else-if="item.qty_on_hand <= item.min_stock" 
                     class="text-[10px] px-2 py-1 rounded border transition-colors"
                     :class="isDark ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-yellow-50 text-yellow-700 border-yellow-100'">
                 {{ $t('stock_list.status_low') }}
               </span>
               <span v-else 
                     class="text-[10px] px-2 py-1 rounded border transition-colors"
                     :class="isDark ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-green-50 text-green-700 border-green-100'">
                 {{ $t('stock_list.status_normal') }}
               </span>
            </td>

            <td class="px-6 py-4 text-right flex items-center justify-end gap-2">
               <button @click="openModal(item)" 
                       class="p-2 border rounded-lg transition-all duration-200 shadow-sm" 
                       :class="isDark 
                         ? 'bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white hover:border-blue-500' 
                         : 'bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white hover:border-blue-600'" 
                       :title="$t('button.edit')">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
               </button>
               <button @click="deleteStock(item.part_id)" 
                       class="p-2 border rounded-lg transition-all duration-200 shadow-sm" 
                       :class="isDark 
                         ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500' 
                         : 'bg-red-50 border-red-100 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600'" 
                       :title="$t('button.delete')">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
               </button>
            </td>

          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination Bar -->
    <div v-if="filteredStocks.length > 0" class="flex justify-center mt-6">
      <Pagination 
        :current-page="currentPage"
        :total-pages="totalPages"
        @page-changed="changePage"
      />
    </div>

    <!-- Modal Form (Popup) -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
       <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" @click="closeModal"></div>
       <div class="rounded-xl border shadow-2xl w-full max-w-md overflow-hidden relative z-10 transition-colors"
            :class="isDark ? 'bg-[#282A2C] border-white/10' : 'bg-white border-[rgba(0,0,0,0.12)]'">
          <div class="px-6 py-4 border-b flex justify-between items-center transition-colors"
               :class="isDark ? 'bg-[#1A1C1E] border-white/5' : 'bg-gray-50 border-[rgba(0,0,0,0.08)]'">
             <h3 class="font-bold transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">{{ isEditing ? $t('stock_list.modal_title_edit') : $t('stock_list.modal_title_add') }}</h3>
             <button @click="closeModal" class="p-1 rounded-full transition-colors" :class="isDark ? 'text-gray-500 hover:text-white hover:bg-white/10' : 'text-[#727775] hover:text-[#1f1f1f] hover:bg-gray-200'"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
          </div>
          
          <div class="p-6 space-y-4">
             <div>
                <label class="block text-xs mb-1 font-bold uppercase transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ $t('stock_list.label_name') }}</label>
                <input v-model="form.part_name" type="text" 
                       class="w-full border rounded px-3 py-2 text-sm focus:border-orange-500 focus:outline-none transition-colors"
                       :class="isDark ? 'bg-[#1A1C1E] border-gray-600 text-white' : 'bg-white border-gray-300 text-[#1f1f1f]'">
             </div>
             
             <div class="grid grid-cols-2 gap-4">
                <div>
                   <label class="block text-xs mb-1 font-bold uppercase transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ $t('stock_list.label_qty') }}</label>
                   <input v-model.number="form.qty_on_hand" type="number" 
                          class="w-full border rounded px-3 py-2 text-sm focus:border-orange-500 focus:outline-none transition-colors"
                          :class="isDark ? 'bg-[#1A1C1E] border-gray-600 text-white' : 'bg-white border-gray-300 text-[#1f1f1f]'">
                </div>
                <div>
                   <label class="block text-xs mb-1 font-bold uppercase transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ $t('stock_list.label_min') }}</label>
                   <input v-model.number="form.min_stock" type="number" 
                          class="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-orange-500 focus:outline-none transition-colors"
                          :class="isDark ? 'bg-[#1A1C1E] border-gray-600 text-white' : 'bg-white border-gray-300 text-[#1f1f1f]'">
                </div>
             </div>
          </div>

          <div class="px-6 py-4 border-t flex justify-end gap-2 transition-colors"
               :class="isDark ? 'bg-[#1A1C1E]/50 border-white/5' : 'bg-gray-50 border-[rgba(0,0,0,0.08)]'">
             <button @click="closeModal" class="px-4 py-2 transition-colors text-sm" :class="isDark ? 'text-gray-400 hover:text-white' : 'text-[#727775] hover:text-[#1f1f1f]'">{{ $t('stock_list.btn_cancel') }}</button>
             <button @click="saveStock" class="px-6 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-orange-900/20" :disabled="submitting">
                <svg v-if="submitting" class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                {{ $t('stock_list.btn_save') }}
             </button>
          </div>
       </div>
    </div>

  </div>
</template>
<script setup>
import { ref, onMounted, computed, reactive, watch, inject, getCurrentInstance } from 'vue'; 
import Pagination from '../../components/Pagination.vue';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router'; 
import { useUserStore } from '@/stores/userStore'; 
import { useModalStore } from '@/stores/modalStore'; 
import { useTheme } from '@/composables/useTheme';

const { isDark } = useTheme();
// --- 1. INITIALIZE CORE ---
const { proxy } = getCurrentInstance(); 
const $api = proxy.$api; 
const userStore = useUserStore();
const modal = useModalStore();
const router = useRouter();
const route = useRoute();
const { t } = useI18n(); 

const stocks = ref([]);
const loading = ref(true); // เปลี่ยนเป็น true เริ่มต้นเพื่อรอเช็คสิทธิ์
const searchQuery = ref('');

// Sidebar state injection
const isCollapsed = inject('isCollapsed', ref(false));
// --- 2. 🛡️ SECURITY: CHECK ACCESS ---
const checkAccess = async () => {
    // ดึงค่า role และแปลงเป็นตัวใหญ่เพื่อเช็ค 'ADMIN'
    const role = userStore.userProfile?.role?.toUpperCase();
    if (role !== 'ADMIN') {
        if (modal) {
            await modal.alert(
                t('ticket_detail.access_denied_msg'), 
                t('ticket_detail.access_denied_title'), 
                "error"
            );
        }
        router.push('/app/dashboard'); 
        return false;
    }
    return true;
};

// --- 3. STATE & MODAL ---
const showModal = ref(false);
const isEditing = ref(false);
const submitting = ref(false);
const form = reactive({
    part_id: null,
    part_name: '',
    qty_on_hand: 0,
    min_stock: 0
});

// Pagination States
const currentPage = ref(Number(route.query.page) || 1);
const itemsPerPage = 10; 

// Reset Pagination on Search
watch(searchQuery, () => { currentPage.value = 1; });

// Computed: Filter
const filteredStocks = computed(() => {
    if (!searchQuery.value) return stocks.value;
    const lower = searchQuery.value.toLowerCase();
    return stocks.value.filter(s => s.part_name.toLowerCase().includes(lower));
});

// Computed: Pagination
const totalPages = computed(() => Math.ceil(filteredStocks.value.length / itemsPerPage));
const paginatedStocks = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    return filteredStocks.value.slice(start, start + itemsPerPage);
});

// ✅ Helper สำหรับสร้าง Header
const getAuthOptions = () => {
    const token = userStore.getAuthToken;
    if (!token) return null;
    return { headers: { Authorization: `Bearer ${token}` } };
};

// --- 4. ACTIONS ---

// 📊 Fetch Stocks (GET)
const fetchStocks = async () => {
    if (!$api) return;
    const options = getAuthOptions();
    if (!options) return;
    
    try {
        loading.value = true;
        const res = await $api.get('/stock', options);
        if(res.data.success) {
            stocks.value = res.data.data;
        }
    } catch (err) {
        console.error("Fetch Stocks Error:", err);
        // ถ้าหลังบ้านพ่น 403 (Forbidden) ให้ดีดออกทันที
        if (err.response?.status === 403) {
            router.push('/app/dashboard');
        }
    } finally {
        loading.value = false;
    }
};

const openModal = (item = null) => {
    if (item) {
        isEditing.value = true;
        Object.assign(form, item);
    } else {
        isEditing.value = false;
        Object.assign(form, { part_id: null, part_name: '', qty_on_hand: 0, min_stock: 5 });
    }
    showModal.value = true;
};

const closeModal = () => { showModal.value = false; };

// 💾 Save Stock (PUT/POST)
const saveStock = async () => {
    if(!form.part_name) return modal.alert(t('stock_list.alert_name_required'), t('alert_messages.warning_title'), 'warning');

    const options = getAuthOptions();
    if (!options || !$api) return;
    
    try {
        submitting.value = true;
        if (isEditing.value) {
            await $api.put(`/stock/update/${form.part_id}`, form, options);
        } else {
            await $api.post('/stock/add', form, options);
        }
        await fetchStocks(); 
        closeModal();
    } catch (err) {
        modal.alert(t('stock_list.alert_error_prefix') + (err.message || ''), t('alert_messages.error_title'), 'error');
    } finally {
        submitting.value = false;
    }
};

// 🗑️ Delete Stock
const deleteStock = async (id) => {
    const confirmed = await modal.confirm(t('stock_list.confirm_delete'), t('alert_messages.confirm_title'));
    if(!confirmed) return;
    
    const options = getAuthOptions();
    if (!options || !$api) return;

    try {
        await $api.delete(`/stock/delete/${id}`, options);
        fetchStocks();
    } catch (err) {
        modal.alert(t('stock_list.alert_delete_failed') + (err.message || ''), t('alert_messages.error_title'), 'error');
    }
};

// 🚀 INIT
onMounted(async () => {
    // 🛡️ เช็คสิทธิ์ก่อนดึงข้อมูล
    const hasAccess = await checkAccess();
    if (hasAccess) {
        fetchStocks();
    }
});

const changePage = (page) => { 
    currentPage.value = page; 
    router.replace({ query: { ...route.query, page } });
};
</script>
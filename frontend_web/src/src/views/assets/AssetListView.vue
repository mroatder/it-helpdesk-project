<template>
  <div class="font-sans max-w-7xl mx-auto text-gray-300 pb-24">
    
    <div class="p-6 pb-0 flex flex-col md:flex-row md:justify-between md:items-end mb-5 gap-4">
      <div>
        <h2 class="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          {{ $t('asset_list.title') }}
        </h2>
        <p class="text-sm text-gray-500 mt-1">
          {{ $t('asset_list.subtitle', { filtered: filteredAssets.length, total: assets.length }) }}
        </p>
      </div>
      <button 
        @click="fetchAssets" 
        class="flex items-center gap-2 px-4 py-2 bg-[#282A2C] hover:bg-[#333538] text-gray-300 hover:text-white rounded-lg text-xs font-medium transition-all border border-white/10 shadow-sm"
        :disabled="loading"
      >
        <svg v-if="loading" class="animate-spin h-3.5 w-3.5 text-purple-500" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        {{ loading ? $t('asset_list.updating') : $t('asset_list.refresh') }}
      </button>
    </div>

    <div class="px-6 mb-5 flex flex-col md:flex-row flex-wrap gap-3">
      <div class="flex-1 min-w-[250px] relative group">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="h-4 w-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        <input 
          v-model="searchQuery" 
          type="text" 
          :placeholder="$t('asset_list.search_placeholder')" 
          class="w-full bg-[#1A1C1E] text-gray-200 text-sm rounded-lg border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 pl-10 p-2.5 outline-none transition-all placeholder-gray-600 hover:border-white/20 shadow-sm"
        >
      </div>

      <div class="w-full md:w-44">
        <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-4 w-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
            <select 
              v-model="selectedDept" 
              class="w-full bg-[#1A1C1E] text-gray-200 text-sm rounded-lg border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 pl-10 p-2.5 outline-none transition-all appearance-none cursor-pointer hover:border-white/20 shadow-sm"
            >
              <option value="">{{ $t('asset_list.all_departments') }}</option>
              <option v-for="dept in uniqueDepartments" :key="dept" :value="dept">{{ dept }}</option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>

      <div class="w-full md:w-32">
        <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-4 w-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>
            </div>
            <select 
              v-model="selectedRam" 
              class="w-full bg-[#1A1C1E] text-gray-200 text-sm rounded-lg border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 pl-10 p-2.5 outline-none transition-all appearance-none cursor-pointer hover:border-white/20 shadow-sm"
            >
              <option value="">All RAM</option>
              <option v-for="ram in uniqueRam" :key="ram" :value="ram">{{ ram }} GB</option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>

      <div class="w-full md:w-48">
        <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-4 w-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <select 
              v-model="selectedOs" 
              class="w-full bg-[#1A1C1E] text-gray-200 text-sm rounded-lg border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 pl-10 p-2.5 outline-none transition-all appearance-none cursor-pointer hover:border-white/20 shadow-sm"
            >
              <option value="">All Windows</option>
              <option v-for="os in uniqueOs" :key="os" :value="os">{{ os }}</option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>

      <div class="w-full md:w-48">
        <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-4 w-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <select 
              v-model="selectedFixedAssetFilter" 
              class="w-full bg-[#1A1C1E] text-gray-200 text-sm rounded-lg border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 pl-10 p-2.5 outline-none transition-all appearance-none cursor-pointer hover:border-white/20 shadow-sm"
            >
              <option value="">{{ $t('asset_list.fixed_asset_all') }}</option>
              <option value="has">{{ $t('asset_list.fixed_asset_has') }}</option>
              <option value="none">{{ $t('asset_list.fixed_asset_none') }}</option>
              <option value="leased">{{ $t('asset_list.fixed_asset_leased') }}</option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>
    </div>

    <div v-if="error" class="mx-6 bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6">
        <p class="font-bold">{{ $t('asset_list.error_prefix') }}{{ error }}</p>
    </div>

    <div class="mx-6 bg-[#282A2C] rounded-xl border border-white/5 overflow-hidden shadow-lg">
      <table class="w-full text-left text-sm">
        <thead class="bg-[#1A1C1E] text-gray-400 font-bold uppercase text-xs tracking-wider border-b border-white/5">
          <tr>
            <th class="px-6 py-4 w-[15%]">{{ $t('asset_list.col_hostname') }}</th>
            <th class="px-6 py-4 w-[15%]">{{ $t('asset_list.col_fixed_asset') }}</th>
            <th class="px-6 py-4 w-[15%]">{{ $t('asset_list.col_ip') }}</th>
            <th class="px-6 py-4 w-[20%]">{{ $t('asset_list.col_os') }}</th>
            <th class="px-6 py-4 w-[10%]">{{ $t('asset_list.col_ram') }}</th>
            <th class="px-6 py-4 w-[15%]">{{ $t('asset_list.col_updated') }}</th>
            <th class="px-6 py-4 w-[10%] text-right">{{ $t('asset_list.col_action') }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/5">
          
          <tr v-if="loading && assets.length === 0">
              <td colspan="7" class="px-6 py-12 text-center text-gray-500">{{ $t('asset_list.loading') }}</td>
          </tr>

          <tr v-else-if="paginatedAssets.length === 0">
              <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                <div class="flex flex-col items-center justify-center py-4">
                    <svg class="w-10 h-10 text-gray-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    <p v-if="assets.length > 0">{{ $t('asset_list.no_results') }}</p>
                    <p v-else>{{ $t('asset_list.no_data') }}</p>
                </div>
              </td>
          </tr>
          
          <tr v-else v-for="item in paginatedAssets" :key="item.computer_id" class="hover:bg-[#333538] transition-colors">
            
            <td class="px-6 py-4">
               <p class="font-medium text-white">{{ item.hostname }}</p>
            </td>

            <td class="px-6 py-4">
               <span v-if="item.is_leased" class="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 text-xs font-mono font-semibold">
                  เครื่องเช่า (Lease)
               </span>
               <span v-else class="text-xs text-purple-400 font-mono font-semibold">
                  {{ item.fixed_asset || '-' }}
               </span>
            </td>

            <td class="px-6 py-4">
               <div class="flex items-center gap-1.5 text-blue-400 font-mono text-xs bg-blue-500/10 px-2 py-1 rounded w-fit border border-blue-500/20 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  {{ item.ip_address || '-' }}
               </div>
            </td>

            <td class="px-6 py-4">
               <div class="flex items-center gap-2 mb-1">
                  <svg class="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M0 0h11.377v11.372H0zM12.623 0H24v11.372H12.623zM0 12.623h11.377V24H0zM12.623 12.623H24V24H12.623z"/>
                  </svg>
                  <span class="text-gray-400 text-sm">{{ item.os_version }}</span>
               </div>
            </td>

            <td class="px-6 py-4">
               <span v-if="item.total_ram_gb" class="text-green-400 font-medium text-sm">
                  {{ item.total_ram_gb }} GB
               </span>
               <span v-else class="text-gray-600">-</span>
            </td>

            <td class="px-6 py-4">
               <div class="flex items-center gap-2">
                 <div :class="`w-2 h-2 rounded-full ${isOnline(item.last_updated) ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-gray-600'}`"></div>
                 <span class="text-gray-400 text-xs font-mono">{{ formatDate(item.last_updated) }}</span>
               </div>
            </td>
              <td class="px-6 py-4 text-right flex items-center justify-end gap-3">
                <button 
                  @click="goToDetail(item.computer_id)" 
                  class="text-blue-400 hover:text-blue-300 text-xs font-medium hover:underline transition-all px-2 py-1"
                >
                  {{ $t('asset_list.view_detail') }}
                </button>
              
                <button 
                  @click="handleDelete(item.computer_id, item.hostname)"
                  class="group p-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500 rounded-lg transition-all duration-200 shadow-sm"
                  :title="$t('asset_list.delete_confirm_title')"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" 
                    class="h-5 w-5 text-red-500 group-hover:text-white transition-colors" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                    />
                  </svg>
                </button>
              </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="filteredAssets.length > 0" 
         class="fixed bottom-0 right-0 z-40 p-4 flex justify-center transition-all duration-300" 
         :style="fixedFooterStyles">
      <Pagination 
        :current-page="currentPage"
        :total-pages="totalPages"
        @page-changed="changePage"
      />
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, inject, getCurrentInstance } from 'vue';
import { useRouter } from 'vue-router';
import Pagination from '../../components/Pagination.vue';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '@/stores/userStore';
import { useModalStore } from '@/stores/modalStore';

const { proxy } = getCurrentInstance();
const $api = proxy.$api; 
const userStore = useUserStore();
const modal = useModalStore();

const { t } = useI18n(); 

// State
const assets = ref([]);
const loading = ref(true);
const error = ref(null);
const router = useRouter();

// Sidebar state injection
const isCollapsed = inject('isCollapsed', ref(false));

// Filter States
const searchQuery = ref('');
const selectedDept = ref('');
const selectedRam = ref(''); // New
const selectedOs = ref('');   // New
const selectedFixedAssetFilter = ref(''); // New

// Pagination States
const currentPage = ref(1);
const itemsPerPage = 10; 

// --- 🛡️ 4. เพิ่มฟังก์ชันเช็คสิทธิ์ (จุดที่ทำให้ Alert ขึ้น) ---
const checkAccess = async () => {
    // รอเผื่อ Profile ยังไม่โหลด (กรณี Refresh หน้าจอ)
    if (!userStore.userProfile) {
        await new Promise(resolve => setTimeout(resolve, 300));
    }

    const role = userStore.userProfile?.role?.toUpperCase();

    if (role !== 'ADMIN') {
        loading.value = false; // หยุด loading หน้าจอจะได้ไม่เทา
        if (modal) {
            // 🚨 แสดง Alert แจ้งเตือน
            await modal.alert(
                t('ticket_detail.access_denied_msg'), 
                t('ticket_detail.access_denied_title'), 
                "error"
            );
        }
        router.push('/app/dashboard'); // ดีดออก
        return false;
    }
    return true;
};

// Dynamic Footer Styles
const fixedFooterStyles = computed(() => ({
    left: isCollapsed.value ? '80px' : '288px',
    width: isCollapsed.value ? 'calc(100% - 80px)' : 'calc(100% - 288px)',
}));

// Reset Pagination when any filter changes
watch([searchQuery, selectedDept, selectedRam, selectedOs, selectedFixedAssetFilter], () => {
    currentPage.value = 1;
});

// Computed: Dropdown แผนก
const uniqueDepartments = computed(() => {
    const depts = assets.value
        .map(a => a.department)
        .filter(d => d); 
    return [...new Set(depts)].sort(); 
});

// Computed: Dropdown RAM
const uniqueRam = computed(() => {
    const rams = assets.value
        .map(a => a.total_ram_gb)
        .filter(r => r); 
    return [...new Set(rams)].sort((a, b) => a - b); 
});

// Computed: Dropdown OS
const uniqueOs = computed(() => {
    const oss = assets.value
        .map(a => a.os_version)
        .filter(o => o); 
    return [...new Set(oss)].sort(); 
});

// Computed: Filter Logic (Updated)
const filteredAssets = computed(() => {
    return assets.value.filter(item => {
        const searchLower = searchQuery.value.toLowerCase();
        
        // 1. Search Box Filter
        const matchesSearch = 
            !searchQuery.value ||
            (item.hostname && item.hostname.toLowerCase().includes(searchLower)) ||
            (item.ip_address && item.ip_address.includes(searchLower)) ||
            (item.serial_number && item.serial_number.toLowerCase().includes(searchLower));

        // 2. Department Filter
        const matchesDept = 
            !selectedDept.value || 
            item.department === selectedDept.value;

        // 3. RAM Filter
        const matchesRam = 
            !selectedRam.value || 
            item.total_ram_gb === Number(selectedRam.value);

        // 4. OS Filter
        const matchesOs = 
            !selectedOs.value || 
            item.os_version === selectedOs.value;

        // 5. Fixed Asset Filter
        let matchesFixedAsset = true;
        if (selectedFixedAssetFilter.value === 'has') {
            matchesFixedAsset = !!(item.fixed_asset && item.fixed_asset.trim()) && !item.is_leased;
        } else if (selectedFixedAssetFilter.value === 'none') {
            matchesFixedAsset = !(item.fixed_asset && item.fixed_asset.trim()) && !item.is_leased;
        } else if (selectedFixedAssetFilter.value === 'leased') {
            matchesFixedAsset = !!item.is_leased;
        }

        return matchesSearch && matchesDept && matchesRam && matchesOs && matchesFixedAsset;
    });
});

// ✅ เพิ่มฟังก์ชัน handleDelete ต่อจาก goToDetail (ประมาณบรรทัดที่ 270)
const handleDelete = async (id, hostname) => {
    // 1. แสดงหน้าต่างยืนยัน (ใช้ ModalStore ที่มีอยู่)
    const confirmed = await modal.confirm(
        t('asset_list.delete_confirm_msg', { name: hostname }), // "คุณแน่ใจหรือไม่ที่จะลบ {hostname}?"
        t('asset_list.delete_confirm_title'), // "ยืนยันการลบ"
        'warning'
    );

    if (!confirmed) return;

    const options = getAuthOptions();
    if (!options) return;

    try {
        loading.value = true;
        // 2. ยิง API DELETE ไปที่ Backend
        const res = await $api.delete(`/inventory/${id}`, options);
        
        if (res.data && res.data.success) {
            // 3. แสดง Alert สำเร็จ
            await modal.alert(
                t('asset_list.delete_success_msg'), 
                t('asset_list.delete_success_title'), 
                'success'
            );
            // 4. Refresh ข้อมูลใหม่
            await fetchAssets();
        }
    } catch (err) {
        console.error("Delete Error:", err);
        modal.alert(
            err.response?.data?.message || t('asset_list.delete_error'), 
            'Error', 
            'error'
        );
    } finally {
        loading.value = false;
    }
};

// Computed: Total Pages
const totalPages = computed(() => {
    return Math.ceil(filteredAssets.value.length / itemsPerPage);
});

// Computed: Slice Data
const paginatedAssets = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredAssets.value.slice(start, end);
});

// Function เปลี่ยนหน้า
const changePage = (page) => {
    currentPage.value = page;
};

const formatDate = (dateVal) => {
    if (!dateVal) return '-';
    const date = new Date(dateVal);
    return date.toLocaleString('th-TH', { 
        timeZone: 'UTC', 
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
};

const isOnline = (dateVal) => {
    if (!dateVal) return false;
    const lastUpdate = new Date(dateVal);
    const now = new Date();
    const diffTime = Math.abs(now - lastUpdate);
    return diffTime < (1.5 * 60 * 60 * 1000); 
};

const goToDetail = (id) => {
  router.push(`/app/assets/${id}`);
};

// Helper function สำหรับสร้าง Header
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

const fetchAssets = async () => {
    if (!$api) return;
    const options = getAuthOptions();
    if (!options) return;

    try {
        loading.value = true;
        const res = await $api.get('/inventory', options);
        if (res.data && res.data.success) {
            assets.value = res.data.data;
        }
    } catch (err) {
        console.error("Fetch Error:", err);
        // ถ้า API พ่น 403 (โดนบล็อกจาก Backend) ให้ดีดออกเช่นกัน
        if (err.response?.status === 403) router.push('/app/dashboard');
    } finally {
        loading.value = false;
    }
};

onMounted(async () => {
    const hasAccess = await checkAccess(); // เช็คสิทธิ์ก่อน
    if (hasAccess) {
        await fetchAssets(); // ถ้าผ่านค่อยดึงข้อมูล
    }
});
</script>
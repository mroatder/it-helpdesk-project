<template>
  <div class="p-6 font-sans max-w-full mx-auto pb-24">
    
    <div class="flex flex-col 2xl:flex-row justify-between items-start 2xl:items-end mb-6 gap-4">
        <div>
            <h2 class="text-3xl font-bold text-white tracking-tight mb-2">
            {{ $t('user_manage.title') }}
            </h2>
            <p class="text-gray-400 text-sm">{{ $t('user_manage.subtitle') }}</p>
        </div>

        <div class="flex flex-col xl:flex-row gap-3 w-full 2xl:w-auto">
            <div class="flex flex-1 gap-3">
                <div class="relative flex-1 min-w-[220px]">
                    <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </span>
                    <input type="text" v-model="searchText" :placeholder="$t('user_manage.search_placeholder')" class="w-full bg-[#282A2C] text-white pl-9 p-2.5 rounded-lg border border-white/10 focus:ring-2 focus:ring-blue-500 focus:bg-[#333] transition-all placeholder-gray-500 text-sm shadow-sm">
                </div>
                <select v-model="filterRole" class="bg-[#282A2C] text-white p-2.5 rounded-lg border border-white/10 focus:ring-2 focus:ring-blue-500 text-sm cursor-pointer hover:bg-[#333] w-[140px] shadow-sm">
                    <option value="">{{ $t('user_manage.filter_role') }}</option>
                    <option value="ADMIN">{{ $t('user_manage.role_admin') }}</option>
                    <option value="USER">{{ $t('user_manage.role_user') }}</option>
                </select>
            </div>

            <div class="flex items-center gap-2 shrink-0 self-end xl:self-auto">
                <button @click="openImportModal" class="bg-green-600 hover:bg-green-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-green-500/20 whitespace-nowrap">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                    {{ $t('user_manage.btn_import') }}
                </button>

                <button @click="openDeptModal" class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/20 whitespace-nowrap">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    <span class="hidden sm:inline">{{ $t('user_manage.btn_manager') }}</span>
                    <span class="sm:hidden">Manager</span>
                </button>

                <button @click="syncUsersFromAD" class="text-gray-400 hover:text-white p-2.5 rounded-lg hover:bg-white/5 transition-colors border border-white/10 bg-[#282A2C]" :title="$t('user_manage.btn_refresh')" :disabled="loading">
                    <svg :class="{'animate-spin': loading}" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </button>
            </div>
        </div>
    </div>

    <div class="w-full flex justify-start 2xl:justify-center overflow-x-auto custom-scrollbar px-6">
        <div class="bg-[#282A2C] rounded-xl overflow-hidden shadow-xl border border-white/5 flex flex-col relative min-h-[400px] w-fit h-fit">
            <div v-if="loading" class="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#282A2C]/80 backdrop-blur-sm rounded-xl">
                <svg class="animate-spin h-10 w-10 text-blue-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <span class="text-sm text-gray-300">{{ $t('user_manage.loading') }}</span>
            </div>

            <table class="w-auto min-w-[1000px] divide-y divide-white/5 text-left">
                <thead class="bg-[#1A1C1E] text-gray-400 text-xs uppercase font-semibold tracking-wider">
                    <tr>
                        <th class="px-6 py-4 w-24 cursor-pointer hover:text-white transition-colors" @click="sortUsers('user_id')">{{ $t('user_manage.col_id') }}</th>
                        <th class="px-6 py-4 min-w-[200px] cursor-pointer hover:text-white" @click="sortUsers('full_name')">{{ $t('user_manage.col_name') }}</th>
                        <th class="px-6 py-4 min-w-[180px] cursor-pointer hover:text-white" @click="sortUsers('department')">{{ $t('user_manage.col_dept') }}</th>
                        <th class="px-6 py-4 w-28 cursor-pointer hover:text-white" @click="sortUsers('role')">{{ $t('user_manage.col_role') }}</th>
                        <th class="px-6 py-4 w-28 text-center">{{ $t('user_manage.col_rank') }}</th>
                        <th class="px-6 py-4 min-w-[200px]">{{ $t('user_manage.col_manager') }}</th>
                        <th class="px-6 py-4 w-32 text-center">{{ $t('user_manage.col_status') }}</th>
                        <th class="px-6 py-4 w-24 text-right">{{ $t('user_manage.col_action') }}</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-white/5 text-sm">
                    <tr v-for="user in paginatedUsers" :key="user.user_id" class="hover:bg-[#333538] transition-colors group">
                        <td class="px-6 py-4 font-mono text-blue-400 text-xs">#{{ user.user_id }}</td>
                        <td class="px-6 py-4">
                            <div class="text-white font-medium">{{ user.full_name }}</div>
                            <div class="text-xs text-gray-500 mt-0.5">{{ user.username }} | {{ user.email }}</div>
                        </td>
                        <td class="px-6 py-4 text-gray-300">
                             <div>{{ user.department || 'N/A' }}</div>
                             <div class="text-[10px] text-gray-500">{{ user.title || '-' }}</div>
                        </td>
                        <td class="px-6 py-4">
                            <span :class="getRoleClasses(user.role)" class="px-2.5 py-0.5 inline-flex text-[10px] leading-4 font-bold rounded-full uppercase border border-opacity-20">
                                {{ user.role }}
                            </span>
                        </td>
                        <td class="px-6 py-4 text-center">
                            <span v-if="user.level_rank && user.level_rank < 99" class="bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded border border-yellow-500/20 font-bold text-[10px]">
                                RANK {{ user.level_rank }}
                            </span>
                            <span v-else class="text-gray-600 opacity-40">-</span>
                        </td>
                        <td class="px-6 py-4">
                             <div v-if="user.manager_id" class="flex flex-col gap-1">
                                <div v-for="(mName, idx) in getManagerNames(user.manager_id)" :key="idx" class="flex items-center gap-2">
                                    <div class="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                                        {{ mName.charAt(0).toUpperCase() }}
                                    </div>
                                    <span class="text-gray-300 text-xs truncate max-w-[150px]">{{ mName }}</span>
                                </div>
                             </div>
                             <span v-else class="text-gray-600 text-xs italic opacity-50">{{ $t('user_manage.no_manager') }}</span>
                        </td>
                        <td class="px-6 py-4 text-center">
                            <span :class="user.is_active ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'" class="px-2.5 py-0.5 inline-flex text-[10px] font-bold rounded-full border">
                                {{ user.is_active ? $t('user_manage.status_active') : $t('user_manage.status_inactive') }}
                            </span>
                        </td>
                        <td class="px-6 py-4 text-right">
                             <button @click="openEditModal(user)" class="text-gray-400 hover:text-blue-400 transition-colors p-2 hover:bg-blue-500/10 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                             </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
    
    <div v-if="totalPages > 0" class="fixed bottom-0 right-0 z-40 p-4 flex justify-center transition-all duration-300 pointer-events-none" :style="fixedFooterStyles">
        <div class="pointer-events-auto drop-shadow-xl">
             <Pagination :current-page="currentPage" :total-pages="totalPages" @page-changed="val => currentPage = val" />
        </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <div class="bg-[#282A2C] rounded-xl border border-white/10 w-full max-w-md shadow-2xl transform transition-all">
            <div class="p-6 border-b border-white/5 flex justify-between items-center">
                <h3 class="text-xl font-bold text-white">{{ $t('user_manage.modal_edit_title') }}</h3>
                <button @click="closeModal" class="text-gray-400 hover:text-white"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
            </div>
            <div class="p-6 space-y-5">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-[10px] uppercase font-bold text-gray-500 mb-1">Full Name</label>
                        <div class="text-white text-sm bg-[#1A1C1E] p-2 rounded border border-white/5 truncate">{{ editingUser.full_name }}</div>
                    </div>
                    <div>
                        <label class="block text-[10px] uppercase font-bold text-gray-500 mb-1">Department</label>
                        <div class="text-white text-sm bg-[#1A1C1E] p-2 rounded border border-white/5 truncate">{{ editingUser.department || '-' }}</div>
                    </div>
                </div>

                <div class="p-3 bg-yellow-500/5 rounded-lg border border-yellow-500/20">
                    <label class="block text-xs font-bold text-yellow-500 mb-2 uppercase tracking-widest">Approval Rank (ระดับสิทธิ์อนุมัติ)</label>
                    <select v-model="editingUser.level_rank" class="w-full bg-[#1A1C1E] text-white p-2 rounded-lg border border-white/10 focus:ring-2 focus:ring-yellow-500 outline-none text-sm">
                        <option :value="1">Rank 1: Japan Manager / Director</option>
                        <option :value="2">Rank 2: Asst. Japan Manager</option>
                        <option :value="3">Rank 3: Department Manager (Thai)</option>
                        <option :value="4">Rank 4: Asst. Manager / Supervisor</option>
                        <option :value="99">Rank 99: Staff (ไม่มีสิทธิ์อนุมัติ)</option>
                    </select>
                </div>

                <div>
                    <label class="block text-xs font-bold text-gray-400 mb-1 uppercase">System Role</label>
                    <select v-model="editingUser.role" class="w-full bg-[#1A1C1E] text-white p-2 rounded-lg border border-white/10 focus:ring-2 focus:ring-blue-500 text-sm">
                        <option value="ADMIN">ADMIN</option>
                        <option value="USER">USER</option>
                    </select>
                </div>
                
                <div>
                    <label class="block text-xs font-bold text-indigo-400 mb-2 uppercase">Assigned Managers</label>
                    <div class="bg-[#1A1C1E] border border-white/10 rounded-lg max-h-[150px] overflow-y-auto custom-scrollbar p-2">
                        <div v-for="m in potentialManagers" :key="m.user_id" class="flex items-center p-2 hover:bg-[#282A2C] rounded cursor-pointer" @click="toggleManagerSelection(m.user_id)">
                            <input type="checkbox" :value="m.user_id" v-model="selectedManagerIds" class="h-4 w-4 rounded border-gray-600 bg-[#333] text-indigo-600" @click.stop>
                            <span class="ml-3 text-sm text-gray-300 select-none">{{ m.full_name }}</span>
                        </div>
                    </div>
                </div>

                <div class="flex items-center gap-3 pt-1">
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" v-model="editingUser.is_active" class="sr-only peer">
                        <div class="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-green-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                        <span class="ml-3 text-sm font-medium text-gray-300">Active Account</span>
                    </label>
                </div>
            </div>
            <div class="p-6 border-t border-white/5 bg-[#232527]/50 flex justify-end gap-3 rounded-b-xl">
                <button @click="closeModal" class="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
                <button @click="saveUser" class="px-6 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all font-bold shadow-lg shadow-blue-600/20">
                    <span v-if="saving">{{ $t('user_manage.btn_saving') }}</span>
                    <span v-else>Save Changes</span>
                </button>
            </div>
        </div>
    </div>

    <div v-if="showDeptModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <div class="bg-[#282A2C] rounded-xl border border-white/10 w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div class="p-6 border-b border-white/5">
                <h3 class="text-xl font-bold text-white flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    {{ $t('user_manage.bulk_title') }}
                </h3>
            </div>
            <div class="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">{{ $t('user_manage.bulk_step1') }}</label>
                    <select v-model="bulkDeptState.selectedDept" class="w-full bg-[#1A1C1E] text-white p-2.5 rounded-lg border border-white/10 focus:ring-2 focus:ring-indigo-500 text-sm">
                        <option value="" disabled>{{ $t('user_manage.bulk_select_dept') }}</option>
                        <option v-for="dept in departments" :key="dept" :value="dept">{{ $t('user_manage.bulk_dept_count', { dept: dept, count: getUsersCountInDept(dept) }) }}</option>
                    </select>
                </div>

                <div v-if="bulkDeptState.selectedDept">
                    <label class="block text-sm font-medium text-indigo-400 mb-2">{{ $t('user_manage.bulk_step2') }}</label>
                    <div class="bg-[#1A1C1E] border border-white/10 rounded-lg max-h-[150px] overflow-y-auto custom-scrollbar p-2">
                        <div v-for="m in potentialManagers" :key="m.user_id" class="flex items-center p-2 hover:bg-[#282A2C] rounded cursor-pointer">
                            <input type="checkbox" :value="m.user_id" v-model="bulkDeptState.selectedManagers" class="h-4 w-4 rounded bg-[#333] text-indigo-500 mr-3">
                            <span class="text-sm text-gray-300">{{ m.full_name }} <span class="text-xs text-gray-500">({{ m.title || 'Manager' }})</span></span>
                        </div>
                    </div>
                </div>

            </div>
            <div class="p-6 border-t border-white/5 bg-[#232527]/50 flex justify-end gap-3 rounded-b-xl">
                <button @click="closeDeptModal" class="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors">{{ $t('user_manage.btn_cancel') }}</button>
                <button @click="saveBulkDeptManagers" :disabled="!isBulkValid || saving" class="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all shadow-lg shadow-indigo-600/20">
                    <span v-if="saving">{{ $t('user_manage.btn_saving') }}</span>
                    <span v-else>{{ $t('user_manage.bulk_confirm') }}</span>
                </button>
            </div>
        </div>
    </div>

    <div v-if="showImportModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <div class="bg-[#282A2C] rounded-xl border border-white/10 w-full max-w-2xl shadow-2xl flex flex-col max-h-[80vh]">
            <div class="p-6 border-b border-white/5">
                <h3 class="text-xl font-bold text-white flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                    {{ $t('user_manage.modal_import_title') }}
                </h3>
            </div>
            <div class="p-6 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
                <div class="flex gap-2">
                    <input v-model="importSearchText" @keyup.enter="searchAD" type="text" :placeholder="$t('user_manage.import_placeholder')" class="flex-1 bg-[#1A1C1E] text-white p-2.5 rounded-lg border border-white/10 focus:ring-2 focus:ring-green-500 outline-none">
                    <button @click="searchAD" :disabled="searchingAD || importSearchText.length < 3" class="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-500 transition-colors shadow-lg shadow-green-600/20">
                      <span v-if="searchingAD">...</span>
                      <span v-else>{{ $t('user_manage.btn_search') }}</span>
                    </button>
                </div>
                <div v-if="adSearchResults.length > 0" class="space-y-2">
                    <div v-for="u in adSearchResults" :key="u.username" class="bg-[#1A1C1E] p-3 rounded-lg border border-white/5 flex justify-between items-center group hover:border-green-500/50 transition-all">
                        <div>
                          <div class="text-white font-bold">{{ u.full_name }}</div>
                          <div class="text-xs text-gray-500">{{ u.department }} | {{ u.title }}</div>
                        </div>
                        <button @click="importUser(u)" class="text-xs bg-white/10 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors">{{ $t('user_manage.btn_import') }}</button>
                    </div>
                </div>
            </div>
            <div class="p-6 border-t border-white/5 bg-[#232527]/50 flex justify-end">
                <button @click="closeImportModal" class="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">{{ $t('user_manage.btn_close') }}</button>
            </div>
        </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, inject, getCurrentInstance } from 'vue';
import { useModalStore } from '@/stores/modalStore';
import Pagination from '../../components/Pagination.vue';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '@/stores/userStore';

const { proxy } = getCurrentInstance(); 
const $api = proxy.$api; 
const userStore = useUserStore();

const { t } = useI18n(); 
const isCollapsed = inject('isCollapsed', ref(false));

const users = ref([]);
const loading = ref(false);
const saving = ref(false);
const searchText = ref('');
const filterRole = ref('');
const sortKey = ref('user_id');
const sortOrder = ref('asc');

const modalStore = useModalStore();

// Modals State
const showModal = ref(false);
const showDeptModal = ref(false);
const showImportModal = ref(false);

// Edit & Import State
const editingUser = ref({});
const selectedManagerIds = ref([]); 
const importSearchText = ref('');
const adSearchResults = ref([]);
const searchingAD = ref(false);

// Bulk & Mapping State
const bulkDeptState = ref({ 
    selectedDept: '', 
    selectedManagers: [], 
    selectedUserIds: [] 
});

const currentPage = ref(1);
const itemsPerPage = 9;

// ✅ Sync Search & Pagination
watch([searchText, filterRole], () => {
    currentPage.value = 1;
});

// ✅ Dynamic Styles
const fixedFooterStyles = computed(() => ({
    left: isCollapsed.value ? '80px' : '288px',
    width: isCollapsed.value ? 'calc(100% - 80px)' : 'calc(100% - 288px)',
}));

const getAuthOptions = () => {
    const token = userStore.getAuthToken;
    if (!token) return null;
    return { headers: { Authorization: `Bearer ${token}` } };
};

// --- API ACTIONS ---

// ✅ Sequential Bulk Assign (Fix 500 error & Missing managers for new users)
const saveBulkDeptManagers = async () => {
    if (!bulkDeptState.value.selectedDept || bulkDeptState.value.selectedManagers.length === 0) {
        return modalStore.alert(t('user_manage.select_manager_first'), t('user_manage.error_title'), 'error');
    }

    saving.value = true;
    const options = getAuthOptions();
    if (!options || !$api) return;

    const uniqueMgrIds = [...new Set(bulkDeptState.value.selectedManagers)];
    const managerIdStr = uniqueMgrIds.join(',');

    try {
        // 1. Update Department Template Template
        await $api.post('/users/department-manager', {
            department_name: bulkDeptState.value.selectedDept,
            manager_id: managerIdStr
        }, options);

        // 2. Update Current Employees in Dept (Sequential to avoid SQL Locks)
        const finalUserIds = usersInSelectedDept.value.map(u => u.user_id);
        
        for (const userId of finalUserIds) {
            const userObj = users.value.find(u => u.user_id === userId);
            await $api.post('/users/update', {
                user_id: userId,
                role: userObj?.role || 'USER',
                manager_id: managerIdStr,
                is_active: userObj ? userObj.is_active : true,
                level_rank: userObj?.level_rank || 99 // Keep existing rank
            }, options);
        }

        modalStore.alert(t('user_manage.alert_save_success'), t('user_manage.success_title'), 'success');
        closeDeptModal();
        fetchUsers();
    } catch (error) {
        console.error("Bulk Mapping Error:", error);
        modalStore.alert(t('user_manage.alert_error_prefix') + (error.response?.data?.message || error.message), t('user_manage.error_title'), 'error');
    } finally {
        saving.value = false;
    }
};

// ✅ Save User Individual (Support Rank)
const saveUser = async () => {
    saving.value = true;
    if (!$api) return;
    const options = getAuthOptions();
    if (!options) { saving.value = false; return; }

    try {
        const uniqueMgrIds = [...new Set(selectedManagerIds.value)];
        const managerIdStr = uniqueMgrIds.length > 0 ? uniqueMgrIds.join(',') : null;

        const response = await $api.post('/users/update', {
            user_id: editingUser.value.user_id,
            role: editingUser.value.role,
            manager_id: managerIdStr,
            is_active: editingUser.value.is_active,
            level_rank: editingUser.value.level_rank || 99 // ✅ New Rank Param
        }, options);
        
        if (response.data.success) {
            fetchUsers();
            closeModal();
            modalStore.alert(t('user_manage.alert_save_success'), t('user_manage.success_title'), 'success');
        }
    } catch (error) {
        modalStore.alert(t('user_manage.alert_error_prefix') + (error.response?.data?.message || error.message), t('user_manage.error_title'), 'error');
    } finally { saving.value = false; }
};

// --- HELPERS ---
const getManagerNames = (managerIdStr) => {
    if (!managerIdStr) return [];
    const ids = String(managerIdStr).split(',').map(id => parseInt(id));
    return ids.map(id => {
        const m = users.value.find(u => u.user_id === id);
        return m ? m.full_name : 'Unknown';
    });
};

const getUsersCountInDept = (dept) => users.value.filter(u => u.department === dept).length;
const departments = computed(() => [...new Set(users.value.map(u => u.department).filter(d => d && d.trim() !== ''))].sort());
const potentialManagers = computed(() => users.value.filter(u => 
    (u.title && (u.title.toLowerCase().includes('manager') || u.title.toLowerCase().includes('director'))) || 
    (u.role && u.role.toUpperCase().includes('MANAGER'))
));
const usersInSelectedDept = computed(() => users.value.filter(u => u.department === bulkDeptState.value.selectedDept));
const isBulkValid = computed(() => bulkDeptState.value.selectedDept && bulkDeptState.value.selectedManagers.length > 0);

// --- MODAL CONTROLS ---
const openEditModal = (user) => {
    editingUser.value = { ...user };
    // Init rank if null
    if (!editingUser.value.level_rank) editingUser.value.level_rank = 99;
    selectedManagerIds.value = user.manager_id ? String(user.manager_id).split(',').map(Number) : [];
    showModal.value = true;
};
const closeModal = () => { showModal.value = false; editingUser.value = {}; selectedManagerIds.value = []; };
const openDeptModal = () => { bulkDeptState.value = { selectedDept: '', selectedManagers: [], selectedUserIds: [] }; showDeptModal.value = true; };
const closeDeptModal = () => showDeptModal.value = false;
const openImportModal = () => { showImportModal.value = true; importSearchText.value = ''; adSearchResults.value = []; };
const closeImportModal = () => showImportModal.value = false;

const toggleManagerSelection = (managerId) => {
    const index = selectedManagerIds.value.indexOf(managerId);
    if (index === -1) selectedManagerIds.value.push(managerId);
    else selectedManagerIds.value.splice(index, 1);
};

const fetchUsers = async () => {
    loading.value = true;
    if (!$api) return;
    const options = getAuthOptions();
    if (!options) { loading.value = false; return; }
    try {
        const res = await $api.get('/users/list', options);
        if(res.data.success) users.value = res.data.data;
    } catch(e) { console.error(e); } 
    finally { loading.value = false; }
};

const syncUsersFromAD = async () => {
    loading.value = true;
    if (!$api) return;
    const options = getAuthOptions();
    try {
        const res = await $api.post('/users/sync-ad', {}, options);
        if(res.data.success) {
            modalStore.alert(res.data.message, t('user_manage.alert_sync_success'), 'success');
            fetchUsers();
        }
    } catch(e) { modalStore.alert(t('user_manage.alert_sync_failed'), t('user_manage.error_title'), 'error'); }
    finally { loading.value = false; }
};

const searchAD = async () => {
    if (importSearchText.value.trim().length < 3) return;
    searchingAD.value = true;
    const options = getAuthOptions();
    try {
        const res = await $api.get(`/users/ad-search?q=${encodeURIComponent(importSearchText.value)}`, options);
        if(res.data.success) adSearchResults.value = res.data.data;
    } finally { searchingAD.value = false; }
};

const importUser = async (u) => {
    const options = getAuthOptions();
    try {
        const res = await $api.post('/users/import', u, options);
        if(res.data.success) {
            modalStore.alert(t('user_manage.alert_import_success', { name: u.full_name }), t('user_manage.success_title'), 'success');
            fetchUsers();
        }
    } catch(e) { modalStore.alert(e.response?.data?.message || 'Error', t('user_manage.error_title'), 'error'); }
};

const sortUsers = (key) => {
    if (sortKey.value === key) sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
    else { sortKey.value = key; sortOrder.value = 'asc'; }
};

// Search Logic
const filteredUsers = computed(() => {
    let result = users.value.filter(u => {
        const roleMatch = !filterRole.value || u.role === filterRole.value;
        const search = searchText.value.toLowerCase().trim();
        const fullName = (u.full_name || '').toLowerCase();
        const username = (u.username || '').toLowerCase();
        const email = (u.email || '').toLowerCase();
        const department = (u.department || '').toLowerCase();
        const textMatch = !search || fullName.includes(search) || username.includes(search) || email.includes(search) || department.includes(search);
        return roleMatch && textMatch;
    });

    return result.sort((a, b) => {
        let modifier = sortOrder.value === 'asc' ? 1 : -1;
        const valA = a[sortKey.value] ?? '';
        const valB = b[sortKey.value] ?? '';
        if (valA < valB) return -1 * modifier;
        if (valA > valB) return 1 * modifier;
        return 0;
    });
});

const totalPages = computed(() => Math.ceil(filteredUsers.value.length / itemsPerPage));
const paginatedUsers = computed(() => filteredUsers.value.slice((currentPage.value - 1) * itemsPerPage, currentPage.value * itemsPerPage));
const getRoleClasses = (role) => role === 'ADMIN' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-gray-500/10 text-gray-300 border-gray-500/20';

onMounted(() => {
    if (userStore.isLoggedIn) fetchUsers();
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #1a1c1e; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #3f4245; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #4f5255; }
</style>
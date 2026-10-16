<template>
  <div class="p-6 font-sans max-w-5xl mx-auto pb-8 min-h-screen flex flex-col transition-colors" :class="isDark ? 'text-gray-300' : 'text-[#444746]'">
    <div class="flex-1">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
                <h1 class="text-2xl font-bold tracking-wide transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">
                    {{ $t('kb_admin.title') }}
                </h1>
                <p class="text-sm mt-1 transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">Manage help articles and guides</p>
            </div>
            <button 
                @click="openModal()"
                class="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
            >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                {{ $t('kb_admin.add_article') }}
            </button>
        </div>

        <div class="border rounded-xl overflow-hidden shadow-lg mb-8 transition-colors"
             :class="isDark ? 'bg-[#1A1C1E] border-white/10' : 'bg-white border-[rgba(0,0,0,0.12)]'">
            <table class="w-full text-left border-collapse">
                <thead class="text-[10px] font-bold uppercase tracking-wider transition-colors"
                       :class="isDark ? 'bg-[#282A2C] text-gray-500' : 'bg-gray-50 text-[#727775]'">
                    <tr>
                        <th class="p-4 border-b transition-colors" :class="isDark ? 'border-white/5' : 'border-[rgba(0,0,0,0.08)]'">{{ $t('kb_admin.col_title') }}</th>
                        <th class="p-4 border-b transition-colors" :class="isDark ? 'border-white/5' : 'border-[rgba(0,0,0,0.08)]'">{{ $t('kb_admin.col_category') }}</th>
                        <th class="p-4 border-b transition-colors" :class="isDark ? 'border-white/5' : 'border-[rgba(0,0,0,0.08)]'">{{ $t('kb_admin.col_updated') }}</th>
                        <th class="p-4 border-b transition-colors text-right" :class="isDark ? 'border-white/5' : 'border-[rgba(0,0,0,0.08)]'">{{ $t('kb_admin.col_action') }}</th>
                    </tr>
                </thead>
                <tbody class="text-sm">
                    <tr v-if="loading" class="text-center">
                        <td colspan="4" class="p-12 transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">
                            <div class="flex flex-col items-center gap-2">
                                <svg class="animate-spin h-6 w-6 text-blue-500" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                {{ $t('kb_admin.loading') }}
                            </div>
                        </td>
                    </tr>
                    <tr v-else-if="tips.length === 0">
                        <td colspan="4" class="p-12 text-center transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">
                            {{ $t('kb_admin.no_data') }}
                        </td>
                    </tr>
                    
                    <tr v-for="tip in paginatedTips" :key="tip.id" 
                        class="border-b transition-all"
                        :class="[
                             isDark ? 'hover:bg-white/[0.02] border-white/5' : 'hover:bg-blue-50/30 border-[rgba(0,0,0,0.04)]',
                             'last:border-0'
                        ]"
                    >
                        <td class="p-4 flex items-center gap-4">
                            <div v-if="tip.image_url" class="w-12 h-12 rounded-lg overflow-hidden border shrink-0 transition-colors"
                                 :class="isDark ? 'bg-black/50 border-white/10' : 'bg-gray-100 border-gray-200'">
                                <img :src="getImageSrc(tip.image_url)" class="w-full h-full object-cover">
                            </div>
                            <div v-else class="w-12 h-12 rounded-lg border flex items-center justify-center shrink-0 transition-colors"
                                 :class="isDark ? 'bg-white/5 border-white/10' : 'bg-gray-100 border-gray-200'">
                                <svg class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                            </div>
                            <span class="font-bold transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">{{ tip.title }}</span>
                        </td>
                        <td class="p-4">
                            <span class="px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-colors"
                                  :class="isDark ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-blue-50 text-blue-600 border border-blue-200'">
                                {{ getCategoryName(tip.category_id) }}
                            </span>
                        </td>
                        <td class="p-4 text-xs transition-colors shrink-0" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ formatDate(tip.updated_at) }}</td>
                        <td class="p-4 text-right space-x-1 whitespace-nowrap">
                            <button @click="openModal(tip)" 
                                    class="p-2 rounded-lg transition-colors hover:bg-blue-500/10 text-blue-500">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                            </button>
                            <button @click="deleteTip(tip.id)" 
                                    class="p-2 rounded-lg transition-colors hover:bg-red-500/10 text-red-500">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="rounded-2xl w-full max-w-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors"
             :class="isDark ? 'bg-[#1E1F20] border-white/10' : 'bg-white border-[rgba(0,0,0,0.12)]'">
            <div class="p-6 border-b flex justify-between items-center transition-colors"
                 :class="isDark ? 'border-white/10' : 'border-[rgba(0,0,0,0.08)]'">
                <h3 class="text-xl font-bold transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">
                    {{ isEditing ? $t('kb_admin.modal_edit') : $t('kb_admin.modal_add') }}
                </h3>
                <button @click="closeModal" class="transition-colors" :class="isDark ? 'text-gray-400 hover:text-white' : 'text-[#727775] hover:text-[#1f1f1f]'">
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
            </div>
            
            <div class="p-6 overflow-y-auto space-y-6">
                <!-- Title & Category -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="md:col-span-2">
                        <label class="block text-[10px] font-bold uppercase transition-colors mb-1.5" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ $t('kb_admin.label_title') }}</label>
                        <input v-model="form.title" type="text" 
                               class="w-full text-sm rounded-lg p-3 transition-colors outline-none focus:ring-1 focus:ring-blue-500 border"
                               :class="isDark ? 'bg-[#282A2C] border-white/10 text-white' : 'bg-white border-gray-300 text-[#1f1f1f]'">
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold uppercase transition-colors mb-1.5" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ $t('kb_admin.label_category') }}</label>
                        <select v-model="form.category_id" 
                                class="w-full text-sm rounded-lg p-3 transition-colors outline-none focus:ring-1 focus:ring-blue-500 border appearance-none"
                                :class="isDark ? 'bg-[#282A2C] border-white/10 text-white' : 'bg-white border-gray-300 text-[#1f1f1f]'">
                            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                        </select>
                    </div>
                </div>

                <!-- Short Desc -->
                <div>
                    <label class="block text-[10px] font-bold uppercase transition-colors mb-1.5" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ $t('kb_admin.label_short_desc') }}</label>
                    <input v-model="form.short_desc" type="text" 
                           class="w-full text-sm rounded-lg p-3 transition-colors outline-none focus:ring-1 focus:ring-blue-500 border"
                           :class="isDark ? 'bg-[#282A2C] border-white/10 text-white' : 'bg-white border-gray-300 text-[#1f1f1f]'">
                </div>

                <!-- Image URL & Browse -->
                <div>
                    <label class="block text-[10px] font-bold uppercase transition-colors mb-1.5" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ $t('kb_admin.label_image') }}</label>
                    <div class="flex flex-col sm:flex-row gap-4 items-start">
                        <div class="flex-1 w-full space-y-3">
                            <input 
                                v-model="form.image_url" 
                                type="text" 
                                :placeholder="$t('kb_admin.placeholder_image')"
                                class="w-full text-sm rounded-lg p-3 transition-colors outline-none focus:ring-1 focus:ring-blue-500 border"
                                :class="isDark ? 'bg-[#282A2C] border-white/10 text-white' : 'bg-white border-gray-300 text-[#1f1f1f]'"
                            >
                            
                            <div class="flex items-center gap-3">
                                <input 
                                    type="file" 
                                    ref="fileInput" 
                                    class="hidden" 
                                    accept="image/*"
                                    @change="handleFileUpload"
                                >
                                <button 
                                    @click="$refs.fileInput.click()"
                                    class="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border active:scale-95"
                                    :class="isDark 
                                        ? 'bg-[#323438] hover:bg-[#404246] text-white border-white/10' 
                                        : 'bg-gray-100 hover:bg-gray-200 text-[#1f1f1f] border-gray-200'"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                    {{ $t('kb_admin.btn_browse') }}
                                </button>
                                <span v-if="isUploading" class="text-xs text-blue-500 animate-pulse font-medium">{{ $t('kb_admin.uploading') }}</span>
                            </div>
                        </div>

                        <!-- Image Preview -->
                        <div class="w-24 h-24 rounded-xl border overflow-hidden flex items-center justify-center relative group shrink-0 transition-colors shadow-inner"
                             :class="isDark ? 'bg-black/50 border-white/10' : 'bg-gray-100 border-gray-200'">
                            <img v-if="form.image_url" :src="getImageSrc(form.image_url)" class="w-full h-full object-cover">
                            <div v-else class="flex flex-col items-center gap-1 opacity-20 transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">
                                <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                <span class="text-[8px] font-bold uppercase tracking-tighter">{{ $t('kb_admin.no_img') }}</span>
                            </div>
                            
                            <div v-if="form.image_url" @click="form.image_url = ''" class="absolute inset-0 bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Content -->
                <div>
                    <label class="block text-[10px] font-bold uppercase transition-colors mb-1.5" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">
                        {{ $t('kb_admin.label_content') }}
                        <span class="text-blue-500 hover:underline cursor-pointer ml-2 text-[9px] font-bold uppercase tracking-tight" @click="insertTemplate">
                            ⚡ {{ $t('kb_admin.insert_template') }}
                        </span>
                    </label>
                    <textarea v-model="form.content" rows="8" 
                              class="w-full text-sm rounded-lg p-4 transition-colors outline-none focus:ring-1 focus:ring-blue-500 border font-mono resize-none"
                              :class="isDark ? 'bg-[#282A2C] border-white/10 text-white' : 'bg-white border-gray-300 text-[#1f1f1f]'"></textarea>
                </div>
            </div>

            <!-- Modal Footer -->
            <div class="p-6 border-t flex justify-end items-center gap-4 transition-colors"
                 :class="isDark ? 'border-white/10 bg-[#282A2C]' : 'border-[rgba(0,0,0,0.08)] bg-gray-50'">
                <button @click="closeModal" class="text-sm font-bold transition-colors" :class="isDark ? 'text-gray-400 hover:text-white' : 'text-[#727775] hover:text-[#1f1f1f]'">{{ $t('kb_admin.btn_cancel') }}</button>
                <button @click="saveTip" 
                        class="bg-blue-600 hover:bg-blue-500 text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100" 
                        :disabled="submitting">
                    <div class="flex items-center gap-2">
                        <svg v-if="submitting" class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        {{ submitting ? $t('kb_admin.btn_saving') : $t('kb_admin.btn_save') }}
                    </div>
                </button>
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
import { ref, onMounted, computed, getCurrentInstance } from 'vue'; 
import { useModalStore } from '@/stores/modalStore';
import Pagination from '../../components/Pagination.vue'; 
import { useI18n } from 'vue-i18n';
import { useUserStore } from '@/stores/userStore';
import { useTheme } from '@/composables/useTheme';

const { isDark } = useTheme();
const { proxy } = getCurrentInstance();
const $api = proxy.$api; 
const userStore = useUserStore(); 

const { t } = useI18n(); 
const modalStore = useModalStore();

const tips = ref([]);
const loading = ref(false);
const showModal = ref(false);
const submitting = ref(false);
const isEditing = ref(false);
const isUploading = ref(false);
const fileInput = ref(null);

const currentPage = ref(1);
const itemsPerPage = 10; 

const categories = [
    { id: 'PRINTER', name: 'Printer & Scanner', key: 'knowledge_base.cat_printer' },
    { id: 'NETWORK', name: 'Internet & WiFi', key: 'knowledge_base.cat_network' },
    { id: 'ACCOUNT', name: 'Account & Login', key: 'knowledge_base.cat_account' },
    { id: 'SOFTWARE', name: 'Program & Software', key: 'knowledge_base.cat_software' },
    { id: 'HARDWARE', name: 'Computer Hardware', key: 'knowledge_base.cat_hardware' }
];

const form = ref({
    id: null,
    title: '',
    short_desc: '',
    content: '',
    category_id: 'PRINTER',
    image_url: '',
    created_by: null 
});

const getAuthOptions = () => {
    const token = userStore.getAuthToken;
    if (!token) return null;
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

const getCategoryName = (id) => {
    const cat = categories.find(c => c.id === id);
    return cat ? t(cat.key) : id;
};

const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: '2-digit' });
};

const getImageSrc = (src) => {
    if (!src) return '';
    if (src.startsWith('http')) return src; 
    return `/api${src}`; 
};

const fetchTips = async () => {
    loading.value = true;
    if (!$api) return;
    const options = getAuthOptions();
    if (!options) { loading.value = false; return; }

    try {
        const res = await $api.get('/kb', options); 
        if (res.data.success) {
            tips.value = res.data.data;
            currentPage.value = 1; 
        }
    } catch (err) {
        console.error("Fetch Tips Error:", err);
    } finally {
        loading.value = false;
    }
};

const totalPages = computed(() => Math.ceil(tips.value.length / itemsPerPage));

const paginatedTips = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return tips.value.slice(start, end);
});

const changePage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
    }
};

const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 30 * 1024 * 1024) { 
        modalStore.alert(t('kb_admin.alert_file_size'), t('kb_admin.warning_title'), 'warning');
        return;
    }

    const formData = new FormData();
    formData.append('image', file);

    isUploading.value = true;
    const options = getAuthOptions();
    if (!options) { isUploading.value = false; return; }
    
    const uploadOptions = {
        ...options,
        headers: {
            ...options.headers,
            'Content-Type': 'multipart/form-data'
        }
    };

    try {
        const res = await $api.post('/kb/upload', formData, uploadOptions);
        if (res.data.success) {
            form.value.image_url = res.data.imageUrl; 
        }
    } catch (err) {
        console.error("Upload Error:", err);
        modalStore.alert(t('kb_admin.alert_upload_failed'), t('kb_admin.error_title'), 'error');
    } finally {
        isUploading.value = false;
        event.target.value = ''; 
    }
};

const openModal = (tip = null) => {
    if (tip) {
        isEditing.value = true;
        form.value = { ...tip };
    } else {
        isEditing.value = false;
        form.value = { id: null, title: '', short_desc: '', content: '', category_id: 'PRINTER', image_url: '', created_by: null };
    }
    showModal.value = true;
};

const closeModal = () => {
    showModal.value = false;
};

const insertTemplate = () => {
    form.value.content += `
<ul class="list-disc list-inside space-y-1">
    <li>ขั้นตอนที่ 1</li>
    <li>ขั้นตอนที่ 2</li>
</ul>`;
};

const saveTip = async () => {
    if (!form.value.title || !form.value.content) return modalStore.alert(t('kb_admin.alert_required'), t('kb_admin.warning_title'), 'warning');
    
    submitting.value = true;
    const options = getAuthOptions();
    if (!options) { submitting.value = false; return; }

    form.value.created_by = userStore.currentUser?.id;

    try {
        if (isEditing.value) {
            await $api.put(`/kb/${form.value.id}`, form.value, options);
        } else {
            await $api.post('/kb', form.value, options);
        }
        
        await fetchTips();
        closeModal();
        modalStore.alert(t('kb_admin.alert_save_success'), t('kb_admin.success_title'), 'success');
    } catch (err) {
        modalStore.alert(t('kb_admin.alert_save_error'), t('kb_admin.error_title'), 'error');
    } finally {
        submitting.value = false;
    }
};

const deleteTip = async (id) => {
    const confirmed = await modalStore.confirm(t('kb_admin.confirm_delete'), t('kb_admin.confirm_title'));
    if (!confirmed) return;

    const options = getAuthOptions();
    if (!options) return;

    try {
        await $api.delete(`/kb/${id}`, options);
        await fetchTips();
        modalStore.alert(t('kb_admin.alert_delete_success'), t('kb_admin.success_title'), 'success');
    } catch (err) {
        modalStore.alert(t('kb_admin.alert_delete_error'), t('kb_admin.error_title'), 'error');
    }
};

onMounted(() => {
    if (userStore.isLoggedIn) {
        fetchTips();
    }
});
</script>

<style scoped>
/* Custom scrollbar for better UX in dark mode */
::-webkit-scrollbar {
    width: 6px;
}
::-webkit-scrollbar-track {
    background: transparent;
}
::-webkit-scrollbar-thumb {
    background: #4b5563;
    border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
    background: #6b7280;
}
</style>
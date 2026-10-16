<template>
  <div class="p-6 font-sans text-gray-300 min-h-screen flex flex-col">
    <div class="flex-1">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold text-white">{{ $t('kb_admin.title') }}</h1>
            <button 
                @click="openModal()"
                class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg"
            >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                {{ $t('kb_admin.add_article') }}
            </button>
        </div>

        <div class="bg-[#282A2C] rounded-xl border border-white/5 overflow-hidden shadow-lg mb-6">
            <table class="w-full text-left border-collapse">
                <thead class="bg-[#1E1F20] text-gray-400 text-xs uppercase">
                    <tr>
                        <th class="p-4 border-b border-white/5">{{ $t('kb_admin.col_title') }}</th>
                        <th class="p-4 border-b border-white/5">{{ $t('kb_admin.col_category') }}</th>
                        <th class="p-4 border-b border-white/5">{{ $t('kb_admin.col_updated') }}</th>
                        <th class="p-4 border-b border-white/5 text-right">{{ $t('kb_admin.col_action') }}</th>
                    </tr>
                </thead>
                <tbody class="text-sm">
                    <tr v-if="loading" class="text-center"><td colspan="4" class="p-8 text-gray-500">{{ $t('kb_admin.loading') }}</td></tr>
                    <tr v-else-if="tips.length === 0"><td colspan="4" class="p-8 text-center text-gray-500">{{ $t('kb_admin.no_data') }}</td></tr>
                    
                    <tr v-for="tip in paginatedTips" :key="tip.id" class="hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors">
                        <td class="p-4 font-medium text-white flex items-center gap-3">
                            <div v-if="tip.image_url" class="w-10 h-10 rounded overflow-hidden bg-black/50 border border-white/10 shrink-0">
                                <img :src="getImageSrc(tip.image_url)" class="w-full h-full object-cover">
                            </div>
                            <div v-else class="w-10 h-10 rounded bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                <svg class="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                            </div>
                            {{ tip.title }}
                        </td>
                        <td class="p-4">
                            <span class="px-2 py-1 rounded text-[10px] bg-gray-700 text-gray-300 border border-white/10">
                                {{ getCategoryName(tip.category_id) }}
                            </span>
                        </td>
                        <td class="p-4 text-gray-500">{{ formatDate(tip.updated_at) }}</td>
                        <td class="p-4 text-right space-x-2">
                            <button @click="openModal(tip)" class="text-blue-400 hover:text-blue-300">{{ $t('button.edit') }}</button>
                            <button @click="deleteTip(tip.id)" class="text-red-400 hover:text-red-300">{{ $t('button.delete') }}</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-[#1E1F20] rounded-2xl w-full max-w-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div class="p-6 border-b border-white/10 flex justify-between items-center">
                <h3 class="text-xl font-bold text-white">{{ isEditing ? $t('kb_admin.modal_edit') : $t('kb_admin.modal_add') }}</h3>
                <button @click="closeModal" class="text-gray-400 hover:text-white"><svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
            </div>
            
            <div class="p-6 overflow-y-auto space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="md:col-span-2">
                        <label class="block text-xs text-gray-400 mb-1">{{ $t('kb_admin.label_title') }}</label>
                        <input v-model="form.title" type="text" class="w-full bg-[#282A2C] border border-white/10 rounded-lg p-2.5 text-white focus:ring-1 focus:ring-blue-500 outline-none">
                    </div>
                    <div>
                        <label class="block text-xs text-gray-400 mb-1">{{ $t('kb_admin.label_category') }}</label>
                        <select v-model="form.category_id" class="w-full bg-[#282A2C] border border-white/10 rounded-lg p-2.5 text-white focus:ring-1 focus:ring-blue-500 outline-none">
                            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label class="block text-xs text-gray-400 mb-1">{{ $t('kb_admin.label_short_desc') }}</label>
                    <input v-model="form.short_desc" type="text" class="w-full bg-[#282A2C] border border-white/10 rounded-lg p-2.5 text-white focus:ring-1 focus:ring-blue-500 outline-none">
                </div>

                <div>
                    <label class="block text-xs text-gray-400 mb-1">{{ $t('kb_admin.label_image') }}</label>
                    <div class="flex gap-4 items-start">
                        <div class="flex-1 space-y-2">
                            <input 
                                v-model="form.image_url" 
                                type="text" 
                                :placeholder="$t('kb_admin.placeholder_image')"
                                class="w-full bg-[#282A2C] border border-white/10 rounded-lg p-2.5 text-white focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                            >
                            
                            <div class="flex items-center gap-2">
                                <input 
                                    type="file" 
                                    ref="fileInput" 
                                    class="hidden" 
                                    accept="image/*"
                                    @change="handleFileUpload"
                                >
                                <button 
                                    @click="$refs.fileInput.click()"
                                    class="bg-[#323438] hover:bg-[#404246] text-white px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 border border-white/10 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                    📂 {{ $t('kb_admin.btn_browse') }}
                                </button>
                                <span v-if="isUploading" class="text-xs text-blue-400 animate-pulse">{{ $t('kb_admin.uploading') }}</span>
                            </div>
                        </div>

                        <div class="w-20 h-20 rounded-lg border border-white/10 bg-black/50 overflow-hidden shrink-0 flex items-center justify-center relative group">
                            <img v-if="form.image_url" :src="getImageSrc(form.image_url)" class="w-full h-full object-cover">
                            <span v-else class="text-[10px] text-gray-600">{{ $t('kb_admin.no_img') }}</span>
                            
                            <div v-if="form.image_url" @click="form.image_url = ''" class="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <label class="block text-xs text-gray-400 mb-1">
                        {{ $t('kb_admin.label_content') }}
                        <span class="text-blue-400 cursor-pointer ml-2" @click="insertTemplate">{{ $t('kb_admin.insert_template') }}</span>
                    </label>
                    <textarea v-model="form.content" rows="6" class="w-full bg-[#282A2C] border border-white/10 rounded-lg p-3 text-white focus:ring-1 focus:ring-blue-500 outline-none font-mono text-sm leading-relaxed"></textarea>
                </div>
            </div>

            <div class="p-4 border-t border-white/10 bg-[#282A2C] flex justify-end gap-3">
                <button @click="closeModal" class="px-4 py-2 text-gray-400 hover:text-white text-sm">{{ $t('kb_admin.btn_cancel') }}</button>
                <button @click="saveTip" class="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg" :disabled="submitting">
                    {{ submitting ? $t('kb_admin.btn_saving') : $t('kb_admin.btn_save') }}
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
    created_by: null // 🎯 เพิ่มเพื่อรองรับ Database Insert
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

// 🎯 แก้ไขเพื่อให้รูปวิ่งผ่าน Proxy /api ของ IIS
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
            // ✅ ใช้ .imageUrl (U ใหญ่) ตามที่ Backend ส่งมา
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

// 🎯 แก้ไขส่วนการบันทึก (Save)
const saveTip = async () => {
    if (!form.value.title || !form.value.content) return modalStore.alert(t('kb_admin.alert_required'), t('kb_admin.warning_title'), 'warning');
    
    submitting.value = true;
    const options = getAuthOptions();
    if (!options) { submitting.value = false; return; }

    // 🎯 ดึง ID ของ user มาใส่ก่อนส่งไป Backend เพื่อให้บันทึกสำเร็จ
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
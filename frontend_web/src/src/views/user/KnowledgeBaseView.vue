<template>
  <div class="p-6 font-sans max-w-5xl mx-auto text-gray-300 min-h-screen flex flex-col">
    
    <!-- Header & Search Section -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 py-6 mb-5 border-b border-white/5 pb-5">
        
        <!-- Left: Title & Description -->
        <div class="text-left space-y-2 flex-1">
            <h1 class="text-2xl md:text-3xl font-bold text-white tracking-tight">
                {{ $t('knowledge_base.title') }}
            </h1>
            <p class="text-gray-400 text-sm max-w-xl leading-relaxed">
                {{ $t('knowledge_base.subtitle') }}
            </p>
        </div>

        <!-- Right: Search Bar -->
        <div class="relative w-full md:w-96 group shrink-0">
            <div class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-500 group-focus-within:text-blue-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input 
                v-model="searchQuery"
                type="text" 
                class="w-full bg-[#282A2C] border border-white/10 text-white rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-lg placeholder-gray-500 text-sm"
                :placeholder="$t('knowledge_base.search_placeholder')"
            >
        </div>
    </div>

    <!-- Category Tabs (Pills) -->
    <div class="flex flex-wrap justify-start gap-3 mb-10">
        <button 
            v-for="cat in categories" 
            :key="cat.id"
            @click="selectedCategory = cat.id"
            class="px-4 py-2 rounded-full text-xs font-medium transition-all border"
            :class="selectedCategory === cat.id 
                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30' 
                : 'bg-[#282A2C] border-white/5 text-gray-400 hover:bg-[#323438] hover:text-white'"
        >
            <span class="mr-2">{{ cat.icon }}</span>
            {{ $t(cat.key) }} <!-- ✅ Use Translation Key -->
        </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-20">
        <svg class="animate-spin h-8 w-8 mx-auto text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <p class="text-gray-500">{{ $t('knowledge_base.loading') }}</p>
    </div>

    <!-- Content List (Grid) -->
    <div v-else-if="paginatedTips.length > 0" class="flex-1"> 
        <div class="grid grid-cols-1 gap-4 mb-8">
            <div 
                v-for="tip in paginatedTips" 
                :key="tip.id"
                class="bg-[#282A2C] border border-white/5 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all duration-300 group cursor-pointer"
                @click="toggleTip(tip.id)"
            >
                <div class="p-6">
                    <div class="flex items-start justify-between gap-4">
                        <div class="flex-1">
                            <!-- Category Badge -->
                            <span class="inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider mb-2"
                                :class="getCategoryColor(tip.category_id)"
                            >
                                {{ getCategoryName(tip.category_id) }}
                            </span>
                            <h3 class="text-lg font-bold text-white group-hover:text-blue-400 transition-colors mb-2">
                                {{ tip.title }}
                            </h3>
                            <p class="text-sm text-gray-400 line-clamp-2" v-if="!expandedTips.includes(tip.id)">
                                {{ tip.short_desc }}
                            </p>
                        </div>
                        <!-- Icon toggle -->
                        <div class="mt-1 text-gray-500 group-hover:text-white transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 transition-transform duration-300" :class="expandedTips.includes(tip.id) ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>

                    <!-- Expanded Content -->
                    <div 
                        v-if="expandedTips.includes(tip.id)"
                        class="mt-4 pt-4 border-t border-white/10 text-gray-300 text-sm leading-relaxed animate-fade-in-down"
                    >
                        <div class="bg-[#1E1F20] p-6 rounded-xl border border-white/5">
                            
                            <!-- Image -->
                            <div v-if="tip.image_url" class="mb-6 overflow-hidden rounded-lg border border-white/10">
                                <img 
                                    :src="getImageSrc(tip.image_url)" 
                                    alt="รูปภาพประกอบปัญหา" 
                                    class="w-full h-auto max-h-[500px] object-contain bg-black/40"
                                    loading="lazy"
                                >
                            </div>

                            <h4 class="text-blue-400 font-bold mb-3 flex items-center gap-2 text-base">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                                {{ $t('knowledge_base.solution') }}
                            </h4>
                            <div v-html="tip.content" class="kb-content"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Not Found State -->
    <div v-else class="text-center py-20 bg-[#282A2C]/50 rounded-3xl border border-dashed border-white/10 flex-1">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <h3 class="text-xl font-bold text-gray-400">{{ $t('knowledge_base.not_found_title') }}</h3>
        <p class="text-gray-500 mt-2">{{ $t('knowledge_base.not_found_desc') }}</p>
        <button 
            @click="searchQuery = ''; selectedCategory = 'ALL'"
            class="mt-6 text-blue-400 hover:text-blue-300 underline text-sm"
        >
            {{ $t('knowledge_base.clear_search') }}
        </button>
    </div>

    <!-- Sticky Footer Pagination -->
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
import { ref, computed, onMounted, watch, getCurrentInstance } from 'vue';
import Pagination from '../../components/Pagination.vue'; 
import { useI18n } from 'vue-i18n';
import { useUserStore } from '@/stores/userStore'; // ✅ 1. Import UserStore

// 1. เข้าถึง Global Properties ($api)
const { proxy } = getCurrentInstance();
const $api = proxy.$api; 
const userStore = useUserStore(); // ✅ 2. ดึง UserStore

const { t } = useI18n(); 
const searchQuery = ref('');
const selectedCategory = ref('ALL');
const expandedTips = ref([]); 
const tipsData = ref([]); 
const loading = ref(true);

// Pagination State
const currentPage = ref(1);
const itemsPerPage = 4; 

// ✅ 3. Helper function สำหรับสร้าง Header (แม้จะเป็น KB ก็ต้องส่ง Token ถ้ามี)
const getAuthOptions = () => {
    const token = userStore.getAuthToken;
    if (!token) {
        // ถ้าไม่มี Token แต่ API Call ยังคงดำเนินต่อไป (เพราะ KB อาจ Public)
        return {}; 
    }
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

// 2. หมวดหมู่ (Update to use translation keys)
const categories = [
    { id: 'ALL', name: 'ทั้งหมด', key: 'knowledge_base.cat_all', icon: '📋' },
    { id: 'PRINTER', name: 'Printer & Scanner', key: 'knowledge_base.cat_printer', icon: '🖨️' },
    { id: 'NETWORK', name: 'Internet & WiFi', key: 'knowledge_base.cat_network', icon: '🌐' },
    { id: 'ACCOUNT', name: 'Account & Login', key: 'knowledge_base.cat_account', icon: '🔐' },
    { id: 'SOFTWARE', name: 'Program & Software', key: 'knowledge_base.cat_software', icon: '💻' },
    { id: 'HARDWARE', name: 'Computer Hardware', key: 'knowledge_base.cat_hardware', icon: '🖥️' }
];

// --- Logic ---

const getCategoryName = (id) => {
    const cat = categories.find(c => c.id === id);
    return cat ? t(cat.key) : id; // ✅ Translate category name
};

const getCategoryColor = (id) => {
    switch (id) {
        case 'PRINTER': return 'bg-orange-500/20 text-orange-400';
        case 'NETWORK': return 'bg-blue-500/20 text-blue-400';
        case 'ACCOUNT': return 'bg-purple-500/20 text-purple-400';
        case 'SOFTWARE': return 'bg-green-500/20 text-green-400';
        case 'HARDWARE': return 'bg-red-500/20 text-red-400';
        default: return 'bg-gray-500/20 text-gray-400';
    }
};

const toggleTip = (id) => {
    if (expandedTips.value.includes(id)) {
        expandedTips.value = expandedTips.value.filter(i => i !== id);
    } else {
        expandedTips.value.push(id);
    }
};

// ✅ แก้ไขฟังก์ชัน getImageSrc เพื่อให้วิ่งผ่าน Proxy ของ IIS
const getImageSrc = (src) => {
    if (!src) return '';
    
    // ถ้าเป็น URL เต็มอยู่แล้ว (เช่น http://...) ให้ใช้ค่านั้นเลย
    if (src.startsWith('http')) return src; 
    
    // 🎯 ต้องเติม /api นำหน้าเพื่อให้ตรงกับกฎใน web.config 
    // ที่เราตั้งไว้ว่า <match url="api/uploads/(.*)" />
    return `/api${src}`; 
};

const fetchTips = async () => {
    loading.value = true;
    // 🛑 3. ตรวจสอบ $api
    if (!$api) {
        console.error("API client not available.");
        loading.value = false;
        return;
    }
    
    const options = getAuthOptions(); // ✅ 4. ดึง Header (มี Token หรือ {})
    
    try {
        // 🛑 5. ใช้ $api และส่ง options
        const res = await $api.get('/kb', options); 
        if (res.data.success) {
            tipsData.value = res.data.data;
        }
    } catch (err) {
        // ถ้า Error ที่ไม่ใช่ 401 (ซึ่ง Interceptor จะจับ) ให้แสดง Log
        console.error("Failed to fetch tips:", err);
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchTips();
});

// Logic กรองข้อมูล
const filteredTips = computed(() => {
    return tipsData.value.filter(tip => {
        const matchCat = selectedCategory.value === 'ALL' || tip.category_id === selectedCategory.value;
        const query = searchQuery.value.toLowerCase();
        const matchSearch = tip.title.toLowerCase().includes(query) || 
                            (tip.short_desc && tip.short_desc.toLowerCase().includes(query)) ||
                            (tip.content && tip.content.toLowerCase().includes(query));
        return matchCat && matchSearch;
    });
});

// ✅ Logic Pagination
const totalPages = computed(() => Math.ceil(filteredTips.value.length / itemsPerPage));

const paginatedTips = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredTips.value.slice(start, end);
});

const changePage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
        window.scrollTo({ top: 0, behavior: 'smooth' }); 
    }
};

// Reset หน้าเมื่อมีการค้นหาหรือเปลี่ยนหมวดหมู่
watch([searchQuery, selectedCategory], () => {
    currentPage.value = 1;
});
</script>
<style scoped>
.animate-fade-in-down {
    animation: fadeInDown 0.3s ease-out;
}
@keyframes fadeInDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

:deep(.kb-content ul) {
    list-style-type: disc;
    padding-left: 1.5rem;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
}
:deep(.kb-content ol) {
    list-style-type: decimal;
    padding-left: 1.5rem;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
}
:deep(.kb-content b), :deep(.kb-content strong) {
    color: #fff;
    font-weight: 600;
}
</style>
<template>
  <div class="p-6 max-w-6xl mx-auto font-sans transition-colors" :class="isDark ? 'text-gray-300' : 'text-[#444746]'">
    
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-3xl font-bold tracking-tight transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">{{ $t('categories.title') }}</h2>
        <p class="text-sm mt-1 transition-colors" :class="isDark ? 'text-gray-400' : 'text-[#727775]'">{{ $t('categories.subtitle') }}</p>
      </div>
      <button @click="fetchCategories" 
              class="p-2 rounded-full transition-all border shadow-sm"
              :class="isDark ? 'bg-[#282A2C] hover:bg-[#323436] text-gray-400 hover:text-white border-white/5' : 'bg-white hover:bg-gray-50 text-[#727775] hover:text-blue-600 border-[rgba(0,0,0,0.12)]'">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-12 gap-6 h-[calc(100vh-180px)] min-h-[600px]">
      
      <div class="md:col-span-4 rounded-3xl p-6 border flex flex-col shadow-xl transition-all duration-300"
           :class="isDark ? 'bg-[#282A2C] border-white/5 shadow-black/20' : 'bg-white border-[rgba(0,0,0,0.08)] shadow-[0_1px_3px_0_rgba(60,64,67,0.30)]'">
        <h3 class="text-lg font-bold mb-4 flex items-center gap-2 transition-colors"
            :class="isDark ? 'text-blue-400' : 'text-blue-600'">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          {{ $t('categories.main_category') }}
        </h3>
        
        <form @submit.prevent="addParentCategory" class="flex gap-2 mb-6">
          <input 
            v-model="newParentName" 
            type="text" 
            :placeholder="$t('categories.placeholder_new_main')" 
            class="flex-1 px-4 py-2.5 rounded-xl text-sm border focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
            :class="isDark ? 'bg-[#1A1C1E] text-white border-transparent placeholder-gray-500' : 'bg-gray-50 text-[#1f1f1f] border-[rgba(0,0,0,0.12)] placeholder-[#9aa0a6]'"
            required
          >
          <button 
            type="submit" 
            :disabled="isSubmitting"
            class="bg-blue-600 hover:bg-blue-500 text-white p-2.5 rounded-xl transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
          </button>
        </form>

        <div class="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          <div 
            v-for="cat in mainList" 
            :key="cat.cat_id"
            @click="selectParent(cat)"
            class="p-4 rounded-xl cursor-pointer transition-all flex justify-between items-center group border"
            :class="selectedParent?.cat_id === cat.cat_id 
              ? (isDark ? 'bg-blue-600/10 border-blue-500/50 text-blue-200 shadow-inner' : 'bg-blue-50 border-blue-300 text-blue-800 shadow-sm') 
              : (isDark ? 'bg-[#1A1C1E] border-transparent text-gray-400 hover:bg-[#323436] hover:text-white' : 'bg-white border-[rgba(0,0,0,0.06)] text-[#727775] hover:bg-gray-50 hover:text-blue-600 hover:border-blue-100')"
          >
            <span class="font-medium truncate flex-1">{{ cat.name }}</span>
            
            <div class="flex items-center gap-2">
                <span 
                class="text-[10px] px-2 py-0.5 rounded-full transition-colors font-bold"
                :class="selectedParent?.cat_id === cat.cat_id 
                    ? 'bg-blue-500 text-white' 
                    : (isDark ? 'bg-[#282A2C] text-gray-500 group-hover:text-gray-300' : 'bg-gray-100 text-[#9aa0a6] group-hover:text-blue-600')"
                >
                {{ getChildCount(cat.cat_id) }} &gt;
                </span>

                <button 
                    @click.stop="deleteCategory(cat.cat_id, cat.name, 'MAIN')"
                    class="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 text-gray-500 hover:text-red-400 rounded-lg transition-all"
                    title="ลบหมวดหมู่"
                >
                    <TrashIcon class="h-4 w-4" />
                </button>
            </div>
          </div>
        </div>
      </div>

      <div class="md:col-span-8 rounded-3xl p-6 border flex flex-col shadow-xl transition-all duration-300"
           :class="isDark ? 'bg-[#282A2C] border-white/5 shadow-black/20' : 'bg-white border-[rgba(0,0,0,0.08)] shadow-[0_1px_3px_0_rgba(60,64,67,0.30)]'">
        
        <div v-if="selectedParent" class="h-full flex flex-col">
          <div class="flex justify-between items-start mb-6 border-b transition-colors pb-4"
               :class="isDark ? 'border-white/10' : 'border-[rgba(0,0,0,0.08)]'">
            <div>
              <div class="text-xs uppercase tracking-wider font-bold mb-1 transition-colors" :class="isDark ? 'text-blue-400' : 'text-blue-600'">{{ $t('categories.selected_category') }}</div>
              <h3 class="text-2xl font-bold transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">{{ selectedParent.name }}</h3>
            </div>
            <div class="text-sm px-3 py-1 rounded-lg transition-colors" :class="isDark ? 'text-gray-500 bg-[#1A1C1E]' : 'text-[#727775] bg-gray-100 font-medium'">ID: {{ selectedParent.cat_id }}</div>
          </div>

          <div class="relative mb-4 group">
            <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none transition-colors"
                 :class="isDark ? 'text-gray-500 group-focus-within:text-emerald-400' : 'text-[#9aa0a6] group-focus-within:text-emerald-600'">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input 
              v-model="subSearchQuery"
              type="text" 
              :placeholder="$t('knowledge_base.search_placeholder')"
              class="w-full border rounded-xl py-2 pl-10 pr-4 outline-none text-xs transition-all shadow-sm"
              :class="isDark ? 'bg-[#1A1C1E] border-white/5 text-white focus:ring-1 focus:ring-emerald-500' : 'bg-gray-50 border-[rgba(0,0,0,0.12)] text-[#1f1f1f] focus:ring-1 focus:ring-emerald-400'"
            >
          </div>

          <form @submit.prevent="addChildCategory" 
                class="flex gap-3 mb-6 p-1.5 rounded-2xl border transition-all duration-300"
                :class="isDark ? 'bg-[#1A1C1E] border-white/5' : 'bg-white border-[rgba(0,0,0,0.08)] shadow-sm'">
             <div class="pl-3 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#9aa0a6]'" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
             </div>
             <input 
                v-model="newChildName" 
                type="text" 
                :placeholder="$t('categories.placeholder_new_sub', { parent: selectedParent.name })" 
                class="flex-1 bg-transparent px-2 py-3 focus:outline-none text-sm transition-colors"
                :class="isDark ? 'text-white placeholder-gray-500' : 'text-[#1f1f1f] placeholder-[#9aa0a6]'"
                required
              >
             <button 
                type="submit" 
                :disabled="isSubmitting"
                class="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                {{ $t('categories.add_item') }}
             </button>
          </form>

          <div class="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div v-if="currentChildren.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
              <div 
                v-for="child in currentChildren" 
                :key="child.sub_id" 
                class="p-4 rounded-xl border flex items-center justify-between transition-all group shadow-sm"
                :class="isDark ? 'bg-[#1A1C1E] border-white/5 text-gray-300 hover:border-gray-600' : 'bg-white border-[rgba(0,0,0,0.06)] text-[#444746] hover:border-emerald-200 hover:bg-emerald-50/30'"
              >
                 <div class="flex items-center gap-3">
                    <div class="w-2 h-2 rounded-full bg-emerald-500 group-hover:scale-125 transition-transform shadow-[0_0_5px_rgba(16,185,129,0.5)]"></div>
                    <span class="font-medium">{{ child.name }}</span>
                 </div>
                 
                 <button 
                    @click.stop="deleteCategory(child.sub_id, child.name, 'SUB')" 
                    class="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 text-gray-500 hover:text-red-400 rounded-lg transition-all" 
                    title="ลบรายการ"
                 >
                    <TrashIcon class="h-4 w-4" />
                 </button>
              </div>
            </div>

            <div v-else class="h-64 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl transition-colors"
                 :class="isDark ? 'text-gray-600 border-white/5' : 'text-[#727775] border-gray-100 bg-gray-50/50'">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p class="text-sm">{{ subSearchQuery ? $t('knowledge_base.not_found_title') : $t('categories.no_sub_categories') }}</p>
                <button v-if="subSearchQuery" @click="subSearchQuery = ''" class="mt-2 text-blue-400 text-xs hover:underline">ล้างการค้นหา</button>
            </div>
          </div>

        </div>

        <div v-else class="h-full flex flex-col items-center justify-center opacity-60 transition-colors"
             :class="isDark ? 'text-gray-600' : 'text-[#727775]'">
           <div class="w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-colors shadow-inner"
                :class="isDark ? 'bg-[#1A1C1E]' : 'bg-gray-100'">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
           </div>
           <h3 class="text-lg font-bold transition-colors" :class="isDark ? 'text-gray-400' : 'text-[#1f1f1f]'">{{ $t('categories.no_selection') }}</h3>
           <p class="text-sm font-medium">{{ $t('categories.no_selection_desc') }}</p>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, getCurrentInstance } from 'vue';
import { TrashIcon } from '@heroicons/vue/24/outline'; 
import { useModalStore } from '@/stores/modalStore'; 
import { useI18n } from 'vue-i18n';
import { useUserStore } from '@/stores/userStore';
import { useTheme } from '@/composables/useTheme';

const { isDark } = useTheme();

const { proxy } = getCurrentInstance();
const $api = proxy.$api;
const userStore = useUserStore();

const { t } = useI18n(); 
const modal = useModalStore();
const mainList = ref([]); 
const subList = ref([]);  
const newParentName = ref('');
const newChildName = ref('');
const subSearchQuery = ref(''); // 🎯 1. เก็บคำค้นหาหมวดหมู่ย่อย
const selectedParent = ref(null);
const isSubmitting = ref(false);

const getAuthOptions = () => {
    const token = userStore.getAuthToken;
    if (!token) return null;
    return { headers: { Authorization: `Bearer ${token}` } };
};

const fetchCategories = async () => {
    if (!$api) return;
    const options = getAuthOptions();
    if (!options) return;
    
    try {
        const res = await $api.get('/categories', options);
        if(res.data.success) {
            mainList.value = res.data.data.mainCategories;
            subList.value = res.data.data.subCategories;
        }
    } catch (error) {
        modal.alert(t('categories.error_load'), t('categories.error_title'), 'error');
    }
};

// 🎯 2. ปรับปรุง Computed ให้กรองตามชื่อที่พิมพ์ค้นหาด้วย
const currentChildren = computed(() => {
  if (!selectedParent.value) return [];
  
  // ขั้นที่ 1: กรองเอาเฉพาะลูกที่ตรงกับแม่ที่เลือก
  let filtered = subList.value.filter(child => child.cat_id === selectedParent.value.cat_id);
  
  // ขั้นที่ 2: ถ้ามีการพิมพ์ค้นหา ให้กรองชื่อที่ตรงกัน
  if (subSearchQuery.value.trim()) {
    const query = subSearchQuery.value.toLowerCase();
    filtered = filtered.filter(child => 
      child.name.toLowerCase().includes(query)
    );
  }
  
  return filtered;
});

const getChildCount = (parentId) => {
  return subList.value.filter(child => child.cat_id === parentId).length;
};

// 🎯 3. รีเซ็ตคำค้นหาเมื่อเปลี่ยนหมวดหมู่แม่
const selectParent = (cat) => {
  selectedParent.value = cat;
  newChildName.value = ''; 
  subSearchQuery.value = ''; 
};

const addParentCategory = async () => {
  if (!newParentName.value.trim()) return;
  isSubmitting.value = true;
  if (!$api) return;
  const options = getAuthOptions();
  if (!options) { isSubmitting.value = false; return; }

  try {
    const res = await $api.post('/categories/create', { name: newParentName.value, parentId: null }, options);
    if (res.data.success) {
      newParentName.value = ''; 
      await fetchCategories(); 
      modal.alert(t('categories.success_add_main'), t('categories.success_title'), 'success'); 
    }
  } catch (err) {
    modal.alert(err.response?.data?.message || err.message, t('categories.error_save'), 'error'); 
  } finally {
    isSubmitting.value = false;
  }
};

const addChildCategory = async () => {
  if (!newChildName.value.trim() || !selectedParent.value) return;
  isSubmitting.value = true;
  if (!$api) return;
  const options = getAuthOptions();
  if (!options) { isSubmitting.value = false; return; }

  try {
    const res = await $api.post('/categories/create', { name: newChildName.value, parentId: selectedParent.value.cat_id }, options);
    if (res.data.success) {
      newChildName.value = ''; 
      await fetchCategories(); 
      modal.alert(t('categories.success_add_sub'), t('categories.success_title'), 'success'); 
    }
  } catch (err) {
    modal.alert(err.response?.data?.message || err.message, t('categories.error_save'), 'error'); 
  } finally {
    isSubmitting.value = false;
  }
};

const deleteCategory = async (id, name, type) => {
  const msg = type === 'MAIN' 
    ? t('categories.confirm_delete_main', { name: name })
    : t('categories.confirm_delete_sub', { name: name });

  const confirmed = await modal.confirm(msg, t('categories.confirm_delete_title'));
  if (!confirmed) return; 

  const options = getAuthOptions();
  if (!$api || !options) return;

  try {
    const res = await $api.post('/categories/delete', { id, type }, options);
    if (res.data.success) {
      if (type === 'MAIN' && selectedParent.value?.cat_id === id) selectedParent.value = null;
      await fetchCategories();
      modal.alert(t('categories.success_delete'), t('categories.success_title'), 'success'); 
    }
  } catch (err) {
    modal.alert(err.response?.data?.message || err.message, t('categories.error_delete'), 'error'); 
  }
};

onMounted(() => {
    if (userStore.isLoggedIn) {
        fetchCategories();
    } else {
        modal.alert(t('messages.session_expired_title'), t('messages.login_required'), 'error');
    }
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { 
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb { 
  background: v-bind("isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'"); 
  border-radius: 10px; 
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover { 
  background: v-bind("isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'"); 
}
</style>
``` [cite: 2025-12-19]

**สิ่งที่เพิ่มเข้าไป:** [cite: 2025-12-19]
1.  **State:** เพิ่ม `subSearchQuery` เพื่อรับค่าการค้นหาหมวดหมู่ย่อย [cite: 2025-12-19].
2.  **UI:** เพิ่มกล่องค้นหา (Search Input) สีเขียวมรกตไว้เหนือรายการย่อยเพื่อให้ดูแตกต่างจากส่วนอื่นๆ [cite: 2025-12-19].
3.  **Logic:** แก้ไข `currentChildren` ให้กรองข้อมูลตามชื่อแบบ Real-time และตั้งค่าให้ล้างคำค้นหาทุกครั้งที่คุณเปลี่ยนหมวดหมู่หลัก (เพื่อไม่ให้สับสน) [cite: 2025-12-19].
4.  **Empty State:** เพิ่มการแจ้งเตือนกรณีค้นหาแล้วไม่เจอข้อมูลครับ [cite: 2025-12-19].

หากคุณลงโค้ดแล้วอยากให้ปรับตำแหน่งหรือเปลี่ยนสีช่องค้นหา บอกผมได้เลยนะครับ!
<template>
  <div class="p-4 font-sans max-w-4xl mx-auto">
    
    <h2 class="text-3xl font-bold text-white tracking-tight mb-2">
      {{ $t('create_ticket.title') }}
    </h2>
    <p class="text-gray-400 mb-8 text-sm">{{ $t('create_ticket.subtitle') }}</p>

    <form v-on:submit="submitTicket" class="bg-[#282A2C] p-10 rounded-3xl shadow-xl border border-white/5 space-y-8">
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 border-b border-white/10 pb-6">
        <template v-if="currentUser.isAdmin">
          <div class="col-span-full">
            <label class="block text-sm font-medium text-blue-400 mb-1">{{ $t('create_ticket.search_requester') }} <span class="text-red-500">*</span></label>
            <div class="relative">
              <input 
                v-model="searchTerm" 
                @input="debouncedSearchUsers" 
                :disabled="!!selectedRequester"
                type="text" 
                :placeholder="$t('create_ticket.placeholder_search')" 
                class="w-full bg-[#1A1C1E] text-white p-3 rounded-xl border border-blue-500/30 focus:ring-2 focus:ring-blue-500 transition-colors disabled:cursor-not-allowed disabled:border-gray-700"
                :required="currentUser.isAdmin && !selectedRequester"
              />
              <div v-if="searchTerm.length >= 2 && searchResults.length > 0 && !selectedRequester" class="absolute z-10 w-full mt-2 bg-[#3A3D40] rounded-xl shadow-2xl max-h-60 overflow-y-auto border border-blue-500/30">
                <ul class="py-1">
                  <li 
                    v-for="user in searchResults" 
                    :key="user.id" 
                    @click="selectRequester(user)"
                    class="px-4 py-2 text-sm text-gray-200 hover:bg-blue-600 hover:text-white cursor-pointer transition-colors"
                  >
                    {{ user.full_name }} ({{ user.email }})
                  </li>
                </ul>
              </div>
              <p v-if="searchTerm.length >= 2 && searchResults.length === 0 && !selectedRequester" class="text-xs text-gray-500 mt-1 pl-1">{{ $t('create_ticket.user_not_found') }}</p>
            </div>
          </div>
          
          <div v-if="selectedRequester" class="col-span-full bg-[#1A1C1E] p-4 rounded-xl border border-blue-500/50">
            <p class="text-sm font-semibold text-blue-300 mb-1 flex justify-between items-center">
                <span>{{ $t('create_ticket.requester_label') }}: {{ selectedRequester.full_name }}</span>
                <button @click="clearRequester" type="button" class="text-red-400 hover:text-red-500 text-xs font-normal">
                    [X] {{ $t('create_ticket.change_requester') }}
                </button>
            </p>
            <div class="grid grid-cols-2 gap-x-6 text-xs text-gray-400">
                <p>{{ $t('create_ticket.email_label') }}: <span class="text-white">{{ selectedRequester.email || '-' }}</span></p>
                <p>{{ $t('create_ticket.name_label') }}: <span class="text-white">{{ selectedRequester.username || '-' }}</span></p>
                <p>{{ $t('create_ticket.department_label') }}: <span class="text-white">{{ selectedRequester.department || '-' }}</span></p>
            </div>
          </div>
          <div v-else class="col-span-full text-center py-4">
            <p class="text-red-400">{{ $t('create_ticket.no_requester_selected') }}</p>
          </div>
        </template>
        
        <template v-else>
          <div class="col-span-1">
            <label class="block text-sm font-medium text-gray-300 mb-1">{{ $t('create_ticket.name_label') }}</label>
            <input :value="currentUser.fullName" readonly type="text" class="w-full bg-[#1A1C1E] text-gray-400 p-3 rounded-xl border border-transparent cursor-not-allowed" />
          </div>
          <div class="col-span-1">
            <label class="block text-sm font-medium text-gray-300 mb-1">{{ $t('create_ticket.email_label') }}</label>
            <input :value="currentUser.email || '-'" readonly type="email" class="w-full bg-[#1A1C1E] text-gray-400 p-3 rounded-xl border border-transparent cursor-not-allowed" />
          </div>
          <div class="col-span-1">
            <label class="block text-sm font-medium text-gray-300 mb-1">{{ $t('create_ticket.name_label') }}</label>
            <input :value="currentUser.username" readonly type="text" class="w-full bg-[#1A1C1E] text-gray-400 p-3 rounded-xl border border-transparent cursor-not-allowed" />
          </div>
          <div class="col-span-1">
            <label class="block text-sm font-medium text-gray-300 mb-1">{{ $t('create_ticket.department_label') }}</label>
            <input :value="currentUser.department || '-'" readonly type="text" class="w-full bg-[#1A1C1E] text-gray-400 p-3 rounded-xl border border-transparent cursor-not-allowed" />
          </div>
        </template>
        
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
        
        <div class="col-span-1">
          <label class="block text-sm font-medium text-gray-300 mb-1">{{ $t('create_ticket.category_label') }}<span class="text-red-500">*</span></label>
          <select 
            v-model="selectedParentId" 
            v-on:change="onParentChange"
            required 
            class="w-full bg-[#1A1C1E] text-white p-3 rounded-xl border border-transparent focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <option :value="null">{{ $t('create_ticket.select_category') }}</option>
            <option v-for="cat in parentCategories" :key="cat.cat_id" :value="cat.cat_id">
              {{ cat.name }}
            </option>
          </select>
        </div>

        <div class="col-span-1">
          <label class="block text-sm font-medium text-gray-300 mb-1">{{ $t('create_ticket.sub_category_label') }}<span class="text-red-500">*</span></label>
          <select 
            v-model="form.subCategoryId" 
            required 
            :disabled="!selectedParentId || subCategories.length === 0"
            class="w-full bg-[#1A1C1E] text-white p-3 rounded-xl border border-transparent focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">{{ $t('create_ticket.select_sub_category') }}</option>
            <option v-for="sub in subCategories" :key="sub.sub_id" :value="sub.sub_id">
              {{ sub.name }}
            </option>
          </select>
        </div>

        <div class="col-span-full">
          <label class="block text-sm font-medium text-gray-300 mb-1">{{ $t('create_ticket.urgency_label') }} <span class="text-red-500">*</span></label>
          <select 
            v-model="form.userUrgency" 
            required 
            class="w-full bg-[#1A1C1E] text-white p-3 rounded-xl border border-transparent focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <option value="NORMAL">{{ $t('create_ticket.urgency_normal') }}</option>
            <option value="URGENT">{{ $t('create_ticket.urgency_urgent') }}</option>
          </select>
        </div>

        <div class="col-span-full">
          <label class="block text-sm font-medium text-gray-300 mb-1">{{ $t('create_ticket.description_label') }} <span class="text-red-500">*</span></label>
          <textarea v-model="form.description" required rows="5" :placeholder="$t('create_ticket.placeholder_desc')" class="w-full bg-[#1A1C1E] text-white p-3 rounded-xl border border-transparent focus:ring-2 focus:ring-blue-500 transition-colors placeholder-gray-500 resize-none"></textarea>
        </div>

        <!-- 📂 File Attachments -->
        <div class="col-span-full">
          <label class="block text-sm font-medium text-gray-300 mb-1">
            {{ $t('create_ticket.attachments_label') }}
          </label>
          <div 
            class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-white/10 border-dashed rounded-xl hover:border-blue-500/50 transition-colors cursor-pointer group"
            @click="$refs.fileInput.click()"
          >
            <div class="space-y-1 text-center">
              <svg class="mx-auto h-12 w-12 text-gray-400 group-hover:text-blue-400 transition-colors" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <div class="flex text-sm text-gray-400">
                <span class="relative cursor-pointer rounded-md font-medium text-blue-500 hover:text-blue-400">
                  Click to upload
                </span>
                <p class="pl-1 text-gray-400">or drag and drop</p>
              </div>
              <p class="text-xs text-gray-500">{{ $t('create_ticket.attachments_desc') }}</p>
            </div>
            <input 
              ref="fileInput" 
              type="file" 
              multiple 
              class="hidden" 
              @change="handleFileChange"
              accept=".png,.jpg,.jpeg,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
            />
          </div>

          <!-- File List -->
          <div v-if="attachments.length > 0" class="mt-4 space-y-2">
            <div v-for="(file, index) in attachments" :key="index" class="flex items-center justify-between p-2 bg-[#1A1C1E] rounded-lg border border-white/5">
              <div class="flex items-center gap-2 overflow-hidden">
                <svg v-if="file.type.includes('image')" class="w-4 h-4 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <svg v-else class="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                <span class="text-xs text-gray-300 truncate">{{ file.name }}</span>
                <span class="text-[10px] text-gray-500">({{ (file.size / 1024 / 1024).toFixed(2) }} MB)</span>
              </div>
              <button @click="removeFile(index)" type="button" class="text-red-400 hover:text-red-300 p-1">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
        </div>

        <div class="col-span-full bg-[#1A1C1E] p-5 rounded-2xl border border-white/5 space-y-6">
            
            <div class="flex items-start gap-3">
              <div class="flex items-center h-5">
                  <input 
                      id="purchaseReq" 
                      type="checkbox" 
                      v-model="isPurchaseRequest"
                      class="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-600 ring-offset-gray-800"
                  />
              </div>
              <div class="ml-2 text-sm">
                  <label for="purchaseReq" class="font-medium text-white">{{ $t('create_ticket.purchase_req') }}</label>
                  <p class="text-gray-500 text-xs mt-1">{{ $t('create_ticket.purchase_req_desc') }}</p>
              </div>
            </div>

            <div class="flex items-start gap-3 border-t border-white/5 pt-4">
              <div class="flex items-center h-5">
                  <input 
                      id="accessReq" 
                      type="checkbox" 
                      v-model="isAccessRequest"
                      class="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-600 ring-offset-gray-800"
                  />
              </div>
              <div class="ml-2 text-sm">
                  <label for="accessReq" class="font-medium text-white">{{ $t('create_ticket.access_req') }}</label>
                  <p class="text-gray-500 text-xs mt-1">{{ $t('create_ticket.access_req_desc') }}</p>
              </div>
            </div>

            <div v-if="isPurchaseRequest || isAccessRequest" class="mt-4 pl-6 animate-fade-in-down border-l-2 border-blue-500/30">
    <label class="block text-sm font-medium text-blue-400 mb-1">
        {{ isAccessRequest ? 'เลือกผู้อนุมัติสิทธิ์' : $t('create_ticket.approver_label') }} 
        <span class="text-red-500">*</span>
    </label>
    
              <div class="bg-[#282A2C] border border-blue-500/30 rounded-xl max-h-[150px] overflow-y-auto custom-scrollbar p-3">
                  <div v-if="displayManagers.length === 0" class="text-center text-gray-500 py-3 text-sm">
                      {{ $t('create_ticket.no_manager') }}
                  </div>
                  <div v-for="mgr in displayManagers" :key="mgr.id" 
                      class="flex items-center p-2 hover:bg-[#3A3D40] rounded transition-colors cursor-pointer" 
                      @click="toggleApproverSelection(mgr.id)">
                      
                      <input 
                          type="checkbox" 
                          :value="mgr.id" 
                          v-model="form.approverIds" 
                          :disabled="displayManagers.length === 0"
                          class="h-4 w-4 rounded border-gray-600 bg-[#333] text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800 mr-3"
                          @click.stop
                      />
                      <span class="text-sm text-gray-200 select-none">
                          {{ mgr.full_name }} 
                          <span v-if="isAccessRequest" class="text-gray-500 text-[10px] ml-1">
                              ({{ mgr.title || 'N/A' }})
                          </span>
                      </span>
                  </div>
              </div>

              <p v-if="displayManagers.length > 0" class="text-xs text-gray-500 mt-2">
                  {{ $t('create_ticket.selected_count', { count: form.approverIds.length }) }}
              </p>
          </div>
        </div>

      </div>

      <div class="pt-8 flex justify-end">
        <button 
          type="submit" 
          :disabled="isSubmitting || (currentUser.isAdmin && !selectedRequester) || ((isPurchaseRequest || isAccessRequest) && form.approverIds.length === 0)"
          class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-colors duration-200 shadow-lg shadow-blue-500/30 flex items-center gap-2 tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="isSubmitting">{{ $t('create_ticket.sending') }}</span>
          <span v-else>{{ $t('create_ticket.btn_submit') }}</span>
        </button>
      </div>

    </form>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, watch, getCurrentInstance } from 'vue';
import { useRouter } from 'vue-router';
// 🛑 ลบ import axios ออกไป
import { useUserStore } from '@/stores/userStore';
import { useModalStore } from '@/stores/modalStore';
import { useI18n } from 'vue-i18n';

// 1. เข้าถึง Global Properties ($api)
const { proxy } = getCurrentInstance();
const $api = proxy.$api; 
const userStore = useUserStore(); // 2. ดึง UserStore

const { t } = useI18n(); 
const router = useRouter();
const modal = useModalStore();
const isSubmitting = ref(false);

const userProfile = computed(() => userStore.userProfile);

const currentUser = computed(() => {
    const role = userProfile.value.role ? userProfile.value.role.toUpperCase() : '';
    const isAdminRole = role === 'ADMIN'; 
    
    return {
        ...userProfile.value,
        isAdmin: isAdminRole, 
        id: userProfile.value.id || userProfile.value.user_id 
    };
});

// ✅ 3. Helper function สำหรับสร้าง Header (แก้ปัญหา 401)
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

// ✅ แยกเก็บ List แม่และลูก
const mainList = ref([]);
const subList = ref([]);
const requesterManagers = ref([]); 
const accessApprovers = ref([]); // ✅ เก็บรายชื่อ Rank 3-4 ทั้งบริษัท
const selectedParentId = ref(null);
const isPurchaseRequest = ref(false);
const isAccessRequest = ref(false); // ✅ เพิ่มตัวแปรสำหรับ Checkbox ขอสิทธิ์

const form = ref({
    subCategoryId: '',
    userUrgency: 'NORMAL',
    description: '',
    approverIds: [],
});
const attachments = ref([]);

// === Logic สำหรับ Admin Search ===
const searchTerm = ref('');
const searchResults = ref([]);
const selectedRequester = ref(null); 
let searchTimeout = null;

const getRequesterId = () => {
    if (currentUser.value.isAdmin && selectedRequester.value) {
        return selectedRequester.value.id;
    }
    return currentUser.value.id;
};

// ✅ Computed: เลือกว่าจะเอา Manager ชุดไหนมาแสดง
const displayManagers = computed(() => {
    // 🚩 ถ้าติ๊กขอสิทธิ์เข้าถึง ให้ใช้รายชื่อ Rank 3-4 ทั้งบริษัท
    if (isAccessRequest.value) return accessApprovers.value;
    // 🚩 ถ้าติ๊กขอซื้อ (หรือไม่ได้ติ๊กอะไร) ให้ใช้หัวหน้าสายตรง
    return requesterManagers.value;
});

const toggleApproverSelection = (managerId) => {
    const index = form.value.approverIds.indexOf(managerId);
    if (index === -1) {
        form.value.approverIds.push(managerId);
    } else {
        form.value.approverIds.splice(index, 1);
    }
};

const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Check Max 5 files
    if (attachments.value.length + files.length > 5) {
        modal.alert('แนบไฟล์ได้สูงสุด 5 ไฟล์', 'คำเตือน', 'warning');
        return;
    }

    // Check size (10MB)
    const largeFiles = files.filter(f => f.size > 10 * 1024 * 1024);
    if (largeFiles.length > 0) {
        modal.alert('บางไฟล์มีขนาดเกิน 10MB', 'คำเตือน', 'warning');
        return;
    }

    attachments.value.push(...files);
};

const removeFile = (index) => {
    attachments.value.splice(index, 1);
};

// 🛑 4. Fetch Requester Managers (GET)
const fetchRequesterManagers = async (requesterId) => {
    if (!$api || !requesterId) {
        requesterManagers.value = [];
        return;
    }
    const options = getAuthOptions();
    if (!options) return;

    try {
        const res = await $api.get(`/users/assigned-managers/${requesterId}`, options); // 🛑 ใช้ $api และส่ง options
        if(res.data.success) {
            requesterManagers.value = res.data.data;
            if (requesterManagers.value.length === 0 && !isAccessRequest.value) {
                form.value.approverIds = [];
            }
        }
    } catch (error) { 
        console.error('Error fetching assigned managers:', error); 
        requesterManagers.value = [];
    }
};

// ✅ 4.1 Fetch Access Approvers (Rank 3-4 ทั้งบริษัท)
const fetchAccessApprovers = async () => {
    if (!$api) return;
    const options = getAuthOptions();
    if (!options) return;
    try {
        const res = await $api.get('/users/access-approvers', options);
        if (res.data.success) accessApprovers.value = res.data.data;
    } catch (error) { console.error('Error fetching access approvers:', error); }
};

// 🛑 5. Search Users (GET)
const searchUsers = async () => {
    if (searchTerm.value.length < 2) {
        searchResults.value = [];
        return;
    }
    if (selectedRequester.value) return; 

    if (!$api) return;
    const options = getAuthOptions();
    if (!options) return;

    try {
        const res = await $api.get(`/users/search?q=${searchTerm.value}`, options); // 🛑 ใช้ $api และส่ง options
        searchResults.value = res.data.data; 
    } catch (error) {
        console.error('Error searching users:', error);
        searchResults.value = [];
    }
};

const debouncedSearchUsers = () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(searchUsers, 300); 
};

const selectRequester = (user) => {
    selectedRequester.value = user;
    searchResults.value = []; 
    fetchRequesterManagers(user.id); 
};

const clearRequester = () => {
    selectedRequester.value = null;
    searchTerm.value = '';
    searchResults.value = [];
    requesterManagers.value = []; 
    form.value.approverIds = [];
};
// === สิ้นสุด Logic สำหรับ Admin Search ===

// 🛑 6. Fetch Categories (GET)
const fetchCategories = async () => {
    if (!$api) return;
    const options = getAuthOptions();
    if (!options) return;

    try {
        // ✅ API ใหม่ส่งกลับมาเป็น { mainCategories, subCategories }
        const res = await $api.get('/categories', options); // 🛑 ใช้ $api และส่ง options
        if(res.data.success) {
            mainList.value = res.data.data.mainCategories;
            subList.value = res.data.data.subCategories;
        }
    } catch (error) { console.error("Error fetching categories:", error); }
};

// Computed: List หมวดหมู่หลัก (ใช้ mainList ตรงๆ)
const parentCategories = computed(() => mainList.value);

// Computed: Filter หมวดย่อย ตาม selectedParentId
const subCategories = computed(() => {
    if(!selectedParentId.value) return [];
    // ✅ ใช้ cat_id (FK) เทียบกับ cat_id ที่เลือก
    return subList.value.filter(sub => sub.cat_id === selectedParentId.value);
});

const onParentChange = () => { form.value.subCategoryId = ''; };

// 🛑 7. Submit Ticket (POST)
const submitTicket = async (event) => {
    if (event) event.preventDefault();

    const finalRequesterId = getRequesterId();

    if (currentUser.value.isAdmin && !selectedRequester.value) {
        modal.alert(t('create_ticket.alert_select_requester'), t('create_ticket.error_title'), t('modal.warning'));
        return;
    }

    // ✅ ปรับ Logic ตรวจสอบ: ถ้าเลือกขอซื้อ "หรือ" ขอสิทธิ์ แล้วยังไม่เลือกผู้อนุมัติ
    if ((isPurchaseRequest.value || isAccessRequest.value) && form.value.approverIds.length === 0) {
        modal.alert(t('create_ticket.alert_select_approver'), t('create_ticket.error_title'), t('modal.warning'));
        return;
    }
    
    if(modal) {
        const confirmed = await modal.confirm(t('create_ticket.confirm_submit'), t('modal.warning'));
        if(!confirmed) return;
    } else if(!confirm(t('create_ticket.confirm_submit'))) return;

    isSubmitting.value = true;
    if (!$api) return;
    const options = getAuthOptions();
    if (!options) { isSubmitting.value = false; return; }

    try {
        // หาชื่อ Subject จาก Sub Category ที่เลือก (ถ้าไม่มีใช้ Main)
        const selectedSub = subList.value.find(s => s.sub_id === form.value.subCategoryId);
        const selectedMain = mainList.value.find(m => m.cat_id === selectedParentId.value);
        
        // Subject ตั้งเป็น "Main - Sub" หรือแค่ "Main"
        let subjectName = selectedMain ? selectedMain.name : 'General Issue';
        if (selectedSub) {
            subjectName += ` - ${selectedSub.name}`;
        }
        
        const approverIdStr = form.value.approverIds.length > 0 ? form.value.approverIds.join(',') : null;

        // ✅ ใชั FormData แทน JSON
        const formData = new FormData();
        formData.append('subject', subjectName);
        formData.append('description', form.value.description);
        formData.append('categoryId', selectedParentId.value);
        formData.append('subCategoryId', form.value.subCategoryId);
        formData.append('user_urgency', form.value.userUrgency);
        formData.append('requesterId', finalRequesterId);
        formData.append('priority', 'MEDIUM');
        
        if (isPurchaseRequest.value || isAccessRequest.value) {
            formData.append('approverIdStr', approverIdStr);
        }

        // แนบไฟล์
        attachments.value.forEach(file => {
            formData.append('attachments', file);
        });

        // ✅ ต้องตั้ง Header Content-Type เป็น multipart/form-data
        const multipartOptions = {
            headers: {
                ...options.headers,
                'Content-Type': 'multipart/form-data'
            }
        };

        const response = await $api.post('/tickets/create', formData, multipartOptions); // 🛑 ใช้ $api และส่ง options

        if (response.data.success) {
            modal.alert(t('create_ticket.success_msg', { ticketNo: response.data.ticketNo }), t('create_ticket.success_title'), 'success');
            router.push('/app/tickets'); 
        }

    } catch (error) {
        const msg = error.response?.data?.message || error.message;
        modal.alert(t('create_ticket.error_prefix') + msg, t('create_ticket.error_title'), 'error');
    } finally {
        isSubmitting.value = false;
    }
};

onMounted(() => {
    // 🛑 ตรวจสอบการล็อกอินก่อนเรียก fetchCategories
    if (userStore.isLoggedIn) {
        fetchCategories();
        fetchAccessApprovers(); // ✅ โหลดรายชื่อผู้บริหารรอไว้เลย
        if (!currentUser.value.isAdmin) {
            fetchRequesterManagers(currentUser.value.id);
        } else {
            clearRequester();
        }
    } else {
        modal.alert(t('messages.login_required'), t('create_ticket.error_title'), 'error');
        router.push('/login'); // หรือไปหน้า Login
    }
});

// ✅ Watch การสลับ Checkbox
watch([isPurchaseRequest, isAccessRequest], () => {
    form.value.approverIds = []; // ล้างค่าที่เลือกไว้เมื่อเปลี่ยนประเภทคำขอ
});

watch(selectedRequester, (newRequester) => {
    if (newRequester) {
        fetchRequesterManagers(newRequester.id);
    } else {
        requesterManagers.value = [];
    }
});
</script>
<style scoped>
.animate-fade-in-down {
  animation: fadeInDown 0.3s ease-out;
}
@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
/* Scrollbar */
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 10px; }
</style>
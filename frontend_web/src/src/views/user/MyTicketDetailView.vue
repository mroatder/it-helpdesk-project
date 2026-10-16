<template>
  <div class="p-6 font-sans max-w-7xl mx-auto pb-24 text-gray-300">
    
    <div v-if="loading" class="text-center py-20">
      <svg class="animate-spin h-10 w-10 mx-auto text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      <p class="mt-4 text-gray-500">{{ t('ticket.loading_message') }}</p>
    </div>

    <div v-else-if="ticket && ticket.ticket_id">
        
      <button @click="$router.go(-1)" class="mb-4 flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
        {{ t('ticket.back_button') }}
      </button>

      <div v-if="ticket.status === 'WAITING APPROVE' && approvalInfo" class="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 mb-6 flex items-center gap-4 animate-pulse-slow">
        <div class="p-2 bg-yellow-500/20 rounded-lg text-yellow-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <div>
          <h4 class="text-yellow-500 font-bold">Waiting for Approval</h4>
          <p class="text-yellow-200/70 text-sm mt-0.5">
            ใบงานของคุณกำลังรอการพิจารณาอนุมัติจาก 
            <span class="text-white font-bold">{{ approvalInfo.approver_name }}</span>
          </p>
        </div>
      </div>

      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-white/5 pb-6">
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-2">
            <span class="text-blue-400 font-mono text-xl font-bold tracking-wide">#{{ ticket.ticket_no }}</span>
            <span :class="getTypeClasses(ticket.ticket_type)" class="px-3 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wide shadow-sm flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
              {{ ticket.ticket_type || 'INCIDENT' }}
            </span>
            <span :class="getStatusClasses(ticket.status)" class="px-3 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wide shadow-sm">
              {{ ticket.status === 'WAITING APPROVE' ? 'WAITING APPROVAL' : ticket.status }}
            </span>
            <span :class="getPriorityClasses(ticket.priority)" class="px-3 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wide shadow-sm">
              {{ ticket.priority }}
            </span>
          </div>
          <h1 class="text-3xl font-bold text-white tracking-tight leading-tight">{{ ticket.subject }}</h1>
          <p class="text-sm text-gray-500 mt-1">{{ t('ticket.created_at_prefix') }} {{ formatDate(ticket.created_at) }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-8">
          <div class="bg-[#282A2C] p-8 rounded-2xl border border-white/5 shadow-lg">
            <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"></path></svg>
              {{ t('ticket.details_title') }}
            </h3>
            <div class="text-gray-300 leading-relaxed text-sm whitespace-pre-line pl-1">{{ ticket.description }}</div>
            
            <!-- 📎 Attachments -->
            <div v-if="ticket.attachments && ticket.attachments.length > 0" class="mt-8 pt-6 border-t border-white/5">
              <h4 class="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <svg class="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                {{ t('create_ticket.attachments_label') }}
              </h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div v-for="file in ticket.attachments" :key="file.attachment_id" class="p-3 bg-[#1A1C1E] border border-white/5 rounded-xl hover:border-blue-500/30 transition-all flex items-center justify-between group">
                  <div class="flex items-center gap-3 overflow-hidden">
                    <div class="w-10 h-10 rounded-lg bg-[#282A2C] flex items-center justify-center shrink-0">
                      <svg v-if="file.file_type.includes('image')" class="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <svg v-else class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                    </div>
                    <div class="overflow-hidden">
                      <p class="text-xs text-white font-medium truncate">{{ file.file_name }}</p>
                      <p class="text-[10px] text-gray-500">{{ (file.file_size / 1024 / 1024).toFixed(2) }} MB</p>
                    </div>
                  </div>
                  <a :href="getFileUrl(file.file_path)" target="_blank" title="View File" class="p-2 text-gray-400 hover:text-blue-400 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all text-xs flex items-center gap-1 border border-white/5 rounded-lg bg-white/5 md:bg-transparent">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    <span class="md:hidden">ดูไฟล์</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- ⛓️ Approval Path (User View) -->
          <div v-if="approvalChain.length > 0" class="bg-[#282A2C] p-6 rounded-2xl border border-white/5 shadow-lg">
            <h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              สถานะการอนุมัติ (Approval Status)
            </h3>
            <div class="flex flex-col gap-6">
              <div v-for="(step, index) in approvalChain" :key="index" class="space-y-2">
                <div class="flex items-center gap-4">
                  <div :class="['w-3 h-3 rounded-full', step.status === 'APPROVED' ? 'bg-green-500' : step.status === 'REJECTED' ? 'bg-red-500' : step.status === 'PENDING' ? 'bg-blue-500 animate-pulse' : 'bg-gray-600']"></div>
                  <div class="flex-1 text-sm">
                    <p class="font-bold text-white">{{ step.approver_name }} <span class="font-normal text-gray-500">({{ step.approver_title }})</span></p>
                    <p class="text-[11px] text-gray-500">
                      {{ statusLabel(step.status) }}
                    </p>
                  </div>
                  <div v-if="step.approved_at" class="text-[10px] text-gray-600 font-mono">{{ formatDate(step.approved_at) }}</div>
                </div>
                <!-- ✨ แสดง Comment ของหัวหน้างาน (ถ้ามี) -->
                <div v-if="step.comment" class="ml-7">
                  <p class="text-xs text-blue-400 bg-blue-500/5 p-3 rounded-xl border border-blue-500/10 italic leading-relaxed">
                    " {{ step.comment }} "
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-[#282A2C] p-6 rounded-2xl border border-white/5 shadow-lg">
            <h3 class="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              {{ t('ticket.timeline_title') }}
            </h3>
            <div class="relative pl-4 pt-2 pb-4">
              <div class="absolute left-[29px] top-4 bottom-4 w-0.5 bg-white/10"></div>
              <div v-for="log in logs" :key="log.log_id" class="relative pl-12 mb-8 last:mb-0 group">
                <div class="absolute left-[23px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-[#282A2C] z-10 shadow-sm transition-transform group-hover:scale-110" :class="getActionColor(log.action)"></div>
                <div class="flex items-center gap-2 mb-1.5">
                  <span class="text-xs font-mono text-gray-500 bg-white/5 px-2 py-0.5 rounded">{{ formatDate(log.created_at) }}</span>
                  <span class="text-xs text-gray-600">{{ t('log.actor_prefix') }} {{ log.actor_name }}</span>
                </div>
                <div class="bg-[#1A1C1E] p-4 rounded-xl border border-white/5 shadow-sm hover:border-white/10 transition-colors">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-sm font-bold text-white">{{ getActionLabel(log.action) }}</span>
                  </div>
                  <p v-if="log.message" class="text-sm text-gray-300 leading-relaxed whitespace-pre-line mt-1">{{ log.message }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="lg:col-span-1 space-y-6">
          <div class="bg-[#282A2C] p-5 rounded-2xl border border-white/5 shadow-lg">
            <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-white/5 pb-2">{{ t('ticket.tech_section_title') }}</h4>
            <div v-if="ticket.technician_name" class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-md text-sm">
                {{ ticket.technician_name.substring(0,2).toUpperCase() }}
              </div>
              <div>
                <p class="text-white font-bold text-sm">{{ ticket.technician_name }}</p>
                <p class="text-xs text-blue-400">{{ t('tech.role_label') }}</p> 
              </div>
            </div>
            <div v-else class="flex items-center gap-3 text-gray-500 italic text-sm py-2">
              <div class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <span>{{ t('ticket.tech_no_assign') }}</span>
            </div>
          </div>
          <div class="bg-[#282A2C] p-5 rounded-2xl border border-white/5 shadow-lg space-y-4">
            <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-white/5 pb-2">{{ t('ticket.info_section_title') }}</h4>
            <div>
              <p class="text-xs text-gray-500 mb-1">{{ t('ticket.info_urgency') }}</p>
              <span :class="getPriorityClasses(ticket.priority)" class="px-2 py-1 rounded text-xs font-medium border inline-block">
                {{ ticket.priority }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="flex flex-col items-center justify-center py-32 border border-white/5 rounded-3xl bg-[#282A2C] shadow-2xl">
      <div class="p-5 bg-red-500/10 rounded-full mb-6 ring-1 ring-red-500/30">
        <svg class="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
      </div>
      <h2 class="text-2xl font-bold text-white mb-2 uppercase tracking-widest text-center">Access Denied</h2>
      <p class="text-gray-400 mb-8 text-center max-w-md px-6">
        คุณไม่มีสิทธิ์เข้าถึงข้อมูลตั๋วใบนี้ หรือตั๋วถูกลบออกจากระบบแล้ว
      </p>
      <button @click="$router.push('/app/my-tickets')" class="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-blue-600/20">
        กลับไปหน้าตั๋วของฉัน
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue'; 
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { useModalStore } from '@/stores/modalStore';
import { useI18n } from 'vue-i18n';

const { proxy } = getCurrentInstance();
const $api = proxy.$api; 
const userStore = useUserStore();
const modal = useModalStore();
const route = useRoute();
const router = useRouter();
const { t } = useI18n(); 

const ticketId = route.params.id;
const ticket = ref(null); // ✅ แก้ไข 1: เปลี่ยนจาก {} เป็น null
const logs = ref([]);
const approvalInfo = ref(null);
const approvalChain = ref([]); // ✨ สำหรับพนักงานคนแจ้ง ดูว่าใครอนุมัติ
const loading = ref(true);

const getAuthOptions = () => {
    const token = userStore.getAuthToken;
    return token ? { headers: { Authorization: `Bearer ${token}` } } : null;
};

const fetchTicket = async () => {
    if (!$api) return false;
    const options = getAuthOptions();
    if (!options) return false;
    try {
        const res = await $api.get(`/tickets/${ticketId}`, options);
        if(res.data.success) {
            ticket.value = res.data.data;
            return true;
        }
        return false;
    } catch (err) {
        ticket.value = null; 
        
        if (err.response && err.response.status === 403) {
            if (modal) {
                // ✅ แก้ไข: ใช้ t() เพื่อดึงข้อความจากไฟล์ i18n
                await modal.alert(
                    t('ticket_detail.access_denied_msg'),   // ข้อความเนื้อหา
                    t('ticket_detail.access_denied_title'), // หัวข้อ
                    "error"
                );
            }
            router.push('/app/my-tickets');
        } else {
            // กรณี Error อื่นๆ ก็ควรใช้ i18n เช่นกัน
            router.push('/app/my-tickets');
        }
        return false;
    }
};

const fetchLogs = async () => {
    try {
        const res = await $api.get(`/tickets/${ticketId}/logs`, getAuthOptions());
        if(res.data.success) logs.value = res.data.data;
    } catch (err) { console.error("Error fetching logs:", err); }
};

const fetchApprovalInfo = async () => {
    try {
        const res = await $api.get(`/tickets/${ticketId}/approval`, getAuthOptions());
        if(res.data.success && res.data.data) approvalInfo.value = res.data.data;
    } catch (err) { console.log("No approval info for user view:", err); }
};

const fetchApprovalChain = async () => {
    try {
        const res = await $api.get(`/tickets/${ticketId}/approval-chain`, getAuthOptions());
        if(res.data.success) approvalChain.value = res.data.data;
    } catch (err) { console.error("Error fetching chain:", err); }
};

const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString('th-TH', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }) : '';

const getFileUrl = (filePath) => {
    if (!filePath) return '';
    const baseUrl = import.meta.env.VITE_API_URL || '/api';
    const rootUrl = baseUrl.replace('/api', '');
    return `${rootUrl}/uploads${filePath}`;
};

const statusLabel = (status) => {
    const labels = {
        'APPROVED': 'อนุมัติแล้ว',
        'REJECTED': 'ปฏิเสธ/ไม่อนุมัติ',
        'PENDING': 'กำลังพิจารณา',
        'BLOCKED': 'รอลำดับก่อนหน้า'
    };
    return labels[status] || status;
};
const getActionLabel = (action) => t(`log_action.${action}`, action); 
const getActionColor = (action) => ({ 'RESOLVED': 'bg-green-500', 'APPROVED': 'bg-emerald-400', 'REJECTED': 'bg-red-500', 'REQ_APPROVAL': 'bg-yellow-500', 'PURCHASING': 'bg-orange-500', 'ACKNOWLEDGED': 'bg-blue-600' }[action] || 'bg-gray-600');
const getStatusClasses = (status) => ({ 'WAITING APPROVE': 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20', 'NEW': 'bg-blue-500/10 text-blue-400 border border-blue-500/20', 'IN PROGRESS': 'bg-purple-500/10 text-purple-400 border-purple-500/20', 'PENDING': 'bg-orange-500/10 text-orange-400 border-orange-500/20', 'RESOLVED': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', 'REJECTED': 'bg-red-500/10 text-red-400 border-red-500/20' }[status] || 'bg-gray-700 text-gray-300');
const getTypeClasses = (type) => type === 'SUPPORT' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20';
const getPriorityClasses = (priority) => ({ 'LOW': 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10', 'MEDIUM': 'text-yellow-400 border-yellow-500/20 bg-yellow-500/10', 'HIGH': 'text-orange-400 border-orange-500/20 bg-orange-500/10', 'VERY_HIGH': 'text-red-400 border-red-500/20 bg-red-500/10' }[priority] || 'text-gray-400 border-gray-600');

onMounted(async () => {
    if (!userStore.isLoggedIn) { loading.value = false; return; }
    loading.value = true;
    
    // ✅ แก้ไข 3: ตรวจสอบสิทธิ์ตั๋วหลักก่อน ถ้าผ่านค่อยไปดึงข้อมูลเสริม (Logs, Approver)
    const success = await fetchTicket();
    if (success) {
        await Promise.all([
            fetchLogs(), 
            fetchApprovalInfo(),
            fetchApprovalChain()
        ]);
    }
    loading.value = false;
});
</script>

<style scoped>
.animate-pulse-slow { animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.8; } }
</style>
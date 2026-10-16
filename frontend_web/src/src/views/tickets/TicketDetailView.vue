<template>
  <div class="p-6 font-sans max-w-7xl mx-auto pb-24 text-gray-300">
    
    <div v-if="loading" class="text-center py-20">
      <svg class="animate-spin h-10 w-10 mx-auto text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      <p class="mt-4 text-gray-500">{{ $t('ticket_detail.loading') }}</p>
    </div>

    <div v-else-if="ticket && ticket.ticket_id">
      
      <button 
          @click="$router.go(-1)" 
          class="mb-4 flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
        {{ $t('ticket_detail.back_to_list') }} 
      </button>

      <div v-if="ticket.status === 'WAITING APPROVE' && approvalInfo" class="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 mb-6 flex items-start gap-4">
        <div class="p-2 bg-yellow-500/20 rounded-lg text-yellow-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <div class="flex-1">
          <h4 class="text-yellow-500 font-bold text-lg">Waiting for Approval</h4>
          <p class="text-yellow-200/70 text-sm mt-1">
            {{ $t('ticket_detail.pending_desc_prefix') }} <span class="text-white font-medium">{{ approvalInfo.approver_name }}</span>
          </p>
        </div>
        
        <div v-if="isCurrentUserApprover" class="flex gap-2">
          <button v-on:click="handleApproval('REJECTED')" class="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg text-sm font-bold transition-colors">{{ $t('approval_list.btn_reject') }}</button>
          <button v-on:click="handleApproval('APPROVED')" class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-green-500/20 transition-colors">{{ $t('approval_list.btn_approve') }}</button>
        </div>
      </div>

      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-white/5 pb-6">
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-2">
            <span class="text-blue-400 font-mono text-xl font-bold tracking-wide">#{{ ticket['ticket_no'] }}</span>
            <span :class="getTypeClasses(ticket.ticket_type)" class="px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider shadow-sm flex items-center gap-1.5 transition-all"><span class="w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_5px_currentColor]"></span>{{ ticket.ticket_type || 'INCIDENT' }}</span>
            <span :class="getStatusClasses(ticket.status)" class="px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider shadow-sm transition-all">{{ ticket.status }}</span>
            <span :class="getPriorityClasses(ticket.priority)" class="px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider shadow-sm transition-all">{{ ticket.priority }}</span>
          </div>
          <h1 class="text-3xl font-bold text-white tracking-tight leading-tight">{{ ticket.subject }}</h1>
          <p class="text-sm text-gray-500 mt-1">{{ $t('ticket_detail.created_on') }} {{ formatDate(ticket.created_at) }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-8">
          <div class="bg-[#282A2C] p-8 rounded-2xl border border-white/5 shadow-lg">
            <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-white/5 pb-2"><svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"></path></svg>{{ $t('ticket_detail.description_title') }}</h3>
            <div class="text-gray-300 leading-relaxed text-sm whitespace-pre-line pl-1">{{ ticket.description }}</div>
            
            <!-- 📎 Attachments -->
            <div v-if="ticket.attachments && ticket.attachments.length > 0" class="mt-8 pt-6 border-t border-white/5">
              <h4 class="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <svg class="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                {{ $t('create_ticket.attachments_label') }}
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

          <!-- ⛓️ Approval Path (Admins/Techs View) -->
          <div v-if="approvalChain.length > 0" class="bg-[#282A2C] p-6 rounded-2xl border border-white/5 shadow-lg">
            <h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              เส้นทางการอนุมัติ (Approval Status)
            </h3>
            <div class="flex flex-col gap-6">
              <div v-for="(step, index) in approvalChain" :key="index" class="space-y-2">
                <div class="flex items-center gap-4">
                  <div :class="['w-3 h-3 rounded-full', step.status === 'APPROVED' ? 'bg-green-500' : step.status === 'REJECTED' ? 'bg-red-500' : step.status === 'PENDING' ? 'bg-blue-500 animate-pulse' : 'bg-gray-600']"></div>
                  <div class="flex-1 text-sm">
                    <p class="font-bold text-white">{{ step.approver_name }} <span class="font-normal text-gray-500">({{ step.approver_title }})</span></p>
                    <p class="text-[11px] text-gray-500">
                      {{ step.status === 'APPROVED' ? 'อนุมัติแล้ว' : step.status === 'REJECTED' ? 'ปฏิเสธ' : step.status === 'PENDING' ? 'กำลังพิจารณา' : 'รอลำดับถัดไป' }}
                    </p>
                  </div>
                  <div v-if="step.approved_at" class="text-[10px] text-gray-600 font-mono">{{ formatDate(step.approved_at) }}</div>
                </div>
                <div v-if="step.comment" class="ml-7">
                  <p class="text-xs text-blue-400 bg-blue-500/5 p-3 rounded-xl border border-blue-500/10 italic leading-relaxed">
                    " {{ step.comment }} "
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-[#282A2C] p-6 rounded-2xl border border-white/5 shadow-lg">
            <h3 class="text-lg font-bold text-white mb-6 flex items-center gap-2"><svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>{{ $t('ticket_detail.history_title') }}</h3>
            <div class="space-y-8 relative pl-2">
              <div class="absolute left-6 top-2 bottom-2 w-0.5 bg-white/5"></div>
              <div v-for="log in logs" :key="log.log_id" class="relative pl-12">
                <div class="absolute left-4 top-1 w-4 h-4 rounded-full border-4 border-[#282A2C] z-10" :class="getActionColor(log.action)"></div>
                <div class="flex justify-between items-center mb-2">
                  <span class="text-sm font-bold text-white emoji-support">{{ getActionLabel(log.action) }} <span class="text-gray-500 font-normal">{{ $t('ticket_detail.by') }} {{ log.actor_name }}</span></span>
                  <span class="text-xs text-gray-500">{{ formatDate(log.created_at) }}</span>
                </div>
                <div class="bg-[#1A1C1E] p-4 rounded-xl border border-white/5 text-sm text-gray-300 shadow-sm whitespace-pre-line">{{ log.message || '-' }}</div>
              </div>
              <div v-if="logs.length === 0" class="text-center text-gray-500 py-4">{{ $t('ticket_detail.no_logs') }}</div>
            </div>

            <div v-if="ticket.status !== 'WAITING APPROVE' && ticket.status !== 'REJECTED'" class="mt-8 pt-6 border-t border-white/5 items-start">
              <p class="text-xs text-gray-400 mb-3 font-bold uppercase tracking-wider">{{ $t('ticket_detail.update_workflow_title') }}</p>
              <div class="flex gap-4">
                <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-blue-500 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white shadow-inner">IT</div>
                <div class="flex-1 space-y-3">
                  <select v-model="newLog.action" 
                          class="w-full p-2.5 rounded-xl border focus:ring-2 focus:ring-blue-500 text-sm emoji-support transition-all bg-[#1A1C1E] text-white border-white/10">
                      <option v-for="opt in availableActions" :key="opt.value" :value="opt.value" :disabled="opt.disabled">{{ opt.label }}</option>
                  </select>
                  <textarea v-model="newLog.message" rows="3" 
                            :disabled="isCommentDisabled"
                            :placeholder="commentPlaceholder" 
                            class="w-full bg-[#1A1C1E] text-white p-3 rounded-xl border border-white/10 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder-gray-600 transition-all resize-none disabled:opacity-60 disabled:cursor-not-allowed"></textarea>
                  <div class="flex justify-end mt-3 gap-2"><button v-on:click="addLog" :disabled="isSubmitting || isCommentDisabled" class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-colors disabled:opacity-50 flex items-center gap-2"><svg v-if="isSubmitting" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>{{ $t('ticket_detail.btn_post') }}</button></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-1 space-y-6">
          <div class="bg-[#282A2C] p-5 rounded-2xl border border-white/5 shadow-lg">
            <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-white/5 pb-2">{{ $t('ticket_detail.requester_title') }}</h4>
            <div class="flex items-center gap-3 mb-4">
              <div class="w-12 h-12 rounded-full bg-pink-600 flex items-center justify-center text-white font-bold shadow-md">{{ ticket.requester_name ? ticket.requester_name.substring(0,2).toUpperCase() : '??' }}</div>
              <div><p class="text-white font-bold text-base">{{ ticket.requester_name }}</p><p class="text-xs text-gray-400">{{ ticket.requester_dept }}</p></div>
            </div>
            <div class="space-y-2"><div class="flex justify-between text-xs"><span class="text-gray-500">{{ $t('ticket_detail.email') }}</span><a :href="`mailto:${ticket.requester_email}`" class="text-blue-400 hover:underline">{{ ticket.requester_email }}</a></div></div>
          </div>

          <div class="bg-[#282A2C] p-5 rounded-2xl border border-white/5 shadow-lg space-y-5">
              <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-white/5 pb-2">{{ $t('ticket_detail.properties_title') }}</h4>
              
              <div>
                  <p class="text-xs text-gray-500 mb-2 font-bold">{{ $t('ticket_list.col_status') }}</p>
                  <div class="flex justify-start">
                      <span :class="getStatusClasses(ticket.status)" 
                            class="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm min-w-[100px] inline-block text-center border">
                          {{ ticket.status === 'WAITING APPROVE' ? 'Waiting Approval' : ticket.status }}
                      </span>
                  </div>
              </div>

              <div>
                  <p class="text-xs text-gray-500 mb-2">{{ $t('ticket_list.col_priority') }}</p>
                  <div class="relative">
                      <select v-model="ticket.priority" @change="updatePriorityOnly"
                          class="w-full bg-[#1A1C1E] text-white pl-3 pr-8 py-2 rounded-lg border border-white/10 focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer text-sm font-normal transition-all">
                          <option value="" disabled class="bg-[#282A2C] text-gray-400">{{ $t('ticket_detail.select_priority_placeholder') }}</option>
                          <option value="LOW" class="bg-[#282A2C] text-white">Low</option>
                          <option value="MEDIUM" class="bg-[#282A2C] text-white">Medium</option>
                          <option value="HIGH" class="bg-[#282A2C] text-white">High</option>
                          <option value="VERY_HIGH" class="bg-[#282A2C] text-white">Critical</option>
                      </select>
                      <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-current opacity-60">
                          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                  </div>
              </div>

              <div>
                  <p class="text-xs text-gray-500 mb-2">{{ $t('ticket_detail.type_label') }}</p>
                  <div class="relative">
                      <select v-model="ticket.ticket_type" v-on:change="updateTicketType" class="w-full bg-[#1A1C1E] text-white pl-3 pr-8 py-2 rounded-lg border border-white/10 focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer text-sm font-normal">
                          <option value="" disabled class="bg-[#1A1C1E] text-gray-400">{{ $t('ticket_detail.select_type_placeholder') }}</option>
                          <option value="INCIDENT">{{ $t('ticket_detail.type_incident') }}</option>
                          <option value="SUPPORT">{{ $t('ticket_detail.type_support') }}</option>
                      </select>
                      <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                  </div>
              </div>

              <div>
                  <p class="text-xs text-gray-500 mb-2">{{ $t('ticket_detail.assignee_label') }}</p>
                  <div class="relative">
                      <select v-model="ticket.technician_id" v-on:change="assignTechnician" class="w-full bg-[#1A1C1E] text-white pl-3 pr-8 py-2 rounded-lg border border-white/10 focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer text-sm">
                          <option :value="null">{{ $t('ticket_detail.unassigned') }}</option>
                          <option v-for="tech in technicians" :key="tech.id || tech.user_id" :value="tech.id || tech.user_id">{{ tech.full_name }}</option>
                      </select>
                      <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                  </div>
              </div>

              <div class="grid grid-cols-1 gap-4 pt-2">
                  <div>
                      <p class="text-xs text-gray-500 mb-1">{{ $t('ticket_detail.date_created') }}</p>
                      <p class="text-sm text-gray-300 font-medium">{{ formatDate(ticket.created_at) }}</p>
                  </div>
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
      <button 
        @click="$router.push('/app/my-tickets')" 
        class="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95"
      >
        กลับไปหน้าตั๋วของฉัน
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, getCurrentInstance } from 'vue'; 
import { useRoute, useRouter } from 'vue-router'; 
import { useUserStore } from '@/stores/userStore';
import { useModalStore } from '@/stores/modalStore';
import { useI18n } from 'vue-i18n';

const { proxy } = getCurrentInstance();
const $api = proxy.$api; 

const { t } = useI18n(); 
const route = useRoute();
const router = useRouter(); 
const userStore = useUserStore();
const modal = useModalStore();

const ticketId = route.params.id;
const ticket = ref(null); // ✅ เริ่มต้นเป็น null เสมอ
const logs = ref([]);
const technicians = ref([]);
const approvalInfo = ref(null);
const approvalChain = ref([]); // ✨ แทรกใหม่: สำหรับเก็บข้อมูลลำดับการอนุมัติ
const loading = ref(true);
const isSubmitting = ref(false);
const isAuthorized = ref(true);

const currentUser = computed(() => userStore.userProfile);

const newLog = ref({ action: 'NOTE', message: '' });

const getAuthOptions = () => {
    const token = userStore.getAuthToken;
    return token ? { headers: { Authorization: `Bearer ${token}` } } : null;
};

const availableActions = computed(() => {
    if (!ticket.value) return [];
    const status = ticket.value.status;
    const currentStep = ticket.value.current_step;
    const actions = [{ label: t('action_labels.note'), value: 'NOTE' }];

    if (status === 'RESOLVED' || status === 'CLOSED') {
        actions.push({ label: t('action_labels.reopen'), value: 'REOPEN' });
    } else if (status === 'NEW' || status === 'WAITING APPROVE' || currentStep === 'WAIT_APPROVAL') { 
        if (currentStep !== 'ACKNOWLEDGED' && status === 'NEW') {
            actions.push({ label: '──────────', value: '', disabled: true });
            actions.push({ label: t('action_labels.acknowledge'), value: 'ACKNOWLEDGED' });
        }
    } else if (status === 'PENDING' || status === 'IN PROGRESS' || status === 'IN_PROGRESS') {
        actions.push({ label: '──────────', value: '', disabled: true });
        actions.push({ label: t('action_labels.purchasing'), value: 'PURCHASING' });
        actions.push({ label: t('action_labels.received'), value: 'RECEIVED' });
        actions.push({ label: t('action_labels.installing'), value: 'INSTALLING' });
        actions.push({ label: t('action_labels.resolved'), value: 'RESOLVED' });
    }
    return actions;
});

watch(() => ticket.value?.status, () => { newLog.value.action = 'NOTE'; });

const isCurrentUserApprover = computed(() => {
    if (!approvalInfo.value || !currentUser.value) return false;
    return Number(approvalInfo.value.approver_id) === Number(currentUser.value.id) && ticket.value.status === 'WAITING APPROVE';
});

const fetchTicket = async () => {
    if (!$api) return false;
    try {
        const res = await $api.get(`/tickets/${ticketId}`, getAuthOptions());
        if (res.data.success) {
            ticket.value = res.data.data;
            isAuthorized.value = true; // ✅ มีสิทธิ์
            return true;
        }
        return false;
    } catch (err) {
        // 🚨 จังหวะที่โดนบล็อก (403)
        isAuthorized.value = false; // ❌ สั่งปิดประตูหน้าจอทันที
        ticket.value = null; 
        
        if (err.response?.status === 403) {
            if (modal) {
                await modal.alert("คุณไม่มีสิทธิ์เข้าถึงข้อมูลตั๋วใบนี้", "Access Denied", "error");
            }
            router.push('/app/my-tickets');
        }
        return false;
    }
};

const fetchLogs = async () => {
    const options = getAuthOptions();
    if (!options) return;
    try {
        const res = await $api.get(`/tickets/${ticketId}/logs`, options);
        if(res.data.success) logs.value = res.data.data;
    } catch (err) { console.error(err); }
};

const fetchTechnicians = async () => {
    const options = getAuthOptions();
    if (!options) return;
    try {
        const res = await $api.get('/users/technicians', options);
        if(res.data.success) technicians.value = res.data.data;
    } catch (err) { console.error(err); }
};

const fetchApprovalInfo = async () => {
    const options = getAuthOptions();
    if (!options) return;
    try {
        const res = await $api.get(`/tickets/${ticketId}/approval`, options);
        if(res.data.success && res.data.data) approvalInfo.value = res.data.data;
    } catch (err) { console.log(err); }
};

const fetchApprovalChain = async () => {
    const options = getAuthOptions();
    if (!options) return;
    try {
        const res = await $api.get(`/tickets/${ticketId}/approval-chain`, options);
        if(res.data.success) approvalChain.value = res.data.data;
    } catch (err) { console.error(err); }
};

const handleApproval = async (status) => {
    const actionKey = status === 'APPROVED' ? 'action_approve' : 'action_reject';
    const actionText = t(`approval_list.${actionKey}`);
    const confirmed = await modal.confirm(t('approval_list.confirm_msg', { action: actionText, ticketNo: ticket.value.ticket_no }), t('approval_list.confi'));
    if(!confirmed) return;
    try {
        await $api.post(`/tickets/${ticketId}/approve`, { status, actor_id: currentUser.value.id }, getAuthOptions());
        modal.alert(t('approval_detail.alert_success', { action: actionText }), t('approval_detail.success_title'), 'success');
        await Promise.all([fetchTicket(), fetchLogs(), fetchApprovalInfo()]);
    } catch (err) { modal.alert(t('approval_detail.alert_error'), t('approval_detail.error_title'), 'error'); }
};

const updateTicketType = async () => {
    try {
        // 🎯 1. ยิงไปที่ API Update เพื่อเปลี่ยนค่าใน Database จริงๆ (ใช้ PUT)
        await $api.put(`/tickets/update/${ticketId}`, {
            ticket_type: ticket.value.ticket_type
        }, getAuthOptions());

        // 🎯 2. (Option) ยิงไปที่ API Logs เพื่อเก็บประวัติว่าใครเป็นคนเปลี่ยน (ใช้ POST เหมือนเดิม)
        await $api.post(`/tickets/${ticketId}/logs`, {
            action: 'NOTE',
            message: t('alert_messages.update_type_log_msg', { type: ticket.value.ticket_type }),
            actor_id: currentUser.value.id,
            category_id: ticket.value.category_id
        }, getAuthOptions());

        if(modal) modal.alert(t('alert_messages.update_type_success'), t('approval_detail.success_title'), 'success');
        
        // 🎯 3. โหลดข้อมูลใหม่จาก Server มาแสดงผลที่หน้าจอ
        await fetchTicket();
        
    } catch (err) { 
        console.error("Update Ticket Type Error:", err); 
        modal.alert("Error updating ticket type", "Error", "error");
    }
};

const assignTechnician = async () => {
    try {
        const selectedTech = technicians.value.find(t => (t.id || t.user_id) === ticket.value.technician_id);
        const techName = selectedTech ? selectedTech.full_name : t('ticket_detail.unassigned_tech');
        await $api.post(`/tickets/${ticketId}/logs`, {
            action: 'ASSIGNED',
            message: t('ticket_detail.assign_message', { techName: techName }),
            actor_id: currentUser.value.id,
            technician_id: ticket.value.technician_id
        }, getAuthOptions());
        if(modal) modal.alert(t('alert_messages.assign_success'), t('approval_detail.success_title'), 'success');
        await Promise.all([fetchTicket(), fetchLogs()]);
    } catch (err) { console.error(err); }
};

// ฟังก์ชันสำหรับอัปเดตเฉพาะ Priority เท่านั้น (Status จะอัปเดตผ่าน Log Workflow)
const updatePriorityOnly = async () => {
    try {
        const options = getAuthOptions();
        if (!options) return;

        // 1. อัปเดตเฉพาะ priority
        await $api.put(`/tickets/update/${ticketId}`, {
            priority: ticket.value.priority
        }, options);

        // 2. บันทึก Log การเปลี่ยนระดับความสำคัญ
        await $api.post(`/tickets/${ticketId}/logs`, {
            action: 'NOTE',
            message: `Priority has been changed to: ${ticket.value.priority}`,
            actor_id: currentUser.value.id
        }, options);

        if (modal) modal.alert(t('alert_messages.update_type_success'), t('approval_detail.success_title'), 'success');
        
        // 3. รีโหลดข้อมูล
        await Promise.all([fetchTicket(), fetchLogs()]);
    } catch (err) {
        console.error("Update Priority Error:", err);
        modal.alert("Error updating priority", "Error", "error");
    }
};

const addLog = async () => {
    if (!newLog.value.message.trim() && newLog.value.action === 'NOTE') return;
    isSubmitting.value = true;
    try {
        await $api.post(`/tickets/${ticketId}/logs`, {
            action: newLog.value.action,
            message: newLog.value.message,
            actor_id: currentUser.value.id
        }, getAuthOptions());
        newLog.value.message = '';
        await Promise.all([fetchTicket(), fetchLogs()]);
    } catch (err) { console.error(err); }
    finally { isSubmitting.value = false; }
};

const formatDate = (dateStr) => {
    if(!dateStr) return '';
    return new Date(dateStr).toLocaleString('th-TH', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
};

const getFileUrl = (filePath) => {
    if (!filePath) return '';
    const baseUrl = import.meta.env.VITE_API_URL || '/api';
    const rootUrl = baseUrl.replace('/api', '');
    return `${rootUrl}/uploads${filePath}`;
};

const getActionLabel = (action) => {
    const map = { 'NOTE': t('action_labels.note'), 'ACKNOWLEDGED': t('action_labels.acknowledge'), 'REQ_APPROVAL': t('approval_detail.action_req_approval'), 'REJECTED': t('approval_detail.action_reject'), 'PURCHASING': t('action_labels.purchasing'), 'RECEIVED': t('action_labels.received'), 'INSTALLING': t('action_labels.installing'), 'RESOLVED': t('action_labels.resolved'), 'ASSIGNED': t('action_labels.assigned'), 'REOPEN': t('action_labels.reopen') };
    return map[action] || action;
};

const getActionColor = (action) => {
    const colors = { 'RESOLVED': 'bg-green-500', 'APPROVED': 'bg-green-400', 'REJECTED': 'bg-red-500', 'REQ_APPROVAL': 'bg-yellow-500', 'PURCHASING': 'bg-blue-400', 'ACKNOWLEDGED': 'bg-blue-600', 'ASSIGNED': 'bg-cyan-500', 'REOPEN': 'bg-orange-500', 'NOTE': 'bg-gray-500' };
    return colors[action] || 'bg-gray-600';
};

const getStatusClasses = (status) => {
    const s = status?.toUpperCase().trim() || '';
    if (s === 'WAITING APPROVE') return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
    if (s === 'NEW') return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
    if (s.includes('PROGRESS')) return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    if (s === 'PENDING') return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
    if (['RESOLVED', 'CLOSED'].includes(s)) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    if (s === 'REJECTED') return 'bg-red-500/10 text-red-400 border-red-500/30';
    return 'bg-gray-700/30 text-gray-400 border-white/5';
};

const getTypeClasses = (type) => {
    const t = type?.toUpperCase().trim() || 'INCIDENT';
    if (['SUPPORT', 'SERVICE'].includes(t)) return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    if (t === 'INCIDENT') return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
    if (t === 'PURCHASE') return 'bg-pink-500/10 text-pink-400 border-pink-500/30';
    return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
};

const getPriorityClasses = (priority) => {
    const p = { 'LOW': 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10', 'MEDIUM': 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10', 'HIGH': 'text-orange-400 border-orange-500/30 bg-orange-500/10', 'VERY_HIGH': 'text-red-400 border-red-500/30 bg-red-500/10' };
    return p[priority] || 'text-gray-400';
};

const normalizeTicketProperties = () => {
    if (!ticket.value) return;
    
    const priorityHasLog = logs.value && logs.value.some(l => l.message && l.message.toLowerCase().includes('priority'));
    if (!priorityHasLog) {
        ticket.value.priority = '';
    } else if (!ticket.value.priority) {
        ticket.value.priority = '';
    }

    const typeHasLog = logs.value && logs.value.some(l => l.message && (l.message.toLowerCase().includes('type') || l.message.toLowerCase().includes('ประเภท')));
    if (!typeHasLog) {
        ticket.value.ticket_type = '';
    } else if (!ticket.value.ticket_type) {
        ticket.value.ticket_type = '';
    }
};

onMounted(async () => {
    loading.value = true;
    const success = await fetchTicket();
    
    // 🛡️ สำคัญมาก: ถ้า fetchTicket ไม่สำเร็จ (success = false) 
    // ห้ามไปรัน fetchLogs หรือตัวอื่นเด็ดขาด เพราะพวกนั้นก็จะโดน 403 เหมือนกัน
    if (success && isAuthorized.value) {
        await Promise.all([
            fetchLogs(),
            fetchTechnicians(),
            fetchApprovalInfo(),
            fetchApprovalChain() // ✨ โหลด Chain ข้อมูลการอนุมัติ
        ]);
        normalizeTicketProperties();
    }
    loading.value = false;
});
</script>
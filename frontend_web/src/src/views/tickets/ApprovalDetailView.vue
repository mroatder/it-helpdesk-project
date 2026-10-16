<template>
  <div class="p-6 font-sans max-w-5xl mx-auto pb-24 text-gray-300">
    
    <div v-if="loading" class="text-center py-20">
       <svg class="animate-spin h-10 w-10 mx-auto text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
       <p class="mt-4 text-gray-500">{{ $t('approval_detail.loading') }}</p>
    </div>

    <div v-else>
        <button v-on:click="$router.go(-1)" class="mb-6 flex items-center text-gray-500 hover:text-white transition-colors text-sm">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            {{ $t('approval_detail.back_to_list') }}
        </button>

        <div v-if="isPendingApproval" class="bg-gradient-to-r from-blue-900/40 to-[#1E1F20] border border-blue-500/30 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div class="flex items-start gap-4">
                <div class="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                    <h3 class="text-white font-bold text-xl">{{ $t('approval_detail.pending_msg_title') }}</h3>
                    <p class="text-blue-200/70 text-sm mt-1">{{ $t('approval_detail.pending_msg_desc') }}</p>
                    
                    <!-- 💬 Comment Input -->
                    <div class="mt-4 w-full md:min-w-[400px]">
                        <textarea 
                            v-model="approvalComment" 
                            rows="2" 
                            placeholder="พิมพ์หมายเหตุการพิจารณา (ถ้ามี)..."
                            class="w-full bg-[#1A1C1E]/60 text-white p-3 rounded-xl border border-white/10 focus:ring-1 focus:ring-blue-500 transition-all text-sm placeholder-gray-600 resize-none"
                        ></textarea>
                    </div>
                </div>
            </div>
            
            <div class="flex gap-3 w-full md:w-auto">
                <button 
                    v-on:click="handleApproval('REJECTED')"
                    class="flex-1 md:flex-none px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-sm font-bold transition-all hover:shadow-lg hover:shadow-red-900/20"
                >
                    {{ $t('approval_detail.btn_reject') }}
                </button>
                <button 
                    v-on:click="handleApproval('APPROVED')"
                    class="flex-1 md:flex-none px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-green-500/20 transition-all transform hover:scale-105"
                >
                    {{ $t('approval_detail.btn_approve') }}
                </button>
            </div>
        </div>

        <div v-else-if="ticket.status === 'REJECTED'" class="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-6 text-center text-red-400 font-bold">
            {{ $t('approval_detail.rejected_msg') }}
        </div>

        <div v-else-if="hasAlreadyApproved" class="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 mb-6 text-center text-blue-400 font-bold">
            {{ $t('approval_detail.approved_msg') }}
        </div>

        <div v-else-if="ticket.status === 'APPROVED' || ticket.status === 'NEW'" class="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 mb-6 text-center text-green-400 font-bold">
            {{ $t('approval_detail.approved_msg') }}
        </div>

        <div v-else class="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 mb-6 text-center text-blue-400 font-bold">
            <div class="flex items-center justify-center gap-2">
                <svg class="animate-pulse h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{{ $t('approval_detail.pending_msg_title') }} ({{ ticket.status }})</span>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div class="lg:col-span-2 space-y-6">
                <div class="bg-[#282A2C] p-8 rounded-2xl border border-white/5 shadow-lg">
                    <div class="flex justify-between items-start mb-4">
                        <span class="text-blue-400 font-mono text-lg font-bold tracking-wide">#{{ ticket['ticket_no'] }}</span>
                        <span v-bind:class="getPriorityClasses(ticket.priority)" class="px-3 py-0.5 rounded-full text-xs font-bold border uppercase">
                            {{ ticket.priority }} {{ $t('approval_detail.priority') }}
                        </span>
                    </div>
                    
                    <h1 class="text-3xl font-bold text-white tracking-tight leading-tight mb-6">{{ ticket.subject }}</h1>
                    
                    <h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 border-b border-white/5 pb-2">{{ $t('approval_detail.description') }}</h3>
                    <div class="text-gray-300 leading-relaxed whitespace-pre-line text-base">
                        {{ ticket.description }}
                    </div>

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

                <div v-if="approvalChain.length > 0" class="bg-[#282A2C] p-6 rounded-2xl border border-white/5 shadow-lg">
                    <h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">เส้นทางการอนุมัติ (Approval Path)</h3>
                    <div class="flex flex-col gap-6">
                        <div v-for="(step, index) in approvalChain" :key="index" class="space-y-2">
                            <div class="flex items-center gap-4">
                                <div :class="['w-3 h-3 rounded-full', step.status === 'APPROVED' ? 'bg-green-500' : step.status === 'PENDING' ? 'bg-blue-500 animate-pulse' : 'bg-gray-600']"></div>
                                <div class="flex-1 text-sm">
                                    <p class="font-bold text-white">{{ step.approver_name }} <span class="font-normal text-gray-500">({{ step.approver_title }})</span></p>
                                    <p class="text-xs text-gray-500">สถานะ: {{ step.status === 'APPROVED' ? 'อนุมัติแล้ว' : step.status === 'PENDING' ? 'รอการพิจารณา' : 'รอลำดับถัดไป' }}</p>
                                </div>
                                <div v-if="step.status === 'APPROVED'" class="text-xs text-gray-500">{{ formatDate(step.approved_at) }}</div>
                            </div>
                            <!-- ✨ แทรกใหม่: แสดง Comment ถ้ามี -->
                            <div v-if="step.comment" class="ml-7">
                                <p class="text-xs text-blue-400 bg-blue-500/5 p-3 rounded-xl border border-blue-500/10 italic leading-relaxed">
                                    " {{ step.comment }} "
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-[#282A2C] p-6 rounded-2xl border border-white/5 shadow-lg">
                    <h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">{{ $t('approval_detail.history') }}</h3>
                    <div class="space-y-6 relative pl-2">
                        <div class="absolute left-6 top-2 bottom-2 w-0.5 bg-white/5"></div>
                        <div v-for="log in logs" v-bind:key="log.log_id" class="relative pl-12">
                            <div 
                                class="absolute left-4 top-1.5 w-3 h-3 rounded-full border-2 border-[#282A2C] z-10"
                                v-bind:class="getActionColor(log.action)"
                            ></div>
                            <div class="flex justify-between items-center mb-1">
                                <span class="text-sm font-bold text-white">{{ log.actor_name }} <span class="font-normal text-gray-400"> - </span> {{ getActionLabel(log.action) }}</span>
                                <span class="text-xs text-gray-500">{{ formatDate(log.created_at) }}</span>
                            </div>
                            <div v-if="log.message" class="text-sm text-gray-400 bg-[#1A1C1E] p-3 rounded-lg border border-white/5 mt-1">
                                {{ log.message }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="lg:col-span-1 space-y-6">
                <div class="bg-[#282A2C] p-6 rounded-2xl border border-white/5 shadow-lg">
                    <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-6 text-center">{{ $t('approval_detail.requester') }}</h4>
                    
                    <div class="flex flex-col items-center mb-6">
                        <div class="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg mb-3">
                            {{ ticket.requester_name ? ticket.requester_name.substring(0,2).toUpperCase() : '??' }}
                        </div>
                        <p class="text-white font-bold text-lg text-center">{{ ticket.requester_name }}</p>
                        <p class="text-sm text-gray-400 text-center">{{ ticket.requester_dept }}</p>
                    </div>

                    <div class="space-y-3 bg-[#1A1C1E] p-4 rounded-xl border border-white/5">
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-500">{{ $t('approval_detail.email') }}</span>
                            <span class="text-gray-300 truncate ml-2">{{ ticket.requester_email }}</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-500">{{ $t('approval_detail.urgency') }}</span>
                            <span v-bind:class="ticket.user_urgency === 'URGENT' ? 'text-red-400 font-bold' : 'text-gray-300'">{{ ticket.user_urgency }}</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-500">{{ $t('approval_detail.date') }}</span>
                            <span class="text-gray-300">{{ formatDate(ticket.created_at) }}</span>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, getCurrentInstance, watch } from 'vue'; 
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { useModalStore } from '@/stores/modalStore';
import { useI18n } from 'vue-i18n';

const { proxy } = getCurrentInstance();
const $api = proxy.$api; 
const userStore = useUserStore(); 

const { t } = useI18n(); 
const route = useRoute();
const router = useRouter();
const modal = useModalStore();

const ticketId = route.params.id;
const ticket = ref({});
const logs = ref([]);
const approvalInfo = ref(null);
const approvalChain = ref([]); // ✨ แทรกใหม่: สำหรับเก็บข้อมูลลำดับการอนุมัติ
const loading = ref(true);
const approvalComment = ref('');

const currentUser = computed(() => userStore.userProfile);

// Helper function สำหรับสร้าง Header
const getAuthOptions = () => {
    const token = userStore.getAuthToken;
    if (!token) return null;
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

// Logic เดิม (ห้ามลบ)
const isPendingApproval = computed(() => {
    if (!approvalInfo.value || !ticket.value) return false;
    
    // 1. ตรวจสอบว่า ID คนล็อกอินตรงกับ ID ผู้อนุมัติที่ระบบรออยู่หรือไม่
    const isMyTurn = Number(approvalInfo.value.approver_id) === Number(currentUser.value.id);
    
    // 2. ตรวจสอบสถานะตั๋ว: ต้องเป็นช่วงรออนุมัติ (รองรับทั้ง PENDING และ WAITING APPROVE)
    const statusAwaiting = ['PENDING', 'WAITING APPROVE'].includes(ticket.value.status);
    
    // 3. ตรวจสอบสถานะการอนุมัติในแถวของตัวเอง (ถ้ากดไปแล้วสถานะจะไม่ใช่ PENDING)
    const isRowPending = approvalInfo.value.status === 'PENDING';
    
    return isMyTurn && statusAwaiting && isRowPending;
});

// ✨ แทรกใหม่: เช็คว่าเรากดอนุมัติไปหรือยัง (ดึงจากฐานข้อมูลจริง)
const hasAlreadyApproved = computed(() => {
    return approvalChain.value.some(a => Number(a.approver_id) === Number(currentUser.value.id) && a.status === 'APPROVED');
});


// Fetch Data
const fetchData = async () => {
    if (!currentUser.value || !currentUser.value.id || !$api) return;
    const options = getAuthOptions();
    if (!options) return;

    try {
        const [resTicket, resLogs, resApproval, resChain] = await Promise.all([
            $api.get(`/tickets/${ticketId}`, options),
            $api.get(`/tickets/${ticketId}/logs`, options),
            $api.get(`/tickets/${ticketId}/approval`, options),
            $api.get(`/tickets/${ticketId}/approval-chain`, options) // ✨ แทรกใหม่: ดึง Chain จาก DB
        ]);

        if(resTicket.data.success) ticket.value = resTicket.data.data;
        if(resLogs.data.success) logs.value = resLogs.data.data;
        if(resApproval.data.success) approvalInfo.value = resApproval.data.data;
        if(resChain.data.success) approvalChain.value = resChain.data.data; // ✨ แทรกใหม่: เก็บค่า

    } catch (err) {
        if(modal) modal.alert(t('approval_detail.alert_error'), t('approval_detail.error_title'), 'error');
    } finally {
        loading.value = false;
    }
};

// Handle Approval (รักษารหัสเดิมและรีเฟรชข้อมูลหน้าจอ)
const handleApproval = async (status) => {
    const actionText = status === 'APPROVED' ? t('approval_detail.action_approve') : t('approval_detail.action_reject');
    const confirmed = await modal.confirm(t('approval_detail.confirm_msg', { action: actionText }), t('approval_detail.confirm_title'));
    
    if(!confirmed) return;
    const options = getAuthOptions();
    if (!options) return;

    try {
        await $api.post(`/tickets/${ticketId}/approve`, {
            status: status,
            actor_id: currentUser.value.id,
            comment: approvalComment.value
        }, options);

        // 1. แสดง Notification สำเร็จ
        modal.alert(t('approval_detail.alert_success', { action: actionText }), t('approval_detail.success_title'), 'success');
        
        // 2. ✨ ดึงข้อมูลใหม่ทันที เพื่ออัปเดตหน้าจอให้แสดงสถานะ "อนุมัติแล้ว"
        await fetchData();

        // 3. หน่วงเวลาเล็กน้อยเพื่อให้ผู้ใช้เห็นสถานะที่เปลี่ยนไป ก่อนเปลี่ยนหน้า
        setTimeout(() => {
            router.push('/app/approvals/pending');
        }, 1500);

    } catch (err) {
        modal.alert(t('approval_detail.alert_error'), t('approval_detail.error_title'), 'error');
    }
};

const formatDate = (dateStr) => {
    if(!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('th-TH', { 
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

const getFileUrl = (filePath) => {
    if (!filePath) return '';
    const baseUrl = import.meta.env.VITE_API_URL || '/api';
    const rootUrl = baseUrl.replace('/api', '');
    return `${rootUrl}/uploads${filePath}`;
};

const getActionLabel = (action) => {
    const map = { 
        'REQ_APPROVAL': 'approval_detail.action_req_approval', 
        'APPROVED': 'approval_detail.action_approve', 
        'REJECTED': 'approval_detail.action_reject', 
        'NOTE': 'approval_detail.action_note' 
    };
    return map[action] ? t(map[action]) : action;
};

const getActionColor = (action) => {
    return action === 'APPROVED' ? 'bg-green-500' : (action === 'REJECTED' ? 'bg-red-500' : 'bg-gray-500');
};

const getPriorityClasses = (priority) => {
    switch (priority) {
        case 'LOW': return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10';
        case 'MEDIUM': return 'text-yellow-400 border-yellow-500/20 bg-yellow-500/10';
        case 'HIGH': return 'text-orange-400 border-orange-500/20 bg-orange-500/10';
        case 'VERY_HIGH': return 'text-red-400 border-red-500/20 bg-red-500/10';
        default: return 'text-gray-400';
    }
};

onMounted(() => {
    watch(() => currentUser.value?.id, (newId) => {
        if (newId && userStore.isLoggedIn) {
            fetchData();
        }
    }, { immediate: true });
});
</script>
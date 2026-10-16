<template>
  <div class="p-6 font-sans max-w-full mx-auto pb-20">
    
    <div class="flex justify-between items-end mb-6">
      <div>
        <h2 class="text-3xl font-bold text-white tracking-tight">{{ $t('approval_list.title') }}</h2>
        <p class="text-gray-400 text-sm mt-1">{{ $t('approval_list.subtitle') }}</p>
      </div>
      <button v-on:click="fetchPendingApprovals" class="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
      </button>
    </div>

    <div class="bg-[#282A2C] rounded-xl overflow-hidden shadow-xl border border-white/5">
        <table class="min-w-full divide-y divide-white/5 text-left">
            <thead class="bg-[#1A1C1E] text-gray-400 text-xs uppercase font-semibold tracking-wider">
                <tr>
                    <th class="px-6 py-4">{{ $t('approval_list.col_no') }}</th>
                    <th class="px-6 py-4">{{ $t('approval_list.col_subject') }}</th>
                    <th class="px-6 py-4">{{ $t('approval_list.col_requester') }}</th>
                    <th class="px-6 py-4">{{ $t('approval_list.col_priority') }}</th>
                    <th class="px-6 py-4">{{ $t('approval_list.col_date') }}</th>
                    <th class="px-6 py-4 text-right">{{ $t('approval_list.col_action') }}</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-white/5 text-sm">
                <tr v-for="item in pendingList" v-bind:key="item.ticket_id" class="hover:bg-[#333538] transition-colors group">
                    <td class="px-6 py-4 font-mono text-blue-400 font-medium cursor-pointer" v-on:click="goToDetail(item.ticket_id)">
                        {{ item.ticket_no }}
                    </td>
                    <td class="px-6 py-4">
                        <div class="text-white font-medium">{{ item.subject }}</div>
                        <div class="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{{ item.description }}</div>
                    </td>
                    <td class="px-6 py-4">
                        <div class="text-gray-300">{{ item.requester_name }}</div>
                        <div class="text-xs text-gray-500">{{ item.requester_dept }}</div>
                    </td>
                    <td class="px-6 py-4">
                        <span :class="getUrgencyClasses(item.user_urgency)" 
                            class="px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider shadow-sm inline-block">
                            {{ item.user_urgency || 'NORMAL' }}
                        </span>

                        <span v-if="item.user_urgency === 'URGENT'" 
                            class="text-red-400 text-[10px] font-bold flex items-center gap-1 mt-1 animate-pulse">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            {{ $t('approval_list.urgent_label') }}
                        </span>
                    </td>
                    <td class="px-6 py-4 text-gray-400 text-xs">
                        {{ formatDate(item.requested_at) }}
                    </td>
                    <td class="px-6 py-4 text-right">
                        <div class="flex items-center justify-end gap-2">
                            <button 
                                v-on:click="goToDetail(item.ticket_id)"
                                class="px-3 py-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 text-xs font-bold transition-colors flex items-center gap-1"
                            >
                                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                {{ $t('approval_list.btn_view') }}
                            </button>
                            <button 
                                v-on:click="handleAction(item, 'REJECTED')"
                                class="px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs font-bold transition-colors"
                            >
                                {{ $t('approval_list.btn_reject') }}
                            </button>
                            <button 
                                v-on:click="handleAction(item, 'APPROVED')"
                                class="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-white text-xs font-bold shadow-md transition-colors"
                            >
                                {{ $t('approval_list.btn_approve') }}
                            </button>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>

        <div v-if="pendingList.length === 0" class="p-12 text-center text-gray-500 flex flex-col items-center">
            <div class="w-16 h-16 bg-[#333538] rounded-full flex items-center justify-center mb-4">
                <svg class="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
            </div>
            <p>{{ $t('approval_list.no_data') }}</p>
        </div>
    </div>

  </div>
</template>
<script setup>
import { ref, onMounted, computed, getCurrentInstance, watch } from 'vue'; // ✅ เพิ่ม getCurrentInstance, watch
import { useRouter } from 'vue-router';
// 🛑 ลบ import axios ออกไป
import { useUserStore } from '@/stores/userStore';
import { useModalStore } from '@/stores/modalStore';
import { useI18n } from 'vue-i18n';

const { proxy } = getCurrentInstance(); // ✅ 1. เข้าถึง Global Properties ($api)
const $api = proxy.$api; 
const userStore = useUserStore(); // 2. ดึง UserStore

const { t } = useI18n(); 
const router = useRouter();
const modal = useModalStore();

const pendingList = ref([]);
const currentUser = computed(() => userStore.userProfile);

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

// 🛑 4. Fetch Pending Approvals (GET)
const fetchPendingApprovals = async () => {
    // ต้องรอให้ currentUser มีค่า ID ก่อน
    if (!currentUser.value || !currentUser.value.id || !$api) return;

    const options = getAuthOptions();
    if (!options) return;

    try {
        // 🛑 ใช้ $api และส่ง options
        const res = await $api.get(`/tickets/approvals/pending/${currentUser.value.id}`, options);
        if(res.data.success) {
            pendingList.value = res.data.data;
        }
    } catch (err) {
        console.error("Fetch Approvals Error:", err);
    }
};

// 🛑 5. Handle Action (POST: Approve/Reject)
const handleAction = async (ticket, status) => {
    // Translate action text using keys
    const actionText = status === 'APPROVED' ? t('approval_list.action_approve') : t('approval_list.action_reject');
    
    const confirmed = await modal.confirm(
        t('approval_list.confirm_msg', { action: actionText, ticketNo: ticket.ticket_no }), 
        t('approval_list.confirm_title')
    );
    
    if(!confirmed) return;

    if (!currentUser.value.id || !$api) return;
    const options = getAuthOptions();
    if (!options) return;

    try {
        // 🛑 ใช้ $api และส่ง options
        await $api.post(`/tickets/${ticket.ticket_id}/approve`, {
            status: status,
            actor_id: currentUser.value.id
        }, options);

        modal.alert(t('approval_list.alert_success'), t('approval_list.success_title'), 'success'); // ใช้ 'success' แทน t('modal.success')
        fetchPendingApprovals(); 

    } catch (err) {
        modal.alert(t('approval_list.alert_error'), t('approval_list.error_title'), 'error'); // ใช้ 'error' แทน t('modal.error')
    }
};

const goToDetail = (id) => {
    router.push(`/app/approvals/${id}`);
};

const formatDate = (dateStr) => {
    if(!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('th-TH', { 
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
        timeZone: 'UTC' 
    });
};

const getPriorityClasses = (priority) => {
    switch (priority) {
        case 'LOW': return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
        case 'MEDIUM': return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
        case 'HIGH': return 'text-orange-400 border-orange-500/30 bg-orange-500/10';
        case 'VERY_HIGH': return 'text-red-400 border-red-500/30 bg-red-500/10';
        default: return 'text-gray-400';
    }
};

// ✅ แก้ไขสีภายในฟังก์ชัน getUrgencyClasses ให้สว่างขึ้น
const getUrgencyClasses = (urgency) => {
    switch (urgency) {
        case 'NORMAL': 
            // เปลี่ยนเป็นสีฟ้า (Sky Blue) ที่ดูสว่างขึ้น
            return 'text-sky-400 border-sky-500/40 bg-sky-500/20';
        case 'URGENT': 
            // สีแดง (Rose/Red) ที่ชัดเจน
            return 'text-red-400 border-red-500/40 bg-red-500/20';
        default: 
            return 'text-gray-400 border-white/10 bg-white/5';
    }
};
// 🛑 6. Init: ตรวจสอบการล็อกอินและรอ User ID
onMounted(() => {
    // ใช้ watch เพื่อรอให้ Pinia Store โหลด currentUser ID ที่ถูกต้อง
    watch(() => currentUser.value?.id, (newId) => {
        if (newId && userStore.isLoggedIn) {
            fetchPendingApprovals();
        }
    }, { immediate: true });
});
</script>
<template>
  <div class="space-y-8 p-6 font-sans dashboard-container max-w-7xl mx-auto pb-24 transition-colors" :class="isDark ? 'text-gray-300' : 'text-[#444746]'">
    
    <h2 class="text-3xl font-bold tracking-tight transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">
      {{ $t('dashboard.greeting') }}, {{ currentUser.fullName }}
    </h2>

    <div>
        
        <div v-if="loading" class="p-6 rounded-2xl border mb-8 h-[200px] animate-pulse flex flex-col justify-between transition-colors shadow-lg" :class="isDark ? 'bg-[#333333] border-white/10' : 'bg-[#ffffff] border-[rgba(0,0,0,0.08)]'">
            <div class="flex justify-between items-center">
                <div class="rounded w-1/3" :class="isDark ? 'h-6 bg-gray-600' : 'h-6 bg-gray-200'"></div>
                <div class="rounded w-20" :class="isDark ? 'h-6 bg-gray-600' : 'h-6 bg-gray-200'"></div>
            </div>
            <div class="rounded-full w-full my-4" :class="isDark ? 'h-2 bg-gray-700' : 'h-2 bg-gray-100'"></div>
            <div class="flex justify-between">
                <div class="rounded w-12" v-for="i in 5" :key="i" :class="isDark ? 'h-4 bg-gray-600' : 'h-4 bg-gray-200'"></div>
            </div>
        </div>

        <div v-else-if="selectedTicket" class="p-6 rounded-2xl border mb-8 relative overflow-hidden transition-all duration-300 group shadow-lg" :class="isDark ? 'bg-[#333333] border-white/10' : 'bg-[#ffffff] border-[rgba(0,0,0,0.08)]'">
            <div class="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none transition-transform duration-700 group-hover:scale-110"></div>

            <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4 relative z-10">
                <div class="flex flex-col gap-1">
                    <h3 class="text-sm font-bold tracking-wider uppercase flex items-center gap-2 transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">
                        <span class="w-1.5 h-6 bg-blue-500 rounded-full block"></span>
                        {{ $t('dashboard.ticket_status') }}:
                        <span class="text-blue-500 font-mono text-xl">{{ selectedTicket.ticket_no }}</span>
                    </h3>
                    <span class="text-xs ml-4 transition-colors" :class="isDark ? 'text-gray-400' : 'text-[#727775]'">{{ selectedTicket.subject }}</span>
                </div>
                
                <div class="flex items-center gap-3">
                    <span class="px-3 py-1 rounded-full text-xs font-bold border shadow-sm transition-colors" :class="getStatusBadgeClass(selectedTicket.status)">
                        {{ selectedTicket.status }}
                    </span>
                    <router-link :to="`/app/my-tickets/${selectedTicket.ticket_id}`" 
                        class="text-xs border px-3 py-1 rounded-full hover:bg-white/10 hover:border-blue-400/50 transition-all flex items-center gap-1"
                        :class="isDark ? 'border-white/20 text-gray-300 hover:bg-white/10' : 'border-[rgba(0,0,0,0.2)] text-[#444746] hover:bg-blue-50'">
                        {{ $t('button.view') }}
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </router-link>
                </div>
            </div>
            
            <div class="relative z-10 w-full px-2 md:px-6 pb-4">
                
                <div v-if="loadingLogs" class="absolute inset-0 -top-4 flex items-center justify-center z-30 rounded-lg backdrop-blur-sm" :class="isDark ? 'bg-[#333333]/80' : 'bg-white/80'">
                    <div class="flex flex-col items-center">
                        <svg class="animate-spin h-8 w-8 text-blue-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span class="text-xs transition-colors" :class="isDark ? 'text-gray-400' : 'text-[#727775]'">Loading timeline...</span>
                    </div>
                </div>

                <div class="absolute top-5 h-1 bg-gray-700/50 -z-10 rounded-full overflow-hidden transition-all duration-300"
                    :style="{ 
                        left: `${(100 / timelineSteps.length) / 2}%`, 
                        right: `${(100 / timelineSteps.length) / 2}%` 
                      }">
                    <div class="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-1000 ease-in-out relative"
                          :class="{'from-red-600 to-red-400': isRejected}"
                          :style="{ width: progressPercentage }">
                          <div class="absolute inset-0 bg-white/20 w-full -translate-x-full animate-[shimmer_2s_infinite]"></div>
                    </div>
                </div>

                <div class="flex justify-between items-start w-full relative">
                    <div v-for="(step, index) in timelineSteps" :key="step.key" 
                          class="flex flex-col items-center relative group/step cursor-default"
                          :style="{ width: `${100 / timelineSteps.length}%` }">
                        
                        <div class="relative flex items-center justify-center">
                            
                            <div v-if="index === currentStepIndex && !isCompletedState && !isRejected" 
                                  class="absolute w-full h-full rounded-full bg-blue-500/30 animate-ping opacity-75"
                                  style="width: 200%; height: 200%;">
                            </div>

                            <div class="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500 z-20 shadow-lg group-hover/step:scale-110"
                                  :class="getStepCircleClass(index)">
                                
                                <svg class="w-5 h-5 md:w-6 md:h-6 transition-transform duration-300" 
                                      :class="[
                                          index < currentStepIndex || (index === currentStepIndex && (isRejected || isCompletedState)) ? 'text-white' : '',
                                          index === currentStepIndex && !isRejected && !isCompletedState ? 'text-blue-500' : '',
                                          index > currentStepIndex ? 'text-gray-500' : ''
                                      ]"
                                      fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" :d="getStepIcon(step.key)" />
                                </svg>

                                <div v-if="index < currentStepIndex || isCompletedState" 
                                      class="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-0.5 border-2 shadow-sm"
                                      :class="isDark ? 'border-[#333333]' : 'border-white'">
                                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <div v-else-if="index === currentStepIndex && isRejected" 
                                      class="absolute -bottom-1 -right-1 bg-red-500 text-white rounded-full p-0.5 border-2 shadow-sm"
                                      :class="isDark ? 'border-[#333333]' : 'border-white'">
                                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" /></svg>
                                </div>

                            </div>
                        </div>

                        <div class="mt-4 text-center flex flex-col items-center w-full px-1 transition-all duration-300"
                              :class="{'translate-y-1': index === currentStepIndex}">
                            <span class="text-[10px] md:text-xs font-bold transition-colors duration-300 whitespace-nowrap uppercase tracking-wider" 
                                  :class="getStepTextClass(index)">
                                {{ $t(step.label) }}
                            </span>
                            <span class="text-[9px] text-gray-500 mt-1 hidden md:block whitespace-nowrap overflow-hidden text-ellipsis max-w-full cursor-help hover:text-gray-300 transition-colors"
                                  :title="$t(step.desc)">
                                {{ $t(step.desc) }}
                            </span>
                        </div>
                    </div>
                </div>

                <div class="mt-10 text-center border-t pt-4 transition-colors" :class="isDark ? 'border-white/5' : 'border-[rgba(0,0,0,0.08)]'">
                    <p class="text-sm flex items-center justify-center gap-2 transition-colors" :class="isDark ? 'text-gray-400' : 'text-[#727775]'">
                        <span class="w-2 h-2 rounded-full" :class="isRejected ? 'bg-red-500' : 'bg-blue-500 animate-pulse'"></span>
                        {{ $t('dashboard.current_status') }}: 
                        <span class="font-bold text-lg transition-colors" :class="isRejected ? 'text-red-400' : 'text-blue-500'">
                            {{ getActionLabel(selectedTicket.current_step || selectedTicket.status) }}
                        </span>
                    </p>
                    <p class="text-xs mt-1 flex items-center justify-center gap-1 transition-colors" :class="isDark ? 'text-gray-600' : 'text-[#444746]'">
                        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {{ $t('dashboard.last_updated') }}: {{ formatDate(selectedTicket.updated_at || selectedTicket.created_at) }}
                    </p>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="p-6 rounded-2xl border transition-all duration-300 group shadow-lg" :class="isDark ? 'bg-[#333333] border-white/10 hover:border-gray-500/50' : 'bg-[#ffffff] border-[rgba(0,0,0,0.08)] shadow-[0_1px_2px_0_rgba(60,64,67,0.30)] hover:border-gray-200'">
            <p class="text-[11px] font-bold uppercase tracking-wider transition-colors" :class="isDark ? 'text-gray-400' : 'text-[#727775]'">{{ $t('dashboard.total_tickets') }}</p>
            <h3 class="text-3xl font-bold mt-2 transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">{{ loading ? '-' : stats.total }}</h3>
          </div>
          <div class="p-6 rounded-2xl border transition-all duration-300 group shadow-lg" :class="isDark ? 'bg-[#333333] border-white/10 hover:border-orange-500/50' : 'bg-[#ffffff] border-[rgba(0,0,0,0.08)] shadow-[0_1px_2px_0_rgba(60,64,67,0.30)] hover:border-orange-200'">
            <p class="text-[11px] font-bold uppercase tracking-wider transition-colors" :class="isDark ? 'text-gray-400' : 'text-[#727775]'">{{ $t('dashboard.waiting_it') }}</p>
            <h3 class="text-3xl font-bold text-orange-400 mt-2">{{ loading ? '-' : stats.waiting }}</h3>
          </div>
          <div class="p-6 rounded-2xl border transition-all duration-300 group shadow-lg" :class="isDark ? 'bg-[#333333] border-white/10 hover:border-blue-500/50' : 'bg-[#ffffff] border-[rgba(0,0,0,0.08)] shadow-[0_1px_2px_0_rgba(60,64,67,0.30)] hover:border-blue-200'">
            <p class="text-[11px] font-bold uppercase tracking-wider transition-colors" :class="isDark ? 'text-gray-400' : 'text-[#727775]'">{{ $t('dashboard.in_progress') }}</p>
            <h3 class="text-3xl font-bold text-blue-400 mt-2">{{ loading ? '-' : stats.inProgress }}</h3>
          </div>
          <div class="p-6 rounded-2xl border transition-all duration-300 group shadow-lg" :class="isDark ? 'bg-[#333333] border-white/10 hover:border-emerald-500/50' : 'bg-[#ffffff] border-[rgba(0,0,0,0.08)] shadow-[0_1px_2px_0_rgba(60,64,67,0.30)] hover:border-emerald-200'">
            <p class="text-[11px] font-bold uppercase tracking-wider transition-colors" :class="isDark ? 'text-gray-400' : 'text-[#727775]'">{{ $t('dashboard.completed') }}</p>
            <h3 class="text-3xl font-bold text-emerald-400 mt-2">{{ loading ? '-' : stats.done }}</h3>
          </div>
        </div>

        <div class="rounded-2xl shadow-lg border overflow-hidden min-h-[400px] flex flex-col relative transition-all duration-300" :class="isDark ? 'bg-[#333333] border-white/10' : 'bg-[#ffffff] border-[rgba(0,0,0,0.08)] shadow-[0_1px_2px_0_rgba(60,64,67,0.30)]'">
            <div class="px-6 py-4 border-b flex justify-between items-center transition-colors" :class="isDark ? 'border-white/5 bg-[#2F2F2F]' : 'border-[rgba(0,0,0,0.08)] bg-[#f8f9fa]'">
                <h3 class="font-bold text-lg transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">{{ $t('dashboard.my_tickets_title') }}</h3>
                <div class="flex items-center gap-4" v-if="!loading">
                    <span class="text-xs text-gray-400 hidden sm:inline">{{ $t('dashboard.page') }} {{ currentPage }} / {{ totalPages || 1 }}</span>
                    <div class="flex items-center gap-1">
                        <button @click="prevPage" :disabled="currentPage === 1" class="p-1.5 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-gray-300">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                        </button>
                        <button @click="nextPage" :disabled="currentPage === totalPages || totalPages === 0" class="p-1.5 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-gray-300">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" /></svg>
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="flex-1 relative">
                <div v-if="loading" class="absolute inset-0 flex flex-col items-center justify-center z-20 transition-colors" :class="isDark ? 'bg-[#333333]/90' : 'bg-white/90'">
                    <svg class="animate-spin h-8 w-8 text-blue-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span class="text-sm transition-colors" :class="isDark ? 'text-gray-400' : 'text-[#727775]'">{{ $t('dashboard.loading_list') }}</span>
                </div>

                <div class="overflow-x-auto h-full">
                  <table class="w-full text-left text-sm transition-colors" :class="isDark ? 'text-gray-300' : 'text-[#444746]'">
                      <thead class="font-medium uppercase text-[11px] tracking-wider sticky top-0 z-10 shadow-sm transition-colors" :class="isDark ? 'bg-[#2a2a2a] text-gray-400' : 'bg-[#f1f3f4] text-[#727775]'">
                          <tr>
                              <th class="px-6 py-4">{{ $t('ticket.no') }}</th>
                              <th class="px-6 py-4">{{ $t('ticket.subject') }}</th>
                              <th class="px-6 py-4">{{ $t('ticket.status') }}</th>
                              <th class="px-6 py-4">{{ $t('ticket.current_step') }}</th>
                              <th class="px-6 py-4">{{ $t('ticket.created_at') }}</th>
                          </tr>
                      </thead>
                      <tbody class="divide-y transition-colors" :class="isDark ? 'divide-white/5' : 'divide-[rgba(0,0,0,0.08)]'">
                          <tr v-for="ticket in paginatedTickets" :key="ticket.ticket_id" 
                              class="transition-all cursor-pointer border-l-4 group/row"
                              :class="[
                                  selectedTicket && selectedTicket.ticket_id === ticket.ticket_id 
                                    ? (isDark ? 'bg-blue-500/10 border-blue-500' : 'bg-blue-50 border-blue-500') 
                                    : (isDark ? 'border-transparent hover:bg-[#3a3a3a]' : 'border-transparent hover:bg-[#f8f9fa]')
                              ]"
                              @click="selectTicket(ticket)">
                              <td class="px-6 py-4 font-mono transition-colors" :class="selectedTicket?.ticket_id === ticket.ticket_id ? 'text-blue-500 font-bold' : (isDark ? 'text-blue-400 group-hover/row:text-blue-300' : 'text-blue-600 group-hover/row:text-blue-700')">{{ ticket.ticket_no }}</td>
                              <td class="px-6 py-4 font-medium transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">{{ ticket.subject }}</td>
                              <td class="px-6 py-4">
                                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-colors" :class="getStatusBadgeClass(ticket.status)">{{ ticket.status }}</span>
                              </td>
                              <td class="px-6 py-4 text-xs transition-colors" :class="isDark ? 'text-gray-400' : 'text-[#727775]'">{{ getActionLabel(ticket.current_step) }}</td>
                              <td class="px-6 py-4 transition-colors text-[11px]" :class="isDark ? 'text-gray-500' : 'text-[#9aa0a6]'">{{ formatDate(ticket.created_at) }}</td>
                          </tr>
                          <tr v-if="!loading && paginatedTickets.length === 0">
                            <td colspan="5" class="px-6 py-12 text-center transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ $t('dashboard.no_history') }}</td>
                          </tr>
                      </tbody>
                  </table>
                </div>
            </div>
        </div>
    </div>

  </div>
</template>
<script setup>
import { ref, onMounted, computed, getCurrentInstance, watch } from 'vue'; 
import { useI18n } from 'vue-i18n';
import { useUserStore } from '@/stores/userStore'; 
import { useTheme } from '@/composables/useTheme';

const { isDark } = useTheme();
const { proxy } = getCurrentInstance();
const $api = proxy.$api; 
const userStore = useUserStore(); 

const { t } = useI18n(); 
const tickets = ref([]);
const ticketLogs = ref([]); 
const ticketApproval = ref(null);
const loading = ref(true);
const loadingLogs = ref(false);
const selectedTicket = ref(null);

const currentPage = ref(1);
const itemsPerPage = 5;


// ✅ NEW FUNCTION: ตัดคำนำหน้าและนามสกุล
const formatName = (fullName) => {
    if (!fullName) return 'User';
    
    // 1. กำหนดคำนำหน้าที่จะลบออก (Ms., Mr., Dr., นางสาว, นาย, ฯลฯ)
    // ใช้ RegEx เพื่อให้ตรวจจับได้ทั้งตัวเล็กตัวใหญ่ และมีจุดหรือไม่
    const prefixes = /(Mr\.|Mrs\.|Ms\.|Dr\.|Mister|Miss|นางสาว|นาย|ดร\.)\s*/gi;
    let nameWithoutPrefix = fullName.replace(prefixes, '').trim();

    // 2. แยกชื่อ-นามสกุล
    const parts = nameWithoutPrefix.split(/\s+/);
    
    // 3. เอาเฉพาะชื่อแรก (First Name)
    // ถ้ามีหลายส่วน (ชื่อกลาง, นามสกุล) ให้เอาแค่ส่วนแรก
    const firstName = parts[0];
    
    return firstName;
};


// 🛑 FIX: ปรับปรุง currentUser ให้ใช้ formatName
const currentUser = computed(() => {
    const user = userStore.userProfile; 
    
    // 1. ตรวจสอบ ID
    const idValue = user?.user_id || user?.id; 
    
    // 2. ดึงชื่อเต็ม
    const rawName = user?.full_name || user?.fullName || user?.name; 
    
    // 3. จัดรูปแบบชื่อ
    const formattedName = formatName(rawName);
    
    return {
        id: idValue ? idValue.toString() : null, 
        fullName: formattedName // ใช้ชื่อที่ถูกจัดรูปแบบแล้ว
    };
});
// ✅ 6. Helper function สำหรับสร้าง Header (แก้ปัญหา 401)
const getAuthOptions = () => {
    const token = userStore.getAuthToken;
    if (!token) {
        console.warn("Token is missing. Cannot proceed with authorized API call.");
        return null; 
    }
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

// ✅ Dynamic Timeline with Icon Keys (Modified to use keys)
const timelineSteps = computed(() => {
    if (!selectedTicket.value) return [];
    
    // 1. START
    const steps = [
        { key: 'START', label: 'timeline.start', desc: 'timeline.start_desc' }
    ];

    const logs = ticketLogs.value || [];
    const hasLog = (action) => logs.some(l => l.action === action);
    
    const currentStep = selectedTicket.value.current_step;
    const currentStatus = selectedTicket.value.status;
    const approvalStatus = ticketApproval.value ? ticketApproval.value.status : currentStatus;

    // 2. APPROVAL FLOW
    const hasApprover = selectedTicket.value.approver_id || false;
    const isApprovalFlow = hasApprover || ticketApproval.value || hasLog('REQ_APPROVAL') || currentStep === 'WAIT_APPROVAL';

    if (isApprovalFlow) {
        steps.push({ key: 'WAIT_APPROVAL', label: 'timeline.wait_approval', desc: 'timeline.wait_approval_desc' });
        steps.push({ key: 'APPROVED_DONE', label: 'timeline.approved_done', desc: 'timeline.approved_done_desc' });
    } else {
        steps.push({ key: 'ACKNOWLEDGE', label: 'timeline.acknowledge', desc: 'timeline.acknowledge_desc' });
    }

    // 3. PURCHASING FLOW
    const isPurchaseType = selectedTicket.value.ticket_type === 'PURCHASE' || 
                           (selectedTicket.value.subject && selectedTicket.value.subject.includes('ซื้อ'));
    const isPurchasingFlow = isPurchaseType || hasLog('PURCHASING') || currentStep === 'PURCHASING' || currentStep === 'RECEIVED';
    
    if (isPurchasingFlow) {
        steps.push({ key: 'PURCHASING', label: 'timeline.purchasing', desc: 'timeline.purchasing_desc' });
        steps.push({ key: 'RECEIVED', label: 'timeline.received', desc: 'timeline.received_desc' });
    }

    // 4. STANDARD FLOW
    steps.push({ key: 'INSTALLING', label: 'timeline.installing', desc: 'timeline.installing_desc' });
    steps.push({ key: 'DONE', label: 'timeline.done', desc: 'timeline.done_desc' });

    return steps;
});

// ✅ Icon Map (Offline Friendly SVGs)
const getStepIcon = (key) => {
    const icons = {
        'START': 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', 
        'WAIT_APPROVAL': 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', // Clock
        'APPROVED_DONE': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', // Check Circle
        'ACKNOWLEDGE': 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z', // Eye
        'PURCHASING': 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z', // Cart
        'RECEIVED': 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', // Box
        'INSTALLING': 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', // Edit/Wrench like
        'DONE': 'M3 21v-8a2 2 0 012-2h14a2 2 0 012 2v8M9 10a2 2 0 012-2h2a2 2 0 012 2' // Flag/Finish
    };
    return icons[key] || 'M5 13l4 4L19 7';
};

const currentStepIndex = computed(() => {
    if (!selectedTicket.value) return 0;
    
    const status = selectedTicket.value.status;
    const step = selectedTicket.value.current_step;
    const approvalStatus = ticketApproval.value ? ticketApproval.value.status : null;

    const steps = timelineSteps.value;
    const findIndex = (key) => steps.findIndex(s => s.key === key);

    if (status === 'RESOLVED' || status === 'CLOSED') return findIndex('DONE');

    if (status === 'REJECTED' || step === 'REJECTED' || approvalStatus === 'REJECTED') {
        const idx = findIndex('WAIT_APPROVAL');
        return idx !== -1 ? idx : 0;
    }

    if (step === 'PURCHASING') return findIndex('PURCHASING');
    if (step === 'RECEIVED') return findIndex('RECEIVED');

    if (['INSTALLING', 'IN PROGRESS'].includes(step)) return findIndex('INSTALLING');
    
    if (approvalStatus === 'PENDING') {
        const idx = findIndex('WAIT_APPROVAL');
        if (idx !== -1) return idx;
    }
    
    if ((approvalStatus === 'APPROVED' || status === 'IN PROGRESS') && (step === 'WAIT_APPROVAL' || step === 'APPROVED' || step === 'ASSIGNED')) {
           const idx = findIndex('APPROVED_DONE');
           if (idx !== -1) return idx; 
           const ackIdx = findIndex('ACKNOWLEDGE');
           if (ackIdx !== -1) return ackIdx;
    }

    if (approvalStatus === 'APPROVED') {
        const idx = findIndex('APPROVED_DONE');
        if (idx !== -1) return idx;
    }

    if (['ACKNOWLEDGED', 'ASSIGNED'].includes(step)) {
           const ackIdx = findIndex('ACKNOWLEDGE');
           if (ackIdx !== -1) return ackIdx;
    }

    return 0;
});

// Fetch Logs
const fetchTicketLogs = async (ticketId) => {
    if (!$api) return;
    const options = getAuthOptions();
    if (!options) return;

    try {
        // 🛑 ใช้ $api และส่ง options
        const response = await $api.get(`/tickets/${ticketId}/logs`, options);
        if (response.data.success) {
            ticketLogs.value = response.data.data;
        }
    } catch (error) {
        console.error("Error fetching logs:", error);
        ticketLogs.value = [];
    }
}

// Fetch Approval Data
const fetchTicketApproval = async (ticketId) => {
    if (!$api) return;
    const options = getAuthOptions();
    if (!options) return;

    try {
        // 🛑 ใช้ $api และส่ง options
        const response = await $api.get(`/tickets/${ticketId}/approval`, options);
        if (response.data.success) {
            ticketApproval.value = response.data.data;
        } else {
            ticketApproval.value = null;
        }
    } catch (error) {
        console.error("Error fetching approval:", error);
        ticketApproval.value = null;
    }
}

// Select Ticket
const selectTicket = async (ticket) => {
    if (selectedTicket.value && selectedTicket.value.ticket_id === ticket.ticket_id) return;
    
    selectedTicket.value = ticket;
    loadingLogs.value = true;
    
    await Promise.all([
        fetchTicketLogs(ticket.ticket_id),
        fetchTicketApproval(ticket.ticket_id)
    ]);
    
    loadingLogs.value = false;
};

// Fetch Initial Data
const fetchMyTickets = async () => {
    // 🛑 ตรวจสอบ ID อย่างเข้มงวด
    if (!currentUser.value.id || !$api) {
        console.error("User ID or API client is missing.");
        loading.value = false;
        return;
    }
   
    const options = getAuthOptions();
    if (!options) {
        loading.value = false;
        return;
    }

    try {
        loading.value = true;
        // 🛑 ใช้ $api และส่ง options
        const response = await $api.get(`/tickets/my-tickets/${currentUser.value.id}`, options);
        if (response.data.success) {
            tickets.value = response.data.data;
            if (tickets.value.length > 0) {
                await selectTicket(tickets.value[0]);
            }
        }
    } catch (error) {
        console.error("Error fetching my tickets data:", error);
    } finally {
        loading.value = false;
    }
};

// 🛑 7. ใช้ Watcher แทน onMounted เพื่อรอ Pinia State โหลดค่า ID ล่าสุด
watch(() => currentUser.value.id, (newId) => {
    if (newId && userStore.isLoggedIn) {
        // เมื่อ ID ใหม่มาแล้วและมีการล็อกอินอยู่ ให้เรียก fetch ทันที
        fetchMyTickets();
    } else if (!newId && !userStore.isLoggedIn) {
        // ถ้าไม่มี ID และไม่มีการล็อกอิน (Clear State) ให้เคลียร์ตั๋ว
        tickets.value = [];
        selectedTicket.value = null;
    }
}, { immediate: true }); // ให้รันทันทีเมื่อ Component ถูก Mount ครั้งแรก

// 🛑 ลบ onMounted เก่าออก
// onMounted(() => {
//     fetchMyTickets();
// });

// Pagination & Utilities
const totalPages = computed(() => Math.ceil(tickets.value.length / itemsPerPage));
const paginatedTickets = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    return tickets.value.slice(start, start + itemsPerPage);
});
const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++; };
const prevPage = () => { if (currentPage.value > 1) currentPage.value--; };

const stats = computed(() => {
    return {
        total: tickets.value.length,
        // 🟡 รวม WAITING APPROVE เข้าไปในส่วน Waiting
        waiting: tickets.value.filter(t => ['NEW', 'OPEN', 'PENDING', 'WAITING APPROVE'].includes(t.status)).length,
        inProgress: tickets.value.filter(t => ['IN PROGRESS'].includes(t.status)).length,
        done: tickets.value.filter(t => ['RESOLVED', 'CLOSED', 'REJECTED'].includes(t.status)).length
    };
});

const isRejected = computed(() => selectedTicket.value?.status === 'REJECTED' || ticketApproval.value?.status === 'REJECTED');
const isCompletedState = computed(() => ['RESOLVED', 'CLOSED'].includes(selectedTicket.value?.status));

const progressPercentage = computed(() => {
    const totalSteps = timelineSteps.value.length;
    if (totalSteps <= 1) return '0%';
    const segments = totalSteps - 1;
    let percent = (currentStepIndex.value / segments) * 100;
    if (percent > 100) percent = 100;
    return `${percent}%`; 
});

const getStepCircleClass = (index) => {
    if (index < currentStepIndex.value) return 'border-blue-500 bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]'; 
    if (index === currentStepIndex.value) {
        if (isRejected.value) return 'border-red-500 bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]';
        if (isCompletedState.value) return 'border-emerald-500 bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]';
        return `border-blue-500 text-blue-400 ring-4 ring-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.3)] ${isDark.value ? 'bg-[#333333]' : 'bg-white'}`; 
    }
    return `border-gray-700 text-gray-600 ${isDark.value ? 'bg-[#333333]' : 'bg-gray-100 border-gray-200'}`; 
};

const getStepTextClass = (index) => {
    if (index <= currentStepIndex.value) {
           if (index === currentStepIndex.value && isRejected.value) return 'text-red-500';
           if (index === currentStepIndex.value && isCompletedState.value) return 'text-emerald-500';
           if (index === currentStepIndex.value) return 'text-blue-500 scale-110';
           return isDark.value ? 'text-blue-300/80' : 'text-blue-600';
    }
    return isDark.value ? 'text-gray-600' : 'text-gray-400';
};

const getActionLabel = (action) => {
    const map = {
        'NEW': 'action.new', 'REQ_APPROVAL': 'action.req_approval', 'PENDING': 'action.pending',
        'APPROVED': 'action.approved', 'REJECTED': 'action.rejected', 'ASSIGNED': 'action.assigned',
        'ACKNOWLEDGED': 'action.acknowledged', 'IN PROGRESS': 'action.in_progress',
        'PURCHASING': 'action.purchasing', 'RECEIVED': 'action.received',
        'INSTALLING': 'action.installing', 'RESOLVED': 'action.resolved',
        'CLOSED': 'action.closed', 'OPEN': 'action.open'
    };
    return map[action] ? t(map[action]) : action; // ✅ Use t() to translate
};

// ✅ Use local timezone to display Thai time correctly
const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('th-TH', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit'
    });
};

const getStatusBadgeClass = (status) => {
    switch (status) {
        // 🟡 เพิ่มเคส WAITING APPROVE ให้เป็นสีเหลืองทอง
        case 'WAITING APPROVE': 
            return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
        case 'NEW': 
        case 'PENDING': 
            return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
        case 'IN PROGRESS': 
            return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        case 'RESOLVED': 
            return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        case 'REJECTED': 
            return 'bg-red-500/10 text-red-400 border-red-500/20';
        default: 
            return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
};
</script>

<style scoped>
/*
   *** การตั้งค่า Responsive Scaling โดยใช้ Font Scaling ใน Media Queries ***
   
   หลักการ: กำหนด font-size ของ Container หลักตามความกว้างหน้าจอ (vw) 
   เพื่อให้ Tailwind Classes ที่ใช้หน่วย rem (เช่น text-3xl, p-4, w-10) ถูกย่อตามสัดส่วน
   
   - Base Screen Width (100% Scale): 1920px
   - Default Font Size (1rem): 16px
   - Scale Factor (vw): (16px / 1920px) * 100vw ≈ 0.8333vw
*/

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

/* 1. กำหนดขนาด Font-size ให้ Scale ตาม Viewport Width */
/* ใช้ .dashboard-container เพื่อให้โค้ดนี้ส่งผลเฉพาะคอมโพเนนต์นี้ */
.dashboard-container {
    /* กำหนดค่า Fallback และค่าสูงสุด (ที่ 1920px ขึ้นไป) */
    font-size: 16px;
}

/* 2. Media Query สำหรับหน้าจอที่เล็กกว่า 1920px */
@media (max-width: 1920px) {
    .dashboard-container {
        /* ใช้ clamp() เพื่อกำหนดขอบเขตการย่อ: 
           - 10px: ค่าต่ำสุดสำหรับ Mobile (เพื่อให้ยังอ่านได้)
           - 0.8333vw: ค่า Dynamic Scaling (16px @ 1920px)
           - 16px: ค่าสูงสุด (ไม่ขยายเกิน 1920px)
        */
        font-size: clamp(10px, 0.8333vw, 16px);
    }
}

/* 3. จัดการเฉพาะองค์ประกอบที่ใช้หน่วย Fixed (px) หรือมีปัญหาในการย่อ */
/* เช่น ไอคอน SVG ใน Tailwind มักใช้หน่วย em/rem หรือค่า Fixed ในโค้ด */
/* ถ้าต้องการย่อไอคอน SVG ให้ชัดเจนขึ้น: 
@media (max-width: 1280px) {
    .dashboard-container .h-5 { height: 0.8em; }
    .dashboard-container .w-5 { width: 0.8em; }
    .dashboard-container .h-6 { height: 1em; }
    .dashboard-container .w-6 { width: 1em; }
}
*/
</style>
<template>
  <div class="p-6 font-sans max-w-5xl mx-auto pb-24 transition-colors" :class="isDark ? 'text-gray-300' : 'text-[#444746]'">
    
    <div v-if="loading" class="text-center py-20">
       <svg class="animate-spin h-10 w-10 mx-auto text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
       <p class="mt-4 font-bold transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ $t('approval_detail.loading') }}</p>
    </div>

    <div v-else>
        <button v-on:click="$router.go(-1)" class="mb-6 flex items-center transition-colors text-sm font-bold active:scale-95" 
                :class="isDark ? 'text-gray-500 hover:text-white' : 'text-[#727775] hover:text-[#1f1f1f]'">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            {{ $t('approval_detail.back_to_list') }}
        </button>

        <div v-if="isPendingApproval" class="border rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl transition-all"
             :class="isDark ? 'bg-gradient-to-r from-blue-900/40 to-[#1E1F20] border-blue-500/30' : 'bg-gradient-to-r from-blue-50 to-white border-blue-200'">
            <div class="flex items-start gap-4 w-full">
                <div class="p-3 rounded-xl flex-shrink-0" :class="isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div class="w-full">
                    <h3 class="font-bold text-xl transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">{{ $t('approval_detail.pending_msg_title') }}</h3>
                    <p class="text-sm mt-1 transition-colors" :class="isDark ? 'text-blue-200/70' : 'text-blue-800/70'">{{ $t('approval_detail.pending_msg_desc') }}</p>
                    
                    <!-- 💬 Comment Input -->
                    <div class="mt-4 w-full">
                        <textarea 
                            v-model="approvalComment" 
                            rows="2" 
                            placeholder="พิมพ์หมายเหตุการพิจารณา (ถ้ามี)..."
                            class="w-full p-3 rounded-xl border transition-all text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[80px]"
                            :class="isDark ? 'bg-[#1A1C1E]/60 text-white border-white/10 placeholder-gray-600' : 'bg-white text-[#1f1f1f] border-gray-200 placeholder-gray-400'"
                        ></textarea>
                    </div>
                </div>
            </div>
            
            <div class="flex gap-3 w-full md:w-auto">
                <button 
                    v-on:click="handleApproval('REJECTED')"
                    class="flex-1 md:flex-none px-6 py-3 border rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95"
                    :class="isDark ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30' : 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200'"
                >
                    {{ $t('approval_detail.btn_reject') }}
                </button>
                <button 
                    v-on:click="handleApproval('APPROVED')"
                    class="flex-1 md:flex-none px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-green-500/20 transition-all active:scale-95"
                >
                    {{ $t('approval_detail.btn_approve') }}
                </button>
            </div>
        </div>

        <div v-else-if="ticket.status === 'REJECTED'" class="border rounded-2xl p-4 mb-6 text-center font-bold transition-all"
             :class="isDark ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-red-50 border-red-200 text-red-600'">
            {{ $t('approval_detail.rejected_msg') }}
        </div>

        <div v-else-if="canForceReject && !isPendingApproval" class="border rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl transition-all"
             :class="isDark ? 'bg-gradient-to-r from-green-900/40 to-[#1E1F20] border-green-500/30' : 'bg-gradient-to-r from-green-50 to-white border-green-200'">
            <div class="flex items-start gap-4 w-full">
                <div class="p-3 rounded-xl flex-shrink-0" :class="isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                </div>
                <div class="w-full">
                    <h3 class="font-bold text-xl transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">
                        {{ hasAlreadyApproved ? $t('approval_detail.approved_msg') : 'การจัดการพิเศษสำหรับผู้บริหาร' }}
                    </h3>
                    <p class="text-sm mt-1 transition-colors" :class="isDark ? 'text-green-200/70' : 'text-green-800/70'">หากต้องการปฏิเสธคำร้องนี้ คุณสามารถกดปฏิเสธได้</p>
                    
                    <div class="mt-4 w-full">
                        <textarea 
                            v-model="approvalComment" 
                            rows="2" 
                            placeholder="พิมพ์เหตุผลการปฏิเสธ (ถ้ามี)..."
                            class="w-full p-3 rounded-xl border transition-all text-sm outline-none focus:ring-2 focus:ring-red-500 resize-y min-h-[80px]"
                            :class="isDark ? 'bg-[#1A1C1E]/60 text-white border-white/10 placeholder-gray-600' : 'bg-white text-[#1f1f1f] border-gray-200 placeholder-gray-400'"
                        ></textarea>
                    </div>
                </div>
            </div>
            
            <div class="flex gap-3 w-full md:w-auto">
                <button 
                    v-on:click="handleApproval('REJECTED')"
                    class="flex-1 md:flex-none px-6 py-3 border rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95"
                    :class="isDark ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30' : 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200'"
                >
                    {{ $t('approval_detail.btn_reject') }}
                </button>
            </div>
        </div>

        <div v-else-if="ticket.status === 'APPROVED' || ticket.status === 'NEW'" class="border rounded-2xl p-4 mb-6 text-center font-bold transition-all"
             :class="isDark ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-green-50 border-green-200 text-green-600'">
            {{ $t('approval_detail.approved_msg') }}
        </div>

        <div v-else class="border rounded-2xl p-4 mb-6 text-center font-bold transition-all"
             :class="isDark ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-600'">
            <div class="flex items-center justify-center gap-2">
                <svg class="animate-pulse h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{{ $t('approval_detail.pending_msg_title') }} ({{ ticket.status }})</span>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div class="md:col-span-2 space-y-6">
                <div class="p-8 rounded-3xl border shadow-xl transition-all"
                     :class="isDark ? 'bg-[#282A2C] border-white/5' : 'bg-white border-[rgba(0,0,0,0.12)]'">
                    <div class="flex justify-between items-start mb-4">
                        <span class="font-mono text-lg font-bold tracking-wide transition-colors" :class="isDark ? 'text-blue-400' : 'text-blue-600'">#{{ ticket['ticket_no'] }}</span>
                        <span v-bind:class="getPriorityClasses(ticket.priority)" class="px-3 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-widest">
                            {{ ticket.priority }} {{ $t('approval_detail.priority') }}
                        </span>
                    </div>
                    
                    <h1 class="text-3xl font-extrabold tracking-tight leading-tight mb-6 transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">{{ ticket.subject }}</h1>
                    
                    <h3 class="text-[10px] font-bold uppercase tracking-widest mb-3 border-b pb-2 transition-colors" 
                        :class="isDark ? 'text-gray-400 border-white/5' : 'text-[#727775] border-[rgba(0,0,0,0.08)]'">{{ $t('approval_detail.description') }}</h3>
                    <div class="leading-relaxed whitespace-pre-line text-sm transition-colors" :class="isDark ? 'text-gray-300' : 'text-[#444746]'">
                        {{ ticket.description }}
                    </div>

                    <!-- 📎 Attachments -->
                    <div v-if="ticket.attachments && ticket.attachments.length > 0" class="mt-8 pt-6 border-t transition-colors" :class="isDark ? 'border-white/5' : 'border-[rgba(0,0,0,0.08)]'">
                        <h4 class="text-xs font-bold mb-4 flex items-center gap-2 transition-colors uppercase tracking-wider" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">
                            <svg class="w-4 h-4" :class="isDark ? 'text-blue-400' : 'text-blue-600'" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                            {{ $t('create_ticket.attachments_label') }}
                        </h4>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div v-for="file in ticket.attachments" :key="file.attachment_id" 
                                 class="p-3 border rounded-xl transition-all flex items-center justify-between group shadow-sm"
                                 :class="isDark ? 'bg-[#1A1C1E] border-white/5 hover:border-blue-500/30' : 'bg-gray-50 border-gray-200 hover:border-blue-400/50'">
                                <div class="flex items-center gap-3 overflow-hidden">
                                    <div class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                                         :class="isDark ? 'bg-[#282A2C]' : 'bg-white border shadow-sm'">
                                        <svg v-if="file.file_type.includes('image')" class="w-6 h-6 transition-colors" :class="isDark ? 'text-blue-400' : 'text-blue-500'" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        <svg v-else class="w-6 h-6 transition-colors" :class="isDark ? 'text-gray-400' : 'text-gray-500'" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                    </div>
                                    <div class="overflow-hidden">
                                        <p class="text-[10px] font-bold truncate transition-colors uppercase tracking-tight" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">{{ file.file_name }}</p>
                                        <p class="text-[10px] font-bold transition-colors uppercase" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ (file.file_size / 1024 / 1024).toFixed(2) }} MB</p>
                                    </div>
                                </div>
                                <a :href="getFileUrl(file.file_path)" target="_blank" title="View File" 
                                   class="p-2.5 transition-all text-[10px] font-bold flex items-center gap-1 border rounded-lg active:scale-90 uppercase tracking-tight"
                                   :class="isDark ? 'text-blue-400 bg-blue-500/5 hover:bg-blue-500/20 border-blue-500/20' : 'text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-200'">
                                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    <span class="hidden sm:inline">{{ $t('ticket_detail.view_file') || 'VIEW' }}</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="approvalChain.length > 0" class="p-8 rounded-3xl border shadow-xl transition-all"
                     :class="isDark ? 'bg-[#282A2C] border-white/5' : 'bg-white border-[rgba(0,0,0,0.12)]'">
                    <h3 class="text-[10px] font-bold uppercase tracking-widest mb-6 transition-colors" :class="isDark ? 'text-gray-400' : 'text-[#727775]'">Approval Path (เส้นทางการอนุมัติ)</h3>
                    <div class="flex flex-col gap-6 relative">
                        <!-- Connecting Line for Chain -->
                        <div class="absolute left-3.5 top-2 bottom-6 w-0.5" :class="isDark ? 'bg-white/5' : 'bg-gray-200'"></div>
                        
                        <div v-for="(step, index) in approvalChain" :key="index" class="space-y-2 relative z-10">
                            <div class="flex items-center gap-4">
                                <div class="w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2" 
                                     :class="[
                                        isDark ? 'border-[#282A2C]' : 'border-white',
                                        step.status === 'APPROVED' ? 'bg-green-500' : step.status === 'PENDING' ? 'bg-blue-500 animate-pulse' : (isDark ? 'bg-gray-600' : 'bg-gray-300')
                                     ]">
                                     <svg v-if="step.status === 'APPROVED'" class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                </div>
                                <div class="flex-1">
                                    <p class="font-bold text-sm transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">{{ step.approver_name }} <span class="text-[10px] font-bold uppercase tracking-tight transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">({{ step.approver_title }})</span></p>
                                    <p class="text-[10px] font-bold uppercase tracking-wide transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">Status: <span :class="step.status === 'APPROVED' ? 'text-green-500' : step.status === 'PENDING' ? 'text-blue-500' : ''">{{ step.status === 'APPROVED' ? 'APPROVED' : step.status === 'PENDING' ? 'PENDING' : 'WAITING' }}</span></p>
                                </div>
                                <div v-if="step.status === 'APPROVED'" class="text-[10px] font-bold transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ formatDate(step.approved_at) }}</div>
                            </div>
                            <!-- ✨ แสดง Comment ถ้ามี -->
                            <div v-if="step.comment" class="ml-[52px]">
                                <p class="text-xs p-3 rounded-xl border italic leading-relaxed shadow-sm transition-colors"
                                   :class="isDark ? 'text-blue-400 bg-blue-500/5 border-blue-500/10' : 'text-blue-700 bg-blue-50 border-blue-100'">
                                    " {{ step.comment }} "
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="p-8 rounded-3xl border shadow-xl transition-all"
                     :class="isDark ? 'bg-[#282A2C] border-white/5' : 'bg-white border-[rgba(0,0,0,0.12)]'">
                    <h3 class="text-[10px] font-bold uppercase tracking-widest mb-6 transition-colors" :class="isDark ? 'text-gray-400' : 'text-[#727775]'">{{ $t('approval_detail.history') }}</h3>
                    <div class="space-y-6 relative pl-2">
                        <div class="absolute left-6 top-2 bottom-2 w-0.5 transition-colors" :class="isDark ? 'bg-white/5' : 'bg-gray-200'"></div>
                        <div v-for="log in logs" v-bind:key="log.log_id" class="relative pl-12 group">
                            <div 
                                class="absolute left-4 top-1 w-4 h-4 rounded-full border-4 z-10 transition-colors"
                                :class="[getActionColor(log.action), isDark ? 'border-[#282A2C]' : 'border-white']"
                            ></div>
                            <div class="flex justify-between items-start mb-1 gap-2">
                                <span class="text-xs font-bold transition-colors leading-tight" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">
                                    {{ log.actor_name }} <span class="font-normal opacity-50 px-1">|</span> <span :class="isDark ? 'text-gray-300' : 'text-[#444746]'">{{ getActionLabel(log.action) }}</span>
                                </span>
                                <span class="text-[10px] font-bold whitespace-nowrap transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ formatDate(log.created_at) }}</span>
                            </div>
                            <div v-if="log.message" class="text-[10px] font-bold uppercase tracking-wide p-3 rounded-xl border mt-2 transition-all shadow-sm"
                                 :class="isDark ? 'text-gray-400 bg-[#1A1C1E] border-white/5' : 'text-[#444746] bg-gray-50 border-gray-100'">
                                {{ log.message }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="md:col-span-1 space-y-6">
                <div class="p-6 rounded-3xl border shadow-xl transition-all"
                     :class="isDark ? 'bg-[#282A2C] border-white/5' : 'bg-white border-[rgba(0,0,0,0.12)]'">
                    <h4 class="text-[10px] font-bold uppercase tracking-widest mb-6 text-center transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ $t('approval_detail.requester') }}</h4>
                    
                    <div class="flex flex-col items-center mb-6">
                        <div class="w-20 h-20 rounded-[24px] bg-gradient-to-br flex items-center justify-center text-white text-3xl font-black shadow-lg mb-4"
                             :class="isDark ? 'from-pink-600 to-rose-700 shadow-rose-900/30' : 'from-pink-500 to-rose-500 shadow-rose-500/20'">
                            {{ ticket.requester_name ? ticket.requester_name.substring(0,2).toUpperCase() : '??' }}
                        </div>
                        <p class="font-extrabold text-lg text-center transition-colors px-2" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">{{ ticket.requester_name }}</p>
                        <p class="text-[10px] uppercase font-bold text-center mt-1 transition-colors px-2" :class="isDark ? 'text-gray-400' : 'text-[#727775]'">
                            {{ ticket.requester_dept }} 
                            <span v-if="ticket.requester_rank" class="ml-1 opacity-60">| Rank {{ ticket.requester_rank }}</span>
                        </p>
                    </div>

                    <div class="space-y-3 p-5 rounded-2xl border transition-colors shadow-inner"
                         :class="isDark ? 'bg-[#1A1C1E] border-white/5' : 'bg-gray-50 border-transparent'">
                        <div class="flex flex-col gap-1">
                            <span class="text-[10px] uppercase font-bold tracking-widest transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ $t('approval_detail.email') }}</span>
                            <span class="text-xs font-bold truncate transition-colors" :class="isDark ? 'text-gray-300' : 'text-[#1f1f1f]'">{{ ticket.requester_email || '-' }}</span>
                        </div>
                        <div class="w-full h-px transition-colors" :class="isDark ? 'bg-white/5' : 'bg-gray-200'"></div>
                        <div class="flex justify-between items-center">
                            <span class="text-[10px] uppercase font-bold tracking-widest transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ $t('approval_detail.urgency') }}</span>
                            <span class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full" 
                                  :class="ticket.user_urgency === 'URGENT' ? (isDark ? 'text-red-400 bg-red-400/10' : 'text-red-600 bg-red-100') : (isDark ? 'text-gray-300 bg-gray-500/20' : 'text-[#444746] bg-gray-200')">{{ ticket.user_urgency || 'NORMAL' }}</span>
                        </div>
                        <div class="w-full h-px transition-colors" :class="isDark ? 'bg-white/5' : 'bg-gray-200'"></div>
                        <div class="flex flex-col gap-1 mt-1">
                            <span class="text-[10px] uppercase font-bold tracking-widest transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ $t('approval_detail.date') }}</span>
                            <span class="text-xs font-bold transition-colors" :class="isDark ? 'text-gray-300' : 'text-[#1f1f1f]'">{{ formatDate(ticket.created_at) }}</span>
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
import { useTheme } from '@/composables/useTheme';

const { isDark } = useTheme();
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
const approvalChain = ref([]);
const loading = ref(true);
const approvalComment = ref('');

const currentUser = computed(() => userStore.userProfile);

const getAuthOptions = () => {
    const token = userStore.getAuthToken;
    if (!token) return null;
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

const isPendingApproval = computed(() => {
    if (!approvalInfo.value || !ticket.value) return false;
    
    const isMyTurn = Number(approvalInfo.value.approver_id) === Number(currentUser.value.id);
    const statusAwaiting = ['PENDING', 'WAITING APPROVE'].includes(ticket.value.status);
    const isRowPending = approvalInfo.value.status === 'PENDING';
    
    return isMyTurn && statusAwaiting && isRowPending;
});

const hasAlreadyApproved = computed(() => {
    return approvalChain.value.some(a => Number(a.approver_id) === Number(currentUser.value.id) && a.status === 'APPROVED');
});

const canForceReject = computed(() => {
    if (!ticket.value || ['CLOSED', 'RESOLVED', 'REJECTED'].includes(ticket.value.status)) return false;
    
    // ผู้ที่มีสิทธิ์เห็นปุ่ม rejected ปฏิเสธ ตั้งแต่ Rank 3 ขึ้นไป (Rank 1, 2, 3)
    const isManagerOrHigher = currentUser.value?.level_rank && Number(currentUser.value.level_rank) <= 3;
    
    return hasAlreadyApproved.value || isManagerOrHigher;
});

const fetchData = async () => {
    if (!currentUser.value || !currentUser.value.id || !$api) return;
    const options = getAuthOptions();
    if (!options) return;

    try {
        // ✅ ใช้ allSettled เพื่อให้ API ที่ล้ม (เช่น /approval หลัง approve แล้ว) ไม่ทำให้ตัวอื่นพังตาม
        const results = await Promise.allSettled([
            $api.get(`/tickets/${ticketId}`, options),
            $api.get(`/tickets/${ticketId}/logs`, options),
            $api.get(`/tickets/${ticketId}/approval`, options),
            $api.get(`/tickets/${ticketId}/approval-chain`, options) 
        ]);

        const [resTicket, resLogs, resApproval, resChain] = results;

        if(resTicket.status === 'fulfilled' && resTicket.value.data.success) ticket.value = resTicket.value.data.data;
        if(resLogs.status === 'fulfilled' && resLogs.value.data.success) logs.value = resLogs.value.data.data;
        if(resApproval.status === 'fulfilled' && resApproval.value.data.success) approvalInfo.value = resApproval.value.data.data;
        else approvalInfo.value = null; // ล้างค่าเมื่อไม่มี pending approval แล้ว
        if(resChain.status === 'fulfilled' && resChain.value.data.success) approvalChain.value = resChain.value.data.data;

        // แสดง error เฉพาะเมื่อ ticket หลักโหลดไม่ได้
        if (resTicket.status === 'rejected') {
            if(modal) modal.alert(t('approval_detail.alert_error'), t('approval_detail.error_title'), 'error');
        }
    } catch (err) {
        if(modal) modal.alert(t('approval_detail.alert_error'), t('approval_detail.error_title'), 'error');
    } finally {
        loading.value = false;
    }
};

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

        modal.alert(t('approval_detail.alert_success', { action: actionText }), t('approval_detail.success_title'), 'success');
        
        await fetchData();

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
    const rootUrl = baseUrl.endsWith('/api') ? baseUrl.replace('/api', '') : baseUrl;
    return `${rootUrl}/api/uploads${filePath}`;
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
    return action === 'APPROVED' ? 'bg-green-500' : (action === 'REJECTED' ? 'bg-red-500' : 'bg-gray-400');
};

const getPriorityClasses = (priority) => {
    switch (priority) {
        case 'LOW': return isDark.value ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' : 'text-emerald-600 border-emerald-200 bg-emerald-50';
        case 'MEDIUM': return isDark.value ? 'text-yellow-400 border-yellow-500/20 bg-yellow-500/10' : 'text-yellow-600 border-yellow-200 bg-yellow-50';
        case 'HIGH': return isDark.value ? 'text-orange-400 border-orange-500/20 bg-orange-500/10' : 'text-orange-600 border-orange-200 bg-orange-50';
        case 'VERY_HIGH': return isDark.value ? 'text-red-400 border-red-500/20 bg-red-500/10' : 'text-red-600 border-red-200 bg-red-50';
        default: return isDark.value ? 'text-gray-400 border-gray-500/20 bg-gray-500/10' : 'text-gray-500 border-gray-200 bg-gray-100';
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
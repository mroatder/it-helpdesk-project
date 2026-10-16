<template>
  <div class="p-6 font-sans max-w-7xl mx-auto pb-24 transition-colors" :class="isDark ? 'text-gray-300' : 'text-[#444746]'">
    
    <div v-if="loading" class="text-center py-20">
      <svg class="animate-spin h-10 w-10 mx-auto text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      <p class="mt-4 text-gray-500">{{ $t('ticket_detail.loading') }}</p>
    </div>

    <div v-else-if="ticket && ticket.ticket_id">
      
      <div class="flex justify-between items-center mb-4">
        <button 
            @click="goBack" 
            class="flex items-center gap-2 transition-colors text-sm"
            :class="isDark ? 'text-gray-400 hover:text-white' : 'text-[#727775] hover:text-blue-600'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
          {{ $t('ticket_detail.back_to_list') }} 
        </button>

        <div v-if="canCancelOrReject && ticket.status !== 'REJECTED' && ticket.status !== 'CANCELLED' && ticket.status !== 'CLOSED'" class="flex gap-2">
          <button @click="updateTicketStatus('CANCELLED')" class="px-4 py-1.5 bg-gray-500/20 hover:bg-gray-500/30 text-gray-700 dark:text-gray-300 border border-gray-500/30 rounded-lg text-sm font-bold transition-colors">
            {{ $t('ticket_detail.btn_cancel') }}
          </button>
          <button @click="updateTicketStatus('REJECTED')" class="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-red-500/20 transition-colors">
            {{ $t('ticket_detail.btn_reject') }}
          </button>
        </div>
      </div>

      <div v-if="ticket.status === 'WAITING APPROVE' && approvalInfo" class="rounded-2xl p-4 mb-6 flex items-start gap-4 border transition-colors"
           :class="isDark ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-amber-50 border-amber-200'">
        <div class="p-2 rounded-lg text-yellow-500 transition-colors" :class="isDark ? 'bg-yellow-500/20' : 'bg-amber-100'">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <div class="flex-1">
          <h4 class="font-bold text-lg" :class="isDark ? 'text-yellow-500' : 'text-amber-800'">Waiting for Approval</h4>
          <p class="text-sm mt-1 transition-colors" :class="isDark ? 'text-yellow-200/70' : 'text-amber-700'">
            {{ $t('ticket_detail.pending_desc_prefix') }} <span class="font-bold" :class="isDark ? 'text-white' : 'text-amber-900'">{{ approvalInfo.approver_name }}</span>
          </p>
        </div>
        
        <div v-if="isCurrentUserApprover" class="flex gap-2">
          <button v-on:click="handleApproval('REJECTED')" class="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg text-sm font-bold transition-colors">{{ $t('approval_list.btn_reject') }}</button>
          <button v-on:click="handleApproval('APPROVED')" class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-green-500/20 transition-colors">{{ $t('approval_list.btn_approve') }}</button>
        </div>
      </div>

      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b transition-colors pb-6"
           :class="isDark ? 'border-white/5' : 'border-[rgba(0,0,0,0.08)]'">
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-2">
            <span class="font-mono text-xl font-bold tracking-wide transition-colors" :class="isDark ? 'text-blue-400' : 'text-blue-600'">#{{ ticket['ticket_no'] }}</span>
            <span :class="getTypeClasses(ticket.ticket_type)" class="px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider shadow-sm flex items-center gap-1.5 transition-all"><span class="w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_5px_currentColor]"></span>{{ ticket.ticket_type || 'INCIDENT' }}</span>
            <span :class="getStatusClasses(ticket.status)" class="px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider shadow-sm transition-all">{{ ticket.status }}</span>
            <span :class="getPriorityClasses(ticket.priority)" class="px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider shadow-sm transition-all">{{ ticket.priority }}</span>
          </div>
          <h1 class="text-3xl font-bold tracking-tight leading-tight transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">{{ ticket.subject }}</h1>
          <p class="text-sm mt-1 transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ $t('ticket_detail.created_on') }} {{ formatDate(ticket.created_at) }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-8">
          <div class="p-8 rounded-2xl border transition-all duration-300 shadow-sm"
               :class="isDark ? 'bg-[#282A2C] border-white/5 shadow-black/20' : 'bg-white border-[rgba(0,0,0,0.08)] shadow-[0_1px_2px_0_rgba(60,64,67,0.30)]'">
            <h3 class="text-lg font-bold mb-4 flex items-center gap-2 border-b transition-colors pb-2"
                :class="isDark ? 'text-white border-white/5' : 'text-[#1f1f1f] border-[rgba(0,0,0,0.08)]'"><svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"></path></svg>{{ $t('ticket_detail.description_title') }}</h3>
            <div class="leading-relaxed text-sm whitespace-pre-line pl-1 transition-colors" :class="isDark ? 'text-gray-300' : 'text-[#444746]'">{{ ticket.description }}</div>
            
            <!-- ๐“ Attachments -->
            <div v-if="ticket.attachments && ticket.attachments.length > 0" class="mt-8 pt-6 border-t transition-colors" :class="isDark ? 'border-white/5' : 'border-[rgba(0,0,0,0.08)]'">
              <h4 class="text-sm font-bold mb-3 flex items-center gap-2 transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">
                <svg class="w-4 h-4 transition-colors" :class="isDark ? 'text-blue-400' : 'text-blue-600'" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                {{ $t('create_ticket.attachments_label') }}
              </h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div v-for="file in ticket.attachments" :key="file.attachment_id" class="p-3 border rounded-xl hover:border-blue-500/30 transition-all flex items-center justify-between group" :class="isDark ? 'bg-[#1A1C1E] border-white/5' : 'bg-gray-50 border-[rgba(0,0,0,0.06)]'">
                  <div class="flex items-center gap-3 overflow-hidden">
                    <div class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors" :class="isDark ? 'bg-[#282A2C]' : 'bg-white border border-[rgba(0,0,0,0.04)]'">
                      <svg v-if="file.file_type.includes('image')" class="w-6 h-6 transition-colors" :class="isDark ? 'text-blue-400' : 'text-blue-500'" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <svg v-else class="w-6 h-6 transition-colors" :class="isDark ? 'text-gray-400' : 'text-gray-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                    </div>
                    <div class="overflow-hidden">
                      <p class="text-xs font-medium truncate transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">{{ file.file_name }}</p>
                      <p class="text-[10px] transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ (file.file_size / 1024 / 1024).toFixed(2) }} MB</p>
                    </div>
                  </div>
                  <a :href="getFileUrl(file.file_path)" target="_blank" title="View File" class="p-2 transition-all text-xs flex items-center gap-1 border rounded-lg" :class="isDark ? 'text-blue-400 hover:bg-blue-500/10 border-blue-500/20 bg-blue-500/5' : 'text-blue-700 hover:bg-blue-100 border-blue-200 bg-blue-50'">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    <span>{{ $t('ticket_detail.view_file') || 'เธ”เธนเนเธเธฅเน' }}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- ๐Ÿ“Ž Approval Path (Admins/Techs View) -->
          <div v-if="approvalChain.length > 0" class="p-6 rounded-2xl border transition-all duration-300 shadow-sm"
               :class="isDark ? 'bg-[#282A2C] border-white/5 shadow-black/20' : 'bg-white border-[rgba(0,0,0,0.08)] shadow-[0_1px_2px_0_rgba(60,64,67,0.30)]'">
            <h3 class="text-sm font-bold uppercase tracking-wider mb-6 flex items-center gap-2 transition-colors"
                :class="isDark ? 'text-gray-400' : 'text-[#727775]'">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              เส้นทางการอนุมัติ (Approval Status)
            </h3>
            <div class="flex flex-col gap-6">
              <div v-for="(step, index) in approvalChain" :key="index" class="space-y-2">
                <div class="flex items-center gap-4">
                  <div :class="['w-3 h-3 rounded-full', step.status === 'APPROVED' ? 'bg-green-500' : step.status === 'REJECTED' ? 'bg-red-500' : step.status === 'PENDING' ? 'bg-blue-500 animate-pulse' : 'bg-gray-600']"></div>
                  <div class="flex-1 text-sm">
                    <p class="font-bold transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">{{ step.approver_name }} <span class="font-normal transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">({{ step.approver_title }})</span></p>
                    <p class="text-[11px] transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">
                      {{ step.status === 'APPROVED' ? 'อนุมัติแล้ว' : step.status === 'REJECTED' ? 'ปฏิเสธ' : step.status === 'PENDING' ? 'กำลังพิจารณา' : 'รอลำดับถัดไป' }}
                    </p>
                  </div>
                  <div v-if="step.approved_at" class="text-[10px] font-mono transition-colors" :class="isDark ? 'text-gray-600' : 'text-[#9aa0a6]'">{{ formatDate(step.approved_at) }}</div>
                </div>
                <div v-if="step.comment" class="ml-7">
                  <p class="text-xs p-3 rounded-xl border italic leading-relaxed transition-colors shadow-inner"
                     :class="isDark ? 'text-blue-400 bg-blue-500/5 border-blue-500/10' : 'text-blue-700 bg-blue-50 border-blue-100'">
                    " {{ step.comment }} "
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="p-6 rounded-2xl border transition-all duration-300 shadow-sm"
               :class="isDark ? 'bg-[#282A2C] border-white/5 shadow-black/20' : 'bg-white border-[rgba(0,0,0,0.08)] shadow-[0_1px_2px_0_rgba(60,64,67,0.30)]'">
            <h3 class="text-lg font-bold mb-6 flex items-center gap-2 transition-colors"
                :class="isDark ? 'text-white' : 'text-[#1f1f1f]'"><svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>{{ $t('ticket_detail.history_title') }}</h3>
            <div class="space-y-8 relative pl-2">
              <div class="absolute left-6 top-2 bottom-2 w-0.5 transition-colors" :class="isDark ? 'bg-white/5' : 'bg-gray-100'"></div>
              <div v-for="log in logs" :key="log.log_id" class="relative pl-12">
                <div class="absolute left-4 top-1 w-4 h-4 rounded-full border-4 z-10 transition-colors" 
                     :class="[getActionColor(log.action), isDark ? 'border-[#282A2C]' : 'border-white']"></div>
                <div class="flex justify-between items-center mb-2">
                  <span class="text-sm font-bold emoji-support transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">{{ getActionLabel(log.action) }} <span class="font-normal transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ $t('ticket_detail.by') }} {{ log.actor_name }}</span></span>
                  <span class="text-xs transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#9aa0a6]'">{{ formatDate(log.created_at) }}</span>
                </div>
                <div class="p-4 rounded-xl border text-sm shadow-sm whitespace-pre-line transition-colors break-words overflow-hidden"
                     :class="isDark ? 'bg-[#1A1C1E] border-white/5 text-gray-300' : 'bg-gray-50 border-[rgba(0,0,0,0.06)] text-[#444746]'">{{ log.message || '-' }}</div>
              </div>
              <div v-if="logs.length === 0" class="text-center text-gray-500 py-4">{{ $t('ticket_detail.no_logs') }}</div>
            </div>

            <div v-if="ticket.status !== 'WAITING APPROVE' && ticket.status !== 'REJECTED'" class="mt-8 pt-6 border-t items-start transition-colors"
                 :class="isDark ? 'border-white/5' : 'border-[rgba(0,0,0,0.08)]'">
              <p class="text-xs mb-3 font-bold uppercase tracking-wider transition-colors" :class="isDark ? 'text-gray-400' : 'text-[#727775]'">{{ $t('ticket_detail.update_workflow_title') }}</p>
              <div class="flex gap-4">
                <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-blue-500 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white shadow-inner">IT</div>
                <div class="flex-1 space-y-3">
                  <select v-model="newLog.action" 
                          class="w-full p-2.5 rounded-xl border focus:ring-2 focus:ring-blue-500 text-sm emoji-support transition-all"
                          :class="isDark ? 'bg-[#1A1C1E] text-white border-white/10' : 'bg-white text-[#1f1f1f] border-[rgba(0,0,0,0.12)]'">
                      <option v-for="opt in availableActions" :key="opt.value" :value="opt.value" :disabled="opt.disabled">{{ opt.label }}</option>
                  </select>
                  <textarea v-model="newLog.message" rows="3" 
                            :disabled="isCommentDisabled"
                            :placeholder="commentPlaceholder" 
                            class="w-full p-3 rounded-xl border focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all resize-none shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                            :class="isDark ? 'bg-[#1A1C1E] text-white border-white/10 placeholder-gray-600' : 'bg-white text-[#1f1f1f] border-[rgba(0,0,0,0.12)] placeholder-[#9aa0a6]'"></textarea>
                  <div class="flex justify-end mt-3 gap-2"><button v-on:click="addLog" :disabled="isSubmitting || isCommentDisabled" class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-colors disabled:opacity-50 flex items-center gap-2"><svg v-if="isSubmitting" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>{{ $t('ticket_detail.btn_post') }}</button></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-1 space-y-6">
          <div class="p-5 rounded-2xl border transition-all duration-300 shadow-sm"
               :class="isDark ? 'bg-[#282A2C] border-white/5 shadow-black/20' : 'bg-white border-[rgba(0,0,0,0.08)] shadow-[0_1px_2px_0_rgba(60,64,67,0.30)]'">
            <h4 class="text-xs font-bold uppercase tracking-wider mb-4 border-b transition-colors pb-2"
                :class="isDark ? 'text-gray-500 border-white/5' : 'text-[#727775] border-[rgba(0,0,0,0.08)]'">{{ $t('ticket_detail.requester_title') }}</h4>
            <div class="flex items-center gap-3 mb-4">
              <div class="w-12 h-12 rounded-full bg-pink-600 flex items-center justify-center text-white font-bold shadow-md">{{ ticket.requester_name ? ticket.requester_name.substring(0,2).toUpperCase() : '??' }}</div>
              <div><p class="font-bold text-base transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">{{ ticket.requester_name }}</p><p class="text-xs transition-colors" :class="isDark ? 'text-gray-400' : 'text-[#727775]'">{{ ticket.requester_dept }}</p></div>
            </div>
            <div class="space-y-2"><div class="flex justify-between text-xs"><span class="transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ $t('ticket_detail.email') }}</span><a :href="`mailto:${ticket.requester_email}`" class="text-blue-400 hover:underline hover:text-blue-500 transition-colors">{{ ticket.requester_email }}</a></div></div>
          </div>

          <div class="p-5 rounded-2xl border transition-all duration-300 shadow-sm space-y-5"
               :class="isDark ? 'bg-[#282A2C] border-white/5 shadow-black/20' : 'bg-white border-[rgba(0,0,0,0.08)] shadow-[0_1px_2px_0_rgba(60,64,67,0.30)]'">
              <h4 class="text-xs font-bold uppercase tracking-wider border-b transition-colors pb-2"
                  :class="isDark ? 'text-gray-500 border-white/5' : 'text-[#727775] border-[rgba(0,0,0,0.08)]'">{{ $t('ticket_detail.properties_title') }}</h4>
              
              <div>
                  <p class="text-xs mb-2 font-bold transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ $t('ticket_list.col_status') }}</p>
                  <div class="flex justify-start">
                      <span :class="getStatusClasses(ticket.status)" 
                            class="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm min-w-[100px] inline-block text-center border transition-all">
                          {{ ticket.status === 'WAITING APPROVE' ? (isDark ? 'Waiting Approval' : 'WAITING APPROVE') : ticket.status }}
                      </span>
                  </div>
              </div>

              <div>
                  <p class="text-xs mb-2 font-bold transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ $t('ticket_list.col_priority') }}</p>
                  <div class="relative">
                      <select v-model="ticket.priority" @change="updatePriorityOnly"
                          class="w-full pl-3 pr-8 py-2 rounded-lg border focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer text-sm font-normal transition-all shadow-sm"
                          :class="[isDark ? 'bg-[#1A1C1E] border-white/10' : 'bg-white border-[rgba(0,0,0,0.12)]', !ticket.priority ? (isDark ? 'text-gray-400' : 'text-gray-500') : (isDark ? 'text-white' : 'text-[#1f1f1f]')]">
                          <option value="" disabled :class="isDark ? 'bg-[#1A1C1E] text-gray-400' : 'bg-white text-gray-400'">{{ $t('ticket_detail.select_priority_placeholder') }}</option>
                          <option value="LOW" :class="isDark ? 'bg-[#1A1C1E] text-white' : 'bg-white text-[#1f1f1f]'">Low</option>
                          <option value="MEDIUM" :class="isDark ? 'bg-[#1A1C1E] text-white' : 'bg-white text-[#1f1f1f]'">Medium</option>
                          <option value="HIGH" :class="isDark ? 'bg-[#1A1C1E] text-white' : 'bg-white text-[#1f1f1f]'">High</option>
                          <option value="VERY_HIGH" :class="isDark ? 'bg-[#1A1C1E] text-white' : 'bg-white text-[#1f1f1f]'">Critical</option>
                      </select>
                      <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 transition-colors" :class="isDark ? 'text-gray-400' : 'text-[#727775]'">
                          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                  </div>
              </div>

              <div>
                  <p class="text-xs mb-2 font-bold transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ $t('ticket_detail.type_label') }}</p>
                  <div class="relative">
                      <select v-model="ticket.ticket_type" v-on:change="updateTicketType" 
                              class="w-full pl-3 pr-8 py-2 rounded-lg border focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer text-sm font-normal transition-all shadow-sm"
                              :class="[isDark ? 'bg-[#1A1C1E] border-white/10' : 'bg-white border-[rgba(0,0,0,0.12)]', !ticket.ticket_type ? (isDark ? 'text-gray-400' : 'text-gray-500') : (isDark ? 'text-white' : 'text-[#1f1f1f]')]">
                          <option value="" disabled :class="isDark ? 'bg-[#1A1C1E] text-gray-400' : 'bg-white text-gray-400'">{{ $t('ticket_detail.select_type_placeholder') }}</option>
                          <option value="INCIDENT" :class="isDark ? 'bg-[#1A1C1E] text-white' : 'bg-white text-[#1f1f1f]'">{{ $t('ticket_detail.type_incident') }}</option>
                          <option value="SUPPORT" :class="isDark ? 'bg-[#1A1C1E] text-white' : 'bg-white text-[#1f1f1f]'">{{ $t('ticket_detail.type_support') }}</option>
                      </select>
                      <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 transition-colors" :class="isDark ? 'text-gray-400' : 'text-[#727775]'">
                          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                  </div>
              </div>

              <div>
                  <p class="text-xs mb-2 font-bold transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ $t('ticket_detail.assignee_label') }}</p>
                  <div class="relative">
                      <select v-model="ticket.technician_id" v-on:change="assignTechnician" 
                              class="w-full pl-3 pr-8 py-2 rounded-lg border focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer text-sm font-normal transition-all shadow-sm"
                              :class="[isDark ? 'bg-[#1A1C1E] border-white/10' : 'bg-white border-[rgba(0,0,0,0.12)]', !ticket.technician_id ? (isDark ? 'text-gray-400' : 'text-gray-500') : (isDark ? 'text-white' : 'text-[#1f1f1f]')]">
                          <option :value="null" :class="isDark ? 'bg-[#1A1C1E] text-gray-400' : 'bg-white text-gray-400'">{{ $t('ticket_detail.unassigned') }}</option>
                          <option v-for="tech in technicians" :key="tech.id || tech.user_id" :value="tech.id || tech.user_id" :class="isDark ? 'bg-[#1A1C1E] text-white' : 'bg-white text-[#1f1f1f]'">{{ tech.full_name }}</option>
                      </select>
                      <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 transition-colors" :class="isDark ? 'text-gray-400' : 'text-[#727775]'">
                          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                  </div>
              </div>

              <div class="grid grid-cols-1 gap-4 pt-2">
                  <div>
                      <p class="text-xs mb-1 font-bold transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ $t('ticket_detail.date_created') }}</p>
                      <p class="text-sm font-normal transition-colors" :class="isDark ? 'text-gray-300' : 'text-[#444746]'">{{ formatDate(ticket.created_at) }}</p>
                  </div>
              </div>
          </div>
      </div>
    </div>
  </div>

  <div v-else class="flex flex-col items-center justify-center py-32 rounded-3xl transition-all duration-300 shadow-2xl border"
         :class="isDark ? 'bg-[#282A2C] border-white/5 shadow-black/40' : 'bg-white border-[rgba(0,0,0,0.08)] shadow-[0_4px_20px_rgba(0,0,0,0.1)]'">
      <div class="p-5 bg-red-500/10 rounded-full mb-6 ring-1 ring-red-500/30">
        <svg class="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
      </div>
      <h2 class="text-2xl font-bold mb-2 uppercase tracking-widest text-center transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">Access Denied</h2>
      <p class="mb-8 text-center max-w-md px-6 transition-colors" :class="isDark ? 'text-gray-400' : 'text-[#727775]'">
        เธเธธเธ“เนเธกเนเธกเธตเธชเธดเธ—เธเธดเนเน€เธเนเธฒเธ–เธถเธเธเนเธญเธกเธนเธฅเธ•เธฑเนเธงเนเธเธเธตเน เธซเธฃเธทเธญเธ•เธฑเนเธงเธ–เธนเธเธฅเธเธญเธญเธเธเธฒเธเธฃเธฐเธเธเนเธฅเนเธง
      </p>
      <button 
        @click="$router.push('/app/my-tickets')" 
        class="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95"
      >
        เธเธฅเธฑเธเนเธเธซเธเนเธฒเธ•เธฑเนเธงเธเธญเธเธเธฑเธ
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
import { useTheme } from '@/composables/useTheme';
import { useTicketStore } from '@/stores/ticketStore';

const { isDark } = useTheme();

const { proxy } = getCurrentInstance();
const $api = proxy.$api; 

const { t } = useI18n(); 
const route = useRoute();
const router = useRouter(); 
const userStore = useUserStore();
const modal = useModalStore();
const ticketStore = useTicketStore();
const ticketId = route.params.id;

const goBack = () => {
    if (window.history.length > 1) {
        router.back();
    } else {
        router.push('/app/admin/tickets');
    }
};
const ticket = ref(null); // โ… เน€เธฃเธดเนเธกเธ•เนเธเน€เธเนเธ null เน€เธชเธกเธญ
const logs = ref([]);
const technicians = ref([]);
const approvalInfo = ref(null);
const approvalChain = ref([]); // โจ เนเธ—เธฃเธเนเธซเธกเน: เธชเธณเธซเธฃเธฑเธเน€เธเนเธเธเนเธญเธกเธนเธฅเธฅเธณเธ”เธฑเธเธเธฒเธฃเธญเธเธธเธกเธฑเธ•เธด
const loading = ref(true);
const isSubmitting = ref(false);
const isAuthorized = ref(true);

const currentUser = computed(() => userStore.userProfile);

const canCancelOrReject = computed(() => {
    const allowedUsers = ['admin', 'ittest'];
    const username = currentUser.value?.username?.toLowerCase() || '';
    return allowedUsers.includes(username);
});

const newLog = ref({ action: 'NOTE', message: '' });

const hasBeenAcknowledged = computed(() => {
    if (!ticket.value) return false;
    if (ticket.value.status !== 'NEW') return true;
    if (logs.value && logs.value.some(l => l.action === 'ACKNOWLEDGED')) return true;
    return false;
});

const isCommentDisabled = computed(() => {
    if (!ticket.value) return true;
    if (!hasBeenAcknowledged.value && newLog.value.action !== 'ACKNOWLEDGED') {
        return true;
    }
    return false;
});

const commentPlaceholder = computed(() => {
    if (isCommentDisabled.value) {
        return t('ticket_detail.please_acknowledge_first');
    }
    return t('ticket_detail.log_placeholder');
});

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
            actions.push({ label: '——————————', value: '', disabled: true });
            actions.push({ label: t('action_labels.acknowledge'), value: 'ACKNOWLEDGED' });
        }
    } else if (status === 'PENDING' || status === 'IN PROGRESS' || status === 'IN_PROGRESS') {
        actions.push({ label: '——————————', value: '', disabled: true });
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
            isAuthorized.value = true; // โ… เธกเธตเธชเธดเธ—เธเธดเน
            normalizeTicketProperties();
            return true;
        }
        return false;
    } catch (err) {
        // If interceptor already handled token expiry, skip
        if (err._isHandled) return false;

        isAuthorized.value = false;
        ticket.value = null; 
        
        // Only show Access Denied for permission-based 403 (not token issues)
        const errCode = err.response?.data?.code;
        const isPermissionDenied = err.response?.status === 403 && errCode !== 'TOKEN_EXPIRED' && errCode !== 'TOKEN_INVALID';
        
        if (isPermissionDenied) {
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
        await Promise.all([fetchTicket(), fetchLogs(), fetchApprovalInfo(), ticketStore.fetchCounts()]);
    } catch (err) { modal.alert(t('approval_detail.alert_error'), t('approval_detail.error_title'), 'error'); }
};

const updateTicketType = async () => {
    try {
        // ๐ฏ 1. เธขเธดเธเนเธเธ—เธตเน API Update เน€เธเธทเนเธญเน€เธเธฅเธตเนเธขเธเธเนเธฒเนเธ Database เธเธฃเธดเธเน (เนเธเน PUT)
        await $api.put(`/tickets/update/${ticketId}`, {
            ticket_type: ticket.value.ticket_type
        }, getAuthOptions());

        // ๐ฏ 2. (Option) เธขเธดเธเนเธเธ—เธตเน API Logs เน€เธเธทเนเธญเน€เธเนเธเธเธฃเธฐเธงเธฑเธ•เธดเธงเนเธฒเนเธเธฃเน€เธเนเธเธเธเน€เธเธฅเธตเนเธขเธ (เนเธเน POST เน€เธซเธกเธทเธญเธเน€เธ”เธดเธก)
        await $api.post(`/tickets/${ticketId}/logs`, {
            action: 'NOTE',
            message: t('alert_messages.update_type_log_msg', { type: ticket.value.ticket_type }),
            actor_id: currentUser.value.id,
            category_id: ticket.value.category_id
        }, getAuthOptions());

        if(modal) modal.alert(t('alert_messages.update_type_success'), t('approval_detail.success_title'), 'success');
        
        // ๐ฏ 3. เนเธซเธฅเธ”เธเนเธญเธกเธนเธฅเนเธซเธกเนเธเธฒเธ Server เธกเธฒเนเธชเธ”เธเธเธฅเธ—เธตเนเธซเธเนเธฒเธเธญ
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
        await Promise.all([fetchTicket(), fetchLogs(), ticketStore.fetchCounts()]);
    } catch (err) { console.error(err); }
};

const updateTicketStatus = async (newStatus) => {
    const actionText = newStatus === 'REJECTED' ? 'Reject' : 'Cancel';
    const confirmed = await modal.confirm(`Are you sure you want to ${actionText} this ticket?`, `Confirm ${actionText}`);
    if (!confirmed) return;

    try {
        const options = getAuthOptions();
        await $api.put(`/tickets/update/${ticketId}`, { status: newStatus }, options);
        await $api.post(`/tickets/${ticketId}/logs`, {
            action: newStatus,
            message: `Ticket has been ${newStatus.toLowerCase()} by ${currentUser.value?.username || currentUser.value?.name}`,
            actor_id: currentUser.value.id
        }, options);

        if (modal) modal.alert(`Ticket successfully ${newStatus.toLowerCase()}`, "Success", "success");
        await Promise.all([fetchTicket(), fetchLogs(), ticketStore.fetchCounts()]);
    } catch (err) {
        console.error("Update Status Error:", err);
        if (modal) modal.alert("Error updating status", "Error", "error");
    }
};

// เธเธฑเธเธเนเธเธฑเธเธชเธณเธซเธฃเธฑเธเธญเธฑเธเน€เธ”เธ•เน€เธเธเธฒเธฐ Priority เน€เธ—เนเธฒเธเธฑเนเธ (Status เธเธฐเธญเธฑเธเน€เธ”เธ•เธเนเธฒเธ Log Workflow)
const updatePriorityOnly = async () => {
    try {
        const options = getAuthOptions();
        if (!options) return;

        // 1. เธญเธฑเธเน€เธ”เธ•เน€เธเธเธฒเธฐ priority
        await $api.put(`/tickets/update/${ticketId}`, {
            priority: ticket.value.priority
        }, options);

        // 2. เธเธฑเธเธ—เธถเธ Log เธเธฒเธฃเน€เธเธฅเธตเนเธขเธเธฃเธฐเธ”เธฑเธเธเธงเธฒเธกเธชเธณเธเธฑเธ
        await $api.post(`/tickets/${ticketId}/logs`, {
            action: 'NOTE',
            message: `Priority has been changed to: ${ticket.value.priority}`,
            actor_id: currentUser.value.id
        }, options);

        if (modal) modal.alert(t('alert_messages.update_type_success'), t('approval_detail.success_title'), 'success');
        
        // 3. เธฃเธตเนเธซเธฅเธ”เธเนเธญเธกเธนเธฅ
        await Promise.all([fetchTicket(), fetchLogs(), ticketStore.fetchCounts()]);
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
        await Promise.all([fetchTicket(), fetchLogs(), ticketStore.fetchCounts()]);
    } catch (err) { console.error(err); }
    finally { isSubmitting.value = false; }
};

const formatDate = (dateStr) => {
    if(!dateStr) return '';
    return new Date(dateStr).toLocaleString('th-TH', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
};

const getFileUrl = (filePath) => {
    if (!filePath) return '';
    const baseUrl = import.meta.env.VITE_API_URL || '/api';
    const rootUrl = baseUrl.endsWith('/api') ? baseUrl.replace('/api', '') : baseUrl;
    return `${rootUrl}/api/uploads${filePath}`;
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
    if (s === 'WAITING APPROVE') return isDark.value ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' : 'bg-amber-50 text-amber-700 border-amber-200';
    if (s === 'NEW') return isDark.value ? 'bg-sky-500/10 text-sky-400 border-sky-500/30' : 'bg-sky-50 text-sky-700 border-sky-200';
    if (s.includes('PROGRESS')) return isDark.value ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : 'bg-blue-50 text-blue-700 border-blue-200';
    if (s === 'PENDING') return isDark.value ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' : 'bg-orange-50 text-orange-700 border-orange-200';
    if (['RESOLVED', 'CLOSED'].includes(s)) return isDark.value ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (s === 'REJECTED') return isDark.value ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-red-50 text-red-700 border-red-200';
    return isDark.value ? 'bg-gray-700/30 text-gray-400 border-white/5' : 'bg-gray-100 text-gray-700 border-gray-200';
};

const getTypeClasses = (type) => {
    const t = type?.toUpperCase().trim() || 'INCIDENT';
    if (['SUPPORT', 'SERVICE'].includes(t)) return isDark.value ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' : 'bg-purple-50 text-purple-700 border-purple-200';
    if (t === 'INCIDENT') return isDark.value ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' : 'bg-cyan-50 text-cyan-700 border-cyan-200';
    if (t === 'PURCHASE') return isDark.value ? 'bg-pink-500/10 text-pink-400 border-pink-500/30' : 'bg-pink-50 text-pink-700 border-pink-200';
    return isDark.value ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' : 'bg-gray-50 text-gray-700 border-gray-200';
};

const getPriorityClasses = (priority) => {
    const p = { 
        'LOW': isDark.value ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : 'text-emerald-700 border-emerald-200 bg-emerald-50', 
        'MEDIUM': isDark.value ? 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' : 'text-yellow-700 border-yellow-200 bg-yellow-50', 
        'HIGH': isDark.value ? 'text-orange-400 border-orange-500/30 bg-orange-500/10' : 'text-orange-700 border-orange-200 bg-orange-50', 
        'VERY_HIGH': isDark.value ? 'text-red-400 border-red-500/30 bg-red-500/10' : 'text-red-700 border-red-200 bg-red-50' 
    };
    return p[priority] || (isDark.value ? 'text-gray-400' : 'text-gray-600');
};

const normalizeTicketProperties = () => {
    if (!ticket.value) return;
    
    if (!ticket.value.priority) {
        ticket.value.priority = '';
    }

    if (!ticket.value.ticket_type) {
        ticket.value.ticket_type = '';
    }
};

onMounted(async () => {
    loading.value = true;
    const success = await fetchTicket();
    
    // ๐ก๏ธ เธชเธณเธเธฑเธเธกเธฒเธ: เธ–เนเธฒ fetchTicket เนเธกเนเธชเธณเน€เธฃเนเธ (success = false) 
    // เธซเนเธฒเธกเนเธเธฃเธฑเธ fetchLogs เธซเธฃเธทเธญเธ•เธฑเธงเธญเธทเนเธเน€เธ”เนเธ”เธเธฒเธ” เน€เธเธฃเธฒเธฐเธเธงเธเธเธฑเนเธเธเนเธเธฐเนเธ”เธ 403 เน€เธซเธกเธทเธญเธเธเธฑเธ
    if (success && isAuthorized.value) {
        await Promise.all([
            fetchLogs(),
            fetchTechnicians(),
            fetchApprovalInfo(),
            fetchApprovalChain() // โจ เนเธซเธฅเธ” Chain เธเนเธญเธกเธนเธฅเธเธฒเธฃเธญเธเธธเธกเธฑเธ•เธด
        ]);
        normalizeTicketProperties();
    }
    loading.value = false;
});
</script>

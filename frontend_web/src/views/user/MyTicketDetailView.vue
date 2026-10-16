<template>
  <div class="p-6 font-sans max-w-7xl mx-auto pb-24 transition-colors" :class="isDark ? 'text-gray-300' : 'text-[#444746]'">
    
    <div v-if="loading" class="text-center py-20">
      <svg class="animate-spin h-10 w-10 mx-auto text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      <p class="mt-4 transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ t('ticket.loading_message') }}</p>
    </div>

    <div v-else-if="ticket && ticket.ticket_id">
        
      <button @click="$router.go(-1)" class="mb-6 flex items-center gap-2 transition-colors text-sm font-medium" :class="isDark ? 'text-gray-400 hover:text-white' : 'text-[#727775] hover:text-blue-600'">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
        {{ t('ticket.back_button') }}
      </button>

      <div v-if="ticket.status === 'WAITING APPROVE' && approvalInfo" class="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 mb-6 flex items-center gap-4 animate-pulse-slow">
        <div class="p-2 bg-yellow-500/20 rounded-lg text-yellow-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <div>
          <h4 class="text-yellow-500 font-bold">{{ t('ticket_detail.pending_title') }}</h4>
          <p class="text-sm mt-0.5 transition-colors" :class="isDark ? 'text-yellow-200/70' : 'text-yellow-700'">
            {{ t('ticket_detail.pending_approval_waiting') }}
            <span class="font-bold transition-colors" :class="isDark ? 'text-white' : 'text-yellow-900'">{{ approvalInfo.approver_name }}</span>
          </p>
        </div>
      </div>

      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b pb-6 transition-colors" :class="isDark ? 'border-white/5' : 'border-[rgba(0,0,0,0.08)]'">
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
          <h1 class="text-3xl font-bold tracking-tight leading-tight transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">{{ ticket.subject }}</h1>
          <p class="text-sm mt-1 transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ t('ticket.created_at_prefix') }} {{ formatDate(ticket.created_at) }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-8">
          
          <!-- ⭐ Satisfaction Rating (CSAT) Section: Shown at the TOP when RESOLVED -->
          <div v-if="ticket && ticket.status === 'RESOLVED'" class="p-6 rounded-2xl border transition-all duration-500 shadow-xl relative overflow-hidden group mb-6"
               :class="isDark ? 'bg-[#282A2C] border-blue-500/20 shadow-md' : 'bg-white border-blue-100 shadow-blue-500/5'">
            
            <div v-if="!isDark" class="absolute -top-16 -right-16 w-32 h-32 bg-blue-50 rounded-full blur-2xl opacity-40"></div>
            
            <div class="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
              <div class="flex-shrink-0 flex flex-col items-center">
                <div class="inline-flex items-center justify-center p-2.5 bg-blue-500/10 rounded-xl mb-1 text-blue-500 ring-4 ring-blue-500/5">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h3 class="text-xs font-black tracking-tight transition-colors hidden md:block" :class="isDark ? 'text-white' : 'text-gray-900'">
                  {{ t('feedback.thanks') }}
                </h3>
              </div>

              <div class="flex-1">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 class="text-base font-black tracking-tight mb-0.5 transition-colors" :class="isDark ? 'text-white' : 'text-gray-900'">
                      {{ t('feedback.resolved_title') }}
                    </h3>
                    <p class="text-[11px] font-medium transition-colors" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                      {{ t('feedback.resolved_subtitle') }}
                    </p>
                  </div>

                  <!-- Star Rating Interactive (Compact) -->
                  <div class="flex items-center gap-2">
                    <button v-for="star in 5" :key="star" 
                            @click="ratingScore = star"
                            @mouseenter="hoverScore = star"
                            @mouseleave="hoverScore = 0"
                            class="transition-all duration-300 transform"
                            :class="[
                              (hoverScore || ratingScore) >= star ? 'scale-110' : 'scale-100 opacity-30',
                              star <= 2 ? 'text-orange-400' : star <= 3 ? 'text-yellow-400' : 'text-emerald-400'
                            ]">
                      <svg class="w-8 h-8" :fill="(hoverScore || ratingScore) >= star ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.54 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.784.57-1.838-.196-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Comment Section (Slimmed) -->
                <div v-show="ratingScore > 0" class="animate-fade-in">
                  <div class="flex flex-col sm:flex-row gap-3">
                    <input v-model="ratingComment" 
                            type="text"
                            class="flex-1 px-4 py-2 rounded-xl border transition-all text-xs font-medium focus:outline-none focus:ring-4 placeholder:text-gray-400"
                            :class="isDark ? 'bg-[#323436] border-white/5 text-white focus:border-blue-500 focus:ring-blue-500/10' : 'bg-gray-50 border-gray-100 text-gray-900 focus:border-blue-400 focus:ring-blue-500/5'"
                            :placeholder="t('feedback.placeholder')"/>
                    
                    <button @click="submitFeedback" 
                            :disabled="submittingFeedback"
                            class="whitespace-nowrap bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold px-6 py-2 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transform active:scale-95 disabled:opacity-50 text-xs font-mono">
                      <span v-if="submittingFeedback" class="animate-spin h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full"></span>
                      {{ t('feedback.btn_confirm') }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>


          <div class="p-8 rounded-2xl border transition-all duration-300 shadow-lg" :class="isDark ? 'bg-[#282A2C] border-white/10 shadow-md' : 'bg-[#ffffff] border-[rgba(0,0,0,0.08)] shadow-[0_1px_2px_0_rgba(60,64,67,0.30)]'">
            <h3 class="text-lg font-bold mb-4 flex items-center gap-2 border-b pb-2 transition-colors" :class="isDark ? 'text-white border-white/5' : 'text-[#1f1f1f] border-[rgba(0,0,0,0.08)]'">
              <svg class="w-5 h-5 transition-colors" :class="isDark ? 'text-gray-400' : 'text-[#727775]'" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"></path></svg>
              {{ t('ticket.details_title') }}
            </h3>
            <div class="leading-relaxed text-sm whitespace-pre-line pl-1 transition-colors" :class="isDark ? 'text-gray-300' : 'text-[#444746]'">{{ ticket.description }}</div>
            
            <!-- 📎 Attachments -->
            <div v-if="ticket.attachments && ticket.attachments.length > 0" class="mt-8 pt-6 border-t transition-colors" :class="isDark ? 'border-white/5' : 'border-[rgba(0,0,0,0.08)]'">
              <h4 class="text-sm font-bold mb-3 flex items-center gap-2 transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">
                <svg class="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                {{ t('create_ticket.attachments_label') }}
              </h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div v-for="file in ticket.attachments" :key="file.attachment_id" 
                     class="p-3 border rounded-xl transition-all flex items-center justify-between group"
                     :class="isDark ? 'bg-[#1A1C1E] border-white/5 hover:border-blue-500/30' : 'bg-[#f8f9fa] border-[rgba(0,0,0,0.08)] hover:border-blue-300 shadow-sm'">
                  <div class="flex items-center gap-3 overflow-hidden">
                    <div class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors" :class="isDark ? 'bg-[#282A2C]' : 'bg-white shadow-sm'">
                      <svg v-if="file.file_type.includes('image')" class="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <svg v-else class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                    </div>
                    <div class="overflow-hidden">
                      <p class="text-xs font-medium truncate transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">{{ file.file_name }}</p>
                      <p class="text-[10px] transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#9aa0a6]'">{{ (file.file_size / 1024 / 1024).toFixed(2) }} MB</p>
                    </div>
                  </div>
                  <a :href="getFileUrl(file.file_path)" target="_blank" title="View File" class="p-2 text-gray-400 hover:text-blue-400 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all text-xs flex items-center gap-1 border border-white/5 rounded-lg bg-white/5 md:bg-transparent">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    <span class="md:hidden">{{ t('ticket_detail.view_file_short') }}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- ⛓️ Approval Path (User View) -->
          <div v-if="approvalChain.length > 0" class="p-6 rounded-2xl border transition-all duration-300 shadow-lg"
               :class="isDark ? 'bg-[#282A2C] border-white/10 shadow-md' : 'bg-[#ffffff] border-[rgba(0,0,0,0.08)] shadow-[0_1px_2px_0_rgba(60,64,67,0.30)]'">
            <h3 class="text-sm font-bold uppercase tracking-wider mb-6 flex items-center gap-2 transition-colors" :class="isDark ? 'text-gray-400' : 'text-[#727775]'">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {{ t('ticket_detail.approval_status_title') }}
            </h3>
            <div class="flex flex-col gap-6">
              <div v-for="(step, index) in approvalChain" :key="index" class="space-y-2">
                <div class="flex items-center gap-4">
                  <div :class="['w-3 h-3 rounded-full shadow-sm', step.status === 'APPROVED' ? 'bg-green-500' : step.status === 'REJECTED' ? 'bg-red-500' : step.status === 'PENDING' ? 'bg-blue-500 animate-pulse' : 'bg-gray-400']"></div>
                  <div class="flex-1 text-sm">
                    <p class="font-bold transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">{{ step.approver_name }} <span class="font-normal transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">({{ step.approver_title }})</span></p>
                    <p class="text-[11px] transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#9aa0a6]'">
                      {{ statusLabel(step.status) }}
                    </p>
                  </div>
                  <div v-if="step.approved_at" class="text-[10px] font-mono transition-colors" :class="isDark ? 'text-gray-600' : 'text-[#9aa0a6]'">{{ formatDate(step.approved_at) }}</div>
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

          <div class="p-6 rounded-2xl border transition-all duration-300 shadow-lg"
               :class="isDark ? 'bg-[#282A2C] border-white/10 shadow-md' : 'bg-[#ffffff] border-[rgba(0,0,0,0.08)] shadow-[0_1px_2px_0_rgba(60,64,67,0.30)]'">
            <h3 class="text-lg font-bold mb-6 flex items-center gap-2 transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">
              <svg class="w-5 h-5 transition-colors" :class="isDark ? 'text-gray-400' : 'text-[#727775]'" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              {{ t('ticket.timeline_title') }}
            </h3>
            <div class="relative pl-4 pt-2 pb-4">
              <div class="absolute left-[29px] top-4 bottom-4 w-0.5 transition-colors" :class="isDark ? 'bg-white/10' : 'bg-[rgba(0,0,0,0.08)]'"></div>
              <div v-for="log in logs" :key="log.log_id" class="relative pl-12 mb-8 last:mb-0 group">
                <div class="absolute left-[23px] top-1.5 w-3.5 h-3.5 rounded-full border-2 z-10 shadow-sm transition-transform group-hover:scale-110" 
                     :class="[getActionColor(log.action), isDark ? 'border-[#282A2C]' : 'border-white']"></div>
                <div class="flex items-center gap-2 mb-1.5">
                  <span class="text-xs font-mono px-2 py-0.5 rounded transition-colors" :class="isDark ? 'text-gray-500 bg-white/5' : 'text-[#727775] bg-[#f1f3f4]'">{{ formatDate(log.created_at) }}</span>
                  <span class="text-xs transition-colors" :class="isDark ? 'text-gray-600' : 'text-[#9aa0a6]'">{{ t('log.actor_prefix') }} {{ log.actor_name }}</span>
                </div>
                <div class="p-4 rounded-xl border shadow-sm transition-all" :class="isDark ? 'bg-[#1A1C1E] border-white/5 hover:border-white/10' : 'bg-[#f8f9fa] border-[rgba(0,0,0,0.08)] hover:border-blue-200'">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-sm font-bold transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">{{ getActionLabel(log.action) }}</span>
                  </div>
                  <p v-if="log.message" class="text-sm leading-relaxed whitespace-pre-line mt-1 transition-colors break-words overflow-hidden" :class="isDark ? 'text-gray-300' : 'text-[#444746]'">{{ log.message }}</p>
                </div>
              </div>
            </div>
          </div>

        </div>
        <div class="lg:col-span-1 space-y-6">
          <div class="p-5 rounded-2xl border transition-all duration-300 shadow-lg"
               :class="isDark ? 'bg-[#282A2C] border-white/10 shadow-md' : 'bg-[#ffffff] border-[rgba(0,0,0,0.08)] shadow-[0_1px_2px_0_rgba(60,64,67,0.30)]'">
            <h4 class="text-xs font-bold uppercase tracking-wider mb-4 border-b pb-2 transition-colors" :class="isDark ? 'text-gray-500 border-white/5' : 'text-[#727775] border-[rgba(0,0,0,0.08)]'">{{ t('ticket.tech_section_title') }}</h4>
            <div v-if="ticket.technician_name" class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-md text-sm uppercase">
                {{ ticket.technician_name.substring(0,2).toUpperCase() }}
              </div>
              <div>
                <p class="font-bold text-sm transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">{{ ticket.technician_name }}</p>
                <p class="text-xs text-blue-500 font-medium">{{ t('tech.role_label') }}</p> 
              </div>
            </div>
            <div v-else class="flex items-center gap-3 italic text-sm py-2 transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#9aa0a6]'">
              <div class="w-10 h-10 rounded-full flex items-center justify-center transition-colors" :class="isDark ? 'bg-white/5' : 'bg-[#f1f3f4] text-[#727775]'">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <span>{{ t('ticket.tech_no_assign') }}</span>
            </div>
          </div>
          <div class="p-5 rounded-2xl border transition-all duration-300 shadow-lg space-y-4"
               :class="isDark ? 'bg-[#282A2C] border-white/10 shadow-md' : 'bg-[#ffffff] border-[rgba(0,0,0,0.08)] shadow-[0_1px_2px_0_rgba(60,64,67,0.30)]'">
            <h4 class="text-xs font-bold uppercase tracking-wider border-b pb-2 transition-colors" :class="isDark ? 'text-gray-500 border-white/5' : 'text-[#727775] border-[rgba(0,0,0,0.08)]'">{{ t('ticket.info_section_title') }}</h4>
            <div>
              <p class="text-xs mb-1 transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ t('ticket.info_urgency') }}</p>
              <span :class="getPriorityClasses(ticket.priority)" class="px-2 py-1 rounded text-xs font-bold border inline-block shadow-sm">
                {{ ticket.priority }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="flex flex-col items-center justify-center py-32 border rounded-3xl shadow-2xl transition-all duration-300 mx-4" 
         :class="isDark ? 'bg-[#282A2C] border-white/5' : 'bg-white border-[rgba(0,0,0,0.08)]'">
      <div class="p-5 bg-red-500/10 rounded-full mb-6 ring-1 ring-red-500/30">
        <svg class="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
      </div>
      <h2 class="text-2xl font-bold mb-2 uppercase tracking-widest text-center transition-colors" :class="isDark ? 'text-white' : 'text-red-700'">Access Denied</h2>
      <p class="mb-8 text-center max-w-md px-6 transition-colors" :class="isDark ? 'text-gray-400' : 'text-[#444746]'">
        {{ t('ticket_detail.access_denied_msg') }}
      </p>
      <button @click="$router.push('/app/my-tickets')" class="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-blue-600/20">
        {{ t('ticket_detail.back_to_list') }}
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue'; 
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { useTheme } from '@/composables/useTheme';
import { useModalStore } from '@/stores/modalStore';
import { useI18n } from 'vue-i18n';

const { isDark } = useTheme();
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
const ratingScore = ref(0);
const hoverScore = ref(0);
const ratingComment = ref('');
const submittingFeedback = ref(false);

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

const submitFeedback = async () => {
    if (ratingScore.value === 0) {
        modal.alert(t('feedback.alert_score_required'), t('feedback.title_warning'), 'warning');
        return;
    }

    submittingFeedback.value = true;
    try {
        const res = await $api.post(`/tickets/${ticketId}/feedback`, {
            rating: ratingScore.value,
            comment: ratingComment.value,
            actor_id: userStore.userProfile?.user_id
        }, getAuthOptions());

        if (res.data.success) {
            await modal.alert(t('feedback.alert_success'), t('feedback.title_success'), 'success');
            await fetchTicket(); // รีโหลดข้อมูลตั๋วเพื่ออัปเดตสถานะเป็น CLOSED
            await fetchLogs();
        }
    } catch (err) {
        console.error("Feedback error:", err);
        modal.alert(t('feedback.alert_error'), t('feedback.title_error'), 'error');
    } finally {
        submittingFeedback.value = false;
    }
};

const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleString('th-TH', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '';

const getFileUrl = (filePath) => {
    if (!filePath) return '';
    const baseUrl = import.meta.env.VITE_API_URL || '/api';
    const rootUrl = baseUrl.replace('/api', '');
    return `${rootUrl}/uploads${filePath}`;
};

const statusLabel = (status) => {
    const labels = {
        'APPROVED': t('ticket_detail.status_approved'),
        'REJECTED': t('ticket_detail.status_rejected'),
        'PENDING': t('ticket_detail.status_pending'),
        'BLOCKED': t('ticket_detail.status_blocked'),
        'CLOSED': t('ticket_detail.status_closed')
    };
    return labels[status] || status;
};
const getActionLabel = (action) => t(`log_action.${action}`, action); 
const getActionColor = (action) => ({ 'RESOLVED': 'bg-green-500', 'APPROVED': 'bg-emerald-400', 'REJECTED': 'bg-red-500', 'REQ_APPROVAL': 'bg-yellow-500', 'PURCHASING': 'bg-orange-500', 'ACKNOWLEDGED': 'bg-blue-600', 'CLOSED': 'bg-gray-800' }[action] || 'bg-gray-600');
const getStatusClasses = (status) => {
    const map = {
        'WAITING APPROVE': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        'NEW': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        'IN PROGRESS': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
        'PENDING': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
        'RESOLVED': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        'REJECTED': 'bg-red-500/10 text-red-500 border-red-500/20',
        'CLOSED': 'bg-gray-600/10 text-gray-500 border-gray-500/20'
    };
    return map[status] || (isDark.value ? 'bg-gray-700 text-gray-300' : 'bg-[#f1f3f4] text-[#727775] border-[rgba(0,0,0,0.08)]');
};
const getTypeClasses = (type) => type === 'SUPPORT' 
    ? (isDark.value ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-cyan-50 text-cyan-700 border-cyan-200')
    : (isDark.value ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-orange-50 text-orange-700 border-orange-200');

const getPriorityClasses = (priority) => {
    const map = {
        'LOW': 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10',
        'MEDIUM': 'text-yellow-600 border-yellow-500/20 bg-yellow-500/10',
        'HIGH': 'text-orange-600 border-orange-500/20 bg-orange-500/10',
        'VERY_HIGH': 'text-red-600 border-red-500/20 bg-red-500/10'
    };
    return map[priority] || (isDark.value ? 'text-gray-400 border-gray-600' : 'text-[#727775] border-[rgba(0,0,0,0.08)] bg-[#f8f9fa]');
};

onMounted(async () => {
    if (!userStore.isLoggedIn) { loading.value = false; return; }
    
    // ดึงค่า score จาก URL (กรณีคลิกมาจากอีเมล)
    if (route.query.score) {
        ratingScore.value = parseInt(route.query.score);
    }

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
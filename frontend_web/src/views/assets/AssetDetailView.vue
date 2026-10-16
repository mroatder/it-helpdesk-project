<template>
  <div class="p-6 font-sans max-w-7xl mx-auto pb-8 transition-colors no-print" :class="isDark ? 'text-gray-300' : 'text-[#444746]'">
    
    <div class="flex items-center justify-between mb-8">
      <div class="flex items-center gap-4">
        <button @click="goBack" class="p-2 rounded-full transition-colors" :class="isDark ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-gray-200 text-[#727775] hover:text-[#1f1f1f]'">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <h2 class="text-2xl font-bold tracking-wide flex items-center gap-2 transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">
            {{ $t('asset_detail.title') }}
          </h2>
          <p class="text-sm mt-1 transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ $t('asset_detail.subtitle') }}</p>
        </div>
      </div>

      <div v-if="asset" class="flex items-center gap-2">
         <button 
           v-if="!isEditing"
           @click="printReport"
           class="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors border"
           :class="isDark ? 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600' : 'bg-white hover:bg-gray-50 text-[#1f1f1f] border-[rgba(0,0,0,0.12)] shadow-sm'"
         >
           <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
           </svg>
           {{ $t('asset_detail.btn_print') }}
         </button>

         <button 
           v-if="!isEditing"
           @click="startEdit"
           class="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors border"
           :class="isDark ? 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600' : 'bg-white hover:bg-gray-50 text-[#1f1f1f] border-[rgba(0,0,0,0.12)] shadow-sm'"
         >
           <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
           {{ $t('asset_detail.edit') }}
         </button>
         
         <div v-else class="flex gap-2">
           <button 
             @click="cancelEdit"
             class="px-4 py-2 bg-transparent rounded-lg transition-colors"
             :class="isDark ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-gray-200 text-[#727775] hover:text-[#1f1f1f]'"
           >
             {{ $t('asset_detail.cancel') }}
           </button>
           <button 
             @click="saveAssetInfo"
             class="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors shadow-lg shadow-green-900/20"
             :disabled="isSaving"
           >
             <svg v-if="isSaving" class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
             <span v-else>{{ $t('asset_detail.save') }}</span>
           </button>
         </div>
      </div>
    </div>

    <div v-if="loading" class="text-center py-20">
       <svg class="animate-spin h-10 w-10 mx-auto text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
       <p class="mt-4 text-gray-500">{{ $t('asset_detail.loading') }}</p>
    </div>

    <div v-else-if="!asset && !loading" class="text-center py-20 text-gray-500">
        {{ $t('asset_detail.not_found') }}
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <div class="lg:col-span-2 space-y-6">
        
        <div class="rounded-2xl p-6 border shadow-lg relative overflow-hidden border-l-4 transition-all duration-300"
             :class="isDark ? 'bg-[#282A2C] border-white/5 border-l-purple-500 shadow-black/20' : 'bg-white border-[rgba(0,0,0,0.08)] border-l-purple-600 shadow-[0_1px_3px_0_rgba(60,64,67,0.30)]'">
          <div class="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          </div>
          <h3 class="text-lg font-bold mb-6 flex items-center gap-2 border-b pb-4 relative z-10 transition-colors"
              :class="isDark ? 'text-white border-white/5' : 'text-[#1f1f1f] border-[rgba(0,0,0,0.08)]'">
            <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            {{ $t('asset_detail.section_general') }}
          </h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10 transition-colors">
            <div>
              <p class="text-xs mb-1 transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ $t('asset_detail.label_hostname') }}</p>
              <p class="font-mono text-lg font-bold transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">{{ asset.hostname }}</p>
            </div>
            <div>
              <p class="text-xs mb-1 transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ $t('asset_detail.label_serial') }}</p>
              <p class="font-mono text-base transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">{{ asset.serial_number }}</p>
            </div>
            <div>
              <p class="text-xs mb-1 transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ $t('asset_detail.label_manufacturer') }}</p>
              <p class="transition-colors" :class="isDark ? 'text-gray-300' : 'text-[#444746]'">{{ asset.manufacturer }}</p>
            </div>
            <div>
              <p class="text-xs mb-1 transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ $t('asset_detail.label_model') }}</p>
              <p class="transition-colors" :class="isDark ? 'text-gray-300' : 'text-[#444746]'">{{ asset.model }}</p>
            </div>
            
            <div class="md:col-span-2 pt-4 border-t transition-colors" :class="isDark ? 'border-white/5' : 'border-[rgba(0,0,0,0.08)]'">
              <p class="text-xs mb-2 font-bold uppercase tracking-wider transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ $t('asset_detail.section_software') }}</p>
              <div class="space-y-3">
                <div class="flex items-center gap-3">
                 <div class="p-2 rounded-lg transition-colors" :class="isDark ? 'bg-blue-500/10' : 'bg-blue-50'">
                   <svg class="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="currentColor"><path d="M0 0h11.377v11.372H0zM12.623 0H24v11.372H12.623zM0 12.623h11.377V24H0zM12.623 12.623H24V24H12.623z"/></svg>
                      </div>
                      <div>
                          <p class="text-xs transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ $t('asset_detail.label_os') }}</p>
                          <p class="text-sm font-medium transition-colors" :class="isDark ? 'text-gray-200' : 'text-[#1f1f1f]'">{{ asset.os_version }}</p>
                      
                          <div v-if="asset.windows_key" class="mt-1">
                              <p class="text-[10px] uppercase tracking-widest transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">Windows Key</p>
                              <p class="text-purple-400 font-mono text-xs">{{ asset.windows_key }}</p>
                          </div>
                      </div>
                    </div>

                 <div class="flex items-center gap-3">
                    <div class="p-2 rounded-lg transition-colors" :class="isDark ? 'bg-orange-500/10' : 'bg-orange-50'">
                       <svg class="w-5 h-5 text-orange-500" viewBox="0 0 24 24" fill="currentColor"><path d="M21.5 2h-19C1.1 2 0 3.1 0 4.5v15C0 20.9 1.1 22 2.5 22h19c1.4 0 2.5-1.1 2.5-2.5v-15C24 3.1 22.9 2 21.5 2zM12 18H7v-2h5v2zm0-4H7v-2h5v2zm0-4H7V8h5v2zm7 8h-5v-2h5v2zm0-4h-5v-2h5v2zm0-4h-5V8h5v2z"/></svg>
                    </div>
                    <div>
                        <p class="text-xs transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ $t('asset_detail.label_office') }}</p>
                        <p class="text-sm font-medium transition-colors" :class="isDark ? 'text-gray-200' : 'text-[#1f1f1f]'">
                            {{ asset.office_version || $t('asset_detail.no_office') }}
                        </p>
                    </div>
                 </div>
              </div>
            </div>

          </div>
        </div>

        <div class="rounded-2xl p-6 border shadow-lg border-l-4 transition-all duration-300"
             :class="isDark ? 'bg-[#282A2C] border-white/5 border-l-blue-500 shadow-black/20' : 'bg-white border-[rgba(0,0,0,0.08)] border-l-blue-600 shadow-[0_1px_3px_0_rgba(60,64,67,0.30)]'">
          <h3 class="text-lg font-bold mb-6 flex items-center gap-2 border-b pb-4 transition-colors"
              :class="isDark ? 'text-white border-white/5' : 'text-[#1f1f1f] border-[rgba(0,0,0,0.08)]'">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-blue-400">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25z" />
            </svg>
            {{ $t('asset_detail.section_spec') }}
          </h3>

          <div class="space-y-6">
            <div>
               <p class="text-xs mb-1 font-bold uppercase transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ $t('asset_detail.label_cpu') }}</p>
               <p class="p-3 rounded-lg border font-mono text-sm transition-colors"
                  :class="isDark ? 'text-white bg-[#1A1C1E] border-white/10' : 'text-[#1f1f1f] bg-gray-50 border-[rgba(0,0,0,0.08)]'">{{ asset.cpu_model }}</p>
            </div>

            <div>
               <p class="text-xs mb-1 font-bold uppercase transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ $t('asset_detail.label_gpu') }}</p>
               <div class="p-3 rounded-lg border text-sm transition-colors"
                    :class="isDark ? 'text-gray-300 bg-[#1A1C1E] border-white/10' : 'text-[#444746] bg-gray-50 border-[rgba(0,0,0,0.08)]'">
                 {{ asset.gpu_summary || '-' }}
               </div>
            </div>

            <div>
               <div class="flex justify-between items-center mb-2">
                 <p class="text-xs font-bold uppercase transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ $t('asset_detail.label_ram') }}: <span class="text-green-400">{{ displayTotalRam }} GB Total</span></p>
               </div>
               
               <div class="overflow-x-auto rounded-lg border transition-colors" :class="isDark ? 'border-white/5' : 'border-[rgba(0,0,0,0.08)]'">
                 <table class="w-full text-left text-sm">
                   <thead class="text-xs uppercase transition-colors" :class="isDark ? 'bg-[#1A1C1E] text-gray-500' : 'bg-gray-100 text-[#727775]'">
                     <tr>
                       <th class="px-3 py-2 rounded-l-lg">{{ $t('asset_detail.col_slot') }}</th>
                       <th class="px-3 py-2">{{ $t('asset_detail.col_size') }}</th>
                       <th class="px-3 py-2">{{ $t('asset_detail.col_type') }}</th>
                       <th class="px-3 py-2">{{ $t('asset_detail.col_speed') }}</th>
                       <th class="px-3 py-2 rounded-r-lg">{{ $t('asset_detail.col_brand') }}</th>
                     </tr>
                   </thead>
                   <tbody class="divide-y transition-colors" :class="isDark ? 'divide-white/5' : 'divide-[rgba(0,0,0,0.06)]'">
                     <tr v-for="(ram, idx) in rams" :key="idx" class="transition-colors" :class="isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'">
                       <td class="px-3 py-2 transition-colors" :class="isDark ? 'text-gray-400' : 'text-[#727775]'">{{ ram.bank_label }}</td>
                       <td class="px-3 py-2 text-green-400 font-bold">{{ ram.capacity_gb }} GB</td>
                       <td class="px-3 py-2 transition-colors" :class="isDark ? 'text-gray-300' : 'text-[#444746]'">{{ ram.memory_type }}</td>
                       <td class="px-3 py-2 transition-colors" :class="isDark ? 'text-gray-300' : 'text-[#444746]'">{{ ram.speed_mhz }} MHz</td>
                       <td class="px-3 py-2 text-xs transition-colors" :class="isDark ? 'text-gray-400' : 'text-[#727775]'">{{ ram.manufacturer }} - {{ ram.part_number }}</td>
                     </tr>
                   </tbody>
                 </table>
               </div>
            </div>

          </div>
        </div>

        <div class="rounded-2xl p-6 border shadow-lg border-l-4 transition-all duration-300"
             :class="isDark ? 'bg-[#282A2C] border-white/5 border-l-red-500 shadow-black/20' : 'bg-white border-[rgba(0,0,0,0.08)] border-l-red-600 shadow-[0_1px_3px_0_rgba(60,64,67,0.30)]'">
          <h3 class="text-lg font-bold mb-6 flex items-center gap-2 border-b pb-4 transition-colors"
              :class="isDark ? 'text-white border-white/5' : 'text-[#1f1f1f] border-[rgba(0,0,0,0.08)]'">
            <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            {{ $t('asset_detail.section_ups') }}
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div class="md:col-span-2 p-4 rounded-lg border transition-colors"
                  :class="isDark ? 'bg-[#1A1C1E] border-white/5' : 'bg-gray-50 border-[rgba(0,0,0,0.08)]'">
                <p class="text-xs mb-2 font-bold uppercase transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ $t('asset_detail.label_pc_age') }}</p>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <p class="text-[10px] mb-1 transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ $t('asset_detail.label_start_date') }}</p>
                        <div v-if="!isEditing" class="text-sm font-medium transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">
                            {{ formatDate(asset.start_use_date) || '-' }}
                        </div>
                        <input v-else v-model="editForm.start_use_date" type="date"
                               class="w-full border rounded px-2 py-1.5 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                               :class="isDark ? 'bg-[#282A2C] border-gray-600 text-white' : 'bg-white border-gray-300 text-[#1f1f1f]'" />
                    </div>
                    <div>
                        <p class="text-[10px] mb-1 transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ $t('asset_detail.label_duration') }}</p>
                        <p class="text-green-400 font-bold text-sm">{{ calculateDuration(asset.start_use_date) }}</p>
                    </div>
                </div>
             </div>

             <div>
                <p class="text-xs mb-1 transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ $t('asset_detail.label_ups_model') }}</p>
                <div v-if="!isEditing" class="font-medium text-sm transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">{{ asset.ups_model || '-' }}</div>
                <input v-else v-model="editForm.ups_model" type="text"
                       class="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                       :class="isDark ? 'bg-[#1A1C1E] border-gray-600 text-white' : 'bg-white border-gray-300 text-[#1f1f1f]'"
                       :placeholder="$t('asset_detail.placeholder_ups_model')" />
             </div>

             <div>
                <p class="text-xs mb-1 transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ $t('asset_detail.label_batt_spec') }}</p>
                <div v-if="!isEditing" class="font-medium text-sm transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">{{ asset.ups_battery_spec || '-' }}</div>
                <input v-else v-model="editForm.ups_battery_spec" type="text"
                       class="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                       :class="isDark ? 'bg-[#1A1C1E] border-gray-600 text-white' : 'bg-white border-gray-300 text-[#1f1f1f]'"
                       :placeholder="$t('asset_detail.placeholder_batt_spec')" />
             </div>

             <div class="md:col-span-2 pt-4 border-t transition-colors" :class="isDark ? 'border-white/5' : 'border-[rgba(0,0,0,0.08)]'">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <p class="text-xs mb-1 transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ $t('asset_detail.label_ups_start') }}</p>
                        <div v-if="!isEditing" class="text-sm font-medium transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">{{ formatDate(asset.ups_start_date) || '-' }}</div>
                        <input v-else v-model="editForm.ups_start_date" type="date"
                               class="w-full border rounded px-2 py-1.5 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                               :class="isDark ? 'bg-[#1A1C1E] border-gray-600 text-white' : 'bg-white border-gray-300 text-[#1f1f1f]'" />
                    </div>
                    <div>
                        <p class="text-xs mb-1 transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ $t('asset_detail.label_ups_age') }}</p>
                        <p class="text-red-400 font-bold text-sm">{{ calculateDuration(asset.ups_start_date) }}</p>
                    </div>
                </div>
             </div>
             <div class="md:col-span-2">
                <p class="text-xs mb-1 transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ $t('asset_detail.label_batt_history') }}</p>
                    
                <div v-if="!isEditing" class="space-y-2">
                    <div v-for="log in (asset.ups_logs || [])" :key="log.log_id" 
                        class="p-3 rounded-lg border font-mono text-xs transition-colors"
                        :class="isDark ? 'bg-[#1A1C1E] border-white/5' : 'bg-gray-50 border-[rgba(0,0,0,0.08)]'">
                        <div class="flex justify-between text-[10px] mb-1 transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">
                            <span>{{ formatDate(log.action_date) }}</span>
                            <span>By: {{ log.performed_by }}</span>
                        </div>
                        <div class="leading-relaxed transition-colors" :class="isDark ? 'text-gray-300' : 'text-[#444746]'">{{ log.details }}</div>
                    </div>
                  
                    <div v-if="!asset.ups_logs || asset.ups_logs.length === 0" 
                        class="text-sm italic p-4 rounded-lg border transition-colors"
                        :class="isDark ? 'text-gray-500 bg-[#1A1C1E] border-white/5' : 'text-[#727775] bg-gray-50 border-[rgba(0,0,0,0.08)]'">
                        {{ $t('asset_detail.no_history') }}
                    </div>
                </div>
              
                <textarea 
                    v-else 
                    v-model="editForm.ups_history" 
                    class="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500 min-h-[120px] transition-colors"
                    :class="isDark ? 'bg-[#1A1C1E] border-gray-600 text-white' : 'bg-white border-gray-300 text-[#1f1f1f]'"
                    :placeholder="$t('asset_detail.placeholder_history')"
                ></textarea>
                <p v-if="isEditing" class="text-[10px] mt-1 transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ $t('asset_detail.history_hint') }}</p>
            </div>
          </div>
        </div>

      </div>

      <div class="lg:col-span-1 space-y-6">

        <div class="rounded-2xl p-6 border shadow-lg border-l-4 transition-all duration-300"
             :class="isDark ? 'bg-[#282A2C] border-white/5 border-l-purple-500 shadow-black/20' : 'bg-white border-[rgba(0,0,0,0.08)] border-l-purple-600 shadow-[0_1px_3px_0_rgba(60,64,67,0.30)]'">
          <h3 class="text-lg font-bold mb-6 flex items-center gap-2 border-b pb-4 transition-colors"
              :class="isDark ? 'text-white border-white/5' : 'text-[#1f1f1f] border-[rgba(0,0,0,0.08)]'">
              <svg class="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              {{ $t('asset_detail.section_assignment') }}
          </h3>

          <div class="space-y-4">
             
             <div>
                <p class="text-xs mb-1 transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ $t('asset_detail.label_fixed_asset') }}</p>
                <div v-if="!isEditing" class="font-medium text-sm transition-colors flex flex-wrap gap-2 items-center" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">
                    <span v-if="asset.is_leased" 
                          :class="isDark ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-700 border-blue-200'"
                          class="px-2 py-1 rounded border font-semibold">
                        เครื่องเช่า (Leased)
                    </span>
                    <span v-if="asset.fixed_asset" 
                          :class="isDark ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-yellow-50 text-yellow-700 border-yellow-200'"
                          class="px-2 py-1 rounded border">
                        {{ asset.fixed_asset }}
                    </span>
                    <span v-if="!asset.fixed_asset && !asset.is_leased" class="text-gray-500">-</span>
                </div>
                <div v-else class="space-y-2">
                    <label class="inline-flex items-center gap-2 cursor-pointer mt-1">
                        <input 
                            type="checkbox" 
                            v-model="editForm.is_leased"
                            class="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                        />
                        <span class="text-sm font-semibold" :class="isDark ? 'text-gray-300' : 'text-gray-700'">เครื่องเช่า (Leased)</span>
                    </label>
                    <input 
                       v-model="editForm.fixed_asset"
                       type="text" 
                       :disabled="editForm.is_leased"
                       class="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-yellow-500 font-mono transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                       :class="isDark ? 'bg-[#1A1C1E] border-gray-600 text-white disabled:bg-gray-800' : 'bg-white border-gray-300 text-[#1f1f1f]'"
                       :placeholder="$t('asset_detail.placeholder_fixed_asset')"
                    />
                </div>
             </div>
             <div>
                <p class="text-xs mb-1 transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ $t('asset_detail.label_start_date') }}</p>
                <div v-if="!isEditing" class="font-medium text-sm flex items-center gap-2 transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">
                    <svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {{ formatDate(asset.start_use_date) || '-' }}
                    <span v-if="asset.start_use_date" 
                          :class="isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-50 text-green-700'"
                          class="text-[10px] px-1.5 py-0.5 rounded">
                        {{ calculateDuration(asset.start_use_date) }}
                    </span>
                </div>
                <input 
                    v-else
                    v-model="editForm.start_use_date"
                    type="date" 
                    class="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-green-500 transition-colors"
                    :class="isDark ? 'bg-[#1A1C1E] border-gray-600 text-white' : 'bg-white border-gray-300 text-[#1f1f1f]'"
                />
              </div>

             <div>
                <p class="text-xs mb-1 transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ $t('asset_detail.label_owner') }}</p>
                <div v-if="!isEditing" class="font-medium text-sm transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">
                    {{ asset.owner_name || $t('asset_detail.unassigned') }}
                </div>
                <input 
                   v-else
                   v-model="editForm.owner_name"
                   type="text" 
                   class="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                   :class="isDark ? 'bg-[#1A1C1E] border-gray-600 text-white' : 'bg-white border-gray-300 text-[#1f1f1f]'"
                   :placeholder="$t('asset_detail.placeholder_owner')"
                />
             </div>

             <div>
                <p class="text-xs mb-1 transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ $t('asset_detail.label_dept') }}</p>
                <div v-if="!isEditing" class="font-medium text-sm transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">
                    {{ asset.department || '-' }}
                </div>
                <input 
                   v-else
                   v-model="editForm.department"
                   type="text" 
                   class="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                   :class="isDark ? 'bg-[#1A1C1E] border-gray-600 text-white' : 'bg-white border-gray-300 text-[#1f1f1f]'"
                   :placeholder="$t('asset_detail.placeholder_dept')"
                />
             </div>

             <div>
                <p class="text-xs mb-1 transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ $t('asset_detail.label_location') }}</p>
                <div v-if="!isEditing" class="font-medium text-sm transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">
                    <span class="flex items-center gap-1">
                        <svg class="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        {{ asset.location || '-' }}
                    </span>
                </div>
                <input 
                   v-else
                   v-model="editForm.location"
                   type="text" 
                   class="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                   :class="isDark ? 'bg-[#1A1C1E] border-gray-600 text-white' : 'bg-white border-gray-300 text-[#1f1f1f]'"
                   :placeholder="$t('asset_detail.placeholder_location')"
                />
             </div>

             <!-- Possession Image -->
             <div class="pt-4 border-t transition-colors" :class="isDark ? 'border-white/5' : 'border-[rgba(0,0,0,0.08)]'">
                <p class="text-xs mb-2 font-bold uppercase transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ $t('asset_detail.label_possession_image') }}</p>
                
                <div class="relative group">
                    <div v-if="asset.map_image" class="mb-3 rounded-lg overflow-hidden border transition-colors"
                         :class="isDark ? 'border-white/10 bg-[#1A1C1E]' : 'border-[rgba(0,0,0,0.08)] bg-gray-50'">
                        <img :src="getFullImageUrl(asset.map_image)" class="w-full h-auto max-h-64 object-contain" alt="Possession" />
                    </div>
                    <div v-else class="mb-3 p-8 border-2 border-dashed rounded-lg text-center transition-colors"
                         :class="isDark ? 'border-white/10 bg-[#1A1C1E]' : 'border-gray-200 bg-gray-50'">
                        <svg class="w-12 h-12 text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        <p class="text-xs text-gray-500">No Image Attached</p>
                    </div>

                    <div v-if="isEditing" class="flex justify-center">
                        <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="handleImageUpload" />
                        <button 
                            @click="triggerFileInput" 
                            class="flex items-center gap-2 px-4 py-2 border rounded-lg text-xs transition-all w-full justify-center"
                            :class="isDark 
                                ? 'bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border-purple-600/30' 
                                : 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200'"
                            :disabled="isUploadingImage"
                        >
                            <svg v-if="isUploadingImage" class="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                            {{ isUploadingImage ? $t('asset_detail.btn_uploading') : (asset.map_image ? $t('asset_detail.btn_change_image') : $t('asset_detail.btn_add_image')) }}
                        </button>
                    </div>
                </div>
             </div>
          </div>
        </div>
        
        <div class="rounded-2xl p-6 border shadow-lg border-l-4 transition-all duration-300"
             :class="isDark ? 'bg-[#282A2C] border-white/5 border-l-green-500 shadow-black/20' : 'bg-white border-[rgba(0,0,0,0.08)] border-l-green-600 shadow-[0_1px_3px_0_rgba(60,64,67,0.30)]'">
          <h3 class="text-lg font-bold mb-6 flex items-center gap-2 border-b pb-4 transition-colors"
              :class="isDark ? 'text-white border-white/5' : 'text-[#1f1f1f] border-[rgba(0,0,0,0.08)]'">
            <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            {{ $t('asset_detail.section_network') }}
          </h3>
          
          <div class="space-y-4">
            <div class="p-3 rounded-lg border transition-colors"
                 :class="isDark ? 'bg-[#1A1C1E] border-white/10' : 'bg-gray-50 border-[rgba(0,0,0,0.08)]'">
              <p class="text-[10px] mb-1 uppercase font-bold tracking-widest transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">Active Scan IP</p>
              <div class="flex items-center gap-2">
                 <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                 <p class="font-mono text-lg font-bold transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">{{ asset.ip_address || 'Unknown' }}</p>
              </div>
            </div>
            
            <div :class="[
              'p-3 rounded-lg border transition-all', 
              asset.ip_address === asset.ip_lan && asset.ip_lan 
                ? (isDark ? 'bg-blue-500/10 border-blue-500/50' : 'bg-blue-50 border-blue-200 shadow-sm shadow-blue-500/10') 
                : (isDark ? 'bg-white/5 border-white/5' : 'bg-white border-[rgba(0,0,0,0.08)]')
            ]">
               <div class="flex items-center justify-between mb-1">
                  <span class="text-[10px] font-bold uppercase text-blue-400">Ethernet (LAN)</span>
                  <span v-if="asset.ip_address === asset.ip_lan && asset.ip_lan" class="text-[8px] bg-blue-500 text-white px-1 rounded">ACTIVE</span>
               </div>
               <p class="font-mono text-sm font-bold transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">{{ asset.ip_lan || '-' }}</p>
               <p class="text-[10px] font-mono mt-1 transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">MAC: {{ asset.mac_ethernet || '-' }}</p>
            </div>

            <div :class="[
              'p-3 rounded-lg border transition-all', 
              asset.ip_address === asset.ip_wifi && asset.ip_wifi 
                ? (isDark ? 'bg-purple-500/10 border-purple-500/50' : 'bg-purple-50 border-purple-200 shadow-sm shadow-purple-500/10') 
                : (isDark ? 'bg-white/5 border-white/5' : 'bg-white border-[rgba(0,0,0,0.08)]')
            ]">
               <div class="flex items-center justify-between mb-1">
                  <span class="text-[10px] font-bold uppercase text-purple-400">Wireless (WiFi)</span>
                  <span v-if="asset.ip_address === asset.ip_wifi && asset.ip_wifi" class="text-[8px] bg-purple-500 text-white px-1 rounded">ACTIVE</span>
               </div>
               <p class="font-mono text-sm font-bold transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">{{ asset.ip_wifi || '-' }}</p>
               <p class="text-[10px] font-mono mt-1 transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">MAC: {{ asset.mac_wifi || '-' }}</p>
            </div>
          </div>
        </div>

        <div class="rounded-2xl p-6 border shadow-lg border-l-4 transition-all duration-300"
             :class="isDark ? 'bg-[#282A2C] border-white/5 border-l-orange-500 shadow-black/20' : 'bg-white border-[rgba(0,0,0,0.08)] border-l-orange-600 shadow-[0_1px_3px_0_rgba(60,64,67,0.30)]'">
          <h3 class="text-lg font-bold mb-6 flex items-center gap-2 border-b pb-4 transition-colors"
              :class="isDark ? 'text-white border-white/5' : 'text-[#1f1f1f] border-[rgba(0,0,0,0.08)]'">
            <svg class="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>
            {{ $t('asset_detail.section_storage') }}
          </h3>
          
          <div class="space-y-4">
            <div v-for="(disk, idx) in disks" :key="idx" 
                 class="p-3 rounded-lg border transition-colors"
                 :class="isDark ? 'bg-[#1A1C1E] border-white/10' : 'bg-gray-50 border-[rgba(0,0,0,0.08)]'">
               <div class="flex justify-between items-start mb-1">
                 <span :class="`text-xs font-bold px-1.5 rounded uppercase border transition-colors ${getDiskBadgeColor(disk)}`">
                   {{ formatDiskType(disk) }}
                 </span>
                 <span class="text-sm font-bold text-orange-400">{{ disk.size_gb }} GB</span>
               </div>
               <p class="text-sm truncate transition-colors" :class="isDark ? 'text-gray-300' : 'text-[#444746]'" :title="disk.model">{{ disk.model }}</p>
            </div>
            <div v-if="disks.length === 0" class="text-center text-sm transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ $t('asset_detail.no_disk') }}</div>
          </div>
        </div>

        <div class="rounded-2xl p-6 border shadow-lg border-l-4 transition-all duration-300"
             :class="isDark ? 'bg-[#282A2C] border-white/5 border-l-blue-500 shadow-black/20' : 'bg-white border-[rgba(0,0,0,0.08)] border-l-blue-600 shadow-[0_1px_3px_0_rgba(60,64,67,0.30)]'">
           <p class="text-xs mb-1 transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ $t('asset_detail.label_mainboard') }}</p>
           <p class="text-sm transition-colors" :class="isDark ? 'text-gray-300' : 'text-[#444746]'">{{ asset.mainboard_brand }} - {{ asset.mainboard_model }}</p>
           <p class="text-xs mt-4 mb-1 transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ $t('asset_detail.label_last_update') }}</p>
           <p class="text-xs transition-colors" :class="isDark ? 'text-gray-400' : 'text-[#727775]'">{{ formatDate(asset.last_updated) }}</p>
        </div>

      </div>

    </div>
  </div>

  <!-- Printable Report (Teleport to body to bypass app layout constraints) -->
  <Teleport to="body">
    <div v-if="asset" id="printable-report" class="print-only">
      <!-- Meta Bar: replaces browser native print header -->
      <div class="flex items-center justify-between px-5 py-1.5 bg-gray-100 border-b border-gray-300 text-[9px] text-gray-600 font-mono">
        <span>{{ formatDateWithTime(new Date()) }}</span>
        <span class="font-semibold tracking-widest uppercase text-gray-500">Device information</span>
        <img src="/pic/navIcon/logo.png" alt="Logo" style="height:20px; width:auto; display:block;" />
      </div>
      <div class="px-4 pt-3 pb-2 bg-white text-black font-sans relative">
        
        <!-- Header: Title, Hostname & Logo on one row -->
        <div class="flex justify-between items-start border-b-[3px] border-purple-800 pb-2 mb-3">
          <div class="flex items-center gap-4">
            <svg class="w-9 h-9 text-purple-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            <div>
               <h1 class="text-xl font-black uppercase tracking-tighter text-purple-800 leading-none mb-2">{{ $t('asset_detail.report_title') }}</h1>
               <div class="flex items-center gap-2">
                  <p class="text-xs text-black font-black uppercase tracking-normal">{{ $t('asset_detail.label_hostname') }}: <span class="text-purple-700 text-sm">{{ asset.hostname }}</span></p>
               </div>
            </div>
          </div>
          
          <!-- Date & Time Info -->
          <div class="text-right">
             <p class="text-[10px] text-black uppercase font-black tracking-widest mb-0.5">{{ $t('asset_detail.report_date') }}</p>
             <p class="text-base font-black leading-tight">{{ formatDateWithTime(new Date()) }}</p>
          </div>
        </div>

        <!-- Symmetric Top Row -->
        <div class="grid grid-cols-2 gap-3 mb-3">
          
          <!-- Column 1: Identity & Assignment -->
          <div class="space-y-2">
             <!-- Identification Section (Purple) -->
             <div class="border border-gray-300 rounded-lg p-3 shadow-sm bg-purple-50/10">
                <div class="flex items-center gap-2 mb-2 border-b border-purple-200 pb-1.5">
                   <svg class="w-5 h-5 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                   <h2 class="text-[11px] font-black uppercase text-purple-800 tracking-wider">{{ $t('asset_detail.section_general') }}</h2>
                </div>
                <div class="space-y-1 text-[11px]">
                   <div class="flex justify-between border-b border-white pb-1"><span class="text-black font-black uppercase text-[8px]">{{ $t('asset_detail.label_serial') }}:</span> <span class="font-mono font-black text-black">{{ asset.serial_number }}</span></div>
                   <div class="flex justify-between border-b border-white pb-1"><span class="text-black font-black uppercase text-[8px]">{{ $t('asset_detail.label_manufacturer') }}:</span> <span class="font-black text-black">{{ asset.manufacturer }}</span></div>
                   <div class="flex justify-between border-b border-white pb-1"><span class="text-black font-black uppercase text-[8px]">{{ $t('asset_detail.label_model') }}:</span> <span class="font-black text-black">{{ asset.model }}</span></div>
                   <div class="flex justify-between pt-1"><span class="text-black font-black uppercase text-[8px]">{{ $t('asset_detail.label_os') }}:</span> <span class="font-black text-purple-700">{{ asset.os_version }}</span></div>
                </div>
             </div>

             <!-- Assignment Section (Blue) -->
             <div class="border border-gray-300 rounded-lg p-3 shadow-sm bg-blue-50/10">
                <div class="flex items-center gap-2 mb-2 border-b border-blue-200 pb-1.5">
                   <svg class="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                   <h2 class="text-[11px] font-black uppercase text-blue-800 tracking-wider">{{ $t('asset_detail.section_assignment') }}</h2>
                </div>
                <div class="space-y-1 text-[11px]">
                   <div class="flex justify-between border-b border-white pb-1"><span class="text-black font-black uppercase text-[8px]">{{ $t('asset_detail.label_fixed_asset') }}:</span> <span class="font-mono font-black text-blue-800">{{ asset.fixed_asset || '-' }}</span></div>
                   <div class="flex flex-col mb-1"><span class="text-black text-[8px] font-black uppercase">{{ $t('asset_detail.label_owner') }}</span> <span class="font-black text-[15px] text-black leading-none">{{ asset.owner_name || '-' }}</span></div>
                   <div class="flex justify-between border-t border-white pt-1.5"><span class="text-black font-black uppercase text-[8px]">{{ $t('asset_detail.label_dept') }}:</span> <span class="font-black text-black">{{ asset.department || '-' }}</span></div>
                   <div class="flex justify-between border-b border-white pb-0.5"><span class="text-black font-black uppercase text-[8px]">{{ $t('asset_detail.label_location') }}:</span> <span class="font-black text-black">{{ asset.location || '-' }}</span></div>
                   <div class="flex justify-between pt-1"><span class="text-black font-black uppercase text-[8px]">{{ $t('asset_detail.label_duration') }}:</span> <span class="font-black text-green-700">{{ calculateDuration(asset.start_use_date) }}</span></div>
                </div>
             </div>
          </div>

          <!-- Symmetric Image Section -->
          <div class="border border-gray-300 rounded-lg overflow-hidden flex flex-col shadow-sm bg-gray-50/10">
             <div class="flex items-center gap-2 px-3 py-2 border-b border-gray-200">
                <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                <h2 class="text-[11px] font-black uppercase text-gray-800 tracking-wider">{{ $t('asset_detail.label_possession_image') }}</h2>
             </div>
             <div class="flex items-center justify-center p-1" style="height:300px;">
                 <img v-if="asset.map_image" :src="getFullImageUrl(asset.map_image)" class="h-full w-auto object-contain" />
                 <div v-else class="w-full h-full flex flex-col items-center justify-center text-gray-400 opacity-70">
                     <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 7L8.207 8.793a1 1 0 000 1.414L10 12m4-5l1.793 1.793a1 1 0 010 1.414L14 12m-3 5h2M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                     <span class="text-[9px] uppercase font-black tracking-widest mt-2 text-black">NO IMAGE ATTACHED</span>
                 </div>
              </div>
          </div>
        </div>

        <!-- Section 3: Machine Specs (Green) -->
        <div class="border border-gray-300 rounded-lg p-2 shadow-sm bg-green-50/10 mb-2">
          <div class="flex items-center gap-2 mb-2 border-b border-green-200 pb-1.5">
             <svg class="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
             <h2 class="text-[11px] font-black uppercase text-green-700 tracking-wider">{{ $t('asset_detail.section_spec') }}</h2>
          </div>
          <div class="grid grid-cols-12 gap-6">
             <!-- Left Spec: Mainboard, CPU, GPU -->
             <div class="col-span-5 space-y-4 pr-6 border-r border-green-100 flex flex-col justify-between">
                <div>
                   <p class="text-[8px] uppercase font-black text-black mb-0.5 tracking-widest">{{ $t('asset_detail.label_mainboard') }}</p>
                   <p class="text-[11px] font-black text-black leading-tight">{{ asset.mainboard_brand }} {{ asset.mainboard_model }}</p>
                </div>
                <div>
                   <p class="text-[8px] uppercase font-black text-black mb-0.5 tracking-widest">{{ $t('asset_detail.label_cpu') }}</p>
                   <p class="text-[11px] font-black text-black leading-tight">{{ asset.cpu_model }}</p>
                </div>
                <div>
                   <p class="text-[8px] uppercase font-black text-black mb-0.5 tracking-widest">{{ $t('asset_detail.label_gpu') }}</p>
                   <p class="text-[10px] font-bold text-black leading-tight">{{ asset.gpu_summary || '-' }}</p>
                </div>
             </div>
             <!-- Right Spec: RAM Slots + Total RAM -->
             <div class="col-span-7 flex flex-col h-full">
                <div class="flex justify-between items-end mb-2">
                   <p class="text-[8px] uppercase font-black text-black tracking-widest leading-none">Memory Details</p>
                   <div class="bg-white px-3 py-1 rounded-md flex items-center gap-2 shadow-sm border-2 border-green-600">
                      <span class="text-[8px] font-black uppercase text-green-700">Total:</span>
                      <span class="text-lg font-black leading-none text-green-600">{{ displayTotalRam }} GB</span>
                   </div>
                </div>
                <table class="w-full text-[10px] text-left border-collapse">
                   <thead class="bg-gray-100 text-black font-black uppercase text-[8px]">
                      <tr>
                         <th class="px-2 py-1.5 border-b border-gray-200 font-black">Slot</th>
                         <th class="px-2 py-1.5 border-b border-gray-200 text-center font-black">Size</th>
                         <th class="px-2 py-1.5 border-b border-gray-200 font-black">Type / Speed</th>
                         <th class="px-2 py-1.5 border-b border-gray-200 font-black">Brand</th>
                      </tr>
                   </thead>
                   <tbody class="divide-y divide-gray-100">
                      <tr v-for="ram in rams" :key="ram.id">
                         <td class="px-2 py-1 font-black text-black">{{ ram.bank_label }}</td>
                         <td class="px-2 py-1 text-center font-black text-green-700">{{ ram.capacity_gb }} GB</td>
                         <td class="px-2 py-1 text-black text-[9px] font-black">{{ ram.memory_type }} {{ ram.speed_mhz }}MHz</td>
                         <td class="px-2 py-1 text-black text-[9px] font-black">{{ ram.manufacturer }}</td>
                      </tr>
                   </tbody>
                </table>
             </div>
          </div>
        </div>

        <!-- Section 4: Storage (Orange) -->
        <div class="border border-gray-300 rounded-lg p-2 shadow-sm bg-orange-50/10 mb-2">
          <div class="flex items-center gap-2 mb-2 border-b border-orange-200 pb-1.5">
             <svg class="w-5 h-5 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
             <h2 class="text-[11px] font-black uppercase text-orange-700 tracking-wider">{{ $t('asset_detail.section_storage') }}</h2>
          </div>
          <div class="grid grid-cols-3 gap-3">
             <div v-for="(disk, idx) in disks" :key="idx" class="flex items-center gap-3 p-2 bg-white border border-gray-200 rounded-lg shadow-sm">
                <div class="w-8 h-8 flex items-center justify-center rounded font-black text-[9px] text-white" style="background-color: #f97316; -webkit-print-color-adjust: exact; print-color-adjust: exact;">
                   {{ formatDiskType(disk).split(' ')[0] }}
                </div>
                <div class="min-w-0">
                   <p class="font-black text-[10px] text-black truncate leading-none mb-1">{{ disk.model }}</p>
                   <p class="text-[8px] font-black uppercase tracking-tight text-black">{{ formatDiskType(disk).split(' ')[0] }} {{ disk.size_gb }} GB — {{ formatDiskType(disk).split(' ').slice(1).join(' ') }}</p>
                </div>
             </div>
          </div>
        </div>

        <!-- Professional Signatures -->
        <div class="grid grid-cols-2 gap-20 px-16 mt-3 mb-2">
          <div class="text-center">
            <div class="w-full border-b-2 border-black h-8 mb-2"></div>
            <p class="text-[10px] font-black uppercase text-black">IT SUPPORT STAFF</p>
            <p class="text-[8px] text-black font-black uppercase tracking-widest mt-0.5">ISSUED BY</p>
          </div>
          <div class="text-center">
            <div class="w-full border-b-2 border-black h-8 mb-2"></div>
            <p class="text-[10px] font-black uppercase text-black">ASSET OWNER / USER</p>
            <p class="text-[8px] text-black font-black uppercase tracking-widest mt-0.5">RECEIVED BY</p>
          </div>
        </div>

        <!-- Special Footer -->
        <div class="mt-6 flex justify-between items-center" style="-webkit-print-color-adjust: exact; print-color-adjust: exact;">
          <span class="text-[7px] font-black uppercase tracking-[0.3em] text-purple-800">IT-Service Management System</span>
          <span class="text-[7px] font-black uppercase tracking-[0.3em] text-gray-500">REPORT ID: {{ asset.hostname }}-{{ asset.id }}</span>
          <span class="text-[7px] font-black uppercase tracking-[0.3em] text-purple-800">Official Document</span>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, computed, reactive, getCurrentInstance, watch } from 'vue'; 
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '@/stores/userStore'; 
import { useModalStore } from '@/stores/modalStore';
import { useTheme } from '@/composables/useTheme';

const { isDark } = useTheme();
const { proxy } = getCurrentInstance(); 
const $api = proxy.$api; 
const userStore = useUserStore(); 
const modal = useModalStore();

const { t, locale } = useI18n(); 
const route = useRoute();
const router = useRouter();
const assetId = route.params.id;

const loading = ref(true);
const isSaving = ref(false);
const isEditing = ref(false);
const isUploadingImage = ref(false);
const fileInput = ref(null);

const asset = ref(null);
const rams = ref([]);
const disks = ref(null); 

const editForm = reactive({
    owner_name: '',
    department: '',
    location: '',
    fixed_asset: '',
    start_use_date: '',
    is_leased: false,
    ups_model: '',
    ups_battery_spec: '',
    ups_start_date: '',
    ups_history: ''
});

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

const displayTotalRam = computed(() => {
    if (asset.value && asset.value.total_ram_gb) {
        return asset.value.total_ram_gb;
    }
    return rams.value.reduce((sum, ram) => sum + (Number(ram.capacity_gb) || 0), 0);
});

const printReport = () => {
    const originalTitle = document.title;
    const hostname = asset.value ? asset.value.hostname : 'Asset';
    document.title = `${hostname} information`;
    
    window.print();
    
    // Restore title after a short delay to ensure print dialog picks up the new one
    setTimeout(() => {
        document.title = originalTitle;
    }, 500);
};

const startEdit = () => {
    if (!asset.value) return;

    editForm.owner_name = asset.value.owner_name;
    editForm.department = asset.value.department;
    editForm.location = asset.value.location;
    editForm.fixed_asset = asset.value.fixed_asset; 
    editForm.is_leased = !!asset.value.is_leased;
    
    editForm.start_use_date = asset.value.start_use_date ? asset.value.start_use_date.split('T')[0] : '';
    editForm.ups_model = asset.value.ups_model;
    editForm.ups_battery_spec = asset.value.ups_battery_spec;
    editForm.ups_start_date = asset.value.ups_start_date ? asset.value.ups_start_date.split('T')[0] : '';
    editForm.ups_history = asset.value.ups_history;

    isEditing.value = true;
};

const cancelEdit = () => {
    isEditing.value = false;
};

watch(() => editForm.is_leased, (newVal) => {
    if (newVal) {
        editForm.fixed_asset = '';
    }
});

const saveAssetInfo = async () => {
    isSaving.value = true;
    if (!$api) return;
    const options = getAuthOptions();
    if (!options) { isSaving.value = false; return; }
    
    try {
        const res = await $api.put(`/inventory/${assetId}/assign`, editForm, options);
        
        if (res.data.success) {
            // อัปเดตข้อมูลหน้าจอ
            Object.assign(asset.value, editForm);
            
            // ✅ ล้างค่าประวัติซ่อมหลังจากบันทึกแล้ว เพื่อรอรับประวัติใหม่ครั้งหน้า
            editForm.ups_history = ''; 
            
            isEditing.value = false;
            
            // แจ้งเตือนว่าบันทึกสำเร็จ
            if (modal) {
                modal.alert(t('asset_detail.save_success'), "Success", "success");
            }
        }
    } catch (err) {
        alert(t('asset_detail.error_save') + (err.message || ''));
    } finally {
        isSaving.value = false;
    }
};

const calculateDuration = (startDateStr) => {
    if (!startDateStr) return '-';
    const start = new Date(startDateStr);
    const now = new Date();
    
    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();
    
    if (months < 0) {
        years--;
        months += 12;
    }
    
    if (years < 0) return t('asset_detail.age_not_started'); 
    
    let result = [];
    if (years > 0) result.push(`${years} ${t('asset_detail.age_year')}`);
    if (months > 0) result.push(`${months} ${t('asset_detail.age_month')}`);
    
    return result.length > 0 ? result.join(' ') : t('asset_detail.age_just_started');
};

const formatDiskType = (disk) => {
    const model = (disk.model || '').toUpperCase();
    
    // 1. เช็คว่าเป็น NVMe (เช็คจาก Keyword รุ่นยอดนิยม หรือมีคำว่า NVME)
    if (
        model.includes('NVME') || 
        model.includes('SN580') || 
        model.includes('SN740') || 
        model.includes('SN5000') || 
        model.includes('MZVL') || 
        model.includes('MTE')
    ) {
        return 'SSD M.2 (NVMe)';
    } 
    
    // 2. เช็คว่าเป็น SSD SATA (รวมรุ่น SA400 ของคุณด้วย)
    else if (
        model.includes('SSD') || 
        model.includes('SA400') || 
        model.includes('SA510') || 
        model.includes('SKC600')
    ) {
        return 'SSD (SATA)';
    } 
    
    // 3. เช็คว่าเป็น HDD (เช็คจากรุ่นยอดนิยม ST1000, WD10, TOSHIBA)
    else if (
        model.includes('ST1000') || 
        model.includes('DT01') || 
        model.includes('WD10') || 
        model.includes('TOSHIBA') || 
        model.includes('ST2000') ||
        model.includes('ST500')
    ) {
        return 'HDD (SATA)';
    }
    
    // 4. กรณีอื่นๆ ให้ลองเช็คจาก Interface Type เดิม
    const type = (disk.interface_type || '').toUpperCase();
    if (type === 'SCSI') return 'SSD M.2 / NVMe'; 
    if (type === 'IDE' || type === 'SATA') return 'HDD (SATA)';
    if (type === 'USB') return 'External USB';
    
    return type || 'Unknown'; 
};

const getDiskBadgeColor = (disk) => {
    const typeStr = formatDiskType(disk);
    if (typeStr.includes('SSD')) {
        return isDark.value 
            ? 'text-green-400 bg-green-400/10 border-green-400/20' 
            : 'text-green-700 bg-green-50 border-green-200';
    }
    if (typeStr.includes('HDD')) {
        return isDark.value 
            ? 'text-blue-400 bg-blue-400/10 border-blue-400/20' 
            : 'text-blue-700 bg-blue-50 border-blue-200';
    }
    return isDark.value 
        ? 'text-gray-400 bg-gray-700 border-gray-600' 
        : 'text-[#727775] bg-gray-100 border-gray-200';
};

const fetchAssetDetail = async () => {
    try {
        loading.value = true;
        const options = getAuthOptions();
        if (!options) return;

        const res = await $api.get(`/inventory/${assetId}`, options);
        
        if (res.data.success) {
            asset.value = res.data.data;
            rams.value = res.data.data.rams || [];
            disks.value = res.data.data.disks || [];
        }
    } catch (err) {
        // 🚨 บรรทัดที่ต้องแก้ไข
        console.error("Error fetching asset details:", err);
        
        if (err.response && err.response.status === 403) {
            // ✅ ใช้ window.confirm หรือตรวจสอบ modal ให้ชัวร์
            if (modal) {
                // ไม่ต้องใส่ await ก็ได้ถ้าต้องการให้มัน push ทันที
                modal.alert(
                    t('ticket_detail.access_denied_msg'), 
                    t('ticket_detail.access_denied_title'), 
                    "error"
                );
            }
            // ดีดกลับหน้าหลักทันที
            router.push('/app/dashboard');
        }
    } finally {
        loading.value = false;
    }
};

const formatDate = (dateStr) => {
    if(!dateStr) return '-';
    const date = new Date(dateStr);
    const currentLocale = locale.value === 'en' ? 'en-US' : 'th-TH';
    return date.toLocaleString(currentLocale, { 
        year: 'numeric', month: 'long', day: 'numeric',
    });
};

const formatDateWithTime = (date) => {
    const currentLocale = locale.value === 'en' ? 'en-US' : 'th-TH';
    return date.toLocaleString(currentLocale, { 
        year: '2-digit', month: 'numeric', day: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
    });
};

const goBack = () => {
    router.back();
};

const triggerFileInput = () => {
    if (fileInput.value) fileInput.value.click();
};

const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check size (5MB)
    if (file.size > 5 * 1024 * 1024) {
        modal.alert("File size limit is 5MB", "Error", "error");
        return;
    }

    isUploadingImage.value = true;
    const formData = new FormData();
    formData.append('image', file);

    const options = getAuthOptions();
    if (!options) { isUploadingImage.value = false; return; }

    try {
        const res = await $api.post(`/inventory/${assetId}/upload-image`, formData, {
            ...options,
            headers: {
                ...options.headers,
                'Content-Type': 'multipart/form-data'
            }
        });

        if (res.data.success) {
            asset.value.map_image = res.data.filePath;
            modal.alert(t('asset_detail.save_success'), "Success", "success");
        }
    } catch (err) {
        console.error("Upload Error:", err);
        modal.alert(t('asset_detail.error_save') + (err.response?.data?.message || err.message), "Error", "error");
    } finally {
        isUploadingImage.value = false;
        // Reset file input
        if (event.target) event.target.value = '';
    }
};

const getFullImageUrl = (path) => {
    if (!path) return '';
    // If it's already a full URL
    if (path.startsWith('http')) return path;
    
    // ดึงฐาน URL เช่น http://itsupport.local/api
    const baseUrl = import.meta.env.VITE_API_URL || '/api';
    const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    
    // แปลง /uploads ให้เป็น /uploads เพื่อต่อท้าย /api
    const cleanPath = path.startsWith('/uploads') ? path.replace('/uploads', '') : path;
    
    return `${cleanBase}/uploads${cleanPath}`;
};

onMounted(() => {
    if (userStore.isLoggedIn) {
        fetchAssetDetail();
    } else {
        console.warn("User not logged in. Cannot fetch asset detail.");
        loading.value = false;
    }
});
</script>

<style>
@media print {
  /* ซ่อน App ทั้งหมดเพื่อไม่ให้รบกวน Layout การพิมพ์ */
  #app {
    display: none !important;
  }

  /* แสดงผลเฉพาะตัวรายงานที่ถูก Teleport ออกมาอยู่นอก App */
  #printable-report {
    display: block !important;
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 100% !important;
    background: white !important;
    margin: 0 !important;
    padding: 0 !important;
    min-height: auto !important;
  }

  html, body {
    margin: 0 !important;
    padding: 0 !important;
    background: white !important;
    height: auto !important;
    overflow: visible !important;
  }

  @page {
    size: A4;
    margin: 0.5cm 1cm 1cm 1cm; /* top reduced: custom meta-bar replaces native header */
  }
}

/* ซ่อนรายงานในหน้าจอปกติ */
.print-only {
  display: none;
}
</style>
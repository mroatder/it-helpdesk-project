<template>
  <div class="p-4 font-sans max-w-4xl mx-auto transition-colors" :class="isDark ? 'text-gray-300' : 'text-[#444746]'">
    
    <h2 class="text-3xl font-bold tracking-tight mb-2 transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">
      {{ $t('create_ticket.title') }}
    </h2>
    <p class="mb-8 text-sm transition-colors" :class="isDark ? 'text-gray-400' : 'text-[#727775]'">{{ $t('create_ticket.subtitle') }}</p>

    <form v-on:submit="submitTicket" 
          class="p-10 rounded-3xl shadow-xl border space-y-8 transition-all duration-300"
          :class="isDark ? 'bg-[#282A2C] border-white/5 shadow-black/20' : 'bg-white border-[rgba(0,0,0,0.08)] shadow-[0_1px_3px_0_rgba(60,64,67,0.30)]'">
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 border-b pb-6 transition-colors" :class="isDark ? 'border-white/10' : 'border-[rgba(0,0,0,0.08)]'">
        <template v-if="currentUser.isAdmin">
          <div class="col-span-full">
            <label class="block text-sm font-medium mb-2 transition-colors" :class="isDark ? 'text-blue-400' : 'text-blue-600'">{{ $t('create_ticket.search_requester') }} <span class="text-red-500">*</span></label>
            <div class="relative">
              <input 
                v-model="searchTerm" 
                @input="debouncedSearchUsers" 
                :disabled="!!selectedRequester"
                type="text" 
                :placeholder="$t('create_ticket.placeholder_search')" 
                class="w-full p-3 rounded-xl border focus:ring-2 focus:ring-blue-500 transition-all disabled:cursor-not-allowed"
                :class="isDark ? 'bg-[#1A1C1E] text-white border-blue-500/30 disabled:border-gray-700' : 'bg-[#f8f9fa] text-[#1f1f1f] border-[rgba(0,0,0,0.1)] disabled:bg-gray-100'"
                :required="currentUser.isAdmin && !selectedRequester"
              />
              <div v-if="searchTerm.length >= 2 && searchResults.length > 0 && !selectedRequester" 
                   class="absolute z-10 w-full mt-2 rounded-xl shadow-2xl max-h-60 overflow-y-auto border backdrop-blur-md transition-colors"
                   :class="isDark ? 'bg-[#3A3D40] border-blue-500/30' : 'bg-white border-[rgba(0,0,0,0.1)]'">
                <ul class="py-1">
                  <li 
                    v-for="user in searchResults" 
                    :key="user.id" 
                    @click="selectRequester(user)"
                    class="px-4 py-2 text-sm transition-colors cursor-pointer"
                    :class="isDark ? 'text-gray-200 hover:bg-blue-600 hover:text-white' : 'text-[#444746] hover:bg-blue-50'"
                  >
                    {{ user.full_name }} ({{ user.email }})
                  </li>
                </ul>
              </div>
              <p v-if="searchTerm.length >= 2 && searchResults.length === 0 && !selectedRequester" class="text-xs text-gray-500 mt-1 pl-1">{{ $t('create_ticket.user_not_found') }}</p>
            </div>
          </div>
          
          <div v-if="selectedRequester" class="col-span-full p-4 rounded-xl border transition-colors"
               :class="isDark ? 'bg-[#1A1C1E] border-blue-500/50' : 'bg-blue-50 border-blue-200'">
            <p class="text-sm font-semibold mb-2 flex justify-between items-center transition-colors" :class="isDark ? 'text-blue-300' : 'text-blue-700'">
                <span>{{ $t('create_ticket.requester_label') }}: {{ selectedRequester.full_name }}</span>
                <button @click="clearRequester" type="button" class="text-red-400 hover:text-red-500 text-xs font-normal">
                    [X] {{ $t('create_ticket.change_requester') }}
                </button>
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-1 text-xs transition-colors" :class="isDark ? 'text-gray-400' : 'text-[#727775]'">
                <p>{{ $t('create_ticket.email_label') }}: <span :class="isDark ? 'text-white' : 'text-[#1f1f1f]'" class="font-medium">{{ selectedRequester.email || '-' }}</span></p>
                <p>{{ $t('create_ticket.name_label') }}: <span :class="isDark ? 'text-white' : 'text-[#1f1f1f]'" class="font-medium">{{ selectedRequester.username || '-' }}</span></p>
                <p>{{ $t('create_ticket.department_label') }}: <span :class="isDark ? 'text-white' : 'text-[#1f1f1f]'" class="font-medium">{{ selectedRequester.department || '-' }}</span></p>
            </div>
          </div>
          <div v-else class="col-span-full text-center py-4">
            <p class="text-red-400">{{ $t('create_ticket.no_requester_selected') }}</p>
          </div>
        </template>
        
        <template v-else>
          <div class="col-span-1">
            <label class="block text-sm font-medium mb-1 transition-colors" :class="isDark ? 'text-gray-300' : 'text-[#444746]'">{{ $t('create_ticket.name_label') }}</label>
            <input :value="currentUser.fullName" readonly type="text" 
                   class="w-full p-3 rounded-xl border border-transparent cursor-not-allowed transition-colors" 
                   :class="isDark ? 'bg-[#1A1C1E] text-gray-400' : 'bg-[#f1f3f4] text-[#727775]'" />
          </div>
          <div class="col-span-1">
            <label class="block text-sm font-medium mb-1 transition-colors" :class="isDark ? 'text-gray-300' : 'text-[#444746]'">{{ $t('create_ticket.email_label') }}</label>
            <input :value="currentUser.email || '-'" readonly type="email" 
                   class="w-full p-3 rounded-xl border border-transparent cursor-not-allowed transition-colors" 
                   :class="isDark ? 'bg-[#1A1C1E] text-gray-400' : 'bg-[#f1f3f4] text-[#727775]'" />
          </div>
          <div class="col-span-1">
            <label class="block text-sm font-medium mb-1 transition-colors" :class="isDark ? 'text-gray-300' : 'text-[#444746]'">{{ $t('create_ticket.name_label') }}</label>
            <input :value="currentUser.username" readonly type="text" 
                   class="w-full p-3 rounded-xl border border-transparent cursor-not-allowed transition-colors" 
                   :class="isDark ? 'bg-[#1A1C1E] text-gray-400' : 'bg-[#f1f3f4] text-[#727775]'"/>
          </div>
          <div class="col-span-1">
            <label class="block text-sm font-medium mb-1 transition-colors" :class="isDark ? 'text-gray-300' : 'text-[#444746]'">{{ $t('create_ticket.department_label') }}</label>
            <input :value="currentUser.department || '-'" readonly type="text" 
                   class="w-full p-3 rounded-xl border border-transparent cursor-not-allowed transition-colors" 
                   :class="isDark ? 'bg-[#1A1C1E] text-gray-400' : 'bg-[#f1f3f4] text-[#727775]'"/>
          </div>
        </template>
        
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
        
        <div class="col-span-1">
          <label class="block text-sm font-medium mb-1 transition-colors" :class="isDark ? 'text-gray-300' : 'text-[#444746]'">{{ $t('create_ticket.category_label') }}<span class="text-red-500">*</span></label>
          <select 
            v-model="selectedParentId" 
            v-on:change="onParentChange"
            required 
            class="w-full p-3 rounded-xl border focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
            :class="isDark ? 'bg-[#1A1C1E] text-white border-transparent' : 'bg-[#f8f9fa] text-[#1f1f1f] border-[rgba(0,0,0,0.1)]'"
          >
            <option :value="null">{{ $t('create_ticket.select_category') }}</option>
            <option v-for="cat in parentCategories" :key="cat.cat_id" :value="cat.cat_id">
              {{ cat.name }}
            </option>
          </select>
        </div>

        <div class="col-span-1">
          <label class="block text-sm font-medium mb-1 transition-colors" :class="isDark ? 'text-gray-300' : 'text-[#444746]'">{{ $t('create_ticket.sub_category_label') }}<span class="text-red-500">*</span></label>
          <select 
            v-model="form.subCategoryId" 
            required 
            :disabled="!selectedParentId || subCategories.length === 0"
            class="w-full p-3 rounded-xl border focus:ring-2 focus:ring-blue-500 transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
            :class="isDark ? 'bg-[#1A1C1E] text-white border-transparent' : 'bg-[#f8f9fa] text-[#1f1f1f] border-[rgba(0,0,0,0.1)]'"
          >
            <option value="">{{ $t('create_ticket.select_sub_category') }}</option>
            <option v-for="sub in subCategories" :key="sub.sub_id" :value="sub.sub_id">
              {{ sub.name }}
            </option>
          </select>
        </div>

        <div class="col-span-full">
          <label class="block text-sm font-medium mb-1 transition-colors" :class="isDark ? 'text-gray-300' : 'text-[#444746]'">{{ $t('create_ticket.urgency_label') }} <span class="text-red-500">*</span></label>
          <select 
            v-model="form.userUrgency" 
            required 
            class="w-full p-3 rounded-xl border focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
            :class="isDark ? 'bg-[#1A1C1E] text-white border-transparent' : 'bg-[#f8f9fa] text-[#1f1f1f] border-[rgba(0,0,0,0.1)]'"
          >
            <option value="NORMAL">{{ $t('create_ticket.urgency_normal') }}</option>
            <option value="URGENT">{{ $t('create_ticket.urgency_urgent') }}</option>
          </select>
        </div>

        <div class="col-span-full">
          <label class="block text-sm font-medium mb-1 transition-colors" :class="isDark ? 'text-gray-300' : 'text-[#444746]'">{{ $t('create_ticket.description_label') }} <span class="text-red-500">*</span></label>
          <textarea v-model="form.description" required rows="5" :placeholder="$t('create_ticket.placeholder_desc')" 
                    class="w-full p-3 rounded-xl border focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-500 resize-none"
                    :class="isDark ? 'bg-[#1A1C1E] text-white border-transparent' : 'bg-[#f8f9fa] text-[#1f1f1f] border-[rgba(0,0,0,0.1)]'"></textarea>
        </div>

        <!-- 📂 File Attachments -->
        <div class="col-span-full">
          <label class="block text-sm font-medium mb-1 transition-colors" :class="isDark ? 'text-gray-300' : 'text-[#444746]'">
            {{ $t('create_ticket.attachments_label') }}
          </label>
          <div 
            class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl transition-all cursor-pointer group"
            :class="isDark ? 'border-white/10 hover:border-blue-500/50' : 'border-[rgba(0,0,0,0.15)] hover:border-blue-400 bg-gray-50 hover:bg-blue-50/30'"
            @click="$refs.fileInput.click()"
          >
            <div class="space-y-1 text-center font-medium">
              <svg class="mx-auto h-12 w-12 transition-colors" :class="isDark ? 'text-gray-400 group-hover:text-blue-400' : 'text-gray-300 group-hover:text-blue-500'" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <div class="flex text-sm transition-colors" :class="isDark ? 'text-gray-400' : 'text-[#727775]'">
                <span class="relative cursor-pointer rounded-md font-bold text-blue-500 hover:text-blue-400">
                  Click to upload
                </span>
                <p class="pl-1">or drag and drop</p>
              </div>
              <p class="text-xs transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#9aa0a6]'">{{ $t('create_ticket.attachments_desc') }}</p>
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
          <div v-if="attachments.length > 0" class="mt-4 space-y-2 animate-fade-in-down">
            <div v-for="(file, index) in attachments" :key="index" 
                 class="flex items-center justify-between p-2 rounded-lg border transition-colors shadow-sm"
                 :class="isDark ? 'bg-[#1A1C1E] border-white/5' : 'bg-white border-[rgba(0,0,0,0.08)]'">
              <div class="flex items-center gap-2 overflow-hidden">
                <svg v-if="file.type.includes('image')" class="w-4 h-4 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <svg v-else class="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                <span class="text-xs transition-colors truncate" :class="isDark ? 'text-gray-300' : 'text-[#1f1f1f]'">{{ file.name }}</span>
                <span class="text-[10px] transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#9aa0a6]'">({{ (file.size / 1024 / 1024).toFixed(2) }} MB)</span>
              </div>
              <button @click="removeFile(index)" type="button" class="text-red-400 hover:text-red-500 p-1.5 transition-colors">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
        </div>

        <div class="col-span-full p-5 rounded-2xl border space-y-6 transition-all duration-300"
             :class="isDark ? 'bg-[#1A1C1E] border-white/5' : 'bg-[#f8f9fa] border-blue-50'">
            
            <div class="flex items-start gap-3">
              <div class="flex items-center h-5">
                  <input 
                      id="purchaseReq" 
                      type="checkbox" 
                      v-model="isPurchaseRequest"
                      class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-600 transition-colors"
                      :class="isDark ? 'bg-gray-700 border-gray-600 ring-offset-gray-800' : 'bg-white border-gray-300'"
                  />
              </div>
              <div class="ml-2 text-sm">
                  <label for="purchaseReq" class="font-bold transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">{{ $t('create_ticket.purchase_req') }}</label>
                  <p class="text-xs mt-1 transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ $t('create_ticket.purchase_req_desc') }}</p>
              </div>
            </div>

            <div class="flex items-start gap-3 border-t pt-4 transition-colors" :class="isDark ? 'border-white/5' : 'border-[rgba(0,0,0,0.08)]'">
              <div class="flex items-center h-5">
                  <input 
                      id="accessReq" 
                      type="checkbox" 
                      v-model="isAccessRequest"
                      class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-600 transition-colors"
                      :class="isDark ? 'bg-gray-700 border-gray-600 ring-offset-gray-800' : 'bg-white border-gray-300'"
                  />
              </div>
              <div class="ml-2 text-sm">
                <label for="accessReq" class="font-bold transition-colors flex items-center gap-1" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">
                  {{ $t('create_ticket.access_req') }} <span v-if="isCctvCategory" class="text-red-500">*</span>
                </label>
                <p class="text-xs mt-1 transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ $t('create_ticket.access_req_desc') }}</p>
              </div>
            </div>

            <!-- 📝 New: Access Item Selection -->
            <div v-if="isAccessRequest" class="mt-4 pl-6 animate-fade-in-down border-l-2 space-y-3 transition-colors" :class="isDark ? 'border-blue-500/30' : 'border-blue-400'">
                <label class="block text-sm font-bold transition-colors mb-1" :class="isDark ? 'text-blue-400' : 'text-blue-700'">
                    {{ $t('create_ticket.access_item_label') }} <span class="text-red-500">*</span>
                </label>
                <div class="flex flex-wrap gap-4">
                    <label class="flex items-center gap-3 cursor-pointer text-sm">
                        <input type="checkbox" v-model="accessItems" value="Folder" class="rounded text-blue-600 focus:ring-blue-500" />
                        <span :class="isDark ? 'text-gray-300' : 'text-gray-700'">Folder</span>
                    </label>
                    <label class="flex items-center gap-3 cursor-pointer text-sm">
                        <input type="checkbox" v-model="accessItems" value="Program" class="rounded text-blue-600 focus:ring-blue-500" />
                        <span :class="isDark ? 'text-gray-300' : 'text-gray-700'">Program</span>
                    </label>
                    <label class="flex items-center gap-3 cursor-pointer text-sm">
                        <input type="checkbox" v-model="accessItems" value="CCTV" class="rounded text-blue-600 focus:ring-blue-500" />
                        <span :class="isDark ? 'text-gray-300' : 'text-gray-700'">CCTV <span v-if="isCctvCategory" class="text-red-500">*</span></span>
                    </label>
                    <label class="flex items-center gap-3 cursor-pointer text-sm">
                        <input type="checkbox" v-model="accessItems" value="Others" class="rounded text-blue-600 focus:ring-blue-500" />
                        <span :class="isDark ? 'text-gray-300' : 'text-gray-700'">อื่นๆ</span>
                    </label>
                </div>
                <div v-if="accessItems.includes('Others')" class="mt-2">
                    <input 
                        type="text" 
                        v-model="otherAccessText" 
                        :placeholder="$t('create_ticket.access_item_other_placeholder')" 
                        class="w-full max-w-md p-2 text-sm rounded-lg border focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
                        :class="isDark ? 'bg-[#1A1C1E] text-white border-blue-500/30' : 'bg-white border-blue-200'"
                    />
                </div>

                <!-- 💡 Note for Line App -->
                <div v-if="!isCctvCategory" class="flex items-start gap-2.5 p-3 rounded-xl border transition-all animate-pulse-slow"
                     :class="isDark ? 'bg-blue-500/5 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-700'">
                    <svg class="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p class="text-xs font-medium leading-relaxed">
                        {{ $t('create_ticket.line_approval_note') }}
                    </p>
                </div>

                <!-- 💡 Note for CCTV -->
                <div v-if="isCctvCategory" class="flex items-start gap-2.5 p-3 rounded-xl border transition-all animate-pulse-slow"
                     :class="isDark ? 'bg-red-500/5 border-red-500/20 text-red-400' : 'bg-red-50 border-red-200 text-red-700'">
                    <svg class="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p class="text-xs font-medium leading-relaxed">
                        หมายเหตุ: สำหรับการขอเกี่ยวกับ CCTV ซึ่งเกี่ยวข้องกับกฎหมาย PDPA จำเป็นต้องได้รับการอนุมัติผ่าน HR Manager
                    </p>
                </div>
            </div>

            <div v-if="isPurchaseRequest || isAccessRequest" class="mt-4 pl-6 animate-fade-in-down border-l-2 transition-colors" :class="isDark ? 'border-blue-500/30' : 'border-blue-400'">
    <label class="block text-sm font-bold mb-2 transition-colors" :class="isDark ? 'text-blue-400' : 'text-blue-700'">
        {{ isAccessRequest ? 'เลือกผู้อนุมัติสิทธิ์' : $t('create_ticket.approver_label') }} 
        <span class="text-red-500">*</span>
    </label>
    
              <div class="border rounded-xl max-h-[150px] overflow-y-auto custom-scrollbar p-3 transition-colors shadow-inner"
                   :class="isDark ? 'bg-[#282A2C] border-blue-500/30' : 'bg-white border-blue-200'">
                  <div v-if="displayManagers.length === 0" class="text-center text-gray-500 py-3 text-sm">
                      {{ $t('create_ticket.no_manager') }}
                  </div>
                  <div v-for="mgr in displayManagers" :key="mgr.id" 
                      class="flex items-center gap-3 p-2 rounded transition-colors cursor-pointer" 
                      :class="isDark ? 'hover:bg-[#3A3D40]' : 'hover:bg-blue-50'"
                      @click="toggleApproverSelection(mgr.id)">
                      
                      <input 
                          type="checkbox" 
                          :value="mgr.id" 
                          v-model="form.approverIds" 
                          :disabled="displayManagers.length === 0"
                          class="h-4 w-4 rounded transition-all"
                          :class="isDark ? 'border-gray-600 bg-[#333] text-blue-600 focus:ring-blue-500 ring-offset-gray-800' : 'border-gray-300 text-blue-600 focus:ring-blue-500'"
                          @click.stop
                      />
                      <span class="text-sm select-none transition-colors" :class="isDark ? 'text-gray-200' : 'text-[#444746]'">
                          {{ mgr.full_name }} 
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
import { useTheme } from '@/composables/useTheme';
import { useModalStore } from '@/stores/modalStore';
import { useI18n } from 'vue-i18n';
import { useTicketStore } from '@/stores/ticketStore';

// 1. เข้าถึง Global Properties ($api)
const { isDark } = useTheme();
const { proxy } = getCurrentInstance();
const $api = proxy.$api; 
const userStore = useUserStore(); // 2. ดึง UserStore

const { t } = useI18n(); 
const router = useRouter();
const modal = useModalStore();
const ticketStore = useTicketStore();
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
const accessItems = ref([]); // ✅ เก็บ Folder / Program / Others
const otherAccessText = ref(''); // ✅ เก็บข้อความอิสระ

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

const displayManagers = computed(() => {
    // 🚩 ถ้าติ๊กขอสิทธิ์เข้าถึง ให้แสดงหัวหน้าสายตรง + รายชื่อ Rank 3-4 ทั้งบริษัท (ไม่ให้ซ้ำกัน)
    if (isAccessRequest.value) {
        const combined = [...requesterManagers.value];
        for (const approver of accessApprovers.value) {
            if (!combined.some(m => m.id === approver.id)) {
                combined.push(approver);
            }
        }
        return combined;
    }
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
            if (requesterManagers.value.length > 0) {
                // ออโต้เลือกหัวหน้าทุกคน
                form.value.approverIds = requesterManagers.value.map(m => m.id);
            } else {
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

// Computed: ตรวจสอบว่าเป็นหมวดหมู่ CCTV หรือไม่
const isCctvCategory = computed(() => {
    const main = mainList.value.find(m => m.cat_id === selectedParentId.value);
    const sub = subList.value.find(s => s.sub_id === form.value.subCategoryId);
    const mainName = main?.name?.toLowerCase() || '';
    const subName = sub?.name?.toLowerCase() || '';
    return mainName.includes('cctv') || subName.includes('cctv');
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
    
    // 🎥 Validation สำหรับ CCTV
    if (isCctvCategory.value) {
        if (!isAccessRequest.value || !accessItems.value.includes('CCTV')) {
            modal.alert("สำหรับใบงานที่เกี่ยวกับ CCTV จำเป็นต้องติ๊กเลือก 'ขออนุมัติสิทธิ์การเข้าถึง' และเลือก 'CCTV' ครับ", t('create_ticket.error_title'), "warning");
            return;
        }
        // ตรวจสอบผู้อนุมัติสิทธิ์ซ้ำอีกครั้ง (แม้จะถูกจับด้วยเงื่อนไขบน แต่กันเหนียวไว้ครับ)
        if (form.value.approverIds.length === 0) {
            modal.alert("สำหรับใบงานที่เกี่ยวกับ CCTV จำเป็นต้องเลือกผู้อนุมัติสิทธิ์ด้วยครับ", t('create_ticket.error_title'), "warning");
            return;
        }
    }

    // ✅ ตรวจสอบว่าถ้าขอสิทธิ์ ต้องเลือกอย่างน้อย 1 อย่าง
    if (isAccessRequest.value && accessItems.value.length === 0) {
        modal.alert(t('create_ticket.alert_select_access_item'), t('create_ticket.error_title'), 'warning');
        return;
    }
    if (isAccessRequest.value && accessItems.value.includes('Others') && !otherAccessText.value.trim()) {
        modal.alert(t('create_ticket.alert_specify_other_access'), t('create_ticket.error_title'), 'warning');
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
        
        // ✅ ประกอบ Description ใหม่ถ้าเป็น Access Request
        let finalDescription = form.value.description;
        if (isAccessRequest.value) {
            let items = [...accessItems.value];
            if (items.includes('Others')) {
                items = items.filter(i => i !== 'Others');
                items.push(`อื่นๆ: ${otherAccessText.value}`);
            }
            let accessHeader = `[Access Request: ${items.join(', ')}]\n\n`;
            finalDescription = accessHeader + finalDescription;
        }

        formData.append('description', finalDescription);
        formData.append('categoryId', selectedParentId.value);
        formData.append('subCategoryId', form.value.subCategoryId);
        formData.append('user_urgency', form.value.userUrgency);
        formData.append('requesterId', finalRequesterId);
        formData.append('priority', '');
        
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
            await ticketStore.fetchCounts();
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
    if (isPurchaseRequest.value || isAccessRequest.value) {
        // ให้เลือกหัวหน้าสายตรงไว้เป็นค่าเริ่มต้น (ถ้ามี)
        form.value.approverIds = requesterManagers.value.map(m => m.id);
    } else {
        form.value.approverIds = [];
    }
    // ล้างค่าของ Access Items ด้วย
    if (!isAccessRequest.value) {
        accessItems.value = [];
        otherAccessText.value = '';
    }
});

watch(selectedRequester, (newRequester) => {
    if (newRequester) {
        fetchRequesterManagers(newRequester.id);
    } else {
        requesterManagers.value = [];
    }
});

// ✅ Watch for CCTV Category to auto-check required fields
watch(isCctvCategory, (isCctv) => {
    if (isCctv) {
        isAccessRequest.value = true;
        if (!accessItems.value.includes('CCTV')) {
            accessItems.value.push('CCTV');
        }
    } else {
        // เอา CCTV ออกเมื่อเปลี่ยนไปหมวดอื่น
        accessItems.value = accessItems.value.filter(item => item !== 'CCTV');
        // ถ้ายกเลิก CCTV แล้วไม่เหลือตัวเลือกอื่น ให้เอาติ๊กถูกตรง "ขออนุมัติสิทธิ์" ออกด้วย
        if (accessItems.value.length === 0) {
            isAccessRequest.value = false;
        }
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
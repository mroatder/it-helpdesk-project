<template>
  <div class="p-6 font-sans max-w-7xl mx-auto pb-8 h-[calc(100vh-80px)] flex flex-col transition-colors" :class="isDark ? 'text-gray-300' : 'text-[#444746]'">
    <!-- Header -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 shrink-0">
      <div>
        <h2 class="text-2xl font-bold tracking-wide flex items-center gap-3 transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">
          <div class="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          {{ $t('cctv_map.title') || 'แผนที่จุดติดตั้งกล้อง CCTV' }}
        </h2>
        <p class="text-sm mt-1 transition-colors" :class="isDark ? 'text-gray-400' : 'text-[#727775]'">
          {{ $t('cctv_map.subtitle') || 'ตรวจสอบตำแหน่งและสถานะการทำงานของกล้อง CCTV ตามแผนผังอาคาร' }}
        </p>
      </div>

      <!-- Controls & Floor Selector -->
      <div class="flex flex-wrap items-center gap-3">
        <label class="text-xs font-bold uppercase transition-colors whitespace-nowrap" :class="isDark ? 'text-gray-400' : 'text-[#727775]'">
          {{ $t('asset_map.select_building_floor') || 'เลือกอาคาร / ชั้น' }}
        </label>
        <div class="relative group w-full sm:w-72">
          <select 
            v-model="selectedFloor"
            @change="loadFloorMap"
            class="w-full text-sm rounded-xl border transition-all appearance-none cursor-pointer shadow-sm pl-4 pr-10 p-2.5 outline-none font-medium"
            :class="isDark 
              ? 'bg-[#1A1C1E] text-gray-200 border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
              : 'bg-white text-[#1f1f1f] border-[rgba(0,0,0,0.12)] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'"
          >
            <option value="">{{ $t('asset_map.placeholder_floor') || '--- เลือกชั้นอาคาร ---' }}</option>
            <optgroup label="Liquid Plant (CCTV Layout)">
              <option value="LIQUID-1">Liquid Plant - ชั้น 1 (1st Floor)</option>
              <option value="LIQUID-2">Liquid Plant - ชั้น 2 (2nd Floor)</option>
            </optgroup>
            <optgroup label="MEC Building (CCTV Layout)">
              <option value="MEC-1">MEC Building - ชั้น 1 (1st Floor)</option>
              <option value="MEC-2">MEC Building - ชั้น 2 (2nd Floor)</option>
            </optgroup>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <button 
          @click="refreshData" 
          class="p-2.5 rounded-xl transition-all flex items-center justify-center border shadow-sm"
          :class="isDark 
            ? 'bg-[#1A1C1E] border-white/10 text-gray-300 hover:bg-[#28292C] hover:text-white' 
            : 'bg-white border-[rgba(0,0,0,0.12)] text-[#444746] hover:bg-gray-50 hover:text-[#1f1f1f]'"
          :title="$t('asset_map.refresh_data') || 'รีเฟรชข้อมูล'"
        >
          <svg :class="{'animate-spin text-blue-500': loading}" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>

        <!-- Admin Manage Shortcut -->
        <router-link
          v-if="userStore.userProfile?.role === 'ADMIN'"
          to="/app/cctv-map/admin"
          class="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md transition-all active:scale-95"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
          {{ $t('cctv_map.admin_manage') || 'จัดการตำแหน่ง CCTV' }}
        </router-link>
      </div>
    </div>

    <!-- Main Layout -->
    <div class="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 relative">
      
      <!-- SVG Map Display Area -->
      <div class="flex-1 rounded-2xl border overflow-hidden relative shadow-lg transition-colors flex flex-col"
           :class="isDark ? 'bg-[#1A1C1E] border-white/10' : 'bg-white border-[rgba(0,0,0,0.12)]'">
        
        <!-- Empty State -->
        <div 
          v-if="!selectedFloor" 
          class="flex-1 flex flex-col items-center justify-center p-8 text-center"
        >
          <div class="w-20 h-20 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4">
            <svg class="w-10 h-10 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h3 class="text-base font-bold transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">
            {{ $t('cctv_map.please_select_title') || 'โปรดเลือกชั้นอาคารที่ต้องการดูแผนผัง' }}
          </h3>
          <p class="text-xs max-w-xs mt-1 transition-colors" :class="isDark ? 'text-gray-500' : 'text-gray-400'">
            {{ $t('cctv_map.please_select_desc') || 'เลือก Liquid Plant หรือ MEC Building เพื่อแสดงแผนผังจุดติดตั้งกล้อง CCTV' }}
          </p>
        </div>

        <!-- Inline Fast SVG Map Container -->
        <div v-show="selectedFloor" class="w-full h-full relative flex-1" ref="mapContainerRef">
          <!-- Loading Overlay -->
          <div v-if="loading" class="absolute inset-0 bg-black/40 z-20 flex items-center justify-center backdrop-blur-sm">
            <div class="flex flex-col items-center bg-[#1E1F20]/90 px-6 py-4 rounded-2xl shadow-2xl border border-white/10">
              <svg class="animate-spin h-8 w-8 text-blue-500 mb-2" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <span class="text-white text-xs font-semibold">กำลังโหลดแผนผัง...</span>
            </div>
          </div>

          <!-- Inline SVG Container for instant rendering -->
          <div ref="svgContainerRef" class="w-full h-full overflow-hidden"></div>

          <!-- Hover Card (Tooltip) -->
          <div 
            v-if="hoveredCctv"
            class="absolute z-30 rounded-2xl shadow-2xl p-4 w-72 pointer-events-none transition-all duration-200 border"
            :class="isDark ? 'bg-[#282A2C] border-white/10 shadow-black/50' : 'bg-white border-[rgba(0,0,0,0.12)] shadow-xl'"
            :style="{ left: cardPos.x + 'px', top: cardPos.y + 'px' }"
          >
            <div class="border-b pb-2 mb-3 transition-colors flex items-center justify-between" :class="isDark ? 'border-white/10' : 'border-gray-100'">
              <div>
                <div class="text-[10px] font-bold uppercase tracking-wider text-blue-500">CCTV Camera</div>
                <div class="text-sm font-bold truncate transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">{{ hoveredCctv.cctv_name }}</div>
              </div>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    :class="getStatusBadgeClass(hoveredCctv.status)">
                {{ getStatusText(hoveredCctv.status) }}
              </span>
            </div>
            
            <!-- Camera Photo Preview -->
            <div class="flex justify-center mb-3 rounded-xl p-2 overflow-hidden border h-32 transition-colors relative"
                 :class="isDark ? 'bg-[#1A1C1E] border-white/5' : 'bg-gray-50 border-gray-100'">
              <img 
                v-if="hoveredCctv.map_image" 
                :src="getResolvedImageUrl(hoveredCctv.map_image)" 
                @error="onImageError"
                class="object-contain h-full w-full rounded-lg" 
                alt="CCTV Photo"
              />
              <div v-else class="flex flex-col items-center justify-center text-gray-400 h-full">
                <svg class="w-8 h-8 mb-1 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span class="text-[10px]">{{ $t('asset_detail.no_image') || 'ไม่มีรูปภาพ' }}</span>
              </div>
            </div>

            <!-- Details List -->
            <div class="space-y-1.5 text-xs">
              <div v-if="hoveredCctv.cctv_code" class="flex justify-between">
                <span :class="isDark ? 'text-gray-400' : 'text-[#727775]'">Code:</span>
                <span class="font-mono font-medium" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">{{ hoveredCctv.cctv_code }}</span>
              </div>
              <div class="flex justify-between">
                <span :class="isDark ? 'text-gray-400' : 'text-[#727775]'">IP Address:</span>
                <span class="font-mono font-semibold text-blue-500">{{ hoveredCctv.ip_address || '-' }}</span>
              </div>
              <div v-if="hoveredCctv.model_name" class="flex justify-between">
                <span :class="isDark ? 'text-gray-400' : 'text-[#727775]'">Model:</span>
                <span :class="isDark ? 'text-gray-200' : 'text-[#1f1f1f]'">{{ hoveredCctv.model_name }}</span>
              </div>
              <div class="flex justify-between">
                <span :class="isDark ? 'text-gray-400' : 'text-[#727775]'">Location:</span>
                <span class="truncate max-w-[150px]" :class="isDark ? 'text-gray-200' : 'text-[#1f1f1f]'">{{ hoveredCctv.location_detail || hoveredCctv.map_place || '-' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Legend Footer -->
        <div v-if="selectedFloor" class="p-3 border-t flex flex-wrap items-center justify-between gap-4 text-xs font-medium transition-colors"
             :class="isDark ? 'bg-[#1A1C1E] border-white/10 text-gray-400' : 'bg-gray-50 border-gray-100 text-[#727775]'">
          <div class="flex items-center gap-4">
            <span class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm animate-pulse"></span>
              {{ $t('cctv_map.normal') || 'ปกติ' }}
            </span>
            <span class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm"></span>
              {{ $t('cctv_map.abnormal') || 'ผิดปกติ' }}
            </span>
          </div>
          <div class="text-[11px] opacity-75">
            {{ $t('cctv_map.ultra_fast_pan_zoom') || '💡 เลื่อน/ขยายแผนผังได้อย่างรวดเร็ว (Ultra Fast SVG Pan & Zoom)' }}
          </div>
        </div>
      </div>

      <!-- Right Side Panel: Camera List & Summary -->
      <div v-if="selectedFloor" class="w-full lg:w-80 shrink-0 flex flex-col gap-4">
        
        <!-- Summary Stats Cards -->
        <div class="grid grid-cols-3 gap-2 shrink-0">
          <div class="p-3 rounded-xl border text-center transition-colors shadow-sm"
               :class="isDark ? 'bg-[#282A2C] border-white/10' : 'bg-white border-gray-200'">
            <div class="text-[10px] font-bold uppercase text-gray-400">{{ $t('cctv_map.total') || 'ทั้งหมด' }}</div>
            <div class="text-lg font-extrabold text-blue-500 mt-0.5">{{ cctvList.length }}</div>
          </div>
          <div class="p-3 rounded-xl border text-center transition-colors shadow-sm"
               :class="isDark ? 'bg-[#282A2C] border-white/10' : 'bg-white border-gray-200'">
            <div class="text-[10px] font-bold uppercase text-emerald-500">{{ $t('cctv_map.normal') || 'ปกติ' }}</div>
            <div class="text-lg font-extrabold text-emerald-500 mt-0.5">{{ activeCount }}</div>
          </div>
          <div class="p-3 rounded-xl border text-center transition-colors shadow-sm"
               :class="isDark ? 'bg-[#282A2C] border-white/10' : 'bg-white border-gray-200'">
            <div class="text-[10px] font-bold uppercase text-red-500">{{ $t('cctv_map.abnormal') || 'ผิดปกติ' }}</div>
            <div class="text-lg font-extrabold text-red-500 mt-0.5">{{ offlineCount }}</div>
          </div>
        </div>

        <!-- Camera Search & List Box -->
        <div class="flex-1 rounded-2xl border p-4 flex flex-col min-h-[350px] shadow-lg transition-colors overflow-hidden"
             :class="isDark ? 'bg-[#282A2C] border-white/10' : 'bg-white border-[rgba(0,0,0,0.12)]'">
          
          <div class="mb-3">
            <h3 class="text-xs font-bold uppercase tracking-wider mb-2 transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">
              📷 {{ $t('cctv_map.camera_list_in_floor') || 'รายชื่อกล้องในชั้นนี้' }} ({{ filteredCctvList.length }})
            </h3>
            
            <div class="relative">
              <input 
                type="text" 
                v-model="searchQuery"
                :placeholder="$t('cctv_map.search_placeholder') || 'ค้นหาชื่อกล้อง / IP / จุดติดตั้ง...'"
                class="w-full text-xs rounded-xl border p-2.5 pl-9 outline-none transition-all"
                :class="isDark 
                  ? 'bg-[#1A1C1E] text-gray-200 border-white/10 focus:border-blue-500' 
                  : 'bg-white text-[#1f1f1f] border-gray-300 focus:border-blue-500'"
              />
              <svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <!-- CCTV Cards Scroll Area -->
          <draggable
            v-model="cctvList"
            item-key="cctv_id"
            @end="onReorder"
            :disabled="!!searchQuery"
            class="flex-1 overflow-y-auto space-y-2 pr-1 custom-scroll"
          >
            <template #item="{ element: item }">
              <div 
                v-show="itemMatchesSearch(item)"
                @mouseenter="highlightMarker(item)"
                @mouseleave="unhighlightMarker"
                @click="selectCctv(item)"
                class="p-3 rounded-xl border transition-all cursor-pointer hover:scale-[1.01]"
                :class="[
                  (hoveredCctv?.cctv_id === item.cctv_id || selectedCctv?.cctv_id === item.cctv_id)
                    ? (isDark ? 'bg-blue-500/20 border-blue-500/50 shadow-md' : 'bg-blue-50 border-blue-300 shadow-md')
                    : (isDark ? 'bg-[#1A1C1E] border-white/5 hover:bg-white/5' : 'bg-gray-50 border-gray-100 hover:bg-white')
                ]"
              >
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2">
                      <svg v-if="!searchQuery" class="w-4 h-4 text-gray-500 cursor-grab active:cursor-grabbing hover:text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"/></svg>
                      <span class="w-2 h-2 rounded-full shrink-0" :class="getStatusDotClass(item.status)"></span>
                      <span class="text-xs font-bold truncate transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">
                        {{ item.cctv_name }}
                      </span>
                    </div>
                    <p class="text-[11px] text-blue-500 font-mono mt-0.5 ml-6">
                      {{ item.ip_address || 'No IP' }}
                    </p>
                    <p class="text-[10px] text-gray-400 truncate mt-0.5 ml-6">
                      📍 {{ item.location_detail || item.map_place || 'ไม่ระบุพิกัด' }}
                    </p>
                  </div>
                  
                  <span class="text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0" :class="getStatusBadgeClass(item.status)">
                    {{ getStatusText(item.status) }}
                  </span>
                </div>
              </div>
            </template>
          </draggable>

            <div v-if="filteredCctvList.length === 0" class="py-8 text-center text-xs text-gray-400">
              {{ $t('cctv_map.no_cctv_data') || 'ไม่พบข้อมูลกล้อง CCTV' }}
            </div>

        </div>

      </div>

    </div>

    <!-- CCTV Camera Detail Popup Modal -->
    <div v-if="selectedCctv" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="selectedCctv = null">
      <div class="relative w-full max-w-md rounded-2xl p-6 shadow-2xl transition-all border"
           :class="isDark ? 'bg-[#282A2C] border-white/10 text-gray-200' : 'bg-white border-gray-200 text-[#1f1f1f]'">
        
        <button @click="selectedCctv = null" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white p-1 rounded-lg transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>

        <div class="flex items-center gap-3 mb-4 pr-6">
          <div class="p-3 rounded-xl bg-blue-500/10 text-blue-500 shrink-0">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <div class="min-w-0">
            <h3 class="text-base font-bold truncate">{{ selectedCctv.cctv_name }}</h3>
            <p class="text-xs font-mono text-blue-500 mt-0.5">{{ selectedCctv.ip_address || 'No IP Address' }}</p>
          </div>
          <span class="ml-auto text-xs font-bold px-2.5 py-1 rounded-full shrink-0" :class="getStatusBadgeClass(selectedCctv.status)">
            {{ getStatusText(selectedCctv.status) }}
          </span>
        </div>

        <!-- Ping / Online Status Banner -->
        <div class="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl text-xs font-semibold border"
          :class="
            !selectedCctv.ip_address
              ? (isDark ? 'bg-gray-500/10 border-gray-500/20 text-gray-400' : 'bg-gray-100 border-gray-200 text-gray-400')
              : onlineMap[selectedCctv.cctv_id] === true
                ? (isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-300 text-emerald-600')
                : onlineMap[selectedCctv.cctv_id] === false
                  ? (isDark ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-200 text-red-500')
                  : (isDark ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-500')
          "
        >
          <template v-if="!selectedCctv.ip_address">
            <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"/>
            </svg>
            <span>ไม่มี IP — ตรวจสอบสถานะไม่ได้</span>
          </template>
          <template v-else-if="onlineMap[selectedCctv.cctv_id] === true">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
            <span>Online — กล้องตอบสนองปกติ</span>
            <span class="ml-auto font-mono text-[10px] opacity-60">{{ selectedCctv.ip_address }}</span>
          </template>
          <template v-else-if="onlineMap[selectedCctv.cctv_id] === false">
            <span class="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
            <span>⚠️ Offline — Ping ไม่ได้ กล้องอาจดับหรือขาดการเชื่อมต่อ</span>
          </template>
          <template v-else>
            <svg class="w-3.5 h-3.5 shrink-0 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            <span>กำลังตรวจสอบสัญญาณ...</span>
          </template>
        </div>

        <!-- Camera Installation Image -->

        <div class="w-full h-52 rounded-xl border overflow-hidden mb-4 flex items-center justify-center bg-gray-100 dark:bg-[#1A1C1E] border-gray-200 dark:border-white/10 relative">
          <img 
            v-if="selectedCctv.map_image" 
            :src="getResolvedImageUrl(selectedCctv.map_image)" 
            class="object-contain w-full h-full" 
            @error="onImageError"
            alt="CCTV Installation Photo"
          />
          <div v-else class="text-xs text-gray-400 flex flex-col items-center justify-center p-4">
            <svg class="w-10 h-10 mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>ยังไม่ได้อัปโหลดรูปถ่ายจุดติดตั้งกล้อง</span>
          </div>
        </div>

        <!-- Details Grid -->
        <div class="grid grid-cols-2 gap-3 text-xs mb-4 p-3.5 rounded-xl bg-gray-50 dark:bg-[#1A1C1E] border border-gray-200 dark:border-white/5">
          <div>
            <span class="text-gray-400 block text-[10px] uppercase font-bold">รหัสกล้อง (Code)</span>
            <span class="font-mono font-bold">{{ selectedCctv.cctv_code || '-' }}</span>
          </div>
          <div>
            <span class="text-gray-400 block text-[10px] uppercase font-bold">รุ่นกล้อง (Model)</span>
            <span class="font-medium">{{ selectedCctv.model_name || '-' }}</span>
          </div>
          <div>
            <span class="text-gray-400 block text-[10px] uppercase font-bold">อาคาร / ชั้น</span>
            <span class="font-medium">{{ selectedCctv.map_floor || '-' }}</span>
          </div>
          <div>
            <span class="text-gray-400 block text-[10px] uppercase font-bold">พิกัดบนแปลน</span>
            <span class="font-mono text-blue-500">X: {{ selectedCctv.map_x ?? '-' }}%, Y: {{ selectedCctv.map_y ?? '-' }}%</span>
          </div>
          <div class="col-span-2 border-t pt-2 dark:border-white/5">
            <span class="text-gray-400 block text-[10px] uppercase font-bold">จุดติดตั้ง / รายละเอียด</span>
            <span class="font-medium">{{ selectedCctv.location_detail || selectedCctv.map_place || '-' }}</span>
          </div>
        </div>

        <!-- Browser Link Button -->
        <a
          v-if="selectedCctv.ip_address"
          :href="`http://${selectedCctv.ip_address}/`"
          target="_blank"
          rel="noopener noreferrer"
          :title="`เปิด http://${selectedCctv.ip_address}/`"
          class="flex items-center justify-center gap-2 w-full mb-3 py-2.5 rounded-xl text-xs font-bold transition-all border"
          :class="isDark
            ? 'bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300'
            : 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100 hover:text-blue-700'"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          {{ $t('cctv_map.open_camera_browser') || 'เปิด Browser กล้อง' }}
          <span class="font-mono opacity-70 ml-1">http://{{ selectedCctv.ip_address }}/</span>
        </a>

        <div v-else class="flex items-center gap-2 w-full mb-3 py-2.5 px-3 rounded-xl text-xs border border-dashed"
          :class="isDark ? 'border-white/10 text-gray-500' : 'border-gray-200 text-gray-400'">
          <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          {{ $t('cctv_map.no_ip_cannot_open') || 'ยังไม่มี IP Address — ไม่สามารถเปิด Browser กล้องได้' }}
        </div>

        <div class="flex justify-end gap-2">
          <button @click="selectedCctv = null" class="px-4 py-2 text-xs font-semibold rounded-xl bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 transition-all">
            {{ $t('cctv_map.close_window') || 'ปิดหน้าต่าง' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount, getCurrentInstance } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useTheme } from '@/composables/useTheme';
import svgPanZoom from 'svg-pan-zoom';
import draggable from 'vuedraggable';

const { isDark } = useTheme();
const { proxy } = getCurrentInstance();
const $api = proxy.$api;
const userStore = useUserStore();

const selectedFloor = ref('');
const loading = ref(false);
const cctvList = ref([]);
const searchQuery = ref('');
const svgContainerRef = ref(null);
const mapContainerRef = ref(null);

const hoveredCctv = ref(null);
const cardPos = ref({ x: 0, y: 0 });

// Ping online/offline status map: cctv_id -> true(online) | false(offline) | null(no IP/unknown)
const onlineMap = ref({});
const isPinging = ref(false);

let pzInstance = null;
let baseVb = null;
let pingInterval = null;

// Floor configuration matching the 4 requested CCTV layouts
const floorConfig = {
  'LIQUID-1': { file: '/cctv-map/Liquid -1st floor Layout(For web).svg', m: 8 },
  'LIQUID-2': { file: '/cctv-map/Liquid -2nd floor Layout(For web).svg', m: 8 },
  'MEC-1':    { file: '/cctv-map/MEC 1st floor Layout (For web).svg',   m: 7 },
  'MEC-2':    { file: '/cctv-map/MEC 2nd floor Layout (For web).svg',   m: 22 }
};

// Global in-memory cache map for fast SVG switching
const svgMemoryCache = new Map();

const getSvgText = async (url) => {
  if (svgMemoryCache.has(url)) {
    return svgMemoryCache.get(url);
  }
  const res = await fetch(url);
  const text = await res.text();
  svgMemoryCache.set(url, text);
  return text;
};

// Preload all 4 CCTV SVG files into RAM on mount
onMounted(() => {
  Object.values(floorConfig).forEach(cfg => {
    getSvgText(cfg.file).catch(err => console.error('SVG Preload Error:', err));
  });
});

onBeforeUnmount(() => {
  if (pzInstance) pzInstance.destroy();
  if (pingInterval) clearInterval(pingInterval);
});

// ── Ping Check ──────────────────────────────────────────────────────────────
const checkPingStatus = async () => {
  if (!cctvList.value.length) return;
  isPinging.value = true;
  try {
    const token = userStore.getAuthToken;
    const ids = cctvList.value.map(c => c.cctv_id);
    const res = await $api.post('/cctv/ping-check', { ids }, {
      headers: { Authorization: `Bearer ${token}` },
      _silent: true
    });
    if (res.data && res.data.success) {
      onlineMap.value = res.data.results; // { cctv_id: true/false }
      drawMarkers(); // วาดจุดใหม่ด้วยสีที่อัปเดต
    }
  } catch (err) {
    console.warn('[CCTV Ping] Failed:', err.message);
  } finally {
    isPinging.value = false;
  }
};

const startPingInterval = () => {
  if (pingInterval) clearInterval(pingInterval);
  // auto-refresh ทุก 60 วินาที
  pingInterval = setInterval(checkPingStatus, 60_000);
};

const activeCount = computed(() => cctvList.value.filter(c => c.status === 'ACTIVE' && onlineMap.value[c.cctv_id] !== false).length);
const offlineCount = computed(() => cctvList.value.filter(c => onlineMap.value[c.cctv_id] === false).length);

const itemMatchesSearch = (item) => {
  if (!searchQuery.value.trim()) return true;
  const q = searchQuery.value.toLowerCase().trim();
  return (item.cctv_name && item.cctv_name.toLowerCase().includes(q)) ||
         (item.cctv_code && item.cctv_code.toLowerCase().includes(q)) ||
         (item.ip_address && item.ip_address.toLowerCase().includes(q)) ||
         (item.location_detail && item.location_detail.toLowerCase().includes(q));
};

const filteredCctvList = computed(() => {
  return cctvList.value.filter(itemMatchesSearch);
});

const onReorder = async () => {
  if (!cctvList.value.length || !!searchQuery.value) return;
  
  // Create an array of updated sort_order values
  const updatedOrder = cctvList.value.map((item, index) => ({
    cctv_id: item.cctv_id,
    sort_order: index + 1
  }));

  try {
    const token = userStore.getAuthToken;
    await $api.put('/cctv/reorder', { items: updatedOrder }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    // Order saved successfully
  } catch (err) {
    console.error("Failed to reorder CCTV:", err.message);
  }
};

const refreshData = async () => {
  if (!selectedFloor.value) return;
  await fetchCctvMapData(selectedFloor.value);
  drawMarkers();
  checkPingStatus();
};

const loadFloorMap = async () => {
  hoveredCctv.value = null;
  if (!selectedFloor.value) {
    if (pzInstance) {
      pzInstance.destroy();
      pzInstance = null;
    }
    if (svgContainerRef.value) svgContainerRef.value.innerHTML = '';
    return;
  }

  loading.value = true;
  const config = floorConfig[selectedFloor.value];
  if (!config) {
    loading.value = false;
    return;
  }

  try {
    const [_, svgText] = await Promise.all([
      fetchCctvMapData(selectedFloor.value),
      getSvgText(config.file)
    ]);

    if (!svgContainerRef.value) return;

    if (pzInstance) {
      pzInstance.destroy();
      pzInstance = null;
    }

    svgContainerRef.value.innerHTML = svgText;
    const svg = svgContainerRef.value.querySelector('svg');
    if (!svg) {
      loading.value = false;
      return;
    }

    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');

    if (!svg.hasAttribute('viewBox')) {
      const box = svg.getBBox();
      svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
    }

    let vb = svg.viewBox.baseVal;
    baseVb = { x: vb.x, y: vb.y, width: vb.width, height: vb.height, rotated: false };

    pzInstance = svgPanZoom(svg, {
      zoomEnabled: true,
      panEnabled: true,
      minZoom: 0.5,
      maxZoom: 10,
      controlIconsEnabled: true,
      fit: true,
      center: true
    });

    drawMarkers(svgContainerRef.value, svg);

    // Ping หลังโหลด map เสร็จ และตั้ง interval
    checkPingStatus();
    startPingInterval();
  } catch (err) {
    console.error("Load CCTV SVG Error:", err);
  } finally {
    loading.value = false;
  }
};

const fetchCctvMapData = async (floor) => {
  try {
    const token = userStore.getAuthToken;
    const res = await $api.get(`/cctv/map?floor=${floor}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.data && res.data.success) {
      cctvList.value = res.data.data;
    }
  } catch (err) {
    console.error("Fetch CCTV Map Error:", err);
  }
};

const selectedCctv = ref(null);

const selectCctv = (item) => {
  selectedCctv.value = item;
  hoveredCctv.value = item;

  // Auto pan and zoom to camera position on SVG map if coordinates exist
  if (pzInstance && item.map_x !== null && item.map_y !== null && item.map_x !== undefined && baseVb) {
    const posX = (item.map_x / 100) * baseVb.width;
    const posY = (item.map_y / 100) * baseVb.height;
    
    pzInstance.zoomAtPoint(2.5, { x: 0, y: 0 });
    const sizes = pzInstance.getSizes();
    const zoom = pzInstance.getZoom();
    
    const targetPanX = (sizes.width / 2) - (posX * zoom);
    const targetPanY = (sizes.height / 2) - (posY * zoom);
    pzInstance.pan({ x: targetPanX, y: targetPanY });
  }
};

const drawMarkers = (container = null, svgEl = null) => {
  const root = container || svgContainerRef.value;
  const svg = svgEl || root?.querySelector('svg');
  if (!root || !svg || !baseVb) return;

  const viewport = svg.querySelector('.svg-pan-zoom_viewport') || svg;

  const oldLayer = viewport.querySelector('#cctv-layer') || svg.querySelector('#cctv-layer');
  if (oldLayer) oldLayer.remove();

  const layer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  layer.setAttribute('id', 'cctv-layer');
  viewport.appendChild(layer);

  const config = floorConfig[selectedFloor.value] || { m: 18 };
  const size = config.m;

  cctvList.value.forEach(cctv => {
    if (cctv.map_x === null || cctv.map_y === null || cctv.map_x === undefined || cctv.map_y === undefined) {
      return;
    }

    const posX = (cctv.map_x / 100) * baseVb.width;
    const posY = (cctv.map_y / 100) * baseVb.height;

    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('class', 'cctv-marker');
    group.setAttribute('data-id', cctv.cctv_id);
    group.setAttribute('transform', `translate(${posX}, ${posY})`);
    group.setAttribute('style', 'cursor: pointer;');

    // ── กำหนดสีและ animation ตาม status + ping result ──
    const pingOnline = onlineMap.value[cctv.cctv_id]; // true | false | undefined
    const hasIp = !!cctv.ip_address;

    let color, blinkDur;
    let isOfflineAlert = false;

    if (cctv.status === 'MAINTENANCE') {
      color = '#F59E0B'; blinkDur = '2.5s'; // เหลือง
    } else if (cctv.status === 'INACTIVE') {
      color = '#6B7280'; blinkDur = '4s';   // เทา
    } else if (!hasIp || pingOnline === undefined) {
      // ACTIVE แต่ยังไม่มีผล ping หรือไม่มี IP
      color = '#10B981'; blinkDur = '1.8s';
    } else if (pingOnline === true) {
      // ACTIVE + online
      color = '#10B981'; blinkDur = '1.8s';
    } else {
      // ACTIVE + offline → แดง + alert
      color = '#EF4444'; blinkDur = '0.8s';
      isOfflineAlert = true;
    }

    // Pulse ring (ACTIVE + online only)
    if (cctv.status === 'ACTIVE' && pingOnline !== false) {
      const pulseRing = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      pulseRing.setAttribute('r', size * 0.7);
      pulseRing.setAttribute('fill', 'none');
      pulseRing.setAttribute('stroke', color);
      pulseRing.setAttribute('stroke-width', size * 0.12);

      const pAnimR = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
      pAnimR.setAttribute('attributeName', 'r');
      pAnimR.setAttribute('values', `${size * 0.7};${size * 2};${size * 0.7}`);
      pAnimR.setAttribute('dur', blinkDur);
      pAnimR.setAttribute('repeatCount', 'indefinite');

      const pAnimO = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
      pAnimO.setAttribute('attributeName', 'opacity');
      pAnimO.setAttribute('values', '0.7;0;0.7');
      pAnimO.setAttribute('dur', blinkDur);
      pAnimO.setAttribute('repeatCount', 'indefinite');

      pulseRing.appendChild(pAnimR);
      pulseRing.appendChild(pAnimO);
      group.appendChild(pulseRing);
    }

    // Outer ring (static border)
    const outerRing = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    outerRing.setAttribute('r', size * 0.95);
    outerRing.setAttribute('fill', 'none');
    outerRing.setAttribute('stroke', color);
    outerRing.setAttribute('stroke-width', size * 0.12);
    outerRing.setAttribute('opacity', '0.4');

    // Main dot (blinking)
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('r', size * 0.5);
    dot.setAttribute('fill', color);
    dot.setAttribute('filter', `drop-shadow(0px 2px 4px ${color}88)`);

    const blinkAnim = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
    blinkAnim.setAttribute('attributeName', 'opacity');
    blinkAnim.setAttribute('values', '1;0.3;1');
    blinkAnim.setAttribute('dur', blinkDur);
    blinkAnim.setAttribute('repeatCount', 'indefinite');
    dot.appendChild(blinkAnim);

    // Center highlight glint
    const glint = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    glint.setAttribute('r', size * 0.18);
    glint.setAttribute('fill', '#FFFFFF');
    glint.setAttribute('opacity', '0.7');
    glint.setAttribute('cx', (-size * 0.15).toString());
    glint.setAttribute('cy', (-size * 0.15).toString());

    group.appendChild(outerRing);
    group.appendChild(dot);
    group.appendChild(glint);

    // ⚠️ Offline warning cross mark (ACTIVE แต่ ping ไม่ได้)
    if (isOfflineAlert) {
      const warnSize = size * 0.4;
      const warn = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      warn.setAttribute('x', (size * 0.45).toString());
      warn.setAttribute('y', (-size * 0.45).toString());
      warn.setAttribute('font-size', (warnSize * 1.6).toString());
      warn.setAttribute('fill', '#FCD34D');
      warn.setAttribute('text-anchor', 'middle');
      warn.setAttribute('dominant-baseline', 'middle');
      warn.setAttribute('style', 'pointer-events: none; user-select: none;');
      warn.textContent = '!';
      group.appendChild(warn);
    }

    group.addEventListener('click', (e) => {
      e.stopPropagation();
      selectCctv(cctv);
    });

    group.addEventListener('mouseenter', (e) => {
      dot.setAttribute('r', (size * 0.7).toString());

      const containerRect = mapContainerRef.value.getBoundingClientRect();
      const x = e.clientX - containerRect.left + 15;
      const y = e.clientY - containerRect.top - 20;

      cardPos.value = { 
        x: Math.min(x, containerRect.width - 300), 
        y: Math.max(10, Math.min(y, containerRect.height - 250))
      };
      hoveredCctv.value = cctv;
    });

    group.addEventListener('mouseleave', () => {
      dot.setAttribute('r', (size * 0.5).toString());
      hoveredCctv.value = null;
    });

    layer.appendChild(group);
  });
};

const highlightMarker = (item) => {
  hoveredCctv.value = item;
};

const unhighlightMarker = () => {
  hoveredCctv.value = null;
};

const getResolvedImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${import.meta.env.VITE_API_BASE_URL || ''}${path}`;
};

const onImageError = (e) => {
  e.target.style.display = 'none';
};

const getStatusBadgeClass = (status) => {
  if (status === 'ACTIVE') return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
  if (status === 'MAINTENANCE') return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
  return 'bg-rose-500/10 text-rose-500 border border-rose-500/20';
};

const getStatusDotClass = (status) => {
  if (status === 'ACTIVE') return 'bg-emerald-500';
  if (status === 'MAINTENANCE') return 'bg-amber-500';
  return 'bg-rose-500';
};

const getStatusText = (status) => {
  if (status === 'ACTIVE') return 'ปกติ';
  if (status === 'MAINTENANCE') return 'ซ่อมบำรุง';
  return 'ไม่ใช้งาน';
};
</script>

<style scoped>
.custom-scroll::-webkit-scrollbar {
  width: 4px;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: rgba(150, 150, 150, 0.3);
  border-radius: 4px;
}
</style>

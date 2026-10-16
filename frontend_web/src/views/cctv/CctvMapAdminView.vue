<template>
  <div class="p-6 font-sans max-w-7xl mx-auto pb-8 h-[calc(100vh-80px)] flex flex-col transition-colors" :class="isDark ? 'text-gray-300' : 'text-[#444746]'">
    <!-- Header -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 shrink-0">
      <div>
        <h2 class="text-2xl font-bold tracking-wide flex items-center gap-3 transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">
          <div class="p-2.5 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </div>
          {{ $t('cctv_map.admin_title') || 'จัดการตำแหน่งและข้อมูลกล้อง CCTV' }}
        </h2>
        <p class="text-sm mt-1 transition-colors" :class="isDark ? 'text-gray-400' : 'text-[#727775]'">
          {{ $t('cctv_map.admin_subtitle') || 'เพิ่ม แก้ไขข้อมูลกล้อง CCTV และคลิกบนแผนผังเพื่อกำหนดจุดติดตั้ง' }}
        </p>
      </div>

      <router-link
        to="/app/cctv-map"
        class="px-4 py-2.5 border rounded-xl text-xs font-semibold flex items-center gap-2 transition-all w-fit"
        :class="isDark ? 'bg-[#1A1C1E] border-white/10 text-gray-300 hover:bg-white/5' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        {{ $t('cctv_map.back_to_map') || 'กลับหน้าแผนผัง' }}
      </router-link>
    </div>

    <!-- Main Workspace Area -->
    <div class="flex-1 flex flex-col md:flex-row gap-6 min-h-0">
      
      <!-- Left Panel: CCTV Form & Device Management -->
      <div class="w-full md:w-96 shrink-0 border rounded-2xl p-5 flex flex-col gap-4 shadow-lg transition-colors overflow-y-auto custom-scroll max-h-full"
           :class="isDark ? 'bg-[#282A2C] border-white/10' : 'bg-white border-[rgba(0,0,0,0.12)]'">
        
        <div class="flex items-center justify-between border-b pb-3" :class="isDark ? 'border-white/10' : 'border-gray-100'">
          <h3 class="text-xs font-bold uppercase tracking-wider transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">
            {{ isEditing ? '✏️ ' + ($t('cctv_map.edit_cctv') || 'แก้ไขกล้อง CCTV') : '➕ ' + ($t('cctv_map.add_new_cctv') || 'เพิ่มกล้อง CCTV ใหม่') }}
          </h3>
          <button 
            @click="resetForm" 
            class="text-[11px] font-semibold text-purple-500 hover:underline"
          >
            + {{ $t('cctv_map.create_new') || 'สร้างรายการใหม่' }}
          </button>
        </div>

        <form @submit.prevent="saveCctv" class="space-y-4 text-xs">
          <!-- Step 1: Select Floor (4 Options Only) -->
          <div>
            <label class="block font-bold uppercase mb-1.5 transition-colors" :class="isDark ? 'text-gray-400' : 'text-[#727775]'">
              {{ $t('cctv_map.step_1_select_floor') || '1. เลือกอาคาร / ชั้น' }}
            </label>
            <select 
              v-model="selectedFloor"
              @change="onFloorSelectChange"
              class="w-full text-xs rounded-xl border p-2.5 outline-none cursor-pointer transition-all font-medium"
              :class="isDark 
                ? 'bg-[#1A1C1E] text-gray-200 border-white/10 focus:border-purple-500' 
                : 'bg-white text-[#1f1f1f] border-gray-300 focus:border-purple-500'"
            >
              <option value="">{{ $t('cctv_map.select_floor_option') || '--- เลือกชั้นอาคาร ---' }}</option>
              <optgroup label="Liquid Plant (CCTV Layout)">
                <option value="LIQUID-1">Liquid Plant - ชั้น 1 (1st Floor)</option>
                <option value="LIQUID-2">Liquid Plant - ชั้น 2 (2nd Floor)</option>
              </optgroup>
              <optgroup label="MEC Building (CCTV Layout)">
                <option value="MEC-1">MEC Building - ชั้น 1 (1st Floor)</option>
                <option value="MEC-2">MEC Building - ชั้น 2 (2nd Floor)</option>
              </optgroup>
            </select>
          </div>

          <!-- Step 2: Select Existing CCTV or Add New -->
          <div>
            <label class="block font-bold uppercase mb-1.5 transition-colors" :class="isDark ? 'text-gray-400' : 'text-[#727775]'">
              {{ $t('cctv_map.step_2_select_cctv') || '2. เลือกกล้องที่จะแก้ไขตำแหน่ง / ข้อมูล' }}
            </label>
            <select 
              v-model="selectedCctvId"
              @change="onCctvSelectChange"
              class="w-full text-xs rounded-xl border p-2.5 outline-none cursor-pointer transition-all"
              :class="isDark 
                ? 'bg-[#1A1C1E] text-gray-200 border-white/10 focus:border-purple-500' 
                : 'bg-white text-[#1f1f1f] border-gray-300 focus:border-purple-500'"
            >
              <option :value="null">{{ $t('cctv_map.create_new_cctv_option') || '-- สร้างกล้องใหม่ --' }}</option>
              <option v-for="cctv in allCctvs" :key="cctv.cctv_id" :value="cctv.cctv_id">
                {{ cctv.cctv_name }} ({{ cctv.ip_address || 'No IP' }}) {{ cctv.map_floor ? '📍 ' + cctv.map_floor : '' }}
              </option>
            </select>
          </div>

          <!-- Camera Information Fields -->
          <div class="space-y-3 p-3 rounded-xl border transition-colors"
               :class="isDark ? 'bg-[#1A1C1E] border-white/5' : 'bg-gray-50 border-gray-200'">
            
            <div>
              <label class="block font-semibold mb-1" :class="isDark ? 'text-gray-300' : 'text-gray-700'">
                {{ $t('cctv_map.cctv_name') || 'ชื่อกล้อง / รหัสกล้อง' }} <span class="text-rose-500">*</span>
              </label>
              <input 
                type="text" 
                v-model="formData.cctv_name" 
                required
                :placeholder="$t('cctv_map.cctv_name_placeholder') || 'เช่น CCTV-B1-01 หรือ กล้องหน้าประตู 1'"
                class="w-full p-2.5 rounded-lg border outline-none focus:border-purple-500 transition-all"
                :class="isDark ? 'bg-[#282A2C] text-white border-white/10' : 'bg-white text-[#1f1f1f] border-gray-300'"
              />
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-semibold mb-1" :class="isDark ? 'text-gray-300' : 'text-gray-700'">
                  {{ $t('cctv_map.cctv_code') || 'รหัสอุปกรณ์ (Code)' }}
                </label>
                <input 
                  type="text" 
                  v-model="formData.cctv_code" 
                  placeholder="CAM-001"
                  class="w-full p-2 rounded-lg border outline-none focus:border-purple-500 transition-all"
                  :class="isDark ? 'bg-[#282A2C] text-white border-white/10' : 'bg-white text-[#1f1f1f] border-gray-300'"
                />
              </div>

              <div>
                <label class="block font-semibold mb-1" :class="isDark ? 'text-gray-300' : 'text-gray-700'">
                  IP Address
                </label>
                <input 
                  type="text" 
                  v-model="formData.ip_address" 
                  placeholder="192.168.1.100"
                  class="w-full p-2 rounded-lg border outline-none font-mono focus:border-purple-500 transition-all"
                  :class="isDark ? 'bg-[#282A2C] text-white border-white/10' : 'bg-white text-[#1f1f1f] border-gray-300'"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-semibold mb-1" :class="isDark ? 'text-gray-300' : 'text-gray-700'">
                  {{ $t('cctv_map.cctv_model') || 'รุ่น / ยี่ห้อ (Model)' }}
                </label>
                <input 
                  type="text" 
                  v-model="formData.model_name" 
                  placeholder="Hikvision DS-2CD2143"
                  class="w-full p-2 rounded-lg border outline-none focus:border-purple-500 transition-all"
                  :class="isDark ? 'bg-[#282A2C] text-white border-white/10' : 'bg-white text-[#1f1f1f] border-gray-300'"
                />
              </div>

              <div>
                <label class="block font-semibold mb-1" :class="isDark ? 'text-gray-300' : 'text-gray-700'">
                  {{ $t('cctv_map.cctv_status') || 'สถานะการทำงาน' }}
                </label>
                <select 
                  v-model="formData.status"
                  class="w-full p-2 rounded-lg border outline-none cursor-pointer focus:border-purple-500 transition-all"
                  :class="isDark ? 'bg-[#282A2C] text-white border-white/10' : 'bg-white text-[#1f1f1f] border-gray-300'"
                >
                  <option value="ACTIVE">🟢 {{ $t('cctv_map.status_active') || 'ปกติ (Active)' }}</option>
                  <option value="MAINTENANCE">🟡 {{ $t('cctv_map.status_maintenance') || 'ซ่อมบำรุง (Maintenance)' }}</option>
                  <option value="INACTIVE">🔴 {{ $t('cctv_map.status_inactive') || 'ไม่ใช้งาน (Inactive)' }}</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block font-semibold mb-1" :class="isDark ? 'text-gray-300' : 'text-gray-700'">
                {{ $t('cctv_map.location_detail') || 'รายละเอียดจุดติดตั้ง / บริเวณ' }}
              </label>
              <input 
                type="text" 
                v-model="formData.location_detail" 
                :placeholder="$t('cctv_map.location_detail_placeholder') || 'เช่น ทางเดินฝั่งทิศตะวันตก หน้าห้อง Server'"
                class="w-full p-2 rounded-lg border outline-none focus:border-purple-500 transition-all"
                :class="isDark ? 'bg-[#282A2C] text-white border-white/10' : 'bg-white text-[#1f1f1f] border-gray-300'"
              />
            </div>
          </div>

          <!-- Position Coordinates Section -->
          <div class="p-3 rounded-xl border space-y-3 transition-colors"
               :class="isDark ? 'bg-[#1A1C1E] border-white/5' : 'bg-gray-50 border-gray-200'">
            <div class="flex items-center justify-between">
              <span class="font-bold uppercase text-[10px] text-purple-500">📍 {{ $t('cctv_map.map_coordinates') || 'พิกัดบนแผนผัง (Click on Map)' }}</span>
              <span class="text-[10px] text-gray-400">X: {{ formData.map_x !== null ? formData.map_x.toFixed(1) + '%' : '-' }} | Y: {{ formData.map_y !== null ? formData.map_y.toFixed(1) + '%' : '-' }}</span>
            </div>

            <div>
              <label class="block font-semibold mb-1" :class="isDark ? 'text-gray-300' : 'text-gray-700'">
                {{ $t('cctv_map.rotation_angle') || 'ทิศทาง / มุมหมุนไอคอน' }}
              </label>
              <div class="flex items-center gap-3">
                <input 
                  type="range" 
                  v-model.number="formData.map_rotate" 
                  min="-90" 
                  max="180" 
                  step="90" 
                  class="flex-1 accent-purple-500 cursor-pointer"
                  @change="updateMarkerOnMap"
                />
                <span class="font-mono w-10 text-right font-bold text-purple-500">{{ formData.map_rotate }}°</span>
              </div>
            </div>
          </div>

          <!-- Image Upload Section -->
          <div>
            <label class="block font-semibold mb-1" :class="isDark ? 'text-gray-300' : 'text-gray-700'">
              📷 {{ $t('cctv_map.cctv_image') || 'รูปภาพกล้อง / มุมมองติดตั้ง' }}
            </label>
            
            <div v-if="formData.map_image" class="mb-2 rounded-xl overflow-hidden border relative group max-h-36 flex items-center justify-center bg-black/20"
                 :class="isDark ? 'border-white/10' : 'border-gray-200'">
              <img :src="getResolvedImageUrl(formData.map_image)" class="max-h-36 object-contain" alt="CCTV Photo" />
            </div>

            <input 
              type="file" 
              ref="imageFileInput"
              accept="image/*"
              @change="onFileSelected"
              class="w-full text-xs text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-500/10 file:text-purple-500 hover:file:bg-purple-500/20 cursor-pointer"
            />
          </div>

          <!-- Form Buttons -->
          <div class="pt-2 space-y-2">
            <button 
              type="submit"
              :disabled="saving"
              class="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <svg v-if="saving" class="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <span>{{ isEditing ? ($t('cctv_map.save_changes') || 'บันทึกการแก้ไข') : ($t('cctv_map.add_new_cctv_btn') || 'เพิ่มกล้อง CCTV ใหม่') }}</span>
            </button>

            <button 
              v-if="isEditing"
              type="button"
              @click="deleteCctv"
              class="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-semibold rounded-xl transition-all text-xs"
            >
              🗑️ {{ $t('cctv_map.delete_cctv') || 'ลบกล้อง CCTV นี้' }}
            </button>
          </div>
        </form>

      </div>

      <!-- Right Area: Fast Inline SVG Interactive Map -->
      <div class="flex-1 rounded-2xl border overflow-hidden relative shadow-lg transition-colors flex flex-col"
           :class="isDark ? 'bg-[#1A1C1E] border-white/10' : 'bg-white border-[rgba(0,0,0,0.12)]'">
        
        <!-- Instruction Banner -->
        <div class="p-3 border-b flex items-center justify-between gap-4 text-xs font-semibold transition-colors shrink-0"
             :class="isDark ? 'bg-[#282A2C] border-white/10 text-purple-400' : 'bg-purple-50 border-purple-100 text-purple-700'">
          <div class="flex items-center gap-2">
            <span>👉 <b>{{ $t('cctv_map.placement_step') || 'ขั้นตอนการวางพิกัด:' }}</b> {{ $t('cctv_map.placement_instruction') || 'คลิกจุดบนแผนผังเพื่อกำหนดตำแหน่งกล้องที่เลือก' }}</span>
          </div>
          <span v-if="selectedFloor" class="font-bold uppercase bg-purple-500 text-white px-2.5 py-0.5 rounded-full text-[10px]">
            {{ selectedFloor }}
          </span>
        </div>

        <!-- Inline SVG Map Container -->
        <div v-show="selectedFloor" class="w-full h-full relative flex-1" ref="mapContainerRef">
          <div v-if="loading" class="absolute inset-0 bg-black/40 z-20 flex items-center justify-center backdrop-blur-sm">
            <div class="flex flex-col items-center bg-[#1E1F20]/90 px-6 py-4 rounded-2xl shadow-2xl border border-white/10">
              <svg class="animate-spin h-8 w-8 text-purple-500 mb-2" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <span class="text-white text-xs font-semibold">{{ $t('cctv_map.loading_map') || 'กำลังโหลดแผนผัง...' }}</span>
            </div>
          </div>

          <!-- Inline Fast SVG container -->
          <div ref="svgContainerRef" class="w-full h-full overflow-hidden"></div>
        </div>

        <div v-if="!selectedFloor" class="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
          <svg class="w-16 h-16 mb-3 opacity-50 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p class="font-bold text-sm">{{ $t('cctv_map.select_floor_to_show_map') || 'เลือกชั้นอาคารเพื่อแสดงแผนผังและจัดวางตำแหน่งกล้อง' }}</p>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useModalStore } from '@/stores/modalStore';
import { useTheme } from '@/composables/useTheme';
import svgPanZoom from 'svg-pan-zoom';

const { isDark } = useTheme();
const { proxy } = getCurrentInstance();
const $api = proxy.$api;
const $t = proxy.$t;
const userStore = useUserStore();
const modal = useModalStore();

const selectedFloor = ref('');
const selectedCctvId = ref(null);
const allCctvs = ref([]);
const floorCctvs = ref([]);
const loading = ref(false);
const saving = ref(false);

const svgContainerRef = ref(null);
const mapContainerRef = ref(null);
const imageFileInput = ref(null);
const selectedFile = ref(null);

let pzInstance = null;
let baseVb = null;

const initialForm = () => ({
  cctv_name: '',
  cctv_code: '',
  ip_address: '',
  model_name: '',
  location_detail: '',
  status: 'ACTIVE',
  map_floor: null,
  map_x: null,
  map_y: null,
  map_rotate: 0,
  map_place: '',
  map_image: null
});

const formData = ref(initialForm());
const isEditing = ref(false);

// 4 Layout Options matching CCTV maps
const floorConfig = {
  'LIQUID-1': { file: '/cctv-map/Liquid -1st floor Layout(For web).svg', m: 8 },
  'LIQUID-2': { file: '/cctv-map/Liquid -2nd floor Layout(For web).svg', m: 8 },
  'MEC-1':    { file: '/cctv-map/MEC 1st floor Layout (For web).svg',   m: 7 },
  'MEC-2':    { file: '/cctv-map/MEC 2nd floor Layout (For web).svg',   m: 22 }
};

// Global in-memory RAM cache for fast floor switching
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

// Preload all 4 CCTV layout SVGs into RAM on mount
onMounted(async () => {
  await fetchAllCctvs();
  Object.values(floorConfig).forEach(cfg => {
    getSvgText(cfg.file).catch(err => console.error("SVG Preload Error:", err));
  });
});

onBeforeUnmount(() => {
  if (pzInstance) pzInstance.destroy();
});

const fetchAllCctvs = async () => {
  try {
    const token = userStore.getAuthToken;
    const res = await $api.get('/cctv', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.data && res.data.success) {
      allCctvs.value = res.data.data;
    }
  } catch (err) {
    console.error("Fetch all CCTVs error:", err);
  }
};

const onFloorSelectChange = async () => {
  if (!selectedFloor.value) {
    if (pzInstance) {
      pzInstance.destroy();
      pzInstance = null;
    }
    if (svgContainerRef.value) svgContainerRef.value.innerHTML = '';
    return;
  }

  loading.value = true;
  formData.value.map_floor = selectedFloor.value;

  const config = floorConfig[selectedFloor.value];
  if (!config) {
    loading.value = false;
    return;
  }

  try {
    const [_, svgText] = await Promise.all([
      fetchFloorCctvs(),
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

    // Attach map click handler for camera marker placement
    svg.addEventListener('click', handleMapClick);

    drawAdminMarkers();
  } catch (err) {
    console.error("Load Admin CCTV SVG error:", err);
  } finally {
    loading.value = false;
  }
};

const fetchFloorCctvs = async () => {
  if (!selectedFloor.value) return;
  try {
    const token = userStore.getAuthToken;
    const res = await $api.get(`/cctv/map?floor=${selectedFloor.value}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.data && res.data.success) {
      floorCctvs.value = res.data.data;
    }
  } catch (err) {
    console.error("Fetch floor CCTVs error:", err);
  }
};

const onCctvSelectChange = () => {
  if (!selectedCctvId.value) {
    resetForm();
    return;
  }

  const target = allCctvs.value.find(c => c.cctv_id === selectedCctvId.value);
  if (target) {
    isEditing.value = true;
    formData.value = { ...target };
    if (target.map_floor && target.map_floor !== selectedFloor.value) {
      selectedFloor.value = target.map_floor;
      onFloorSelectChange();
    } else {
      drawAdminMarkers();
    }
  }
};

const resetForm = () => {
  selectedCctvId.value = null;
  isEditing.value = false;
  formData.value = initialForm();
  if (selectedFloor.value) {
    formData.value.map_floor = selectedFloor.value;
  }
  selectedFile.value = null;
  if (imageFileInput.value) imageFileInput.value.value = '';
  drawAdminMarkers();
};

const handleMapClick = (e) => {
  if (!baseVb || !svgContainerRef.value) return;

  const svg = svgContainerRef.value.querySelector('svg');
  if (!svg) return;

  const viewport = svg.querySelector('.svg-pan-zoom_viewport') || svg;
  const ctm = viewport.getScreenCTM();
  if (!ctm) return;

  const pt = svg.createSVGPoint();
  pt.x = e.clientX;
  pt.y = e.clientY;
  const svgPt = pt.matrixTransform(ctm.inverse());

  let rawX = svgPt.x;
  let rawY = svgPt.y;

  let percentX = (rawX / baseVb.width) * 100;
  let percentY = (rawY / baseVb.height) * 100;

  percentX = Math.max(0, Math.min(100, percentX));
  percentY = Math.max(0, Math.min(100, percentY));

  formData.value.map_x = parseFloat(percentX.toFixed(2));
  formData.value.map_y = parseFloat(percentY.toFixed(2));
  formData.value.map_floor = selectedFloor.value;

  drawAdminMarkers();
};

const drawAdminMarkers = () => {
  const root = svgContainerRef.value;
  const svg = root?.querySelector('svg');
  if (!root || !svg || !baseVb) return;

  const viewport = svg.querySelector('.svg-pan-zoom_viewport') || svg;

  const oldLayer = viewport.querySelector('#cctv-admin-layer') || svg.querySelector('#cctv-admin-layer');
  if (oldLayer) oldLayer.remove();

  const layer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  layer.setAttribute('id', 'cctv-admin-layer');
  viewport.appendChild(layer);

  const config = floorConfig[selectedFloor.value] || { m: 18 };
  const size = config.m;

  // 1. Draw existing floor CCTVs (blinking dot)
  floorCctvs.value.forEach(cctv => {
    if (cctv.map_x === null || cctv.map_y === null) return;
    if (isEditing.value && cctv.cctv_id === selectedCctvId.value) return;

    const posX = (cctv.map_x / 100) * baseVb.width;
    const posY = (cctv.map_y / 100) * baseVb.height;

    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('transform', `translate(${posX}, ${posY})`);
    group.setAttribute('style', 'cursor: pointer;');

    // Outer ring (static)
    const outerRing = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    outerRing.setAttribute('r', size * 0.95);
    outerRing.setAttribute('fill', 'none');
    outerRing.setAttribute('stroke', '#9CA3AF');
    outerRing.setAttribute('stroke-width', size * 0.12);
    outerRing.setAttribute('opacity', '0.5');

    // Inner dot (blinking)
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('r', size * 0.45);
    dot.setAttribute('fill', '#6B7280');

    const anim = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
    anim.setAttribute('attributeName', 'opacity');
    anim.setAttribute('values', '1;0.2;1');
    anim.setAttribute('dur', '2s');
    anim.setAttribute('repeatCount', 'indefinite');
    dot.appendChild(anim);

    group.appendChild(outerRing);
    group.appendChild(dot);

    group.addEventListener('click', (e) => {
      e.stopPropagation();
      selectedCctvId.value = cctv.cctv_id;
      onCctvSelectChange();
    });

    layer.appendChild(group);
  });

  // 2. Draw active edited/placed marker (Highlighted Purple blinking dot)
  if (formData.value.map_x !== null && formData.value.map_y !== null) {
    const activeX = (formData.value.map_x / 100) * baseVb.width;
    const activeY = (formData.value.map_y / 100) * baseVb.height;

    const activeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    activeGroup.setAttribute('id', 'active-edited-marker');
    activeGroup.setAttribute('transform', `translate(${activeX}, ${activeY})`);

    // Expanding pulse ring
    const pulseRing = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    pulseRing.setAttribute('r', size * 0.8);
    pulseRing.setAttribute('fill', 'none');
    pulseRing.setAttribute('stroke', '#A855F7');
    pulseRing.setAttribute('stroke-width', size * 0.15);

    const pulseAnimR = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
    pulseAnimR.setAttribute('attributeName', 'r');
    pulseAnimR.setAttribute('values', `${size * 0.8};${size * 2.2};${size * 0.8}`);
    pulseAnimR.setAttribute('dur', '1.6s');
    pulseAnimR.setAttribute('repeatCount', 'indefinite');

    const pulseAnimO = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
    pulseAnimO.setAttribute('attributeName', 'opacity');
    pulseAnimO.setAttribute('values', '0.8;0;0.8');
    pulseAnimO.setAttribute('dur', '1.6s');
    pulseAnimO.setAttribute('repeatCount', 'indefinite');

    pulseRing.appendChild(pulseAnimR);
    pulseRing.appendChild(pulseAnimO);

    // Main dot with drop shadow
    const mainDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    mainDot.setAttribute('r', size * 0.85);
    mainDot.setAttribute('fill', '#9333EA');
    mainDot.setAttribute('stroke', '#FFFFFF');
    mainDot.setAttribute('stroke-width', size * 0.18);
    mainDot.setAttribute('filter', 'drop-shadow(0px 3px 6px rgba(147,51,234,0.7))');

    // Blink animation on main dot
    const blinkAnim = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
    blinkAnim.setAttribute('attributeName', 'opacity');
    blinkAnim.setAttribute('values', '1;0.4;1');
    blinkAnim.setAttribute('dur', '1.6s');
    blinkAnim.setAttribute('repeatCount', 'indefinite');
    mainDot.appendChild(blinkAnim);

    // Center highlight
    const highlight = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    highlight.setAttribute('r', size * 0.3);
    highlight.setAttribute('fill', '#FFFFFF');
    highlight.setAttribute('opacity', '0.6');
    highlight.setAttribute('cx', (-size * 0.2).toString());
    highlight.setAttribute('cy', (-size * 0.2).toString());

    activeGroup.appendChild(pulseRing);
    activeGroup.appendChild(mainDot);
    activeGroup.appendChild(highlight);
    layer.appendChild(activeGroup);
  }
};

const updateMarkerOnMap = () => {
  drawAdminMarkers();
};

const onFileSelected = (e) => {
  const file = e.target.files[0];
  if (file) {
    selectedFile.value = file;
    formData.value.map_image = URL.createObjectURL(file);
  }
};

const saveCctv = async () => {
  if (!formData.value.cctv_name.trim()) return;
  saving.value = true;

  try {
    const token = userStore.getAuthToken;
    let targetId = selectedCctvId.value;

    if (isEditing.value && targetId) {
      await $api.put(`/cctv/${targetId}`, formData.value, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } else {
      const res = await $api.post('/cctv', formData.value, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.cctv_id) {
        targetId = res.data.cctv_id;
      }
    }

    if (selectedFile.value && targetId) {
      const fileData = new FormData();
      fileData.append('image', selectedFile.value);
      await $api.post(`/cctv/${targetId}/upload-image`, fileData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
    }

    modal.alert($t('common.success') || 'สำเร็จ', $t('cctv_map.save_success') || 'บันทึกข้อมูลและตำแหน่งกล้อง CCTV เรียบร้อยแล้ว');
    await fetchAllCctvs();
    await fetchFloorCctvs();
    resetForm();

  } catch (err) {
    console.error("Save CCTV error:", err);
    modal.alert($t('common.error') || 'ข้อผิดพลาด', err.response?.data?.message || err.message);
  } finally {
    saving.value = false;
  }
};

const deleteCctv = async () => {
  if (!selectedCctvId.value) return;
  const confirm = await modal.confirm($t('common.confirm_delete') || 'ยืนยันการลบ', $t('cctv_map.confirm_delete_cctv') || 'คุณต้องการลบข้อมูลกล้อง CCTV นี้ใช่หรือไม่?');
  if (!confirm) return;

  try {
    const token = userStore.getAuthToken;
    await $api.delete(`/cctv/${selectedCctvId.value}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    modal.alert($t('common.success') || 'สำเร็จ', $t('cctv_map.delete_success') || 'ลบกล้อง CCTV เรียบร้อยแล้ว');
    await fetchAllCctvs();
    await fetchFloorCctvs();
    resetForm();
  } catch (err) {
    modal.alert($t('common.error') || 'ข้อผิดพลาด', err.message);
  }
};

const getResolvedImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('blob:') || path.startsWith('http')) return path;
  return `${import.meta.env.VITE_API_BASE_URL || ''}${path}`;
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

<template>
  <div class="p-6 font-sans max-w-7xl mx-auto pb-8 h-[calc(100vh-80px)] flex flex-col transition-colors" :class="isDark ? 'text-gray-300' : 'text-[#444746]'">
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 shrink-0">
      <div>
        <h2 class="text-2xl font-bold tracking-wide flex items-center gap-2 transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          {{ $t('asset_map.title') }}
        </h2>
        <p class="text-sm mt-1 transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ $t('asset_map.subtitle') }}</p>
      </div>

      <div class="flex flex-col md:flex-row items-center gap-3">
        <label class="text-sm transition-colors whitespace-nowrap" :class="isDark ? 'text-gray-400' : 'text-[#727775]'">{{ $t('asset_map.select_building_floor') }}</label>
        <div class="relative group w-full md:w-64">
          <select 
            v-model="selectedFloor"
            @change="loadFloorMap"
            class="w-full text-sm rounded-lg border transition-all appearance-none cursor-pointer shadow-sm pl-4 p-2.5 outline-none"
            :class="isDark 
              ? 'bg-[#1A1C1E] text-gray-200 border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500' 
              : 'bg-white text-[#1f1f1f] border-[rgba(0,0,0,0.12)] focus:border-blue-500 focus:ring-1 focus:ring-blue-500'"
          >
            <option value="">{{ $t('asset_map.placeholder_floor') }}</option>
            <optgroup label="Building 1 (Office/Plant)">
                <option value="B1-1">B1-1 : 1st Floor (Plant)</option>
                <option value="B1-2">B1-2 : 2nd Floor (Office)</option>
            </optgroup>
            <optgroup label="Building 2 (Aero/QA1/Packing)">
                <option value="B2-1">B2-1 : 1st Floor (Aero)</option>
                <option value="B2-2">B2-2 : 2nd Floor (Packing)</option>
            </optgroup>
            <optgroup label="Building 3 (Epoxy/IDMG/RD/PE)">
                <option value="B3-1">B3-1 : 1st Floor (Epoxy)</option>
                <option value="B3-2">B3-2 : 2nd Floor (Office)</option>
            </optgroup>
            <optgroup label="Building 4 (Warehouse)">
                <option value="B4-1">B4-1 : 1st Floor</option>
                <option value="B4-2">B4-2 : 2nd Floor (1300)</option>
            </optgroup>
            <optgroup label="MEC Building">
                <option value="MEC-1">MEC-1 : 1st Floor</option>
                <option value="MEC-2">MEC-2 : 2nd Floor</option>
            </optgroup>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <button 
          @click="refreshData" 
          class="w-full md:w-auto p-2.5 rounded-lg transition-all flex items-center justify-center border"
          :class="isDark 
            ? 'bg-[#1A1C1E] border-white/10 text-gray-400 hover:bg-[#333538] hover:text-white' 
            : 'bg-white border-[rgba(0,0,0,0.12)] text-[#727775] hover:bg-gray-50 hover:text-[#1f1f1f] shadow-sm'"
          :title="$t('asset_map.refresh_data')"
        >
          <svg :class="{'animate-spin text-blue-500': loading}" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>

    <div class="px-6 flex-1 min-h-[500px] relative flex flex-col mb-8">
      <div 
        v-if="!selectedFloor" 
        class="flex-1 rounded-xl border border-dashed flex flex-col items-center justify-center transition-colors px-6 text-center"
        :class="isDark ? 'bg-[#1A1C1E] border-white/10 text-gray-500' : 'bg-white border-[rgba(0,0,0,0.12)] text-[#727775] shadow-sm'"
      >
        <svg class="w-16 h-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        <p class="max-w-xs">{{ $t('asset_map.please_select') }}</p>
      </div>

      <div 
        v-show="selectedFloor" 
        class="flex-1 rounded-xl bg-white border overflow-hidden relative shadow-lg transition-colors"
        :class="isDark ? 'border-white/10' : 'border-[rgba(0,0,0,0.12)]'"
        ref="mapContainerRef"
      >
        <!-- Loading Overlay -->
        <div v-if="loading" class="absolute inset-0 bg-black/50 z-10 flex items-center justify-center backdrop-blur-sm">
           <div class="flex flex-col items-center">
              <svg class="animate-spin h-8 w-8 text-blue-500 mb-2" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <span class="text-white text-sm font-medium">{{ $t('asset_map.loading_map') }}</span>
           </div>
        </div>

        <!-- SVG Object -->
        <object 
          ref="svgObjectRef"
          type="image/svg+xml"
          class="w-full h-full"
          @load="onSvgLoaded"
        ></object>

        <!-- Vue Hover Card (Tooltip) -->
        <div 
            v-if="hoveredAsset"
            class="absolute z-20 rounded-xl shadow-2xl p-4 w-72 pointer-events-none transition-all duration-200 border"
            :class="isDark ? 'bg-[#282A2C] border-white/10 shadow-black/40' : 'bg-white border-[rgba(0,0,0,0.12)] shadow-xl'"
            :style="{ left: cardPos.x + 'px', top: cardPos.y + 'px' }"
        >
            <div class="border-b pb-2 mb-3 transition-colors" :class="isDark ? 'border-white/10' : 'border-[rgba(0,0,0,0.08)]'">
                <div class="text-[10px] font-bold uppercase tracking-wider mb-1" :class="isDark ? 'text-blue-400' : 'text-blue-600'">Computer Asset Control</div>
                <div class="text-sm font-bold transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">{{ hoveredAsset.hostname }}</div>
            </div>
            
            <div class="flex justify-center mb-3 rounded-lg p-2 overflow-hidden border h-32 transition-colors"
                 :class="isDark ? 'bg-[#1A1C1E] border-white/5' : 'bg-gray-50 border-[rgba(0,0,0,0.08)]'">
                <img 
                    v-if="hoveredAsset.map_image" 
                    :src="getResolvedImageUrl(hoveredAsset.map_image)" 
                    @error="onImageError"
                    class="object-contain h-full w-full rounded" 
                    alt="Asset Image"
                />
                <div v-else class="flex flex-col items-center justify-center text-gray-600 h-full">
                    <svg class="w-8 h-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span class="text-[10px]">No Image</span>
                </div>
            </div>

            <div class="space-y-1.5 text-xs">
                <div class="flex justify-between">
                    <span class="transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">IP:</span>
                    <span class="font-mono transition-colors" :class="isDark ? 'text-blue-400' : 'text-blue-600'">{{ hoveredAsset.ip_address || '-' }}</span>
                </div>
                <div class="flex justify-between">
                    <span class="transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">Owner:</span>
                    <span class="transition-colors" :class="isDark ? 'text-gray-200' : 'text-[#1f1f1f]'">{{ hoveredAsset.owner_name || '-' }}</span>
                </div>
                <div class="flex justify-between">
                    <span class="transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">Dept:</span>
                    <span class="transition-colors" :class="isDark ? 'text-gray-200' : 'text-[#1f1f1f]'">{{ hoveredAsset.department || '-' }}</span>
                </div>
                <div class="flex justify-between">
                    <span class="transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">Fixed Asset:</span>
                    <span class="transition-colors" :class="isDark ? 'text-gray-200' : 'text-[#1f1f1f]'">{{ hoveredAsset.fixed_asset || '-' }}</span>
                </div>
            </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'vue-router';
import { useTheme } from '@/composables/useTheme';
import svgPanZoom from 'svg-pan-zoom';

const { isDark } = useTheme();
const { proxy } = getCurrentInstance();
const $api = proxy.$api; 
const userStore = useUserStore();
const router = useRouter();

const selectedFloor = ref('');
const loading = ref(false);
const assets = ref([]);
const svgObjectRef = ref(null);
const mapContainerRef = ref(null);

const hoveredAsset = ref(null);
const cardPos = ref({ x: 0, y: 0 });

let pzInstance = null;
let baseVb = null;

// Floor configuration
const floorConfig = {
    'B1-1':  { file: 'building1-1st-floor.svg', m: 10, f: 1, yO: 2 },
    'B1-2':  { file: 'building1-2nd-floor.svg', m: 10, f: 1.2, yO: 2 },
    'B2-1':  { file: 'building2-1st-floor.svg', m: 16, f: 2, yO: 3.5 },
    'B2-2':  { file: 'building2-2nd-floor.svg', m: 14, f: 2, yO: 3.5 },
    'B3-1':  { file: 'building3-1st-floor.svg', m: 14, f: 2, yO: 3 },
    'B3-2':  { file: 'building3-2nd-floor.svg', m: 10, f: 2, yO: 2.5 },
    'B4-1':  { file: 'building4-1st-floor.svg', m: 10, f: 2, yO: 2.5 },
    'B4-2':  { file: 'building4-2nd-floor.svg', m: 15, f: 2, yO: 3 },
    'MEC-1': { file: 'MEC-1st-floor.svg',       m: 8, f: 1, yO: 1.2 },
    'MEC-2': { file: 'MEC-2nd-floor.svg',       m: 50, f: 6, yO: 10 } 
};

onMounted(async () => {
    // Admin checking
    if (userStore.userProfile?.role !== 'ADMIN') {
        router.push('/app/dashboard');
    }
});

onBeforeUnmount(() => {
    if (pzInstance) pzInstance.destroy();
});

const refreshData = async () => {
    if (!selectedFloor.value) return;
    await fetchAssets(selectedFloor.value);
    drawMarkers();
};

const loadFloorMap = async () => {
    hoveredAsset.value = null;
    if (!selectedFloor.value) {
        if (pzInstance) {
            pzInstance.destroy();
            pzInstance = null;
        }
        if (svgObjectRef.value) svgObjectRef.value.data = '';
        return;
    }

    loading.value = true;
    const config = floorConfig[selectedFloor.value];
    if (!config) return;

    // Load API data first
    await fetchAssets(selectedFloor.value);

    // Apply SVG file path (adds timestamp to prevent caching issues if needed, but standard is fine)
    svgObjectRef.value.data = `/asset-map/${config.file}`;
};

const fetchAssets = async (floor) => {
    try {
        const token = userStore.getAuthToken;
        const res = await $api.get(`/inventory/map?floor=${floor}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data && res.data.success) {
            assets.value = res.data.data;
        }
    } catch (err) {
        console.error("Fetch API Map Error:", err);
    }
};

const onSvgLoaded = () => {
    if (!selectedFloor.value || !svgObjectRef.value) {
        loading.value = false;
        return;
    }
    
    const svgDoc = svgObjectRef.value.contentDocument;
    if (!svgDoc) {
        loading.value = false;
        return;
    }

    const svg = svgDoc.querySelector('svg');
    if (!svg) {
        loading.value = false;
        return;
    }

    // 1. Get/Set viewBox
    if (!svg.hasAttribute('viewBox')) {
        const box = svg.getBBox();
        svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
    }

    let vb = svg.viewBox.baseVal;
    let origW = vb.width;
    let origH = vb.height;

    // 2. Clear old PanZoom
    if (pzInstance) pzInstance.destroy();

    // 3. Auto-Rotate to Landscape if Portrait
    const isPortrait = origH > origW;
    if (isPortrait) {
        // Swap viewBox to landscape dimensions
        svg.setAttribute('viewBox', `${vb.x} ${vb.y} ${origH} ${origW}`);

        // Wrap existing content in a rotation group
        const wrapper = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'g');
        wrapper.setAttribute('id', 'rotation-wrapper');
        // Rotate 90deg CW and translate back into view
        wrapper.setAttribute('transform', `rotate(90) translate(0, -${origW})`);

        while (svg.firstChild) {
            wrapper.appendChild(svg.firstChild);
        }
        svg.appendChild(wrapper);

        // baseVb for markers (we will draw inside the wrapper, so width/height are original)
        baseVb = { x: vb.x, y: vb.y, width: origW, height: origH, rotated: true };
    } else {
        baseVb = { x: vb.x, y: vb.y, width: origW, height: origH, rotated: false };
    }

    pzInstance = svgPanZoom(svg, {
        zoomEnabled: true,
        panEnabled: true,
        minZoom: 0.5,
        maxZoom: 10,
        controlIconsEnabled: true,
        fit: true,
        center: true
    });

    drawMarkers(svgDoc, svg);
    loading.value = false;
};

const drawMarkers = (doc = null, svgEl = null) => {
    const svgDoc = doc || svgObjectRef.value?.contentDocument;
    const svg = svgEl || svgDoc?.querySelector('svg');
    if (!svgDoc || !svg || !baseVb) return;

    const viewport = svg.querySelector('.svg-pan-zoom_viewport');
    if (!viewport) return;

    // Clear old layer
    const oldLayer = viewport.querySelector('#asset-layer') || svg.querySelector('#asset-layer');
    if (oldLayer) oldLayer.remove();

    const layer = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'g');
    layer.setAttribute('id', 'asset-layer');

    // If we have a rotation wrapper, append to it to maintain coordinate system
    const rotationWrapper = viewport.querySelector('#rotation-wrapper');
    if (rotationWrapper) {
        rotationWrapper.appendChild(layer);
    } else {
        viewport.appendChild(layer);
    }

    const config = floorConfig[selectedFloor.value] || { m: 10, f: 3, yO: 3 };
    const size = config.m;

    // console.log("🛠️ baseVb is =", baseVb);

    console.log(`📦 Found ${assets.value.length} assets to draw on floor: ${selectedFloor.value}`);

    assets.value.forEach(asset => {
        // เช็คพิกัด (ยอมรับ 0 ได้ แต่ไม่เอา null/undefined)
        if (asset.map_x === null || asset.map_y === null || asset.map_x === undefined || asset.map_y === undefined) {
            console.warn(`⚠️ Asset ${asset.hostname} has no coordinates, skipping.`);
            return;
        }

        const rotation = asset.map_rotate || 0;
        const cx = baseVb.x + (Number(asset.map_x) / 100) * baseVb.width;
        const cy = baseVb.y + (Number(asset.map_y) / 100) * baseVb.height;
        
        const g = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${cx}, ${cy})`);
        g.style.cursor = 'pointer';
        g.style.pointerEvents = 'all';

        const iconGroup = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'g');
        iconGroup.setAttribute('transform', `rotate(${rotation}) translate(${-size / 2}, ${-size * 0.45})`);

        // --- 🖥️ Premium Monitor Icon ---
        // 1. Outer Frame (Case)
        const rectFrame = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rectFrame.setAttribute('width', size);
        rectFrame.setAttribute('height', size * 0.7);
        rectFrame.setAttribute('rx', size * 0.08);
        rectFrame.setAttribute('fill', '#1E293B'); // Slate-800
        rectFrame.setAttribute('stroke', '#334155'); // Slate-700
        rectFrame.setAttribute('stroke-width', size * 0.02);

        // 2. Inner Screen (Color Coded)
        const rectScreen = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rectScreen.setAttribute('x', size * 0.06);
        rectScreen.setAttribute('y', size * 0.06);
        rectScreen.setAttribute('width', size * 0.88);
        rectScreen.setAttribute('height', size * 0.52);
        rectScreen.setAttribute('rx', size * 0.03);
        
        // --- 🎨 Dynamic Colors Based on Real-time Status ---
        let screenColor = '#3B82F6'; // Default Blue (Online)
        if (asset.status === 'RED') {
            screenColor = '#EF4444';    // Has Pending Ticket
        } else if (asset.status === 'YELLOW') {
            screenColor = '#F59E0B';    // Offline > 5 mins
        }
        
        rectScreen.setAttribute('fill', screenColor);

        // 3. Screen Glow/Gloss (Top half)
        const rectGlow = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rectGlow.setAttribute('x', size * 0.06);
        rectGlow.setAttribute('y', size * 0.06);
        rectGlow.setAttribute('width', size * 0.88);
        rectGlow.setAttribute('height', size * 0.26);
        rectGlow.setAttribute('rx', size * 0.03);
        rectGlow.setAttribute('fill', 'rgba(255, 255, 255, 0.15)');

        // 4. Stand (Neck)
        const rectNeck = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rectNeck.setAttribute('x', size * 0.45);
        rectNeck.setAttribute('y', size * 0.7);
        rectNeck.setAttribute('width', size * 0.1);
        rectNeck.setAttribute('height', size * 0.1);
        rectNeck.setAttribute('fill', '#0F172A'); // Slate-900

        // 5. Stand (Base)
        const rectBase = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rectBase.setAttribute('x', size * 0.3);
        rectBase.setAttribute('y', size * 0.8);
        rectBase.setAttribute('width', size * 0.4);
        rectBase.setAttribute('height', size * 0.08);
        rectBase.setAttribute('rx', size * 0.04);
        rectBase.setAttribute('fill', '#0F172A'); // Slate-900
        
        iconGroup.appendChild(rectFrame);
        iconGroup.appendChild(rectScreen);
        iconGroup.appendChild(rectGlow);
        iconGroup.appendChild(rectNeck);
        iconGroup.appendChild(rectBase);

        // --- ⚠️ Predictive Maintenance (EOL Indicator) ---
        if (asset.is_near_eol) {
            const eolBadge = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'circle');
            eolBadge.setAttribute('cx', size * 0.9);
            eolBadge.setAttribute('cy', size * 0.1);
            eolBadge.setAttribute('r', size * 0.18);
            eolBadge.setAttribute('fill', '#F97316'); // Orange-500
            eolBadge.setAttribute('stroke', 'white');
            eolBadge.setAttribute('stroke-width', size * 0.04);
            
            const eolText = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'text');
            eolText.setAttribute('x', size * 0.9);
            eolText.setAttribute('y', size * 0.18);
            eolText.setAttribute('font-size', size * 0.25);
            eolText.setAttribute('fill', 'white');
            eolText.setAttribute('text-anchor', 'middle');
            eolText.setAttribute('font-weight', 'bold');
            eolText.setAttribute('font-family', 'sans-serif');
            eolText.textContent = '!';
            
            iconGroup.appendChild(eolBadge);
            iconGroup.appendChild(eolText);
        }

        // Name text with Background for readability
        const textBg = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'rect');
        const textHeight = config.f * 1.5;
        textBg.setAttribute('x', -size * 1);
        textBg.setAttribute('y', size * 0.45 + config.yO - textHeight * 0.8);
        textBg.setAttribute('width', size * 2);
        textBg.setAttribute('height', textHeight);
        textBg.setAttribute('rx', textHeight / 4);
        textBg.setAttribute('fill', 'rgba(255, 255, 255, 0.7)');

        const text = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', 0);
        text.setAttribute('y', size * 0.45 + config.yO);
        text.setAttribute('font-size', config.f);
        text.setAttribute('fill', '#334155'); // Slate-700
        text.setAttribute('font-weight', '600');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-family', 'Inter, sans-serif');
        text.textContent = asset.hostname;

        g.appendChild(iconGroup);
        g.appendChild(textBg);
        g.appendChild(text);

        // Hover Events using Vue state bridge
        g.addEventListener('mouseenter', (e) => {
            const rect = mapContainerRef.value.getBoundingClientRect();
            cardPos.value = {
                x: e.clientX - rect.left + 15,
                y: e.clientY - rect.top + 15
            };
            
            // เพิ่มการคำนวณวันหมดอายุแบบง่ายๆ เพื่อโชว์ใน Tooltip
            if (asset.start_use_date) {
               const start = new Date(asset.start_use_date);
               const eolDate = new Date(start.setFullYear(start.getFullYear() + 5));
               asset.eol_date = eolDate.toLocaleDateString('th-TH');
            }
            
            hoveredAsset.value = asset;
        });

        g.addEventListener('mousemove', (e) => {
             const rect = mapContainerRef.value.getBoundingClientRect();
             cardPos.value = {
                x: e.clientX - rect.left + 15,
                y: e.clientY - rect.top + 15
            };
        });

        g.addEventListener('mouseleave', () => {
            hoveredAsset.value = null;
        });

        g.addEventListener('click', () => {
            // Optional: Click to view details
            router.push(`/app/assets/${asset.computer_id}`);
        });

        layer.appendChild(g);
    });
};

const getResolvedImageUrl = (path) => {
    if (!path) return '';
    // If it's already a full URL
    if (path.startsWith('http')) return path;
    
    // ดึงฐาน URL
    const baseUrl = import.meta.env.VITE_API_URL || '/api';
    const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    
    // แปลง /uploads ให้สามารถต่อกับ /api ได้อย่างถูกต้อง
    const cleanPath = path.startsWith('/uploads') ? path.replace('/uploads', '') : path;
    
    return `${cleanBase}/uploads${cleanPath}`;
};


const onImageError = (e) => {
    e.target.src = '/asset-map/assets/no-image.png';
};
</script>

<style scoped>
object {
    pointer-events: all;
}
</style>

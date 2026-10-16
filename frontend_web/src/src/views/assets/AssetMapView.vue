<template>
  <div class="font-sans max-w-7xl mx-auto text-gray-300 pb-24 h-[calc(100vh-80px)] flex flex-col">
    <!-- Header -->
    <div class="p-6 pb-4 shrink-0 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
      <div>
        <h2 class="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          {{ $t('asset_map') }}
        </h2>
        <p class="text-sm text-gray-500 mt-1">{{ $t('asset_map.subtitle') }}</p>
      </div>

      <!-- Floor Selector -->
      <div class="flex items-center gap-3">
        <label class="text-sm text-gray-400">{{ $t('asset_map.select_building_floor') }}</label>
        <div class="relative group w-48">
          <select 
            v-model="selectedFloor"
            @change="loadFloorMap"
            class="w-full bg-[#1A1C1E] text-gray-200 text-sm rounded-lg border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 pl-4 p-2.5 outline-none transition-all appearance-none cursor-pointer shadow-sm"
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
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
        <button 
          @click="refreshData" 
          class="p-2.5 bg-[#1A1C1E] border border-white/10 rounded-lg hover:bg-[#333538] hover:text-white transition-all text-gray-400 group"
          :title="$t('asset_map.refresh_data')"
        >
          <svg :class="{'animate-spin text-blue-500': loading}" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Map Container -->
    <div class="px-6 flex-1 min-h-[500px] relative flex flex-col">
      <div 
        v-if="!selectedFloor" 
        class="flex-1 rounded-xl bg-[#1A1C1E] border border-dashed border-white/10 flex flex-col items-center justify-center text-gray-500"
      >
        <svg class="w-16 h-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        <p>{{ $t('asset_map.please_select') }}</p>
      </div>

      <div 
        v-show="selectedFloor" 
        class="flex-1 rounded-xl bg-white border border-white/10 overflow-hidden relative shadow-lg"
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
            class="absolute z-20 bg-[#282A2C] border border-white/10 rounded-xl shadow-2xl p-4 w-72 pointer-events-none transition-opacity duration-200"
            :style="{ left: cardPos.x + 'px', top: cardPos.y + 'px' }"
        >
            <div class="border-b border-white/10 pb-2 mb-3">
                <div class="text-[10px] text-blue-400 font-bold uppercase tracking-wider mb-1">Computer Asset Control</div>
                <div class="text-sm font-bold text-white">{{ hoveredAsset.hostname }}</div>
            </div>
            
            <div class="flex justify-center mb-3 bg-[#1A1C1E] rounded-lg p-2 overflow-hidden border border-white/5 h-32">
                <img 
                    v-if="hoveredAsset.map_image" 
                    :src="getResolvedImageUrl(hoveredAsset.map_image)" 
                    @error="onImageError"
                    class="object-contain h-full w-full rounded" 
                    alt="Asset Image"
                />
                <div v-else class="flex flex-col items-center justify-center text-gray-600 h-full">
                    <svg class="w-8 h-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <span class="text-[10px]">No Image</span>
                </div>
            </div>

            <div class="space-y-1.5 text-xs">
                <div class="flex justify-between">
                    <span class="text-gray-500">IP:</span>
                    <span class="text-blue-300 font-mono">{{ hoveredAsset.ip_address || '-' }}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-500">Owner:</span>
                    <span class="text-gray-200">{{ hoveredAsset.owner_name || '-' }}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-500">Dept:</span>
                    <span class="text-gray-200">{{ hoveredAsset.department || '-' }}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-500">Fixed Asset:</span>
                    <span class="text-gray-200">{{ hoveredAsset.fixed_asset || '-' }}</span>
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
import svgPanZoom from 'svg-pan-zoom'; // npm library

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

    // Set viewBox if missing
    if (!svg.hasAttribute('viewBox')) {
        const box = svg.getBBox();
        svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
    }

    const vb = svg.viewBox.baseVal;
    baseVb = { x: vb.x, y: vb.y, width: vb.width, height: vb.height };

    // Reset old PanZoom
    if (pzInstance) pzInstance.destroy();

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
    const oldLayer = viewport.querySelector('#asset-layer');
    if (oldLayer) oldLayer.remove();

    const layer = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'g');
    layer.setAttribute('id', 'asset-layer');
    viewport.appendChild(layer);

    const config = floorConfig[selectedFloor.value] || { m: 10, f: 3, yO: 3 };
    const size = config.m;

    console.log("🛠️ baseVb is =", baseVb);

    assets.value.forEach(asset => {
        if (asset.map_x === null || asset.map_y === null) return;

        const rotation = asset.map_rotate || 0;
        const cx = baseVb.x + (asset.map_x / 100) * baseVb.width;
        const cy = baseVb.y + (asset.map_y / 100) * baseVb.height;
        
        console.log(`📌 Drawing ${asset.hostname} at map_x=${asset.map_x}, cx=${cx}, cy=${cy}`);

        const g = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${cx}, ${cy})`);
        g.style.cursor = 'pointer';
        g.style.pointerEvents = 'all';

        const iconGroup = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'g');
        iconGroup.setAttribute('transform', `rotate(${rotation}) translate(${-size / 2}, ${-size * 0.45})`);

        // Draw Monitor SVG Icon (Blue Rectangle)
        const rectScreen = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rectScreen.setAttribute('width', size);
        rectScreen.setAttribute('height', size * 0.7);
        rectScreen.setAttribute('rx', size * 0.1);
        rectScreen.setAttribute('fill', '#3b82f6'); // Tailwind blue-500
        rectScreen.setAttribute('stroke', '#1e40af'); // Tailwind blue-800
        rectScreen.setAttribute('stroke-width', size * 0.05);

        // Draw Base
        const rectBase = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rectBase.setAttribute('x', size * 0.35);
        rectBase.setAttribute('y', size * 0.75);
        rectBase.setAttribute('width', size * 0.3);
        rectBase.setAttribute('height', size * 0.15);
        rectBase.setAttribute('rx', size * 0.05);
        rectBase.setAttribute('fill', '#0c0c0cff'); // Light Gray stand

        iconGroup.appendChild(rectScreen);
        iconGroup.appendChild(rectBase);

        // Name text
        const text = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', 0);
        text.setAttribute('y', size * 0.45 + config.yO);
        text.setAttribute('font-size', config.f);
        text.setAttribute('fill', '#000000'); // Changed to black
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-family', 'sans-serif');
        text.textContent = asset.hostname;

        g.appendChild(iconGroup);
        g.appendChild(text);

        // Hover Events using Vue state bridge
        g.addEventListener('mouseenter', (e) => {
            const rect = mapContainerRef.value.getBoundingClientRect();
            cardPos.value = {
                x: e.clientX - rect.left + 15,
                y: e.clientY - rect.top + 15
            };
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
    if (!path) return '/asset-map/assets/no-image.png';
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

<template>
  <div class="font-sans max-w-[1400px] mx-auto text-gray-300 pb-24 h-[calc(100vh-80px)] flex flex-col md:flex-row gap-6">
    
    <!-- Left Sidebar: Form -->
    <div class="w-full md:w-80 shrink-0 bg-[#1A1C1E] border border-white/10 rounded-xl p-5 flex flex-col gap-5 h-fit shadow-lg">
        <div>
            <h2 class="text-xl font-bold text-white flex items-center gap-2">
                <svg class="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                {{ $t('asset_map.admin_title') }}
            </h2>
            <p class="text-xs text-gray-500 mt-1">{{ $t('asset_map.admin_subtitle') }}</p>
        </div>

        <div class="space-y-4 flex-1">
            <!-- Select Map -->
            <div>
                <label class="block text-xs font-medium text-gray-400 mb-1.5">{{ $t('asset_map.step_1_select_floor') }}</label>
                <select 
                    v-model="selectedFloor"
                    @change="loadFloorMap"
                    class="w-full bg-[#282A2C] text-gray-200 text-sm rounded-lg border border-white/10 focus:border-purple-500 focus:ring-1 p-2.5 outline-none cursor-pointer"
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
            </div>

            <!-- Select Computer -->
            <div>
                <label class="block text-xs font-medium text-gray-400 mb-1.5">{{ $t('asset_map.step_2_select_comp') }}</label>
                <select 
                    v-model="selectedAssetId"
                    @change="onAssetSelected"
                    class="w-full bg-[#282A2C] text-gray-200 text-sm rounded-lg border border-white/10 focus:border-purple-500 focus:ring-1 p-2.5 outline-none cursor-pointer"
                    :disabled="allAssets.length === 0"
                >
                    <option value="">{{ $t('asset_map.placeholder_comp') }}</option>
                    <option v-for="asset in filteredAssetList" :key="asset.computer_id" :value="asset.computer_id">
                        {{ asset.hostname }} ({{ asset.owner_name || $t('detail.no_owner') }})
                        {{ asset.map_floor ? '📍' : '' }}
                    </option>
                </select>
            </div>

            <div class="bg-[#282A2C] border border-white/5 rounded-lg p-3 space-y-3">
                 <p class="text-[11px] text-yellow-500/80 mb-2 leading-relaxed border-b border-white/5 pb-2">
                    <span class="font-bold">{{ $t('kb.steps') }}:</span> {{ $t('asset_map.instruction') }}
                 </p>
                 
                 <div class="flex gap-2">
                    <div class="flex-1">
                        <label class="block text-[10px] text-gray-500 mb-1">X (%)</label>
                        <input type="number" step="0.01" v-model="formData.map_x" class="w-full bg-[#1A1C1E] text-white text-xs p-2 rounded border border-white/10" readonly>
                    </div>
                    <div class="flex-1">
                        <label class="block text-[10px] text-gray-500 mb-1">Y (%)</label>
                        <input type="number" step="0.01" v-model="formData.map_y" class="w-full bg-[#1A1C1E] text-white text-xs p-2 rounded border border-white/10" readonly>
                    </div>
                 </div>
                 
                 <div>
                    <label class="block text-[10px] text-gray-500 mb-1">{{ $t('asset_map.label_rotate') }}</label>
                    <div class="flex items-center gap-2">
                         <input type="range" v-model.number="formData.map_rotate" min="-90" max="180" step="90" class="flex-1 accent-purple-500">
                         <span class="text-xs text-white font-mono w-8 text-right">{{ formData.map_rotate }}°</span>
                    </div>
                 </div>

                 <div>
                    <label class="block text-[10px] text-gray-500 mb-1">{{ $t('asset_map.label_place') }}</label>
                    <input type="text" v-model="formData.map_place" placeholder="ex. PRODUCTION OFFICE" class="w-full bg-[#1A1C1E] text-white text-xs p-2 rounded border border-white/10 outline-none focus:border-purple-500">
                 </div>
                 
                 <div>
                    <label class="block text-[10px] text-gray-500 mb-1">{{ $t('asset_map.label_image') }}</label>
                    <input type="text" v-model="formData.map_image" placeholder="/uploads/asset-map/xxx.jpg" class="w-full bg-[#1A1C1E] text-white text-xs p-2 rounded border border-white/10 outline-none focus:border-purple-500">
                 </div>
            </div>
        </div>

        <button 
           @click="saveLocation"
           class="w-full bg-purple-600 hover:bg-purple-500 text-white font-medium py-2.5 rounded-lg transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
           :disabled="!isValidForm || saving"
        >
            <svg v-if="saving" class="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            {{ saving ? $t('login.btn_loading') : $t('asset_map.btn_save') }}
        </button>

    </div>

    <!-- Right Area: SVG Viewport -->
    <div class="flex-1 flex flex-col bg-white rounded-xl overflow-hidden relative border border-white/10 shadow-lg min-h-[500px]">
        <!-- Loading Overlay -->
        <div v-if="loadingMap" class="absolute inset-0 bg-black/50 z-10 flex items-center justify-center backdrop-blur-sm">
           <svg class="animate-spin h-8 w-8 text-blue-500" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        </div>

        <div v-if="!selectedFloor" class="absolute inset-0 flex items-center justify-center bg-[#1A1C1E] text-gray-500 z-0">
             <div class="flex-1 flex flex-col items-center justify-center text-gray-500 gap-4">
             <svg class="h-20 w-20 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
             <p class="text-sm tracking-widest uppercase">{{ $t('asset_map.msg_select_to_pin') }}</p>
        </div>
        </div>

        <object 
          ref="svgObjectRef"
          type="image/svg+xml"
          class="w-full h-full z-0"
          @load="onSvgLoaded"
          v-show="selectedFloor"
        ></object>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, getCurrentInstance } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '@/stores/userStore';
import { useModalStore } from '@/stores/modalStore';
import svgPanZoom from 'svg-pan-zoom';

const { t } = useI18n();

const { proxy } = getCurrentInstance();
const $api = proxy.$api; 
const userStore = useUserStore();
const modal = useModalStore();
const router = useRouter();

// State
const allAssets = ref([]);
const mappedAssets = ref([]); // Assets already drawn on map
const selectedFloor = ref('');
const selectedAssetId = ref('');
const loadingMap = ref(false);
const saving = ref(false);
const svgObjectRef = ref(null);

let pzInstance = null;
let baseVb = null;

// Form Data bindings
const formData = ref({
    map_x: null,
    map_y: null,
    map_rotate: 0,
    map_place: '',
    map_image: ''
});

// Floor configuration
const floorConfig = {
    'B1-1':  { file: 'building1-1st-floor.svg', m: 9, f: 1, yO: 1.5 },
    'B1-2':  { file: 'building1-2nd-floor.svg', m: 10, f: 1.2, yO: 1.8 },
    'B2-1':  { file: 'building2-1st-floor.svg', m: 16, f: 2, yO: 2.5 },
    'B2-2':  { file: 'building2-2nd-floor.svg', m: 14, f: 2, yO: 2.2 },
    'B3-1':  { file: 'building3-1st-floor.svg', m: 14, f: 2, yO: 2.5 },
    'B3-2':  { file: 'building3-2nd-floor.svg', m: 10, f: 1.2, yO: 1.8 },
    'B4-1':  { file: 'building4-1st-floor.svg', m: 10, f: 1.2, yO: 1.8 },
    'B4-2':  { file: 'building4-2nd-floor.svg', m: 15, f: 2, yO: 2.5 },
    'MEC-1': { file: 'MEC-1st-floor.svg',       m: 8, f: 1, yO: 1.2 },
    'MEC-2': { file: 'MEC-2nd-floor.svg',       m: 50, f: 6, yO: 8 } 
};

const isValidForm = computed(() => {
    return selectedFloor.value && selectedAssetId.value && formData.value.map_x !== null && formData.value.map_y !== null;
});

// เรียงให้เครื่องที่ยังไม่ถูกปักหมุดขึ้นก่อน
const filteredAssetList = computed(() => {
    return [...allAssets.value].sort((a, b) => {
        if (!a.map_floor && b.map_floor) return -1;
        if (a.map_floor && !b.map_floor) return 1;
        return a.hostname.localeCompare(b.hostname);
    });
});

onMounted(async () => {
    if (userStore.userProfile?.role !== 'ADMIN') {
        router.push('/app/dashboard');
        return;
    }
    await fetchAllAssets();
});

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

onBeforeUnmount(() => {
    if (pzInstance) pzInstance.destroy();
});

const getAuthOptions = () => {
    const token = userStore.getAuthToken;
    return { headers: { Authorization: `Bearer ${token}` } };
};

// ดึง List Computer ทั้งหมดมาเตรียมไว้
const fetchAllAssets = async () => {
    try {
        const res = await $api.get('/inventory', getAuthOptions());
        if (res.data && res.data.success) {
            allAssets.value = res.data.data;
        }
    } catch (err) {
        console.error(err);
    }
};

// ดึง Asset เฉพาะที่ถูกปักหมุดบนชั้นนี้มาแสดง
const fetchMappedAssets = async (floor) => {
    try {
        const res = await $api.get(`/inventory/map?floor=${floor}`, getAuthOptions());
        if (res.data && res.data.success) {
            mappedAssets.value = res.data.data;
        }
    } catch (err) {
        console.error(err);
    }
};

const onAssetSelected = () => {
    const asset = allAssets.value.find(a => a.computer_id === selectedAssetId.value);
    if (!asset) {
        resetForm();
        return;
    }
    // ดึงค่าเก่ามาแสดงถ้ามี
    if (asset.map_floor === selectedFloor.value && asset.map_x !== null) {
        formData.value.map_x = asset.map_x;
        formData.value.map_y = asset.map_y;
        formData.value.map_rotate = asset.map_rotate || 0;
        formData.value.map_place = asset.map_place || '';
        formData.value.map_image = asset.map_image || '';
        drawMarkers(); // รีวาดเพื่อให้เห็นตำแหน่งปัจจุบัน
    } else {
        // ค่า Default ถ้าไม่เคยปัก
        formData.value.map_x = null;
        formData.value.map_y = null;
        formData.value.map_rotate = 0;
        formData.value.map_place = '';
        formData.value.map_image = asset.hostname ? `/uploads/asset-map/${asset.hostname}.jpg` : '';
        // ลบหมุด Target อันก่อนถ้ามี
        clearTargetMarker();
    }
};

const resetForm = () => {
    formData.value = { map_x: null, map_y: null, map_rotate: 0, map_place: '', map_image: '' };
    clearTargetMarker();
};

const loadFloorMap = async () => {
    resetForm();
    selectedAssetId.value = '';

    if (!selectedFloor.value) {
        if (pzInstance) pzInstance.destroy();
        if (svgObjectRef.value) svgObjectRef.value.data = '';
        return;
    }

    loadingMap.value = true;
    const config = floorConfig[selectedFloor.value];
    if (!config) return;

    await fetchMappedAssets(selectedFloor.value);
    svgObjectRef.value.data = `/asset-map/${config.file}`;
};

const onSvgLoaded = () => {
    if (!selectedFloor.value || !svgObjectRef.value) {
         loadingMap.value = false; return;
    }
    
    const svgDoc = svgObjectRef.value.contentDocument;
    if (!svgDoc) { loadingMap.value = false; return; }

    const svg = svgDoc.querySelector('svg');
    if (!svg) { loadingMap.value = false; return; }

    if (!svg.hasAttribute('viewBox')) {
        const box = svg.getBBox();
        svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
    }

    const vb = svg.viewBox.baseVal;
    baseVb = { x: vb.x, y: vb.y, width: vb.width, height: vb.height };
    
    if (pzInstance) pzInstance.destroy();

    pzInstance = svgPanZoom(svg, {
        zoomEnabled: true, panEnabled: true,
        minZoom: 0.5, maxZoom: 10,
        controlIconsEnabled: true,
        fit: true, center: true,
        eventsListenerElement: svg
    });

    // 🎯 ดัก Event Click
    svg.addEventListener('click', onSvgClick);

    drawMarkers(svgDoc, svg);
    loadingMap.value = false;
};

// เมื่อ Admin คลิกบนแปลน SVG
const onSvgClick = (e) => {
    if (!selectedFloor.value || !selectedAssetId.value) return; // ต้องเลือกเครื่องก่อน

    const svgDoc = svgObjectRef.value.contentDocument;
    const svg = svgDoc.querySelector('svg');
    const viewport = svg.querySelector('.svg-pan-zoom_viewport');
    if (!viewport || !baseVb) return;

    // สร้างจุด
    const pt = svg.createSVGPoint();
    pt.x = e.offsetX; // ใช้พิกัดสัมพัทธ์ในกรอบ
    pt.y = e.offsetY;

    // Inverse Matrix หาพิกัดบน ViewBox ดั้งเดิม
    const p = pt.matrixTransform(viewport.getScreenCTM().inverse());
    
    // เทียบสัดส่วนกับ viewBox 
    // หมายเหตุ: p.x จะเป็นขนาดอิสระ ให้หาเทียบบัญญัติไตรยางศ์จากความกว้าง/สูง viewBox
    const xPercent = ((p.x - baseVb.x) / baseVb.width) * 100;
    const yPercent = ((p.y - baseVb.y) / baseVb.height) * 100;

    formData.value.map_x = parseFloat(xPercent.toFixed(2));
    formData.value.map_y = parseFloat(yPercent.toFixed(2));

    drawTargetMarker(svgDoc, viewport, p.x, p.y);
};

const clearTargetMarker = () => {
    const svgDoc = svgObjectRef.value?.contentDocument;
    if (!svgDoc) return;
    const existing = svgDoc.querySelector('#target-marker');
    if (existing) existing.remove();
};

const drawTargetMarker = (svgDoc, viewport, cx, cy) => {
    clearTargetMarker();
    
    const size = floorConfig[selectedFloor.value]?.m || 10;
    
    const g = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('id', 'target-marker');
    g.setAttribute('transform', `translate(${cx}, ${cy})`);
    g.style.pointerEvents = 'none';

    const renderScale = pzInstance ? pzInstance.getSizes().realZoom : 1;
    const unscale = 1 / renderScale; // Make sure it's visible relative to zoom if needed

    // วาด Pin สีแดง
    const circle = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('r', size);
    circle.setAttribute('fill', 'rgba(239, 68, 68, 0.5)'); // Red-500 trans
    circle.setAttribute('stroke', '#b91c1c'); // Red-700
    circle.setAttribute('stroke-width', size * 0.1);

    // Cross pattern
    const line1 = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'line');
    line1.setAttribute('x1', -size*1.5); line1.setAttribute('y1', 0);
    line1.setAttribute('x2', size*1.5); line1.setAttribute('y2', 0);
    line1.setAttribute('stroke', '#b91c1c');
    line1.setAttribute('stroke-width', size * 0.1);

    const line2 = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'line');
    line2.setAttribute('x1', 0); line2.setAttribute('y1', -size*1.5);
    line2.setAttribute('x2', 0); line2.setAttribute('y2', size*1.5);
    line2.setAttribute('stroke', '#b91c1c');
    line2.setAttribute('stroke-width', size * 0.1);

    g.appendChild(circle);
    g.appendChild(line1);
    g.appendChild(line2);
    
    viewport.appendChild(g);
};

// วาด Marker เดิมที่มีอยู่แล้วบน MAP 
const drawMarkers = (doc = null, svgEl = null) => {
    const svgDoc = doc || svgObjectRef.value?.contentDocument;
    const svg = svgEl || svgDoc?.querySelector('svg');
    if (!svgDoc || !svg || !baseVb) return;

    const viewport = svg.querySelector('.svg-pan-zoom_viewport');
    if (!viewport) return;

    let layer = viewport.querySelector('#asset-layer');
    if (layer) layer.remove();

    layer = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'g');
    layer.setAttribute('id', 'asset-layer');
    viewport.appendChild(layer);

    const config = floorConfig[selectedFloor.value] || { m: 10, f: 3, yO: 3 };
    const size = config.m;

    mappedAssets.value.forEach(asset => {
        // ซ่อน marker ของเครื่องที่กำลังตั้งค่า เพื่อไม่ให้ทับกับ Target Marker
        if (asset.computer_id === selectedAssetId.value && formData.value.map_x !== null) return;
        
        if (asset.map_x === null || asset.map_y === null) return;

        const rotation = asset.map_rotate || 0;
        const cx = baseVb.x + (asset.map_x / 100) * baseVb.width;
        const cy = baseVb.y + (asset.map_y / 100) * baseVb.height;

        const g = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${cx}, ${cy})`);
        
        const iconGroup = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'g');
        iconGroup.setAttribute('transform', `rotate(${rotation}) translate(${-size / 2}, ${-size * 0.45})`);

        // วาดสีเทาหม่นๆ สำหรับเครื่องคนอื่น (ช่วยให้ของที่เรากำลังลางชัดเจนขึ้น)
        const rectScreen = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rectScreen.setAttribute('width', size);
        rectScreen.setAttribute('height', size * 0.7);
        rectScreen.setAttribute('rx', size * 0.1);
        rectScreen.setAttribute('fill', '#6b7280'); // Gray-500
        rectScreen.setAttribute('stroke', '#374151'); // Gray-700
        rectScreen.setAttribute('stroke-width', size * 0.05);

        iconGroup.appendChild(rectScreen);
        
        const text = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', 0);
        text.setAttribute('y', size * 0.45 + config.yO);
        text.setAttribute('font-size', config.f);
        text.setAttribute('fill', '#374151'); // Dark Gray / Black
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-family', 'sans-serif');
        text.textContent = asset.hostname;

        g.appendChild(iconGroup);
        g.appendChild(text);

        layer.appendChild(g);
    });

    // วาด Target ซ้ำถ้ามี (กรณีตอนรีเฟรช drawMarkers แล้วต้องการให้ Target ยังอยู่)
    if (formData.value.map_x !== null && formData.value.map_y !== null) {
        const cxTarget = baseVb.x + (formData.value.map_x / 100) * baseVb.width;
        const cyTarget = baseVb.y + (formData.value.map_y / 100) * baseVb.height;
        drawTargetMarker(svgDoc, viewport, cxTarget, cyTarget);
    }
};

const saveLocation = async () => {
    if (!isValidForm.value) return;

    try {
        saving.value = true;
        const payload = {
            map_floor: selectedFloor.value,
            map_x: formData.value.map_x,
            map_y: formData.value.map_y,
            map_rotate: formData.value.map_rotate,
            map_place: formData.value.map_place,
            map_image: formData.value.map_image
        };

        const res = await $api.put(`/inventory/${selectedAssetId.value}/map`, payload, getAuthOptions());
        
        if (res.data && res.data.success) {
            await modal.alert(t('asset_map.msg_save_success'), t('asset_map.msg_save_success'), 'success');
            
            // อัปเดต List Local โดยไม่ต้อง Query ทั้งก้อนใหม่
            const assetIndex = allAssets.value.findIndex(a => a.computer_id === selectedAssetId.value);
            if(assetIndex > -1){
                 allAssets.value[assetIndex] = { ...allAssets.value[assetIndex], ...payload };
            }
            // รีเฟรช Map
            await fetchMappedAssets(selectedFloor.value);
            drawMarkers(); 
        }
    } catch (err) {
        console.error(err);
        modal.alert(t('asset_map.msg_save_error'), 'Error', 'error');
    } finally {
        saving.value = false;
    }
};

</script>

<style scoped>
object {
    pointer-events: all;
    user-select: none;
}
</style>

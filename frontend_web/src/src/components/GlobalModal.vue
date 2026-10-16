<template>
  <Transition name="fade">
    <div v-if="store.isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" @click="store.type === 'alert' ? store.handleCancel() : null"></div>

      <div class="relative bg-[#1E1F20] border border-white/10 w-full max-w-sm rounded-3xl shadow-2xl transform transition-all p-6 text-center">
        
        <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4"
          :class="{
            'bg-green-500/10 text-green-500': store.status === 'success',
            'bg-red-500/10 text-red-500': store.status === 'error',
            'bg-yellow-500/10 text-yellow-500': store.status === 'warning',
            'bg-blue-500/10 text-blue-500': store.status === 'info',
            // ✅ ใช้สีน้ำเงินสำหรับการแจ้งเตือน Session Expired
            'bg-blue-500/10 text-blue-500': store.status === 'session_expired', 
          }"
        >
          <svg v-if="store.status === 'success'" xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
          <svg v-if="store.status === 'error'" xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          <svg v-if="store.status === 'warning'" xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          <svg v-if="store.status === 'info' || store.status === 'session_expired'" xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
        </div>

        <h3 class="text-xl font-bold text-white mb-2">{{ store.title }}</h3>
        <p class="text-gray-400 text-sm mb-6">{{ store.message }}</p>

        <div class="flex gap-3 justify-center">
          <button 
            v-if="store.type === 'confirm'"
            @click="store.handleCancel"
            class="px-5 py-2.5 rounded-xl text-gray-300 bg-[#282A2C] hover:bg-[#323436] transition-colors font-medium text-sm w-full"
          >
            {{ $t('modal.btn_cancel') }}
          </button>

          <button 
            @click="handleConfirmAction" 
            class="px-5 py-2.5 rounded-xl text-white transition-colors font-medium text-sm w-full shadow-lg"
            :class="{
              'bg-green-600 hover:bg-green-500 shadow-green-500/20': store.status === 'success' || store.type === 'alert',
              'bg-red-600 hover:bg-red-500 shadow-red-500/20': store.status === 'error',
              // ✅ ใช้สีน้ำเงิน/ฟ้า สำหรับ Session Expired
              'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20': store.status === 'info' || store.status === 'session_expired', 
              'bg-yellow-600 hover:bg-yellow-500 shadow-yellow-500/20': store.status === 'warning',
            }"
          >
            {{ store.type === 'confirm' ? $t('modal.btn_confirm') : $t('modal.btn_ok') }}
          </button>
        </div>

      </div>
    </div>
  </Transition>
</template>

<script setup>
import { useModalStore } from '@/stores/modalStore';
import { useI18n } from 'vue-i18n';
// ✅ Import Router เพื่อใช้ Redirect
import { useRouter } from 'vue-router'; 

const { t } = useI18n();
const store = useModalStore();
const router = useRouter(); // ✅ รับ Router instance

// ✅ ฟังก์ชันจัดการ Action ของปุ่มยืนยัน
const handleConfirmAction = () => {
    // 1. ตรวจสอบสถานะ: ถ้าเป็น session_expired ให้สั่ง Redirect
    if (store.status === 'session_expired') {
        // ปิด modal
        store.handleConfirm(); 
        // 2. สั่ง Redirect ไปหน้า Login (Path คือ '/')
        router.push('/'); 
        return; 
    }

    // 3. ถ้าไม่ใช่ session_expired ให้ทำตามปกติ
    store.handleConfirm();
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
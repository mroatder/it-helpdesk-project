import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useModalStore = defineStore('modal', () => {
  // State
  const isOpen = ref(false);
  const type = ref('alert'); // 'alert' หรือ 'confirm'
  const status = ref('info'); // 'success', 'error', 'warning', 'info'
  const title = ref('');
  const message = ref('');
  
  // Promise Control (เพื่อให้ใช้ await confirm() ได้)
  let resolvePromise = null;

  // Action: เปิดแจ้งเตือนธรรมดา
  const alert = (msg, ttl = 'แจ้งเตือน', stat = 'info') => {
    type.value = 'alert';
    message.value = msg;
    title.value = ttl;
    status.value = stat;
    isOpen.value = true;
    
    return new Promise((resolve) => {
      resolvePromise = resolve;
    });
  };

  // Action: เปิดหน้าต่างยืนยัน (มีปุ่ม Yes/No)
  const confirm = (msg, ttl = 'ยืนยันการทำรายการ') => {
    type.value = 'confirm';
    message.value = msg;
    title.value = ttl;
    status.value = 'warning';
    isOpen.value = true;

    return new Promise((resolve) => {
      resolvePromise = resolve;
    });
  };

  // Internal: เมื่อ User กดปุ่ม
  const handleConfirm = () => {
    isOpen.value = false;
    if (resolvePromise) resolvePromise(true);
  };

  const handleCancel = () => {
    isOpen.value = false;
    if (resolvePromise) resolvePromise(false);
  };

  return { 
    isOpen, type, status, title, message, 
    alert, confirm, handleConfirm, handleCancel 
  };
});
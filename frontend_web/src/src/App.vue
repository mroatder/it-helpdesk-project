<script setup>
import { provide, ref } from 'vue';
import { RouterView } from 'vue-router';

// 1. สร้างตัวแปรกลาง ชื่อ isCollapsed (เก็บค่า จริง/เท็จ)
const isSidebarCollapsed = ref(false);

// 2. สร้างฟังก์ชันสลับค่า (Toggle)
const toggleSidebar = () => {
    isSidebarCollapsed.value = !isSidebarCollapsed.value;
};

// 3. ส่งตัวแปรนี้ออกไปให้ทุกไฟล์ในโปรเจกต์ใช้ได้ (Provide)
provide('isCollapsed', isSidebarCollapsed);
provide('toggleSidebar', toggleSidebar);

import GlobalModal from '@/components/GlobalModal.vue'; // อย่าลืม Import
import { onMounted } from 'vue';
import { useUserStore } from '@/stores/userStore';

const userStore = useUserStore();

onMounted(() => {
  // Logic เดิมของคุณ เช่น Load User
  userStore.loadUserFromStorage();
});
</script>
<template>
  <router-view />
  <GlobalModal />
</template>

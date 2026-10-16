<template>
  <div 
    class="custom-scroll-wrapper" 
    :class="{ 'is-scrolling': isScrolling }"
    @scroll="handleScroll"
  >
    <div class="scroll-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const isScrolling = ref(false);
let scrollTimeout = null;

const handleScroll = () => {
  // เมื่อมีการ scroll ให้แสดงแถบขึ้นมา
  isScrolling.value = true;

  // เคลียร์ Timeout เก่า
  if (scrollTimeout) clearTimeout(scrollTimeout);

  // ถ้าหยุด scroll ไป 1.5 วินาที ให้ซ่อนแถบ
  scrollTimeout = setTimeout(() => {
    isScrolling.value = false;
  }, 1500);
};
</script>

<style scoped>
.custom-scroll-wrapper {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  /* สำหรับ Firefox */
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
  transition: scrollbar-color 0.3s ease;
}

/* แสดง Scrollbar ใน Firefox เมื่อมีการ scroll หรือ hover */
.custom-scroll-wrapper:hover,
.custom-scroll-wrapper.is-scrolling {
  scrollbar-color: rgba(107, 114, 128, 0.4) transparent;
}

/* --- สำหรับ Chrome, Safari, Edge --- */

/* 1. ขนาดของ Scrollbar */
.custom-scroll-wrapper::-webkit-scrollbar {
  width: 6px;
}

/* 2. พื้นหลัง Scrollbar (Track) - ให้โปร่งใสเสมอ */
.custom-scroll-wrapper::-webkit-scrollbar-track {
  background: transparent;
}

/* 3. ตัวเลื่อน (Thumb) - ปกติให้โปร่งใส */
.custom-scroll-wrapper::-webkit-scrollbar-thumb {
  background: transparent;
  border-radius: 10px;
  transition: background 0.4s ease;
}

/* 4. แสดงตัวเลื่อนเมื่อมีการ Hover ที่ Container หรือกำลัง Scrolling */
.custom-scroll-wrapper:hover::-webkit-scrollbar-thumb,
.custom-scroll-wrapper.is-scrolling::-webkit-scrollbar-thumb {
  background: rgba(107, 114, 128, 0.3); /* สีเทาจางๆ */
}

/* 5. เมื่อเอาเมาส์ไปวางบนตัว Scrollbar โดยตรง ให้เข้มขึ้น */
.custom-scroll-wrapper::-webkit-scrollbar-thumb:hover {
  background: rgba(107, 114, 128, 0.6) !important;
}

.scroll-content {
  width: 100%;
}
</style>
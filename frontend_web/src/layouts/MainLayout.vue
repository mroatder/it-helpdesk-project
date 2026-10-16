<template>
  <div 
    class="flex h-screen overflow-hidden transition-colors duration-300"
    :class="isDark ? 'bg-[#4e4e4e] text-[#E3E3E3]' : 'bg-[#f0f4f9] text-[#1f1f1f]'"
  > 
    
    <Sidebar />

    <main class="flex-1 min-w-0 relative">
      <CustomScroll>
        <router-view /> 
      </CustomScroll>
    </main>

  </div>
</template>

<script setup>
import Sidebar from '../components/Sidebar.vue'
import CustomScroll from '../components/CustomScroll.vue' 
import { useTheme } from '@/composables/useTheme'

const { isDark } = useTheme()
</script>

<style scoped>
/* ลบ .scrollbar-hide เดิมออกครับ 
   เราจะใช้ scrollbar สวยๆ จาก CustomScroll แทน 
*/
</style>
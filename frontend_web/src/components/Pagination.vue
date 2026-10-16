<template>
  <div v-if="totalPages > 0" class="flex flex-col items-center ">
    
    <nav class="relative z-0 inline-flex gap-2" aria-label="Pagination">
      
      <button 
        @click="changePage(currentPage - 1)"
        :disabled="currentPage === 1"
        :class="[
          currentPage === 1 ? 'cursor-not-allowed text-gray-400' : (isDark ? 'text-gray-300 hover:bg-[#38383A]' : 'text-gray-700 hover:bg-gray-200'),
          isDark ? 'bg-[#282A2C] border-white/5' : 'bg-gray-100 border-gray-200'
        ]"
        class="relative inline-flex items-center rounded-full px-3 py-2 text-sm font-medium transition-colors duration-150 border"
      >
        <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
      </button>

      <div v-for="page in visiblePages" :key="page">
        <button
          v-if="page === '...'"
          class="relative inline-flex items-center px-3 py-2 text-sm font-medium bg-transparent text-gray-400 transition-colors duration-150 cursor-default rounded-full"
        >
          ...
        </button>
        <button
          v-else
          @click="changePage(page)"
          :aria-current="page === currentPage ? 'page' : undefined"
          class="relative inline-flex items-center w-9 h-9 justify-center text-sm font-medium transition-colors duration-150 rounded-full border"
          :class="[
            page === currentPage 
              ? 'bg-[#004A77] text-white z-10 ring-2 ring-blue-500/50 border-blue-500' 
              : (isDark ? 'bg-[#282A2C] text-gray-300 hover:bg-[#38383A] border-white/5' : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-200')
          ]" 
        >
          {{ page }}
        </button>
      </div>

      <button 
        @click="changePage(currentPage + 1)"
        :disabled="currentPage === totalPages"
        :class="[
          currentPage === totalPages ? 'cursor-not-allowed text-gray-400' : (isDark ? 'text-gray-300 hover:bg-[#38383A]' : 'text-gray-700 hover:bg-gray-200'),
          isDark ? 'bg-[#282A2C] border-white/5' : 'bg-gray-100 border-gray-200'
        ]"
        class="relative inline-flex items-center rounded-full px-3 py-2 text-sm font-medium transition-colors duration-150 border"
      >
        <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10l-3.293-3.293a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" /></svg>
      </button>
    </nav>
    
    <div class="flex justify-center items-center mt-3">
      <p class="text-sm transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">
        {{ $t('pagination.page') }} <span class="font-bold transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">{{ currentPage }}</span> {{ $t('pagination.from') }} <span class="font-bold transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">{{ totalPages }}</span>
      </p>
    </div>

  </div>
</template>

<script setup>
import { computed, defineProps, defineEmits } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTheme } from '@/composables/useTheme';

const { isDark } = useTheme();
const { t } = useI18n();
const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
  },
  totalPages: {
    type: Number,
    required: true,
  },
  maxPagesToShow: {
    type: Number,
    default: 5, // จำนวนปุ่มหน้าที่จะแสดง (ไม่นับ ...)
  },
});

const emits = defineEmits(['page-changed']);

const changePage = (page) => {
  if (page >= 1 && page <= props.totalPages) {
    emits('page-changed', page);
  }
};

// Logic คำนวณช่วงของเลขหน้าที่จะแสดง (เหมือนเดิม)
const visiblePages = computed(() => {
  const pages = [];
  const startPage = Math.max(1, props.currentPage - Math.floor(props.maxPagesToShow / 2));
  const endPage = Math.min(props.totalPages, startPage + props.maxPagesToShow - 1);
  
  if (startPage > 1) {
    pages.push(1);
    if (startPage > 2) {
      pages.push('...');
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  if (endPage < props.totalPages) {
    if (endPage < props.totalPages - 1) {
      pages.push('...');
    }
    if (!pages.includes(props.totalPages)) {
      pages.push(props.totalPages);
    }
  }

  return pages;
});
</script>
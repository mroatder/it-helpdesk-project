<template>
  <div class="pt-2 font-sans">
    <div class="flex justify-between items-start w-full relative">
      
      <div v-for="(step, index) in workflowSteps" :key="step.key" class="flex-1 relative z-10">
        
        <div 
          v-if="index > 0" 
          class="absolute h-0.5 top-3.5 left-0 w-1/2 transition-colors duration-500 z-0" 
          :class="isStepComplete(workflowSteps[index - 1].key, currentStatus) ? 'bg-emerald-600' : 'bg-gray-700'">
        </div>

        <div 
          v-if="index < workflowSteps.length - 1" 
          class="absolute h-0.5 top-3.5 right-0 w-1/2 transition-colors duration-500 z-0" 
          :class="isStepComplete(step.key, currentStatus) ? 'bg-emerald-600' : 'bg-gray-700'">
        </div>
        
        <div class="flex flex-col items-center relative z-20">
          
          <div 
            class="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg border-2 border-current"
            :class="getStatusClass(step.key, currentStatus).circleBg">
            <component 
              :is="step.icon" 
              class="w-4 h-4 transition-colors duration-300" 
              :class="getStatusClass(step.key, currentStatus).iconColor"
            />
          </div>
          
          <p class="mt-2.5 text-center text-[11px] font-medium transition-colors duration-300 w-24 uppercase tracking-wide"
             :class="getStatusClass(step.key, currentStatus).textColor">
            <!-- ✅ ใช้ $t(step.label) เพื่อดึงคีย์การแปล -->
            {{ $t(step.label) }}
          </p>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';
import { useI18n } from 'vue-i18n'; // ✅ Import useI18n
import { 
  CheckCircleIcon, 
  ArrowRightCircleIcon, 
  BriefcaseIcon, 
  ClipboardDocumentListIcon, 
  WrenchScrewdriverIcon,
  TruckIcon,
  ClockIcon
} from '@heroicons/vue/24/outline';

const { t } = useI18n(); // ✅ Use t function

const props = defineProps({
  currentStatus: {
    type: String,
    required: true,
    default: 'OPEN'
  }
});

// ข้อมูล Workflow (อ้างอิงจาก tickets.status ใน Database)
// ✅ ใช้ Key ที่เรากำหนดไว้ในไฟล์ JSON
const workflowSteps = [
    { key: 'OPEN', label: 'timeline.open', icon: ClipboardDocumentListIcon },
    { key: 'ASSIGNED', label: 'timeline.assigned', icon: ArrowRightCircleIcon },
    { key: 'IN PROGRESS', label: 'timeline.in_progress', icon: WrenchScrewdriverIcon },
    { key: 'WAITING_PART', label: 'timeline.waiting_part', icon: ClockIcon }, 
    { key: 'RESOLVED', label: 'timeline.resolved', icon: CheckCircleIcon },
    { key: 'CLOSED', label: 'timeline.closed', icon: BriefcaseIcon }
];

// Logic สำหรับกำหนดสี (ใช้สี Emerald-600 สำหรับ Complete)
const getStatusClass = (stepKey, currentStatus) => {
  const statusOrder = ['OPEN', 'ASSIGNED', 'IN PROGRESS', 'WAITING_PART', 'RESOLVED', 'CLOSED'];
  const stepIndex = statusOrder.indexOf(stepKey);
  const currentIndex = statusOrder.indexOf(currentStatus);
  
  const isComplete = stepIndex < currentIndex;
  const isActive = stepKey === currentStatus;

  if (isComplete) {
    return { 
      circleBg: 'bg-emerald-600 border-emerald-600', 
      iconColor: 'text-white', 
      textColor: 'text-gray-500', 
    };
  } else if (isActive) {
    return { 
      circleBg: 'bg-blue-600 border-blue-600 ring-2 ring-blue-400/50', 
      iconColor: 'text-white', 
      textColor: 'text-white font-medium', 
    };
  } else {
    return { 
      circleBg: 'bg-gray-700 border-gray-700', 
      iconColor: 'text-gray-400', 
      textColor: 'text-gray-600', 
    };
  }
};

const isStepComplete = (stepKey, currentStatus) => {
    const statusOrder = ['OPEN', 'ASSIGNED', 'IN PROGRESS', 'WAITING_PART', 'RESOLVED', 'CLOSED'];
    const stepIndex = statusOrder.indexOf(stepKey);
    const currentIndex = statusOrder.indexOf(currentStatus);
    return stepIndex < currentIndex;
};
</script>
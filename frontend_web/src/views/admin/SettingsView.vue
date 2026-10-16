<template>
  <div class="p-6 font-sans max-w-5xl mx-auto pb-24 transition-colors">
    
    <h2 class="text-3xl font-bold tracking-tight mb-2 transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">
      {{ $t('settings.title') }}
    </h2>
    <p class="mb-8 text-sm transition-colors" :class="isDark ? 'text-gray-400' : 'text-[#727775]'">{{ $t('settings.subtitle') }}</p>

    <!-- Loading Overlay -->
    <div v-if="loading" class="p-10 rounded-xl flex flex-col items-center justify-center min-h-[400px] shadow-sm border transition-colors"
         :class="isDark ? 'bg-[#282A2C] border-white/5' : 'bg-white border-[rgba(0,0,0,0.12)]'">
        <svg class="animate-spin h-8 w-8 text-blue-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <p class="transition-colors" :class="isDark ? 'text-gray-400' : 'text-[#444746]'">{{ $t('settings.loading') }}</p>
    </div>

    <!-- Settings Form -->
    <form v-else @submit.prevent="saveSettings" class="space-y-8">
      
      <!-- 1. General & IT Staff Settings -->
      <section class="p-8 rounded-3xl shadow-xl border transition-colors"
               :class="isDark ? 'bg-[#282A2C] border-white/5' : 'bg-white border-[rgba(0,0,0,0.12)]'">
        <h3 class="text-xl font-bold border-b pb-4 mb-6 flex items-center gap-3 transition-colors"
            :class="isDark ? 'text-white border-white/10' : 'text-[#1f1f1f] border-[rgba(0,0,0,0.08)]'">
            <div class="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            {{ $t('settings.section_general') }}
        </h3>
        
        <div class="grid grid-cols-1 gap-6">
            <!-- Organization Name -->
            <div>
                 <label class="block text-sm font-bold mb-2 transition-colors uppercase tracking-tight text-[10px]" :class="isDark ? 'text-gray-400' : 'text-[#727775]'">{{ $t('settings.org_name') }}</label>
                <input v-model="settings.orgName" type="text" placeholder="IT Service Desk" 
                       class="w-full p-3 rounded-xl border transition-colors text-sm outline-none focus:ring-2 focus:ring-blue-500/50" 
                       :class="isDark ? 'bg-[#1A1C1E] text-white border-white/10' : 'bg-gray-50 text-[#1f1f1f] border-gray-200'"/>
                <p class="text-[10px] font-bold mt-1 transition-colors uppercase tracking-tighter" :class="isDark ? 'text-gray-500' : 'text-gray-400'">{{ $t('settings.org_name_desc') }}</p>
            </div>
             <!-- Timezone (Readonly) -->
            <div>
                <label class="block text-sm font-bold mb-2 transition-colors uppercase tracking-tight text-[10px]" :class="isDark ? 'text-gray-400' : 'text-[#727775]'">{{ $t('settings.timezone') }}</label>
                <input value="Asia/Bangkok (UTC+7)" readonly 
                       class="w-full p-3 rounded-xl border cursor-not-allowed text-sm font-bold transition-colors" 
                       :class="isDark ? 'bg-[#1A1C1E]/50 text-gray-500 border-transparent' : 'bg-gray-100 text-gray-500 border-transparent'"/>
            </div>
        </div>

        <!-- IT Staff Email Configuration (Support Multiple) -->
        <div class="mt-6 pt-6 border-t transition-colors" :class="isDark ? 'border-white/10' : 'border-[rgba(0,0,0,0.08)]'">
             <label class="block text-sm font-bold mb-2 uppercase tracking-tight text-[10px] transition-colors" :class="isDark ? 'text-blue-400' : 'text-blue-600'">{{ $t('settings.it_email') }}</label>
             <div class="flex items-start gap-4">
                 <div class="flex-1">
                     <input 
                        v-model="settings.itNotificationEmail" 
                        type="text" 
                        placeholder="it1@company.com, it2@company.com" 
                        class="w-full p-3 rounded-xl border transition-colors text-sm outline-none focus:ring-2 focus:ring-blue-500/50" 
                        :class="isDark ? 'bg-[#1A1C1E] text-white border-white/10' : 'bg-gray-50 text-[#1f1f1f] border-gray-200'"
                     />
                     <p class="text-xs mt-2 transition-colors" :class="isDark ? 'text-gray-400' : 'text-[#727775]'">
                        {{ $t('settings.it_email_desc_1') }} <b :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">{{ $t('settings.it_email_desc_bold') }}</b>
                        <br>
                        <span class="text-[10px] font-bold uppercase transition-colors" :class="isDark ? 'text-gray-600' : 'text-gray-400'">{{ $t('settings.it_email_hint') }}</span>
                     </p>
                 </div>
             </div>
        </div>
      </section>

      <!-- 2. SMTP Settings -->
      <section class="p-8 rounded-3xl shadow-xl border transition-colors"
               :class="isDark ? 'bg-[#282A2C] border-white/5' : 'bg-white border-[rgba(0,0,0,0.12)]'">
        <h3 class="text-xl font-bold border-b pb-4 mb-6 flex items-center gap-3 transition-colors"
            :class="isDark ? 'text-white border-white/10' : 'text-[#1f1f1f] border-[rgba(0,0,0,0.08)]'">
            <div class="p-2 bg-yellow-500/10 text-yellow-500 rounded-lg">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            {{ $t('settings.section_smtp') }}
        </h3>
        
        <div class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label class="block text-sm font-bold mb-2 transition-colors uppercase tracking-tight text-[10px]" :class="isDark ? 'text-gray-400' : 'text-[#727775]'">{{ $t('settings.smtp_host') }}</label>
                    <input v-model="settings.smtpHost" type="text" placeholder="smtp.office365.com" required 
                           class="w-full p-3 rounded-xl border transition-colors text-sm outline-none focus:ring-2 focus:ring-yellow-500/50" 
                           :class="isDark ? 'bg-[#1A1C1E] text-white border-white/10' : 'bg-gray-50 text-[#1f1f1f] border-gray-200'"/>
                </div>
                <div>
                    <label class="block text-sm font-bold mb-2 transition-colors uppercase tracking-tight text-[10px]" :class="isDark ? 'text-gray-400' : 'text-[#727775]'">{{ $t('settings.smtp_port') }}</label>
                    <input v-model.number="settings.smtpPort" type="number" placeholder="587" required 
                           class="w-full p-3 rounded-xl border transition-colors text-sm outline-none focus:ring-2 focus:ring-yellow-500/50" 
                           :class="isDark ? 'bg-[#1A1C1E] text-white border-white/10' : 'bg-gray-50 text-[#1f1f1f] border-gray-200'"/>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label class="block text-sm font-bold mb-2 transition-colors uppercase tracking-tight text-[10px]" :class="isDark ? 'text-gray-400' : 'text-[#727775]'">{{ $t('settings.smtp_user') }}</label>
                    <input v-model="settings.smtpUser" type="email" placeholder="noreply@company.com" required 
                           class="w-full p-3 rounded-xl border transition-colors text-sm outline-none focus:ring-2 focus:ring-yellow-500/50" 
                           :class="isDark ? 'bg-[#1A1C1E] text-white border-white/10' : 'bg-gray-50 text-[#1f1f1f] border-gray-200'"/>
                    <p class="text-[10px] font-bold uppercase tracking-tighter mt-1 transition-colors" :class="isDark ? 'text-gray-500' : 'text-gray-400'">{{ $t('settings.smtp_user_desc') }}</p>
                </div>
                <div>
                    <label class="block text-sm font-bold mb-2 transition-colors uppercase tracking-tight text-[10px]" :class="isDark ? 'text-gray-400' : 'text-[#727775]'">{{ $t('settings.smtp_pass') }}</label>
                    <input 
                        v-model="settings.smtpPass" 
                        :type="settings.smtpPass === PASSWORD_FLAG ? 'text' : 'password'" 
                        :placeholder="settings.smtpPass === PASSWORD_FLAG ? $t('settings.smtp_pass_placeholder_saved') : $t('settings.smtp_pass_placeholder_new')"
                        :readonly="settings.smtpPass === PASSWORD_FLAG"
                        @click="changePassword"
                        required 
                        class="w-full p-3 rounded-xl border transition-colors text-sm outline-none focus:ring-2 focus:ring-yellow-500/50 cursor-pointer" 
                        :class="isDark ? 'bg-[#1A1C1E] text-white border-white/10' : 'bg-gray-50 text-[#1f1f1f] border-gray-200'"
                    />
                    <p v-if="settings.smtpPass === PASSWORD_FLAG" class="text-[10px] font-bold text-green-500 mt-1 flex items-center gap-1 uppercase tracking-tighter">
                        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                        {{ $t('settings.smtp_pass_saved') }}
                    </p>
                </div>
            </div>

            <div>
                <label class="block text-sm font-bold mb-2 transition-colors uppercase tracking-tight text-[10px]" :class="isDark ? 'text-gray-400' : 'text-[#727775]'">{{ $t('settings.smtp_from') }}</label>
                <input v-model="settings.smtpFrom" type="text" placeholder="IT Service Notification" required 
                       class="w-full p-3 rounded-xl border transition-colors text-sm outline-none focus:ring-2 focus:ring-yellow-500/50" 
                       :class="isDark ? 'bg-[#1A1C1E] text-white border-white/10' : 'bg-gray-50 text-[#1f1f1f] border-gray-200'"/>
            </div>

            <!-- Test Connection Button -->
            <div class="flex justify-end pt-2">
                 <button 
                    type="button" 
                    @click="testSmtpConnection"
                    :disabled="isTesting || isSaving"
                    class="font-bold py-2 px-6 rounded-xl transition-all duration-200 border flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-95"
                    :class="isDark ? 'bg-[#3A3D40] hover:bg-[#4A4D50] text-gray-200 border-gray-600' : 'bg-gray-100 hover:bg-gray-200 text-[#444746] border-gray-300'"
                >
                    <span v-if="isTesting" class="flex items-center gap-2">
                        <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        {{ $t('settings.testing') }}
                    </span>
                    <span v-else class="flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        {{ $t('settings.btn_test_conn') }}
                    </span>
                </button>
            </div>
        </div>
      </section>
      
      <!-- 3. Holidays configuration -->
      <section class="p-8 rounded-3xl shadow-xl border transition-colors"
               :class="isDark ? 'bg-[#282A2C] border-white/5' : 'bg-white border-[rgba(0,0,0,0.12)]'">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 mb-6 transition-colors"
             :class="isDark ? 'border-white/10' : 'border-[rgba(0,0,0,0.08)]'">
            <h3 class="text-xl font-bold flex items-center gap-3 transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">
                <div class="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2" />
                    </svg>
                </div>
                {{ $t('settings.section_holidays') }}
            </h3>
            
            <div class="flex items-center gap-2 p-1.5 rounded-xl border transition-colors shadow-inner"
                 :class="isDark ? 'bg-[#1A1C1E] border-white/5' : 'bg-gray-50 border-gray-200'">
                <button type="button" @click="changeMonth(-1)" class="p-2 rounded-lg transition-colors" :class="isDark ? 'text-gray-400 hover:bg-white/5' : 'text-[#727775] hover:bg-white'">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <span class="font-bold px-2 min-w-[120px] text-center transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">{{ currentCalendarLabel }}</span>
                <button type="button" @click="changeMonth(1)" class="p-2 rounded-lg transition-colors" :class="isDark ? 'text-gray-400 hover:bg-white/5' : 'text-[#727775] hover:bg-white'">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2">
                <div class="grid grid-cols-7 gap-px border rounded-2xl overflow-hidden transition-colors"
                     :class="isDark ? 'bg-white/5 border-white/5' : 'bg-gray-200 border-gray-200'">
                    <div 
                        v-for="dayIndex in 7" 
                        :key="dayIndex" 
                        class="py-3 text-center text-xs font-extrabold uppercase border-x transition-colors"
                        :class="isDark ? 'bg-[#1A1C1E] text-gray-400 border-gray-800' : 'bg-gray-100 text-[#727775] border-gray-200'"
                    >
                        {{ $t(`settings.days_short.${dayIndex-1}`) }}
                    </div>

                    <div 
                        v-for="(date, idx) in calendarDays" 
                        :key="idx" 
                        @click="toggleDateHoliday(date.fullDate)"
                        :class="[
                            'min-h-[80px] p-2 transition-all cursor-pointer relative border',
                            isHoliday(date.fullDate) 
                                ? (isDark ? 'bg-rose-600/90 text-white border-rose-500/50' : 'bg-rose-500 text-white border-rose-600') 
                                : (date.currentMonth ? (isDark ? 'bg-[#1A1C1E] text-gray-300 border-white/5 hover:bg-[#282A2C]' : 'bg-white text-[#1f1f1f] border-gray-100 hover:bg-gray-50') : (isDark ? 'bg-black/20 text-gray-600 border-white/5' : 'bg-gray-50/50 text-gray-400 border-gray-100')),
                            'hover:opacity-80'
                        ]"
                    >
                        <span class="text-sm font-bold">{{ date.day }}</span>
                        <div v-if="isHoliday(date.fullDate)" class="absolute bottom-2 right-2">
                            <div class="w-2 h-2 rounded-full bg-white shadow-sm animate-pulse"></div>
                        </div>
                        <div 
                            v-if="isHoliday(date.fullDate) && getHolidayDesc(date.fullDate)" 
                            class="mt-1 text-[10px] leading-tight font-medium opacity-90 truncate"
                        >
                            {{ getHolidayDesc(date.fullDate) }}
                        </div>
                    </div>
                </div>
                <p class="text-[10px] uppercase font-bold mt-4 flex items-center gap-2 transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">
                    <span class="w-2 h-2 rounded-full bg-emerald-500"></span> 
                    {{ $t('settings.calendar_hint') }}
                </p>
            </div>

            <div class="space-y-4">
                <h4 class="text-[10px] font-bold uppercase tracking-widest transition-colors mb-2" :class="isDark ? 'text-gray-400' : 'text-[#727775]'">{{ $t('settings.monthly_summary') }}</h4>
                <div class="rounded-2xl p-4 border max-h-[400px] overflow-y-auto custom-scrollbar transition-colors shadow-inner"
                     :class="isDark ? 'bg-[#1A1C1E] border-white/5' : 'bg-gray-50 border-gray-200'">
                    <div v-if="currentMonthHolidays.length === 0" class="text-center py-10 text-[10px] font-bold uppercase transition-colors" :class="isDark ? 'text-gray-600' : 'text-gray-400'">
                        {{ $t('settings.no_holidays_month') }}
                    </div>
                    <div v-for="h in currentMonthHolidays" :key="h.holiday_date" 
                         class="flex items-center justify-between p-3 mb-2 rounded-xl border group transition-colors shadow-sm"
                         :class="isDark ? 'bg-rose-500/10 border-rose-500/20' : 'bg-rose-50 border-rose-100'">
                        <div>
                            <div class="text-sm font-bold transition-colors" :class="isDark ? 'text-rose-400' : 'text-rose-600'">{{ formatShortDate(h.holiday_date) }}</div>
                            <input 
                                v-model="h.description" 
                                @blur="updateHolidayDesc(h)"
                                class="bg-transparent text-[10px] font-bold border-none p-0 focus:ring-0 w-full transition-colors outline-none placeholder-gray-400"
                                :class="isDark ? 'text-gray-400 focus:text-gray-300' : 'text-[#727775] focus:text-[#444746]'"
                                :placeholder="$t('settings.holiday_placeholder')"
                            />
                        </div>
                        <button type="button" @click="toggleDateHoliday(h.holiday_date)" 
                                class="opacity-0 group-hover:opacity-100 transition-all"
                                :class="isDark ? 'text-gray-500 hover:text-rose-500' : 'text-gray-400 hover:text-rose-500'">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </section>

      <!-- Action Buttons -->
      <div class="pt-4 flex justify-end sticky bottom-6 z-10">
        <button 
          type="submit" 
          :disabled="isSaving || isTesting"
          class="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/20 flex items-center gap-2 tracking-wide disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
        >
          <svg v-if="isSaving" class="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
          {{ isSaving ? $t('settings.saving') : $t('settings.btn_save') }}
        </button>
      </div>

    </form>
  </div>
</template>
<script setup>
import { ref, onMounted, computed, getCurrentInstance } from 'vue';
import { useModalStore } from '@/stores/modalStore';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '@/stores/userStore';
import { useTheme } from '@/composables/useTheme';

const { isDark } = useTheme();
const { proxy } = getCurrentInstance();
const $api = proxy.$api; 
const userStore = useUserStore();
const { t } = useI18n(); 

const modal = useModalStore();
const loading = ref(true);
const isSaving = ref(false);
const isTesting = ref(false);

const PASSWORD_FLAG = 'USE_EXISTING_PASS'; 

// --- 1. STATE ---
const settings = ref({
    orgName: 'IT Service Desk',
    itNotificationEmail: '', 
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPass: '',
    smtpFrom: 'IT Notification',
});

const holidays = ref([]);
const newHoliday = ref({ holiday_date: '', description: '' });
const calendarViewDate = ref(new Date());

// --- 2. HELPER FUNCTIONS (ต้องประกาศก่อน Computed) ---
const getAuthOptions = () => {
    const token = userStore.getAuthToken;
    return token ? { headers: { Authorization: `Bearer ${token}` } } : null;
};

const formatDateISO = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // รูปแบบ YYYY-MM-DD
};

const isHoliday = (fullDate) => holidays.value.some(h => h.holiday_date === fullDate);

const getHolidayDesc = (fullDate) => {
    const h = holidays.value.find(h => h.holiday_date === fullDate);
    return h ? h.description : '';
};

const formatShortDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
};

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

// --- 3. COMPUTED PROPERTIES ---
const currentCalendarLabel = computed(() => {
    return calendarViewDate.value.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' });
});

const calendarDays = computed(() => {
    const year = calendarViewDate.value.getFullYear();
    const month = calendarViewDate.value.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const days = [];
    
    const startPadding = firstDayOfMonth.getDay();
    for (let i = startPadding - 1; i >= 0; i--) {
        const d = new Date(year, month, -i);
        days.push({ day: d.getDate(), fullDate: formatDateISO(d), currentMonth: false });
    }
    
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
        const d = new Date(year, month, i);
        days.push({ day: i, fullDate: formatDateISO(d), currentMonth: true });
    }
    
    const endPadding = 42 - days.length;
    for (let i = 1; i <= endPadding; i++) {
        const d = new Date(year, month + 1, i);
        days.push({ day: d.getDate(), fullDate: formatDateISO(d), currentMonth: false });
    }
    return days;
});

const currentMonthHolidays = computed(() => {
    const year = calendarViewDate.value.getFullYear();
    const month = String(calendarViewDate.value.getMonth() + 1).padStart(2, '0');
    const currentMonthPrefix = `${year}-${month}`; 
    return holidays.value
        .filter(h => h.holiday_date.startsWith(currentMonthPrefix))
        .sort((a, b) => new Date(a.holiday_date) - new Date(b.holiday_date));
});

// --- 4. ACTIONS ---
const changeMonth = (offset) => {
    const d = new Date(calendarViewDate.value);
    d.setMonth(d.getMonth() + offset);
    calendarViewDate.value = d;
};

const toggleDateHoliday = async (fullDate) => {
    const existingIndex = holidays.value.findIndex(h => h.holiday_date === fullDate);
    const options = getAuthOptions();
    if (!options) return;

    if (existingIndex > -1) {
        try {
            const res = await $api.delete(`/settings/holidays/${fullDate}`, options);
            if (res.data.success) holidays.value.splice(existingIndex, 1);
        } catch (error) { modal.alert('ลบไม่สำเร็จ', 'Error', 'error'); }
    } else {
        const payload = { holiday_date: fullDate, description: 'วันหยุด' };
        try {
            const res = await $api.post('/settings/holidays', payload, options);
            if (res.data.success) {
                holidays.value.push(payload);
                holidays.value.sort((a, b) => new Date(a.holiday_date) - new Date(b.holiday_date));
            }
        } catch (error) { modal.alert('เพิ่มไม่สำเร็จ', 'Error', 'error'); }
    }
};

const updateHolidayDesc = async (holiday) => {
    const options = getAuthOptions();
    if (!options) return;
    try {
        await $api.put(`/settings/holidays/${holiday.holiday_date}`, { description: holiday.description }, options);
    } catch (error) { console.error("Update error", error); }
};

const fetchSettings = async () => {
    loading.value = true;
    const options = getAuthOptions();
    if (!options || !$api) { loading.value = false; return; }
    try {
        const res = await $api.get('/settings', options);
        if (res.data.success) { 
            const ds = res.data.data;
            Object.keys(settings.value).forEach(k => {
                if (ds[k] !== undefined) settings.value[k] = ds[k];
            });
            if (ds.smtpPass === PASSWORD_FLAG) settings.value.smtpPass = PASSWORD_FLAG;
        }
    } catch (error) { console.error("Load settings error", error);
    } finally { loading.value = false; }
};

const fetchHolidays = async () => {
    const options = getAuthOptions();
    if (!options || !$api) return;
    try {
        const res = await $api.get('/settings/holidays', options);
        if (res.data.success) holidays.value = res.data.data;
    } catch (error) { console.error("Fetch Holidays Error:", error); }
};

const saveSettings = async () => {
    isSaving.value = true;
    const options = getAuthOptions();
    if (!options) return;
    try {
        const payload = { ...settings.value };
        if (payload.smtpPass === PASSWORD_FLAG) delete payload.smtpPass;
        const res = await $api.post('/settings/save', payload, options);
        if (res.data.success) {
            modal.alert(t('settings.alert_save_success'), t('settings.success_title'), 'success');
            settings.value.smtpPass = PASSWORD_FLAG;
        }
    } catch (error) { modal.alert(error.message, 'Error', 'error');
    } finally { isSaving.value = false; }
};

const testSmtpConnection = async () => {
    isTesting.value = true;
    const options = getAuthOptions();
    try {
        const res = await $api.post('/settings/test-smtp', settings.value, options);
        if (res.data.success) modal.alert('Success', 'Connected', 'success');
    } catch (error) { modal.alert('Failed', 'Error', 'error');
    } finally { isTesting.value = false; }
};

const changePassword = async () => {
    if (settings.value.smtpPass === PASSWORD_FLAG) {
        const confirmed = await modal.confirm(t('settings.confirm_pass_change'), t('settings.confirm_pass_title'));
        if (confirmed) settings.value.smtpPass = '';
    }
};

onMounted(() => {
    if (userStore.isLoggedIn) {
        fetchSettings();
        fetchHolidays();
    }
});
</script>
<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.5); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(107, 114, 128, 0.8); }

/* ทำให้ตารางปฏิทินมีขนาดคงที่และตัวเลขอยู่มุม */
.calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
}
</style>
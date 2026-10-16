<template>
  <div class="flex min-h-screen items-center justify-center bg-[#131314] font-sans select-none">
    
    <div class="w-full max-w-md bg-[#1E1F20] p-10 rounded-3xl shadow-2xl border border-white/5 relative overflow-hidden">
      
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-blue-500/20 rounded-full blur-[80px]"></div>

      <div class="text-center mb-10 relative z-10">
        <div class="w-24 h-24 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-white/10 transform hover:scale-105 transition-transform duration-300 p-2">
          <img src="/pic/navIcon/favicon3.png" alt="Company Logo" class="w-full h-full object-contain" onerror="this.style.display='none'; this.nextElementSibling.style.display='block'" />
          <svg style="display:none" xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <p class="text-gray-400 text-sm mt-2">{{ $t('app.title') }}</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-5 relative z-10">
        
        <div>
          <label class="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 ml-1" for="username">
            {{ $t('login.username') }}
          </label>
          <div class="relative">
              <span class="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              </span>
              <input 
                v-model="username"
                class="w-full bg-[#131314] text-white pl-11 pr-4 py-3.5 rounded-2xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-600" 
                id="username" 
                type="text" 
                :placeholder="$t('login.placeholder_user')"
                required
                :disabled="isLoading"
              />
          </div>
        </div>
          <div>
  <label class="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 ml-1" for="password">
    {{ $t('login.password') }}
  </label>
  <div class="relative">
      <span class="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
      </span>
      
      <input 
        v-model="password"
        class="w-full bg-[#131314] text-white pl-11 pr-12 py-3.5 rounded-2xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-600" 
        id="password" 
        :type="showPassword ? 'text' : 'password'" 
        :placeholder="$t('login.placeholder_pass')"
        required
        :disabled="isLoading"
      />

      <button 
        type="button"
        @click="showPassword = !showPassword"
        :title="showPassword ? $t('login.hide_password') : $t('login.show_password')"
        class="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-blue-400 transition-colors focus:outline-none"
      >
        <svg v-if="showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
        </svg>
      </button>
  </div>
</div>

        <div class="flex justify-end gap-2 mt-2">
            <button 
                type="button" 
                @click="switchLanguage('th')" 
                class="text-xs px-2 py-1 rounded hover:bg-white/5 transition-colors"
                :class="locale === 'th' ? 'text-blue-400 font-bold' : 'text-gray-500'"
            >
                TH
            </button>
            <span class="text-gray-600 text-xs py-1">|</span>
            <button 
                type="button" 
                @click="switchLanguage('en')" 
                class="text-xs px-2 py-1 rounded hover:bg-white/5 transition-colors"
                :class="locale === 'en' ? 'text-blue-400 font-bold' : 'text-gray-500'"
            >
                EN
            </button>
        </div>

        <div class="pt-2">
          <button 
              class="w-full bg-[#ecebeb] hover:bg-[#c7c7c7] text-[#003355] font-bold py-3.5 px-4 rounded-full transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" 
              type="submit"
              :disabled="isLoading"
          >
              <span v-if="isLoading" class="flex items-center gap-2">
                  <svg class="animate-spin h-5 w-5 text-[#003355]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  {{ $t('login.btn_loading') }}
              </span>
              <span v-else>{{ $t('login.btn_submit') }}</span>
          </button>
        </div>
      </form>
      
      <p class="text-center text-xs text-gray-600 mt-8">
        {{ $t('app.copyright') }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import apiClient from '@/services/apiClient'
import { useUserStore } from '@/stores/userStore' 
import { useModalStore } from '@/stores/modalStore'
import { useI18n } from 'vue-i18n'

const { locale, t } = useI18n() 

const username = ref('')
const password = ref('')
const showPassword = ref(false) // ✅ 1. เพิ่มตัวแปรสถานะการแสดงรหัสผ่าน
const isLoading = ref(false) 
const router = useRouter()
const route = useRoute() 
const userStore = useUserStore() 
const modal = useModalStore() 

const switchLanguage = (lang) => {
  locale.value = lang 
  localStorage.setItem('lang', lang) 
}

const handleLogin = async () => {
    if (!username.value || !password.value) {
        modal.alert(t('login.error_empty_msg'), t('login.error_empty_title'), 'warning');
        return;
    }

    isLoading.value = true; 

    try {
        const response = await apiClient.post('/auth/login', {
            username: username.value,
            password: password.value
        });

        if (response.data.success) {
            const user = response.data.user;
            const token = response.data.token; 
            userStore.setUser(user, token);
            
            const redirectPath = route.query.redirect;

            if (redirectPath) {
                router.push(redirectPath);
            } else {
                if (user.role === 'ADMIN') {
                    router.push('/app/home');
                } else {
                    router.push('/app/user-home');
                }
            }
        }

    } catch (error) {
        console.error('Login Failed:', error);
        let msg = t('login.error_failed_msg');
        
        if (error.response) {
            msg = error.response.data.message || t('login.error_invalid');
        } else if (error.request) {
            msg = t('login.error_network');
        }
        
        modal.alert(msg, t('login.error_failed_title'), 'error');
    } finally {
        isLoading.value = false;
    }
}
</script>
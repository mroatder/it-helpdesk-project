<template>
  <div class="flex min-h-screen items-center justify-center bg-[#fdfdfd] font-sans select-none relative overflow-hidden">
    
    <!-- Ultra-Minimal Premium Background (Enhanced) -->
    <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-[#f8fafd]">
      <!-- Dynamic Atmospheric Mesh Gradients -->
      <div class="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-blue-300/20 rounded-full blur-[120px] mix-blend-multiply animate-pulse-slow"></div>
      <div class="absolute top-[10%] -right-[15%] w-[60vw] h-[60vw] bg-purple-300/15 rounded-full blur-[130px] mix-blend-multiply animate-float" style="animation-delay: 1s;"></div>
      <div class="absolute -bottom-[20%] left-[20%] w-[50vw] h-[50vw] bg-cyan-300/15 rounded-full blur-[100px] mix-blend-multiply animate-float" style="animation-duration: 25s;"></div>
      
      <!-- Subtle Sweeping Light Beam -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute -inset-[100%] opacity-30 animate-[spin_60s_linear_infinite]" 
             style="background: conic-gradient(from 90deg at 50% 50%, transparent 0%, rgba(255,255,255,0.8) 5%, transparent 10%);">
        </div>
      </div>

      <!-- Super Fine Grid (Blueprint style) -->
      <div class="absolute inset-0 opacity-[0.4]" 
           style="background-image: 
              linear-gradient(to right, #cbd5e1 1px, transparent 1px),
              linear-gradient(to bottom, #cbd5e1 1px, transparent 1px);
            background-size: 50px 50px;
            mask-image: radial-gradient(circle at center, black 40%, transparent 100%);
            -webkit-mask-image: radial-gradient(circle at center, black 40%, transparent 100%);">
      </div>

      <!-- Subtle Noise Grain for Texture -->
      <div class="absolute inset-0 opacity-[0.035] mix-blend-overlay pointer-events-none grain-bg"></div>
    </div>

    <!-- Fixed Company Logo (Top Left) -->
    <div class="fixed top-8 left-8 z-50 animate-fade-in-delayed">
      <img src="/pic/navIcon/logo.png" alt="Company Logo" class="h-8 w-auto" />
    </div>
    <!-- Premium Glass Card (The "Original Box") -->
    <div class="w-full max-w-[420px] bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-[0_8px_40px_rgba(0,0,0,0.04)] border border-gray-100 relative z-10 transition-all duration-500 hover:shadow-[0_16px_60px_rgba(0,0,0,0.06)] animate-slide-up">
      
      <!-- System Icon & Title -->
      <div class="text-center mb-8 relative z-10">
        <div class="w-16 h-16 mx-auto flex items-center justify-center mb-4 transition-transform duration-500 hover:scale-110 drop-shadow-sm slide-up-item-1">
          <img src="/pic/navIcon/favicon3.png" alt="System Icon" class="w-full h-full object-contain" />
        </div>
        <h1 class="text-gray-900 font-black tracking-widest text-lg uppercase bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 slide-up-item-2">{{ $t('app.title') }}</h1>
        <p class="text-gray-400 text-[10px] mt-2 font-bold tracking-[0.3em] uppercase opacity-60 slide-up-item-3">Welcome back</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-5 relative z-10">
        
        <div class="slide-up-item-4">
          <div class="relative group">
              <input 
                v-model="username"
                class="w-full bg-white/50 text-gray-800 px-5 py-4 rounded-2xl border border-gray-200/80 focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm placeholder-transparent text-sm font-semibold peer" 
                id="username" 
                type="text" 
                placeholder="Username"
                required
                :disabled="isLoading"
              />
              <label class="absolute text-[11px] text-gray-400 duration-300 transform -translate-y-1/2 top-1/2 left-5 z-10 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-[-50%] peer-focus:-translate-y-7 peer-focus:-translate-x-1 peer-focus:scale-75 peer-focus:text-blue-500 peer-valid:-translate-y-7 peer-valid:-translate-x-1 peer-valid:scale-75 font-bold tracking-widest pointer-events-none uppercase" for="username">
                {{ $t('login.username') }}
              </label>
          </div>
        </div>

        <div class="slide-up-item-5">
          <div class="relative group">
              <input 
                v-model="password"
                class="w-full bg-white/50 text-gray-800 pl-5 pr-12 py-4 rounded-2xl border border-gray-200/80 focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm placeholder-transparent text-sm font-semibold tracking-wider peer" 
                id="password" 
                :type="showPassword ? 'text' : 'password'" 
                placeholder="Password"
                required
                :disabled="isLoading"
              />
              <label class="absolute text-[11px] text-gray-400 duration-300 transform -translate-y-1/2 top-1/2 left-5 z-10 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-[-50%] peer-focus:-translate-y-7 peer-focus:-translate-x-1 peer-focus:scale-75 peer-focus:text-blue-500 peer-valid:-translate-y-7 peer-valid:-translate-x-1 peer-valid:scale-75 font-bold tracking-widest pointer-events-none uppercase" for="password">
                {{ $t('login.password') }}
              </label>

              <button 
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-blue-500 transition-colors focus:outline-none"
              >
                <svg v-if="showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243m-4.242 4.242l4.242-4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                </svg>
              </button>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-2 slide-up-item-6">
            <button 
                type="button" 
                @click="switchLanguage('th')" 
                class="text-[10px] px-2 py-1 transition-all uppercase tracking-[0.2em] font-bold rounded-md"
                :class="locale === 'th' ? 'bg-black/5 text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'"
            >
                TH
            </button>
            <button 
                type="button" 
                @click="switchLanguage('en')" 
                class="text-[10px] px-2 py-1 transition-all uppercase tracking-[0.2em] font-bold rounded-md"
                :class="locale === 'en' ? 'bg-black/5 text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'"
            >
                EN
            </button>
        </div>

        <div class="pt-6 slide-up-item-7">
          <button 
              class="w-full bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white font-bold py-4 px-4 rounded-2xl transition-all shadow-[0_8px_20px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_25px_rgba(0,0,0,0.18)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 active:scale-95" 
              type="submit"
              :disabled="isLoading"
          >
              <span v-if="isLoading" class="flex items-center gap-2">
                  <svg class="animate-spin h-5 w-5 text-white/50" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  <span>Processing...</span>
              </span>
              <span v-else class="tracking-[0.2em] uppercase">{{ $t('login.btn_submit') }}</span>
          </button>
          
          <div class="text-center mt-3 animate-fade-in opacity-40">
            <span class="text-[9px] font-bold tracking-[0.2em] text-gray-900 uppercase">Version 3.0</span>
          </div>
        </div>
      </form>
      
      <p class="text-center text-[9px] font-bold tracking-[0.4em] text-gray-400 mt-8 uppercase opacity-50 slide-up-item-8">
        {{ $t('app.copyright') }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import apiClient from '@/services/apiClient'
import { useUserStore } from '@/stores/userStore' 
import { useModalStore } from '@/stores/modalStore'
import { useI18n } from 'vue-i18n'

const { locale, t } = useI18n() 

const username = ref('')
const password = ref('')
const showPassword = ref(false)
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

onMounted(() => {
})
</script>

<style scoped>
/* High-End Animations */
@keyframes slide-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes float {
  0% { transform: translate(0, 0) rotate(0); }
  50% { transform: translate(20px, -20px) rotate(5deg); }
  100% { transform: translate(0, 0) rotate(0); }
}

@keyframes pulse-slow {
  0% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.1); }
  100% { opacity: 0.3; transform: scale(1); }
}

.animate-slide-up { animation: slide-up 1s cubic-bezier(0.16, 1, 0.3, 1) both; }
.animate-float { animation: float 20s infinite ease-in-out; }
.animate-pulse-slow { animation: pulse-slow 10s infinite ease-in-out; }

/* Staggered Items */
.slide-up-item-1 { animation: slide-up 1s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both; }
.slide-up-item-2 { animation: slide-up 1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both; }
.slide-up-item-3 { animation: slide-up 1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both; }
.slide-up-item-4 { animation: slide-up 1s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both; }
.slide-up-item-5 { animation: slide-up 1s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both; }
.slide-up-item-6 { animation: slide-up 1s cubic-bezier(0.16, 1, 0.3, 1) 0.6s both; }
.slide-up-item-7 { animation: slide-up 1s cubic-bezier(0.16, 1, 0.3, 1) 0.7s both; }
.slide-up-item-8 { animation: slide-up 1s cubic-bezier(0.16, 1, 0.3, 1) 0.9s both; }

.grain-bg {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3%3Cfilter id='noiseFilter'%3%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3%3C/filter%3%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3%3C/svg%3");
}

/* Input Auto-fill fix overlay */
input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus {
  -webkit-text-fill-color: #1f2937 !important;
  -webkit-box-shadow: 0 0 0px 1000px rgba(255, 255, 255, 0.9) inset !important;
  transition: background-color 5000s ease-in-out 0s;
}
</style>

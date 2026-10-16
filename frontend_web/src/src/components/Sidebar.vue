<template>
  <aside 
    class="h-screen flex flex-col transition-all duration-300 font-sans bg-[#1E1F20] text-[#E3E3E3] select-none flex-shrink-0 sidebar-responsive" 
    :class="isCollapsed ? 'w-20' : 'w-72'"
  >
    
    <div class="h-16 flex items-center px-4 sidebar-header" :class="isCollapsed ? 'justify-center' : 'justify-start'">
      <div 
        @click="toggleCollapse"
        class="flex items-center gap-3 cursor-pointer hover:bg-[#28292C] p-2 rounded-full transition-colors"
        :class="isCollapsed ? 'mx-auto' : ''"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-[#E3E3E3] menu-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path v-if="!isCollapsed" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 15l-3-3m0 0l3-3m-3 3h8m-9 1a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <span v-if="!isCollapsed" class="text-lg font-medium text-[#E3E3E3] ml-1 tracking-wide logo-text">
          IT Service
      </span>
    </div>

    <div class="button-area" :class="isCollapsed ? 'px-3 mt-4 mb-6' : 'px-4 mt-2 mb-6'">
      <router-link 
        to="/app/ticket-create"
        class="flex items-center gap-3 bg-[#1A1A1C] hover:bg-[#282A2C] text-[#E3E3E3] rounded-[15px] transition-all duration-300 shadow-sm border border-[#444746] create-btn"
        :class="isCollapsed ? 'justify-center p-3 w-full' : 'px-4 py-3'"
      >
        <div class="w-6 h-6 flex items-center justify-center icon-container">
           <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#E3E3E3]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
        </div>
        <span v-if="!isCollapsed" class="text-sm font-medium btn-text">{{ $t('menu.report_issue') }}</span>
      </router-link>
    </div>

    <nav class="flex-1 overflow-y-auto px-3 space-y-6 scrollbar-hide pb-4 nav-container">
      <div v-for="(group, groupIndex) in filteredMenu" :key="groupIndex" class="menu-group">
        
        <p v-if="group.label && !isCollapsed" class="px-4 mb-2 text-[11px] font-medium text-[#C4C7C5] mt-2 group-label">
          {{ $t(group.label) }}
        </p>
        
        <ul class="space-y-1">
          <li v-for="item in group.items" :key="item.key"> 
            <component
              :is="item.children ? 'div' : 'router-link'"
              :to="item.children ? undefined : item.path"
              @click="item.children ? toggleMenu(item.key) : null"
              class="flex items-center rounded-full transition-all duration-300 group cursor-pointer text-sm font-medium relative menu-item"
              :class="[
                  !item.children && $route.path.startsWith(item.path) 
                    ? 'bg-[#004A77] text-[#C2E7FF] font-medium' 
                    : 'text-[#E3E3E3] hover:bg-[#282A2C]',
                  isCollapsed ? 'justify-center w-full px-0 py-3' : 'px-4 py-2.5',
              ]"
            >
              <div :class="isCollapsed ? 'mx-auto' : 'mr-3.5'" class="item-icon-wrapper">
                <component :is="item.icon" class="w-5 h-5 transition-colors duration-300 item-icon" :class="$route.path.startsWith(item.path) ? 'text-[#C2E7FF]' : 'text-[#C4C7C5] group-hover:text-[#E3E3E3]'" />
              </div>
              
              <span v-if="!isCollapsed" class="flex-1 truncate item-text">{{ $t(item.key) }}</span>
              
              <span v-if="!isCollapsed && item.badge > 0" class="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mr-2 shadow-sm animate-pulse badge">
                {{ item.badge }}
              </span>
              
              <div v-if="!isCollapsed" class="ml-auto">
                <ChevronDownIcon v-if="item.children" class="w-4 h-4 text-[#C4C7C5] transition-transform duration-200" :class="{'rotate-180': isMenuOpen(item.key)}" />
              </div>
            </component>

            <div v-if="!isCollapsed && item.children">
              <div v-show="isMenuOpen(item.key)" class="mt-1 space-y-1">
                <router-link 
                  v-for="child in item.children" 
                  :key="child.path"
                  :to="child.path"
                  class="flex items-center px-4 py-2 ml-4 rounded-r-full text-sm transition-colors duration-200 border-l-2 border-transparent sub-item"
                  active-class="border-[#004A77] bg-[#004A77]/10 text-[#A8C7FA]"
                  :class="$route.path === child.path ? '' : 'text-[#C4C7C5] hover:text-[#E3E3E3] hover:bg-[#282A2C]'"
                >
                  <span class="flex-1 truncate sub-item-text">{{ $t(child.key) }}</span>
                  
                  <span v-if="child.badge > 0" class="ml-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm badge">
                    {{ child.badge }}
                  </span>
                </router-link>
              </div>
            </div>

          </li>
        </ul>
      </div>
    </nav>

    <div class="px-3 py-4 mt-auto sidebar-footer">
      <div 
        class="flex items-center gap-3 px-4 py-3 rounded-full hover:bg-[#282A2C] transition-colors group profile-card"
        :class="isCollapsed ? 'justify-center' : 'justify-between'"
      >
        <div class="flex items-center gap-3 overflow-hidden profile-info">
            <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-400 to-pink-500 flex-shrink-0 flex items-center justify-center text-white font-bold text-xs avatar">
                {{ currentUser.username ? currentUser.username.substring(0,1).toUpperCase() : '?' }}
            </div>
            
            <div v-if="!isCollapsed" class="overflow-hidden user-details">
                <p class="text-sm text-[#E3E3E3] truncate user-name">{{ currentUser.fullName }}</p>
                <p class="text-[10px] text-[#C4C7C5] truncate user-role">{{ currentUser.role }}</p>
            </div>
        </div>
        
        <button 
            @click="handleLogout"
            class="text-gray-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 transition-all logout-btn"
            :class="{ 'mx-auto': isCollapsed }"
            :title="$t('menu.logout')"
        >
            <ArrowRightOnRectangleIcon class="w-5 h-5 logout-icon" />
        </button>
      </div>
    </div>

  </aside>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, inject, getCurrentInstance } from 'vue'
import { useRoute, useRouter } from 'vue-router' 
import { useUserStore } from '@/stores/userStore'
import { useModalStore } from '@/stores/modalStore' 
import { useI18n } from 'vue-i18n' 

import { 
  HomeIcon, 
  TicketIcon, 
  ClipboardDocumentCheckIcon, 
  ComputerDesktopIcon, 
  ArchiveBoxIcon, 
  Cog6ToothIcon,
  ChevronDownIcon,
  UserGroupIcon,
  QueueListIcon,
  ArrowRightOnRectangleIcon,
  ListBulletIcon,
  PresentationChartLineIcon,
  InboxStackIcon,
  BookOpenIcon,
  AcademicCapIcon 
} from '@heroicons/vue/24/outline'

const { t } = useI18n() 
const route = useRoute()
const router = useRouter() 
const userStore = useUserStore()
const modal = useModalStore()

const { proxy } = getCurrentInstance();
const $api = proxy.$api; 

const isCollapsed = inject('isCollapsed');
const toggleCollapse = inject('toggleSidebar'); 

const currentUser = computed(() => userStore.userProfile)
const pendingCount = ref(0)
const newTicketCount = ref(0)

const openMenus = ref([]) 

const toggleMenu = (name) => {
  if (isCollapsed.value) return 
  if (openMenus.value.includes(name)) {
    openMenus.value = openMenus.value.filter(item => item !== name)
  } else {
    openMenus.value.push(name)
  }
}

const isMenuOpen = (name) => openMenus.value.includes(name)

const isChildActive = (children) => {
  if (!children) return false
  return children.some(child => route.path.startsWith(child.path))
}

const allMenuItems = [
  {  
    label: 'menu.main_menu',  
    items: [
      {  
        key: 'menu.home', 
        path: '/app/user-home',  
        icon: HomeIcon,  
        allowedRoles: ['USER', 'TECHNICIAN', 'ADMIN']  
      },
      {  
        key: 'menu.dashboard',  
        path: '/app/home',  
        icon: PresentationChartLineIcon,  
        allowedRoles: ['ADMIN']  
      }
    ]  
  },
  {  
    label: 'menu.workspace',  
    items: [
      {  
        key: 'menu.report_issue',  
        icon: TicketIcon,  
        allowedRoles: ['USER', 'TECHNICIAN', 'ADMIN'],  
        children: [
          { key: 'menu.new_request', path: '/app/ticket-create' },  
          { key: 'menu.my_list', path: '/app/my-tickets' },
        ]  
      }
    ]  
  },
  {  
    label: 'menu.knowledge_center',  
    items: [
      {  
        key: 'menu.kb_tips',  
        path: '/app/knowledge-base',  
        icon: BookOpenIcon,  
        allowedRoles: ['USER', 'TECHNICIAN', 'ADMIN']  
      }
    ]  
  },
  {  
    label: 'menu.approval',  
    items: [
      {  
        key: 'menu.approve_work',  
        icon: ClipboardDocumentCheckIcon,  
        allowedRoles: ['USER', 'TECHNICIAN', 'ADMIN'],
        condition: (user) => user.title && user.title.toLowerCase().includes('manager'),
        children: [
          { key: 'menu.pending_approval', path: '/app/approvals/pending' },  
          { key: 'menu.approval_history', path: '/app/approvals/history' }
        ]  
      }
    ]  
  },
  {  
    label: 'menu.admin',  
    items: [
      {  
        key: 'menu.manage_tickets',  
        icon: InboxStackIcon,  
        allowedRoles: ['ADMIN'],
        children: [
          { key: 'menu.all_tickets', path: '/app/admin/tickets' },
          { key: 'menu.manage_categories', path: '/app/admin/categories' }
        ]
      },
      {  
        key: 'menu.manage_assets',  
        icon: ComputerDesktopIcon,  
        allowedRoles: ['ADMIN'],  
        children: [
          { key: 'menu.computer_assets', path: '/app/assets' },  
          { key: 'menu.stock', path: '/app/stock' },
          { key: 'menu.asset_map', path: '/app/asset-map' },
          { key: 'menu.asset_map_admin', path: '/app/asset-map/admin' }
        ]  
      },
      {  
        key: 'menu.manage_kb',  
        path: '/app/admin/knowledge-base',  
        icon: AcademicCapIcon,  
        allowedRoles: ['ADMIN']  
      },
      { key: 'menu.users', path: '/app/admin/users', icon: UserGroupIcon, allowedRoles: ['ADMIN'] },  
      { key: 'menu.settings', path: '/app/admin/settings', icon: Cog6ToothIcon, allowedRoles: ['ADMIN'] }
    ]  
  }
]

const filteredMenu = computed(() => {
  if (!currentUser.value) return [];
  const currentRole = currentUser.value.role || 'USER'; 
  const userObj = currentUser.value;

  return allMenuItems.map(group => {
    const filteredItems = group.items.filter(item => {
      const hasRole = item.allowedRoles.includes(currentRole);
      let passCondition = true;
      if (item.condition) {
          passCondition = item.condition(userObj);
      }
      return hasRole && passCondition;
    }).map(item => {
      const itemCopy = { ...item };

      if (itemCopy.key === 'menu.approve_work' && pendingCount.value > 0) {
        itemCopy.badge = pendingCount.value;
        if (itemCopy.children) {
          itemCopy.children = itemCopy.children.map(child => {
            const childCopy = { ...child };
            if (childCopy.key === 'menu.pending_approval') {
              childCopy.badge = pendingCount.value;
            }
            return childCopy;
          });
        }
      }

      if (itemCopy.key === 'menu.manage_tickets' && newTicketCount.value > 0) {
        itemCopy.badge = newTicketCount.value;
        if (itemCopy.children) {
          itemCopy.children = itemCopy.children.map(child => {
            const childCopy = { ...child };
            if (childCopy.key === 'menu.all_tickets') {
              childCopy.badge = newTicketCount.value;
            }
            return childCopy;
          });
        }
      }

      return itemCopy;
    });

    if (filteredItems.length === 0) return null;
    return { ...group, items: filteredItems };
  }).filter(group => group !== null);
})

const fetchPendingCount = async () => {
    if (!$api) return; 

    const userId = currentUser.value?.id || currentUser.value?.user_id;
    const token = userStore.getAuthToken;
    if (!userId || !token) return;

    const authConfig = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };

    try {
        const res = await $api.get(`/tickets/approvals/pending/${userId}`, authConfig);
        if (res.data.success) {
            pendingCount.value = Array.isArray(res.data.data) ? res.data.data.length : 0;
        }
    } catch (err) {}
}

const fetchNewTicketCount = async () => {
    if (!$api) return;
    if (currentUser.value?.role !== 'ADMIN') return;
    const token = userStore.getAuthToken;
    if (!token) return;

    const authConfig = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };

    try {
        const res = await $api.get(`/tickets/all`, authConfig);
        if (res.data.success) {
            const newItems = res.data.data.filter(t => 
                t.status === 'NEW' || t.status === 'WAITING APPROVE'
            );
            newTicketCount.value = newItems.length;
        }
    } catch (err) {}
}

const AUTO_COLLAPSE_WIDTH = 1400; 

const autoCollapse = () => {
    const shouldCollapse = window.innerWidth < AUTO_COLLAPSE_WIDTH;
    if (shouldCollapse && !isCollapsed.value) {
        toggleCollapse(true); 
    } else if (!shouldCollapse && isCollapsed.value) {
        toggleCollapse(false); 
    }
}

onMounted(() => {
    autoCollapse();
    window.addEventListener('resize', autoCollapse);

    allMenuItems.forEach(group => {
      group.items.forEach(item => {
        if (item.children && isChildActive(item.children)) {
          openMenus.value.push(item.key)
        }
      })
    })

    if (userStore.isLoggedIn) {
        fetchPendingCount();
        fetchNewTicketCount();
    }
})

onUnmounted(() => {
    window.removeEventListener('resize', autoCollapse);
})

const handleLogout = async () => {
    const confirmed = await modal.confirm(t('button.logout_confirm'), t('button.logout'));
    if(confirmed) {
        userStore.clearUser(); 
        router.push('/'); 
    }
}
</script>

<style scoped>
/* 1. Responsive Design for Laptop (Width Based) */
@media (max-width: 1536px) {
  /* ลดความกว้าง Sidebar */
  .sidebar-responsive:not(.w-20) {
    width: 240px !important;
  }
  
  /* ลดขนาดตัวอักษรและ Logo */
  .logo-text { font-size: 0.95rem; }
  .btn-text { font-size: 0.8rem; }
  .item-text { font-size: 0.8rem; }
  .sub-item-text { font-size: 0.75rem; }
  .group-label { font-size: 9px !important; }
  
  /* ย่อขนาดไอคอน */
  .menu-icon, .item-icon, .logout-icon {
    width: 1.1rem !important;
    height: 1.1rem !important;
  }
  
  /* ลด Padding และระยะห่าง */
  .sidebar-header { height: 3.5rem !important; }
  .button-area { margin-bottom: 1rem !important; }
  .create-btn { padding: 0.5rem 0.75rem !important; }
  .menu-item { padding: 0.5rem 0.75rem !important; }
  .sub-item { padding: 0.4rem 1rem !important; }
  .nav-container { row-gap: 1rem !important; }
  
  /* ส่วน Profile ด้านล่าง */
  .user-name { font-size: 0.75rem; }
  .user-role { font-size: 9px; }
  .avatar { width: 1.75rem !important; height: 1.75rem !important; font-size: 10px; }
  .profile-card { padding: 0.5rem 0.75rem !important; }
}

/* 2. Responsive Design for Short Screens (Height Based) */
@media (max-height: 850px) {
  .nav-container {
    padding-top: 0.5rem !important;
    row-gap: 0.75rem !important; /* บีบระยะห่างระหว่างกลุ่มเมนู */
  }
  .menu-group ul {
    margin-top: 0.25rem;
  }
}

/* ซ่อน Scrollbar แต่ยังเลื่อนได้ */
.scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
}
.scrollbar-hide::-webkit-scrollbar {
    display: none; /* Chrome, Safari and Opera */
}
</style>
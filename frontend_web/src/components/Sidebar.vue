<template>
  <aside 
    class="h-screen flex flex-col transition-all duration-300 font-sans select-none flex-shrink-0 sidebar-responsive" 
    :class="[
      isCollapsed ? 'w-20' : 'w-72',
      isDark ? 'bg-[#1E1F20] text-[#E3E3E3]' : 'bg-[#ffffff] text-[#1f1f1f] border-r border-[rgba(0,0,0,0.08)]'
    ]"
  >
    
    <div class="h-16 flex items-center px-4 sidebar-header" :class="isCollapsed ? 'justify-center' : 'justify-start'">
      <div 
        @click="toggleCollapse"
        class="flex items-center gap-3 cursor-pointer p-2 rounded-full transition-colors"
        :class="[
          isCollapsed ? 'mx-auto' : '',
          isDark ? 'hover:bg-[#28292C]' : 'hover:bg-[#f1f3f4]'
        ]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 menu-icon" :class="isDark ? 'text-[#E3E3E3]' : 'text-[#444746]'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path v-if="!isCollapsed" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 15l-3-3m0 0l3-3m-3 3h8m-9 1a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <span v-if="!isCollapsed" class="text-lg font-medium ml-1 tracking-wide logo-text" :class="isDark ? 'text-[#E3E3E3]' : 'text-[#1f1f1f]'">
          IT Service
      </span>
    </div>

    <div class="button-area" :class="isCollapsed ? 'px-3 mt-4 mb-6' : 'px-4 mt-2 mb-6'">
      <router-link 
        to="/app/ticket-create"
        class="flex items-center gap-3 rounded-[15px] transition-all duration-300 shadow-sm create-btn"
        :class="[
          isCollapsed ? 'justify-center p-3 w-full' : 'px-4 py-3',
          isDark 
            ? 'bg-[#1A1A1C] hover:bg-[#28292C] text-[#E3E3E3] border border-[#444746]' 
            : 'bg-[#ffffff] hover:bg-[#f1f3f4] text-[#1f1f1f] border border-[rgba(0,0,0,0.08)] shadow-[0_1px_2px_0_rgba(60,64,67,0.30),0_1px_3px_1px_rgba(60,64,67,0.15)]'
        ]"
      >
        <div class="w-6 h-6 flex items-center justify-center icon-container">
           <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" :class="isDark ? 'text-[#E3E3E3]' : 'text-[#1f1f1f]'" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
        </div>
        <span v-if="!isCollapsed" class="text-sm font-medium btn-text">{{ $t('menu.report_issue') }}</span>
      </router-link>
    </div>

    <nav class="flex-1 overflow-y-auto px-3 space-y-6 scrollbar-hide pb-4 nav-container">
      <div v-for="(group, groupIndex) in filteredMenu" :key="groupIndex" class="menu-group">
        
        <p v-if="group.label && !isCollapsed" class="px-4 mb-2 text-[11px] font-medium mt-2 group-label" :class="isDark ? 'text-[#C4C7C5]' : 'text-[#444746]'">
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
                  !item.children && item.path && $route.path.startsWith(item.path) 
                    ? (isDark ? 'bg-[#004A77] text-[#C2E7FF] font-medium' : 'bg-[#D2E3FC] text-[#041E49] font-medium')
                    : (isDark ? 'text-[#E3E3E3] hover:bg-[#28292C]' : 'text-[#444746] hover:bg-[#f1f3f4]'),
                  isCollapsed ? 'justify-center w-full px-0 py-3' : 'px-4 py-2.5',
              ]"
              :title="isCollapsed ? $t(item.key) : ''"
            >
              <div :class="isCollapsed ? 'mx-auto' : 'mr-3.5'" class="item-icon-wrapper">
                <component 
                  :is="item.icon" 
                  class="w-5 h-5 transition-colors duration-300 item-icon" 
                  :class="[
                    item.path && $route.path.startsWith(item.path) 
                      ? (isDark ? 'text-[#C2E7FF]' : 'text-[#041E49]') 
                      : (isDark ? 'text-[#C4C7C5] group-hover:text-[#E3E3E3]' : 'text-[#444746] group-hover:text-[#1f1f1f]')
                  ]" 
                />
              </div>
              
              <span v-if="!isCollapsed" class="flex-1 truncate item-text">{{ $t(item.key) }}</span>
              
              <span v-if="!isCollapsed && item.badge > 0" class="bg-red-500 text-gray-900 dark:text-white text-[10px] font-bold px-2 py-0.5 rounded-full mr-2 shadow-sm animate-pulse badge">
                {{ item.badge }}
              </span>
              
              <div v-if="!isCollapsed" class="ml-auto">
                <ChevronDownIcon v-if="item.children" class="w-4 h-4 text-[#C4C7C5] transition-transform duration-200" :class="{'rotate-180': isMenuOpen(item.key)}" />
              </div>
            </component>

            <div v-if="item.children">
              <div v-show="isCollapsed || isMenuOpen(item.key)" class="mt-1 space-y-1">
                <router-link 
                  v-for="child in item.children" 
                  :key="child.path"
                  :to="child.path"
                  class="flex items-center text-sm transition-colors duration-200 sub-item group relative"
                  :active-class="isDark ? 'bg-[#004A77]/20 text-[#A8C7FA]' : 'bg-[#0b57d0]/10 text-[#0b57d0]'"
                  :class="[
                      $route.path === child.path ? '' : (isDark ? 'text-[#C4C7C5] hover:text-[#E3E3E3] hover:bg-[#28292C]' : 'text-[#444746] hover:text-[#1f1f1f] hover:bg-[#f1f3f4]'),
                      isCollapsed ? 'justify-center p-3 w-[44px] h-[44px] mx-auto rounded-full mb-1' : 'px-4 py-2 ml-4 rounded-r-full border-l-2 border-transparent',
                      !isCollapsed && $route.path === child.path ? (isDark ? 'border-[#A8C7FA]' : 'border-[#0b57d0]') : ''
                  ]"
                  :title="isCollapsed ? $t(child.key) : ''"
                >
                  <component 
                    v-if="child.icon" 
                    :is="child.icon" 
                    class="w-5 h-5 transition-colors duration-300 item-icon shrink-0"
                    :class="[
                        isCollapsed ? 'mx-auto' : 'mr-3',
                        $route.path === child.path 
                          ? (isDark ? 'text-[#C2E7FF]' : 'text-[#041E49]') 
                          : (isDark ? 'text-[#C4C7C5] group-hover:text-[#E3E3E3]' : 'text-[#444746] group-hover:text-[#1f1f1f]')
                    ]" 
                  />
                  <span v-if="!isCollapsed" class="flex-1 truncate sub-item-text">{{ $t(child.key) }}</span>
                  
                  <span v-if="child.badge > 0" class="bg-red-500 text-gray-900 dark:text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm badge"
                        :class="isCollapsed ? 'absolute top-0 right-0 border-2 border-[#1E1F20]' : 'ml-2'">
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
        class="flex items-center gap-3 px-4 py-3 rounded-full transition-colors group profile-card"
        :class="[
            isCollapsed ? 'justify-center' : 'justify-between',
            isDark ? 'hover:bg-[#28292C]' : 'hover:bg-[#f1f3f4]'
        ]"
      >
        <div class="flex items-center gap-3 overflow-hidden profile-info">
            <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-400 to-pink-500 flex-shrink-0 flex items-center justify-center text-white font-bold text-xs avatar">
                {{ currentUser?.username ? currentUser.username.substring(0,1).toUpperCase() : '?' }}
            </div>
            
            <div v-if="!isCollapsed" class="overflow-hidden user-details">
                <p class="text-sm truncate user-name" :class="isDark ? 'text-[#E3E3E3]' : 'text-[#1f1f1f]'">{{ currentUser?.fullName || 'Guest' }}</p>
                <p class="text-[10px] truncate user-role" :class="isDark ? 'text-[#C4C7C5]' : 'text-[#444746]'">{{ currentUser?.role || '' }}</p>
            </div>
        </div>
        
        <div class="flex items-center gap-1">
          <!-- Theme Toggle -->
          <button 
              @click="toggleTheme"
              class="hover:text-yellow-500 p-1.5 rounded-lg transition-all outline-none"
              :class="isDark ? 'text-gray-400 hover:bg-white/5' : 'text-[#444746] hover:bg-[#f1f3f4]'"
              title="Toggle Theme"
          >
              <SunIcon v-if="!isDark" class="w-5 h-5 transition-transform" />
              <MoonIcon v-else class="w-5 h-5 transition-transform" />
          </button>
        
          <button 
              @click="handleLogout"
              class="hover:text-red-500 p-1.5 rounded-lg transition-all logout-btn"
              :class="[
                isCollapsed ? 'mx-auto' : '',
                isDark ? 'text-gray-400 hover:bg-white/5' : 'text-[#444746] hover:bg-[#f1f3f4]'
              ]"
              :title="$t('menu.logout')"
          >
              <ArrowRightOnRectangleIcon class="w-5 h-5 logout-icon" />
          </button>
        </div>
      </div>
    </div>

  </aside>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, inject, getCurrentInstance } from 'vue'
import { useRoute, useRouter } from 'vue-router' 
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/userStore'
import { useModalStore } from '@/stores/modalStore'
import { useTicketStore } from '@/stores/ticketStore' 

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
  AcademicCapIcon,
  SunIcon,
  MoonIcon,
  DocumentPlusIcon,
  ClockIcon,
  FolderOpenIcon,
  TagIcon,
  MapIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  CommandLineIcon,
  VideoCameraIcon
} from '@heroicons/vue/24/outline'

import { useTheme } from '@/composables/useTheme'

const { isDark, toggleTheme } = useTheme()
const { t } = useI18n() 
const route = useRoute()
const router = useRouter() 
const userStore = useUserStore()
const ticketStore = useTicketStore()
const modal = useModalStore()

const { proxy } = getCurrentInstance();
const $api = proxy.$api; 

const isCollapsed = inject('isCollapsed');
const toggleCollapse = inject('toggleSidebar'); 

const currentUser = computed(() => userStore.userProfile)

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
          { key: 'menu.new_request', path: '/app/ticket-create', icon: DocumentPlusIcon },  
          { key: 'menu.my_list', path: '/app/my-tickets', icon: ListBulletIcon },
        ]  
      },
      {
        key: 'menu.cctv_map',
        path: '/app/cctv-map',
        icon: VideoCameraIcon,
        allowedRoles: ['USER', 'TECHNICIAN', 'ADMIN'],
        condition: (user) => user.role === 'ADMIN' || (user.level_rank && user.level_rank >= 1 && user.level_rank <= 4)
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
        condition: (user) => (user.title && user.title.toLowerCase().includes('manager')) || (user.level_rank && Number(user.level_rank) <= 3),
        children: [
          { key: 'menu.pending_approval', path: '/app/approvals/pending', icon: ClockIcon },  
          { key: 'menu.approval_history', path: '/app/approvals/history', icon: FolderOpenIcon }
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
          { key: 'menu.all_tickets', path: '/app/admin/tickets', icon: QueueListIcon },
          { key: 'menu.manage_categories', path: '/app/admin/categories', icon: TagIcon }
        ]
      },
      {  
        key: 'menu.manage_assets',  
        icon: BuildingOfficeIcon,  
        allowedRoles: ['ADMIN'],  
        children: [
          { key: 'menu.computer_assets', path: '/app/assets', icon: ComputerDesktopIcon },  
          { key: 'menu.stock', path: '/app/stock', icon: ArchiveBoxIcon },
          { key: 'menu.asset_map', path: '/app/asset-map', icon: MapIcon },
          { key: 'menu.asset_map_admin', path: '/app/asset-map/admin', icon: MapPinIcon },
          { key: 'menu.cctv_admin', path: '/app/cctv-map/admin', icon: VideoCameraIcon }
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

      if (itemCopy.key === 'menu.approve_work' && ticketStore.pendingCount > 0) {
        itemCopy.badge = ticketStore.pendingCount;
        if (itemCopy.children) {
          itemCopy.children = itemCopy.children.map(child => {
            const childCopy = { ...child };
            if (childCopy.key === 'menu.pending_approval') {
              childCopy.badge = ticketStore.pendingCount;
            }
            return childCopy;
          });
        }
      }

      if (itemCopy.key === 'menu.manage_tickets' && ticketStore.newTicketCount > 0) {
        itemCopy.badge = ticketStore.newTicketCount;
        if (itemCopy.children) {
          itemCopy.children = itemCopy.children.map(child => {
            const childCopy = { ...child };
            if (childCopy.key === 'menu.all_tickets') {
              childCopy.badge = ticketStore.newTicketCount;
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
        ticketStore.fetchCounts();
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

import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import MainLayout from '../layouts/MainLayout.vue'

// Import Store
import { useUserStore } from '@/stores/userStore'; // ✅ Import Store ที่ถูกต้อง

// Import Views
import HomeView from '../views/HomeView.vue'
import UserHomeView from '../views/UserHomeView.vue'
import TicketCreateView from '../views/tickets/TicketCreateView.vue'
import TicketListView from '../views/tickets/TicketListView.vue'
import TicketDetailView from '../views/tickets/TicketDetailView.vue'
import MyTicketsView from '../views/user/MyTicketsView.vue'
import MyTicketDetailView from '../views/user/MyTicketDetailView.vue'
import UsersView from '../views/admin/UsersView.vue'
import CategorySettings from '../views/admin/CategorySettings.vue'
import SettingView from '../views/admin/SettingsView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'login',
            component: LoginView
        },
        {
            path: '/app',
            component: MainLayout,
            redirect: '/app/home',
            children: [
                // --- General Views ---
                {
                    path: 'home',
                    name: 'home',
                    component: HomeView
                },
                {
                    path: 'user-home',
                    name: 'user-home',
                    component: UserHomeView
                },

                // --- Ticket Views ---
                {
                    path: 'ticket-create',
                    name: 'ticket-create',
                    component: TicketCreateView
                },
                {
                    path: 'tickets',
                    redirect: '/app/my-tickets'
                },
                {
                    path: 'my-tickets',
                    name: 'my-tickets',
                    component: MyTicketsView
                },
                {
                    path: 'my-tickets/:id',
                    name: 'my-ticket-detail',
                    component: MyTicketDetailView
                },
                {
                    path: 'tickets/:id',
                    name: 'ticket-detail',
                    component: TicketDetailView
                },

                // --- Knowledge Base / FAQ ---
                {
                    path: 'knowledge-base',
                    name: 'knowledge-base',
                    component: () => import('../views/user/KnowledgeBaseView.vue')
                },

                // --- Approvals (Manager) ---
                {
                    path: 'approvals/pending',
                    name: 'approval-pending',
                    component: () => import('../views/tickets/ApprovalListView.vue')
                },
                {
                    path: 'approvals/history',
                    name: 'approval-history',
                    component: () => import('../views/tickets/ApprovalHistoryView.vue')
                },
                {
                    path: 'approvals/:id',
                    name: 'approval-detail',
                    component: () => import('../views/tickets/ApprovalDetailView.vue')
                },

                // --- Assets / Inventory ---
                {
                    path: 'assets',
                    name: 'asset-list',
                    component: () => import('../views/assets/AssetListView.vue')
                },
                {
                    path: 'assets/:id',
                    name: 'asset-detail',
                    component: () => import('../views/assets/AssetDetailView.vue')
                },
                {
                    path: 'asset-map',
                    name: 'asset-map',
                    component: () => import('../views/assets/AssetMapView.vue'),
                    meta: { roles: ['ADMIN'] }
                },
                {
                    path: 'asset-map/admin',
                    name: 'asset-map-admin',
                    component: () => import('../views/assets/AssetMapAdminView.vue'),
                    meta: { roles: ['ADMIN'] }
                },
                {
                    path: 'cctv-map',
                    name: 'cctv-map',
                    component: () => import('../views/cctv/CctvMapView.vue')
                },
                {
                    path: 'cctv-map/admin',
                    name: 'cctv-map-admin',
                    component: () => import('../views/cctv/CctvMapAdminView.vue'),
                    meta: { roles: ['ADMIN'] }
                },

                // --- Stock Management (NEW) ---
                {
                    path: 'stock',
                    name: 'stock-list',
                    component: () => import('../views/stock/StockListView.vue')
                },

                // --- Admin Views (Role: ADMIN) ---
                {
                    path: 'admin/users',
                    name: 'admin-users',
                    component: UsersView,
                    meta: { roles: ['ADMIN'] }
                },
                {
                    path: 'admin/categories',
                    name: 'admin-categories',
                    component: CategorySettings,
                    meta: { roles: ['ADMIN'] }
                },
                {
                    path: 'admin/tickets',
                    name: 'admin-tickets',
                    component: TicketListView,
                    meta: { roles: ['ADMIN'] }
                },
                {
                    path: 'admin/settings',
                    name: 'settings',
                    component: SettingView,
                    meta: { roles: ['ADMIN'] }
                },
                {
                    path: 'admin/knowledge-base',
                    name: 'admin-knowledge-base',
                    component: () => import('../views/admin/KnowledgeBaseAdminView.vue'),
                    meta: { roles: ['ADMIN'] }
                }
            ]
        }
    ]
})

// Navigation Guard
router.beforeEach((to, from, next) => {
    const store = useUserStore();
    const requiresAuth = to.path.startsWith('/app');

    // 3. ถ้าต้องการล็อกอิน แต่ยังไม่ได้ล็อกอิน
    if (requiresAuth && !store.isLoggedIn) {
        next({
            path: '/',
            query: { redirect: to.fullPath } // เก็บเป้าหมายไว้
        });
        return;
    }

    // 🔥 4. จุดตายอยู่ตรงนี้: ถ้าล็อกอินแล้ว และพยายามเข้าหน้า Login (/)
    if (to.path === '/' && store.isLoggedIn) {
        // ✅ เช็คก่อน! ถ้ามี redirect แปะมาใน URL ให้ไปที่นั่น ไม่ต้องไป Home
        const redirectPath = to.query.redirect;

        if (redirectPath) {
            next(redirectPath);
        } else {
            // ถ้าไม่มีจริงๆ ถึงค่อยส่งไปหน้า Home ตาม Role
            const role = store.userProfile?.role;
            if (role === 'ADMIN') {
                next('/app/home');
            } else {
                next('/app/user-home');
            }
        }
        return;
    }

    // 5. การตรวจสอบ Role (คงเดิม)
    const userRole = store.userProfile?.role;
    if (to.meta.roles && !to.meta.roles.includes(userRole)) {
        next('/app/user-home');
        return;
    }

    next();
});
export default router
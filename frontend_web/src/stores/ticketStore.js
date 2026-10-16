import { defineStore } from 'pinia';
import { ref } from 'vue';
import apiClient from '@/services/apiClient';
import { useUserStore } from './userStore';

export const useTicketStore = defineStore('ticket', () => {
    const userStore = useUserStore();
    const pendingCount = ref(0);
    const newTicketCount = ref(0);

    const fetchCounts = async () => {
        if (!userStore.isLoggedIn) return;
        const token = userStore.getAuthToken;
        const userId = userStore.userProfile?.id || userStore.userProfile?.user_id;
        const role = userStore.userProfile?.role;

        const authConfig = {
            headers: { Authorization: `Bearer ${token}` }
        };

        try {
            // 1. Pending Approvals Count
            if (userId) {
                const resAppr = await apiClient.get(`/tickets/approvals/pending/${userId}`, authConfig);
                if (resAppr.data.success) {
                    pendingCount.value = Array.isArray(resAppr.data.data) ? resAppr.data.data.length : 0;
                }
            }

            // 2. New/Waiting Tickets Count (for ADMIN)
            if (role === 'ADMIN') {
                const resAll = await apiClient.get(`/tickets/all`, authConfig);
                if (resAll.data.success) {
                    // Filter specifically for badge counts
                    const newItems = resAll.data.data.filter(t =>
                        t.status === 'NEW' || t.status === 'WAITING APPROVE'
                    );

                    // ✨ IMPORTANT: Also filter unique ticket_ids in case API still has duplicates
                    const uniqueTicketIds = new Set(newItems.map(t => t.ticket_id));
                    newTicketCount.value = uniqueTicketIds.size;
                }
            }
        } catch (err) {
            console.error("Error fetching ticket counts:", err);
        }
    };

    const clearCounts = () => {
        pendingCount.value = 0;
        newTicketCount.value = 0;
    };

    return {
        pendingCount,
        newTicketCount,
        fetchCounts,
        clearCounts
    };
});

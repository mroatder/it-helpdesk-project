<template>
  <div class="p-6 font-sans max-w-full mx-auto pb-24 transition-colors" :class="isDark ? 'text-gray-300' : 'text-[#444746]'">
    
    <div class="flex flex-col 2xl:flex-row justify-between items-start 2xl:items-end mb-8 gap-6">
        <div>
            <h2 class="text-3xl font-extrabold tracking-tight mb-2 transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">
            {{ $t('user_manage.title') }}
            </h2>
            <p class="text-sm transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ $t('user_manage.subtitle') }}</p>
        </div>

        <div class="flex flex-col xl:flex-row gap-4 w-full 2xl:w-auto">
            <div class="flex flex-1 gap-3">
                <div class="relative flex-1 min-w-[220px]">
                    <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </span>
                    <input type="text" v-model="searchText" :placeholder="$t('user_manage.search_placeholder')" 
                           class="w-full pl-9 p-2.5 rounded-xl border transition-all placeholder-gray-500 text-sm shadow-sm outline-none focus:ring-2 focus:ring-blue-500/50"
                           :class="isDark ? 'bg-[#1A1C1E] text-white border-white/10' : 'bg-white text-[#1f1f1f] border-gray-200'">
                </div>
                <select v-model="filterRole" 
                        class="p-2.5 rounded-xl border transition-all text-sm cursor-pointer shadow-sm outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none pr-8 w-[140px]"
                        :class="isDark ? 'bg-[#1A1C1E] text-white border-white/10 hover:bg-[#282A2C]' : 'bg-white text-[#1f1f1f] border-gray-200 hover:bg-gray-50'">
                    <option value="">{{ $t('user_manage.filter_role') }}</option>
                    <option value="ADMIN">{{ $t('user_manage.role_admin') }}</option>
                    <option value="USER">{{ $t('user_manage.role_user') }}</option>
                </select>
            </div>

            <div class="flex items-center gap-2 shrink-0 self-end xl:self-auto">
                <button @click="openImportModal" class="bg-green-600 hover:bg-green-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-green-500/20 active:scale-95">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                    {{ $t('user_manage.btn_import') }}
                </button>

                <button @click="openDeptModal" class="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    <span class="hidden sm:inline">{{ $t('user_manage.btn_manager') }}</span>
                    <span class="sm:hidden">Manager</span>
                </button>

                <button @click="syncUsersFromAD" 
                        class="p-2.5 rounded-xl transition-all border shadow-sm active:scale-95" 
                        :class="isDark ? 'text-gray-400 hover:text-white bg-[#1A1C1E] border-white/10 hover:bg-[#282A2C]' : 'text-[#727775] hover:text-[#1f1f1f] bg-white border-gray-200 hover:bg-gray-50'"
                        :title="$t('user_manage.btn_refresh')" :disabled="loading">
                    <svg :class="{'animate-spin': loading}" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </button>
            </div>
        </div>
    </div>

    <div class="w-full flex justify-start 2xl:justify-center overflow-x-auto custom-scrollbar">
        <div class="rounded-2xl overflow-hidden shadow-2xl border transition-all flex flex-col relative min-h-[400px] w-fit h-fit"
             :class="isDark ? 'bg-[#1A1C1E] border-white/10' : 'bg-white border-[rgba(0,0,0,0.12)]'">
            <div v-if="loading" class="absolute inset-0 z-20 flex flex-col items-center justify-center backdrop-blur-sm rounded-2xl"
                 :class="isDark ? 'bg-[#1A1C1E]/80' : 'bg-white/80'">
                <svg class="animate-spin h-10 w-10 text-blue-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <span class="text-sm font-bold transition-colors" :class="isDark ? 'text-gray-300' : 'text-[#444746]'">{{ $t('user_manage.loading') }}</span>
            </div>

            <table class="w-auto min-w-[1100px] border-collapse text-left">
                <thead class="text-[10px] font-bold uppercase tracking-wider transition-colors"
                       :class="isDark ? 'bg-[#282A2C] text-gray-500' : 'bg-gray-50 text-[#727775]'">
                    <tr>
                        <th class="px-6 py-4 w-24 border-b cursor-pointer hover:text-blue-500 transition-colors" :class="isDark ? 'border-white/5' : 'border-[rgba(0,0,0,0.08)]'" @click="sortUsers('user_id')">{{ $t('user_manage.col_id') }}</th>
                        <th class="px-6 py-4 min-w-[220px] border-b cursor-pointer hover:text-blue-500 transition-colors" :class="isDark ? 'border-white/5' : 'border-[rgba(0,0,0,0.08)]'" @click="sortUsers('full_name')">{{ $t('user_manage.col_name') }}</th>
                        <th class="px-6 py-4 min-w-[200px] border-b cursor-pointer hover:text-blue-500 transition-colors" :class="isDark ? 'border-white/5' : 'border-[rgba(0,0,0,0.08)]'" @click="sortUsers('department')">{{ $t('user_manage.col_dept') }}</th>
                        <th class="px-6 py-4 w-32 border-b cursor-pointer hover:text-blue-500 transition-colors" :class="isDark ? 'border-white/5' : 'border-[rgba(0,0,0,0.08)]'" @click="sortUsers('role')">{{ $t('user_manage.col_role') }}</th>
                        <th class="px-6 py-4 w-32 border-b text-center transition-colors" :class="isDark ? 'border-white/5' : 'border-[rgba(0,0,0,0.08)]'">{{ $t('user_manage.col_rank') }}</th>
                        <th class="px-6 py-4 min-w-[220px] border-b transition-colors" :class="isDark ? 'border-white/5' : 'border-[rgba(0,0,0,0.08)]'">{{ $t('user_manage.col_manager') }}</th>
                        <th class="px-6 py-4 w-36 border-b text-center transition-colors" :class="isDark ? 'border-white/5' : 'border-[rgba(0,0,0,0.08)]'">{{ $t('user_manage.col_status') }}</th>
                        <th class="px-6 py-4 w-24 border-b text-right transition-colors" :class="isDark ? 'border-white/5' : 'border-[rgba(0,0,0,0.08)]'">{{ $t('user_manage.col_action') }}</th>
                    </tr>
                </thead>
                <tbody class="text-sm">
                    <tr v-for="user in paginatedUsers" :key="user.user_id" 
                        class="transition-all border-b"
                        :class="[
                             isDark ? 'hover:bg-white/[0.02] border-white/5' : 'hover:bg-blue-50/30 border-[rgba(0,0,0,0.04)]',
                             'last:border-0'
                        ]"
                    >
                        <td class="px-6 py-4 font-mono text-blue-500 text-[10px] font-bold">#{{ user.user_id }}</td>
                        <td class="px-6 py-4">
                            <div class="font-bold transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">{{ user.full_name }}</div>
                            <div class="text-[10px] uppercase font-bold tracking-tighter transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">
                                {{ user.username }} <span class="mx-1.5 opacity-30">|</span> {{ user.email }}
                            </div>
                        </td>
                        <td class="px-6 py-4">
                             <div class="font-bold transition-colors" :class="isDark ? 'text-gray-300' : 'text-[#444746]'">{{ user.department || 'N/A' }}</div>
                             <div class="text-[10px] font-bold transition-colors" :class="isDark ? 'text-gray-500 border-gray-500/20' : 'text-[#727775]'">{{ user.title || '-' }}</div>
                        </td>
                        <td class="px-6 py-4">
                            <span :class="getRoleClasses(user.role)" class="px-2.5 py-0.5 inline-flex text-[10px] leading-4 font-bold rounded-full uppercase border border-opacity-20">
                                {{ user.role }}
                            </span>
                        </td>
                        <td class="px-6 py-4 text-center">
                            <span v-if="user.level_rank && user.level_rank < 99" class="bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded border border-yellow-500/20 font-bold text-[10px]">
                                RANK {{ user.level_rank }}
                            </span>
                            <span v-else class="text-gray-600 opacity-40">-</span>
                        </td>
                        <td class="px-6 py-4">
                             <div v-if="user.manager_id" class="flex flex-col gap-1">
                                <div v-for="(mName, idx) in getManagerNames(user.manager_id)" :key="idx" class="flex items-center gap-2">
                                    <div class="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                                        {{ mName.charAt(0).toUpperCase() }}
                                    </div>
                                    <span class="text-xs truncate max-w-[150px] transition-colors" :class="isDark ? 'text-gray-300' : 'text-[#444746]'">{{ mName }}</span>
                                </div>
                             </div>
                             <span v-else class="text-xs italic opacity-50 transition-colors" :class="isDark ? 'text-gray-600' : 'text-[#727775]'">{{ $t('user_manage.no_manager') }}</span>
                        </td>
                        <td class="px-6 py-4 text-center">
                            <span :class="user.is_active ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'" class="px-2.5 py-0.5 inline-flex text-[10px] font-bold rounded-full border">
                                {{ user.is_active ? $t('user_manage.status_active') : $t('user_manage.status_inactive') }}
                            </span>
                        </td>
                        <td class="px-6 py-4 text-right">
                             <button @click="openEditModal(user)" 
                                     class="p-2.5 rounded-xl transition-all hover:scale-110 active:scale-95"
                                     :class="isDark ? 'text-gray-400 hover:text-blue-500 hover:bg-blue-500/10' : 'text-[#727775] hover:text-blue-600 hover:bg-blue-50'">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                             </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
    
    <div v-if="filteredUsers.length > 0" class="mt-6 flex justify-center pb-4">
      <Pagination 
        :current-page="currentPage"
        :total-pages="totalPages"
        @page-changed="val => currentPage = val"
      />
    </div>

    <!-- Edit User Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div class="rounded-2xl border w-full max-w-md shadow-2xl transition-all overflow-hidden flex flex-col"
             :class="isDark ? 'bg-[#1E1F20] border-white/10' : 'bg-white border-[rgba(0,0,0,0.12)]'">
            <div class="p-6 border-b flex justify-between items-center transition-colors"
                 :class="isDark ? 'border-white/5' : 'border-[rgba(0,0,0,0.08)]'">
                <h3 class="text-xl font-bold transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">{{ $t('user_manage.modal_edit_title') }}</h3>
                <button @click="closeModal" class="transition-colors" :class="isDark ? 'text-gray-400 hover:text-white' : 'text-[#727775] hover:text-[#1f1f1f]'">
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
            <div class="p-6 space-y-6">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-[10px] uppercase font-bold transition-colors mb-1.5" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">Full Name</label>
                        <div class="text-sm p-3 rounded-lg border transition-colors truncate font-bold"
                             :class="isDark ? 'bg-[#1A1C1E] border-white/5 text-white' : 'bg-gray-50 border-gray-200 text-[#1f1f1f]'">{{ editingUser.full_name }}</div>
                    </div>
                    <div>
                        <label class="block text-[10px] uppercase font-bold transition-colors mb-1.5" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">Department</label>
                        <div class="text-sm p-3 rounded-lg border transition-colors truncate font-bold"
                             :class="isDark ? 'bg-[#1A1C1E] border-white/5 text-white' : 'bg-gray-50 border-gray-200 text-[#1f1f1f]'">{{ editingUser.department || '-' }}</div>
                    </div>
                </div>

                <div class="p-4 rounded-xl border transition-colors shadow-inner"
                     :class="isDark ? 'bg-yellow-500/5 border-yellow-500/20' : 'bg-yellow-50 border-yellow-200'">
                    <label class="block text-[10px] font-bold text-yellow-600 mb-2 uppercase tracking-widest">Approval Rank (ระดับสิทธิ์อนุมัติ)</label>
                    <select v-model="editingUser.level_rank" 
                            class="w-full text-sm rounded-lg p-3 transition-colors outline-none focus:ring-2 focus:ring-yellow-500/50 border"
                            :class="isDark ? 'bg-[#1A1C1E] text-white border-white/10' : 'bg-white text-[#1f1f1f] border-gray-200'">
                        <option :value="1">Rank 1: Japan Manager / Director</option>
                        <option :value="2">Rank 2: Asst. Japan Manager</option>
                        <option :value="3">Rank 3: Department Manager (Thai)</option>
                        <option :value="4">Rank 4: Asst. Manager / Supervisor</option>
                        <option :value="99">Rank 99: Staff (ไม่มีสิทธิ์อนุมัติ)</option>
                    </select>
                </div>

                <div>
                    <label class="block text-[10px] font-bold uppercase transition-colors mb-1.5" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">System Role</label>
                    <select v-model="editingUser.role" 
                            class="w-full text-sm rounded-lg p-3 transition-colors border outline-none focus:ring-2 focus:ring-blue-500/50"
                            :class="isDark ? 'bg-[#1A1C1E] text-white border-white/10' : 'bg-white text-[#1f1f1f] border-gray-200'">
                        <option value="ADMIN">ADMIN</option>
                        <option value="USER">USER</option>
                    </select>
                </div>
                
                <div>
                    <label class="block text-[10px] font-bold transition-colors mb-2 uppercase" :class="isDark ? 'text-indigo-400' : 'text-indigo-600'">Assigned Managers</label>
                    <div class="border rounded-xl max-h-[160px] overflow-y-auto custom-scrollbar p-1.5 transition-colors shadow-inner"
                         :class="isDark ? 'bg-[#1A1C1E] border-white/10' : 'bg-gray-50 border-gray-200'">
                        <div v-for="m in potentialManagers" :key="m.user_id" 
                             class="flex items-center p-2.5 rounded-lg border border-transparent transition-all cursor-pointer mb-1 last:mb-0" 
                             :class="isDark ? 'hover:bg-white/5 hover:border-white/5' : 'hover:bg-white hover:border-gray-200'"
                             @click="toggleManagerSelection(m.user_id)">
                            <input type="checkbox" :value="m.user_id" v-model="selectedManagerIds" 
                                   class="h-4 w-4 rounded-md transition-colors cursor-pointer border-gray-300 text-indigo-600 focus:ring-indigo-500/50" @click.stop>
                            <span class="ml-3 text-sm font-medium transition-colors" :class="isDark ? 'text-gray-300' : 'text-[#444746]'">{{ m.full_name }}</span>
                        </div>
                    </div>
                </div>

                <div class="flex items-center gap-3 pt-2">
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" v-model="editingUser.is_active" class="sr-only peer">
                        <div class="w-12 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:bg-green-600 transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"
                             :class="isDark ? 'bg-gray-700' : 'bg-gray-200'"></div>
                        <span class="ml-3 text-sm font-bold transition-colors uppercase tracking-tight" :class="isDark ? 'text-gray-300' : 'text-[#444746]'">Active Account</span>
                    </label>
                </div>
            </div>
            <div class="p-6 border-t flex justify-end gap-3 transition-colors"
                 :class="isDark ? 'border-white/5 bg-[#232527]/50' : 'border-[rgba(0,0,0,0.08)] bg-gray-50'">
                <button @click="closeModal" class="px-4 py-2 text-sm font-bold transition-colors" :class="isDark ? 'text-gray-400 hover:text-white' : 'text-[#727775] hover:text-[#1f1f1f]'">Cancel</button>
                <button @click="saveUser" class="px-8 py-2.5 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all font-bold shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50">
                    <div class="flex items-center gap-2">
                        <svg v-if="saving" class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <span>{{ saving ? $t('user_manage.btn_saving') : 'Save Changes' }}</span>
                    </div>
                </button>
            </div>
        </div>
    </div>

    <!-- Bulk Dept Modal -->
    <div v-if="showDeptModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div class="rounded-2xl border w-full max-w-2xl shadow-2xl transition-all overflow-hidden flex flex-col max-h-[90vh]"
             :class="isDark ? 'bg-[#1E1F20] border-white/10' : 'bg-white border-[rgba(0,0,0,0.12)]'">
            <div class="p-6 border-b flex items-center gap-4 transition-colors"
                 :class="isDark ? 'border-white/5' : 'border-[rgba(0,0,0,0.08)]'">
                <div class="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </div>
                <div>
                    <h3 class="text-xl font-bold transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">{{ $t('user_manage.bulk_title') }}</h3>
                    <p class="text-xs transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">Assign managers to all users in a specific department</p>
                </div>
            </div>
            <div class="p-6 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
                <div>
                    <label class="block text-[10px] font-bold uppercase transition-colors mb-2" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ $t('user_manage.bulk_step1') }}</label>
                    <select v-model="bulkDeptState.selectedDept" 
                            class="w-full text-sm rounded-xl p-3.5 transition-colors border outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none"
                            :class="isDark ? 'bg-[#1A1C1E] text-white border-white/10' : 'bg-white text-[#1f1f1f] border-gray-200'">
                        <option value="" disabled>{{ $t('user_manage.bulk_select_dept') }}</option>
                        <option v-for="dept in departments" :key="dept" :value="dept">{{ $t('user_manage.bulk_dept_count', { dept: dept, count: getUsersCountInDept(dept) }) }}</option>
                    </select>
                </div>

                <div v-if="bulkDeptState.selectedDept">
                    <label class="block text-[10px] font-bold uppercase transition-colors mb-2" :class="isDark ? 'text-indigo-400' : 'text-indigo-600'">{{ $t('user_manage.bulk_step2') }}</label>
                    <div class="border rounded-2xl max-h-[220px] overflow-y-auto custom-scrollbar p-2 transition-colors shadow-inner"
                         :class="isDark ? 'bg-[#1A1C1E] border-white/10' : 'bg-gray-50 border-gray-200'">
                        <div v-for="m in potentialManagers" :key="m.user_id" 
                             class="flex items-center p-3 rounded-xl border border-transparent transition-all cursor-pointer mb-1 last:mb-0"
                             :class="isDark ? 'hover:bg-white/5 hover:border-white/5' : 'hover:bg-white hover:border-gray-200'"
                             @click="bulkDeptState.selectedManagers.includes(m.user_id) ? bulkDeptState.selectedManagers.splice(bulkDeptState.selectedManagers.indexOf(m.user_id), 1) : bulkDeptState.selectedManagers.push(m.user_id)">
                            <input type="checkbox" :value="m.user_id" v-model="bulkDeptState.selectedManagers" 
                                   class="h-5 w-5 rounded-lg transition-colors cursor-pointer border-gray-300 text-indigo-600 focus:ring-indigo-500/50" @click.stop>
                            <div class="ml-4">
                                <div class="text-sm font-bold transition-colors" :class="isDark ? 'text-gray-300' : 'text-[#444746]'">{{ m.full_name }}</div>
                                <div class="text-[10px] uppercase font-bold transition-colors" :class="isDark ? 'text-gray-600' : 'text-[#727775]'">{{ m.title || 'Manager' }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="p-6 border-t flex justify-end gap-3 transition-colors"
                 :class="isDark ? 'border-white/5 bg-[#232527]/50' : 'border-[rgba(0,0,0,0.08)] bg-gray-50'">
                <button @click="closeDeptModal" class="px-4 py-2 text-sm font-bold transition-colors" :class="isDark ? 'text-gray-400 hover:text-white' : 'text-[#727775] hover:text-[#1f1f1f]'">{{ $t('user_manage.btn_cancel') }}</button>
                <button @click="saveBulkDeptManagers" :disabled="!isBulkValid || saving" 
                        class="px-8 py-2.5 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all font-bold shadow-lg shadow-indigo-600/20 active:scale-95 disabled:opacity-50">
                    <div class="flex items-center gap-2">
                        <svg v-if="saving" class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <span>{{ saving ? $t('user_manage.btn_saving') : $t('user_manage.bulk_confirm') }}</span>
                    </div>
                </button>
            </div>
        </div>
    </div>

    <!-- Import AD Modal -->
    <div v-if="showImportModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div class="rounded-2xl border w-full max-w-2xl shadow-2xl flex flex-col max-h-[85vh] transition-all overflow-hidden"
             :class="isDark ? 'bg-[#1E1F20] border-white/10' : 'bg-white border-[rgba(0,0,0,0.12)]'">
            <div class="p-6 border-b flex items-center gap-4 transition-colors"
                 :class="isDark ? 'border-white/5' : 'border-[rgba(0,0,0,0.08)]'">
                <div class="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                </div>
                <div>
                    <h3 class="text-xl font-bold transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">{{ $t('user_manage.modal_import_title') }}</h3>
                    <p class="text-xs transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">Find and import users from Active Directory</p>
                </div>
            </div>
            <div class="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
                <div class="flex gap-3">
                    <div class="relative flex-1">
                        <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </span>
                        <input v-model="importSearchText" @keyup.enter="searchAD" type="text" 
                               :placeholder="$t('user_manage.import_placeholder')" 
                               class="w-full pl-9 p-3 rounded-xl border transition-all text-sm outline-none focus:ring-2 focus:ring-green-500/50"
                               :class="isDark ? 'bg-[#1A1C1E] text-white border-white/10' : 'bg-gray-50 text-[#1f1f1f] border-gray-200'">
                    </div>
                    <button @click="searchAD" :disabled="searchingAD || importSearchText.length < 3" 
                            class="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-500 transition-all shadow-lg shadow-green-600/20 active:scale-95 disabled:opacity-50">
                      <div class="flex items-center gap-2">
                        <svg v-if="searchingAD" class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <span>{{ searchingAD ? '...' : $t('user_manage.btn_search') }}</span>
                      </div>
                    </button>
                </div>

                <div v-if="adSearchResults.length > 0" class="space-y-3">
                    <div v-for="u in adSearchResults" :key="u.username" 
                         class="p-4 rounded-2xl border transition-all flex justify-between items-center group shadow-sm"
                         :class="isDark ? 'bg-[#1A1C1E] border-white/5 hover:border-green-500/50' : 'bg-gray-50 border-gray-200 hover:border-green-400'">
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center font-bold">
                                {{ u.full_name.charAt(0).toUpperCase() }}
                            </div>
                            <div>
                                <div class="font-bold transition-colors" :class="isDark ? 'text-white' : 'text-[#1f1f1f]'">{{ u.full_name }}</div>
                                <div class="text-[10px] uppercase font-bold transition-colors" :class="isDark ? 'text-gray-500' : 'text-[#727775]'">{{ u.department }} <span class="mx-1 opacity-30">|</span> {{ u.title }}</div>
                            </div>
                        </div>
                        <button @click="importUser(u)" 
                                class="text-xs font-bold px-5 py-2 rounded-xl transition-all shadow-md active:scale-90"
                                :class="isDark ? 'bg-white/10 text-white hover:bg-green-600' : 'bg-white text-green-600 border border-green-200 hover:bg-green-600 hover:text-white'">
                            {{ $t('user_manage.btn_import') }}
                        </button>
                    </div>
                </div>
            </div>
            <div class="p-6 border-t flex justify-end transition-colors"
                 :class="isDark ? 'border-white/5 bg-[#232527]/50' : 'border-[rgba(0,0,0,0.08)] bg-gray-50'">
                <button @click="closeImportModal" class="px-6 py-2 text-sm font-bold transition-colors" :class="isDark ? 'text-gray-400 hover:text-white' : 'text-[#727775] hover:text-[#1f1f1f]'">{{ $t('user_manage.btn_close') }}</button>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, inject, getCurrentInstance } from 'vue';
import { useModalStore } from '@/stores/modalStore';
import Pagination from '../../components/Pagination.vue';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '@/stores/userStore';
import { useTheme } from '@/composables/useTheme';

const { isDark } = useTheme();
const { proxy } = getCurrentInstance(); 
const $api = proxy.$api; 
const userStore = useUserStore();

const { t } = useI18n(); 
const isCollapsed = inject('isCollapsed', ref(false));

const users = ref([]);
const loading = ref(false);
const saving = ref(false);
const searchText = ref('');
const filterRole = ref('');
const sortKey = ref('user_id');
const sortOrder = ref('asc');

const modalStore = useModalStore();

// Modals State
const showModal = ref(false);
const showDeptModal = ref(false);
const showImportModal = ref(false);

// Edit & Import State
const editingUser = ref({});
const selectedManagerIds = ref([]); 
const importSearchText = ref('');
const adSearchResults = ref([]);
const searchingAD = ref(false);

// Bulk & Mapping State
const bulkDeptState = ref({ 
    selectedDept: '', 
    selectedManagers: [], 
    selectedUserIds: [] 
});

const currentPage = ref(1);
const itemsPerPage = 9;

// ✅ Sync Search & Pagination
watch([searchText, filterRole], () => {
    currentPage.value = 1;
});

const getAuthOptions = () => {
    const token = userStore.getAuthToken;
    if (!token) return null;
    return { headers: { Authorization: `Bearer ${token}` } };
};

// --- API ACTIONS ---

// ✅ Sequential Bulk Assign (Fix 500 error & Missing managers for new users)
const saveBulkDeptManagers = async () => {
    if (!bulkDeptState.value.selectedDept || bulkDeptState.value.selectedManagers.length === 0) {
        return modalStore.alert(t('user_manage.select_manager_first'), t('user_manage.error_title'), 'error');
    }

    saving.value = true;
    const options = getAuthOptions();
    if (!options || !$api) return;

    const uniqueMgrIds = [...new Set(bulkDeptState.value.selectedManagers)];
    const managerIdStr = uniqueMgrIds.join(',');

    try {
        // 1. Update Department Template Template
        await $api.post('/users/department-manager', {
            department_name: bulkDeptState.value.selectedDept,
            manager_id: managerIdStr
        }, options);

        // 2. Update Current Employees in Dept (Sequential to avoid SQL Locks)
        const finalUserIds = usersInSelectedDept.value.map(u => u.user_id);
        
        for (const userId of finalUserIds) {
            const userObj = users.value.find(u => u.user_id === userId);
            await $api.post('/users/update', {
                user_id: userId,
                role: userObj?.role || 'USER',
                manager_id: managerIdStr,
                is_active: userObj ? userObj.is_active : true,
                level_rank: userObj?.level_rank || 99 // Keep existing rank
            }, options);
        }

        modalStore.alert(t('user_manage.alert_save_success'), t('user_manage.success_title'), 'success');
        closeDeptModal();
        fetchUsers();
    } catch (error) {
        console.error("Bulk Mapping Error:", error);
        modalStore.alert(t('user_manage.alert_error_prefix') + (error.response?.data?.message || error.message), t('user_manage.error_title'), 'error');
    } finally {
        saving.value = false;
    }
};

// ✅ Save User Individual (Support Rank)
const saveUser = async () => {
    saving.value = true;
    if (!$api) return;
    const options = getAuthOptions();
    if (!options) { saving.value = false; return; }

    try {
        const uniqueMgrIds = [...new Set(selectedManagerIds.value)];
        const managerIdStr = uniqueMgrIds.length > 0 ? uniqueMgrIds.join(',') : null;

        const response = await $api.post('/users/update', {
            user_id: editingUser.value.user_id,
            role: editingUser.value.role,
            manager_id: managerIdStr,
            is_active: editingUser.value.is_active,
            level_rank: editingUser.value.level_rank || 99 // ✅ New Rank Param
        }, options);
        
        if (response.data.success) {
            fetchUsers();
            closeModal();
            modalStore.alert(t('user_manage.alert_save_success'), t('user_manage.success_title'), 'success');
        }
    } catch (error) {
        modalStore.alert(t('user_manage.alert_error_prefix') + (error.response?.data?.message || error.message), t('user_manage.error_title'), 'error');
    } finally { saving.value = false; }
};

// --- HELPERS ---
const getManagerNames = (managerIdStr) => {
    if (!managerIdStr) return [];
    const ids = String(managerIdStr).split(',').map(id => parseInt(id));
    return ids.map(id => {
        const m = users.value.find(u => u.user_id === id);
        return m ? m.full_name : 'Unknown';
    });
};

const getUsersCountInDept = (dept) => users.value.filter(u => u.department === dept).length;
const departments = computed(() => [...new Set(users.value.map(u => u.department).filter(d => d && d.trim() !== ''))].sort());
const potentialManagers = computed(() => users.value.filter(u => 
    (u.title && (u.title.toLowerCase().includes('manager') || u.title.toLowerCase().includes('director'))) || 
    (u.role && u.role.toUpperCase().includes('MANAGER'))
));
const usersInSelectedDept = computed(() => users.value.filter(u => u.department === bulkDeptState.value.selectedDept));
const isBulkValid = computed(() => bulkDeptState.value.selectedDept && bulkDeptState.value.selectedManagers.length > 0);

// --- MODAL CONTROLS ---
const openEditModal = (user) => {
    editingUser.value = { ...user };
    // Init rank if null
    if (!editingUser.value.level_rank) editingUser.value.level_rank = 99;
    selectedManagerIds.value = user.manager_id ? String(user.manager_id).split(',').map(Number) : [];
    showModal.value = true;
};
const closeModal = () => { showModal.value = false; editingUser.value = {}; selectedManagerIds.value = []; };
const openDeptModal = () => { bulkDeptState.value = { selectedDept: '', selectedManagers: [], selectedUserIds: [] }; showDeptModal.value = true; };
const closeDeptModal = () => showDeptModal.value = false;
const openImportModal = () => { showImportModal.value = true; importSearchText.value = ''; adSearchResults.value = []; };
const closeImportModal = () => showImportModal.value = false;

const toggleManagerSelection = (managerId) => {
    const index = selectedManagerIds.value.indexOf(managerId);
    if (index === -1) selectedManagerIds.value.push(managerId);
    else selectedManagerIds.value.splice(index, 1);
};

const fetchUsers = async () => {
    loading.value = true;
    if (!$api) return;
    const options = getAuthOptions();
    if (!options) { loading.value = false; return; }
    try {
        const res = await $api.get('/users/list', options);
        if(res.data.success) users.value = res.data.data;
    } catch(e) { console.error(e); } 
    finally { loading.value = false; }
};

const syncUsersFromAD = async () => {
    loading.value = true;
    if (!$api) return;
    const options = getAuthOptions();
    try {
        const res = await $api.post('/users/sync-ad', {}, options);
        if(res.data.success) {
            modalStore.alert(res.data.message, t('user_manage.alert_sync_success'), 'success');
            fetchUsers();
        }
    } catch(e) { modalStore.alert(t('user_manage.alert_sync_failed'), t('user_manage.error_title'), 'error'); }
    finally { loading.value = false; }
};

const searchAD = async () => {
    if (importSearchText.value.trim().length < 3) return;
    searchingAD.value = true;
    const options = getAuthOptions();
    try {
        const res = await $api.get(`/users/ad-search?q=${encodeURIComponent(importSearchText.value)}`, options);
        if(res.data.success) adSearchResults.value = res.data.data;
    } finally { searchingAD.value = false; }
};

const importUser = async (u) => {
    const options = getAuthOptions();
    try {
        const res = await $api.post('/users/import', u, options);
        if(res.data.success) {
            modalStore.alert(t('user_manage.alert_import_success', { name: u.full_name }), t('user_manage.success_title'), 'success');
            fetchUsers();
        }
    } catch(e) { modalStore.alert(e.response?.data?.message || 'Error', t('user_manage.error_title'), 'error'); }
};

const sortUsers = (key) => {
    if (sortKey.value === key) sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
    else { sortKey.value = key; sortOrder.value = 'asc'; }
};

// Search Logic
const filteredUsers = computed(() => {
    let result = users.value.filter(u => {
        const roleMatch = !filterRole.value || u.role === filterRole.value;
        const search = searchText.value.toLowerCase().trim();
        const fullName = (u.full_name || '').toLowerCase();
        const username = (u.username || '').toLowerCase();
        const email = (u.email || '').toLowerCase();
        const department = (u.department || '').toLowerCase();
        const textMatch = !search || fullName.includes(search) || username.includes(search) || email.includes(search) || department.includes(search);
        return roleMatch && textMatch;
    });

    return result.sort((a, b) => {
        let modifier = sortOrder.value === 'asc' ? 1 : -1;
        const valA = a[sortKey.value] ?? '';
        const valB = b[sortKey.value] ?? '';
        if (valA < valB) return -1 * modifier;
        if (valA > valB) return 1 * modifier;
        return 0;
    });
});

const totalPages = computed(() => Math.ceil(filteredUsers.value.length / itemsPerPage));
const paginatedUsers = computed(() => filteredUsers.value.slice((currentPage.value - 1) * itemsPerPage, currentPage.value * itemsPerPage));
const getRoleClasses = (role) => role === 'ADMIN' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-gray-500/10 text-gray-300 border-gray-500/20';

onMounted(() => {
    if (userStore.isLoggedIn) fetchUsers();
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #6b7280; }
</style>
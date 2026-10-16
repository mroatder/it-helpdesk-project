<template>
    <div class="space-y-6 p-6 font-sans max-w-7xl mx-auto text-gray-300 pb-24">
        
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h2 class="text-2xl font-bold text-white tracking-wide">{{ $t('admin_dashboard.title') }}</h2>
                <div class="flex flex-wrap items-center gap-2 mt-1">
                     <p class="text-sm text-gray-300 mr-2">{{ $t('admin_dashboard.subtitle') }}</p>
                     
                     <transition-group name="fade" tag="div" class="flex flex-wrap gap-2 ml-2">
                         <span v-if="activeFilters.type" class="bg-blue-500/20 text-blue-300 text-xs px-2 py-0.5 rounded border border-blue-500/30 flex items-center gap-1 cursor-pointer hover:bg-red-500/20 hover:text-red-300 transition-colors" @click="toggleFilter('type', null)">
                             {{ $t('admin_dashboard.type_filter') }}: {{ activeFilters.type }} <span class="text-xs ml-1">×</span>
                         </span>
                         <span v-if="activeFilters.priority" class="bg-orange-500/20 text-orange-300 text-xs px-2 py-0.5 rounded border border-orange-500/30 flex items-center gap-1 cursor-pointer hover:bg-red-500/20 hover:text-red-300 transition-colors" @click="toggleFilter('priority', null)">
                             {{ $t('admin_dashboard.priority_filter') }}: {{ activeFilters.priority }} <span class="text-xs ml-1">×</span>
                         </span>
                         <span v-if="activeFilters.subject" class="bg-purple-500/20 text-purple-300 text-xs px-2 py-0.5 rounded border border-purple-500/30 flex items-center gap-1 cursor-pointer hover:bg-red-500/20 hover:text-red-300 transition-colors" @click="toggleFilter('subject', null)">
                             {{ $t('admin_dashboard.subject_filter') }}: {{ activeFilters.subject }} <span class="text-xs ml-1">×</span>
                         </span>
                         <span v-if="activeFilters.date" class="bg-green-500/20 text-green-300 text-xs px-2 py-0.5 rounded border border-green-500/30 flex items-center gap-1 cursor-pointer hover:bg-red-500/20 hover:text-red-300 transition-colors" @click="toggleFilter('date', null)">
                             {{ $t('admin_dashboard.date_filter') }}: {{ activeFilters.date }} <span class="text-xs ml-1">×</span>
                         </span>
                         <span v-if="hasAnyFilter" class="text-xs text-gray-500 underline cursor-pointer hover:text-white self-center ml-1" @click="clearAllFilters">
                             {{ $t('admin_dashboard.clear_all') }}
                         </span>
                     </transition-group>
                </div>
            </div>
            
            <div class="flex items-center gap-3">
                <div class="relative">
                     <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                       <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                     </div>
                     <input 
                         type="month" 
                         v-model="filterMonth" 
                         @change="onManualDateChange"
                         class="bg-[#333333] border border-white/10 text-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                         :placeholder="$t('admin_dashboard.select_month')"
                     >
                </div>
                <div class="flex items-center gap-1 bg-[#333333] p-1 rounded-lg border border-white/10 h-[42px]">
                    <button 
                        type="button"
                        @click="setQuickPeriod('6M')"
                        :class="[
                            'px-3 py-1.5 text-[10px] font-bold rounded-md transition-all whitespace-nowrap',
                            activeQuickPeriod === '6M' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'
                        ]"
                    >
                        {{ $t('admin_dashboard.six_months') }}
                    </button>
                    <button 
                        type="button"
                        @click="setQuickPeriod('1Y')"
                        :class="[
                            'px-3 py-1.5 text-[10px] font-bold rounded-md transition-all whitespace-nowrap',
                            activeQuickPeriod === '1Y' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'
                        ]"
                    >
                        {{ $t('admin_dashboard.one_year') }}
                    </button>
                </div>

                <div class="inline-flex items-center bg-[#333333] px-3 py-2.5 rounded-lg border border-white/10 shadow-sm h-[42px]">
                    <div class="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                    <span class="text-xs text-gray-300">{{ $t('admin_dashboard.online') }}</span>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="bg-[#333333] p-5 rounded-2xl border border-white/5 shadow-md hover:border-orange-500/50 transition-all duration-300 group">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{{ $t('admin_dashboard.stats_waiting') }}</p>
                        <h3 class="text-3xl font-bold text-white mt-2 group-hover:text-orange-400 transition-colors">{{ loading ? '...' : stats.waiting }}</h3>
                    </div>
                    <div class="p-2.5 bg-orange-500/10 rounded-xl text-orange-400 group-hover:scale-110 transition-transform flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>
                <div class="mt-4 flex items-center text-xs text-gray-400">
                    <span class="text-orange-400 font-bold mr-1">{{ $t('admin_dashboard.stats_waiting_desc') }}</span> {{ filterMonth ? $t('admin_dashboard.this_month') : $t('admin_dashboard.all_time') }}
                </div>
            </div>

            <div class="bg-[#333333] p-5 rounded-2xl border border-white/5 shadow-md hover:border-blue-500/50 transition-all duration-300 group">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{{ $t('admin_dashboard.stats_doing') }}</p>
                        <h3 class="text-3xl font-bold text-white mt-2 group-hover:text-blue-400 transition-colors">{{ loading ? '...' : stats.doing }}</h3>
                    </div>
                    <div class="p-2.5 bg-blue-500/10 rounded-xl text-blue-400 group-hover:scale-110 transition-transform flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 animate-[spin_4s_linear_infinite]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                </div>
                <div class="mt-4 flex items-center text-xs text-gray-400">
                    <span class="text-blue-400 font-bold mr-1">{{ $t('admin_dashboard.stats_doing_desc') }}</span> {{ filterMonth ? $t('admin_dashboard.this_month') : $t('admin_dashboard.stats_doing') }}
                </div>
            </div>

            <div class="bg-[#333333] p-5 rounded-2xl border border-white/5 shadow-md hover:border-emerald-500/50 transition-all duration-300 group">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{{ $t('admin_dashboard.stats_done') }}</p>
                        <h3 class="text-3xl font-bold text-white mt-2 group-hover:text-emerald-400 transition-colors">{{ loading ? '...' : stats.done }}</h3>
                    </div>
                    <div class="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 transition-transform flex-shrink-0 group-hover:animate-bounce">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>
                <div class="mt-4 flex items-center text-xs text-gray-400">
                    <span class="text-emerald-400 font-bold mr-1">{{ $t('admin_dashboard.stats_done_desc') }}</span> {{ filterMonth ? $t('admin_dashboard.this_month') : $t('admin_dashboard.all_time') }}
                </div>
            </div>

            <div class="bg-[#333333] p-5 rounded-2xl border border-white/5 shadow-md hover:border-rose-500/50 transition-all duration-300 group">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{{ $t('admin_dashboard.total_tickets') }}</p>
                        <h3 class="text-3xl font-bold text-white mt-2 group-hover:text-rose-400 transition-colors">{{ loading ? '...' : (stats.waiting + stats.doing + stats.done) }}</h3>
                    </div>
                    <div class="p-2.5 bg-rose-500/10 rounded-xl text-rose-400 group-hover:scale-110 transition-transform flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                    </div>
                </div>
                <div class="mt-4 flex items-center text-xs text-gray-400">
                    <span class="text-rose-400 font-bold mr-1">{{ $t('admin_dashboard.total_tickets_status') }}</span>{{ filterMonth ? $t('admin_dashboard.total_tickets_period') : $t('admin_dashboard.all_time') }}
                </div>
            </div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="bg-[#333333] p-6 rounded-2xl border border-white/5 shadow-md relative group">
                <div class="absolute top-4 right-4 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                    <span class="bg-black/80 text-white px-2 py-1 rounded border border-white/10">{{ $t('admin_dashboard.filter_type_hint') }}</span>
                </div>
                <h3 class="text-white font-bold mb-4 flex items-center gap-2">
                    <svg class="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="10" width="4" height="10" rx="1.5"></rect>
                        <rect x="10" y="6" width="4" height="14" rx="1.5"></rect>
                        <rect x="17" y="3" width="4" height="17" rx="1.5"></rect>
                    </svg>
                    <span>{{ $t('admin_dashboard.chart_ticket_type') }}</span>
                
                
                </h3>
                <div class="h-64 relative cursor-pointer">
                    <Bar v-if="!loading" :data="ticketTypeData" :options="groupedBarOptions" />
                </div>
            </div>
        
            <div class="bg-[#333333] p-6 rounded-2xl border border-white/5 shadow-md relative group">
                <div class="absolute top-4 right-4 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                    <span class="bg-black/80 text-white px-2 py-1 rounded border border-white/10">{{ $t('admin_dashboard.filter_date_hint') }}</span>
                </div>
                <h3 class="text-white font-bold mb-4 flex items-center gap-2">
                
                    <span>{{ $t('admin_dashboard.chart_trend') }}</span>
                
                
                </h3>
                <div class="h-64 relative cursor-pointer">
                    <Line v-if="!loading" :data="trendData" :options="trendOptions" />
                </div>
            </div>
                        <div class="bg-[#333333] p-6 rounded-2xl border border-white/5 shadow-md relative group">
                <div class="absolute top-4 right-4 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                    <span class="bg-black/80 text-white px-2 py-1 rounded border border-white/10">{{ $t('admin_dashboard.filter_priority_hint') }}</span>
                </div>
                <h3 class="text-white font-bold mb-4 flex items-center gap-2">
                
                    {{ $t('admin_dashboard.chart_priority') }}
                </h3>
                <div class="h-56 flex justify-center relative cursor-pointer">
                    <Doughnut v-if="!loading" :data="priorityDoughnutData" :options="doughnutOptions" />
                </div>
            </div>
        
            <div class="bg-[#333333] p-6 rounded-2xl border border-white/5 shadow-md relative group">
                <div class="absolute top-4 right-4 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                    <span class="bg-black/80 text-white px-2 py-1 rounded border border-white/10">{{ $t('admin_dashboard.filter_subject_hint') }}</span>
                </div>
                <h3 class="text-white font-bold mb-4 flex items-center gap-2">
                
                    {{ $t('admin_dashboard.chart_subject') }}
                </h3>
                <div class="h-64 relative cursor-pointer">
                    <Bar v-if="!loading" :data="subjectBreakdownData" :options="stackedBarOptions" />
                </div>
            </div>
        
            <div class="bg-[#333333] p-6 rounded-2xl border border-white/5 shadow-md relative group">
                <h3 class="text-white font-bold mb-4 flex items-center gap-2">
                
                    <span>{{ $t('admin_dashboard.resolution_time_title') }}</span>
                </h3>
                <div class="h-56 flex justify-center relative cursor-pointer">
                    <Doughnut v-if="!loading" :data="resolutionChartData" :options="doughnutOptions" />
                </div>
                <div class="mt-2 text-center text-sm text-gray-300">
                    <span class="text-xs text-gray-400 mr-1">Avg:</span>
                    <strong class="text-white">{{ avgResponseHours !== null ? avgResponseHours.toFixed(1) + ' hrs' : '-' }}</strong>
                </div>
            </div>
        
            <div class="bg-[#333333] p-6 rounded-2xl border border-white/5 shadow-md relative group">
                <h3 class="text-white font-bold mb-4 flex items-center gap-2">
                
                    <span>{{ $t('admin_dashboard.top_departments_title') }}</span>
                </h3>
                <div class="h-64 w-full"> 
                    <Bar 
                        :data="deptTicketChartData" 
                        :options="ticketChartOptions" 
                    />
                </div>
            </div>
        </div>

        <div class="bg-[#333333] rounded-2xl border border-white/5 shadow-lg overflow-hidden">
            <div class="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-[#2F2F2F]">
                <div>
                    <h3 class="font-bold text-white text-lg flex items-center gap-2">
                         {{ $t('admin_dashboard.recent_tickets') }}
                         <span v-if="hasAnyFilter" class="text-xs font-normal text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded bg-blue-500/10">{{ $t('admin_dashboard.filtered_view') }}</span>
                    </h3>
                    <p class="text-xs text-gray-400 mt-0.5">{{ $t('admin_dashboard.showing_items', { count: filteredRecentTickets.length }) }}</p>
                </div>
                <button 
                    @click="$router.push('/app/admin/tickets')"
                    class="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium border border-blue-500/30 px-3 py-1.5 rounded-lg hover:bg-blue-500/10 whitespace-nowrap"
                >
                    {{ $t('admin_dashboard.view_all') }}
                </button>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm text-gray-300">
                    <thead class="bg-[#2a2a2a] text-gray-400 font-medium uppercase text-[11px] tracking-wider">
                        <tr>
                            <th class="px-6 py-4">{{ $t('admin_dashboard.col_ticket_no') }}</th>
                            <th class="px-6 py-4">{{ $t('admin_dashboard.col_subject') }}</th>
                            <th class="px-6 py-4">{{ $t('admin_dashboard.col_user') }}</th>
                            <th class="px-6 py-4">{{ $t('admin_dashboard.col_status') }}</th>
                            <th class="px-6 py-4">{{ $t('admin_dashboard.col_time') }}</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-white/5">
                        <tr v-if="filteredRecentTickets.length === 0 && !loading">
                             <td colspan="5" class="text-center py-8 text-gray-500">
                                <span v-if="hasAnyFilter">{{ $t('admin_dashboard.no_data') }}</span>
                                <span v-else>{{ $t('admin_dashboard.no_recent') }}</span>
                             </td>
                        </tr>
                        <tr 
                            v-for="ticket in filteredRecentTickets" 
                            :key="ticket.id" 
                            @click="goToDetail(ticket.id)"
                            class="hover:bg-[#3a3a3a] transition-colors group cursor-pointer"
                        >
                            <td class="px-6 py-4 font-mono text-blue-400 font-medium">{{ ticket.ticket_no }}</td>
                            <td class="px-6 py-4 font-medium text-white group-hover:text-blue-300 transition-colors">{{ ticket.subject }}</td>
                            <td class="px-6 py-4 flex items-center gap-3">
                                 <div class="w-7 h-7 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-[10px] text-white font-bold shadow-sm uppercase flex-shrink-0">
                                     {{ ticket.requester_name ? ticket.requester_name.substring(0,2) : 'UK' }}
                                 </div>
                                 <span class="truncate">{{ ticket.requester_name || 'Unknown' }}</span>
                            </td>
                            <td class="px-6 py-4">
                                <span 
                                     class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border whitespace-nowrap"
                                     :class="getStatusClass(ticket.status)"
                                >
                                     <span class="w-1.5 h-1.5 rounded-full" :class="getStatusDotClass(ticket.status)"></span> 
                                     {{ ticket.status }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-gray-500 whitespace-nowrap">{{ formatDate(ticket.created_at) }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="border-t border-white/10 pt-8 mt-4">
            <h2 class="text-xl font-bold text-white mb-6 flex items-center gap-2">
                 <svg class="w-6 h-6 text-purple-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                 {{ $t('admin_dashboard.asset_analytics') }}
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div class="bg-[#333333] p-5 rounded-2xl border border-white/5 shadow-md hover:border-purple-500/50 transition-all duration-300 group">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{{ $t('admin_dashboard.stats_assets') }}</p>
                            <h3 class="text-3xl font-bold text-white mt-2 group-hover:text-purple-400 transition-colors">{{ loading ? '...' : stats.assets }}</h3>
                        </div>
                        <div class="p-2.5 bg-purple-500/10 rounded-xl text-purple-400 group-hover:animate-[wiggle_1s_ease-in-out_infinite] transition-transform flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        </div>
                    </div>
                    <div class="mt-4 flex items-center text-xs text-gray-400">
                        <span class="text-purple-400 font-bold mr-1">Total</span> Computers In System
                    </div>
                </div>

                <div class="bg-[#333333] p-5 rounded-2xl border border-white/5 shadow-md hover:border-emerald-500/50 transition-all duration-300 group">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{{ $t('admin_dashboard.lifetime_ups') }}</p>
                            <h3 class="text-3xl font-bold text-white mt-2 group-hover:text-emerald-400 transition-colors">{{ loading ? '...' : upsHealthyCount }}</h3>
                        </div>
                        <div class="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 transition-transform flex-shrink-0 group-hover:animate-bounce">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                    </div>
                    <div class="mt-4 flex items-center text-xs text-gray-400">
                        <span class="text-emerald-400 font-bold mr-1">Active</span> Used &lt; 2 Years
                    </div>
                </div>

                <div class="bg-[#333333] p-5 rounded-2xl border border-white/5 shadow-md hover:border-red-500/50 transition-all duration-300 group">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{{ $t('admin_dashboard.lifetime_computer') }}</p>
                            <h3 class="text-3xl font-bold text-white mt-2 group-hover:text-red-400 transition-colors">
                                {{ loading ? '...' : agedAssetsCount }}
                            </h3>
                        </div>
                        <div class="p-2.5 bg-red-500/10 rounded-xl text-red-400 group-hover:scale-110 transition-transform flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <div class="mt-4 flex items-center text-xs text-gray-400">
                        <span class="text-red-400 font-bold mr-1">Outdated</span> In Use >= 7 Years
                    </div>
                </div>

                <div class="bg-[#333333] p-5 rounded-2xl border border-white/5 shadow-md hover:border-orange-500/50 transition-all duration-300 group">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{{ $t('admin_dashboard.low_ram_capacity') }}</p>
                            <h3 class="text-3xl font-bold text-white mt-2 group-hover:text-orange-400 transition-colors">{{ loading ? '...' : highRamCount }}</h3>
                        </div>
                        <div class="p-2.5 bg-orange-500/10 rounded-xl text-orange-400 transition-transform flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>
                        </div>
                    </div>
                    <div class="mt-4 flex items-center text-xs text-gray-400">
                        <span class="text-orange-400 font-bold mr-1">RAM &lt; 16GB</span> Low Performance
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 
                 <div class="bg-[#333333] p-6 rounded-2xl border border-white/5 shadow-md">
                     <h3 class="text-white font-bold mb-4 text-sm flex items-center gap-2">
                         <span class="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></span> 
                         {{ $t('admin_dashboard.chart_ram') }}
                     </h3>
                     <div class="h-60 relative">
                         <Bar v-if="!loading" :data="ramChartData" :options="commonOptions" />
                     </div>
                 </div>

                 <div class="bg-[#333333] p-6 rounded-2xl border border-white/5 shadow-md">
                     <h3 class="text-white font-bold mb-4 text-sm flex items-center gap-2">
                         <span class="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></span>
                         {{ $t('admin_dashboard.chart_disk') }}
                     </h3>
                     <div class="h-60 flex justify-center relative">
                         <Doughnut v-if="!loading" :data="diskChartData" :options="assetDoughnutOptions" />
                     </div>
                 </div>

                 <div class="bg-[#333333] p-6 rounded-2xl border border-white/5 shadow-md">
                     <h3 class="text-white font-bold mb-4 text-sm flex items-center gap-2">
                         <span class="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0"></span>
                         {{ $t('admin_dashboard.chart_dept') }}
                     </h3>
                     <div class="h-60 relative">
                         <Bar 
                            :data="deptChartData" 
                            :options="assetChartOptions" 
                        />
                     </div>
                 </div>

                 <div class="bg-[#333333] p-6 rounded-2xl border border-white/5 shadow-md">
                     <h3 class="text-white font-bold mb-4 text-sm flex items-center gap-2">
                         <span class="w-2 h-2 rounded-full bg-cyan-500 flex-shrink-0"></span>
                         {{ $t('admin_dashboard.chart_os') }}
                     </h3>
                     <div class="h-60 flex justify-center relative">
                         <Pie v-if="!loading" :data="osChartData" :options="assetDoughnutOptions" />
                     </div>
                 </div>

                  <div class="bg-[#333333] p-6 rounded-2xl border border-white/5 shadow-md lg:col-span-2">
                     <h3 class="text-white font-bold mb-4 text-sm flex items-center gap-2">
                         <span class="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></span>
                         {{ $t('admin_dashboard.chart_ups') }}
                     </h3>
                     <div class="h-60 relative">
                         <Bar v-if="!loading" :data="upsChartData" :options="commonOptions" />
                     </div>
                     <div class="mt-2 text-xs text-gray-400 flex gap-4 justify-center flex-wrap">
                         <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-green-500"></span> {{ $t('admin_dashboard.ups_good') }}</span>
                         <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-yellow-500"></span> {{ $t('admin_dashboard.ups_warning') }}</span>
                         <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-red-500"></span> {{ $t('admin_dashboard.ups_critical') }}</span>
                     </div>
                  </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, onMounted, computed, getCurrentInstance } from 'vue'; 
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n'; 
import { useUserStore } from '@/stores/userStore'; 
import { useModalStore } from '@/stores/modalStore';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend
} from 'chart.js';
import { Bar, Line, Doughnut, Pie } from 'vue-chartjs'; 
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, ChartDataLabels);

// --- 1. INITIALIZE CORE (ต้องประกาศก่อนฟังก์ชันอื่นเรียกใช้) ---
const { t } = useI18n(); 
const router = useRouter();
const modal = useModalStore();
const userStore = useUserStore(); // ✅ ประกาศ store ก่อน
const { proxy } = getCurrentInstance();
const $api = proxy.$api; // ✅ ดึง API มาเตรียมไว้

const loading = ref(true);

const getCurrentMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
};

const filterMonth = ref(getCurrentMonth());

// --- 2. STATE ---
const activeQuickPeriod = ref(null);

// ฟังก์ชันจัดการปุ่มทางลัด (6M, 1Y)
const setQuickPeriod = (period) => {
    if (activeQuickPeriod.value === period) {
        activeQuickPeriod.value = null; // ปิดสถานะถ้ากดซ้ำ
    } else {
        activeQuickPeriod.value = period; 
    }
    fetchData(); // เรียกข้อมูลใหม่ทันที
};

const onManualDateChange = () => {
    fetchData(); // ✅ เรียกดึงข้อมูลใหม่ ซึ่งตอนนี้ระบบจะรู้แล้วว่าต้องใช้ค่าจากปฏิทิน
};

const activeFilters = ref({ type: null, priority: null, subject: null, date: null });
const stats = ref({ waiting: 0, doing: 0, done: 0, assets: 0 });
const recentTickets = ref([]);
const chartRawData = ref({ 
    priority: [], 
    trend: [], 
    status: [], 
    technician: [], 
    ticketType: [], 
    subjectBreakdown: [],
    resolution: { over48h: 0, under48h: 0 }, 
    deptTickets: [] });

const assetRawData = ref([]);

// 🛡️ 3. CHECK ACCESS (ยืดหยุ่นต่อตัวพิมพ์เล็ก/ใหญ่)
const checkAccess = async () => {
    const role = userStore.userProfile?.role?.toUpperCase();
    if (role !== 'ADMIN') {
        if (modal) {
            await modal.alert(t('ticket_detail.access_denied_msg'), t('ticket_detail.access_denied_title'), "error");
        }
        router.push('/app/dashboard'); 
        return false;
    }
    return true;
};

// 📊 4. FETCH DATA (ฉบับแก้ปัญหาหน้าเทา 100%)
// --- ในส่วน STATE ---
const lastSelectedYear = ref(new Date().getFullYear()); // เก็บปีล่าสุดไว้ กันเหนียว
const fetchData = async () => {
    if (!$api) { loading.value = false; return; }
    const token = userStore.getAuthToken; 
    if (!token) { loading.value = false; return; }

    const headers = { Authorization: `Bearer ${token}` };
    
    try {
        loading.value = true; 
        const params = {};

        // 🎯 ส่งเดือนที่เลือกในปฏิทินไปเป็น "จุดเริ่มต้น"
        if (filterMonth.value) {
            params.month = filterMonth.value;
        }
        
        // 🎯 ส่งประเภทช่วงเวลาไป (6M หรือ 1Y) เพื่อให้ Backend รู้ว่าต้องนับไปกี่เดือน
        if (activeQuickPeriod.value) {
            params.period = activeQuickPeriod.value === '6M' ? '6_months' : '1_year';
        }

        // กรณี Default (ไม่ได้เลือกทั้งคู่)
        if (!filterMonth.value && !activeQuickPeriod.value) {
            params.year = lastSelectedYear.value;
        }

        const res = await $api.get('/dashboard/overview', { params, headers });
        if (res.data && res.data.success) {
            const apiData = res.data.data;
            stats.value = apiData.stats || { waiting: 0, doing: 0, done: 0, assets: 0 };
            recentTickets.value = apiData.recentTickets || [];
            chartRawData.value = apiData.charts || chartRawData.value;
        }

        // 🛡️ 4.2 เรียก Inventory
        try {
            const assetRes = await $api.get('/inventory', { headers });
            if (assetRes.data && assetRes.data.success) {
                stats.value.assets = assetRes.data.data.length; 
                assetRawData.value = assetRes.data.data;
            }
        } catch (assetErr) {
            console.error("Asset API Error (Non-fatal):", assetErr);
        }

    } catch (error) {
        console.error("❌ Main Dashboard Error:", error);
        if (error.response?.status === 403) {
            if (modal) await modal.alert(t('ticket_detail.access_denied_msg'), t('ticket_detail.access_denied_title'), "error");
            router.push('/app/dashboard');
        }
    } finally {
        loading.value = false; 
    }
};

// --- 5. COMPUTED (ดึงค่าจาก assetRawData มาคำนวณกราฟ) ---
const upsHealthyCount = computed(() => {
    const today = new Date();
    return assetRawData.value.filter(a => {
        if (!a.ups_start_date) return false;
        const start = new Date(a.ups_start_date);
        return (today - start) / (1000 * 60 * 60 * 24 * 365) < 2;
    }).length;
});

const agedAssetsCount = computed(() => {
    if (!assetRawData.value.length) return 0;
    const today = new Date();
    return assetRawData.value.filter(a => {
        if (!a.start_use_date) return false;
        const start = new Date(a.start_use_date);
        let age = today.getFullYear() - start.getFullYear();
        if (today.getMonth() < start.getMonth() || (today.getMonth() === start.getMonth() && today.getDate() < start.getDate())) age--;
        return age >= 7;
    }).length;
});

const highRamCount = computed(() => assetRawData.value.filter(a => (Number(a.total_ram_gb) || 0) < 16).length);

// --- 6. HELPERS ---
const hasAnyFilter = computed(() => Object.values(activeFilters.value).some(v => v !== null));
const toggleFilter = (key, value) => { activeFilters.value[key] = (activeFilters.value[key] === value) ? null : value; };
const clearAllFilters = () => { activeFilters.value = { type: null, priority: null, subject: null, date: null }; };
const dimColor = (currentVal, filterKey, baseColor) => {
    const activeVal = activeFilters.value[filterKey];
    if (!activeVal) return baseColor;
    return activeVal === currentVal ? baseColor : baseColor + '20';
};

// --- 7. CHART DATA COMPUTED ---
const ticketTypeData = computed(() => {
    const raw = chartRawData.value.ticketType || [];
    const dates = [...new Set(raw.map(d => d.date))]; 
    return {
        labels: dates,
        datasets: [
            { label: 'Incident', backgroundColor: dimColor('INCIDENT', 'type', '#EF4444'), data: dates.map(d => (raw.find(item => item.date === d && item.ticket_type === 'INCIDENT')?.count || 0)), borderRadius: 4 },
            { label: 'Support', backgroundColor: dimColor('SUPPORT', 'type', '#3B82F6'), data: dates.map(d => (raw.find(item => item.date === d && item.ticket_type === 'SUPPORT')?.count || 0)), borderRadius: 4 }
        ]
    };
});

// 🎯 1. คำนวณข้อมูลกราฟ Donut (ระยะเวลาแก้ไข)
const resolutionChartData = computed(() => {
    const data = chartRawData.value.resolution || { over48h: 0, under48h: 0 };
    return {
        labels: [
            t('admin_dashboard.under_48h') || 'ภายใน 48 ชม.', 
            t('admin_dashboard.over_48h') || 'เกิน 48 ชม.'
        ],
        datasets: [{
            data: [data.under48h, data.over48h],
            backgroundColor: ['#10B981', '#EF4444'], // เขียว กับ แดง
            borderWidth: 0
        }]
    };
});

const avgResponseHours = computed(() => {
    const v = chartRawData.value?.resolution?.avgHours;
    return (v !== undefined && v !== null) ? Number(v) : null;
});

const deptTicketChartData = computed(() => {
    const raw = chartRawData.value.deptTickets || [];
    // เรียงมากไปน้อย และเอาแค่ Top 5
    const top5 = [...raw].sort((a, b) => b.count - a.count).slice(0, 5);
    
    // ❌ ลบบรรทัด horizontalBarOptions.scales.x.max = ... ออก 
    // เพราะ Chart.js จะคำนวณ Max ให้เอง หรือใช้ grace ช่วยแล้ว

    return {
        labels: top5.map(d => d.department || 'ไม่ระบุ'),
        datasets: [{
            label: t('admin_dashboard.ticket_count') || 'จำนวนเคส',
            backgroundColor: '#FBBF24',
            data: top5.map(d => d.count),
            borderRadius: 4,
            barThickness: 25, // กำหนดความหนาของแท่ง
            maxBarThickness: 35
        }]
    };
});

const trendData = computed(() => {
    const labels = chartRawData.value.trend.map(d => d.date);
    return {
        labels: labels,
        datasets: [{ label: 'งานใหม่', backgroundColor: '#8B5CF6', borderColor: '#8B5CF6', data: chartRawData.value.trend.map(d => d.count), tension: 0.4 }]
    };
});

const priorityDoughnutData = computed(() => {
    const raw = chartRawData.value.priority;
    const keys = ['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'];
    const colors = ['#10B981', '#FBBF24', '#F97316', '#EF4444'];
    return {
        labels: ['Low', 'Medium', 'High', 'Critical'],
        datasets: [{ backgroundColor: keys.map((k, i) => dimColor(k, 'priority', colors[i])), data: keys.map(k => raw.find(item => item.priority === k)?.count || 0), borderWidth: 0 }]
    };
});

const subjectBreakdownData = computed(() => {
    const raw = chartRawData.value.subjectBreakdown || [];

    // 1. คำนวณหาผลรวม (Total) ของแต่ละ Subject ก่อนเพื่อใช้ในการ Sort
    const subjectTotals = raw.reduce((acc, curr) => {
        acc[curr.subject] = (acc[curr.subject] || 0) + curr.count;
        return acc;
    }, {});

    // 2. ดึงรายชื่อ Subject ออกมา และทำการเรียงลำดับจาก "มากไปน้อย"
    const subjects = [...new Set(raw.map(d => d.subject))].sort((a, b) => {
        return subjectTotals[b] - subjectTotals[a]; // b - a คือ มากไปน้อย
    });

    // 3. แสดงผลเพียง Top 10 (ถ้าต้องการ)
    const top10Subjects = subjects.slice(0, 10);

    return {
        // ตัดข้อความที่ยาวเกินไปให้แสดงเป็น ...
        labels: top10Subjects.map(s => s.length > 20 ? s.substring(0, 17) + '...' : s),
        datasets: [
            { 
                label: 'Incident', 
                backgroundColor: '#EF4444', 
                data: top10Subjects.map(s => raw.find(item => item.subject === s && item.ticket_type === 'INCIDENT')?.count || 0) 
            },
            { 
                label: 'Support', 
                backgroundColor: '#3B82F6', 
                data: top10Subjects.map(s => raw.find(item => item.subject === s && item.ticket_type === 'SUPPORT')?.count || 0) 
            }
        ]
    };
});

const ramChartData = computed(() => {
    const groups = { '4GB': 0, '8GB': 0, '16GB': 0, '32GB': 0, '>32GB': 0 };
    assetRawData.value.forEach(a => {
        const ram = Number(a.total_ram_gb) || 0;
        if (ram <= 4 && ram > 0) groups['4GB']++; else if (ram <= 8) groups['8GB']++; else if (ram <= 16) groups['16GB']++; else if (ram <= 32) groups['32GB']++; else if (ram > 32) groups['>32GB']++;
    });
    return { labels: Object.keys(groups), datasets: [{ label: 'Computers', backgroundColor: ['#EF4444', '#F59E0B', '#3B82F6', '#3B82F6', '#3B82F6'], data: Object.values(groups), borderRadius: 4 }] };
});

const diskChartData = computed(() => {
    let nvme = 0, ssdsata = 0, hdd = 0, unknown = 0;
    
    assetRawData.value.forEach(a => {
        // 1. ดึงข้อมูลก้อนใหญ่มา (เช่น "NVMe Samsung, WD Blue 1TB")
        const rawType = (a.primary_disk_type || '');
        
        // 2. ⚡️ หัวใจสำคัญ: ตัดแบ่งด้วยจุลภาค (,) เพื่อแยก Disk ออกเป็นลูกๆ
        const individualDisks = rawType.split(',').map(item => item.trim().toUpperCase());

        // 3. Loop นับแยกทีละลูก
        individualDisks.forEach(type => {
            if (!type) return; // ข้ามถ้าเป็นค่าว่าง

            // --- ใช้ Logic การเช็ค Keyword เดิมของคุณ ---
            if (type.includes('NVME') || type.includes('MZVL') || type.includes('SN580') || 
                type.includes('SN740') || type.includes('BC711') || type.includes('MTE')) {
                nvme++;
            } 
            else if (type.includes('SA510') || type.includes('SA400') || type.includes('SKC') || 
                     type.includes('SSD') || type.includes('HFS') || type.includes('MTFD')) {
                ssdsata++;
            } 
            else if (type.includes('WD10') || type.includes('ST1000') || type.includes('WDC WD') || 
                     type.includes('DT01') || type.includes('MD04')) {
                hdd++;
            } 
            else {
                // จะนับเฉพาะตัวที่มีข้อความจริงๆ ไม่นับค่าว่าง
                if (type.length > 0) unknown++;
            }
        });
    });

    return { 
        labels: ['NVMe', 'SATA SSD', 'HDD', 'Other'], 
        datasets: [{ 
            backgroundColor: ['#10B981', '#3054caff', '#F59E0B', '#6B7280'], 
            data: [nvme, ssdsata, hdd, unknown], 
            borderWidth: 0 
        }] 
    };
});

const deptChartData = computed(() => {
    const counts = {};
    assetRawData.value.forEach(a => { const d = a.department || 'N/A'; counts[d] = (counts[d] || 0) + 1; });
    const top = Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 5);
    return { labels: top.map(d => d.name), datasets: [{ label: 'Count', backgroundColor: '#8B5CF6', data: top.map(d => d.count), borderRadius: 4 }] };
});

const osChartData = computed(() => {
    const counts = {};
    assetRawData.value.forEach(a => { const os = a.os_version || 'Unknown'; counts[os] = (counts[os] || 0) + 1; });
    return { labels: Object.keys(counts), datasets: [{ backgroundColor: ['#06B6D4', '#3B82F6', '#6366F1', '#A5B4FC'], data: Object.values(counts), borderWidth: 0 }] };
});

const upsChartData = computed(() => {
    const today = new Date();
    let good = 0, warning = 0, critical = 0;
    assetRawData.value.forEach(a => {
        if (!a.ups_start_date) return;
        const diff = (today - new Date(a.ups_start_date)) / (1000 * 60 * 60 * 24 * 365);
        if (diff < 2) good++; else if (diff < 3) warning++; else critical++;
    });
    return { labels: [t('admin_dashboard.ups_good'), t('admin_dashboard.ups_warning'), t('admin_dashboard.ups_critical')], datasets: [{ label: 'Units', data: [good, warning, critical], backgroundColor: ['#10B981', '#F59E0B', '#EF4444'], borderRadius: 4 }] };
});

const filteredRecentTickets = computed(() => recentTickets.value.filter(t => {
    if (activeFilters.value.type && t.ticket_type !== activeFilters.value.type) return false;
    if (activeFilters.value.priority && t.priority !== activeFilters.value.priority) return false;
    return true;
}));

// --- 8. CHART OPTIONS (บังคับสีขาวทั้งหมด) ---
const commonOptions = { 
    responsive: true, 
    maintainAspectRatio: false, 
    plugins: { 
        legend: { display: false }, 
        datalabels: { 
            color: '#ffffff', // ✅ บังคับเป็นสีขาวชัดเจน
            font: { weight: 'bold', size: 10 }, 
            anchor: 'end', 
            align: 'end',
            offset: 4
        } 
    }, 
    scales: { 
        y: { 
            beginAtZero: true, 
            grace: '15%', 
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: '#9CA3AF' } // สีตัวเลขแกน Y
        }, 
        x: { 
            grid: { display: false },
            ticks: { color: '#9CA3AF' } // สีตัวเลขแกน X
        } 
    } 
};

// --- 8. CHART OPTIONS (แยกกันคนละตัวแปร) ---

// 🟡 1. Options สำหรับกราฟ "แจ้งซ่อม" (สีเหลือง - ค่าสูงสุดน้อย)
const ticketChartOptions = computed(() => {
    // ดึงค่า Max จากข้อมูลแจ้งซ่อม
    const raw = chartRawData.value.deptTickets || [];
    const maxVal = raw.length > 0 ? Math.max(...raw.map(d => d.count)) : 0;
    const finalMax = maxVal > 0 ? maxVal : 1; // ถ้าเป็น 0 ให้ตั้งเป็น 1

    return {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            datalabels: {
                color: '#ffffff',
                font: { weight: 'bold', size: 10 },
                anchor: 'end',
                align: 'end',
                offset: 4,
                formatter: (value) => (value > 0 ? value : '')
            }
        },
        scales: {
            x: {
                beginAtZero: true,
                max: finalMax, // ✅ บังคับค่าสูงสุดตามข้อมูลจริง
                grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false },
                ticks: {
                    color: '#9CA3AF',
                    precision: 0,
                    stepSize: 1 // ✅ ข้อมูลน้อย บังคับขยับทีละ 1
                },
                grace: '0%'
            },
            y: {
                grid: { display: false },
                ticks: {
                    color: '#ffffff',
                    font: { size: 11 },
                    autoSkip: false,
                    callback: function(value) {
                        const label = this.getLabelForValue(value);
                        return label.length > 15 ? label.substring(0, 15) + '...' : label;
                    }
                }
            }
        },
        layout: { padding: { right: 40 } }
    };
});

// 🟣 2. Options สำหรับกราฟ "คอมพิวเตอร์" (สีม่วง - ค่าสูงสุดเยอะ)
const assetChartOptions = computed(() => {
    // ดึงค่า Max จากกราฟคอมพิวเตอร์ (Top 5)
    // เราดึงจาก dataset ของ deptChartData โดยตรง
    const datasets = deptChartData.value?.datasets || [];
    const dataValues = datasets.flatMap(d => d.data);
    const maxVal = dataValues.length > 0 ? Math.max(...dataValues) : 0;
    const finalMax = maxVal > 0 ? maxVal : 1;

    return {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            datalabels: {
                color: '#ffffff',
                font: { weight: 'bold', size: 10 },
                anchor: 'end',
                align: 'end',
                offset: 4,
                formatter: (value) => (value > 0 ? value : '')
            }
        },
        scales: {
            x: {
                beginAtZero: true,
                max: finalMax, // ✅ บังคับค่าสูงสุดตามข้อมูลจริง (83)
                grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false },
                ticks: {
                    color: '#9CA3AF',
                    precision: 0,
                    // ❌ ไม่ใส่ stepSize: 1 เพราะข้อมูลเยอะ (83) ปล่อยให้ระบบคำนวณเอง ไม่งั้นเลขดำปื้ด
                },
                grace: '0%'
            },
            y: {
                grid: { display: false },
                ticks: {
                    color: '#ffffff',
                    font: { size: 11 },
                    autoSkip: false,
                    callback: function(value) {
                        const label = this.getLabelForValue(value);
                        return label.length > 15 ? label.substring(0, 15) + '...' : label;
                    }
                }
            }
        },
        layout: { padding: { right: 40 } }
    };
});

const groupedBarOptions = { 
    ...commonOptions, 
    plugins: { 
        ...commonOptions.plugins, 
        legend: { display: true, labels: { color: '#D1D5DB' } },
        datalabels: { 
            ...commonOptions.plugins.datalabels, 
            color: '#ffffff',
            // ✅ เพิ่มบรรทัดนี้: ถ้าค่าเป็น 0 ไม่ต้องแสดง label
            formatter: (value) => (value > 0 ? value : '')
        } 
    } 
};

const trendOptions = { 
    ...commonOptions, 
    plugins: {
        ...commonOptions.plugins,
        datalabels: { display: false } // กราฟเส้นปกติจะไม่โชว์ตัวเลขทับเส้น
    },
    scales: {
        x: { 
            ticks: { color: '#9CA3AF' } 
        },
        y: { 
            beginAtZero: true, 
            ticks: { 
                color: '#9CA3AF',
                // 🎯 เพิ่มส่วนนี้เพื่อให้แกน Y เพิ่มทีละ 1
                stepSize: 1,
                precision: 0
            } 
        }
    }
};

const doughnutOptions = { 
    responsive: true, 
    maintainAspectRatio: false, 
    plugins: { 
        legend: { position: 'right', labels: { color: '#D1D5DB' } },
        datalabels: { 
            color: '#ffffff',
            anchor: 'center', 
            align: 'center',
            formatter: (value) => value > 0 ? value : ''
        } 
    },
    // ✅ เพิ่มส่วนนี้เข้าไปเพื่อลบแกน X และ Y ออก
    scales: {
        x: { display: false },
        y: { display: false }
    }
};

const stackedBarOptions = { 
    ...commonOptions, 
    scales: { 
        x: { 
            stacked: true, 
            ticks: { color: '#9CA3AF' } 
        }, 
        y: { 
            stacked: true, 
            beginAtZero: true, 
            ticks: { 
                color: '#9CA3AF',
                // 🎯 เพิ่ม 2 บรรทัดนี้
                stepSize: 1,      // บังคับให้เพิ่มทีละ 1
                precision: 0      // ป้องกันการแสดงทศนิยม (ในบางกรณี)
            } 
        } 
    },
    plugins: {
        ...commonOptions.plugins,
        datalabels: { 
            color: '#ffffff',
            formatter: (value) => (value > 0 ? value : '')
        }
    }
};

const assetDoughnutOptions = { 
    ...doughnutOptions, 
    plugins: { 
        ...doughnutOptions.plugins, 
        datalabels: { 
            color: '#ffffff',
            anchor: 'center', 
            align: 'center' 
        } 
    },
    // ✅ มั่นใจว่าสั่งปิด scales ด้วย
    scales: {
        x: { display: false },
        y: { display: false }
    }
};
const goToDetail = (id) => { router.push(`/app/tickets/${id}`); };
const formatDate = (dateString) => {
    if (!dateString) return '';
    
    // สร้าง Date object จาก string ที่มาจาก Database
    const date = new Date(dateString);
    
    // ใช้ option timeZone: 'UTC' เพื่อบอกให้ JavaScript รู้ว่าข้อมูลต้นฉบับคือเวลาสากล
    // แล้วระบบจะแปลงเป็นเวลาท้องถิ่นของเครื่องผู้ใช้ (ไทย +7) ให้โดยอัตโนมัติที่ถูกต้อง
    return date.toLocaleString('th-TH', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC' // 🎯 หัวใจสำคัญคือบรรทัดนี้ครับ
    });
};

const getStatusClass = (status) => {
    switch(status) {
        case 'WAITING APPROVE': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
        case 'OPEN': case 'NEW': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
        case 'PENDING': case 'PENDING': return 'bg-orange-300/10 text-orange-400 border-orange-500/20';
        case 'IN PROGRESS': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        case 'RESOLVED': case 'CLOSED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
};

const getStatusDotClass = (status) => {
    switch(status) {
        case 'WAITING APPROVE': return 'bg-yellow-500';
        case 'OPEN': case 'NEW': return 'bg-orange-500';
        case 'PENDING': case 'PENDING': return 'bg-orange-300';
        case 'IN PROGRESS': return 'bg-blue-500';
        case 'RESOLVED': case 'CLOSED': return 'bg-emerald-500';
        default: return 'bg-gray-500';
    }
};

// --- 9. EXECUTION ---
onMounted(async () => {
    const hasAccess = await checkAccess();
    if (hasAccess) {
        await fetchData(); 
    } else {
        loading.value = false; // ถ้าไม่มีสิทธิ์ก็ปิด loading
    }
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #4B5563; border-radius: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #6B7280; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
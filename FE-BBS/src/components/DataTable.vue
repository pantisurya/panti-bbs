<template>
    <div class="border border-gray-300 rounded-md overflow-hidden shadow-sm">
        <!-- Table -->
        <div class="overflow-hidden">
            <table class="min-w-full divide-y divide-gray-300">
                <thead class="bg-gray-100">
                    <tr>
                        <th
                            class="px-3 py-3 w-12 text-center text-xs font-bold text-gray-800 uppercase tracking-wider select-none border-b border-gray-400">
                            No</th>
                        <th v-for="col in columns" :key="col.value" @click="col.sortable ? sort(col.value) : null"
                            :class="[
                                'px-4 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider select-none border-b border-gray-400',
                                col.sortable ? 'cursor-pointer hover:text-blue-600' : '',
                                sortBy === col.value ? 'text-blue-600' : ''
                            ]" style="max-width: 180px; white-space: nowrap;">
                            <span>{{ col.text }}</span>
                            <span v-if="col.sortable && sortBy === col.value">
                                <svg v-if="sortType === 'asc'" class="inline w-3 h-3 ml-1" fill="none"
                                    stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7" />
                                </svg>
                                <svg v-else class="inline w-3 h-3 ml-1" fill="none" stroke="currentColor"
                                    stroke-width="2" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </span>
                        </th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="(item, idx) in paginatedItems" :key="idx" :class="[
                        'cursor-pointer transition-all duration-200 ease-out',
                        selectedIndex === idx
                            ? 'bg-blue-50/80 selected-row'
                            : 'hover:bg-gray-50/60',
                        'active:bg-blue-100/60 active:scale-[0.998]'
                    ]" @click="selectRow(idx, item)" @keydown.enter="selectRow(idx, item)" tabindex="0">
                        <td :class="[
                            'px-3 py-3 w-12 text-center text-xs font-medium border-b border-gray-200 transition-colors duration-200',
                            selectedIndex === idx
                                ? 'text-blue-700 bg-blue-50/50'
                                : 'text-gray-600 bg-gray-50'
                        ]">
                            {{ (currentPage - 1) * selectedPageSize + idx + 1 }}
                        </td>
                        <td v-for="col in columns" :key="col.value"
                            class="px-4 py-3 whitespace-nowrap text-sm text-gray-800 border-b border-gray-200"
                            style="max-width: 180px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                            <template v-if="col.render">
                                <component :is="() => renderCell(col, item)" />
                            </template>
                            <template v-else>
                                {{ item[col.value] }}
                            </template>
                        </td>
                    </tr>
                    <tr v-if="paginatedItems.length === 0">
                        <td :colspan="columns.length + 1" class="text-center py-6 text-gray-400">No data found.</td>
                    </tr>
                </tbody>
            </table>
        </div> <!-- Minimalist Pagination -->
        <div v-if="showPagination && totalPages > 1"
            class="border-t border-gray-200 bg-white px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <!-- Left: Page Info -->
            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                <div class="text-sm text-gray-700">
                    <span class="font-medium">{{ getStartIndex() }}</span>
                    to
                    <span class="font-medium">{{ getEndIndex() }}</span>
                    of
                    <span class="font-medium">{{ getTotalItems() }}</span>
                    results
                </div>
                <!-- Page Size Selector -->
                <div class="flex items-center gap-2">
                    <span class="text-sm text-gray-500">Show</span>
                    <select v-model="selectedPageSize" @change="changePageSize"
                        class="rounded border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500 py-1 px-2">
                        <option :value="5">5</option>
                        <option :value="10">10</option>
                        <option :value="20">20</option>
                        <option :value="50">50</option>
                    </select>
                </div>
            </div>

            <!-- Right: Navigation -->
            <div class="flex items-center">
                <!-- Previous -->
                <button @click="prevPage" :disabled="currentPage === 1"
                    class="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-md"
                    :class="currentPage === 1 ? 'bg-gray-50' : 'bg-white'">
                    <span class="sr-only">Previous</span>
                    <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd"
                            d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                            clip-rule="evenodd" />
                    </svg>
                </button> <!-- Page Numbers -->
                <div class="hidden sm:flex">
                    <template v-for="(page, index) in visiblePages" :key="index">
                        <span v-if="page === '...'"
                            class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 bg-white">
                            ...
                        </span>
                        <button v-else @click="goToPage(page)"
                            class="relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                            :class="page === currentPage
                                ? 'z-10 bg-blue-600 text-white ring-blue-600'
                                : 'text-gray-900 bg-white'">
                            {{ page }}
                        </button>
                    </template>
                </div>

                <!-- Mobile: Current page indicator -->
                <div
                    class="sm:hidden relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 bg-white">
                    {{ currentPage }} / {{ totalPages }}
                </div>

                <!-- Next -->
                <button @click="nextPage" :disabled="currentPage === totalPages"
                    class="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-md"
                    :class="currentPage === totalPages ? 'bg-gray-50' : 'bg-white'">
                    <span class="sr-only">Next</span>
                    <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd"
                            d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                            clip-rule="evenodd" />
                    </svg>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, h, watch } from 'vue'

const props = defineProps({
    columns: { type: Array, required: true },
    items: { type: Array, required: true },
    pageSize: { type: Number, default: 10 },
    showPagination: { type: Boolean, default: true },
    // Server-side pagination props
    serverSide: { type: Boolean, default: false },
    totalItems: { type: Number, default: 0 },
    currentPageProp: { type: Number, default: 1 },
    totalPagesProp: { type: Number, default: 1 },
})
const emit = defineEmits(['row-click', 'page-changed', 'page-size-changed', 'sort-changed'])

const sortBy = ref('')
const sortType = ref('asc')
const currentPage = ref(props.currentPageProp || 1)
const selectedIndex = ref(null)
const selectedPageSize = ref(props.pageSize)

// Function untuk menangani render dengan aman
function renderCell(column, item) {
    if (!column.render) return item[column.value]

    try {
        const result = column.render(item[column.value], item)

        // Jika hasilnya adalah VNode (dari h()), return langsung
        if (result && typeof result === 'object' && result.type) {
            return result
        }

        // Jika hasilnya adalah string, wrap dalam span
        if (typeof result === 'string') {
            return h('span', { innerHTML: result })
        }

        // Fallback untuk yang lain
        return result || item[column.value]
    } catch (error) {
        console.warn('Error rendering cell:', error)
        return item[column.value]
    }
}

const sortedItems = computed(() => {
    // Jika server-side, tidak perlu sorting di client
    if (props.serverSide) return props.items

    if (!sortBy.value) return props.items
    return [...props.items].sort((a, b) => {
        const aVal = a[sortBy.value]
        const bVal = b[sortBy.value]
        if (aVal === bVal) return 0
        if (sortType.value === 'asc') return aVal > bVal ? 1 : -1
        return aVal < bVal ? 1 : -1
    })
})

const totalPages = computed(() => {
    // Jika server-side, gunakan totalPagesProp dari server
    if (props.serverSide) return props.totalPagesProp
    return Math.ceil(sortedItems.value.length / selectedPageSize.value)
})

const paginatedItems = computed(() => {
    // Jika server-side, data sudah dipaginasi dari server
    if (props.serverSide) return props.items

    if (!props.showPagination) return sortedItems.value
    const start = (currentPage.value - 1) * selectedPageSize.value
    return sortedItems.value.slice(start, start + selectedPageSize.value)
})

// Computed untuk visible page numbers (pagination dengan dots)
const visiblePages = computed(() => {
    const total = totalPages.value
    const current = currentPage.value
    const delta = 2 // Number of pages to show on each side of current page

    if (total <= 7) {
        // Show all pages if total is 7 or less
        return Array.from({ length: total }, (_, i) => i + 1)
    }

    const pages = []

    // Always show first page
    if (current > delta + 2) {
        pages.push(1)
        if (current > delta + 3) {
            pages.push('...')
        }
    }

    // Show pages around current page
    const start = Math.max(1, current - delta)
    const end = Math.min(total, current + delta)

    for (let i = start; i <= end; i++) {
        pages.push(i)
    }

    // Always show last page
    if (current < total - delta - 1) {
        if (current < total - delta - 2) {
            pages.push('...')
        }
        pages.push(total)
    }

    return pages.filter((page, index, arr) =>
        page === '...' || (typeof page === 'number' && arr.indexOf(page) === index)
    )
})

function sort(col) {
    if (sortBy.value === col) {
        sortType.value = sortType.value === 'asc' ? 'desc' : 'asc'
    } else {
        sortBy.value = col
        sortType.value = 'asc'
    }

    if (props.serverSide) {
        // Emit sort event untuk server-side sorting
        emit('sort-changed', { column: col, direction: sortType.value })
    } else {
        // Reset to first page when sorting (client-side)
        currentPage.value = 1
    }
}

function selectRow(idx, item) {
    selectedIndex.value = idx
    emit('row-click', item)
}

function prevPage() {
    if (currentPage.value > 1) {
        currentPage.value--
        selectedIndex.value = null // Clear selection when changing page

        if (props.serverSide) {
            emit('page-changed', currentPage.value)
        }
    }
}

function nextPage() {
    if (currentPage.value < totalPages.value) {
        currentPage.value++
        selectedIndex.value = null // Clear selection when changing page

        if (props.serverSide) {
            emit('page-changed', currentPage.value)
        }
    }
}

function goToPage(page) {
    if (page !== '...' && page >= 1 && page <= totalPages.value) {
        currentPage.value = page
        selectedIndex.value = null // Clear selection when changing page

        if (props.serverSide) {
            emit('page-changed', page)
        }
    }
}

function changePageSize() {
    // Reset to first page when changing page size
    currentPage.value = 1
    selectedIndex.value = null // Clear selection when changing page size

    if (props.serverSide) {
        emit('page-size-changed', selectedPageSize.value)
        emit('page-changed', 1)
    }
}

// Watch for changes in props (for server-side pagination)
watch(() => props.currentPageProp, (newPage) => {
    if (props.serverSide && newPage !== currentPage.value) {
        currentPage.value = newPage
    }
})

// Helper functions untuk pagination info
function getStartIndex() {
    if (props.serverSide) {
        return ((currentPage.value - 1) * selectedPageSize.value) + 1
    }
    return ((currentPage.value - 1) * selectedPageSize.value) + 1
}

function getEndIndex() {
    if (props.serverSide) {
        return Math.min(currentPage.value * selectedPageSize.value, props.totalItems)
    }
    return Math.min(currentPage.value * selectedPageSize.value, sortedItems.value.length)
}

function getTotalItems() {
    if (props.serverSide) {
        return props.totalItems
    }
    return sortedItems.value.length
}
</script>

<style scoped>
/* Soft and natural table interactions */
tr:focus {
    outline: 1px solid rgba(59, 130, 246, 0.4);
    outline-offset: 0px;
    border-radius: 2px;
}

/* Very subtle hover effect */
tr:hover:not(.selected-row) {
    background-color: rgba(248, 250, 252, 0.8);
}

/* Soft selected state with proper border */
.selected-row {
    position: relative;
    border-left: 4px solid #60a5fa;
    border-radius: 2px;
}

/* Remove the pseudo-element approach to avoid layout issues */
.selected-row::before {
    display: none;
}

/* Gentle active press effect */
tr:active {
    transform: translateY(0.5px);
    background-color: rgba(219, 234, 254, 0.4) !important;
}

/* Smooth transitions for all states */
td {
    transition: all 0.2s ease-out;
}

/* Fix table layout and spacing */
table {
    border-collapse: separate;
    border-spacing: 0;
    table-layout: fixed;
}

/* Ensure consistent row borders */
tbody tr {
    border-bottom: 1px solid rgba(229, 231, 235, 0.6);
}

tbody tr:last-child {
    border-bottom: none;
}

/* Fix column widths to prevent layout shifts */
th:first-child,
td:first-child {
    width: 60px;
    min-width: 60px;
}

/* Ensure proper cell alignment */
td {
    vertical-align: middle;
}

/* Handle selected row border properly */
.selected-row td:first-child {
    padding-left: calc(0.75rem - 4px);
}

/* Pagination button transitions */
button[aria-label]:hover:not(:disabled) {
    background-color: rgb(249 250 251);
}

/* Active page button */
button.z-10 {
    background-color: rgb(37 99 235);
    color: white;
}

/* Smooth transitions */
button {
    transition: all 0.15s ease-in-out;
}

/* Focus styles for accessibility */
button:focus {
    outline: 2px solid rgb(59 130 246);
    outline-offset: 2px;
}

/* Select dropdown styling */
select:focus {
    border-color: rgb(59 130 246);
    box-shadow: 0 0 0 1px rgb(59 130 246);
    outline: none;
}

/* Responsive pagination adjustments */
@media (max-width: 640px) {

    /* Make pagination more compact on mobile */
    .relative.inline-flex.items-center {
        padding-left: 8px;
        padding-right: 8px;
    }
}

/* Ubah border radius agar lebih kecil */
.border {
    border-radius: 4px !important;
}
</style>

<template>
    <div v-if="modelValue" class="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
        <div
            :class="['bg-white rounded-lg shadow-lg w-full overflow-hidden flex flex-col max-w-4xl max-h-[85vh]', props.class]">

            <!-- Header Section - Fixed -->
            <div class="flex justify-between items-center flex-shrink-0 p-6 pb-3">
                <h3 class="font-semibold text-lg">{{ title }}</h3>
                <div class="flex items-center gap-3">
                    <div v-if="multiple" class="flex gap-2">
                        <button type="button" @click="selectAll"
                            class="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                            :disabled="selected.length === items.length">
                            Select All
                        </button>
                        <button type="button" @click="deselectAll"
                            class="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                            :disabled="selected.length === 0">
                            Clear All
                        </button>
                    </div>
                    <div v-if="multiple && selected.length > 0" class="text-sm text-blue-600 font-medium">
                        {{ selected.length }} item dipilih
                    </div>
                </div>
            </div>

            <!-- Search Bar & Action Buttons - Fixed -->
            <div v-if="showSearch" class="flex-shrink-0 px-6 pb-3">
                <div class="flex items-center w-full gap-2">
                    <!-- Search Input -->
                    <div class="relative flex-1">
                        <input v-model="searchTerm" type="text" :placeholder="searchPlaceholder"
                            class="w-full border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent pl-10 pr-10 py-2 text-sm"
                            @input="handleSearch" />
                        <div class="absolute inset-y-0 left-0 flex items-center pointer-events-none pl-3">
                            <svg class="text-gray-400 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                        </div>
                        <div v-if="searchTerm" class="absolute inset-y-0 right-0 flex items-center pr-3">
                            <button type="button" @click="clearSearch"
                                class="text-gray-400 hover:text-gray-600 transition-colors">
                                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <!-- Action Buttons Inline -->
                    <BaseButton type="button" variant="outline" color="gray" @click="onCancel" size="xs"
                        class="text-sm px-4 py-2">
                        {{ cancelText }}
                    </BaseButton>
                    <BaseButton type="button" variant="filled" color="blue" @click="onConfirm" size="xs"
                        :disabled="selected.length === 0" class="text-sm px-4 py-2">
                        {{ confirmText }}{{ multiple && selected.length > 1 ? ` (${selected.length})` : '' }}
                    </BaseButton>
                </div>
            </div>

            <!-- DataTable Container - Scrollable dengan tinggi yang dihitung -->
            <div class="flex-1 min-h-0 px-6 pb-6">
                <div class="h-full overflow-auto border border-gray-200 rounded-lg">
                    <div class="pagination-custom-size-xl">
                        <DataTable :columns="computedColumns" :items="items" :show-pagination="showPagination"
                            :server-side="serverSide" :current-page-prop="currentPage" :page-size="pageSize"
                            :total-items="totalItems" :total-pages-prop="totalPages" table-size="compact"
                            @row-click="onRowClick" @page-changed="onPageChanged" @page-size-changed="onPageSizeChanged"
                            :row-class="row => isSelected(row) ? 'bg-blue-100 hover:bg-blue-200 border-l-4 border-blue-500' : 'hover:bg-gray-50'" />
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import DataTable from '@/components/DataTable.vue';
import BaseButton from '@/components/BaseButton.vue';

const props = defineProps({
    modelValue: Boolean,
    class: { type: String, default: '' },
    title: { type: String, default: 'Pilih Data' },
    columns: { type: Array, required: true },
    items: { type: Array, required: true },
    cancelText: { type: String, default: 'Batal' },
    confirmText: { type: String, default: 'Tambahkan' },
    selectedItems: { type: Array, default: () => [] },
    multiple: { type: Boolean, default: false },
    showSearch: { type: Boolean, default: false },
    searchPlaceholder: { type: String, default: 'Cari data...' },
    onSearch: { type: Function, default: null },
    searchDebounce: { type: Number, default: 300 },
    // Pagination props
    showPagination: { type: Boolean, default: false },
    serverSide: { type: Boolean, default: false },
    currentPage: { type: Number, default: 1 },
    pageSize: { type: Number, default: 10 },
    totalItems: { type: Number, default: 0 },
    totalPages: { type: Number, default: 1 },
});
const emit = defineEmits(['update:modelValue', 'confirm', 'cancel', 'update:selected', 'search', 'page-changed', 'page-size-changed']);

const selected = ref([...props.selectedItems]);
const searchTerm = ref('');
let searchTimeout = null;

// Computed columns dengan checkbox di kolom pertama jika multiple
const computedColumns = computed(() => {
    if (props.multiple) {
        return [
            {
                text: '',
                value: 'checkbox',
                sortable: false,
                width: '50px',
                render: (value, row) => {
                    const checked = isSelected(row);
                    return checked ?
                        `<span class="inline-flex items-center justify-center w-4 h-4 bg-blue-600 text-white rounded text-xs">✓</span>` :
                        `<span class="inline-flex items-center justify-center w-4 h-4 border-2 border-gray-300 rounded"></span>`;
                }
            },
            ...props.columns
        ];
    }
    return props.columns;
});

watch(() => props.selectedItems, (val) => {
    selected.value = [...val];
});

watch(() => props.modelValue, (val) => {
    if (!val) {
        // Reset search term ketika modal ditutup
        searchTerm.value = '';
    }
});

function isSelected(row) {
    return selected.value.some(sel => {
        if (sel && row && sel.id !== undefined && row.id !== undefined) {
            return sel.id === row.id;
        }
        // Jika tidak ada id, bandingkan seluruh property (shallow)
        if (sel && row) {
            const selKeys = Object.keys(sel);
            const rowKeys = Object.keys(row);
            if (selKeys.length !== rowKeys.length) return false;
            return selKeys.every(k => sel[k] === row[k]);
        }
        return sel === row;
    });
}

const onRowClick = (row) => {
    if (props.multiple) {
        const idx = selected.value.findIndex(sel => {
            if (sel && row && sel.id !== undefined && row.id !== undefined) {
                return sel.id === row.id;
            }
            // Jika tidak ada id, bandingkan seluruh property (shallow)
            if (sel && row) {
                const selKeys = Object.keys(sel);
                const rowKeys = Object.keys(row);
                if (selKeys.length !== rowKeys.length) return false;
                return selKeys.every(k => sel[k] === row[k]);
            }
            return sel === row;
        });

        if (idx > -1) {
            selected.value.splice(idx, 1);
        } else {
            selected.value.push(row);
        }
        emit('update:selected', [...selected.value]);
    } else {
        selected.value = [row];
        emit('update:selected', row);
    }
};

const selectAll = () => {
    selected.value = [...props.items];
    emit('update:selected', [...selected.value]);
};

const deselectAll = () => {
    selected.value = [];
    emit('update:selected', []);
};

const onCancel = () => {
    emit('update:modelValue', false);
    emit('cancel');
    selected.value = [];
    searchTerm.value = '';
};

const onConfirm = () => {
    if (selected.value.length > 0) {
        emit('confirm', props.multiple ? [...selected.value] : selected.value[0]);
        emit('update:modelValue', false);
        selected.value = [];
        searchTerm.value = '';
    } else {
        // Optionally emit a warning or handle no selection
    }
};

const handleSearch = () => {
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }

    searchTimeout = setTimeout(() => {
        if (props.onSearch && typeof props.onSearch === 'function') {
            props.onSearch(searchTerm.value);
        } else {
            // Emit search event jika tidak ada onSearch function
            emit('search', searchTerm.value);
        }
    }, props.searchDebounce);
};

const clearSearch = () => {
    searchTerm.value = '';
    handleSearch();
};

// Pagination handlers
const onPageChanged = (page) => {
    emit('page-changed', page);
};

const onPageSizeChanged = (newPageSize) => {
    emit('page-size-changed', newPageSize);
};
</script>

<style scoped>
/* Custom pagination sizing untuk modal */
.pagination-custom-size-xl :deep(.border-t) {
    padding: 0.5rem 0.75rem;
}

.pagination-custom-size-xl :deep(.text-sm) {
    font-size: 0.75rem;
}

.pagination-custom-size-xl :deep(.py-1) {
    padding-top: 0.125rem;
    padding-bottom: 0.125rem;
}

.pagination-custom-size-xl :deep(.px-2) {
    padding-left: 0.375rem;
    padding-right: 0.375rem;
}

.pagination-custom-size-xl :deep(.px-4) {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
}

.pagination-custom-size-xl :deep(.py-2) {
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
}

.pagination-custom-size-xl :deep(.h-5) {
    height: 1rem;
    width: 1rem;
}

/* Pastikan table dan container memiliki scroll behavior yang baik */
.pagination-custom-size-xl :deep(table) {
    min-width: 100%;
}

/* Override untuk memastikan tabel tidak overflow secara horizontal */
.pagination-custom-size-xl :deep(.overflow-x-auto) {
    overflow-x: visible;
}
</style>
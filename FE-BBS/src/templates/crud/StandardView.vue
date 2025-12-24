<template>
    <div>
        <!-- List View -->
        <ContentCard v-if="!showForm">
            <!-- Header with Search and Actions -->
            <div class="flex justify-between items-center mb-4">
                <div class="flex items-center gap-4">
                    <TableSearch v-model="searchTerm" :placeholder="`Cari ${entityName.toLowerCase()}...`"
                        class="flex-1 max-w-md" search-field="search" :use-url-params="true" :debounce-delay="300"
                        :loading="loading" @search="handleSearch" />
                    <StatusFilter v-model="statusFilter" :options="filterOptions" @change="handleFilterChange" />
                </div>

                <!-- Action Buttons -->
                <div class="flex items-center gap-2 ml-4">
                    <ActionButton icon="add" :title="`Add New ${entityName}`" size="md" variant="filled"
                        @click="handleAdd" />
                    <ActionButton icon="delete" title="Delete Selected" size="md" variant="filled"
                        :disabled="!selectedItem" @click="handleDelete" />
                    <ActionButton icon="view" title="View Details" size="md" variant="filled" :disabled="!selectedItem"
                        @click="handleView" />
                    <ActionButton icon="edit" title="Edit Item" size="md" variant="filled" :disabled="!selectedItem"
                        @click="handleEdit" />
                    <ActionButton icon="copy" title="Copy Item" size="md" variant="filled" :disabled="!selectedItem"
                        @click="handleCopy" />
                </div>
            </div>

            <!-- Data Table -->
            <DataTable :columns="columns" :items="filteredItems" :server-side="true" :page-size="pageSize"
                :total-items="totalItems" :current-page-prop="currentPage" :total-pages-prop="totalPages"
                :show-pagination="true" @row-click="handleRowClick" @page-changed="handlePageChanged"
                @page-size-changed="handlePageSizeChanged" @sort-changed="handleSortChanged" />
        </ContentCard>

        <!-- Form View -->
        <ContentCard v-else>
            <!-- Form Header with Divider -->
            <FormHeader :title="formTitle" :subtitle="formSubtitle" @back="handleCancel">
                <template #actions>
                    <!-- Edit button in preview mode -->
                    <ActionButton v-if="isPreviewMode" icon="edit" :title="`Edit ${entityName}`" size="md"
                        variant="filled" @click="handleEdit" />
                </template>
            </FormHeader>

            <!-- Form Content -->
            <form @submit.prevent="handleFormSubmit" class="space-y-6">
                <!-- Dynamic Form Fields Slot -->
                <slot name="form-fields" :form-data="formData" :is-preview-mode="isPreviewMode">
                    <!-- Default form fields will be overridden by slot content -->
                </slot>

                <!-- Additional Content Slot (for details tables, etc.) -->
                <slot name="additional-content" :form-data="formData" :is-preview-mode="isPreviewMode">
                    <!-- Optional additional content -->
                </slot>

                <!-- Form Actions -->
                <div v-if="!isPreviewMode" class="flex justify-end gap-3 pt-6 border-t border-gray-200">
                    <BaseButton type="button" variant="outline" color="gray" @click="handleCancel">
                        Cancel
                    </BaseButton>
                    <BaseButton type="submit" variant="filled" color="blue" :disabled="formLoading"
                        :loading="formLoading">
                        {{ submitButtonText }}
                    </BaseButton>
                </div>

                <!-- Preview Mode Actions -->
                <div v-else class="flex justify-end gap-3 pt-6 border-t border-gray-200">
                    <BaseButton type="button" variant="outline" color="gray" @click="handleCancel">
                        Back to List
                    </BaseButton>
                    <BaseButton type="button" variant="filled" color="blue" @click="handleEdit">
                        {{ `Edit ${entityName}` }}
                    </BaseButton>
                </div>
            </form>
        </ContentCard>

        <!-- Confirmation Modal -->
        <ConfirmationModal v-model="showModal" :type="modalConfig.type" v-if="modalConfig.type !== 'add' && showModal"
            :title="modalConfig.title" :subtitle="modalConfig.subtitle" :message="modalConfig.message"
            :confirm-text="modalConfig.confirmText" :cancel-text="modalConfig.cancelText" :loading="loading"
            :item-details="modalConfig.itemDetails" :show-warning="modalConfig.showWarning"
            :warning-title="modalConfig.warningTitle" :warning-message="modalConfig.warningMessage"
            :custom-icon="modalConfig.customIcon" :persistent="modalConfig.persistent" @confirm="handleModalConfirm"
            @cancel="handleModalCancel" />

        <!-- Additional Modals Slot -->
        <slot name="modals" :show-form="showForm" :form-data="formData">
            <!-- Custom modals can be added here -->
        </slot>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import DataTable from '@/components/DataTable.vue';
import TableSearch from '@/components/TableSearch.vue';
import ContentCard from '@/components/ContentCard.vue';
import ActionButton from '@/components/ActionButton.vue';
import StatusFilter from '@/components/StatusFilter.vue';
import BaseButton from '@/components/BaseButton.vue';
import FormHeader from '@/components/FormHeader.vue';
import ConfirmationModal from '@/components/ConfirmationModal.vue';
import { useConfirmationModal } from '@/composables/useConfirmationModal.js';
import { useSnackbar } from '@/composables/useSnackbar.js';

// Props
const props = defineProps({
    entityName: {
        type: String,
        required: true
    },
    // Management composable that contains all the logic
    managementComposable: {
        type: Object,
        required: true
    }
});

// Destructure the management composable
const {
    // State
    searchTerm,
    selectedItem,
    statusFilter,
    showForm,
    formData,
    formLoading,
    isEditMode,
    isPreviewMode,
    isCopyMode,
    loading,

    // Pagination state
    currentPage,
    pageSize,
    totalItems,
    totalPages,

    // Configuration
    filterOptions,
    columns,

    // Computed
    filteredItems,

    // Methods
    handleFilterChange,
    handleSearch,
    handleRowClick,
    handleView,
    handleEdit,
    handleCopy,
    handleAdd,
    handleFormSubmit,
    handleCancel,

    // Pagination methods
    handlePageChanged,
    handlePageSizeChanged,
    handleSortChanged,

    // API Methods
    deleteItem,
    fetchItems
} = props.managementComposable;

// Use confirmation modal composable
const {
    showModal,
    modalConfig,
    loading: modalLoading,
    confirmDelete: confirmDeleteModal,
    handleConfirm: handleModalConfirm,
    handleCancel: handleModalCancel,
    setLoading
} = useConfirmationModal();

// Use snackbar for notifications
const { showSuccess, showError } = useSnackbar();

// Computed properties for form titles and button text
const formTitle = computed(() => {
    if (isPreviewMode.value) return `View ${props.entityName} Details`;
    if (isEditMode.value) return `Edit ${props.entityName}`;
    if (isCopyMode.value) return `Copy ${props.entityName}`;
    return `Add New ${props.entityName}`;
});

const formSubtitle = computed(() => {
    if (isPreviewMode.value) return `View ${props.entityName.toLowerCase()} information in read-only mode`;
    if (isEditMode.value) return `Update ${props.entityName.toLowerCase()} information`;
    if (isCopyMode.value) return `Create a new ${props.entityName.toLowerCase()} based on existing data`;
    return `Create a new ${props.entityName.toLowerCase()}`;
});

const submitButtonText = computed(() => {
    if (isEditMode.value) return `Update ${props.entityName}`;
    if (isCopyMode.value) return 'Create Copy';
    return `Create ${props.entityName}`;
});

// Custom delete handler that shows modal
const handleDelete = async () => {
    if (!selectedItem.value) return;

    // Extract item details for confirmation modal
    const itemDetails = getItemDetailsForModal(selectedItem.value);

    try {
        await confirmDeleteModal(props.entityName.toLowerCase(), itemDetails);

        // Set loading state
        setLoading(true);

        // Get the selected item name before deletion
        const itemName = getItemDisplayName(selectedItem.value);

        // Perform delete
        await deleteItem(selectedItem.value.id || selectedItem.value.code);

        // Refresh the items list
        await fetchItems(searchTerm.value, '', currentPage.value, pageSize.value);

        // Clear selection
        selectedItem.value = null;

        showSuccess(`${props.entityName} "${itemName}" berhasil dihapus`);

    } catch (error) {
        if (error !== false) { // false means user cancelled
            console.error(`Error deleting ${props.entityName.toLowerCase()}:`, error);
            showError(`Gagal menghapus ${props.entityName.toLowerCase()}. Silakan coba lagi.`);
        }
    } finally {
        setLoading(false);
    }
};

// Helper function to extract item details for modal (can be overridden)
const getItemDetailsForModal = (item) => {
    return {
        'Name': item.name || item.code || '-',
        'Status': item.status === null ? '-' : (item.status ? 'Active' : 'Inactive')
    };
};

// Helper function to get item display name (can be overridden)
const getItemDisplayName = (item) => {
    return item.name || item.code || 'item';
};

// Expose functions for parent components to override
defineExpose({
    getItemDetailsForModal,
    getItemDisplayName,
    handleDelete
});
</script>

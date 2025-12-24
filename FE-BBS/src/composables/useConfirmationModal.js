import { ref } from 'vue';

export function useConfirmationModal() {
    const showModal = ref(false);
    const modalConfig = ref({
        type: 'danger',
        title: '',
        subtitle: '',
        message: '',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        itemDetails: {},
        showWarning: true,
        warningTitle: 'Warning',
        warningMessage: 'This action cannot be undone.',
        customIcon: '',
        persistent: false
    });
    const loading = ref(false);
    const resolvePromise = ref(null);
    const rejectPromise = ref(null);

    // Method to show confirmation modal
    const confirm = (config = {}) => {
        return new Promise((resolve, reject) => {
            modalConfig.value = {
                ...modalConfig.value,
                ...config
            };

            resolvePromise.value = resolve;
            rejectPromise.value = reject;
            showModal.value = true;
        });
    };

    // Predefined confirmation types
    const confirmDelete = (itemName = 'item', itemDetails = {}) => {
        return confirm({
            type: 'danger',
            title: 'Confirm Delete',
            subtitle: 'This action cannot be undone',
            message: `Are you sure you want to delete this ${itemName}?`,
            confirmText: 'Yes, Delete',
            cancelText: 'Cancel',
            itemDetails,
            showWarning: true,
            warningTitle: 'Warning',
            warningMessage: 'Deleted data cannot be recovered. Make sure you really want to delete this item.',
            customIcon: 'trash'
        });
    };

    const confirmSave = (itemName = 'item', itemDetails = {}) => {
        return confirm({
            type: 'info',
            title: 'Confirm Save',
            subtitle: 'Please review the information',
            message: `Are you sure you want to save this ${itemName}?`,
            confirmText: 'Yes, Save',
            cancelText: 'Cancel',
            itemDetails,
            showWarning: false,
            customIcon: 'save'
        });
    };

    const confirmUpdate = (itemName = 'item', itemDetails = {}) => {
        return confirm({
            type: 'warning',
            title: 'Confirm Update',
            subtitle: 'Please review the changes',
            message: `Are you sure you want to update this ${itemName}?`,
            confirmText: 'Yes, Update',
            cancelText: 'Cancel',
            itemDetails,
            showWarning: true,
            warningTitle: 'Important',
            warningMessage: 'Make sure all the information is correct before updating.',
            customIcon: 'edit'
        });
    };

    const confirmActivate = (itemName = 'item', itemDetails = {}) => {
        return confirm({
            type: 'success',
            title: 'Confirm Activation',
            subtitle: 'This will make the item active',
            message: `Are you sure you want to activate this ${itemName}?`,
            confirmText: 'Yes, Activate',
            cancelText: 'Cancel',
            itemDetails,
            showWarning: false,
            customIcon: 'check-circle'
        });
    };

    const confirmDeactivate = (itemName = 'item', itemDetails = {}) => {
        return confirm({
            type: 'warning',
            title: 'Confirm Deactivation',
            subtitle: 'This will make the item inactive',
            message: `Are you sure you want to deactivate this ${itemName}?`,
            confirmText: 'Yes, Deactivate',
            cancelText: 'Cancel',
            itemDetails,
            showWarning: true,
            warningTitle: 'Notice',
            warningMessage: 'Deactivated items will not be available for use.',
            customIcon: 'times-circle'
        });
    };

    // Handle confirmation
    const handleConfirm = () => {
        if (resolvePromise.value) {
            resolvePromise.value(true);
            resetModal();
        }
    };

    // Handle cancellation
    const handleCancel = () => {
        if (rejectPromise.value) {
            rejectPromise.value(false);
            resetModal();
        }
    };

    // Reset modal state
    const resetModal = () => {
        showModal.value = false;
        loading.value = false;
        resolvePromise.value = null;
        rejectPromise.value = null;
        modalConfig.value = {
            type: 'danger',
            title: '',
            subtitle: '',
            message: '',
            confirmText: 'Confirm',
            cancelText: 'Cancel',
            itemDetails: {},
            showWarning: true,
            warningTitle: 'Warning',
            warningMessage: 'This action cannot be undone.',
            customIcon: '',
            persistent: false
        };
    };

    // Set loading state
    const setLoading = (state) => {
        loading.value = state;
    };

    return {
        // State
        showModal,
        modalConfig,
        loading,

        // Methods
        confirm,
        confirmDelete,
        confirmSave,
        confirmUpdate,
        confirmActivate,
        confirmDeactivate,
        handleConfirm,
        handleCancel,
        setLoading,
        resetModal
    };
}

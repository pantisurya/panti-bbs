<!-- Example implementation for UserView.vue -->
<template>
    <div>
        <!-- User List with Actions -->
        <ContentCard>
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-semibold">User Management</h2>
                <div class="flex gap-2">
                    <ActionButton icon="add" @click="handleAdd">Add User</ActionButton>
                    <ActionButton icon="edit" :disabled="!selectedUser" @click="handleEdit">Edit</ActionButton>
                    <ActionButton icon="user-check" :disabled="!selectedUser" @click="handleToggleStatus">
                        {{ selectedUser?.status ? 'Deactivate' : 'Activate' }}
                    </ActionButton>
                    <ActionButton icon="trash" :disabled="!selectedUser" @click="handleDelete">Delete</ActionButton>
                </div>
            </div>

            <!-- User Table -->
            <DataTable :columns="columns" :items="users" @row-click="handleRowClick" />
        </ContentCard>

        <!-- User Form Modal -->
        <BaseModal v-model="showForm" size="lg">
            <div class="bg-white rounded-lg p-6">
                <h3 class="text-lg font-semibold mb-4">
                    {{ isEditMode ? 'Edit User' : 'Add User' }}
                </h3>

                <form @submit.prevent="handleSubmit" class="space-y-4">
                    <FormField v-model="formData.name" label="Name" required />
                    <FormField v-model="formData.email" label="Email" type="email" required />
                    <FormField v-model="formData.role" label="Role" required />
                    <FormField v-model="formData.status" label="Active" type="checkbox" />

                    <div class="flex justify-end gap-3 pt-4">
                        <BaseButton type="button" variant="outline" @click="handleCancel">
                            Cancel
                        </BaseButton>
                        <BaseButton type="submit" :loading="formLoading">
                            {{ isEditMode ? 'Update' : 'Create' }}
                        </BaseButton>
                    </div>
                </form>
            </div>
        </BaseModal>

        <!-- Confirmation Modal -->
        <ConfirmationModal v-model="showModal" :type="modalConfig.type" :title="modalConfig.title"
            :subtitle="modalConfig.subtitle" :message="modalConfig.message" :confirm-text="modalConfig.confirmText"
            :cancel-text="modalConfig.cancelText" :loading="loading" :item-details="modalConfig.itemDetails"
            :show-warning="modalConfig.showWarning" :warning-title="modalConfig.warningTitle"
            :warning-message="modalConfig.warningMessage" :custom-icon="modalConfig.customIcon"
            :persistent="modalConfig.persistent" @confirm="handleModalConfirm" @cancel="handleModalCancel" />
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import ContentCard from '@/components/ContentCard.vue';
import ActionButton from '@/components/ActionButton.vue';
import DataTable from '@/components/DataTable.vue';
import BaseModal from '@/components/BaseModal.vue';
import BaseButton from '@/components/BaseButton.vue';
import FormField from '@/components/FormField.vue';
import ConfirmationModal from '@/components/ConfirmationModal.vue';
import { useConfirmationModal } from '@/composables/useConfirmationModal.js';
import { useSnackbar } from '@/composables/useSnackbar.js';

// Snackbar
const { showSuccess, showError } = useSnackbar();

// Confirmation modal
const {
    showModal,
    modalConfig,
    loading,
    confirmDelete,
    confirmSave,
    confirmUpdate,
    confirmActivate,
    confirmDeactivate,
    handleConfirm: handleModalConfirm,
    handleCancel: handleModalCancel,
    setLoading
} = useConfirmationModal();

// Form state
const showForm = ref(false);
const isEditMode = ref(false);
const formLoading = ref(false);
const selectedUser = ref(null);
const formData = ref({
    name: '',
    email: '',
    role: '',
    status: true
});

// Sample data
const users = ref([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: true },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: false },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Manager', status: true }
]);

// Table columns
const columns = [
    { text: 'Name', value: 'name' },
    { text: 'Email', value: 'email' },
    { text: 'Role', value: 'role' },
    { text: 'Status', value: 'status', render: (value) => value ? 'Active' : 'Inactive' }
];

// Handlers
const handleRowClick = (user) => {
    selectedUser.value = user;
};

const handleAdd = () => {
    isEditMode.value = false;
    formData.value = { name: '', email: '', role: '', status: true };
    showForm.value = true;
};

const handleEdit = () => {
    if (!selectedUser.value) return;

    isEditMode.value = true;
    formData.value = { ...selectedUser.value };
    showForm.value = true;
};

const handleSubmit = async () => {
    const itemDetails = {
        'Name': formData.value.name,
        'Email': formData.value.email,
        'Role': formData.value.role,
        'Status': formData.value.status ? 'Active' : 'Inactive'
    };

    try {
        if (isEditMode.value) {
            await confirmUpdate('user', itemDetails);
        } else {
            await confirmSave('user', itemDetails);
        }

        setLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (isEditMode.value) {
            const index = users.value.findIndex(u => u.id === selectedUser.value.id);
            if (index !== -1) {
                users.value[index] = { ...formData.value, id: selectedUser.value.id };
            }
            showSuccess('User updated successfully');
        } else {
            const newUser = { ...formData.value, id: Date.now() };
            users.value.push(newUser);
            showSuccess('User created successfully');
        }

        showForm.value = false;
        selectedUser.value = null;

    } catch (error) {
        if (error !== false) {
            showError(isEditMode.value ? 'Failed to update user' : 'Failed to create user');
        }
    } finally {
        setLoading(false);
    }
};

const handleDelete = async () => {
    if (!selectedUser.value) return;

    const itemDetails = {
        'Name': selectedUser.value.name,
        'Email': selectedUser.value.email,
        'Role': selectedUser.value.role,
        'Status': selectedUser.value.status ? 'Active' : 'Inactive'
    };

    try {
        await confirmDelete('user', itemDetails);
        setLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        users.value = users.value.filter(u => u.id !== selectedUser.value.id);
        selectedUser.value = null;
        showSuccess('User deleted successfully');

    } catch (error) {
        if (error !== false) {
            showError('Failed to delete user');
        }
    } finally {
        setLoading(false);
    }
};

const handleToggleStatus = async () => {
    if (!selectedUser.value) return;

    const itemDetails = {
        'Name': selectedUser.value.name,
        'Email': selectedUser.value.email,
        'Current Status': selectedUser.value.status ? 'Active' : 'Inactive',
        'New Status': selectedUser.value.status ? 'Inactive' : 'Active'
    };

    try {
        if (selectedUser.value.status) {
            await confirmDeactivate('user', itemDetails);
        } else {
            await confirmActivate('user', itemDetails);
        }

        setLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        const index = users.value.findIndex(u => u.id === selectedUser.value.id);
        if (index !== -1) {
            users.value[index].status = !users.value[index].status;
            selectedUser.value.status = !selectedUser.value.status;
        }

        showSuccess(`User ${selectedUser.value.status ? 'activated' : 'deactivated'} successfully`);

    } catch (error) {
        if (error !== false) {
            showError('Failed to update user status');
        }
    } finally {
        setLoading(false);
    }
};

const handleCancel = () => {
    showForm.value = false;
    selectedUser.value = null;
};
</script>

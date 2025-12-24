# ConfirmationModal Component & Composable

Komponen modal konfirmasi yang dapat digunakan kembali untuk berbagai kebutuhan konfirmasi seperti delete, save, update, activate, deactivate, dll.

## Fitur

- **4 jenis modal**: danger, warning, info, success
- **Styling otomatis** berdasarkan jenis modal
- **Item details** untuk menampilkan informasi item yang akan diproses
- **Warning box** yang dapat dikustomisasi
- **Loading state** untuk operasi async
- **Promise-based** untuk kemudahan penggunaan
- **Predefined methods** untuk operasi umum

## Cara Penggunaan

### 1. Import Komponen dan Composable

```vue
<script setup>
import ConfirmationModal from '@/components/ConfirmationModal.vue';
import { useConfirmationModal } from '@/composables/useConfirmationModal.js';

// Destructure yang diperlukan
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
</script>
```

### 2. Tambahkan Komponen ke Template

```vue
<template>
  <!-- Your other components -->
  
  <ConfirmationModal 
    v-model="showModal" 
    :type="modalConfig.type"
    :title="modalConfig.title"
    :subtitle="modalConfig.subtitle"
    :message="modalConfig.message"
    :confirm-text="modalConfig.confirmText"
    :cancel-text="modalConfig.cancelText"
    :loading="loading"
    :item-details="modalConfig.itemDetails"
    :show-warning="modalConfig.showWarning"
    :warning-title="modalConfig.warningTitle"
    :warning-message="modalConfig.warningMessage"
    :custom-icon="modalConfig.customIcon"
    :persistent="modalConfig.persistent"
    @confirm="handleModalConfirm"
    @cancel="handleModalCancel"
  />
</template>
```

### 3. Implementasi Handler

#### Delete Confirmation
```javascript
const handleDelete = async () => {
  if (!selectedItem.value) return;

  const itemDetails = {
    'Name': selectedItem.value.name,
    'Category': selectedItem.value.category,
    'Status': selectedItem.value.status ? 'Active' : 'Inactive'
  };

  try {
    // Show confirmation modal
    await confirmDelete('item', itemDetails);
    
    // Set loading state
    setLoading(true);
    
    // Perform delete operation
    await deleteAPI(selectedItem.value.id);
    
    // Refresh data
    await fetchData();
    
    showSuccess('Item deleted successfully');
    
  } catch (error) {
    if (error !== false) { // false means user cancelled
      showError('Failed to delete item');
    }
  } finally {
    setLoading(false);
  }
};
```

#### Save Confirmation
```javascript
const handleSave = async () => {
  const itemDetails = {
    'Name': formData.value.name,
    'Category': formData.value.category,
    'Price': formData.value.price
  };

  try {
    await confirmSave('product', itemDetails);
    setLoading(true);
    
    await saveAPI(formData.value);
    showSuccess('Product saved successfully');
    
  } catch (error) {
    if (error !== false) {
      showError('Failed to save product');
    }
  } finally {
    setLoading(false);
  }
};
```

#### Update Confirmation
```javascript
const handleUpdate = async () => {
  const itemDetails = {
    'Name': formData.value.name,
    'Previous Status': originalData.value.status ? 'Active' : 'Inactive',
    'New Status': formData.value.status ? 'Active' : 'Inactive'
  };

  try {
    await confirmUpdate('user', itemDetails);
    setLoading(true);
    
    await updateAPI(formData.value);
    showSuccess('User updated successfully');
    
  } catch (error) {
    if (error !== false) {
      showError('Failed to update user');
    }
  } finally {
    setLoading(false);
  }
};
```

#### Activate/Deactivate Confirmation
```javascript
const handleToggleStatus = async (item) => {
  const itemDetails = {
    'Name': item.name,
    'Current Status': item.status ? 'Active' : 'Inactive',
    'Action': item.status ? 'Deactivate' : 'Activate'
  };

  try {
    if (item.status) {
      await confirmDeactivate('user', itemDetails);
    } else {
      await confirmActivate('user', itemDetails);
    }
    
    setLoading(true);
    await toggleStatusAPI(item.id);
    await fetchData();
    
    showSuccess(`User ${item.status ? 'deactivated' : 'activated'} successfully`);
    
  } catch (error) {
    if (error !== false) {
      showError('Failed to update status');
    }
  } finally {
    setLoading(false);
  }
};
```

## Predefined Methods

### confirmDelete(itemName, itemDetails)
- **Type**: danger
- **Icon**: trash
- **Default confirm text**: "Yes, Delete"
- **Warning**: Enabled by default

### confirmSave(itemName, itemDetails)
- **Type**: info
- **Icon**: save
- **Default confirm text**: "Yes, Save"
- **Warning**: Disabled by default

### confirmUpdate(itemName, itemDetails)
- **Type**: warning
- **Icon**: edit
- **Default confirm text**: "Yes, Update"
- **Warning**: Enabled by default

### confirmActivate(itemName, itemDetails)
- **Type**: success
- **Icon**: check-circle
- **Default confirm text**: "Yes, Activate"
- **Warning**: Disabled by default

### confirmDeactivate(itemName, itemDetails)
- **Type**: warning
- **Icon**: times-circle
- **Default confirm text**: "Yes, Deactivate"
- **Warning**: Enabled by default

## Custom Configuration

Jika Anda perlu konfigurasi khusus, gunakan method `confirm()`:

```javascript
const handleCustomAction = async () => {
  try {
    await confirm({
      type: 'info',
      title: 'Custom Action',
      subtitle: 'This is a custom confirmation',
      message: 'Are you sure you want to perform this action?',
      confirmText: 'Yes, Do It',
      cancelText: 'No, Cancel',
      itemDetails: {
        'Item': 'Custom Item',
        'Action': 'Custom Action'
      },
      showWarning: true,
      warningTitle: 'Important',
      warningMessage: 'This action requires special attention.',
      customIcon: 'star',
      persistent: false
    });
    
    // Your custom logic here
    
  } catch (error) {
    // Handle cancellation or error
  }
};
```

## Props Komponen

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| modelValue | Boolean | false | Control modal visibility |
| type | String | 'danger' | Modal type: 'danger', 'warning', 'info', 'success' |
| title | String | required | Modal title |
| subtitle | String | '' | Modal subtitle |
| message | String | required | Confirmation message |
| confirmText | String | 'Confirm' | Confirm button text |
| cancelText | String | 'Cancel' | Cancel button text |
| loading | Boolean | false | Loading state |
| persistent | Boolean | false | Prevent closing on backdrop click |
| itemDetails | Object | {} | Object with item details to display |
| showWarning | Boolean | true | Show warning box |
| warningTitle | String | 'Warning' | Warning box title |
| warningMessage | String | 'This action cannot be undone.' | Warning message |
| customIcon | String | '' | Custom icon name |

## Events

| Event | Description |
|-------|-------------|
| confirm | Emitted when user confirms |
| cancel | Emitted when user cancels |
| update:modelValue | Emitted to update modelValue |

## Tips Penggunaan

1. **Selalu gunakan async/await** dengan predefined methods
2. **Handle error dengan benar** - `false` berarti user membatalkan
3. **Set loading state** untuk memberikan feedback kepada user
4. **Gunakan itemDetails** untuk menampilkan informasi yang relevan
5. **Customize warning message** sesuai dengan context aplikasi

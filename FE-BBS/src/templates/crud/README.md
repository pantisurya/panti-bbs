# Standard CRUD Templates

This directory contains reusable templates for creating CRUD (Create, Read, Update, Delete) modules quickly and consistently.

## Files

- **StandardView.vue** - Vue template component with all standard CRUD UI
- **useStandardManagement.js** - Composable with all standard CRUD logic
- **USAGE_EXAMPLES.js** - Comprehensive examples and usage patterns
- **README.md** - This documentation file

## Quick Start

### 1. Create Management Composable

```javascript
// src/views/yourmodule/useYourModuleManagement.js
import { useStandardManagement } from '@/templates/crud/useStandardManagement.js';

export function useYourModuleManagement() {
    return useStandardManagement({
        entityName: 'YourEntity',
        apiEndpoint: 'yourEndpoint', // from apiConfig.endpoints
        defaultFormData: {
            name: '',
            description: '',
            status: true
        },
        columns: [
            { text: 'Name', value: 'name', sortable: true },
            { text: 'Description', value: 'description', sortable: false }
        ]
    });
}
```

### 2. Create View Component

```vue
<!-- src/views/yourmodule/YourModuleView.vue -->
<template>
    <StandardView 
        entity-name="YourEntity" 
        :management-composable="managementComposable"
    >
        <template #form-fields="{ formData, isPreviewMode }">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField 
                    v-model="formData.name" 
                    type="text" 
                    label="Name" 
                    placeholder="Enter name"
                    :required="!isPreviewMode" 
                    :disabled="isPreviewMode" 
                />
                <FormField 
                    v-model="formData.description" 
                    type="text" 
                    label="Description" 
                    placeholder="Enter description"
                    :disabled="isPreviewMode" 
                />
                <FormField 
                    v-model="formData.status" 
                    type="checkbox" 
                    checkbox-label="Active Status"
                    :disabled="isPreviewMode" 
                />
            </div>
        </template>
    </StandardView>
</template>

<script setup>
import StandardView from '@/templates/crud/StandardView.vue';
import FormField from '@/components/FormField.vue';
import { useYourModuleManagement } from './useYourModuleManagement.js';

const managementComposable = useYourModuleManagement();
</script>
```

### 3. Add API Configuration

```javascript
// src/config/api.js - Add to endpoints object
yourEndpoint: {
    list: '/api/your-entities',
    create: '/api/your-entities',
    update: (id) => `/api/your-entities/${id}`,
    delete: (id) => `/api/your-entities/${id}`,
    show: (id) => `/api/your-entities/${id}`
}
```

## Configuration Options

### useStandardManagement Config

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `entityName` | String | ✅ | Display name (e.g., 'User', 'Role') |
| `apiEndpoint` | String | ✅ | Key from apiConfig.endpoints |
| `defaultFormData` | Object | ✅ | Default form structure |
| `columns` | Array | ✅ | Table column definitions |
| `displayField` | String | ❌ | Primary display field (default: 'name') |
| `includeRelations` | String | ❌ | Relations to include in API calls |
| `transformApiData` | Function | ❌ | Transform API response data |
| `formatFormData` | Function | ❌ | Format data before API submission |

### Column Definition

```javascript
{
    text: 'Column Title',        // Display text
    value: 'fieldName',          // Data field name
    sortable: true,              // Enable sorting
    render: (value) => value     // Custom render function (optional)
}
```

## Template Slots

### StandardView Slots

| Slot | Props | Description |
|------|-------|-------------|
| `form-fields` | `formData`, `isPreviewMode` | Main form fields |
| `additional-content` | `formData`, `isPreviewMode` | Extra content (tables, etc.) |
| `modals` | `showForm`, `formData` | Custom modals |

## Advanced Features

### Custom Data Transformation

```javascript
transformApiData: (data) => {
    // Transform API response before using in UI
    if (data.relations) {
        data.processedRelations = processRelations(data.relations);
    }
    return data;
}
```

### Custom Form Data Formatting

```javascript
formatFormData: (data) => {
    // Format data before sending to API
    return {
        ...data,
        processedField: processField(data.field)
    };
}
```

### Complex Entity Example

```javascript
// For entities with relationships
export function useRoleManagement() {
    return useStandardManagement({
        entityName: 'Role',
        apiEndpoint: 'role',
        defaultFormData: {
            code: '',
            name: '',
            details: []
        },
        includeRelations: 'm_role_d>m_menu',
        transformApiData: (data) => {
            // Process related data
            if (data.m_role_ds) {
                data.details = data.m_role_ds.map(processDetail);
            }
            return data;
        },
        formatFormData: (data) => ({
            ...data,
            details: data.details.map(formatDetail)
        })
    });
}
```

## What You Get

### ✅ Included Features
- Complete CRUD operations
- Search and filtering
- Pagination with server-side support
- URL-based navigation (bookmarkable)
- Item caching for performance
- Loading states and error handling
- Confirmation modals
- Status filtering (Active/Inactive)
- Form validation structure
- Responsive design

### 🎯 Customizable Parts
- Form fields and layout
- Table columns
- Data transformation
- Custom modals
- Additional content sections
- Validation rules
- API endpoints

## Migration Guide

To migrate existing CRUD modules:

1. **Extract Configuration**: Move your entity config to useStandardManagement
2. **Refactor Template**: Use StandardView with slots for custom parts
3. **Remove Redundant Code**: Delete code now handled by templates
4. **Test Thoroughly**: Ensure all functionality works correctly

## Benefits

- **Consistency**: All modules follow same patterns
- **Speed**: Create new CRUD modules in minutes
- **Maintainability**: Central bug fixes benefit all modules
- **Best Practices**: Built-in performance and UX optimizations
- **Flexibility**: Override any part when needed

## Support

For questions or issues with the templates, check:
1. USAGE_EXAMPLES.js for comprehensive examples
2. Existing implementations in the views directory
3. The StandardView.vue and useStandardManagement.js source code

## Version History

- v1.0.0 - Initial template creation with basic CRUD operations
- Future versions will add more features based on common needs

# TableSearch Component

Enhanced search component with URL parameter synchronization for better user experience and shareable search states.

## Features

- ✅ **URL Parameter Sync** - Search terms are synchronized with URL parameters
- ✅ **Debounced Updates** - Configurable debounce delay for URL updates
- ✅ **Clear Button** - Built-in clear functionality
- ✅ **Custom Field Names** - Configurable URL parameter names
- ✅ **Browser Navigation** - Works with browser back/forward buttons
- ✅ **Shareable URLs** - Search states can be shared via URL

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | String | `''` | The search input value |
| `placeholder` | String | `'Search table...'` | Input placeholder text |
| `searchField` | String | `'search'` | URL parameter name for this search field |
| `useUrlParams` | Boolean | `true` | Whether to sync with URL parameters |
| `debounceDelay` | Number | `500` | Debounce delay for URL updates (ms) |

## Events

| Event | Description |
|-------|-------------|
| `update:modelValue` | Emitted when search value changes |

## Basic Usage

```vue
<template>
  <TableSearch 
    v-model="searchTerm" 
    placeholder="Search items..." 
  />
</template>

<script setup>
import { ref } from 'vue'
import TableSearch from '@/components/TableSearch.vue'

const searchTerm = ref('')
</script>
```

## Advanced Usage

### With Custom URL Parameter

```vue
<TableSearch 
  v-model="userSearch" 
  placeholder="Search users..." 
  search-field="user_search"
  :debounce-delay="300"
/>
```

URL Result: `?user_search=john`

### Multiple Search Fields

```vue
<template>
  <div class="grid grid-cols-2 gap-4">
    <TableSearch 
      v-model="productSearch" 
      placeholder="Search products..."
      search-field="product"
    />
    <TableSearch 
      v-model="categorySearch" 
      placeholder="Search categories..."
      search-field="category"
    />
  </div>
</template>
```

URL Result: `?product=laptop&category=electronics`

### Disable URL Sync

```vue
<TableSearch 
  v-model="localSearch" 
  placeholder="Local search only..."
  :use-url-params="false"
/>
```

### Instant Updates (No Debounce)

```vue
<TableSearch 
  v-model="fastSearch" 
  placeholder="Instant search..."
  :debounce-delay="0"
/>
```

## Integration with useMenuManagement

The component integrates seamlessly with the menu management composable:

```vue
<template>
  <TableSearch 
    v-model="searchTerm" 
    placeholder="Cari menu..." 
    search-field="search"
    :use-url-params="true"
    :debounce-delay="300" 
  />
</template>

<script setup>
import { useMenuManagement } from './useMenuManagement.js'

const {
  searchTerm,
  filteredMenuItems
} = useMenuManagement()
</script>
```

## URL Format Examples

### Single Search
```
/menu?search=dashboard
```

### Search with Action
```
/menu?search=user&action=edit&id=123
```

### Multiple Search Fields
```
/products?product=laptop&category=electronics&status=active
```

## Browser Navigation Support

The component automatically:
- Initializes search from URL on page load
- Updates URL when search changes
- Responds to browser back/forward navigation
- Preserves search when performing other actions

## Implementation Details

### Debouncing Strategy
- Input value updates immediately for responsive UI
- URL parameter updates are debounced to prevent excessive navigation
- Configurable delay (default: 500ms)

### URL Parameter Handling
- Uses `router.replace()` to avoid creating excessive history entries
- Preserves existing URL parameters when possible
- Gracefully handles navigation errors

### Cache Management
- Search state is preserved during form operations
- Compatible with item caching in useMenuManagement
- Maintains search context across different views

## Best Practices

1. **Choose Meaningful Field Names**
   ```vue
   <!-- Good -->
   <TableSearch search-field="user_search" />
   <TableSearch search-field="product_name" />
   
   <!-- Avoid -->
   <TableSearch search-field="s1" />
   <TableSearch search-field="field1" />
   ```

2. **Set Appropriate Debounce Delays**
   ```vue
   <!-- For API calls -->
   <TableSearch :debounce-delay="500" />
   
   <!-- For local filtering -->
   <TableSearch :debounce-delay="300" />
   
   <!-- For instant feedback -->
   <TableSearch :debounce-delay="0" />
   ```

3. **Consider URL Length**
   - Keep search field names short but descriptive
   - Be mindful of URL length limits when using multiple search fields

4. **Accessibility**
   - The component includes appropriate ARIA labels
   - Clear button is keyboard accessible
   - Supports screen readers

## Troubleshooting

### Search Not Syncing with URL
- Ensure `useUrlParams` is set to `true`
- Check that Vue Router is properly configured
- Verify the search field name doesn't conflict with other parameters

### Debounce Issues
- Adjust `debounceDelay` based on your use case
- Set to `0` for instant updates
- Increase for better performance with API calls

### Browser Navigation Problems
- Component automatically handles browser navigation
- Ensure you're not manually manipulating the same URL parameters elsewhere
- Check browser console for router warnings (usually safe to ignore)

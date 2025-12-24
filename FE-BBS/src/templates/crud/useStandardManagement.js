import { ref, computed, onMounted, watch, h } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useSnackbar } from '@/composables/useSnackbar.js';
import Badge from '@/components/Badge.vue';
import { apiConfig, buildApiUrl } from '@/config/api.js';

/**
 * Standard CRUD Management Composable Template
 * 
 * @param {Object} config Configuration object
 * @param {string} config.entityName - Name of the entity (e.g., 'Role', 'User', 'Menu')
 * @param {string} config.apiEndpoint - API endpoint key from apiConfig.endpoints
 * @param {Object} config.defaultFormData - Default form data structure
 * @param {Array} config.columns - Table columns configuration
 * @param {Array} config.searchFields - Fields to search on
 * @param {string} config.displayField - Primary display field (default: 'name')
 * @param {string} config.includeRelations - Relations to include in API calls
 * @param {Function} config.transformApiData - Function to transform API response data
 * @param {Function} config.formatFormData - Function to format form data before API submission
 */
export function useStandardManagement(config) {
    const router = useRouter();
    const route = useRoute();
    const { showSuccess, showError } = useSnackbar();

    // Validate required config
    if (!config.entityName || !config.apiEndpoint || !config.defaultFormData) {
        throw new Error('Missing required configuration: entityName, apiEndpoint, and defaultFormData are required');
    }

    // Configuration with defaults
    const entityName = config.entityName;
    const apiEndpoint = config.apiEndpoint;
    const defaultFormData = config.defaultFormData;
    const columns = config.columns || [];
    const displayField = config.displayField || 'name';
    const includeRelations = config.includeRelations || '';
    const transformApiData = config.transformApiData || ((data) => data);
    const formatFormData = config.formatFormData || ((data) => data);

    // ========================================
    // 1. REACTIVE STATE VARIABLES
    // ========================================

    // Search and Filter State
    const searchTerm = ref('');
    const statusFilter = ref('all');
    const selectedItem = ref(null);

    // Form State
    const showForm = ref(false);
    const formLoading = ref(false);
    const isEditMode = ref(false);
    const isPreviewMode = ref(false);
    const isCopyMode = ref(false);

    // Form Data Structure
    const formData = ref({ ...defaultFormData });

    // Data and Loading State
    const items = ref([]);
    const loading = ref(false);
    const error = ref(null);

    // Pagination State
    const currentPage = ref(1);
    const pageSize = ref(10);
    const totalItems = ref(0);
    const totalPages = ref(1);

    // Cache Management
    const itemCache = ref(new Map());
    const fetchingItems = ref(new Set());

    // ========================================
    // 2. CONFIGURATION OBJECTS
    // ========================================

    // Filter options for status filtering
    const filterOptions = [
        {
            value: 'all',
            label: 'All',
            activeClass: 'bg-white text-gray-900',
            inactiveClass: 'text-gray-600 hover:text-gray-900'
        },
        {
            value: 'active',
            label: 'Active',
            activeClass: 'bg-green-500 text-white',
            inactiveClass: 'text-gray-600 hover:text-green-600'
        },
        {
            value: 'inactive',
            label: 'Inactive',
            activeClass: 'bg-red-500 text-white',
            inactiveClass: 'text-gray-600 hover:text-red-600'
        }
    ];

    // Add status column if not already present
    const standardColumns = [
        ...columns,
        ...(columns.find(col => col.value === 'status') ? [] : [{
            text: 'Status',
            value: 'status',
            sortable: true,
            render: (value) => h(Badge, { color: value ? 'green' : 'red' }, () => value ? 'Active' : 'Inactive')
        }])
    ];

    // ========================================
    // 3. UTILITY FUNCTIONS
    // ========================================

    /**
     * Reset all form state to initial values
     */
    const resetFormState = () => {
        showForm.value = false;
        isEditMode.value = false;
        isPreviewMode.value = false;
        isCopyMode.value = false;
        selectedItem.value = null;
        formData.value = { ...defaultFormData };
    };

    /**
     * Clear item cache - either specific item or all items
     */
    const clearItemCache = (itemId = null) => {
        if (itemId) {
            itemCache.value.delete(itemId);
        } else {
            itemCache.value.clear();
        }
    };

    /**
     * Find item by various identifiers
     */
    const findItemById = (itemId) => {
        return items.value.find(item =>
            item.id === itemId ||
            item.code === itemId ||
            item[displayField] === itemId
        );
    };

    // ========================================
    // 4. URL MANAGEMENT FUNCTIONS
    // ========================================

    /**
     * Update URL with action and item ID
     */
    const updateURL = (action, itemId = null, preserveSearch = true) => {
        try {
            const query = { action };
            if (itemId) query.id = itemId;
            if (preserveSearch && route.query.search) query.search = route.query.search;

            router.replace({
                path: route.path,
                query
            }).catch((err) => {
                console.error('Error updating URL:', err);
            });
        } catch (error) {
            console.error('Error updating URL:', error);
        }
    };

    /**
     * Clear URL parameters
     */
    const clearURL = (preserveSearch = false) => {
        try {
            const query = {};
            if (preserveSearch && route.query.search) query.search = route.query.search;

            router.replace({
                path: route.path,
                query
            }).catch((err) => {
                console.error('Error clearing URL:', err);
            });
        } catch (error) {
            console.error('Error clearing URL:', error);
        }
    };

    // ========================================
    // 5. API FUNCTIONS
    // ========================================

    /**
     * Fetch items with pagination and search
     */
    const fetchItems = async (searchQuery = '', filterOptions = '', page = 1, paginate = 10) => {
        loading.value = true;
        error.value = null;

        try {
            clearItemCache();

            let endpoint = buildApiUrl(apiConfig.endpoints[apiEndpoint].list);
            const params = new URLSearchParams();

            params.append('page', page.toString());
            params.append('limit', paginate.toString());

            if (includeRelations) {
                params.append('include', includeRelations);
            }

            if (searchQuery && searchQuery.trim()) {
                params.append('search', searchQuery.trim());
            }

            if (filterOptions === 'true') {
                params.append('status', 'true');
            } else if (filterOptions === 'false') {
                params.append('status', 'false');
            }

            endpoint += `?${params.toString()}`;
            const res = await fetch(endpoint);
            const json = await res.json();

            if (json.status === 'success') {
                const transformedData = transformApiData(json.data || []);
                items.value = Array.isArray(transformedData) ? transformedData : [transformedData];
                totalItems.value = json.pagination?.total || 0;
                totalPages.value = json.pagination?.totalPages || 1;
            } else {
                showError(json.message || `Failed to fetch ${entityName.toLowerCase()}s`);
                items.value = [];
            }
        } catch (err) {
            console.error(`Error fetching ${entityName.toLowerCase()}s:`, err);
            error.value = `Failed to load ${entityName.toLowerCase()}s`;
            items.value = [];
            showError(`Gagal mengambil data ${entityName.toLowerCase()}`);
        } finally {
            loading.value = false;
        }
    };

    /**
     * Fetch individual item by ID with caching
     */
    const fetchItemById = async (itemId, forceRefresh = false) => {
        if (!itemId) return null;

        // Check if already fetching this item
        if (fetchingItems.value.has(itemId)) {
            return null;
        }

        // Check cache first (unless force refresh)
        if (!forceRefresh && itemCache.value.has(itemId)) {
            const cachedItem = itemCache.value.get(itemId);
            return cachedItem;
        }

        // Mark as fetching
        fetchingItems.value.add(itemId);
        formLoading.value = true;
        error.value = null;

        try {
            let endpoint = buildApiUrl(apiConfig.endpoints[apiEndpoint].show(itemId));
            if (includeRelations) {
                endpoint += `?include=${includeRelations}`;
            }

            const res = await fetch(endpoint);
            const json = await res.json();

            if (json.status === 'success' && json.data) {
                const transformedData = transformApiData(json.data);
                itemCache.value.set(itemId, transformedData);
                return transformedData;
            } else {
                throw new Error(json.message || `${entityName} not found`);
            }
        } catch (err) {
            console.error(`Error fetching ${entityName.toLowerCase()}:`, err);
            error.value = `Failed to load ${entityName.toLowerCase()}`;
            throw err;
        } finally {
            fetchingItems.value.delete(itemId);
            formLoading.value = false;
        }
    };

    /**
     * Save item (create or update)
     */
    const saveItem = async (itemData) => {
        try {
            const isUpdate = itemData.id;
            const url = isUpdate
                ? buildApiUrl(apiConfig.endpoints[apiEndpoint].update(itemData.id))
                : buildApiUrl(apiConfig.endpoints[apiEndpoint].create);

            const formattedData = formatFormData(itemData);
            const method = isUpdate ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formattedData)
            });

            const json = await res.json();
            if (json.status !== 'success') {
                throw new Error(json.message || 'Save failed');
            }
            return json.data;
        } catch (err) {
            console.error(`Error saving ${entityName.toLowerCase()}:`, err);
            throw err;
        }
    };

    /**
     * Delete item
     */
    const deleteItem = async (itemId) => {
        try {
            const url = buildApiUrl(apiConfig.endpoints[apiEndpoint].delete(itemId));
            const res = await fetch(url, { method: 'DELETE' });
            const json = await res.json();

            if (json.status !== 'success') {
                throw new Error(json.message || 'Delete failed');
            }

            itemCache.value.delete(itemId);
            return json.data;
        } catch (err) {
            console.error(`Error deleting ${entityName.toLowerCase()}:`, err);
            throw err;
        }
    };

    // ========================================
    // 6. URL DETECTION AND ACTION ROUTING
    // ========================================

    /**
     * Detect action from URL parameters and route to appropriate handler
     */
    const detectActionFromURL = () => {
        const action = route.query.action;
        const itemId = route.query.id;
        const searchParam = route.query.search;

        // Reset state first
        resetFormState();

        // Initialize search term from URL if present and trigger search
        if (searchParam && searchParam !== searchTerm.value) {
            searchTerm.value = searchParam;
            fetchItems(searchParam, '', currentPage.value, pageSize.value);
        }

        // Route based on action
        switch (action) {
            case 'add':
                handleAddInternal();
                break;

            case 'copy':
                if (itemId) handleItemActionForURL(itemId, handleCopyInternal);
                break;

            case 'edit':
                if (itemId) handleItemActionForURL(itemId, handleEditInternal);
                break;

            case 'view':
                if (itemId) handleItemActionForURL(itemId, handlePreviewInternal);
                break;

            default:
                // No action parameter, ensure we're in list view
                showForm.value = false;
                resetFormState();
                break;
        }
    };

    /**
     * Generic handler for item-based actions triggered by URL
     */
    const handleItemActionForURL = (itemId, actionHandler) => {
        // Try to find item by ID first
        const item = findItemById(itemId);

        if (item) {
            selectedItem.value = item;
            actionHandler();
        } else if (itemId.length > 10) {
            // Likely UUID, fetch from API
            fetchItemById(itemId)
                .then((fetchedItem) => {
                    if (fetchedItem) {
                        selectedItem.value = fetchedItem;
                        actionHandler();
                    } else {
                        clearURL(true);
                    }
                })
                .catch(() => {
                    clearURL(true);
                });
        } else {
            // Short ID/code, clear URL if not found
            clearURL(true);
        }
    };

    // ========================================
    // 7. INTERNAL ACTION HANDLERS
    // ========================================

    /**
     * Internal handler for preview mode (triggered by URL)
     */
    const handlePreviewInternal = async () => {
        if (selectedItem.value) {
            isPreviewMode.value = true;
            isEditMode.value = false;
            isCopyMode.value = false;

            if (selectedItem.value.id) {
                try {
                    const freshData = await fetchItemById(selectedItem.value.id, true);
                    formData.value = { ...freshData };
                } catch (err) {
                    formData.value = { ...selectedItem.value };
                }
            } else {
                formData.value = { ...selectedItem.value };
            }

            showForm.value = true;
        }
    };

    /**
     * Internal handler for edit mode (triggered by URL)
     */
    const handleEditInternal = async () => {
        if (selectedItem.value) {
            isEditMode.value = true;
            isPreviewMode.value = false;
            isCopyMode.value = false;

            if (selectedItem.value.id) {
                try {
                    const freshData = await fetchItemById(selectedItem.value.id, true);
                    formData.value = { ...freshData };
                } catch (err) {
                    formData.value = { ...selectedItem.value };
                }
            } else {
                formData.value = { ...selectedItem.value };
            }

            showForm.value = true;
        }
    };

    /**
     * Internal handler for copy mode (triggered by URL)
     */
    const handleCopyInternal = async () => {
        if (selectedItem.value) {
            isEditMode.value = false;
            isPreviewMode.value = false;
            isCopyMode.value = true;

            if (selectedItem.value.id) {
                try {
                    const freshData = await fetchItemById(selectedItem.value.id, true);
                    formData.value = {
                        ...freshData,
                        id: undefined,
                        code: freshData.code ? `${freshData.code} (Copy)` : undefined,
                        name: freshData.name ? `${freshData.name} (Copy)` : undefined,
                    };
                } catch (err) {
                    formData.value = {
                        ...selectedItem.value,
                        id: undefined,
                        code: selectedItem.value.code ? `${selectedItem.value.code} (Copy)` : undefined,
                        name: selectedItem.value.name ? `${selectedItem.value.name} (Copy)` : undefined,
                    };
                }
            } else {
                formData.value = {
                    ...selectedItem.value,
                    id: undefined,
                    code: selectedItem.value.code ? `${selectedItem.value.code} (Copy)` : undefined,
                    name: selectedItem.value.name ? `${selectedItem.value.name} (Copy)` : undefined,
                };
            }

            showForm.value = true;
        }
    };

    /**
     * Internal handler for add mode (triggered by URL)
     */
    const handleAddInternal = () => {
        isEditMode.value = false;
        isPreviewMode.value = false;
        isCopyMode.value = false;
        formData.value = { ...defaultFormData };
        showForm.value = true;
    };

    // ========================================
    // 8. COMPUTED PROPERTIES
    // ========================================

    /**
     * Filtered items based on status filter
     */
    const filteredItems = computed(() => {
        let filtered = items.value;

        if (statusFilter.value === 'active') {
            filtered = filtered.filter(item => item.status === true);
        } else if (statusFilter.value === 'inactive') {
            filtered = filtered.filter(item => item.status === false);
        }

        return filtered;
    });

    // ========================================
    // 9. EVENT HANDLERS
    // ========================================

    /**
     * Handle search with API call
     */
    const handleSearch = async (searchQuery) => {
        selectedItem.value = null;
        currentPage.value = 1;
        await fetchItems(searchQuery, '', currentPage.value, pageSize.value);
    };

    /**
     * Handle filter change
     */
    const handleFilterChange = async (filter) => {
        statusFilter.value = filter;
        currentPage.value = 1;
        const filterValue = filter === 'active' ? 'true' : filter === 'inactive' ? 'false' : '';
        await fetchItems('', filterValue, currentPage.value, pageSize.value);
    };

    /**
     * Handle row click in table
     */
    const handleRowClick = (item) => {
        selectedItem.value = item;
    };

    /**
     * Handle pagination changes
     */
    const handlePageChanged = async (page) => {
        currentPage.value = page;
        await fetchItems(searchTerm.value, '', currentPage.value, pageSize.value);
    };

    const handlePageSizeChanged = async (newPageSize) => {
        pageSize.value = newPageSize;
        currentPage.value = 1;
        await fetchItems(searchTerm.value, '', currentPage.value, pageSize.value);
    };

    const handleSortChanged = async (sortData) => {
        // Implement server-side sorting if needed
        console.log('Sort changed:', sortData);
    };

    // ========================================
    // 10. CRUD ACTION HANDLERS
    // ========================================

    /**
     * Handle view action
     */
    const handleView = () => {
        if (selectedItem.value) {
            const itemId = selectedItem.value.id || selectedItem.value.code || selectedItem.value[displayField];
            updateURL('view', itemId);
        }
    };

    /**
     * Handle edit action
     */
    const handleEdit = () => {
        if (selectedItem.value) {
            const itemId = selectedItem.value.id || selectedItem.value.code || selectedItem.value[displayField];
            updateURL('edit', itemId);
        }
    };

    /**
     * Handle copy action
     */
    const handleCopy = () => {
        if (selectedItem.value) {
            const itemId = selectedItem.value.id || selectedItem.value.code || selectedItem.value[displayField];
            updateURL('copy', itemId);
        }
    };

    /**
     * Handle add action
     */
    const handleAdd = () => {
        updateURL('add');
    };

    // ========================================
    // 11. FORM MANAGEMENT
    // ========================================

    /**
     * Handle form submission
     */
    const handleFormSubmit = async () => {
        formLoading.value = true;

        try {
            await saveItem(formData.value);
            showSuccess(isEditMode.value ? `${entityName} updated` : `${entityName} created`);
            await fetchItems(searchTerm.value, '', currentPage.value, pageSize.value);
            resetFormState();
            clearURL(true);
        } catch (error) {
            showError(error.message || `Gagal menyimpan ${entityName.toLowerCase()}`);
        } finally {
            formLoading.value = false;
        }
    };

    /**
     * Handle form cancellation
     */
    const handleCancel = () => {
        resetFormState();
        clearURL(true);
    };

    // ========================================
    // 12. LIFECYCLE AND WATCHERS
    // ========================================

    // Initialize URL detection on mount
    onMounted(async () => {
        await fetchItems();
        detectActionFromURL();
    });

    // Watch for route changes with debouncing
    let lastQuery = JSON.stringify(route.query);
    let routeDebounceTimer = null;

    watch(
        () => route.query,
        (newQuery) => {
            const newQueryStr = JSON.stringify(newQuery);
            if (newQueryStr !== lastQuery) {
                lastQuery = newQueryStr;

                // Clear existing timer
                if (routeDebounceTimer) {
                    clearTimeout(routeDebounceTimer);
                }

                // Set new timer
                routeDebounceTimer = setTimeout(() => {
                    detectActionFromURL();
                }, 100);
            }
        },
        { immediate: false }
    );

    // ========================================
    // 13. RETURN EXPOSED FUNCTIONS AND STATE
    // ========================================

    return {
        // State
        searchTerm,
        selectedItem,
        statusFilter,
        items,
        showForm,
        formData,
        formLoading,
        isEditMode,
        isPreviewMode,
        isCopyMode,
        loading,
        error,

        // Pagination state
        currentPage,
        pageSize,
        totalItems,
        totalPages,

        // Configuration
        filterOptions,
        columns: standardColumns,

        // Computed
        filteredItems,

        // Event Handlers
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
        fetchItems,
        fetchItemById,
        saveItem,
        deleteItem,
        clearItemCache,

        // URL Management
        updateURL,
        clearURL,
        detectActionFromURL,
        resetFormState,

        // Entity info
        entityName
    };
}

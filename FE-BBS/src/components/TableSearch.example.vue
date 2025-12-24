<template>
    <div class="p-6 space-y-6">
        <h2 class="text-2xl font-bold text-gray-900">TableSearch Component Examples</h2>

        <!-- Example 1: Basic usage -->
        <div class="space-y-3">
            <h3 class="text-lg font-semibold text-gray-800">1. Basic Search (No URL Sync)</h3>
            <TableSearch v-model="basicSearch" placeholder="Basic search without URL sync..." :use-url-params="false" />
            <p class="text-sm text-gray-600">Search Value: {{ basicSearch }}</p>
        </div> <!-- Example 2: URL Synced Search with API -->
        <div class="space-y-3">
            <h3 class="text-lg font-semibold text-gray-800">2. URL Synced Search with API</h3>
            <TableSearch v-model="urlSearch" placeholder="Search with URL sync and API..." search-field="search"
                :use-url-params="true" :debounce-delay="500" :loading="apiLoading" @search="handleApiSearch" />
            <p class="text-sm text-gray-600">Search Value: {{ urlSearch }}</p>
            <p class="text-xs text-blue-600">✓ This search triggers API calls and syncs with URL parameter ?search=value
            </p>
            <div v-if="searchResults.length > 0" class="mt-2 p-2 bg-gray-50 rounded text-xs">
                <p>API Results: {{ searchResults.length }} items found</p>
                <div class="max-h-20 overflow-y-auto">
                    <div v-for="result in searchResults.slice(0, 3)" :key="result.id" class="text-gray-600">
                        {{ result.name }} - {{ result.module }}
                    </div>
                </div>
            </div>
        </div>

        <!-- Example 3: Custom Field Name -->
        <div class="space-y-3">
            <h3 class="text-lg font-semibold text-gray-800">3. Custom Field Name</h3>
            <TableSearch v-model="customSearch" placeholder="Search users..." search-field="user_search"
                :use-url-params="true" :debounce-delay="300" />
            <p class="text-sm text-gray-600">Search Value: {{ customSearch }}</p>
            <p class="text-xs text-blue-600">✓ This search uses ?user_search=value parameter</p>
        </div>

        <!-- Example 4: Multiple Search Fields -->
        <div class="space-y-3">
            <h3 class="text-lg font-semibold text-gray-800">4. Multiple Search Fields</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Product Search</label>
                    <TableSearch v-model="productSearch" placeholder="Search products..." search-field="product"
                        :use-url-params="true" />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Category Search</label>
                    <TableSearch v-model="categorySearch" placeholder="Search categories..." search-field="category"
                        :use-url-params="true" />
                </div>
            </div>
            <div class="text-sm text-gray-600 space-y-1">
                <p>Product Search: {{ productSearch }}</p>
                <p>Category Search: {{ categorySearch }}</p>
                <p class="text-xs text-blue-600">✓ Both searches sync with URL: ?product=value&category=value</p>
            </div>
        </div>

        <!-- Example 5: Fast Response -->
        <div class="space-y-3">
            <h3 class="text-lg font-semibold text-gray-800">5. Fast Response (No Debounce)</h3>
            <TableSearch v-model="fastSearch" placeholder="Instant search response..." search-field="fast"
                :use-url-params="true" :debounce-delay="0" />
            <p class="text-sm text-gray-600">Search Value: {{ fastSearch }}</p>
            <p class="text-xs text-blue-600">✓ URL updates immediately without debouncing</p>
        </div>

        <!-- Current URL Display -->
        <div class="mt-8 p-4 bg-gray-100 rounded-lg">
            <h4 class="font-semibold text-gray-800 mb-2">Current URL Parameters:</h4>
            <code class="text-sm text-gray-700">{{ urlDisplay }}</code>
        </div>

        <!-- Usage Instructions -->
        <div class="mt-8 p-4 bg-blue-50 rounded-lg">
            <h4 class="font-semibold text-blue-800 mb-2">How to Use:</h4>
            <div class="text-sm text-blue-700 space-y-2">
                <p><strong>1. Basic Usage:</strong></p>
                <code class="block bg-white p-2 rounded">
&lt;TableSearch v-model="searchTerm" placeholder="Search..." /&gt;
        </code>
                <p><strong>2. With URL Sync and API:</strong></p>
                <code class="block bg-white p-2 rounded">
&lt;TableSearch 
  v-model="searchTerm" 
  placeholder="Search..." 
  search-field="search"
  :use-url-params="true"
  :debounce-delay="500"
  :loading="apiLoading"
  @search="handleApiSearch" /&gt;
        </code>

                <p><strong>3. URL Format:</strong></p>
                <code class="block bg-white p-2 rounded">
# Single search: /menu?search=value
# Multiple: /menu?search=menu&action=edit&id=123
# Custom field: /user?user_search=john&status=active
        </code>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import TableSearch from './TableSearch.vue'

const route = useRoute()

// Reactive search values
const basicSearch = ref('')
const urlSearch = ref('')
const customSearch = ref('')
const productSearch = ref('')
const categorySearch = ref('')
const fastSearch = ref('')

// API simulation states
const apiLoading = ref(false)
const searchResults = ref([])

// Simulate API search function
const handleApiSearch = async (searchQuery) => {
    console.log('API Search triggered:', searchQuery)
    apiLoading.value = true

    try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800))

        // Mock search results
        const mockData = [
            { id: 1, name: 'Dashboard Menu', module: 'Main' },
            { id: 2, name: 'User Management', module: 'Admin' },
            { id: 3, name: 'Settings Menu', module: 'Config' },
            { id: 4, name: 'Reports Menu', module: 'Analytics' },
            { id: 5, name: 'Profile Menu', module: 'User' }
        ]

        if (searchQuery && searchQuery.trim()) {
            searchResults.value = mockData.filter(item =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.module.toLowerCase().includes(searchQuery.toLowerCase())
            )
        } else {
            searchResults.value = mockData
        }

        console.log('Search results:', searchResults.value)
    } catch (error) {
        console.error('Search error:', error)
        searchResults.value = []
    } finally {
        apiLoading.value = false
    }
}

// Display current URL parameters
const urlDisplay = computed(() => {
    const params = new URLSearchParams()
    Object.entries(route.query).forEach(([key, value]) => {
        if (value) params.append(key, value)
    })
    return params.toString() ? `?${params.toString()}` : 'No parameters'
})
</script>

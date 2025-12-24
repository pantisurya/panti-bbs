<!-- Contoh Penggunaan StatusFilter Component -->

<!-- 1. Basic Usage dengan options default -->
<StatusFilter v-model="filter1" :options="basicOptions" />

<!-- 2. Custom styling untuk setiap option -->
<StatusFilter v-model="filter2" :options="customStyledOptions"
    container-class="flex items-center gap-2 bg-blue-50 p-2 rounded-lg"
    button-base-class="px-4 py-2 text-sm font-semibold rounded-md transition-all duration-300" />

<!-- 3. Dengan nilai numerik -->
<StatusFilter v-model="priorityFilter" :options="priorityOptions" />

<!-- 4. Dengan nilai boolean -->
<StatusFilter v-model="booleanFilter" :options="booleanOptions" />

<!-- 5. Custom default styling -->
<StatusFilter v-model="filter3" :options="simpleOptions" default-active-class="bg-purple-500 text-white"
    default-inactive-class="text-purple-600 hover:text-purple-800" />

<script setup>
import { ref } from 'vue'
import StatusFilter from '@/components/StatusFilter.vue'

// Basic usage
const filter1 = ref('all')
const basicOptions = [
    { value: 'all', label: 'Semua' },
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' }
]

// Custom styled options
const filter2 = ref('pending')
const customStyledOptions = [
    {
        value: 'pending',
        label: 'Pending',
        activeClass: 'bg-yellow-500 text-white border-yellow-600',
        inactiveClass: 'text-yellow-600 hover:bg-yellow-50'
    },
    {
        value: 'approved',
        label: 'Approved',
        activeClass: 'bg-green-500 text-white border-green-600',
        inactiveClass: 'text-green-600 hover:bg-green-50'
    },
    {
        value: 'rejected',
        label: 'Rejected',
        activeClass: 'bg-red-500 text-white border-red-600',
        inactiveClass: 'text-red-600 hover:bg-red-50'
    }
]

// Numerical values
const priorityFilter = ref(1)
const priorityOptions = [
    { value: 1, label: 'High Priority', activeClass: 'bg-red-600 text-white' },
    { value: 2, label: 'Medium Priority', activeClass: 'bg-yellow-600 text-white' },
    { value: 3, label: 'Low Priority', activeClass: 'bg-green-600 text-white' }
]

// Boolean values
const booleanFilter = ref(true)
const booleanOptions = [
    { value: true, label: 'Aktif', activeClass: 'bg-green-500 text-white' },
    { value: false, label: 'Nonaktif', activeClass: 'bg-gray-500 text-white' }
]

// Simple options with default styling
const filter3 = ref('option1')
const simpleOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' }
]
</script>

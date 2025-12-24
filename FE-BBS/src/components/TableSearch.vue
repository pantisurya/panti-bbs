<template>
    <div class="flex items-center">
        <div class="relative flex-1 max-w-xs">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center">
                <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                    fill="currentColor">
                    <path fill-rule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clip-rule="evenodd" />
                </svg>
            </span> <input type="text" :placeholder="placeholder" v-model="inputValue" @input="handleInput"
                :disabled="loading"
                class="pl-10 pr-10 py-2 w-full border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed" />

            <!-- Loading spinner -->
            <div v-if="loading" class="absolute inset-y-0 right-0 pr-3 flex items-center">
                <svg class="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none"
                    viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                    </path>
                </svg>
            </div>

            <!-- Clear button -->
            <button v-else-if="inputValue" @click="clearSearch"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                type="button">
                <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clip-rule="evenodd" />
                </svg>
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const props = defineProps({
    modelValue: { type: String, default: '' },
    placeholder: { type: String, default: 'Search table...' },
    // Field name untuk URL parameter, misal: 'menu', 'user', etc.
    searchField: { type: String, default: 'search' },
    // Apakah ingin sync dengan URL parameters
    useUrlParams: { type: Boolean, default: true },
    // Debounce delay dalam ms
    debounceDelay: { type: Number, default: 500 },
    // Loading state saat fetch API
    loading: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'search'])

const route = useRoute()
const router = useRouter()
const inputValue = ref(props.modelValue)
let debounceTimer = null

// Initialize dari URL parameter saat component mount
onMounted(() => {
    if (props.useUrlParams) {
        const urlSearchValue = route.query[props.searchField] || ''
        if (urlSearchValue && urlSearchValue !== props.modelValue) {
            inputValue.value = urlSearchValue
            emit('update:modelValue', urlSearchValue)
            // Emit search event untuk trigger API call saat mount hanya jika ada nilai
            if (urlSearchValue.trim()) {
                emit('search', urlSearchValue)
            }
        }
    }
})

// Watch perubahan modelValue dari parent
watch(() => props.modelValue, (newVal) => {
    inputValue.value = newVal
    if (props.useUrlParams) {
        updateUrlParams(newVal)
    }
})

// Watch perubahan URL parameter
watch(() => route.query[props.searchField], (newVal) => {
    if (props.useUrlParams && newVal !== inputValue.value) {
        inputValue.value = newVal || ''
        emit('update:modelValue', inputValue.value)
        // Emit search event ketika URL parameter berubah hanya jika ada nilai atau berubah dari ada ke kosong
        if (newVal !== undefined) {
            emit('search', inputValue.value)
        }
    }
})

// Function untuk update URL parameters
const updateUrlParams = (searchValue) => {
    if (!props.useUrlParams) return

    try {
        const query = { ...route.query }

        if (searchValue && searchValue.trim()) {
            query[props.searchField] = searchValue.trim()
        } else {
            delete query[props.searchField]
        }

        // Gunakan replace untuk menghindari history spam
        router.replace({ query }).catch(() => {
            // Ignore navigation errors
        })
    } catch (error) {
        console.warn('Error updating URL params:', error)
    }
}

// Handle input dengan debouncing
const handleInput = () => {
    // Clear previous timer
    if (debounceTimer) {
        clearTimeout(debounceTimer)
    }

    // Emit immediately untuk responsiveness
    emit('update:modelValue', inputValue.value)

    // Debounce untuk search API dan URL update
    debounceTimer = setTimeout(() => {
        // Emit search event untuk trigger API call
        emit('search', inputValue.value)

        // Update URL params
        if (props.useUrlParams) {
            updateUrlParams(inputValue.value)
        }
    }, props.debounceDelay)
}

// Clear search function
const clearSearch = () => {
    inputValue.value = ''
    emit('update:modelValue', '')

    // Emit search event untuk clear results
    emit('search', '')

    if (props.useUrlParams) {
        updateUrlParams('')
    }
}
</script>

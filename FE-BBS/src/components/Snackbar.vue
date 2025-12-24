<template>
    <Teleport to="body">
        <Transition enter-active-class="transition ease-out duration-300"
            enter-from-class="opacity-0 translate-y-2 sm:translate-y-0 sm:translate-x-2"
            enter-to-class="opacity-100 translate-y-0 sm:translate-x-0"
            leave-active-class="transition ease-in duration-200" leave-from-class="opacity-100"
            leave-to-class="opacity-0">
            <div v-if="visible"
                class="fixed top-4 right-4 z-50 max-w-sm w-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
                role="alert" aria-live="assertive" aria-atomic="true">
                <div class="flex items-start p-4"> <!-- Icon -->
                    <div class="flex-shrink-0">
                        <Icon :name="iconName" :class="iconClass" class="w-5 h-5" variant="default" />
                    </div>

                    <!-- Content -->
                    <div class="ml-3 flex-1">
                        <p v-if="title" class="text-sm font-medium text-gray-900">
                            {{ title }}
                        </p>
                        <p class="text-sm text-gray-700" :class="{ 'mt-1': title }">
                            {{ message }}
                        </p>
                    </div>

                    <!-- Close Button -->
                    <div class="ml-4 flex-shrink-0"> <button @click="close"
                            class="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-md">
                            <span class="sr-only">Close</span>
                            <Icon name="times" class="w-4 h-4" variant="default" />
                        </button>
                    </div>
                </div>

                <!-- Progress Bar (optional) -->
                <div v-if="showProgress" class="h-1 bg-gray-200">
                    <div :class="progressBarClass" class="h-full transition-all duration-75 ease-linear"
                        :style="{ width: `${progress}%` }"></div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Icon from './Icon.vue'

const props = defineProps({
    type: {
        type: String,
        default: 'info',
        validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
    },
    title: {
        type: String,
        default: ''
    },
    message: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        default: 5000 // 5 seconds
    },
    showProgress: {
        type: Boolean,
        default: true
    },
    persistent: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['close'])

const visible = ref(false)
const progress = ref(100)
let progressInterval = null
let autoCloseTimeout = null

// Computed properties for styling based on type
const iconName = computed(() => {
    const icons = {
        success: 'check-circle',
        error: 'times-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    }
    return icons[props.type]
})

const iconClass = computed(() => {
    const classes = {
        success: 'text-green-500',
        error: 'text-red-500',
        warning: 'text-yellow-500',
        info: 'text-blue-500'
    }
    return classes[props.type]
})

const progressBarClass = computed(() => {
    const classes = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    }
    return classes[props.type]
})

// Methods
const show = () => {
    visible.value = true

    if (!props.persistent && props.duration > 0) {
        startProgress()
        autoCloseTimeout = setTimeout(() => {
            close()
        }, props.duration)
    }
}

const close = () => {
    visible.value = false
    clearTimers()
    emit('close')
}

const startProgress = () => {
    if (!props.showProgress) return

    const interval = 75 // Update every 75ms for smooth animation
    const totalSteps = props.duration / interval
    const stepSize = 100 / totalSteps

    progressInterval = setInterval(() => {
        progress.value -= stepSize
        if (progress.value <= 0) {
            progress.value = 0
            clearInterval(progressInterval)
        }
    }, interval)
}

const clearTimers = () => {
    if (progressInterval) {
        clearInterval(progressInterval)
        progressInterval = null
    }
    if (autoCloseTimeout) {
        clearTimeout(autoCloseTimeout)
        autoCloseTimeout = null
    }
}

// Lifecycle
onMounted(() => {
    show()
})

onUnmounted(() => {
    clearTimers()
})

// Expose methods for parent components
defineExpose({
    show,
    close
})
</script>

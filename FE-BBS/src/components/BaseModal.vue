<template>
    <Teleport to="body">
        <Transition enter-active-class="transition-opacity duration-300" enter-from-class="opacity-0"
            enter-to-class="opacity-100" leave-active-class="transition-opacity duration-200"
            leave-from-class="opacity-100" leave-to-class="opacity-0">
            <div v-if="modelValue" class="fixed inset-0 z-50 overflow-y-auto" @click="handleBackdropClick">
                <!-- Backdrop -->
                <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>

                <!-- Modal Content -->
                <div class="flex min-h-full items-center justify-center p-4">
                    <Transition enter-active-class="transition-all duration-300"
                        enter-from-class="opacity-0 scale-95 translate-y-4"
                        enter-to-class="opacity-100 scale-100 translate-y-0"
                        leave-active-class="transition-all duration-200"
                        leave-from-class="opacity-100 scale-100 translate-y-0"
                        leave-to-class="opacity-0 scale-95 translate-y-4">
                        <div v-if="modelValue" :class="modalClasses" @click.stop>
                            <slot />
                        </div>
                    </Transition>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    size: {
        type: String,
        default: 'md',
        validator: (value) => ['sm', 'md', 'lg', 'xl', 'full'].includes(value)
    },
    persistent: {
        type: Boolean,
        default: false
    },
    closeOnEscape: {
        type: Boolean,
        default: true
    }
});

const emit = defineEmits(['update:modelValue', 'close']);

// Modal size classes
const modalClasses = computed(() => {
    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-7xl'
    };

    return [
        'relative w-full',
        sizeClasses[props.size],
        'max-h-[90vh] overflow-y-auto'
    ].join(' ');
});

// Handle backdrop click
const handleBackdropClick = () => {
    if (!props.persistent) {
        closeModal();
    }
};

// Handle escape key
const handleEscapeKey = (event) => {
    if (event.key === 'Escape' && props.closeOnEscape && !props.persistent) {
        closeModal();
    }
};

// Close modal
const closeModal = () => {
    emit('update:modelValue', false);
    emit('close');
};

// Add/remove event listeners
onMounted(() => {
    if (props.closeOnEscape) {
        document.addEventListener('keydown', handleEscapeKey);
    }
});

onUnmounted(() => {
    if (props.closeOnEscape) {
        document.removeEventListener('keydown', handleEscapeKey);
    }
});
</script>

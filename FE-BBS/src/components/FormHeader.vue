<template>
    <div class="pb-6 border-b border-gray-200 mb-6">
        <div class="flex justify-between items-center">
            <div>
                <h2 class="text-2xl font-bold text-gray-900 mb-2">
                    {{ title }}
                </h2>
                <p v-if="subtitle" class="text-sm text-gray-600">
                    {{ subtitle }}
                </p>
            </div>
            <div v-if="$slots.actions || showBackButton" class="flex gap-2">
                <!-- Custom action buttons slot -->
                <slot name="actions"></slot>

                <!-- Default back button -->
                <ActionButton v-if="showBackButton" icon="close" :title="backButtonTitle" size="md" variant="outline"
                    @click="$emit('back')" />
            </div>
        </div>
    </div>
</template>

<script setup>
import ActionButton from '@/components/ActionButton.vue';

// Props
defineProps({
    title: {
        type: String,
        required: true
    },
    subtitle: {
        type: String,
        default: ''
    },
    showBackButton: {
        type: Boolean,
        default: true
    },
    backButtonTitle: {
        type: String,
        default: 'Back to List'
    }
});

// Emits
defineEmits(['back']);
</script>

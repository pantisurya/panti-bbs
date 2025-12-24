<template>
    <BaseModal :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" size="md"
        :persistent="persistent">
        <div class="bg-white rounded-lg shadow-xl">
            <!-- Modal Header -->
            <div class="px-6 py-4 border-b border-gray-200">
                <div class="flex items-center gap-3">
                    <div :class="iconContainerClasses">
                        <Icon :name="iconName" class="w-5 h-5" :class="iconClasses" />
                    </div>
                    <div>
                        <h3 class="text-lg font-semibold text-gray-900">
                            {{ title }}
                        </h3>
                        <p v-if="subtitle" class="text-sm text-gray-500">
                            {{ subtitle }}
                        </p>
                    </div>
                </div>
            </div>

            <!-- Modal Body -->
            <div class="px-6 py-4">
                <p class="text-gray-700 mb-4">
                    {{ message }}
                </p>

                <!-- Item Details (if provided) -->
                <div v-if="itemDetails && Object.keys(itemDetails).length > 0" class="bg-gray-50 rounded-lg p-4 mb-4">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div v-for="(value, key) in itemDetails" :key="key">
                            <span class="font-medium text-gray-600 capitalize">{{ formatLabel(key) }}:</span>
                            <p class="text-gray-900">{{ value || '-' }}</p>
                        </div>
                    </div>
                </div>

                <!-- Warning Box -->
                <div v-if="showWarning" :class="warningBoxClasses">
                    <div class="flex items-start gap-2">
                        <Icon :name="warningIconName" class="w-5 h-5 mt-0.5 flex-shrink-0"
                            :class="warningIconClasses" />
                        <div class="text-sm" :class="warningTextClasses">
                            <p class="font-medium">{{ warningTitle }}:</p>
                            <p>{{ warningMessage }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal Footer -->
            <div class="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end gap-3">
                <BaseButton type="button" variant="outline" color="gray" @click="handleCancel" :disabled="loading">
                    {{ cancelText }}
                </BaseButton>
                <BaseButton type="button" :variant="confirmButtonVariant" :color="confirmButtonColor"
                    @click="handleConfirm" :loading="loading" :disabled="loading">
                    {{ confirmText }}
                </BaseButton>
            </div>
        </div>
    </BaseModal>
</template>

<script setup>
import { computed } from 'vue';
import BaseModal from './BaseModal.vue';
import BaseButton from './BaseButton.vue';
import Icon from './Icon.vue';

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        default: 'danger',
        validator: (value) => ['danger', 'warning', 'info', 'success'].includes(value)
    },
    title: {
        type: String,
        required: true
    },
    subtitle: {
        type: String,
        default: ''
    },
    message: {
        type: String,
        required: true
    },
    confirmText: {
        type: String,
        default: 'Confirm'
    },
    cancelText: {
        type: String,
        default: 'Cancel'
    },
    loading: {
        type: Boolean,
        default: false
    },
    persistent: {
        type: Boolean,
        default: false
    },
    itemDetails: {
        type: Object,
        default: () => ({})
    },
    showWarning: {
        type: Boolean,
        default: true
    },
    warningTitle: {
        type: String,
        default: 'Warning'
    },
    warningMessage: {
        type: String,
        default: 'This action cannot be undone.'
    },
    customIcon: {
        type: String,
        default: ''
    }
});

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel']);

// Computed properties for styling based on type
const typeConfig = computed(() => {
    const configs = {
        danger: {
            icon: 'trash',
            iconContainer: 'bg-red-100',
            iconColor: 'text-red-600',
            warningBox: 'bg-red-50 border border-red-200',
            warningIcon: 'exclamation-triangle',
            warningIconColor: 'text-red-500',
            warningTextColor: 'text-red-700',
            confirmButtonVariant: 'filled',
            confirmButtonColor: 'red'
        },
        warning: {
            icon: 'exclamation-triangle',
            iconContainer: 'bg-yellow-100',
            iconColor: 'text-yellow-600',
            warningBox: 'bg-yellow-50 border border-yellow-200',
            warningIcon: 'exclamation-triangle',
            warningIconColor: 'text-yellow-500',
            warningTextColor: 'text-yellow-700',
            confirmButtonVariant: 'filled',
            confirmButtonColor: 'yellow'
        },
        info: {
            icon: 'info-circle',
            iconContainer: 'bg-blue-100',
            iconColor: 'text-blue-600',
            warningBox: 'bg-blue-50 border border-blue-200',
            warningIcon: 'info-circle',
            warningIconColor: 'text-blue-500',
            warningTextColor: 'text-blue-700',
            confirmButtonVariant: 'filled',
            confirmButtonColor: 'blue'
        },
        success: {
            icon: 'check-circle',
            iconContainer: 'bg-green-100',
            iconColor: 'text-green-600',
            warningBox: 'bg-green-50 border border-green-200',
            warningIcon: 'check-circle',
            warningIconColor: 'text-green-500',
            warningTextColor: 'text-green-700',
            confirmButtonVariant: 'filled',
            confirmButtonColor: 'green'
        }
    };

    return configs[props.type] || configs.danger;
});

const iconName = computed(() => props.customIcon || typeConfig.value.icon);
const iconContainerClasses = computed(() => `flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${typeConfig.value.iconContainer}`);
const iconClasses = computed(() => typeConfig.value.iconColor);
const warningBoxClasses = computed(() => `rounded-lg p-3 ${typeConfig.value.warningBox}`);
const warningIconName = computed(() => typeConfig.value.warningIcon);
const warningIconClasses = computed(() => typeConfig.value.warningIconColor);
const warningTextClasses = computed(() => typeConfig.value.warningTextColor);
const confirmButtonVariant = computed(() => typeConfig.value.confirmButtonVariant);
const confirmButtonColor = computed(() => typeConfig.value.confirmButtonColor);

// Format label for display
const formatLabel = (key) => {
    return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .replace(/_/g, ' ')
        .trim();
};

// Event handlers
const handleConfirm = () => {
    emit('confirm');
};

const handleCancel = () => {
    emit('update:modelValue', false);
    emit('cancel');
};
</script>

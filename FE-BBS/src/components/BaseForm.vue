<template>
    <div class="bg-white rounded-lg shadow-md p-6">
        <!-- Form Header -->
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-semibold text-gray-800">{{ title }}</h2>
            <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 transition-colors" type="button">
                <Icon name="close" size="24" />
            </button>
        </div>

        <!-- Form Content -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
            <slot name="fields" :formData="formData" :errors="errors" />

            <!-- Form Actions -->
            <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <BaseButton type="button" variant="outline" @click="$emit('close')">
                    Cancel
                </BaseButton>
                <BaseButton type="submit" variant="filled" :disabled="loading" :loading="loading">
                    {{ submitText }}
                </BaseButton>
            </div>
        </form>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import BaseButton from './BaseButton.vue';
import Icon from './Icon.vue';

const props = defineProps({
    title: {
        type: String,
        required: true
    },
    initialData: {
        type: Object,
        default: () => ({})
    },
    submitText: {
        type: String,
        default: 'Save'
    },
    loading: {
        type: Boolean,
        default: false
    },
    validationRules: {
        type: Object,
        default: () => ({})
    }
});

const emit = defineEmits(['submit', 'close']);

const formData = ref({ ...props.initialData });
const errors = ref({});

// Watch for changes in initialData to reset form
watch(() => props.initialData, (newData) => {
    formData.value = { ...newData };
    errors.value = {};
}, { deep: true });

// Validation function
const validateForm = () => {
    const newErrors = {};

    Object.keys(props.validationRules).forEach(field => {
        const rules = props.validationRules[field];
        const value = formData.value[field];

        if (rules.required && (!value || value.toString().trim() === '')) {
            newErrors[field] = `${rules.label || field} is required`;
        } else if (rules.minLength && value && value.toString().length < rules.minLength) {
            newErrors[field] = `${rules.label || field} must be at least ${rules.minLength} characters`;
        } else if (rules.maxLength && value && value.toString().length > rules.maxLength) {
            newErrors[field] = `${rules.label || field} must not exceed ${rules.maxLength} characters`;
        } else if (rules.pattern && value && !rules.pattern.test(value)) {
            newErrors[field] = rules.message || `${rules.label || field} format is invalid`;
        }
    });

    errors.value = newErrors;
    return Object.keys(newErrors).length === 0;
};

// Handle form submission
const handleSubmit = () => {
    if (validateForm()) {
        emit('submit', { ...formData.value });
    }
};

// Expose formData and methods for external access
defineExpose({
    formData,
    errors,
    validateForm,
    resetForm: () => {
        formData.value = { ...props.initialData };
        errors.value = {};
    }
});
</script>

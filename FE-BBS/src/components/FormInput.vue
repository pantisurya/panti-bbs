<template>
    <div class="space-y-1">
        <label v-if="label" :for="inputId" class="block text-sm font-medium text-gray-700">
            {{ label }}
            <span v-if="required" class="text-red-500">*</span>
        </label>

        <!-- Text Input -->
        <input v-if="type === 'text' || type === 'email' || type === 'password' || type === 'number'" :id="inputId"
            :type="type" :value="modelValue" :placeholder="placeholder" :disabled="disabled" :readonly="readonly"
            :required="required" @input="$emit('update:modelValue', $event.target.value)" @blur="$emit('blur')"
            @focus="$emit('focus')" :class="inputClasses" />

        <!-- Textarea -->
        <textarea v-else-if="type === 'textarea'" :id="inputId" :value="modelValue" :placeholder="placeholder"
            :disabled="disabled" :readonly="readonly" :required="required" :rows="rows"
            @input="$emit('update:modelValue', $event.target.value)" @blur="$emit('blur')" @focus="$emit('focus')"
            :class="inputClasses" />

        <!-- Select -->
        <select v-else-if="type === 'select'" :id="inputId" :value="modelValue" :disabled="disabled"
            :required="required" @change="$emit('update:modelValue', $event.target.value)" @blur="$emit('blur')"
            @focus="$emit('focus')" :class="inputClasses">
            <option value="" disabled>{{ placeholder || 'Select an option' }}</option>
            <option v-for="option in options" :key="option.value" :value="option.value">
                {{ option.label }}
            </option>
        </select>

        <!-- Checkbox -->
        <div v-else-if="type === 'checkbox'" class="flex items-center">
            <input :id="inputId" type="checkbox" :checked="modelValue" :disabled="disabled" :required="required"
                @change="$emit('update:modelValue', $event.target.checked)" @blur="$emit('blur')"
                @focus="$emit('focus')" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
            <label v-if="label" :for="inputId" class="ml-2 block text-sm text-gray-700">
                {{ label }}
                <span v-if="required" class="text-red-500">*</span>
            </label>
        </div>

        <!-- Error Message -->
        <p v-if="error" class="text-sm text-red-600">
            {{ error }}
        </p>

        <!-- Help Text -->
        <p v-if="helpText && !error" class="text-sm text-gray-500">
            {{ helpText }}
        </p>
    </div>
</template>

<script setup>
import { computed, getCurrentInstance } from 'vue';

const props = defineProps({
    modelValue: {
        type: [String, Number, Boolean],
        default: ''
    },
    type: {
        type: String,
        default: 'text',
        validator: (value) => ['text', 'email', 'password', 'number', 'textarea', 'select', 'checkbox'].includes(value)
    },
    label: {
        type: String,
        default: ''
    },
    placeholder: {
        type: String,
        default: ''
    },
    disabled: {
        type: Boolean,
        default: false
    },
    readonly: {
        type: Boolean,
        default: false
    },
    required: {
        type: Boolean,
        default: false
    },
    error: {
        type: String,
        default: ''
    },
    helpText: {
        type: String,
        default: ''
    },
    rows: {
        type: Number,
        default: 3
    },
    options: {
        type: Array,
        default: () => []
    },
    size: {
        type: String,
        default: 'md',
        validator: (value) => ['sm', 'md', 'lg'].includes(value)
    }
});

const emit = defineEmits(['update:modelValue', 'blur', 'focus']);

// Generate unique ID for the input
const instance = getCurrentInstance();
const inputId = computed(() => `input-${instance.uid}`);

// Input classes based on state and size
const inputClasses = computed(() => {
    const baseClasses = 'block w-full border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500';

    const sizeClasses = {
        sm: 'px-2 py-1 text-sm',
        md: 'px-3 py-2 text-sm',
        lg: 'px-4 py-3 text-base'
    };

    const stateClasses = props.error
        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500';

    const disabledClasses = props.disabled
        ? 'bg-gray-50 text-gray-500 cursor-not-allowed'
        : 'bg-white text-gray-900';

    return [
        baseClasses,
        sizeClasses[props.size],
        stateClasses,
        disabledClasses
    ].join(' ');
});
</script>

<template>
    <div class="space-y-1">
        <!-- Label -->
        <label v-if="label" :for="inputId" class="block text-sm font-medium text-gray-700">
            {{ label }}
            <span v-if="required" class="text-red-500">*</span>
        </label>

        <!-- Input Text/Number/Email etc -->
        <input v-if="type !== 'select' && type !== 'textarea' && type !== 'checkbox' && type !== 'number'" :id="inputId"
            :type="type" :value="modelValue" :placeholder="placeholder" :disabled="disabled" :required="required"
            @input="$emit('update:modelValue', $event.target.value)" :class="inputClasses" />

        <!-- Input Number dengan format Rupiah jika prop rupiah true -->
        <input v-else-if="type === 'number' && rupiah" :id="inputId" type="text" :value="displayValue"
            :placeholder="placeholder" :disabled="disabled" :required="required" @input="onRupiahInput($event)"
            :class="inputClasses" />

        <!-- Input Number biasa jika prop rupiah false -->
        <input v-else-if="type === 'number' && !rupiah" :id="inputId" type="number" :value="modelValue"
            :placeholder="placeholder" :disabled="disabled" :required="required"
            @input="$emit('update:modelValue', $event.target.value)" :class="inputClasses" />

        <!-- Select Dropdown -->
        <select v-else-if="type === 'select'" :id="inputId" :value="modelValue" :disabled="disabled"
            :required="required" @change="$emit('update:modelValue', $event.target.value)" :class="inputClasses">
            <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
            <option v-for="option in options" :key="option.value || option" :value="option.value || option">
                {{ option.label || option }}
            </option>
        </select>

        <!-- Textarea -->
        <textarea v-else-if="type === 'textarea'" :id="inputId" :value="modelValue" :placeholder="placeholder"
            :disabled="disabled" :required="required" :rows="rows || 3"
            @input="$emit('update:modelValue', $event.target.value)" :class="inputClasses" />

        <!-- Checkbox -->
        <div v-else-if="type === 'checkbox'" class="flex items-center">
            <input :id="inputId" type="checkbox" :checked="modelValue" :disabled="disabled" :required="required"
                @change="$emit('update:modelValue', $event.target.checked)"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
            <label v-if="checkboxLabel || label" :for="inputId" class="ml-2 block text-sm text-gray-700">
                {{ checkboxLabel || label }}
            </label>
        </div>

        <!-- Help Text -->
        <p v-if="helpText" class="text-sm text-gray-500">
            {{ helpText }}
        </p>
    </div>
</template>

<script setup>
import { computed, getCurrentInstance, watch } from 'vue';

const props = defineProps({
    modelValue: {
        type: [String, Number, Boolean],
        default: ''
    },
    type: {
        type: String,
        default: 'text'
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
    required: {
        type: Boolean,
        default: false
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
    checkboxLabel: {
        type: String,
        default: ''
    },
    rupiah: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:modelValue']);

// Generate unique ID for the input
const instance = getCurrentInstance();
const inputId = computed(() => `field-${instance.uid}`);

// Input classes
const inputClasses = computed(() => {
    return 'block w-full px-3 py-2 border border-gray-300 rounded-sm shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500';
});

// Format Rupiah untuk input number
function formatRupiah(angka) {
    if (!angka && angka !== 0) return '';
    const number = typeof angka === 'string' ? parseInt(angka.toString().replace(/\D/g, '')) : angka;
    if (isNaN(number)) return '';
    return 'Rp. ' + number.toLocaleString('id-ID');
}

const displayValue = computed(() => {
    if (props.type === 'number' && props.rupiah) {
        return formatRupiah(props.modelValue);
    }
    return props.modelValue;
});

function onRupiahInput(e) {
    let value = e.target.value.replace(/[^\d]/g, '');
    emit('update:modelValue', value ? parseInt(value) : '');
}
</script>

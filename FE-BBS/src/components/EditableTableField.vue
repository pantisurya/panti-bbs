<template>
    <FormField v-model="modelValueProxy" :type="type" :options="options" :placeholder="placeholder" :disabled="disabled"
        :maxLength="maxLength" :min="min" :max="max" :step="step" :checkbox-label="checkboxLabel" :rows="rows"
        :label="label" :required="required" :help-text="helpText" class="w-full" />
</template>

<script setup>
import { computed } from 'vue';
import FormField from './FormField.vue';
const props = defineProps({
    modelValue: [String, Number, Boolean],
    type: { type: String, default: 'text' },
    options: { type: Array, default: () => [] },
    placeholder: { type: String, default: 'Enter text' },
    disabled: { type: Boolean, default: false },
    min: { type: [Number, String], default: undefined },
    max: { type: [Number, String], default: undefined },
    step: { type: [Number, String], default: undefined },
    maxLength: { type: [Number, String], default: undefined },
    checkboxLabel: { type: String, default: '' },
    rows: { type: Number, default: 3 },
    label: { type: String, default: '' },
    required: { type: Boolean, default: false },
    helpText: { type: String, default: '' }
});
const emit = defineEmits(['update:modelValue']);
const modelValueProxy = computed({
    get: () => props.modelValue,
    set: v => emit('update:modelValue', v)
});
</script>

<style scoped>
:deep(.block) {
    min-height: 2.25rem;
}
</style>

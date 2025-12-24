<template>
  <div :class="containerClass">
    <button v-for="option in options" :key="option.value" @click="handleFilterChange(option.value, option)" :class="getButtonClasses(option)">
      {{ option.label }}
    </button>
  </div>
</template>

<script setup>
import { computed, defineProps, defineEmits } from "vue";

// Props
const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean],
    default: "all",
  },
  options: {
    type: Array,
    required: true,
    validator: (options) => {
      return Array.isArray(options) && options.every((option) => option.hasOwnProperty("value") && option.hasOwnProperty("label"));
    },
  },
  // Default styling classes
  defaultActiveClass: {
    type: String,
    default: "bg-blue-500 text-white",
  },
  defaultInactiveClass: {
    type: String,
    default: "text-gray-600 hover:text-gray-900",
  },
  // Container styling
  containerClass: {
    type: String,
    default: "flex items-center gap-1 bg-gray-100 p-1 rounded",
  },
  // Button base styling
  buttonBaseClass: {
    type: String,
    default: "px-3 py-1.5 text-sm font-medium rounded transition-all duration-200",
  },
});

// Emits
const emit = defineEmits(["update:modelValue", "change"]);

// Computed
// Normalize selected value to string for robust comparison across types
const selectedFilter = computed(() => String(props.modelValue));

// Methods
const handleFilterChange = (value, option) => {
  emit("update:modelValue", value);
  const param = option && option.param !== undefined ? option.param : null;
  emit("change", value, param);
};

// Get button classes based on state and option config
const getButtonClasses = (option) => {
  // Compare normalized string forms to handle boolean/number/string option values
  const isActive = selectedFilter.value === String(option.value);
  const baseClasses = props.buttonBaseClass;

  if (isActive) {
    const activeClass = option.activeClass || props.defaultActiveClass;
    return `${baseClasses} ${activeClass} shadow-sm`;
  } else {
    const inactiveClass = option.inactiveClass || props.defaultInactiveClass;
    return `${baseClasses} ${inactiveClass}`;
  }
};
</script>

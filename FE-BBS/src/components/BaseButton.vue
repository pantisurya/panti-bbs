<template>
  <button :type="type" :class="buttonClasses" :disabled="disabled || loading" @click="$emit('click', $event)">
    <!-- Loading Spinner -->
    <div v-if="loading" class="w-4 h-4 border-2 border-transparent border-t-current rounded-full animate-spin mr-2">
    </div>

    <!-- Icon Slot -->
    <slot name="icon" />

    <!-- Default Content -->
    <slot />
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'button',
    validator: (value) => ['button', 'submit', 'reset'].includes(value)
  },
  variant: {
    type: String,
    default: 'filled',
    validator: (value) => ['filled', 'outline', 'ghost'].includes(value)
  },
  color: {
    type: String,
    default: 'blue',
    validator: (value) => [
      'blue', 'green', 'red', 'gray', 'yellow', 'purple', 'orange',
      'primary', 'success', 'danger', 'warning', 'info', 'secondary'
    ].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  fullWidth: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const buttonClasses = computed(() => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed'

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  // Color and variant classes
  const getColorClasses = () => {
    const colors = {
      blue: {
        filled: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-300 disabled:hover:bg-blue-300',
        outline: 'border-2 border-blue-600 text-blue-600 bg-white hover:bg-blue-50 focus:ring-blue-500 disabled:border-blue-300 disabled:text-blue-300 disabled:hover:bg-white',
        ghost: 'text-blue-600 bg-transparent hover:bg-blue-50 focus:ring-blue-500 disabled:text-blue-300 disabled:hover:bg-transparent'
      },
      green: {
        filled: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 disabled:bg-green-300 disabled:hover:bg-green-300',
        outline: 'border-2 border-green-600 text-green-600 bg-white hover:bg-green-50 focus:ring-green-500 disabled:border-green-300 disabled:text-green-300 disabled:hover:bg-white',
        ghost: 'text-green-600 bg-transparent hover:bg-green-50 focus:ring-green-500 disabled:text-green-300 disabled:hover:bg-transparent'
      },
      red: {
        filled: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300 disabled:hover:bg-red-300',
        outline: 'border-2 border-red-600 text-red-600 bg-white hover:bg-red-50 focus:ring-red-500 disabled:border-red-300 disabled:text-red-300 disabled:hover:bg-white',
        ghost: 'text-red-600 bg-transparent hover:bg-red-50 focus:ring-red-500 disabled:text-red-300 disabled:hover:bg-transparent'
      },
      gray: {
        filled: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 disabled:bg-gray-300 disabled:hover:bg-gray-300',
        outline: 'border-2 border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-gray-500 disabled:border-gray-200 disabled:text-gray-400 disabled:hover:bg-white',
        ghost: 'text-gray-600 bg-transparent hover:bg-gray-50 focus:ring-gray-500 disabled:text-gray-400 disabled:hover:bg-transparent'
      },
      yellow: {
        filled: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500 disabled:bg-yellow-300 disabled:hover:bg-yellow-300',
        outline: 'border-2 border-yellow-500 text-yellow-600 bg-white hover:bg-yellow-50 focus:ring-yellow-500 disabled:border-yellow-300 disabled:text-yellow-300 disabled:hover:bg-white',
        ghost: 'text-yellow-600 bg-transparent hover:bg-yellow-50 focus:ring-yellow-500 disabled:text-yellow-300 disabled:hover:bg-transparent'
      },
      purple: {
        filled: 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500 disabled:bg-purple-300 disabled:hover:bg-purple-300',
        outline: 'border-2 border-purple-600 text-purple-600 bg-white hover:bg-purple-50 focus:ring-purple-500 disabled:border-purple-300 disabled:text-purple-300 disabled:hover:bg-white',
        ghost: 'text-purple-600 bg-transparent hover:bg-purple-50 focus:ring-purple-500 disabled:text-purple-300 disabled:hover:bg-transparent'
      },
      orange: {
        filled: 'bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-500 disabled:bg-orange-300 disabled:hover:bg-orange-300',
        outline: 'border-2 border-orange-500 text-orange-600 bg-white hover:bg-orange-50 focus:ring-orange-500 disabled:border-orange-300 disabled:text-orange-300 disabled:hover:bg-white',
        ghost: 'text-orange-600 bg-transparent hover:bg-orange-50 focus:ring-orange-500 disabled:text-orange-300 disabled:hover:bg-transparent'
      },
      primary: {
        filled: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
        outline: 'border-2 border-blue-600 text-blue-600 bg-white hover:bg-blue-50 focus:ring-blue-500',
        ghost: 'text-blue-600 bg-transparent hover:bg-blue-50 focus:ring-blue-500'
      },
      success: {
        filled: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
        outline: 'border-2 border-green-600 text-green-600 bg-white hover:bg-green-50 focus:ring-green-500',
        ghost: 'text-green-600 bg-transparent hover:bg-green-50 focus:ring-green-500'
      },
      danger: {
        filled: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
        outline: 'border-2 border-red-600 text-red-600 bg-white hover:bg-red-50 focus:ring-red-500',
        ghost: 'text-red-600 bg-transparent hover:bg-red-50 focus:ring-red-500'
      },
      warning: {
        filled: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500',
        outline: 'border-2 border-yellow-500 text-yellow-600 bg-white hover:bg-yellow-50 focus:ring-yellow-500',
        ghost: 'text-yellow-600 bg-transparent hover:bg-yellow-50 focus:ring-yellow-500'
      },
      info: {
        filled: 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500',
        outline: 'border-2 border-purple-600 text-purple-600 bg-white hover:bg-purple-50 focus:ring-purple-500',
        ghost: 'text-purple-600 bg-transparent hover:bg-purple-50 focus:ring-purple-500'
      },
      secondary: {
        filled: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
        outline: 'border-2 border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-gray-500',
        ghost: 'text-gray-600 bg-transparent hover:bg-gray-50 focus:ring-gray-500'
      }
    };

    return colors[props.color]?.[props.variant] || colors.blue.filled
  }

  // Width class
  const widthClass = props.fullWidth ? 'w-full' : ''

  // Disabled state
  const disabledClass = (props.disabled || props.loading) ? 'opacity-75' : ''

  // Border radius minimal
  const radiusClass = 'rounded-md'

  return [
    baseClasses,
    sizeClasses[props.size],
    getColorClasses(),
    widthClass,
    disabledClass,
    radiusClass
  ].filter(Boolean).join(' ')
})
</script>
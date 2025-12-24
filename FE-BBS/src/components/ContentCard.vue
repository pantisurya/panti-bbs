<template>
  <div :class="cardClasses">
    <header v-if="$slots.header" :class="headerFooterClasses" class="border-b border-gray-200 font-semibold">
      <slot name="header" />
    </header>

    <div :class="bodyClasses">
      <slot />
    </div>

    <footer v-if="$slots.footer" :class="headerFooterClasses" class="border-t border-gray-200">
      <slot name="footer" />
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  padding?: 'none' | 'small' | 'medium' | 'large'
  shadow?: boolean
  border?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  padding: 'medium',
  shadow: true,
  border: true
})

const paddingClasses = {
  none: 'p-0',
  small: 'p-3',
  medium: 'p-4',
  large: 'p-6'
}

const cardClasses = computed(() => {
  const baseClasses = 'bg-white rounded overflow-hidden'
  const shadowClass = props.shadow ? 'shadow-md' : ''
  const borderClass = props.border ? 'border border-gray-200' : ''

  return [baseClasses, shadowClass, borderClass].filter(Boolean).join(' ')
})

const bodyClasses = computed(() => paddingClasses[props.padding])

const headerFooterClasses = computed(() => paddingClasses[props.padding])
</script>
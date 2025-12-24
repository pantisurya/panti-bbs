<template>
    <span :class="badgeClass">
        <slot />
    </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
    color?: 'green' | 'red' | 'gray' | string
}

const props = withDefaults(defineProps<Props>(), {
    color: 'gray'
})

const colorMap: Record<string, string> = {
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    gray: 'bg-gray-100 text-gray-800'
}

const badgeClass = computed(() => [
    'px-2 py-1 text-xs font-medium rounded',
    colorMap[props.color] || colorMap.gray
].join(' '))
</script>

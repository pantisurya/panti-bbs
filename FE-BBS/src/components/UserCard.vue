<template>
  <div
    class="flex items-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
    <div class="mr-4">
      <img :src="user.avatar" :alt="`${user.name} avatar`" class="w-12 h-12 rounded-full object-cover" />
    </div>

    <div class="flex-1">
      <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ user.name }}</h3>
      <p class="text-sm text-gray-600 mb-2">{{ user.email }}</p>
      <span :class="roleClasses" class="inline-block px-2 py-1 text-xs font-medium uppercase rounded">
        {{ user.role }}
      </span>

      <div class="flex gap-2 mt-3">
        <BaseButton @click="$emit('edit', user)" variant="primary" size="small">
          Edit
        </BaseButton>
        <BaseButton @click="$emit('delete', user.id)" variant="danger" size="small">
          Delete
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import BaseButton from './BaseButton.vue'

const props = defineProps({
  user: {
    type: Object,
    required: true
  }
})

const roleClasses = computed(() => {
  const roleStyles = {
    admin: 'bg-yellow-100 text-yellow-800',
    moderator: 'bg-blue-100 text-blue-800',
    user: 'bg-gray-100 text-gray-800'
  }
  return roleStyles[props.user.role]
})
</script>
<template>
  <ContentCard>
    <template #header>
      <h2 class="text-xl font-bold text-gray-900">Interactive Component Demo</h2>
    </template>

    <div class="space-y-8">
      <!-- Counter Section -->
      <div>
        <h3 class="text-2xl font-bold text-gray-900 mb-4">Counter: {{ count }}</h3>
        <div class="flex flex-wrap gap-2">
          <BaseButton @click="increment" variant="success">+1</BaseButton>
          <BaseButton @click="decrement" variant="danger">-1</BaseButton>
          <BaseButton @click="reset" variant="secondary">Reset</BaseButton>
        </div>
      </div>

      <!-- Input Section -->
      <div>
        <label for="name-input" class="block text-sm font-medium text-gray-700 mb-2">
          Your Name:
        </label>
        <input id="name-input" v-model="name" type="text" placeholder="Enter your name"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-2" />
        <p v-if="name" class="text-green-600 font-medium">Hello, {{ name }}! 👋</p>
      </div>

      <!-- Todo Section -->
      <div>
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Simple Todo</h3>
        <div class="flex gap-2 mb-4">
          <input v-model="newTodo" @keyup.enter="addTodo" type="text" placeholder="Add a todo..."
            class="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          <BaseButton @click="addTodo" :disabled="!newTodo.trim()">
            Add
          </BaseButton>
        </div>

        <ul v-if="todos.length" class="space-y-2">
          <li v-for="todo in todos" :key="todo.id" class="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
            <input type="checkbox" v-model="todo.completed"
              class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
            <span :class="{ 'line-through text-gray-500': todo.completed }" class="flex-1 transition-all duration-200">
              {{ todo.text }}
            </span>
            <BaseButton @click="removeTodo(todo.id)" variant="danger" size="small">
              Remove
            </BaseButton>
          </li>
        </ul>
      </div>
    </div>

    <template #footer>
      <p class="text-sm text-gray-500">
        Component lifecycle: mounted {{ formatTime(mountedAt) }}
      </p>
    </template>
  </ContentCard>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCounter } from '../composables/useCounter.js'
import ContentCard from './ContentCard.vue'
import BaseButton from './BaseButton.vue'

const { count, increment, decrement, reset } = useCounter()

const name = ref('')
const newTodo = ref('')
const mountedAt = ref()

const todos = ref([])

const addTodo = () => {
  if (newTodo.value.trim()) {
    todos.value.push({
      id: Date.now(),
      text: newTodo.value.trim(),
      completed: false
    })
    newTodo.value = ''
  }
}

const removeTodo = (id) => {
  todos.value = todos.value.filter(todo => todo.id !== id)
}

const formatTime = (date) => {
  return date ? date.toLocaleTimeString() : ''
}

onMounted(() => {
  mountedAt.value = new Date()
  console.log('InteractiveDemo component mounted!')
})
</script>
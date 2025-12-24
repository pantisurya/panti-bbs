import { ref } from 'vue'

// Composable untuk logika counter yang bisa digunakan ulang
export function useCounter(initialValue = 0) {
  const count = ref(initialValue)

  const increment = () => {
    count.value++
  }

  const decrement = () => {
    count.value--
  }

  const reset = () => {
    count.value = initialValue
  }

  const setValue = (value) => {
    count.value = value
  }

  return {
    count,
    increment,
    decrement,
    reset,
    setValue
  }
}
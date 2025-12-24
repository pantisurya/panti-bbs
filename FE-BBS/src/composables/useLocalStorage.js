import { ref, watch, Ref } from 'vue'

// Composable untuk sinkronisasi dengan localStorage
// export function useLocalStorage<T>(
//   key: string, 
//   defaultValue: T
// ): [Ref<T>, (value: T) => void] {

const storedValue = localStorage.getItem(key)
const initialValue = storedValue ? JSON.parse(storedValue) : defaultValue

const value = ref(initialValue)

const setValue = (newValue) => {
  value.value = newValue
}

// Watch untuk otomatis save ke localStorage
watch(
  value,
  (newValue) => {
    localStorage.setItem(key, JSON.stringify(newValue))
  },
  { deep: true }
)

return [value, setValue]

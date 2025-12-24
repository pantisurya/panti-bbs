import { ref, h, render } from 'vue'
import Snackbar from '@/components/Snackbar.vue'

// Global state for managing snackbars
const snackbars = ref([])
let snackbarId = 0

// Create a container for snackbars if it doesn't exist
const getOrCreateContainer = () => {
    let container = document.getElementById('snackbar-container')
    if (!container) {
        container = document.createElement('div')
        container.id = 'snackbar-container'
        container.style.cssText = `
      position: fixed;
      top: 16px;
      right: 16px;
      z-index: 9999;
      pointer-events: none;
    `
        document.body.appendChild(container)
    }
    return container
}

// Show snackbar function
const showSnackbar = (options) => {
    const id = ++snackbarId
    const container = getOrCreateContainer()

    // Create a wrapper div for this specific snackbar
    const wrapper = document.createElement('div')
    wrapper.style.cssText = `
    pointer-events: auto;
    margin-bottom: 8px;
  `
    container.appendChild(wrapper)

    // Default options
    const defaultOptions = {
        type: 'info',
        title: '',
        message: '',
        duration: 1300,
        showProgress: true,
        persistent: false
    }

    const snackbarOptions = { ...defaultOptions, ...options }

    // Create snackbar component
    const snackbarVNode = h(Snackbar, {
        ...snackbarOptions,
        onClose: () => {
            removeSnackbar(id, wrapper)
        }
    })

    // Render the component
    render(snackbarVNode, wrapper)

    // Store reference
    snackbars.value.push({ id, wrapper, vnode: snackbarVNode })

    return id
}

// Remove snackbar
const removeSnackbar = (id, wrapper) => {
    const index = snackbars.value.findIndex(snack => snack.id === id)
    if (index > -1) {
        snackbars.value.splice(index, 1)
    }

    if (wrapper && wrapper.parentNode) {
        wrapper.parentNode.removeChild(wrapper)
    }

    // Clean up container if no snackbars left
    const container = document.getElementById('snackbar-container')
    if (container && container.children.length === 0) {
        container.remove()
    }
}

// Clear all snackbars
const clearAllSnackbars = () => {
    snackbars.value.forEach(snack => {
        if (snack.wrapper && snack.wrapper.parentNode) {
            snack.wrapper.parentNode.removeChild(snack.wrapper)
        }
    })
    snackbars.value = []

    const container = document.getElementById('snackbar-container')
    if (container) {
        container.remove()
    }
}

// Convenience methods for different types
const showSuccess = (message, options = {}) => {
    return showSnackbar({
        type: 'success',
        message,
        ...options
    })
}

const showError = (message, options = {}) => {
    return showSnackbar({
        type: 'error',
        message,
        duration: 7000, // Errors stay longer
        ...options
    })
}

const showWarning = (message, options = {}) => {
    return showSnackbar({
        type: 'warning',
        message,
        ...options
    })
}

const showInfo = (message, options = {}) => {
    return showSnackbar({
        type: 'info',
        message,
        ...options
    })
}

// Main composable
export function useSnackbar() {
    return {
        // State
        snackbars,

        // Methods
        showSnackbar,
        removeSnackbar,
        clearAllSnackbars,

        // Convenience methods
        showSuccess,
        showError,
        showWarning,
        showInfo
    }
}

// Global instance for use outside of components
export const snackbar = {
    show: showSnackbar,
    success: showSuccess,
    error: showError,
    warning: showWarning,
    info: showInfo,
    clear: clearAllSnackbars
}

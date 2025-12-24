<template> <button :class="[
    sizeClass,
    'flex items-center justify-center rounded focus:outline-none transition-all duration-200 ease-out',
    'border border-gray-200 hover:border-gray-300',
    bgColor,
    'hover:shadow-sm active:scale-95',
    disabled ? 'opacity-40 cursor-not-allowed hover:shadow-none active:scale-100' : 'cursor-pointer'
]" :title="title" :disabled="disabled" @click="$emit('click')">
        <span v-if="icon === 'delete'">
            <svg xmlns="http://www.w3.org/2000/svg" :class="iconClass" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h2a2 2 0 012 2v2" />
            </svg>
        </span>
        <span v-else-if="icon === 'view'">
            <svg xmlns="http://www.w3.org/2000/svg" :class="iconClass" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
        </span>
        <span v-else-if="icon === 'edit'">
            <svg xmlns="http://www.w3.org/2000/svg" :class="iconClass" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
        </span> <span v-else-if="icon === 'copy'">
            <svg xmlns="http://www.w3.org/2000/svg" :class="iconClass" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
        </span>
        <span v-else-if="icon === 'add'">
            <svg xmlns="http://www.w3.org/2000/svg" :class="iconClass" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v16m8-8H4" />
            </svg>
        </span>
        <span v-else-if="icon === 'close'">
            <svg xmlns="http://www.w3.org/2000/svg" :class="iconClass" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </span>
    </button>
</template>

<script>
export default {
    name: 'ActionButton', props: {
        icon: {
            type: String,
            required: true,
            validator: v => ['delete', 'view', 'edit', 'copy', 'add', 'close'].includes(v)
        },
        title: {
            type: String,
            default: ''
        },
        disabled: {
            type: Boolean,
            default: false
        },
        size: {
            type: String,
            default: 'md', // 'sm' | 'md' | 'lg'
            validator: v => ['sm', 'md', 'lg'].includes(v)
        },
        variant: {
            type: String,
            default: 'outline', // 'outline' | 'filled'
            validator: v => ['outline', 'filled'].includes(v)
        }
    }, computed: {
        bgColor() {
            if (this.variant === 'filled') {
                switch (this.icon) {
                    case 'delete': return 'bg-red-500 hover:bg-red-600 focus:ring-2 focus:ring-red-300 border-red-500 hover:border-red-600';
                    case 'view': return 'bg-blue-500 hover:bg-blue-600 focus:ring-2 focus:ring-blue-300 border-blue-500 hover:border-blue-600';
                    case 'edit': return 'bg-amber-500 hover:bg-amber-600 focus:ring-2 focus:ring-amber-300 border-amber-500 hover:border-amber-600';
                    case 'copy': return 'bg-gray-500 hover:bg-gray-600 focus:ring-2 focus:ring-gray-300 border-gray-500 hover:border-gray-600';
                    case 'add': return 'bg-green-500 hover:bg-green-600 focus:ring-2 focus:ring-green-300 border-green-500 hover:border-green-600';
                    case 'close': return 'bg-gray-500 hover:bg-gray-600 focus:ring-2 focus:ring-gray-300 border-gray-500 hover:border-gray-600';
                    default: return 'bg-gray-500 hover:bg-gray-600 focus:ring-2 focus:ring-gray-300 border-gray-500 hover:border-gray-600';
                }
            } else {
                // Outline variant (default)
                switch (this.icon) {
                    case 'delete': return 'bg-white hover:bg-red-50 focus:ring-2 focus:ring-red-200';
                    case 'view': return 'bg-white hover:bg-blue-50 focus:ring-2 focus:ring-blue-200';
                    case 'edit': return 'bg-white hover:bg-amber-50 focus:ring-2 focus:ring-amber-200';
                    case 'copy': return 'bg-white hover:bg-gray-50 focus:ring-2 focus:ring-gray-200';
                    case 'add': return 'bg-white hover:bg-green-50 focus:ring-2 focus:ring-green-200';
                    case 'close': return 'bg-white hover:bg-gray-50 focus:ring-2 focus:ring-gray-200';
                    default: return 'bg-white hover:bg-gray-50 focus:ring-2 focus:ring-gray-200';
                }
            }
        },
        sizeClass() {
            switch (this.size) {
                case 'sm': return 'w-8 h-8';
                case 'lg': return 'w-12 h-12';
                default: return 'w-9 h-9';
            }
        }, iconClass() {
            const baseClass = 'transition-colors duration-200';
            const iconColor = this.variant === 'filled' ? 'text-white' : this.getIconColor();

            switch (this.size) {
                case 'sm': return `w-4 h-4 ${iconColor} ${baseClass}`;
                case 'lg': return `w-6 h-6 ${iconColor} ${baseClass}`;
                default: return `w-5 h-5 ${iconColor} ${baseClass}`;
            }
        }
    },
    methods: {
        getIconColor() {
            switch (this.icon) {
                case 'delete': return 'text-red-500';
                case 'view': return 'text-blue-500';
                case 'edit': return 'text-amber-500';
                case 'copy': return 'text-gray-500';
                case 'add': return 'text-green-500';
                case 'close': return 'text-gray-500';
                default: return 'text-gray-500';
            }
        }
    }
}
</script>

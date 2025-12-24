<template>
    <i :class="[
        'fas', // kembali ke solid tapi dengan styling khusus
        `fa-${name}`,
        sizeClasses,
        colorClasses,
        className
    ]"></i>
</template>

<script>
export default {
    name: 'Icon',
    props: {
        name: {
            type: String,
            required: true
        },
        size: {
            type: String,
            default: 'md'
        },
        variant: {
            type: String,
            default: 'default'
        },
        className: {
            type: String,
            default: ''
        }
    },
    computed: {
        sizeClasses() {
            const sizes = {
                'xs': 'text-[12px]',
                'sm': 'text-[13px]',
                'md': 'text-[14px]',
                'lg': 'text-[15px]'
            }
            return sizes[this.size] || sizes.md
        },
        colorClasses() {
            const variants = {
                'default': 'text-gray-100',
                'light': 'text-white',
                'active': 'text-white',
                'primary': 'text-[#00B7C4]',
                'muted': 'text-gray-300'
            }
            return variants[this.variant] || variants.default
        }
    }
}
</script>

<style scoped>
i {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.2em;
    min-height: 1.2em;
}
</style>

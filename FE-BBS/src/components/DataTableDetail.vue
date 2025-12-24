<template>
    <div class="border border-gray-300 rounded-lg overflow-hidden shadow-sm">
        <table class="min-w-full divide-y divide-gray-300">
            <thead class="bg-gray-100">
                <tr>
                    <th v-for="col in columns" :key="col.value"
                        class="px-4 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider select-none border-b border-gray-400"
                        :style="col.value === 'no' ? 'width: 80px; min-width: 80px;' : 'min-width: 150px;'">
                        <span>{{ col.text }}</span>
                    </th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                <slot>
                    <!-- Default body jika slot tidak diisi -->
                    <tr v-for="(row, rowIndex) in items" :key="rowIndex">
                        <td v-for="col in columns" :key="col.value"
                            class="px-4 py-3 text-sm text-gray-800 border-b border-gray-200"
                            :style="col.value === 'no' ? 'width: 80px; min-width: 80px;' : 'min-width: 150px;'">
                            <slot :name="`cell-${col.value}`" :row="row" :rowIndex="rowIndex">
                                <template
                                    v-if="(col.editable === true || col.type === 'select') && !(row.readonly && (col.value === 'company' || col.value === 'responsibility'))">
                                    <EditableTableField v-model="row[col.value]" :type="col.type || 'text'"
                                        :options="col.options || []" :placeholder="col.placeholder || ''"
                                        :disabled="col.disabled" />
                                </template>
                                <template v-else>
                                    {{ row[col.value] }}
                                </template>
                            </slot>
                        </td>
                    </tr>
                    <tr v-if="!items || items.length === 0">
                        <td :colspan="columns.length" class="text-center py-6 text-gray-400">No data found.</td>
                    </tr>
                </slot>
            </tbody>
        </table>
    </div>
</template>

<script setup>
import EditableTableField from '@/components/EditableTableField.vue';
import FormField from '@/components/FormField.vue';

const props = defineProps({
    columns: { type: Array, required: true },
    items: { type: Array, required: true }
});
</script>

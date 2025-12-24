<template>
  <div>
    <!-- List View -->
    <ContentCard v-if="!showForm">
      <!-- Header with Search and Actions -->
      <div class="flex justify-between items-center mb-4">
        <div class="flex items-center gap-4">
          <div class="flex-1 max-w-md relative">
            <input
              v-model="searchTerm"
              type="text"
              placeholder="Cari penghuni..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              @input="handleSearch($event.target.value)"
            />
            <svg v-if="!loading" class="absolute right-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <svg v-if="loading" class="absolute right-3 top-2.5 h-5 w-5 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-2 ml-4">
          <ActionButton icon="add" title="Tambah Angpao" size="md" variant="filled" @click="handleAdd" />
          <ActionButton icon="delete" title="Hapus" size="md" variant="filled" :disabled="!selectedItem" @click="handleDelete" />
          <ActionButton icon="view" title="Lihat Detail" size="md" variant="filled" :disabled="!selectedItem" @click="handleView" />
          <ActionButton icon="edit" title="Edit" size="md" variant="filled" :disabled="!selectedItem" @click="handleEdit" />
          <ActionButton icon="copy" title="Copy" size="md" variant="filled" :disabled="!selectedItem" @click="handleCopy" />
        </div>
      </div>

      <!-- Data Table -->
      <DataTable
        :columns="columns"
        :items="dataTables"
        :server-side="true"
        :page-size="pageSize"
        :total-items="totalItems"
        :current-page-prop="currentPage"
        :total-pages-prop="totalPages"
        :show-pagination="true"
        @row-click="handleRowClick"
        @page-changed="handlePageChanged"
        @page-size-changed="handlePageSizeChanged"
        @sort-changed="handleSortChanged"
      />
    </ContentCard>

    <!-- Form View -->
    <ContentCard v-else>
      <!-- Form Header with Divider -->
      <FormHeader :title="formConfig.title" :subtitle="formConfig.subtitle" @back="handleCancel">
        <template #actions>
          <!-- Edit button in view mode -->
          <ActionButton v-if="isViewMode" icon="edit" title="Edit Angpao" size="md" variant="filled" @click="handleEdit" />
        </template>
      </FormHeader>

      <!-- Form Content -->
      <form @submit.prevent="handleFormSubmit">
        <div class="grid grid-cols-2 gap-x-8">
          <div class="col-span-2 flex gap-8">
            <!-- Penghuni -->
            <div class="flex-1 flex items-center gap-4">
              <label class="w-32 text-sm font-medium text-gray-700">Penghuni</label>
              <FormField v-model="formData.m_penghuni_id" type="select" placeholder="Pilih penghuni" :options="penghuniOptions" :disabled="formConfig.readonly" class="flex-1" hide-label />
            </div>
            <!-- Balance -->
            <div class="flex-1 flex items-center gap-4">
              <label class="w-32 text-sm font-medium text-gray-700">Balance</label>
              <div class="flex-1 relative">
                <input :value="displayBalance" disabled class="w-full px-2 border rounded bg-gray-100 text-gray-800 font-semibold" placeholder="Rp 0" style="height: 38px" />
              </div>
            </div>
          </div>
        </div>

        <!-- Detail List Table -->
        <div class="pt-8">
          <label class="block text-base font-semibold mb-2">Detail Angpao</label>
          <div class="flex gap-2 mb-2">
            <BaseButton v-if="!formConfig.readonly" type="button" variant="outline" color="green" @click="addDetailListRow">+ Add Detail</BaseButton>
          </div>
          <DataTableDetail :columns="detailListColumns" v-model:items="detailListForm">
            <template #default>
              <tr v-for="(row, rowIndex) in detailListForm" :key="rowIndex" class="hover:bg-blue-50 transition-colors group">
                <td v-for="col in detailListColumns" :key="col.value" class="align-middle px-4 py-2 border-b border-gray-200">
                  <template v-if="col.value === 'action'">
                    <div class="flex justify-center">
                      <ActionButton v-if="!formConfig.readonly" icon="delete" title="Remove Item" size="sm" variant="outline" color="red" @click="removeDetailListRow(rowIndex)" class="opacity-80 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </template>
                  <template v-else-if="col.value === 'jenis_transaksi_id'">
                    <span v-if="isViewMode" class="font-medium text-gray-700">
                      {{ jenisTransaksiOptions.find((opt) => opt.value === row[col.value])?.label || "-" }}
                    </span>
                    <FormField v-else v-model="row[col.value]" type="select" :options="jenisTransaksiOptions" :disabled="formConfig.readonly" class="w-full" hide-label />
                  </template>
                  <template v-else-if="col.value === 'tanggal'">
                    <input v-if="!isViewMode" type="date" v-model="row[col.value]" :disabled="formConfig.readonly" class="border rounded px-2 py-1 w-full" />
                    <span v-else class="font-medium text-gray-700">{{ row[col.value] ? new Date(row[col.value]).toLocaleDateString("id-ID") : "-" }}</span>
                  </template>
                  <template v-else-if="col.type === 'number'">
                    <div class="relative">
                      <input
                        v-if="!isViewMode"
                        :value="formatNumberWithDot(row[col.value])"
                        @input="(e) => (row[col.value] = parseInt(e.target.value.replace(/\D/g, ''), 10) || 0)"
                        :disabled="formConfig.readonly"
                        class="border rounded px-2 py-1 w-full"
                        inputmode="numeric"
                        placeholder="0"
                      />
                      <span v-else class="font-medium text-gray-700">{{ formatRupiah(row[col.value]) }}</span>
                    </div>
                  </template>
                  <template v-else>
                    <input v-if="!isViewMode" type="text" v-model="row[col.value]" :disabled="formConfig.readonly" class="border rounded px-2 py-1 w-full" />
                    <span v-else class="font-medium text-gray-700">{{ row[col.value] || "-" }}</span>
                  </template>
                </td>
              </tr>
              <tr v-if="!detailListForm || detailListForm.length === 0">
                <td :colspan="detailListColumns.length" class="text-center py-6 text-gray-400 bg-gray-50">No data found.</td>
              </tr>
            </template>
          </DataTableDetail>
        </div>

        <!-- Form Actions -->
        <div v-if="!isViewMode" class="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <BaseButton type="button" variant="outline" color="gray" @click="handleCancel"> Cancel </BaseButton>
          <BaseButton type="submit" variant="filled" color="blue" :disabled="formLoading" @click="handleFormSubmit" :loading="formLoading">
            {{ formConfig.submitText }}
          </BaseButton>
        </div>

        <!-- View Mode Actions -->
        <div v-else class="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <BaseButton type="button" variant="outline" color="gray" @click="handleCancel"> Back to List </BaseButton>
          <BaseButton type="button" variant="filled" color="blue" @click="handleEdit"> Edit Angpao </BaseButton>
        </div>
      </form>
    </ContentCard>

    <!-- Confirmation Modal -->
    <ConfirmationModal v-model="showConfirmModal" :title="confirmModalConfig.title" :message="confirmModalConfig.message" :confirm-text="confirmModalConfig.confirmText" @confirm="confirmModalConfig.onConfirm" />
  </div>
</template>

<script setup>
import { useAngpaoManagement } from "./useAngpaoManagement.js";
import ContentCard from "@/components/ContentCard.vue";
import DataTable from "@/components/DataTable.vue";
import ActionButton from "@/components/ActionButton.vue";
import FormHeader from "@/components/FormHeader.vue";
import FormField from "@/components/FormField.vue";
import BaseButton from "@/components/BaseButton.vue";
import TableSearch from "@/components/TableSearch.vue";
import ConfirmationModal from "@/components/ConfirmationModal.vue";
import DataTableDetail from "@/components/DataTableDetail.vue";
import { computed, ref } from "vue";

// Use the composable
const {
  // === Reactive State ===
  searchTerm,
  selectedItem,
  showForm,
  formLoading,
  formData,
  loading,
  error,

  // === Computed Properties ===
  dataTables,
  formConfig,
  isEditMode,
  isViewMode,
  isCopyMode,
  isCreateMode,

  // === Configuration ===
  columns,
  userTypeOptions,

  // === Pagination ===
  currentPage,
  pageSize,
  totalItems,
  totalPages,

  // === Confirmation Modal ===
  showConfirmModal,
  confirmModalConfig,

  // === Event Handlers ===
  handleSearch,
  handleRowClick,
  handlePageChanged,
  handlePageSizeChanged,
  handleSortChanged,

  // === CRUD Operations ===
  handleAdd,
  handleEdit,
  handleView,
  handleCopy,
  handleDelete,
  handleCancel,
  handleFormSubmit,

  // === User Default Detail List ===
  detailListForm,
  detailListColumns,
  addDetailListRow,
  removeDetailListRow,

  // === SelectDataModal Logic ===
  showSelectModal,
  selectedRows,
  selectOptions,
  selectColumns,
  handleAddToList,
  handleSelectConfirm,
  handleSelectCancel,

  // === Penerima and Status Options ===
  penghuniOptions,
  jenisTransaksiOptions,
} = useAngpaoManagement();

// Formatter for Rupiah
function formatRupiah(value) {
  if (typeof value !== "number") value = parseFloat(value) || 0;
  return value.toLocaleString("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 });
}

// Format only number with thousand separator (dot)
function formatNumberWithDot(value) {
  if (value === null || value === undefined) return "";
  value = String(value).replace(/[^\d]/g, "");
  if (!value) return "";
  return parseInt(value, 10).toLocaleString("id-ID");
}

import { computed as vueComputed } from "vue";
const displayBalance = vueComputed(() => formatRupiah(formData.value?.balance || 0));

// Expose formatter for template
// (Vue SFC setup script: all functions are available in template)
</script>

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
          <StatusFilter v-model="statusFilterLabel" :options="filterOptions" @change="handleFilterChange" />
        </div>
        <!-- Action Buttons -->
        <div class="flex items-center gap-2 ml-4">
          <ActionButton icon="add" title="Tambah Deposit" size="md" variant="filled" @click="handleAdd" />
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
      <FormHeader :title="formConfig.title" :subtitle="formConfig.subtitle" @back="handleCancel">
        <template #actions>
          <!-- Action text di header dimatikan pada mode apapun -->
        </template>
      </FormHeader>
      <!-- Form Content -->
      <form @submit.prevent="handleFormSubmit">
        <div class="grid grid-cols-2 gap-x-8">
          <!-- Left Column -->
          <div class="space-y-4">
            <!-- Penghuni -->
            <div class="flex items-center gap-4">
              <label class="w-32 text-sm font-medium text-gray-700">Penghuni</label>
              <FormField v-model="formData.m_penghuni_id" type="select" placeholder="Pilih penghuni" :options="penghuniOptions" :disabled="isFormReadonly" class="flex-1" hide-label />
            </div>
            <!-- Status -->
            <div class="flex items-center gap-4">
              <label class="w-32 text-sm font-medium text-gray-700">Status</label>
              <FormField v-model="formData.status_id" type="select" placeholder="Pilih status" :options="statusOptions" :disabled="true" class="flex-1" hide-label />
            </div>
          </div>
          <!-- Right Column -->
          <div class="space-y-4">
            <!-- Balance -->
            <div class="flex items-center gap-4">
              <label class="w-32 text-sm font-medium text-gray-700">Balance</label>
              <FormField v-if="isFormReadonly" :model-value="formDataBalanceDisplay" type="text" placeholder="Balance" :disabled="true" class="flex-1" hide-label readonly />
              <FormField v-else v-model="formData.balance" type="number" placeholder="Balance" :disabled="true" class="flex-1" hide-label />
              <span v-if="!isFormReadonly && formData.balance !== undefined && formData.balance !== null" class="text-xs text-gray-500 ml-2">{{ formDataBalanceDisplay }}</span>
            </div>
          </div>
        </div>
        <!-- Detail List Table -->
        <div class="pt-8">
          <label class="block text-base font-semibold mb-2">Detail Transaksi</label>
          <div class="flex gap-2 mb-2">
            <BaseButton v-if="!isFormReadonly" type="button" variant="outline" color="green" @click="() => detailListForm.push({ tgl_transaksi: '', jenis_transaksi: '', catatan_transaksi: '', balance: 0 })"> + Add to List</BaseButton>
          </div>
          <table class="min-w-full border rounded">
            <thead class="bg-gray-50">
              <tr>
                <th v-for="col in detailListColumns" :key="col.value" class="px-4 py-2 text-left text-xs font-bold text-gray-700">{{ col.text }}</th>
                <th v-if="!isFormReadonly" class="px-2"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rowIndex) in isFormReadonly ? detailListFormDisplay : detailListForm" :key="rowIndex" class="hover:bg-blue-50 transition-colors group">
                <td v-for="col in detailListColumns" :key="col.value" class="align-middle px-4 py-2 border-b border-gray-200">
                  <template v-if="!isFormReadonly">
                    <input v-if="col.value === 'tgl_transaksi'" type="date" v-model="row.tgl_transaksi" class="border rounded px-2 py-1 w-full" />
                    <FormField v-else-if="col.value === 'jenis_transaksi'" v-model="row.jenis_transaksi_id" type="select" :options="jenisTransaksiOptions" option-value="value" option-label="label" placeholder="Pilih Jenis" class="w-full" />
                    <input v-else-if="col.value === 'catatan_transaksi'" type="text" v-model="row.catatan_transaksi" class="border rounded px-2 py-1 w-full" placeholder="Catatan" />
                    <input v-else-if="col.value === 'balance'" type="number" v-model.number="row.balance" class="border rounded px-2 py-1 w-full" placeholder="Balance" />
                    <span v-if="col.value === 'balance' && row.balance !== undefined && row.balance !== null" class="block text-xs text-gray-500 mt-1">{{ formatCurrency(row.balance) }}</span>
                  </template>
                  <template v-else>
                    <span v-if="col.value === 'jenis_transaksi_id'" class="block truncate font-medium text-gray-700">
                      {{ jenisTransaksiOptions.find((opt) => opt.value === row[col.value])?.label || row[col.value] }}
                    </span>
                    <span v-else-if="col.value === 'tgl_transaksi'" class="block truncate font-medium text-gray-700">
                      {{ row[col.value] ? new Date(row[col.value]).toLocaleDateString("id-ID") : "-" }}
                    </span>
                    <span v-else-if="col.value === 'balance'" class="block truncate font-medium text-gray-700">
                      {{ formatCurrency(row[col.value]) }}
                    </span>
                    <span v-else class="block truncate font-medium text-gray-700">
                      {{ row[col.value] || "-" }}
                    </span>
                  </template>
                </td>
                <td v-if="!isFormReadonly" class="px-2">
                  <button type="button" @click="detailListForm.splice(rowIndex, 1)" class="text-red-500 hover:text-red-700">Hapus</button>
                </td>
              </tr>
              <tr v-if="!(isFormReadonly ? detailListFormDisplay : detailListForm) || (isFormReadonly ? detailListFormDisplay : detailListForm).length === 0">
                <td :colspan="detailListColumns.length + (!isFormReadonly ? 1 : 0)" class="text-center py-6 text-gray-400 bg-gray-50">No data found.</td>
              </tr>
            </tbody>
          </table>
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
          <!-- Action text di header dimatikan pada mode apapun -->
        </div>
      </form>
    </ContentCard>
    <!-- Confirmation Modal -->
    <ConfirmationModal v-model="showConfirmModal" :title="confirmModalConfig.title" :message="confirmModalConfig.message" :confirm-text="confirmModalConfig.confirmText" @confirm="confirmModalConfig.onConfirm" />
  </div>
</template>

<script setup>
import { useDepositManagement } from "./useDepositManagement.js";
import ContentCard from "@/components/ContentCard.vue";
import DataTable from "@/components/DataTable.vue";
import ActionButton from "@/components/ActionButton.vue";
import FormHeader from "@/components/FormHeader.vue";
import FormField from "@/components/FormField.vue";
import BaseButton from "@/components/BaseButton.vue";
import TableSearch from "@/components/TableSearch.vue";
import StatusFilter from "@/components/StatusFilter.vue";
import ConfirmationModal from "@/components/ConfirmationModal.vue";
import DataTableDetail from "@/components/DataTableDetail.vue";
import { computed, ref } from "vue";

const {
  searchTerm,
  statusFilter,
  selectedItem,
  showForm,
  formLoading,
  formData,
  userDefaultItems,
  loading,
  error,
  dataTables,
  formConfig,
  isEditMode,
  isViewMode,
  isCopyMode,
  isCreateMode,
  filterOptions,
  columns,
  userTypeOptions,
  currentPage,
  pageSize,
  totalItems,
  totalPages,
  showConfirmModal,
  confirmModalConfig,
  handleSearch,
  handleFilterChange,
  handleRowClick,
  handlePageChanged,
  handlePageSizeChanged,
  handleSortChanged,
  handleAdd,
  handleEdit,
  handleView,
  handleCopy,
  handleDelete,
  handleCancel,
  handleFormSubmit,
  detailListForm,
  detailListColumns,
  addDetailListRow,
  removeDetailListRow,
  isFormReadonly,
  penghuniOptions,
  statusOptions,
  jenisTransaksiOptions,
  detailListFormDisplay,
  formatCurrency,
} = useDepositManagement();

// Computed: formatted balance for header
const formDataBalanceDisplay = computed(() => formatCurrency(formData.balance ?? formData.value?.balance));
</script>

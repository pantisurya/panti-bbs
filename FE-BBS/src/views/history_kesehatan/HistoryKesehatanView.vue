<template>
  <div>
    <!-- List View -->
    <ContentCard v-if="!showForm">
      <!-- Header with Search and Actions -->
      <div class="flex justify-between items-center mb-4">
        <div class="flex items-center gap-4">
          <div class="flex-1 max-w-md relative">
            <input v-model="searchTerm" type="text" placeholder="Cari history kesehatan..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              @input="handleSearch($event.target.value)" />
            <svg v-if="!loading" class="absolute right-3 top-2.5 h-5 w-5 text-gray-400" fill="none"
              stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <svg v-if="loading" class="absolute right-3 top-2.5 h-5 w-5 animate-spin text-blue-500" fill="none"
              viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
          </div>
          <!-- <StatusFilter v-model="statusFilter" :options="filterOptions" @change="handleFilterChange" /> -->
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-2 ml-4">
          <ActionButton icon="add" title="Add New User Default" size="md" variant="filled" @click="handleAdd" />
          <ActionButton icon="delete" title="Delete Selected" size="md" variant="filled" :disabled="!selectedItem"
            @click="handleDelete" />
          <ActionButton icon="view" title="View Details" size="md" variant="filled" :disabled="!selectedItem"
            @click="handleView" />
          <ActionButton icon="edit" title="Edit Item" size="md" variant="filled" :disabled="!selectedItem"
            @click="handleEdit" />
          <ActionButton icon="copy" title="Copy Item" size="md" variant="filled" :disabled="!selectedItem"
            @click="handleCopy" />
        </div>
      </div>

      <!-- Data Table -->
      <DataTable :columns="columns" :items="dataTables" :server-side="true" :page-size="pageSize"
        :total-items="totalItems" :current-page-prop="currentPage" :total-pages-prop="totalPages"
        :show-pagination="true" @row-click="handleRowClick" @page-changed="handlePageChanged"
        @page-size-changed="handlePageSizeChanged" @sort-changed="handleSortChanged" />
    </ContentCard>

    <!-- Form View -->
    <ContentCard v-else>
      <!-- Form Header with Divider -->
      <FormHeader :title="formConfig.title" :subtitle="formConfig.subtitle" @back="handleCancel">
        <template #actions>
          <!-- Edit button in view mode -->
          <ActionButton v-if="isViewMode" icon="edit" title="Edit User Default" size="md" variant="filled"
            @click="handleEdit" />
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
              <FormField v-model="formData.m_penghuni_id" type="select" placeholder="Pilih Penghuni"
                :options="selectOptions.penghuni" :disabled="formConfig.readonly" help-text="Pilih penghuni terkait"
                class="flex-1" hide-label />
            </div>

            <!-- Karyawan -->
            <div class="flex items-center gap-4">
              <label class="w-32 text-sm font-medium text-gray-700">Pendamping</label>
              <FormField v-model="formData.m_kary_id" type="select" placeholder="Pilih Karyawan"
                :options="selectOptions.karyawan" :disabled="formConfig.readonly" help-text="Pilih karyawan terkait"
                class="flex-1" hide-label />
            </div>

            <!-- Jenis Laporan -->
            <div class="flex items-center gap-4">
              <label class="w-32 text-sm font-medium text-gray-700">Jenis Laporan</label>
              <FormField v-model="formData.jenis_laporan_id" type="select" placeholder="Pilih Jenis Laporan"
                :options="selectOptions.jenisLaporan" :disabled="formConfig.readonly" help-text="Pilih jenis laporan"
                class="flex-1" hide-label />
            </div>
          </div>

          <!-- Right Column -->
          <div class="space-y-4">
            <!-- Tanggal Laporan -->
            <div class="flex items-center gap-4">
              <label class="w-32 text-sm font-medium text-gray-700">Tanggal Laporan</label>
              <FormField v-model="formData.tgl_laporan" type="date" placeholder="Pilih tanggal"
                :disabled="formConfig.readonly" help-text="Tanggal laporan kesehatan" class="flex-1" hide-label />
            </div>

            <!-- Laporan -->
            <div class="flex items-center gap-4">
              <label class="w-32 text-sm font-medium text-gray-700">Laporan</label>
              <FormField v-model="formData.laporan" type="textarea" placeholder="Isi laporan kesehatan"
                :disabled="formConfig.readonly" help-text="Isi laporan kesehatan" class="flex-1" hide-label />
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div v-if="!isViewMode" class="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <BaseButton type="button" variant="outline" color="gray" @click="handleCancel"> Cancel </BaseButton>
          <BaseButton type="submit" variant="filled" color="blue" :disabled="formLoading" @click="handleFormSubmit"
            :loading="formLoading">
            {{ formConfig.submitText }}
          </BaseButton>
        </div>

        <!-- View Mode Actions -->
        <div v-else class="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <BaseButton type="button" variant="outline" color="gray" @click="handleCancel"> Back to List </BaseButton>
          <BaseButton type="button" variant="filled" color="blue" @click="handleEdit"> Edit User Default </BaseButton>
        </div>
      </form>
    </ContentCard>

    <!-- Confirmation Modal -->
    <ConfirmationModal v-model="showConfirmModal" :title="confirmModalConfig.title"
      :message="confirmModalConfig.message" :confirm-text="confirmModalConfig.confirmText"
      @confirm="confirmModalConfig.onConfirm" />
  </div>
</template>

<script setup>
import { useHistoryKesehatanManagement } from "./useHistoryKesehatanManagement.js";
import ContentCard from "@/components/ContentCard.vue";
import DataTable from "@/components/DataTable.vue";
import ActionButton from "@/components/ActionButton.vue";
import FormHeader from "@/components/FormHeader.vue";
import FormField from "@/components/FormField.vue";
import BaseButton from "@/components/BaseButton.vue";
import StatusFilter from "@/components/StatusFilter.vue";
import ConfirmationModal from "@/components/ConfirmationModal.vue";
import DataTableDetail from "@/components/DataTableDetail.vue";
import SelectDataModal from "@/components/SelectDataModal.vue";
import { computed, ref } from "vue";

// Use the composable
const {
  // === Reactive State ===
  searchTerm,
  statusFilter,
  selectedItem,
  showForm,
  formLoading,
  formData,
  userDefaultItems,
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
  filterOptions,
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
  handleFilterChange,
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
  // handleAddToList,
  handleSelectConfirm,
  handleSelectCancel,
} = useHistoryKesehatanManagement();
</script>

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
              placeholder="Cari karyawan..."
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
          <StatusFilter v-model="statusFilter" :options="filterOptions" @change="handleFilterChange" />
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-2 ml-4">
          <ActionButton icon="add" title="Add New Karyawan" size="md" variant="filled" @click="handleAdd" />
          <ActionButton icon="delete" title="Delete Selected" size="md" variant="filled" :disabled="!selectedItem" @click="handleDelete" />
          <ActionButton icon="view" title="View Details" size="md" variant="filled" :disabled="!selectedItem" @click="handleView" />
          <ActionButton icon="edit" title="Edit Item" size="md" variant="filled" :disabled="!selectedItem" @click="handleEdit" />
          <ActionButton icon="copy" title="Copy Item" size="md" variant="filled" :disabled="!selectedItem" @click="handleCopy" />
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
          <ActionButton v-if="isViewMode" icon="edit" title="Edit Karyawan" size="md" variant="filled" @click="handleEdit" />
        </template>
      </FormHeader>

      <!-- Form Content -->
      <form @submit.prevent="handleFormSubmit">
        <div class="grid grid-cols-2 gap-x-8">
          <!-- Left Column -->
          <div class="space-y-4">
            <!-- Nama -->
            <div class="flex items-center gap-4">
              <label class="w-32 text-sm font-medium text-gray-700">Nama</label>
              <FormField v-model="formData.nama" type="text" placeholder="Masukkan nama" :required="!isViewMode" :disabled="formConfig.readonly" help-text="Nama karyawan" class="flex-1" hide-label />
            </div>

            <!-- Umur -->
            <div class="flex items-center gap-4">
              <label class="w-32 text-sm font-medium text-gray-700">Umur</label>
              <FormField v-model="formData.umur" type="number" placeholder="Masukkan umur" :required="!isViewMode" :disabled="formConfig.readonly" help-text="Umur karyawan" class="flex-1" hide-label />
            </div>

            <!-- No KTP -->
            <div class="flex items-center gap-4">
              <label class="w-32 text-sm font-medium text-gray-700">No KTP</label>
              <FormField v-model="formData.no_ktp" type="text" placeholder="Masukkan No KTP" :required="false" :disabled="formConfig.readonly" help-text="Nomor KTP karyawan" class="flex-1" hide-label />
            </div>

            <!-- Tanggal Lahir -->
            <div class="flex items-center gap-4">
              <label class="w-32 text-sm font-medium text-gray-700">Tanggal Lahir</label>
              <FormField v-model="formData.tgl_lahir" type="date" placeholder="Pilih tanggal lahir" :required="false" :disabled="formConfig.readonly" help-text="Tanggal lahir karyawan" class="flex-1" hide-label />
            </div>
          </div>

          <!-- Right Column -->
          <div class="space-y-4">
            <!-- Jabatan -->
            <div class="flex items-center gap-4">
              <label class="w-32 text-sm font-medium text-gray-700">Jabatan</label>
              <FormField v-model="formData.jabatan_id" type="select" placeholder="Pilih jabatan" :options="jabatanOptions" :required="!isViewMode" :disabled="formConfig.readonly" help-text="Jabatan karyawan" class="flex-1" hide-label />
            </div>

            <!-- Agama -->
            <div class="flex items-center gap-4">
              <label class="w-32 text-sm font-medium text-gray-700">Agama</label>
              <FormField v-model="formData.agama_id" type="select" placeholder="Pilih agama" :options="agamaOptions" :required="false" :disabled="formConfig.readonly" help-text="Agama karyawan" class="flex-1" hide-label />
            </div>

            <!-- Foto -->
            <div class="flex items-center gap-4">
              <label class="w-32 text-sm font-medium text-gray-700">Foto</label>
              <FormField v-model="formData.foto" type="text" placeholder="Link foto" :disabled="formConfig.readonly" help-text="Masukkan link foto (Google Drive, dsb)" class="flex-1" hide-label />
            </div>
            <!-- Preview Foto -->
            <div v-if="formData.foto && formData.foto.startsWith('http')" class="flex items-center gap-4">
              <label class="w-32 text-sm font-medium text-gray-700">Preview</label>
              <img :src="formData.foto" alt="Preview" class="max-h-32 rounded border" style="max-width: 200px; object-fit: contain" />
            </div>
            <!-- Tombol Preview Foto -->
            <button v-if="formData.foto && formData.foto.startsWith('http')" type="button" @click="showFotoPreviewModal = true" class="ml-1 text-blue-600 hover:text-blue-800 flex items-center" title="Preview Foto">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="10" cy="10" r="8" />
                <circle cx="10" cy="10" r="3" />
              </svg>
              <span class="ml-1">Preview</span>
            </button>
            <span v-if="!formData.foto && formConfig.readonly" class="text-gray-400 italic">Tidak ada foto</span>

            <!-- Status -->
            <div class="flex items-center gap-4">
              <label class="w-32 text-sm font-medium text-gray-700">Status</label>
              <FormField v-model="formData.status" type="checkbox" checkbox-label="Aktif" :disabled="formConfig.readonly" help-text="Status aktif/nonaktif" class="flex-1" hide-label />
            </div>
          </div>
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
          <BaseButton type="button" variant="filled" color="blue" @click="handleEdit"> Edit </BaseButton>
        </div>
      </form>
    </ContentCard>

    <!-- Confirmation Modal -->
    <ConfirmationModal v-model="showConfirmModal" :title="confirmModalConfig.title" :message="confirmModalConfig.message" :confirm-text="confirmModalConfig.confirmText" @confirm="confirmModalConfig.onConfirm" />

    <!-- Modal Preview Foto -->
    <div v-if="showFotoPreviewModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white rounded-lg shadow-lg p-6 relative max-w-lg w-full flex flex-col items-center">
        <button @click="showFotoPreviewModal = false" class="absolute top-2 right-2 text-gray-500 hover:text-red-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="4" y1="4" x2="20" y2="20" />
            <line x1="20" y1="4" x2="4" y2="20" />
          </svg>
        </button>
        <img :src="formData.foto" alt="Preview Foto" class="max-h-96 object-contain mb-4" />
        <span class="text-gray-700">Preview Foto Karyawan</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import ContentCard from "@/components/ContentCard.vue";
import DataTable from "@/components/DataTable.vue";
import ActionButton from "@/components/ActionButton.vue";
import FormHeader from "@/components/FormHeader.vue";
import FormField from "@/components/FormField.vue";
import BaseButton from "@/components/BaseButton.vue";
import StatusFilter from "@/components/StatusFilter.vue";
import ConfirmationModal from "@/components/ConfirmationModal.vue";

import { useKaryawanManagement } from "./useKaryawanManagement.js";

const showFotoPreviewModal = ref(false);

// Use the composable
const {
  // === Reactive State ===
  searchTerm,
  statusFilter,
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
  filterOptions,
  columns,
  jabatanOptions,
  agamaOptions,

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
} = useKaryawanManagement();
</script>

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
              placeholder="Cari berita..."
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
          <ActionButton icon="add" title="Tambah Berita" size="md" variant="filled" @click="handleAdd" />
          <ActionButton icon="delete" title="Hapus Berita" size="md" variant="filled" :disabled="!selectedItem" @click="handleDelete" />
          <ActionButton icon="view" title="Lihat Detail" size="md" variant="filled" :disabled="!selectedItem" @click="handleView" />
          <ActionButton icon="edit" title="Edit Berita" size="md" variant="filled" :disabled="!selectedItem" @click="handleEdit" />
          <ActionButton icon="copy" title="Copy Berita" size="md" variant="filled" :disabled="!selectedItem" @click="handleCopy" />
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
          <ActionButton v-if="isViewMode" icon="edit" title="Edit Berita" size="md" variant="filled" @click="handleEdit" />
        </template>
      </FormHeader>

      <!-- Form Content -->
      <form @submit.prevent="handleFormSubmit">
        <div class="grid grid-cols-2 gap-x-8">
          <!-- Left Column -->
          <div class="space-y-4">
            <!-- Judul -->
            <div class="flex items-center gap-4">
              <label class="w-32 text-sm font-medium text-gray-700">Judul</label>
              <FormField v-model="formData.judul" type="text" placeholder="Judul Berita" :disabled="formConfig.readonly" class="flex-1" hide-label />
            </div>
            <!-- Kategori -->
            <div class="flex items-center gap-4">
              <label class="w-32 text-sm font-medium text-gray-700">Kategori</label>
              <FormField v-model="formData.kategori_id" type="select" placeholder="Pilih Kategori" :options="selectOptions.kategori" :disabled="formConfig.readonly" class="flex-1" hide-label />
            </div>
            <!-- Isi Berita -->
            <div class="flex items-center gap-4">
              <label class="w-32 text-sm font-medium text-gray-700">Isi Berita</label>
              <FormField v-model="formData.isi_berita" type="textarea" placeholder="Isi Berita" :disabled="formConfig.readonly" class="flex-1" hide-label />
            </div>
          </div>

          <!-- Right Column -->
          <div class="space-y-4">
            <!-- Gambar -->
            <div class="flex items-center gap-4">
              <label class="w-32 text-sm font-medium text-gray-700">Gambar</label>
              <FormField v-model="formData.gambar" type="text" placeholder="Link gambar" :disabled="formConfig.readonly" help-text="Masukkan link gambar (Google Drive, dsb)" class="flex-1" hide-label />
            </div>
            <!-- Preview Gambar -->
            <div v-if="formData.gambar && formData.gambar.startsWith('http')" class="flex items-center gap-4">
              <label class="w-32 text-sm font-medium text-gray-700">Preview</label>
              <img :src="formData.gambar" alt="Preview" class="max-h-32 rounded border" style="max-width: 200px; object-fit: contain" />
            </div>
            <!-- Tombol Preview Gambar -->
            <button v-if="gambarPreview" type="button" @click="showGambarPreviewModal = true" class="ml-1 text-blue-600 hover:text-blue-800 flex items-center" title="Preview Gambar">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="10" cy="10" r="8" />
                <circle cx="10" cy="10" r="3" />
              </svg>
              <span class="ml-1">Preview</span>
            </button>
            <button v-if="gambarPreview && !formConfig.readonly" type="button" @click="cancelGambar" class="ml-1 text-gray-500 hover:text-red-600 flex items-center" title="Hapus Gambar">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="4" y1="4" x2="16" y2="16" />
                <line x1="16" y1="4" x2="4" y2="16" />
              </svg>
            </button>
            <span v-if="!gambarPreview && formConfig.readonly" class="text-gray-400 italic">Tidak ada gambar</span>

            <!-- Status -->
            <div class="flex items-center gap-4">
              <label class="w-32 text-sm font-medium text-gray-700">Status</label>
              <FormField v-model="formData.status" type="checkbox" checkbox-label="Aktif" :disabled="formConfig.readonly" class="flex-1" hide-label />
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
        <div v-else class="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <BaseButton type="button" variant="outline" color="gray" @click="handleCancel"> Back to List </BaseButton>
          <BaseButton type="button" variant="filled" color="blue" @click="handleEdit"> Edit Berita </BaseButton>
        </div>
      </form>
    </ContentCard>

    <!-- Confirmation Modal -->
    <ConfirmationModal v-model="showConfirmModal" :title="confirmModalConfig.title" :message="confirmModalConfig.message" :confirm-text="confirmModalConfig.confirmText" @confirm="confirmModalConfig.onConfirm" />

    <!-- Modal Preview Gambar -->
    <div v-if="showGambarPreviewModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white rounded-lg shadow-lg p-6 relative max-w-lg w-full flex flex-col items-center">
        <button @click="showGambarPreviewModal = false" class="absolute top-2 right-2 text-gray-500 hover:text-red-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="4" y1="4" x2="20" y2="20" />
            <line x1="20" y1="4" x2="4" y2="20" />
          </svg>
        </button>
        <img :src="gambarPreview" alt="Preview Gambar" class="max-h-96 object-contain mb-4" />
        <span class="text-gray-700">Preview Gambar Berita</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useBeritaManagement } from "./useBeritaManagement.js";
import ContentCard from "@/components/ContentCard.vue";
import DataTable from "@/components/DataTable.vue";
import ActionButton from "@/components/ActionButton.vue";
import FormHeader from "@/components/FormHeader.vue";
import FormField from "@/components/FormField.vue";
import BaseButton from "@/components/BaseButton.vue";
import TableSearch from "@/components/TableSearch.vue";
import StatusFilter from "@/components/StatusFilter.vue";
import ConfirmationModal from "@/components/ConfirmationModal.vue";
import { ref, watch, computed } from "vue";

const {
  searchTerm,
  statusFilter,
  selectedItem,
  showForm,
  formLoading,
  formData,
  dataTables,
  loading,
  error,
  formConfig,
  isEditMode,
  isViewMode,
  isCopyMode,
  isCreateMode,
  selectOptions,
  columns,
  currentPage,
  pageSize,
  totalItems,
  totalPages,
  showConfirmModal,
  confirmModalConfig,
  handleSearch,
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
  handleFilterChange,
  filterOptions,
  gambarPreview,
} = useBeritaManagement();

const gambarInputRef = ref(null);

// State untuk modal preview gambar
const showGambarPreviewModal = ref(false);

function onGambarChange(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    gambarPreview.value = ev.target.result;
    formData.value.gambar = ev.target.result; // untuk preview
    formData.value.gambarFile = file; // simpan file asli untuk upload
  };
  reader.readAsDataURL(file);
}

function cancelGambar() {
  gambarPreview.value = "";
  formData.gambar = "";
  formData.gambarFile = undefined;
  if (gambarInputRef.value) {
    gambarInputRef.value.value = "";
  }
}

watch(
  () => formData.gambar,
  (val) => {
    gambarPreview.value = val || "";
  },
  { immediate: true }
);
</script>

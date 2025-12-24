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
              placeholder="Cari Penghuni Oma Opa..."
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
          <ActionButton icon="add" title="Add New Penghuni Oma Opa" size="md" variant="filled" @click="handleAdd" />
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
          <ActionButton v-if="isViewMode" icon="edit" title="Edit Data Penghuni" size="md" variant="filled" @click="handleEdit" />
        </template>
      </FormHeader>

      <!-- Form Content -->
      <form @submit.prevent="handleFormSubmit">
        <!-- 1. Data Diri -->
        <div class="mb-8">
          <h3 class="font-bold text-lg mb-4">1. Data Diri</h3>
          <div class="grid grid-cols-2 gap-x-8 gap-y-4">
            <!-- Input Foto -->
            <div class="flex items-center gap-4">
              <label class="w-40 text-sm font-medium text-gray-700">Foto</label>
              <FormField v-model="formData.foto" type="text" placeholder="Link foto" :disabled="formConfig.readonly" help-text="Masukkan link foto (Google Drive, dsb)" class="flex-1" hide-label />
            </div>
            <!-- Preview Foto -->
            <div v-if="formData.foto && formData.foto.startsWith('http')" class="flex items-center gap-4">
              <label class="w-40 text-sm font-medium text-gray-700">Preview</label>
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

            <div class="flex items-center gap-4">
              <label class="w-40 text-sm font-medium text-gray-700">Nama</label>
              <FormField v-model="formData.nama" type="text" placeholder="Nama lengkap" :required="!isViewMode" :disabled="formConfig.readonly" class="flex-1" hide-label />
            </div>
            <div class="flex items-center gap-4">
              <label class="w-40 text-sm font-medium text-gray-700">Tempat Lahir</label>
              <FormField v-model="formData.tmpt_lahir" type="text" placeholder="Tempat Lahir" :required="!isViewMode" :disabled="formConfig.readonly" class="flex-1" hide-label />
            </div>
            <div class="flex items-center gap-4">
              <label class="w-40 text-sm font-medium text-gray-700">Agama</label>
              <FormField v-model="formData.agama_id" type="select" :options="agamaOptions" placeholder="Pilih agama" :required="!isViewMode" :disabled="formConfig.readonly" class="flex-1" hide-label />
            </div>
            <div class="flex items-center gap-4">
              <label class="w-40 text-sm font-medium text-gray-700">Tanggal Lahir</label>
              <FormField v-model="formData.tgl_lahir" type="date" placeholder="Tanggal Lahir" :required="!isViewMode" :disabled="formConfig.readonly" class="flex-1" hide-label />
            </div>
            <div class="flex items-center gap-4">
              <label class="w-40 text-sm font-medium text-gray-700">No KK</label>
              <FormField v-model="formData.no_kk" type="text" placeholder="No KK" :required="!isViewMode" :disabled="formConfig.readonly" class="flex-1" hide-label />
            </div>
            <div class="flex items-center gap-4">
              <label class="w-40 text-sm font-medium text-gray-700">NIK</label>
              <FormField v-model="formData.nik" type="text" placeholder="NIK" :required="!isViewMode" :disabled="formConfig.readonly" class="flex-1" hide-label />
            </div>
            <div class="flex items-center gap-4">
              <label class="w-40 text-sm font-medium text-gray-700">No HP</label>
              <FormField v-model="formData.no_hp" type="text" placeholder="No HP" :disabled="formConfig.readonly" class="flex-1" hide-label />
            </div>
            <div class="flex items-center gap-4">
              <label class="w-40 text-sm font-medium text-gray-700">Alamat</label>
              <FormField v-model="formData.alamat" type="textarea" placeholder="Alamat lengkap" :rows="2" :disabled="formConfig.readonly" class="flex-1" hide-label />
            </div>
            <div class="flex items-center gap-4">
              <label class="w-40 text-sm font-medium text-gray-700">Tanggal Masuk</label>
              <FormField v-model="formData.tgl_masuk" type="date" placeholder="Tanggal Masuk" :disabled="formConfig.readonly" class="flex-1" hide-label />
            </div>
            <div class="flex items-center gap-4">
              <label class="w-40 text-sm font-medium text-gray-700">Tanggal Keluar</label>
              <FormField v-model="formData.tgl_keluar" type="date" placeholder="Tanggal Keluar" :disabled="formConfig.readonly" class="flex-1" hide-label />
            </div>
          </div>
          <div class="mt-4 flex items-start gap-4">
            <label class="w-40 text-sm font-medium text-gray-700 pt-2">Riwayat Hidup</label>
            <FormField v-model="formData.riwayat_hidup" type="textarea" placeholder="Riwayat hidup" :rows="3" :disabled="formConfig.readonly" class="flex-1" hide-label />
          </div>
        </div>

        <!-- 2. Anamnesa -->
        <div class="mb-8">
          <h3 class="font-bold text-lg mb-4">2. Anamnesa</h3>
          <div class="flex flex-col gap-4">
            <div class="flex items-center gap-4">
              <label class="w-80 text-sm font-medium text-gray-700">Aspek kognitif</label>
              <FormField v-model="formData.aspek_kognitif" type="text" placeholder="Aspek kognitif" :disabled="formConfig.readonly" class="flex-1" hide-label />
            </div>
            <div class="flex items-center gap-4">
              <label class="w-80 text-sm font-medium text-gray-700">Aspek afektif / emosi</label>
              <FormField v-model="formData.aspek_afektif" type="text" placeholder="Aspek afektif / emosi" :disabled="formConfig.readonly" class="flex-1" hide-label />
            </div>
            <div class="flex items-center gap-4">
              <label class="w-80 text-sm font-medium text-gray-700">Aspek Spiritual</label>
              <FormField v-model="formData.aspek_spiritual" type="text" placeholder="Aspek spiritual" :disabled="formConfig.readonly" class="flex-1" hide-label />
            </div>
            <div class="flex items-center gap-4">
              <label class="w-80 text-sm font-medium text-gray-700">Aspek sosial</label>
              <FormField v-model="formData.aspek_sosial" type="text" placeholder="Aspek sosial" :disabled="formConfig.readonly" class="flex-1" hide-label />
            </div>
            <div class="flex items-center gap-4 mt-2">
              <label class="w-80 text-sm font-medium text-gray-700">Anggota keluarga yang paling disuka</label>
              <FormField v-model="formData.anggota_keluarga_disuka" type="text" placeholder="Nama anggota keluarga" :disabled="formConfig.readonly" class="flex-1" hide-label />
            </div>
            <div class="flex items-center gap-4">
              <label class="w-80 text-xs text-gray-500">Alasan</label>
              <FormField v-model="formData.alasan_keluarga_disuka" type="text" placeholder="Alasan" :disabled="formConfig.readonly" class="flex-1" hide-label />
            </div>
            <div class="flex items-center gap-4 mt-2">
              <label class="w-80 text-sm font-medium text-gray-700">Anggota keluarga yang paling tidak disuka</label>
              <FormField v-model="formData.anggota_keluarga_tidak_disuka" type="text" placeholder="Nama anggota keluarga" :disabled="formConfig.readonly" class="flex-1" hide-label />
            </div>
            <div class="flex items-center gap-4">
              <label class="w-80 text-xs text-gray-500">Alasan</label>
              <FormField v-model="formData.alasan_keluarga_tidak_disuka" type="text" placeholder="Alasan" :disabled="formConfig.readonly" class="flex-1" hide-label />
            </div>
            <div class="flex items-start gap-4 mt-2">
              <label class="w-80 text-sm font-medium text-gray-700 pt-2">Dinamika Kepribadian</label>
              <FormField v-model="formData.dinamika_kepribadian" type="textarea" placeholder="Dinamika kepribadian" :rows="3" :disabled="formConfig.readonly" class="flex-1" hide-label />
            </div>
          </div>
        </div>

        <!-- 3. Lain-lain -->
        <div class="mb-8">
          <h3 class="font-bold text-lg mb-4">3. Lain-lain</h3>
          <div class="flex items-center gap-4 mb-2">
            <label class="w-56 text-sm font-medium text-gray-700">Aktivitas yang dilakukan di rumah</label>
            <FormField v-model="formData.aktivitas_di_rumah" type="textarea" placeholder="Aktivitas di rumah" :rows="2" :disabled="formConfig.readonly" class="flex-1" hide-label />
          </div>
          <div class="flex items-center gap-4">
            <label class="w-56 text-sm font-medium text-gray-700">Penilaian dari anggota keluarga / penanggung jawab</label>
            <FormField v-model="formData.penilaian_keluarga" type="textarea" placeholder="Penilaian keluarga" :rows="2" :disabled="formConfig.readonly" class="flex-1" hide-label />
          </div>
        </div>

        <!-- 4. Penanggung Jawab -->
        <div class="mb-8">
          <h3 class="font-bold text-lg mb-4">4. Penanggung Jawab</h3>
          <div class="grid grid-cols-2 gap-x-8 gap-y-4">
            <div class="flex items-center gap-4">
              <label class="w-56 text-sm font-medium text-gray-700">Nama Penanggung Jawab</label>
              <FormField v-model="formData.nama_pj" type="text" placeholder="Nama Penanggung Jawab" :disabled="formConfig.readonly" class="flex-1" hide-label />
            </div>
            <div class="flex items-center gap-4">
              <label class="w-56 text-sm font-medium text-gray-700">Umur Penanggung Jawab</label>
              <FormField v-model="formData.umur_pj" type="text" placeholder="Umur Penanggung Jawab" :disabled="formConfig.readonly" class="flex-1" hide-label />
            </div>
            <div class="flex items-center gap-4">
              <label class="w-56 text-sm font-medium text-gray-700">Jenis Kelamin Penanggung Jawab</label>
              <FormField v-model="formData.jenis_kelamin_pj" type="text" placeholder="Jenis Kelamin Penanggung Jawab" :disabled="formConfig.readonly" class="flex-1" hide-label />
            </div>
            <div class="flex items-center gap-4">
              <label class="w-56 text-sm font-medium text-gray-700">Hubungan Keluarga</label>
              <FormField v-model="formData.hub_keluarga_pj" type="text" placeholder="Hubungan Keluarga" :disabled="formConfig.readonly" class="flex-1" hide-label />
            </div>
            <div class="flex items-center gap-4 col-span-2">
              <label class="w-56 text-sm font-medium text-gray-700">Alamat Penanggung Jawab</label>
              <FormField v-model="formData.alamat_pj" type="textarea" placeholder="Alamat Penanggung Jawab" :rows="2" :disabled="formConfig.readonly" class="flex-1" hide-label />
            </div>
            <div class="flex items-center gap-4 col-span-2">
              <label class="w-56 text-sm font-medium text-gray-700">No Telp Penanggung Jawab</label>
              <FormField v-model="formData.no_telp_pj" type="text" placeholder="No Telp Penanggung Jawab" :disabled="formConfig.readonly" class="flex-1" hide-label />
            </div>
          </div>
        </div>

        <!-- 5. Tingkat Ketergantungan -->
        <div class="mb-8">
          <h3 class="font-bold text-lg mb-4">Tingkat ketergantungan secara psikologis</h3>
          <div class="flex items-center gap-4 mb-2">
            <label class="w-80 text-sm font-medium text-gray-700">Tingkat ketergantungan</label>
            <FormField v-model="formData.tingkat_ketergantungan_id" type="select" :options="tingkatKetergantunganOptions" placeholder="Pilih tingkat ketergantungan" :disabled="formConfig.readonly" class="flex-1" hide-label />
          </div>
          <div class="flex items-start gap-4">
            <label class="w-80 text-xs text-gray-500 pt-2">Alasan</label>
            <FormField v-model="formData.alasan_tingkat_ketergantungan" type="textarea" placeholder="Alasan tingkat ketergantungan" :rows="2" :disabled="formConfig.readonly" class="flex-1" hide-label />
          </div>
        </div>

        <!-- 6. Kesimpulan -->
        <div class="mb-8">
          <h3 class="font-bold text-lg mb-4">Kesimpulan</h3>
          <div class="flex items-center gap-4 mb-2">
            <label class="w-80 text-sm font-medium text-gray-700">Kesimpulan</label>
            <FormField v-model="formData.kesimpulan_id" type="select" :options="kesimpulanOptions" placeholder="Pilih kesimpulan" :disabled="formConfig.readonly" class="flex-1" hide-label />
          </div>
          <div class="flex items-start gap-4">
            <label class="w-80 text-xs text-gray-500 pt-2">Alasan</label>
            <FormField v-model="formData.alasan_kesimpulan" type="textarea" placeholder="Alasan kesimpulan" :rows="2" :disabled="formConfig.readonly" class="flex-1" hide-label />
          </div>
        </div>

        <!-- Status -->
        <div class="flex items-center gap-4 mb-8">
          <label class="w-40 text-sm font-medium text-gray-700">Status</label>
          <FormField v-model="formData.status" type="checkbox" checkbox-label="Aktif" :disabled="formConfig.readonly" class="flex-1" hide-label />
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
          <BaseButton type="button" variant="filled" color="blue" @click="handleEdit"> Edit Data Penghuni </BaseButton>
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
        <span class="text-gray-700">Preview Foto Penghuni</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { usePenghuniManagement } from "./usePenghuniManagement.js";
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
import { ref, watch } from "vue";
import { apiConfig, buildApiUrl } from "@/config/api.js";

const showFotoPreviewModal = ref(false);

// Use the composable
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
  agamaOptions,
  tingkatKetergantunganOptions,
  kesimpulanOptions,
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
  showSelectModal,
  selectedRows,
  selectOptions,
  selectColumns,
  handleAddToList,
  handleSelectConfirm,
  handleSelectCancel,
  onPhotoChange,
} = usePenghuniManagement();
</script>

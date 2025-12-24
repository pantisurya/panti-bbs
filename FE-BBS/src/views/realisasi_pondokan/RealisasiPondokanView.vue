<template>
  <div class="relative">
    <!-- List View -->
    <ContentCard v-if="!showForm">
      <!-- Header with Search and Actions -->
      <div class="flex justify-between items-center mb-4">
        <div class="flex items-center gap-4">
          <div class="flex-1 max-w-md relative" style="min-width: 250px;">
            <input v-model="searchTerm" type="text" placeholder="Cari pondokan..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              @input="handleSearch($event.target.value)" />
            <svg v-if="!loading" class="absolute right-3 top-2.5 h-5 w-5 text-gray-400" fill="none"
              stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <svg v-if="loading" class="absolute right-3 top-2.5 h-5 w-5 animate-spin text-blue-500" fill="none"
              viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
              </circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
          </div>
          <StatusFilter v-model="statusFilter" :options="filterOptions" @change="handleFilterChange" />
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-2 ml-4">
          <ActionButton icon="add" title="Add New Pondokan" size="md" variant="filled" @click="handleAdd" />
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
          <ActionButton v-if="isViewMode" icon="edit" title="Edit Pondokan" size="md" variant="filled"
            @click="handleEdit" />
        </template>
      </FormHeader>

      <!-- Form Content -->
      <form @submit.prevent="handleFormSubmit">
        <div class="grid grid-cols-2 gap-x-8">
          <!-- Left Column -->
          <div class="space-y-4">
            <!-- Pondokan Field -->
            <div class="flex items-start gap-4">
              <!-- Label -->
              <label class="w-32 pt-2 text-sm font-medium text-gray-700">
                Pondokan
              </label>

              <!-- Input Wrapper -->
              <div class="flex-1 flex items-center gap-2">
                <div class="relative flex-1" :class="{ 'cursor-pointer': !isViewMode }"
                  @click="!isViewMode && openPondokanSelectModal()">
                  <!-- Field -->

                  <FormField v-model="formData.t_pondokan_label" type="text" placeholder="Pilih pondokan"
                    :readonly="true" :disabled="isViewMode" class="w-full pr-10 rounded-md border border-gray-300 bg-white text-sm shadow-sm 
                 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100" hide-label />

                  <!-- Search Icon -->
                  <button type="button" class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 
                 focus:outline-none" @click.stop="showModalDetail = true" :disabled="isViewMode"
                    aria-label="Pilih Pondokan">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M21 21l-4-4m0 0A7 7 0 104 4a7 7 0 0013 13z" />
                    </svg>
                  </button>
                </div>

                <!-- Clear Button -->
                <button v-if="formData.t_pondokan_id && !isViewMode" type="button" @click="clearPondokanSelection"
                  :disabled="isViewMode" class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md border border-red-300 
               text-red-500 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 
               focus:ring-red-300 transition" aria-label="Clear Pondokan">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Penghuni -->
            <div class="flex items-center gap-4">
              <label class="w-32 text-sm font-medium text-gray-700">Penghuni</label>
              <FormField v-model="formData.m_penghuni_id" type="select" placeholder="Pilih penghuni"
                :options="penghuniOptions" :disabled="true" class="flex-1" hide-label />
            </div>

            <!-- Jumlah Bayar -->
            <div class="flex items-center gap-4">
              <label class="w-32 text-sm font-medium text-gray-700">Jumlah Bayar</label>
              <FormField v-model="formData.jumlah_bayar" type="number" placeholder="Jumlah Bayar" :disabled="true"
                class="flex-1" hide-label />
            </div>

            <!-- Catatan Transaksi -->
            <div class="flex items-center gap-4">
              <label class="w-32 text-sm font-medium text-gray-700">Catatan</label>
              <FormField v-model="formData.catatan_transaksi" type="text" placeholder="Catatan transaksi"
                :disabled="isViewMode" class="flex-1" hide-label />
            </div>
          </div>

          <!-- Right Column -->
          <div class="space-y-4">
            <!-- Tanggal Transaksi -->
            <div class="flex items-center gap-4">
              <label class="w-32 text-sm font-medium text-gray-700">Tanggal Transaksi</label>
              <FormField v-model="formData.tgl_transaksi" type="date" placeholder="Tanggal Transaksi" :disabled="true"
                class="flex-1" hide-label />
            </div>

            <!-- Status dengan Badge Manual -->
            <div class="flex items-center gap-4">
              <label class="w-32 text-sm font-medium text-gray-700">Status</label>
              <div class="flex items-center gap-3">
                <!-- Checkbox -->
                <input type="checkbox" v-model="formData.status" :disabled="true" id="status-checkbox"
                  class="form-checkbox h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500" />

                <!-- Custom Badge -->
                <div class="flex items-center">
                  <span :class="[
                    'inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium',
                    formData.status
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : 'bg-red-100 text-red-800 border border-red-200'
                  ]">
                    <!-- Status Dot -->
                    <span :class="[
                      'w-2 h-2 rounded-full',
                      formData.status ? 'bg-green-500' : 'bg-red-500'
                    ]"></span>
                    {{ formData.status ? 'Active' : 'Inactive' }}
                  </span>
                </div>
              </div>
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
          <BaseButton type="button" variant="filled" color="blue" @click="handleEdit"> Edit Pondokan </BaseButton>
        </div>
      </form>

    </ContentCard>

    <!-- Confirmation Modal -->
    <ConfirmationModal v-model="showConfirmModal" :title="confirmModalConfig.title"
      :message="confirmModalConfig.message" :confirm-text="confirmModalConfig.confirmText"
      @confirm="confirmModalConfig.onConfirm" />
  </div>

  <!-- SelectDataModal with higher z-index -->
  <SelectDataModal v-model="showModalDetail" :title="'Daftar Pondokan'" :size="'xl'" :multiple="false"
    :items="availableModalDetails" :columns="modalDetailColumns" :selected-items="selectedModalDetails"
    :show-search="true" :search-placeholder="'Cari pondokan...'" :on-search="handleModalSearch" :search-debounce="500"
    :show-pagination="true" :server-side="true" :current-page="modalCurrentPage" :page-size="modalPageSize"
    :total-items="modalTotalItems" :total-pages="modalTotalPages" @confirm="handleDeliveryPlanDetailSelect"
    @update:selected="(val) => (selectedModalDetails = Array.isArray(val) ? val : (val ? [val] : []))"
    @search="handleModalSearch" @page-changed="handleModalPageChanged" @page-size-changed="handleModalPageSizeChanged"
    @cancel="() => {
      showModalDetail = false;
      selectedModalDetails = [];
    }" style="z-index: 10001 !important;" />
</template>

<script setup>
import { useRealisasiPondokanManagement } from "./useRealisasiPondokanManagement.js";
import ContentCard from "@/components/ContentCard.vue";
import DataTable from "@/components/DataTable.vue";
import ActionButton from "@/components/ActionButton.vue";
import FormHeader from "@/components/FormHeader.vue";
import FormField from "@/components/FormField.vue";
import BaseButton from "@/components/BaseButton.vue";
import TableSearch from "@/components/TableSearch.vue";
import StatusFilter from "@/components/StatusFilter.vue";
import ConfirmationModal from "@/components/ConfirmationModal.vue";
import BaseModal from "@/components/BaseModal.vue";
import { computed, ref } from "vue";
import Badge from "@/components/Badge.vue";
import SelectDataModal from "../../components/SelectDataModal.vue";

// Add selectedPondokan ref for modal selection
const selectedPondokan = ref(null);

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
  penghuniOptions,
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
  statusOptions,
  showPondokanSelectModal,
  pondokanOptions,
  pondokanLoading,
  pondokanSearch,
  openPondokanSelectModal,
  handlePondokanSelected,
  clearPondokanSelection,
  showModalDetail,
  availableModalDetails,
  modalDetailColumns,
  selectedModalDetails,
  modalCurrentPage,
  modalPageSize,
  modalTotalItems,
  modalTotalPages,
  handleModalSearch,
  handleModalPageChanged,
  handleModalPageSizeChanged,
  handleDeliveryPlanDetailSelect,
} = useRealisasiPondokanManagement();
</script>
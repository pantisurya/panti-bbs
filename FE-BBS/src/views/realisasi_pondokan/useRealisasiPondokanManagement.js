import { ref, computed, onMounted, h, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useSnackbar } from "@/composables/useSnackbar.js";
import Badge from "@/components/Badge.vue";
import { apiConfig, buildApiUrl } from "@/config/api.js";
import { httpService } from "@/services/httpService.js";
import { pl } from "element-plus/es/locales.mjs";

/**
 * Composable for managing user default operations
 * Handles CRUD operations, filtering, pagination, and form management
 */
export function useRealisasiPondokanManagement() {
  // Debouncing for search
  let searchTimeout = null;
  const router = useRouter();
  const route = useRoute();
  const { showSuccess, showError } = useSnackbar();

  // === API ENDPOINTS [DROPDOWN FETCHING] ===
  // Fetch penghuni options for dropdown
  // Search and filtering
  const searchTerm = ref("");
  const statusFilter = ref("all");

  // Form management
  const selectedItem = ref(null);
  const showForm = ref(false);
  const formLoading = ref(false);

  // Pagination
  const pagination = ref({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1,
  });

  // Sorting state for server-side ordering
  const sortState = ref({ sortBy: null, sortDesc: false });

  // Data management
  const dataTables = ref([]);
  const penghuniDropdown = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Confirmation modal
  const confirmModal = ref({
    show: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    confirmVariant: "filled",
    onConfirm: () => {},
  });

  // Form modes
  const formMode = ref("create"); // 'create', 'edit', 'view', 'copy'

  // Form data with default values - SAMA seperti deposit
  const initialFormData = {
    t_pondokan_id: "",
    t_pondokan_label: "",
    m_penghuni_id: "",
    status: true, // Default to active
    tgl_transaksi: "",
    catatan_transaksi: "",
    jumlah_bayar: 0,
  };
  // Pondokan selection modal state
  const showPondokanSelectModal = ref(false);
  const pondokanOptions = ref([]);
  const pondokanLoading = ref(false);
  const pondokanSearch = ref("");

  // Tambahkan di <script setup>
  const showModalDetail = ref(false);
  const availableModalDetails = ref([]);
  // const modalDetailColumns = ref([]);
  const selectedModalDetails = ref([]);
  const modalCurrentPage = ref(1);
  const modalPageSize = ref(10);
  const modalTotalItems = ref(0);
  const modalTotalPages = ref(1);

  const modalDetailColumns = ref([
    { text: "Catatan", value: "catatan_transaksi", sortable: true },
    { text: "Penghuni", value: "penghuni_nama", sortable: false },
    { text: "Jumlah Bayar", value: "jumlah_bayar", sortable: true },
    { text: "Tanggal", value: "tgl_transaksi", sortable: true },
    {
      text: "Status",
      value: "status",
      sortable: true,
      render: (value) => h(Badge, { color: value ? "green" : "red" }, () => (value ? "Active" : "Inactive")),
    },
  ]);

  // Open pondokan select modal
  async function openPondokanSelectModal() {
    showModalDetail.value = true;
    await fetchModalPondokan("", modalCurrentPage.value, modalPageSize.value);
  }

  // Handle pondokan selection
  function handlePondokanSelected(selected) {
    console.log("Selected Pondokan:", selected);
    if (!selected) return;
    // Autofill fields from selected pondokan
    formData.value.t_pondokan_id = selected.id;
    formData.value.t_pondokan_label = selected.kode || selected.catatan_transaksi || selected.m_penghuni?.nama || selected.id;
    formData.value.m_penghuni_id = selected.m_penghuni_id;
    formData.value.jumlah_bayar = selected.jumlah_bayar;
    formData.value.tgl_transaksi = selected.tgl_transaksi ? String(selected.tgl_transaksi).slice(0, 10) : "";
    formData.value.status = selected.status === true;
    showPondokanSelectModal.value = false;
  }
  // Reset autofilled fields if needed
  function clearPondokanSelection() {
    formData.value.t_pondokan_id = "";
    formData.value.t_pondokan_label = "";
    formData.value.m_penghuni_id = "";
    formData.value.jumlah_bayar = 0;
    formData.value.tgl_transaksi = "";
    formData.value.status = true;
  }
  const formData = ref({ ...initialFormData });

  // === CONFIGURATION ===
  // Filter options for status filtering
  const FILTER_OPTIONS = [
    {
      value: "all",
      label: "All",
      activeClass: "bg-white text-gray-900",
      inactiveClass: "text-gray-600 hover:text-gray-900",
    },
    {
      value: true,
      label: "Active",
      activeClass: "bg-green-500 text-white",
      inactiveClass: "text-gray-600 hover:text-green-600",
    },
    {
      value: false,
      label: "Inactive",
      activeClass: "bg-red-500 text-white",
      inactiveClass: "text-gray-600 hover:text-red-600",
    },
  ];

  // Table column configuration
  const TABLE_COLUMNS = [
    { text: "Penghuni", value: "penghuni_nama", sortable: true },
    { text: "Tanggal Transaksi", value: "tgl_transaksi", sortable: true },
    { text: "Status", value: "status", sortable: true, render: (value) => h(Badge, { color: value ? "green" : "red" }, () => (value ? "Active" : "Inactive")) },
    { text: "Desc", value: "catatan_transaksi", sortable: true },
  ];

  // === COMPUTED PROPERTIES ===
  // Form mode checkers
  const isEditMode = computed(() => formMode.value === "edit");
  const isViewMode = computed(() => formMode.value === "view");
  const isCopyMode = computed(() => formMode.value === "copy");
  const isCreateMode = computed(() => formMode.value === "create");

  // Readonly state for form fields
  const isFormReadonly = computed(() => formConfig.value.readonly);

  // Form configuration based on mode
  const formConfig = computed(() => {
    const configs = {
      create: {
        title: "Add New Realisasi Pondokan",
        subtitle: "Create a new realisasi pondokan transaction",
        submitText: "Create Realisasi Pondokan",
        readonly: false,
      },
      edit: {
        title: "Edit Realisasi Pondokan",
        subtitle: "Update realisasi pondokan information",
        submitText: "Update Realisasi Pondokan",
        readonly: false,
      },
      view: {
        title: "Realisasi Pondokan Details",
        subtitle: "View realisasi pondokan information",
        submitText: null,
        readonly: true,
      },
      copy: {
        title: "Copy Realisasi Pondokan",
        subtitle: "Create a copy of realisasi pondokan",
        submitText: "Create Copy",
        readonly: false,
      },
    };
    return configs[formMode.value] || configs.create;
  });

  // === UTILITY METHODS ===
  const resetForm = () => {
    formData.value = { ...initialFormData };
    selectedItem.value = null;
    formMode.value = "create";
    // Tidak perlu set status_id otomatis
  };

  /**
   * Show confirmation modal with configuration
   */
  const showConfirmation = (config) => {
    confirmModal.value = { ...confirmModal.value, ...config, show: true };
  };
  function hideConfirmation() {
    confirmModal.value.show = false;
  }

  // === API ENDPOINTS [DROPDOWN FETCHING] ===
  // Fetch penghuni options for dropdown
  async function fetchPenghuniDropdown() {
    try {
      const response = await httpService.get(apiConfig.endpoints.penghuni.list);
      if (response.status !== "success") throw new Error(response.message || "API error");
      // Map to dropdown format
      const options = (response.data || []).map((item) => ({ value: item.id, label: item.nama }));
      penghuniDropdown.value = options;
    } catch (err) {
      showError("Gagal mengambil data penghuni");
      penghuniDropdown.value = [];
      console.error("Fetch penghuni dropdown error:", err);
    }
  }

  // === Static status options: Active/Non Active ===
  const statusOptions = ref([
    { value: true, label: "Active" },
    { value: false, label: "Inactive" },
  ]);

  // === INITIALIZATION ===
  onMounted(() => {
    fetchPenghuniDropdown();
    detectActionFromURL();
  });

  // Add a new empty detail row - removed for pondokan
  const addDetailListRow = () => {
    // Not needed for pondokan
  };

  // Remove a detail row by index - removed for pondokan
  const removeDetailListRow = (idx) => {
    // Not needed for pondokan
  };

  // === API METHODS ===
  /**
   * Fetch
   */
  const fetchDataTables = async (page = 1, paginate = 10) => {
    if (loading.value) return;
    loading.value = true;
    error.value = null;

    try {
      let filterStatus = statusFilter.value;
      let filterParam = undefined;
      if (filterStatus !== "all") {
        if (filterStatus === true || filterStatus === 1 || filterStatus === "active") {
          filterParam = 1;
        } else {
          filterParam = 0;
        }
      }
      const params = {
        ...(searchTerm.value.trim() && { search: searchTerm.value.trim() }),
        ...(filterStatus !== "all" && { filter_column_status: filterParam }),
        searchfield: "catatan_transaksi",
        page,
        limit: paginate,
        include: "m_penghuni",
      };

      // Append server-side raw ordering if set
      if (sortState.value.sortBy) {
        const direction = sortState.value.sortDesc ? "DESC" : "ASC";
        const allowed = TABLE_COLUMNS.map((c) => c.value).filter(Boolean);
        if (allowed.includes(sortState.value.sortBy)) {
          params.order_by_raw = `${sortState.value.sortBy} ${direction}`;
        }
      }

      const response = await httpService.get(apiConfig.endpoints.realisasi_pondokan.list, { params });
      if (response.status !== "success") throw new Error(response.message || "API error");
      dataTables.value = (response.data || []).map((item) => ({
        ...item,
        penghuni_nama: item.m_penghuni?.nama || "-",
        tgl_transaksi: item.tgl_transaksi || "-",
        status: item.status,
        _status: item.status, // Keep original boolean for internal use
      }));

      pagination.value = {
        currentPage: response.pagination?.page || 1,
        pageSize: response.pagination?.limit || paginate,
        totalItems: response.pagination?.total || 0,
        totalPages: response.pagination?.totalPages || 1,
      };
    } catch (err) {
      error.value = err.message || "Failed to fetch user default items";
      showError("Failed to fetch user default items");
      console.error("Fetch error:", err);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Fetch user default item by id from API
   */
  const fetchDataById = async (id) => {
    try {
      const response = await httpService.get(`${apiConfig.endpoints.realisasi_pondokan.show(id)}`, { params: { include: "t_pondokan,m_penghuni" } });
      const item = response.data;
      console.log("API Response:", item); // Debug log
      // Update form data with detailed pondokan information
      formData.value = {
        ...item,
        t_pondokan_id: item.t_pondokan_id,
        // Use pondokan details for the label with proper formatting
        t_pondokan_label: item.t_pondokan ? `${item.t_pondokan.catatan_transaksi || ""} - ${item.m_penghuni?.nama || ""} - Rp.${item.jumlah_bayar || 0}` : "No Pondokan Selected",
        m_penghuni_id: item.m_penghuni_id,
        status: item.status === true,
        tgl_transaksi: item.tgl_transaksi ? String(item.tgl_transaksi).slice(0, 10) : "",
        jumlah_bayar: Number(item.jumlah_bayar) || 0,
        catatan_transaksi: item.catatan_transaksi || "",
      };

      if (response.status !== "success") throw new Error(response.message || "API error");
      return formData.value;
    } catch (err) {
      showError("Gagal mengambil data realisasi pondokan");
      console.error("Fetch by id error:", err);
      return null;
    }
  };

  /**
   * Save pondokan (create or update)
   */
  const saveData = async () => {
    if (formLoading.value) return; // Prevent multiple submissions

    // Validasi field wajib
    const requiredFields = [
      { key: "t_pondokan_id", label: "Pondokan" },
      { key: "m_penghuni_id", label: "Penghuni" },
      { key: "tgl_transaksi", label: "Tanggal Transaksi" },
      { key: "jumlah_bayar", label: "Jumlah Bayar" },
    ];
    for (const field of requiredFields) {
      const value = formData.value[field.key];
      if (value === undefined || value === null || value === "" || (field.key === "jumlah_bayar" && Number(value) <= 0)) {
        showError(`Field ${field.label} wajib diisi dan tidak boleh kosong.`);
        return;
      }
    }

    formLoading.value = true;
    try {
      // Build request body for pondokan with details
      // Convert status string to boolean for backend
      let status = formData.value.status === true || formData.value.status === "true";

      const body = {
        t_pondokan_id: formData.value.t_pondokan_id || undefined,
        m_penghuni_id: formData.value.m_penghuni_id || undefined,
        status: status,
        tgl_transaksi: formData.value.tgl_transaksi || undefined,
        catatan_transaksi: formData.value.catatan_transaksi || undefined,
        jumlah_bayar: formData.value.jumlah_bayar || 0,
      };
      // Remove undefined fields
      Object.keys(body).forEach((key) => body[key] === undefined && delete body[key]);
      // Determine method and endpoint
      let method = "POST";
      let url = buildApiUrl(apiConfig.endpoints.realisasi_pondokan.create);
      if (isEditMode.value && selectedItem.value) {
        method = "PUT";
        url = buildApiUrl(apiConfig.endpoints.realisasi_pondokan.update(selectedItem.value.id));
      }
      let result;
      if (method === "PUT") {
        result = await httpService.put(apiConfig.endpoints.realisasi_pondokan.update(selectedItem.value.id), body);
      } else {
        result = await httpService.post(apiConfig.endpoints.realisasi_pondokan.create, body);
      }
      if (result.status !== "success") throw new Error(result.message || "API error");
      showSuccess(isEditMode.value ? "Realisasi Pondokan updated successfully" : `Realisasi Pondokan ${isCopyMode.value ? "copied" : "created"} successfully`);
      closeForm();
      clearURL();
      // Refresh list after save
      fetchDataTables(pagination.value.currentPage, pagination.value.pageSize);
    } catch (err) {
      const action = isEditMode.value ? "update" : "save";
      showError(`Failed to ${action} realisasi pondokan`);
      console.error("Save error:", err);
    } finally {
      formLoading.value = false;
    }
  };

  /**
   * Delete pondokan item
   */
  const deletePondokan = async (item) => {
    try {
      const result = await httpService.delete(apiConfig.endpoints.realisasi_pondokan.delete(item.id));
      if (result.status !== "success") throw new Error(result.message || "API error");
      showSuccess("Realisasi Pondokan deleted successfully");
      selectedItem.value = null;

      // Refresh the list after deletion
      fetchDataTables(pagination.value.currentPage, pagination.value.pageSize);
    } catch (err) {
      showError("Failed to delete realisasi pondokan");
      console.error("Delete error:", err);
    }
  };

  // === FORM MANAGEMENT ===
  // Balance logic removed

  /**
   * Open form with specified mode and data
   */
  function openForm(mode, item = null) {
    formMode.value = mode;
    if (mode === "create") {
      resetForm();
    } else if (item) {
      selectedItem.value = item;
      // Ensure tgl_transaksi is always a string (for input type="date")
      // and status is always boolean
      const { balance, ...rest } = item;
      const itemWithFixedTypes = {
        ...rest,
        tgl_transaksi: rest.tgl_transaksi ? String(rest.tgl_transaksi).slice(0, 10) : "",
        status: rest.status === true,
      };
      formData.value = mode === "copy" ? { ...itemWithFixedTypes, id: undefined } : { ...itemWithFixedTypes };
    }
    showForm.value = true;
  }

  /**
   * Close form and reset state
   */
  const closeForm = () => {
    showForm.value = false;
    resetForm();
  };

  // === URL MANAGEMENT ===
  const updateURL = (action, itemId = null) => {
    const query = { action };
    if (itemId) query.id = itemId;
    router.replace({ path: route.path, query }).catch(() => {});
  };

  const clearURL = () => {
    router.replace({ path: route.path, query: {} }).catch(() => {});
  };

  // === CRUD HANDLERS ===
  /**
   * Handle add new item
   */
  const handleAdd = () => {
    updateURL("add");
    openForm("create");
  };

  /**
   * Handle edit selected item
   */
  const handleEdit = () => {
    // Always use the id from the URL or selectedItem
    const id = selectedItem.value?.id || route.query.id;
    if (!id) return;
    updateURL("edit", id);
    fetchDataById(id).then((item) => {
      if (item) {
        openForm("edit", {
          ...item,
          status: item.status === true,
        });
        showForm.value = true; // Ensure form is visible after openForm
      } else {
        showError("Data tidak ditemukan");
        clearURL();
      }
    });
  };

  /**
   * Handle view selected item
   */
  const handleView = () => {
    if (!selectedItem.value) return;
    updateURL("view", selectedItem.value.id);
  };

  /**
   * Handle copy selected item
   */
  const handleCopy = () => {
    if (!selectedItem.value) return;
    updateURL("copy", selectedItem.value.id);
  };

  /**
   * Handle delete selected item
   */
  const handleDelete = () => {
    if (!selectedItem.value) return;
    showConfirmation({
      title: "Delete Realisasi Pondokan",
      message: `Are you sure you want to delete this realisasi pondokan record? This action cannot be undone.`,
      confirmText: "Delete",
      confirmVariant: "filled",
      onConfirm: () => {
        deletePondokan(selectedItem.value);
        hideConfirmation();
      },
    });
  };

  /**
   * Handle form cancellation
   */
  const handleCancel = () => {
    closeForm();
    clearURL();
  };

  /**
   * Handle search input change with debouncing
   */
  const handleSearch = (value) => {
    searchTerm.value = value;
    // Clear previous timeout
    if (searchTimeout) clearTimeout(searchTimeout);
    // Set new timeout for debouncing (500ms delay)
    searchTimeout = setTimeout(() => {
      fetchDataTables(1, pagination.value.pageSize);
    }, 500);
  };

  /**
   * Handle status filter change
   */
  const handleFilterChange = (value, param) => {
    if (param !== undefined && param !== null) {
      statusFilter.value = param;
    } else {
      statusFilter.value = value;
    }
    fetchDataTables(pagination.value.currentPage, pagination.value.pageSize);
  };

  /**
   * Handle pagination change
   */
  const handlePageChanged = (page) => {
    pagination.value.currentPage = page;
    fetchDataTables(page, pagination.value.pageSize);
  };

  /**
   * Handle page paginate change
   */
  const handlePageSizeChanged = (paginate) => {
    pagination.value.pageSize = paginate;
    pagination.value.currentPage = 1; // Reset to first page
    fetchDataTables(1, paginate);
  };

  /**
   * Handle sort change
   */
  const handleSortChanged = (sortBy, sortDesc) => {
    // Support payloads from DataTable: either { column, direction } or (column, direction)
    let sBy = null;
    let sDesc = false;

    if (sortBy && typeof sortBy === "object" && sortBy.column) {
      sBy = sortBy.column;
      sDesc = (sortBy.direction || "").toLowerCase() === "desc";
    } else if (typeof sortBy === "string") {
      sBy = sortBy;
      if (typeof sortDesc === "string") {
        sDesc = sortDesc.toLowerCase() === "desc";
      } else if (typeof sortDesc === "boolean") {
        sDesc = sortDesc;
      }
    }

    if (!sBy) {
      sortState.value = { sortBy: null, sortDesc: false };
    } else {
      sortState.value = { sortBy: sBy, sortDesc: sDesc };
    }

    pagination.value.currentPage = 1;
    fetchDataTables(1, pagination.value.pageSize);
  };

  /**
   * Handle form submission
   */
  const handleFormSubmit = () => {
    if (isViewMode.value) return;
    saveData();
  };

  // Remove select modal logic since it's not needed for pondokan
  const showSelectModal = ref(false);
  const selectedRows = ref([]);
  const selectOptions = ref([]);
  const selectColumns = [];

  function handleAddToList() {
    // Not needed for pondokan
  }

  function handleSelectConfirm(rows) {
    // Not needed for pondokan
  }

  function handleSelectCancel() {
    // Not needed for pondokan
  }

  // === LIFECYCLE ===
  onMounted(() => {
    detectActionFromURL();
  });

  // Watch route.query agar form terbuka sesuai URL
  const detectActionFromURL = async () => {
    const action = route.query.action;
    const itemId = route.query.id;
    await fetchModalPondokan();
    if (!action) {
      showForm.value = false;
      resetForm();
      // Hanya fetch list datatable default saat landing
      fetchDataTables();
      return;
    }
    if (action === "add") {
      openForm("create");
    } else if (["edit", "view", "copy"].includes(action) && itemId) {
      try {
        // Selalu fetch by id dari backend
        const item = await fetchDataById(itemId);
        if (item) {
          // Keep status as boolean
          const formattedItem = {
            ...item,
            status: item.status === true,
          };
          openForm(action, formattedItem);
        } else {
          throw new Error("Data tidak ditemukan");
        }
      } catch (err) {
        showError(err.message || "Data tidak ditemukan");
        clearURL();
      }
    }
  };

  const handleRowClick = (item) => {
    selectedItem.value = item;
    console.log("Selected item:", item);
  };

  watch(() => route.query, detectActionFromURL);

  const fetchModalPondokan = async (searchQuery = "", page = 1, paginate = 10) => {
    try {
      // Fetch semua pondokan
      const allPondokanResponse = await httpService.get("/dynamic/t_pondokan", {
        params: { limit: 1000, include: "m_penghuni" },
      });
      if (allPondokanResponse.status !== "success") throw new Error(allPondokanResponse.message || "API error");

      // Fetch semua realisasi_pondokan untuk cek yang sudah ada
      const realisasiResponse = await httpService.get("/dynamic/t_realisasi_pondokan", {
        params: { limit: 1000 },
      });
      if (realisasiResponse.status !== "success") throw new Error(realisasiResponse.message || "API error");

      // Dapatkan set t_pondokan_id yang sudah ada di realisasi
      const existingPondokanIds = new Set((realisasiResponse.data || []).map((item) => item.t_pondokan_id));

      // Filter pondokan yang belum ada di realisasi dan hanya yang status active
      let filteredPondokan = (allPondokanResponse.data || []).filter((pondokan) => !existingPondokanIds.has(pondokan.id) && (pondokan.status === true || pondokan.status === 1));

      // Apply search filter if provided
      if (searchQuery && searchQuery.trim()) {
        const searchLower = searchQuery.toLowerCase();
        filteredPondokan = filteredPondokan.filter(
          (item) => (item.catatan_transaksi || "").toLowerCase().includes(searchLower) || (item.m_penghuni?.nama || "").toLowerCase().includes(searchLower) || (item.kode || "").toLowerCase().includes(searchLower)
        );
      }

      // Map to modal format
      const allFiltered = filteredPondokan.map((item) => ({
        id: item.id,
        kode: item.kode || null,
        m_penghuni_id: item.m_penghuni_id || item.m_penghuni?.id || null,
        catatan_transaksi: item.catatan_transaksi || "-",
        catatan: item.catatan_transaksi || "-",
        penghuni_nama: item.m_penghuni?.nama || "-",
        jumlah_bayar: item.jumlah_bayar || 0,
        tgl_transaksi: item.tgl_transaksi || "-",
        status: item.status === true,
        _raw: item,
      }));

      // Apply pagination
      const start = (page - 1) * paginate;
      const end = start + paginate;
      availableModalDetails.value = allFiltered.slice(start, end);

      // Update pagination info
      modalTotalItems.value = allFiltered.length;
      modalTotalPages.value = Math.ceil(allFiltered.length / paginate);
      modalCurrentPage.value = page;
    } catch (err) {
      console.error("Error fetching modal pondokan data:", err);
      showError("Gagal mengambil data pondokan");
      availableModalDetails.value = [];
      modalTotalPages.value = 1;
      modalCurrentPage.value = 1;
    }
  };

  // Handlers used by SelectDataModal in the view
  function handleModalSearch(search) {
    // Keep current search in a ref if needed
    // use searchQuery to fetch modal data
    modalCurrentPage.value = 1;
    fetchModalPondokan(search || "", 1, modalPageSize.value);
  }

  function handleModalPageChanged(page) {
    modalCurrentPage.value = page;
    fetchModalPondokan("", page, modalPageSize.value);
  }

  function handleModalPageSizeChanged(size) {
    modalPageSize.value = size;
    modalCurrentPage.value = 1;
    fetchModalPondokan("", 1, size);
  }

  // Fetch modal data whenever the select modal is opened
  watch(showModalDetail, (val) => {
    if (val) {
      fetchModalPondokan("", modalCurrentPage.value, modalPageSize.value);
    } else {
      // clear selection when modal closed
      selectedModalDetails.value = [];
    }
  });

  // === Modal SelectDataModal: autofill ke form ===
  function handleDeliveryPlanDetailSelect(selected) {
    // Selected can be an array or a single item
    const item = Array.isArray(selected) ? selected[0] : selected;
    if (!item) return;
    // If item contains _raw, prefer raw fields for correctness
    const source = item._raw || item;
    formData.value.t_pondokan_id = item.id || source.id || "";
    // Use detailed format for the label with proper information
    formData.value.t_pondokan_label = `${source.catatan_transaksi || "No Description"} - ${source.m_penghuni?.nama || "No Name"} - Rp.${source.jumlah_bayar || 0}`;
    formData.value.m_penghuni_id = item.m_penghuni_id || source.m_penghuni_id || source.m_penghuni?.id || "";
    formData.value.jumlah_bayar = Number(item.jumlah_bayar || source.jumlah_bayar) || 0;
    formData.value.tgl_transaksi = item.tgl_transaksi ? String(item.tgl_transaksi).slice(0, 10) : source.tgl_transaksi ? String(source.tgl_transaksi).slice(0, 10) : "";
    formData.value.status = item.status === true || source.status === true;
    formData.value.catatan_transaksi = item.catatan_transaksi || source.catatan_transaksi || "";
    showModalDetail.value = false;
    selectedModalDetails.value = [];
  }

  // Tidak perlu auto-set status_id dari balance, user pilih manual Active/Non Active

  // === RETURN EXPOSED API ===
  return {
    // Pondokan select modal
    showPondokanSelectModal,
    pondokanOptions,
    pondokanLoading,
    pondokanSearch,
    openPondokanSelectModal,
    handlePondokanSelected,
    clearPondokanSelection,
    // === Reactive State ===
    searchTerm,
    statusFilter,
    selectedItem,
    showForm,
    formLoading,
    formData,
    userDefaultItems: dataTables,
    loading,
    error,

    // === User Default Detail List ===
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

    // === Computed Properties ===
    dataTables,
    formConfig,
    isEditMode,
    isViewMode,
    isCopyMode,
    isCreateMode,

    // === Configuration ===
    filterOptions: FILTER_OPTIONS,
    columns: TABLE_COLUMNS,
    penghuniOptions: penghuniDropdown,
    statusOptions,

    // === Pagination ===
    currentPage: computed(() => pagination.value.currentPage),
    pageSize: computed(() => pagination.value.pageSize),
    totalItems: computed(() => pagination.value.totalItems),
    totalPages: computed(() => pagination.value.totalPages),

    // === Confirmation Modal ===
    showConfirmModal: computed({
      get: () => confirmModal.value.show,
      set: (val) => {
        confirmModal.value.show = val;
      },
    }),
    confirmModalConfig: computed(() => confirmModal.value),

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

    // === Deprecated (for backward compatibility) ===
    // These can be removed once components are updated
    getFormTitle: () => formConfig.value.title,
    getFormSubtitle: () => formConfig.value.subtitle,
    getSubmitButtonText: () => formConfig.value.submitText,

    // Modal Detail
    showModalDetail,
    availableModalDetails,
    modalDetailColumns,
    selectedModalDetails,
    modalCurrentPage,
    modalPageSize,
    modalTotalItems,
    modalTotalPages,
    // Modal handlers
    handleModalSearch,
    handleModalPageChanged,
    handleModalPageSizeChanged,
    handleDeliveryPlanDetailSelect,
  };
}

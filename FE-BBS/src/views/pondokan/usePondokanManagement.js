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
export function usePondokanManagement() {
  // Debouncing for search
  let searchTimeout = null;
  const router = useRouter();
  const route = useRoute();
  const { showSuccess, showError } = useSnackbar();

  // === REACTIVE STATE ===
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
    m_penghuni_id: "",
    status: true, // Default to active
    tgl_transaksi: "",
    catatan_transaksi: "",
    jumlah_bayar: 0,
  };
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
    { text: "Penghuni", value: "penghuni_nama", sortable: false },
    { text: "Tanggal Transaksi", value: "tgl_transaksi", sortable: true },
    { text: "Status", value: "status", sortable: true, render: (value) => h(Badge, { color: value ? "green" : "red" }, () => (value ? "Active" : "Inactive")) },
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
        title: "Add New Pondokan",
        subtitle: "Create a new pondokan transaction",
        submitText: "Create Pondokan",
        readonly: false,
      },
      edit: {
        title: "Edit Pondokan",
        subtitle: "Update pondokan information",
        submitText: "Update Pondokan",
        readonly: false,
      },
      view: {
        title: "Pondokan Details",
        subtitle: "View pondokan information",
        submitText: null,
        readonly: true,
      },
      copy: {
        title: "Copy Pondokan",
        subtitle: "Create a copy of pondokan",
        submitText: "Create Copy",
        readonly: false,
      },
    };
    return configs[formMode.value] || configs.create;
  });

  // === UTILITY METHODS ===
  /**
   * Reset form data to initial values
   */
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

  /**
   * Hide confirmation modal
   */
  const hideConfirmation = () => {
    confirmModal.value.show = false;
  };

  // === API ENDPOINTS [DROPDOWN FETCHING] ===
  // Fetch penghuni options for dropdown
  async function fetchPenghuniDropdown() {
    try {
      const response = await httpService.get(apiConfig.endpoints.penghuni.list);
      if (response.status !== "success") throw new Error(response.message || "API error");
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

      // Append server-side raw ordering if set and allowed
      if (sortState.value.sortBy) {
        const direction = sortState.value.sortDesc ? "DESC" : "ASC";
        const allowed = TABLE_COLUMNS.map((c) => c.value).filter(Boolean);
        if (allowed.includes(sortState.value.sortBy)) {
          params.order_by_raw = `${sortState.value.sortBy} ${direction}`;
        }
      }

      const response = await httpService.get(`${apiConfig.endpoints.pondokan.list}?${new URLSearchParams(params)}`);
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
      const response = await httpService.get(`${apiConfig.endpoints.pondokan.show(id)}`);
      if (response.status !== "success") throw new Error(response.message || "API error");
      return response.data;
    } catch (err) {
      showError("Gagal mengambil data pondokan");
      console.error("Fetch by id error:", err);
      return null;
    }
  };

  /**
   * Save pondokan (create or update)
   */
  const saveData = async () => {
    if (formLoading.value) return; // Prevent multiple submissions
    formLoading.value = true;
    try {
      // Build request body for pondokan with details
      // Convert status string to boolean for backend
      let status = formData.value.status === true || formData.value.status === "true";

      const body = {
        m_penghuni_id: formData.value.m_penghuni_id || undefined,
        status: status,
        tgl_transaksi: formData.value.tgl_transaksi || undefined,
        catatan_transaksi: formData.value.catatan_transaksi || undefined,
        jumlah_bayar: formData.value.jumlah_bayar || 0,
      };
      // Remove undefined fields
      Object.keys(body).forEach((key) => body[key] === undefined && delete body[key]);
      // Determine method and endpoint
      let endpoint = apiConfig.endpoints.pondokan.create;
      if (isEditMode.value && selectedItem.value) {
        endpoint = apiConfig.endpoints.pondokan.update(selectedItem.value.id);
      }
      let response;
      if (isEditMode.value && selectedItem.value) {
        response = await httpService.put(endpoint, body);
      } else {
        response = await httpService.post(endpoint, body);
      }
      if (response.status !== "success") throw new Error(response.message || "API error");
      showSuccess(isEditMode.value ? "Pondokan updated successfully" : `Pondokan ${isCopyMode.value ? "copied" : "created"} successfully`);
      closeForm();
      clearURL();
      // Refresh list after save
      fetchDataTables(pagination.value.currentPage, pagination.value.pageSize);
    } catch (err) {
      const action = isEditMode.value ? "update" : "save";
      showError(`Failed to ${action} pondokan`);
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
      const response = await httpService.delete(apiConfig.endpoints.pondokan.delete(item.id));
      if (response.status !== "success") throw new Error(response.message || "API error");
      showSuccess("Pondokan deleted successfully");
      selectedItem.value = null;

      // Refresh the list after deletion
      fetchDataTables(pagination.value.currentPage, pagination.value.pageSize);
    } catch (err) {
      showError("Failed to delete pondokan");
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
      // Ensure fields are properly formatted
      const { balance, ...rest } = item;
      const itemWithFixedTypes = {
        ...rest,
        m_penghuni_id: rest.m_penghuni_id || "",
        tgl_transaksi: rest.tgl_transaksi ? String(rest.tgl_transaksi).slice(0, 10) : "",
        status: rest.status === true || rest.status === "true" || rest.status === 1,
        catatan_transaksi: rest.catatan_transaksi || "",
        jumlah_bayar: rest.jumlah_bayar || 0,
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
    if (!selectedItem.value) return;
    updateURL("edit", selectedItem.value.id);
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
      title: "Delete Pondokan",
      message: `Are you sure you want to delete this pondokan record? This action cannot be undone.`,
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
  const handleSortChanged = (a, b) => {
    // Support payloads from DataTable: either { column, direction } or (column, direction|boolean)
    let sBy = null;
    let sDesc = false;

    if (a && typeof a === "object" && a.column) {
      sBy = a.column;
      sDesc = (a.direction || "").toLowerCase() === "desc";
    } else if (typeof a === "string") {
      sBy = a;
      if (typeof b === "string") {
        sDesc = b.toLowerCase() === "desc";
      } else if (typeof b === "boolean") {
        sDesc = b;
      }
    }

    if (!sBy) {
      sortState.value = { sortBy: null, sortDesc: false };
    } else {
      sortState.value = { sortBy: sBy, sortDesc: sDesc };
    }

    // Fetch first page with sorting applied
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

  // Tidak perlu auto-set status_id dari balance, user pilih manual Active/Non Active

  // === RETURN EXPOSED API ===
  return {
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
  };
}

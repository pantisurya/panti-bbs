import { ref, computed, onMounted, h, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useSnackbar } from "@/composables/useSnackbar.js";
import Badge from "@/components/Badge.vue";
import { apiConfig } from "@/config/api.js";
import { httpService } from "@/services/httpService.js";

/**
 * Composable for managing user default operations
 * Handles CRUD operations, filtering, pagination, and form management
 */
export function useUserDefaultManagement() {
  const router = useRouter();
  const route = useRoute();
  const { showSuccess, showError } = useSnackbar();

  // === REACTIVE STATE ===
  // Search and filtering
  const searchTerm = ref("");
  const statusFilter = ref("all");

  // Debouncing for search
  let searchTimeout = null;

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
  const userTypeDropdown = ref([]);
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

  // Form data with default values (only allowed fields)
  const initialFormData = {
    name: "",
    username: "",
    password: "",
    status: true,
  };
  const formData = ref({ ...initialFormData });

  // Note: removed detail-list fields — user_default now only contains name, username, password, status

  // === CONFIGURATION ===
  // Filter options for status filtering
  // Use string values for options to avoid boolean/string mismatches
  const FILTER_OPTIONS = [
    {
      value: "all",
      label: "All",
      activeClass: "bg-white text-gray-900",
      inactiveClass: "text-gray-600 hover:text-gray-900",
    },
    {
      value: "active",
      label: "Active",
      activeClass: "bg-green-500 text-white",
      inactiveClass: "text-gray-600 hover:text-green-600",
    },
    {
      value: "inactive",
      label: "Inactive",
      activeClass: "bg-red-500 text-white",
      inactiveClass: "text-gray-600 hover:text-red-600",
    },
  ];

  // Table column configuration
  const TABLE_COLUMNS = [
    { text: "Name", value: "name", sortable: true },
    { text: "Username", value: "username", sortable: true },

    {
      text: "Status",
      value: "status",
      sortable: true,
      render: (value) => h(Badge, { color: value ? "green" : "red" }, () => (value ? "Active" : "Inactive")),
    },
  ];

  // === COMPUTED PROPERTIES ===
  // Form mode checkers
  const isEditMode = computed(() => formMode.value === "edit");
  const isViewMode = computed(() => formMode.value === "view");
  const isCopyMode = computed(() => formMode.value === "copy");
  const isCreateMode = computed(() => formMode.value === "create");

  // Form configuration based on mode
  const formConfig = computed(() => {
    const configs = {
      create: {
        title: "Add New User Default",
        subtitle: "Create a new user default",
        submitText: "Create User Default",
        readonly: false,
      },
      edit: {
        title: "Edit User Default",
        subtitle: "Update user default information",
        submitText: "Update User Default",
        readonly: false,
      },
      view: {
        title: "User Default Details",
        subtitle: "View user default information",
        submitText: null,
        readonly: true,
      },
      copy: {
        title: "Copy User Default",
        subtitle: "Create a copy of user default",
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

  /**
   * Normalize various status filter inputs into API-friendly values.
   * Returns:
   * - 'all' when no filtering
   * - 1 for active
   * - 0 for inactive
   */
  const normalizeStatusFilter = (val) => {
    if (val === undefined || val === null) return "all";
    const str = String(val).toLowerCase();
    if (str === "all") return "all";
    if (val === true || val === 1 || str === "1" || str === "true" || str === "active") return 1;
    return 0;
  };

  // === API ENDPOINTS [DROPDOWN FETCHING] ===
  // Removed dropdown fetches for user type / company / responsibility since fields were simplified

  // === INITIALIZATION ===

  // Detail list removed

  // === API METHODS ===
  /**
   * Fetch
   */
  const fetchDataTables = async (page = 1, paginate = 10) => {
    if (loading.value) return;
    loading.value = true;
    error.value = null;

    try {
      // Normalize status filter value so we correctly support
      // boolean, numeric and string inputs from UI components.
      const filterStatus = normalizeStatusFilter(statusFilter.value);

      const params = {
        ...(searchTerm.value.trim() && { search: searchTerm.value.trim() }),
        ...(filterStatus !== "all" && { filter_column_status: filterStatus }),
        searchfield: "name",
        page,
        limit: paginate,
        // include: 'm_gen'
      };

      // Append server-side raw ordering if set
      if (sortState.value.sortBy) {
        const direction = sortState.value.sortDesc ? "DESC" : "ASC";
        const allowed = TABLE_COLUMNS.map((c) => c.value).filter(Boolean);
        if (allowed.includes(sortState.value.sortBy)) {
          params.order_by_raw = `${sortState.value.sortBy} ${direction}`;
        }
      }

      const response = await httpService.get(apiConfig.endpoints.user.list, { params });
      // Debug: log params sent to backend (remove in production)
      console.log("[useUserDefaultManagement] fetch params:", params);
      if (response.status !== "success") throw new Error(response.message || "API error");
      dataTables.value = (response.data || []).map((item) => ({ ...item }));
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
  // Try dynamic endpoint first
  const fetchDataById = async (id) => {
    try {
      const params = { include: "" };
      let response = await httpService.get(apiConfig.endpoints.user.show(id), { params });
      if (response && response.status === "success" && response.data) {
        // if data is an array (list) and empty, fall back to generic endpoint
        if (Array.isArray(response.data) && response.data.length === 0) {
          // fallback to generic module route
          response = await httpService.get(`/user_default/${id}`);
        }
      } else {
        // fallback to generic module route
        response = await httpService.get(`/user_default/${id}`);
      }

      if (!response || response.status !== "success") throw new Error(response?.message || "API error");
      return response.data;
    } catch (err) {
      showError("Gagal mengambil data user default");
      console.error("Fetch by id error:", err);
      return null;
    }
  };

  /**
   * Save user default (create or update)
   */
  const saveData = async () => {
    if (formLoading.value) return; // Prevent multiple submissions
    formLoading.value = true;
    try {
      // Validasi required fields
      if (!formData.value.name || !formData.value.name.trim()) {
        showError('Field "Name" wajib diisi');
        formLoading.value = false;
        return;
      }
      if (!formData.value.username || !formData.value.username.trim()) {
        showError('Field "Username" wajib diisi');
        formLoading.value = false;
        return;
      }
      if (isCreateMode.value && (!formData.value.password || !formData.value.password.trim())) {
        showError('Field "Password" wajib diisi untuk user baru');
        formLoading.value = false;
        return;
      }

      // Build request body as required
      const body = {
        name: formData.value.name || undefined,
        username: formData.value.username || undefined,
        // Only include password if provided (for create) or not empty (for update)
        password: formData.value.password ? formData.value.password : undefined,
        status: typeof formData.value.status === "boolean" ? formData.value.status : undefined,
      };

      // Remove undefined fields
      Object.keys(body).forEach((key) => body[key] === undefined && delete body[key]);

      // Determine method and endpoint (use standard create/update endpoints)
      let result;
      const endpoint = isEditMode.value && selectedItem.value ? apiConfig.endpoints.user.update(selectedItem.value.id) : apiConfig.endpoints.user.create;
      if (isEditMode.value && selectedItem.value) {
        result = await httpService.put(endpoint, body);
      } else {
        result = await httpService.post(endpoint, body);
      }
      if (result.status !== "success") throw new Error(result.message || "API error");
      showSuccess(isEditMode.value ? "User default updated successfully" : `User default ${isCopyMode.value ? "copied" : "created"} successfully`);
      closeForm();
      clearURL();
      // Refresh list after save
      fetchDataTables(pagination.value.currentPage, pagination.value.pageSize);
    } catch (err) {
      const action = isEditMode.value ? "update" : "save";
      showError(`Failed to ${action} user default: ${err.message}`);
      console.error("Save error:", err);
    } finally {
      formLoading.value = false;
    }
  };

  /**
   * Delete user default item
   */
  const deleteUserDefault = async (item) => {
    try {
      // Call backend to delete
      const endpoint = apiConfig.endpoints.user.delete(item.id);
      const res = await httpService.delete(endpoint);
      if (!res || res.status !== "success") {
        throw new Error(res?.message || "Failed to delete on server");
      }

      // Refresh list from server
      await fetchDataTables(pagination.value.currentPage, pagination.value.pageSize);
      showSuccess("User default deleted successfully");
      selectedItem.value = null;
    } catch (err) {
      showError("Failed to delete user default");
      console.error("Delete error:", err);
    }
  };

  // === FORM MANAGEMENT ===
  /**
   * Open form with specified mode and data
   */
  const openForm = (mode, item = null) => {
    formMode.value = mode;
    if (mode === "create") {
      resetForm();
    } else if (item) {
      selectedItem.value = item;
      // Map all fields from item to form for all modes (edit, view, copy)
      formData.value = {
        name: item.name || "",
        username: item.username || "",
        password: mode === "copy" ? "" : item.password || "", // Clear password for copy, keep for edit/view
        status: typeof item.status === "boolean" ? item.status : true,
      };
    }
    showForm.value = true;
  };

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
  const handleEdit = async () => {
    if (!selectedItem.value) return;
    updateURL("edit", selectedItem.value.id);
    // Fetch fresh item from backend to ensure latest data
    const item = await fetchDataById(selectedItem.value.id);
    if (item) openForm("edit", item);
  };

  /**
   * Handle view selected item
   */
  const handleView = async () => {
    if (!selectedItem.value) return;
    updateURL("view", selectedItem.value.id);
    const item = await fetchDataById(selectedItem.value.id);
    if (item) openForm("view", item);
  };

  /**
   * Handle copy selected item
   */
  const handleCopy = async () => {
    if (!selectedItem.value) return;
    updateURL("copy", selectedItem.value.id);
    const item = await fetchDataById(selectedItem.value.id);
    if (item) openForm("copy", item);
  };

  /**
   * Handle delete selected item
   */
  const handleDelete = () => {
    if (!selectedItem.value) return;
    showConfirmation({
      title: "Delete User Default",
      message: `Are you sure you want to delete user "${selectedItem.value.name}"? This action cannot be undone.`,
      confirmText: "Delete",
      confirmVariant: "filled",
      onConfirm: () => {
        deleteUserDefault(selectedItem.value);
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
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

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
    // Support payloads from DataTable: either { column, direction } or (column, direction)
    let sortBy = null;
    let sortDesc = false;

    if (a && typeof a === "object" && a.column) {
      sortBy = a.column;
      sortDesc = (a.direction || "").toLowerCase() === "desc";
    } else if (typeof a === "string") {
      sortBy = a;
      if (typeof b === "string") {
        sortDesc = b.toLowerCase() === "desc";
      } else if (typeof b === "boolean") {
        sortDesc = b;
      }
    }

    if (!sortBy) {
      sortState.value = { sortBy: null, sortDesc: false };
    } else {
      sortState.value = { sortBy, sortDesc };
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

  // Detail-list and select modal logic removed — user_default now only stores name, username, password, status

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
      // Selalu fetch by id dari backend
      const item = await fetchDataById(itemId);
      if (item) {
        openForm(action, item);
      } else {
        showError("Data tidak ditemukan");
        clearURL();
      }
    }
  };

  const handleRowClick = (item) => {
    selectedItem.value = item;
    console.log("Selected item:", item);
  };

  watch(() => route.query, detectActionFromURL);

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

    // simplified schema — detail list removed

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
    userTypeOptions: userTypeDropdown,

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

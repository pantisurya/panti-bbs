import { ref, computed, onMounted, h, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useSnackbar } from "@/composables/useSnackbar.js";
import Badge from "@/components/Badge.vue";
import { apiConfig, buildApiUrl } from "@/config/api.js";
import { pl } from "element-plus/es/locales.mjs";
import httpService from "../../services/httpService";

/**
 * Composable for managing user default operations
 * Handles CRUD operations, filtering, pagination, and form management
 */
export function useGeneralManagement() {
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

  // Sorting state: { sortBy: string|null, sortDesc: boolean }
  const sortState = ref({ sortBy: null, sortDesc: false });

  // Data management
  const dataTables = ref([]);
  const userTypeDropdown = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const isInitialized = ref(false); // Flag to prevent multiple initial fetches

  // Debounce timer for search
  let searchTimeout = null;

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

  // Form data with default values
  const initialFormData = {
    group: "",
    key1: "",
    code: "",
    value1: "",
    value2: "",
    value3: "",
    value4: "",
    value5: "",
    status: true,
  };
  const formData = ref({ ...initialFormData });

  // === USER DEFAULT DETAIL LIST ===
  // List of detail items for the user default (company, responsibility, isPrimary, status)
  const detailListForm = ref([]);
  // Columns for the editable detail table
  const detailListColumns = [
    {
      text: "Company",
      value: "company",
      type: "select",
      editable: true,
      required: true,
      options: [],
      placeholder: "Select Company",
    },
    {
      text: "Responsibility",
      value: "responsibility",
      type: "select",
      editable: true,
      required: true,
      options: [],
      placeholder: "Select Responsibility",
    },
    { text: "isPrimary", value: "isprimary", type: "checkbox", editable: true },
    { text: "Status", value: "status", type: "checkbox", editable: true },
    { text: "Aksi", value: "action", type: "action", editable: false },
  ];

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
    { text: "Group", value: "group", sortable: true },
    { text: "Value1", value: "value1", sortable: true },
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

  // === API ENDPOINTS [DROPDOWN FETCHING] ===
  // Fetch user type options for dropdown

  async function fetchUserTypeDropdown() {
    try {
      // Add group param for server-side filtering
      const params = new URLSearchParams({ filter_column_group: "Tipe User" });
      const response = await fetch(buildApiUrl(`${apiConfig.endpoints.general.list}?${params}`), {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch user type");
      const result = await response.json();
      if (result.status !== "success") throw new Error(result.message || "API error");
      // Map to dropdown format (no need to filter by group anymore)
      const options = (result.data || []).map((item) => ({
        value: item.id,
        label: item.value1,
      }));
      userTypeDropdown.value = options;
    } catch (err) {
      showError("Gagal mengambil data user type");
      userTypeDropdown.value = [];
      console.error("Fetch user type dropdown error:", err);
    }
  }

  // Fetch company options for dropdown
  async function fetchCompanyDropdown() {
    try {
      const response = await fetch(buildApiUrl("/dynamic/m_unit_bussiness"), {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch company");
      const result = await response.json();
      if (result.status !== "success") throw new Error(result.message || "API error");
      // Map to dropdown format
      const options = (result.data || []).map((item) => ({
        value: item.id,
        label: item.comp_name,
      }));
      // Set to detailColumns[0] (Company)
      detailListColumns[0].options = options;
    } catch (err) {
      showError("Gagal mengambil data company");
      detailListColumns[0].options = [];
      console.error("Fetch company dropdown error:", err);
    }
  }

  // Fetch responsibility options for dropdown
  async function fetchResponsibilityDropdown() {
    try {
      const response = await fetch(buildApiUrl("/dynamic/m_responsibility"), {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch responsibility");
      const result = await response.json();
      if (result.status !== "success") throw new Error(result.message || "API error");
      // Map to dropdown format
      const options = (result.data || []).map((item) => ({
        value: item.id,
        label: item.name,
      }));
      // Set to detailColumns[1] (Responsibility)
      detailListColumns[1].options = options;
    } catch (err) {
      showError("Gagal mengambil data responsibility");
      detailListColumns[1].options = [];
      console.error("Fetch responsibility dropdown error:", err);
    }
  }

  // === INITIALIZATION ===

  // Add a new empty detail row
  const addDetailListRow = () => {
    detailListForm.value.push({
      company: "",
      responsibility: "",
      isprimary: false,
      status: true,
    });
  };

  // Remove a detail row by index
  const removeDetailListRow = (idx) => {
    if (typeof idx === "number" && idx >= 0 && idx < detailListForm.value.length) {
      detailListForm.value.splice(idx, 1);
    }
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
      let filterStatus;
      if (statusFilter.value !== "all") {
        if (statusFilter.value === true || statusFilter.value === 1 || statusFilter.value === "active") {
          filterStatus = 1;
        } else {
          filterStatus = 0;
        }
      }

      const params = {
        ...(searchTerm.value.trim() && { search: searchTerm.value.trim() }),
        ...(statusFilter.value !== "all" && { filter_column_status: filterStatus }),
        page,
        limit: paginate,
        searchfield: "group", // Default search field
      };

      // If sortState has a sortBy set, include order_by_raw param in format: "<field> ASC|DESC"
      if (sortState.value.sortBy) {
        const direction = sortState.value.sortDesc ? "DESC" : "ASC";
        // Only allow raw ordering for known fields (defensive)
        const allowedRawFields = ["value1", "group", "status"];
        if (allowedRawFields.includes(sortState.value.sortBy)) {
          params.order_by_raw = `${sortState.value.sortBy} ${direction}`;
        }
      }

      const result = await httpService.get(`${apiConfig.endpoints.general.list}?${new URLSearchParams(params)}`);
      if (result.status !== "success") throw new Error(result.message || "API error");

      dataTables.value = (result.data || []).map((item) => ({
        ...item,
        agama_id: item.m_gen?.value1 || "-",
        alamat: item.alamat || "-",
        nik: item.nik || "-",
      }));

      pagination.value = {
        currentPage: result.pagination?.page || 1,
        pageSize: result.pagination?.limit || paginate,
        totalItems: result.pagination?.total || 0,
        totalPages: result.pagination?.totalPages || 1,
      };

      isInitialized.value = true; // Mark as initialized after first successful fetch
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
      const params = {};

      const response = await fetch(buildApiUrl(`${apiConfig.endpoints.general.show(id)}?${new URLSearchParams(params)}`), {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to fetch user default by id");
      const result = await response.json();
      if (result.status !== "success") throw new Error(result.message || "API error");
      return result.data;
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
      // Build request body as required
      const body = {
        group: formData.value.group || undefined,
        key1: formData.value.key1 || undefined,
        code: formData.value.code || undefined,
        value1: formData.value.value1 || undefined,
        value2: formData.value.value2 || undefined,
        value3: formData.value.value3 || undefined,
        value4: formData.value.value4 || undefined,
        value5: formData.value.value5 || undefined,
        status: typeof formData.value.status === "boolean" ? formData.value.status : undefined,
      };

      // Remove undefined fields
      Object.keys(body).forEach((key) => body[key] === undefined && delete body[key]);

      // Determine method and endpoint
      let method = "POST";
      let url = buildApiUrl(apiConfig.endpoints.general.create);
      if (isEditMode.value && selectedItem.value) {
        method = "PUT";
        url = buildApiUrl(apiConfig.endpoints.general.update(selectedItem.value.id));
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Failed to save user default");
      const result = await response.json();
      if (result.status !== "success") throw new Error(result.message || "API error");
      showSuccess(isEditMode.value ? "User default updated successfully" : `User default ${isCopyMode.value ? "copied" : "created"} successfully`);
      closeForm();
      clearURL();
      // Refresh list after save
      fetchDataTables(pagination.value.currentPage, pagination.value.pageSize);
    } catch (err) {
      const action = isEditMode.value ? "update" : "save";
      showError(`Failed to ${action} user default`);
      console.error("Save error:", err);
    } finally {
      formLoading.value = false;
    }
  };

  /**
   * Delete user default item via API
   */
  const deleteUserDefault = async (item) => {
    try {
      if (!item || !item.id) throw new Error("Invalid item");
      const url = buildApiUrl(apiConfig.endpoints.general.delete(item.id));
      const response = await fetch(url, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to delete user default");
      const result = await response.json();
      if (result.status !== "success") throw new Error(result.message || "API error");
      showSuccess("User default deleted successfully");
      selectedItem.value = null;
      // Refresh list after delete
      fetchDataTables(pagination.value.currentPage, pagination.value.pageSize);
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
    // Fetch dropdown options hanya saat form dibuka

    if (mode === "create") {
      resetForm();
      detailListForm.value = [];
    } else if (item) {
      selectedItem.value = item;
      formData.value = mode === "copy" ? { ...item, id: undefined } : { ...item };
      // Mapping user_details dari API ke detailList
      if (Array.isArray(item.user_details)) {
        detailListForm.value = item.user_details.map((detail) => ({
          id: detail.id,
          company: detail.m_responsibility?.m_unit_bussiness.comp_name || "",
          responsibility: detail.m_responsibility?.name || "",
          responsibility_id: detail.f_responsibility || "",
          isprimary: typeof detail.is_primary === "boolean" ? detail.is_primary : false,
          status: typeof detail.status === "boolean" ? detail.status : true,
          readonly: mode === "view", // readonly hanya jika mode view
        }));
      } else if (Array.isArray(item.detailList)) {
        detailListForm.value = [...item.detailList];
      } else {
        detailListForm.value = [];
      }
    }
    showForm.value = true;
  };

  /**
   * Close form and reset state
   */
  const closeForm = () => {
    showForm.value = false;
    resetForm();
    detailListForm.value = [];
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
    pagination.value.currentPage = 1;

    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Only fetch if not in form mode to avoid unnecessary API calls
    if (!showForm.value) {
      searchTimeout = setTimeout(() => {
        fetchDataTables(1, pagination.value.pageSize);
      }, 500); // 500ms debounce agar lebih smooth
    }
  };

  /**
   * Handle status filter change
   */
  const handleFilterChange = (value) => {
    statusFilter.value = value;
    // Reset to first page when filtering
    pagination.value.currentPage = 1;
    // Only fetch if not in form mode to avoid unnecessary API calls
    if (!showForm.value) {
      fetchDataTables(1, pagination.value.pageSize);
    }
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
    // DataTable emits either emit('sort-changed', { column, direction })
    // or may call with two args (column, direction). Support both.
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

    // Update state
    if (!sortBy) {
      sortState.value = { sortBy: null, sortDesc: false };
    } else {
      sortState.value = { sortBy, sortDesc };
    }

    // Fetch first page with new sort applied
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

  // === DETAIL SELECT MODAL LOGIC (untuk dipakai di view) ===
  const showSelectModal = ref(false);
  const selectedRows = ref([]);
  // selectOptions akan diisi dari API responsibility
  const selectOptions = ref([]);
  const selectColumns = [
    { text: "Company", value: "company" }, // hanya tampilkan text
    { text: "Responsibility", value: "responsibility" }, // hanya tampilkan text
    { text: "isPrimary", value: "isPrimary" },
    { text: "Status", value: "status" },
  ];

  function handleAddToList() {
    showSelectModal.value = true;
    fetchResponsibilityOptions(); // fetch data setiap kali modal dibuka
  }

  // Fetch responsibility data for select modal
  async function fetchResponsibilityOptions() {
    try {
      const apiEndpoint = apiConfig.endpoints.responsibility.list;
      const params = new URLSearchParams({ include: "m_unit_bussiness" });
      const response = await fetch(buildApiUrl(`${apiEndpoint}?${params}`), {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch responsibility");
      const result = await response.json();
      if (result.status !== "success") throw new Error(result.message || "API error");
      // Map API data to selectOptions format
      selectOptions.value = (result.data || []).map((item) => ({
        id: item.id,
        company: item.m_unit_bussiness?.comp_name || "-",
        responsibility: item.name,
        responsensibility_id: item.id, // id untuk dipakai di detailListForm
        isPrimary: false, // default, bisa diubah saat select
        status: item.status,
      }));
    } catch (err) {
      showError("Gagal mengambil data responsibility");
      selectOptions.value = [];
      console.error("Fetch responsibility error:", err);
    }
  }
  function handleSelectConfirm(rows) {
    rows.forEach((row) => {
      if (!detailListForm.value.some((item) => item.responsibility_id === row.id)) {
        detailListForm.value.push({
          ...row,
          responsibility: row.responsibility, // nama
          responsibility_id: row.id, // id
          readonly: false,
        });
      }
    });
    showSelectModal.value = false;
    selectedRows.value = [];
  }

  function handleSelectCancel() {
    showSelectModal.value = false;
    selectedRows.value = [];
  }

  // === LIFECYCLE ===
  onMounted(() => {
    // Delay detectActionFromURL untuk memastikan component sudah fully mounted
    setTimeout(() => {
      detectActionFromURL();
    }, 50);
  });

  // Watch route.query agar form terbuka sesuai URL
  const detectActionFromURL = async () => {
    const action = route.query.action;
    const itemId = route.query.id;
    if (!action) {
      showForm.value = false;
      resetForm();
      // Hanya fetch list datatable default saat landing jika belum diinisialisasi
      if (!isInitialized.value) {
        fetchDataTables();
      }
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

  watch(() => route.query, detectActionFromURL, {
    deep: true,
    // Immediate false untuk mencegah double call saat mounting
    immediate: false,
  });

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

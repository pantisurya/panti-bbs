import { ref, computed, onMounted, h, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useSnackbar } from "@/composables/useSnackbar.js";
import Badge from "@/components/Badge.vue";
import { apiConfig, buildApiUrl } from "@/config/api.js";
import httpService from "@/services/httpService.js";
import { pl } from "element-plus/es/locales.mjs";

/**
 * Composable for managing pengurus operations
 * Handles CRUD operations, filtering, pagination, and form management
 */
export function usePengurusManagement() {
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

  // Divisi & Jabatan selection
  const divisiOptions = ref([]); // List divisi_pengurus
  // selectedDivisi tidak perlu lagi, gunakan formData.divisi_id
  const jabatanPengurusOptions = ref([]); // List jabatan_pengurus
  const selectedJabatan = ref("");

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

  // Form data with default values
  const initialFormData = {
    nama: "",
    jabatan_id: "",
    gereja_id: "",
    umur: null,
    status: true,
  };
  const formData = ref({ ...initialFormData });

  // Watcher: Log label when divisi_id changes
  watch(
    () => formData.value.divisi_id,
    (newVal) => {
      if (newVal) {
        const found = divisiOptions.value.find((opt) => String(opt.value) === String(newVal));
        if (found) {
          fetchJabatanPengurusOptions(found.label.toUpperCase(), null);
        }
      }
    }
  );

  // Reset form to initial state
  function resetForm() {
    formData.value = { ...initialFormData };
    selectedItem.value = null;
  }

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
      value: 1, // gunakan 1 untuk active
      label: "Active",
      activeClass: "bg-green-500 text-white",
      inactiveClass: "text-gray-600 hover:text-green-600",
    },
    {
      value: 0, // gunakan 0 untuk inactive
      label: "Inactive",
      activeClass: "bg-red-500 text-white",
      inactiveClass: "text-gray-600 hover:text-red-600",
    },
  ];

  // Table column configuration
  const TABLE_COLUMNS = [
    { text: "Nama", value: "nama", sortable: true },
    {
      text: "Gereja",
      value: "gereja_id",
      sortable: true,
      render: (value) => {
        const found = gerejaOptions.value.find((opt) => String(opt.value) === String(value));
        return found ? found.label : value;
      },
    },
    {
      text: "Jabatan",
      value: "jabatan_name",
      sortable: false,
      render: (value) => {
        const found = jabatanOptions.value.find((opt) => String(opt.value) === String(value));
        return found ? found.label : value;
      },
    },
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
        title: "Add New Pengurus",
        subtitle: "Create a new pengurus",
        submitText: "Create Pengurus",
        readonly: false,
      },
      edit: {
        title: "Edit Pengurus",
        subtitle: "Update pengurus information",
        submitText: "Update Pengurus",
        readonly: false,
      },
      view: {
        title: "Pengurus Details",
        subtitle: "View pengurus information",
        submitText: null,
        readonly: true,
      },
      copy: {
        title: "Copy Pengurus",
        subtitle: "Create a copy of pengurus",
        submitText: "Create Copy",
        readonly: false,
      },
    };
    return configs[formMode.value] || configs.create;
  });

  // Jabatan & Gereja dropdowns
  const jabatanOptions = ref([]); // legacy, gunakan jabatanPengurusOptions untuk pengurus
  const gerejaOptions = ref([]);

  // Fetch divisi_pengurus (divisi)
  async function fetchDivisiPengurusOptions() {
    try {
      const params = new URLSearchParams({ filter_column_group: "divisi", no_pagination: true });
      const result = await httpService.get(`${apiConfig.endpoints.general.list}?${params}`);
      if (result.status !== "success") throw new Error(result.message || "API error");
      divisiOptions.value = (result.data || [])
        .filter((item) => item.value1 && item.value1.trim() !== "" && (item.status === true || item.status === 1))
        .map((item) => ({
          value: item.id || item.key1,
          label: item.value1,
        }));
    } catch (err) {
      showError("Gagal mengambil data divisi");
      divisiOptions.value = [];
      console.error("Fetch divisi error:", err);
    }
  }

  // Fetch jabatan_pengurus berdasarkan divisi dan filter key1
  async function fetchJabatanPengurusOptions(divisi, tipe) {
    // divisi: label atau null. tipe currently unused but kept for backward compat
    try {
      let group = "jabatan_pengurus";
      if (divisi) {
        // Normalize divisi label to safe suffix: lower case, remove spaces
        const suffix = String(divisi).toLowerCase().replace(/\s+/g, "_");
        // Map common variations to expected suffixes
        if (suffix.includes("pembina")) group = "jabatan_pengurus_pembina";
        else if (suffix.includes("pengawas")) group = "jabatan_pengurus_pengawas";
        else if (suffix.includes("pengurus")) group = "jabatan_pengurus_pengurus";
        else {
          // fallback: try direct composition
          group = `jabatan_pengurus_${suffix}`;
        }
      }

      const params = new URLSearchParams({ filter_column_group: group, no_pagination: true });
      const result = await httpService.get(`${apiConfig.endpoints.general.list}?${params}`);
      if (result.status !== "success") throw new Error(result.message || "API error");
      // Map only active items
      jabatanPengurusOptions.value = (result.data || [])
        .filter((item) => item.status === true || item.status === 1)
        .map((item) => ({
          value: item.id || item.key1,
          label: item.value1,
        }));
    } catch (err) {
      // If fetching division-specific group failed, fallback to generic 'jabatan_pengurus'
      console.warn("Fetch jabatan_pengurus for division failed, falling back:", err);
      try {
        const params = new URLSearchParams({ filter_column_group: "jabatan_pengurus", no_pagination: true });
        const result = await httpService.get(`${apiConfig.endpoints.general.list}?${params}`);
        if (result.status === "success") {
          jabatanPengurusOptions.value = (result.data || []).filter((item) => item.status === true || item.status === 1).map((item) => ({ value: item.id || item.key1, label: item.value1 }));
          return;
        }
      } catch (e) {
        console.error("Fallback fetch jabatan_pengurus failed:", e);
      }

      showError("Gagal mengambil data jabatan pengurus");
      jabatanPengurusOptions.value = [];
      console.error("Fetch jabatan pengurus error:", err);
    }
  }

  // Fetch jabatan options from m_gen group 'jabatan'
  async function fetchJabatanOptions() {
    try {
      const params = new URLSearchParams({ filter_column_group: "jabatan", no_pagination: true });
      const result = await httpService.get(`${apiConfig.endpoints.general.list}?${params}`);
      if (result.status !== "success") throw new Error(result.message || "API error");
      jabatanOptions.value = (result.data || [])
        .filter((item) => item.value1 && item.value1.trim() !== "" && (item.status === true || item.status === 1))
        .map((item) => ({
          value: item.id || item.key1,
          label: item.value1,
        }));
    } catch (err) {
      showError("Gagal mengambil data jabatan");
      jabatanOptions.value = [];
      console.error("Fetch jabatan error:", err);
    }
  }

  // Fetch divisi options from m_gen group 'divisi'
  async function fetchDivisiOptions() {
    try {
      const params = new URLSearchParams({ filter_column_group: "divisi", no_pagination: true });
      const result = await httpService.get(`${apiConfig.endpoints.general.list}?${params}`);
      if (result.status !== "success") throw new Error(result.message || "API error");
      divisiOptions.value = (result.data || [])
        .filter((item) => item.value1 && item.value1.trim() !== "" && (item.status === true || item.status === 1))
        .map((item) => ({
          value: item.id || item.key1,
          label: item.value1,
        }));
    } catch (err) {
      showError("Gagal mengambil data divisi");
      divisiOptions.value = [];
      console.error("Fetch divisi error:", err);
    }
  }

  // Fetch gereja options from m_gen group 'gereja'
  async function fetchGerejaOptions() {
    try {
      const params = new URLSearchParams({ filter_column_group: "gereja" });
      const result = await httpService.get(`${apiConfig.endpoints.general.list}?${params}`);
      if (result.status !== "success") throw new Error(result.message || "API error");
      gerejaOptions.value = (result.data || [])
        .filter((item) => item.value1 && item.value1.trim() !== "")
        .map((item) => ({
          value: item.id || item.key1,
          label: item.value1,
        }));
    } catch (err) {
      showError("Gagal mengambil data gereja");
      gerejaOptions.value = [];
      console.error("Fetch gereja error:", err);
    }
  }

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
        searchfield: "nama",
        page,
        limit: paginate,
        include: "m_gen",
      };

      // Append server-side raw ordering if set
      if (sortState.value.sortBy) {
        const direction = sortState.value.sortDesc ? "DESC" : "ASC";
        const allowed = TABLE_COLUMNS.map((c) => c.value).filter(Boolean);
        if (allowed.includes(sortState.value.sortBy)) {
          params.order_by_raw = `${sortState.value.sortBy} ${direction}`;
        }
      }
      const result = await httpService.get(`${apiConfig.endpoints.pengurus.list}?${new URLSearchParams(params)}`);
      if (result.status !== "success") throw new Error(result.message || "API error");
      dataTables.value = (result.data || []).map((item) => ({
        ...item,
        jabatan_id: item.jabatan_id || "-",
        jabatan_name: item.jabatan?.value1 || "-",
        gereja_id: item.gereja_id || "-",
      }));
      pagination.value = {
        currentPage: result.pagination?.page || 1,
        pageSize: result.pagination?.limit || paginate,
        totalItems: result.pagination?.total || 0,
        totalPages: result.pagination?.totalPages || 1,
      };
    } catch (err) {
      error.value = err.message || "Failed to fetch pengurus items";
      showError("Failed to fetch pengurus items");
      console.error("Fetch error:", err);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Fetch karyawan item by id from API
   */
  const fetchDataById = async (id) => {
    try {
      const result = await httpService.get(apiConfig.endpoints.pengurus.show(id));
      if (result.status !== "success") throw new Error(result.message || "API error");
      return result.data;
    } catch (err) {
      showError("Gagal mengambil data pengurus");
      console.error("Fetch by id error:", err);
      return null;
    }
  };

  /**
   * Save karyawan (create or update)
   */
  const saveData = async () => {
    if (formLoading.value) return; // Prevent multiple submissions
    formLoading.value = true;
    try {
      const body = {
        nama: formData.value.nama || undefined,
        jabatan_id: formData.value.jabatan_id || undefined,
        gereja_id: formData.value.gereja_id || undefined,
        divisi_id: formData.value.divisi_id || undefined,
        umur: formData.value.umur !== null && formData.value.umur !== undefined && formData.value.umur !== "" ? Number(formData.value.umur) : undefined,
        status: typeof formData.value.status === "boolean" ? formData.value.status : undefined,
      };
      Object.keys(body).forEach((key) => body[key] === undefined && delete body[key]);
      let url = apiConfig.endpoints.pengurus.create;
      if (isEditMode.value && selectedItem.value) {
        url = apiConfig.endpoints.pengurus.update(selectedItem.value.id);
      }
      const result = isEditMode.value && selectedItem.value ? await httpService.put(url, body) : await httpService.post(url, body);
      if (result.status !== "success") throw new Error(result.message || "API error");
      showSuccess(isEditMode.value ? "Pengurus updated successfully" : `Pengurus ${isCopyMode.value ? "copied" : "created"} successfully`);
      closeForm();
      clearURL();
      fetchDataTables(pagination.value.currentPage, pagination.value.pageSize);
    } catch (err) {
      const action = isEditMode.value ? "update" : "save";
      showError(`Failed to ${action} pengurus`);
      console.error("Save error:", err);
    } finally {
      formLoading.value = false;
    }
  };

  /**
   * Delete karyawan item (API)
   */
  const deletePengurus = async (item) => {
    try {
      const url = apiConfig.endpoints.pengurus.delete(item.id);
      const result = await httpService.delete(url);
      if (result.status !== "success") throw new Error(result.message || "API error");
      showSuccess("Pengurus deleted successfully");
      fetchDataTables(pagination.value.currentPage, pagination.value.pageSize);
      selectedItem.value = null;
    } catch (err) {
      showError("Failed to delete pengurus");
      console.error("Delete error:", err);
    }
  };

  // === FORM MANAGEMENT ===
  /**
   * Open form with specified mode and data
   */
  const openForm = (mode, item = null) => {
    formMode.value = mode;
    fetchGerejaOptions();
    if (mode === "create") {
      resetForm();
      jabatanPengurusOptions.value = [];
    } else if (item) {
      selectedItem.value = item;
      formData.value = mode === "copy" ? { ...item, id: undefined } : { ...item };
      // Fetch jabatan_pengurus sesuai divisi dan tipe default (PENGURUS)
      if (formData.value.divisi_id) {
        // Cari label divisi dari divisiOptions
        const foundDivisi = divisiOptions.value.find((opt) => String(opt.value) === String(formData.value.divisi_id));
        if (foundDivisi) {
          fetchJabatanPengurusOptions(foundDivisi.label.toUpperCase(), "PENGURUS");
        } else {
          jabatanPengurusOptions.value = [];
        }
      } else {
        jabatanPengurusOptions.value = [];
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
      title: "Delete Pengurus",
      message: `Are you sure you want to delete pengurus \"${selectedItem.value.nama}\"? This action cannot be undone.`,
      confirmText: "Delete",
      confirmVariant: "filled",
      onConfirm: async () => {
        await deletePengurus(selectedItem.value);
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

  // Debounce timer for search
  let searchTimeout = null;

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

  // === LIFECYCLE ===

  onMounted(() => {
    fetchGerejaOptions();
    fetchDivisiPengurusOptions();
    fetchJabatanPengurusOptions();
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
    if (item && item.id) {
      selectedItem.value = { ...item };
      console.log("Selected item:", selectedItem.value);
    } else {
      selectedItem.value = null;
      console.warn("Row click: item tidak valid", item);
    }
  };

  watch(() => route.query, detectActionFromURL);

  // === Confirmation Modal ===
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

  // === RETURN EXPOSED API ===
  return {
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
    filterOptions: FILTER_OPTIONS,
    columns: TABLE_COLUMNS,
    jabatanOptions, // legacy
    divisiOptions,
    // selectedDivisi tidak perlu lagi
    jabatanPengurusOptions,
    selectedJabatan,
    fetchJabatanPengurusOptions,
    gerejaOptions,

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
  };
}

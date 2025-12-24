import { ref, computed, onMounted, h, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useSnackbar } from "@/composables/useSnackbar.js";
import Badge from "@/components/Badge.vue";
import { apiConfig, buildApiUrl } from "@/config/api.js";
import httpService from "@/services/httpService.js";
import { pl } from "element-plus/es/locales.mjs";

/**
 * Composable for managing karyawan operations
 * Handles CRUD operations, filtering, pagination, and form management
 */
export function useKaryawanManagement() {
  // === FILE UPLOAD HANDLER ===
  function onFotoChange(e) {
    const file = e.target.files && e.target.files[0];
    if (file) {
      formData.value.foto = file;
      console.log("onFotoChange SET FOTO:", file, typeof file);
    } else {
      formData.value.foto = "";
      console.log("onFotoChange CLEAR FOTO");
    }
  }
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

  // Sorting state for table (server-side)
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

  // Preview untuk foto
  const fotoPreview = ref("");

  // Form data with default values
  const initialFormData = {
    nama: "",
    jabatan_id: "",
    umur: null,
    status: true,
    no_ktp: "",
    agama_id: "",
    tgl_lahir: "",
    foto: "",
  };
  const formData = ref({ ...initialFormData });

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
    { text: "Jabatan", value: "jabatan_id", sortable: true },
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
        title: "Add New Karyawan",
        subtitle: "Create a new karyawan",
        submitText: "Create Karyawan",
        readonly: false,
      },
      edit: {
        title: "Edit Karyawan",
        subtitle: "Update karyawan information",
        submitText: "Update Karyawan",
        readonly: false,
      },
      view: {
        title: "Karyawan Details",
        subtitle: "View karyawan information",
        submitText: null,
        readonly: true,
      },
      copy: {
        title: "Copy Karyawan",
        subtitle: "Create a copy of karyawan",
        submitText: "Create Copy",
        readonly: false,
      },
    };
    return configs[formMode.value] || configs.create;
  });

  // Jabatan dropdown
  const jabatanOptions = ref([]);
  // Agama dropdown
  const agamaOptions = ref([]);

  // Fetch jabatan options from m_gen group 'jabatan_karyawan'
  async function fetchJabatanOptions() {
    try {
      const params = new URLSearchParams({ filter_column_group: "jabatan_karyawan", no_pagination: true });
      const result = await httpService.get(`${apiConfig.endpoints.general.list}?${params}`);
      if (result.status !== "success") throw new Error(result.message || "API error");
      jabatanOptions.value = (result.data || [])
        .filter((item) => item.value1 && item.value1.toString().trim() !== "" && (item.status === true || item.status === 1))
        .map((item) => ({
          value: item.id || item.key1,
          label: item.value1,
        }));
    } catch (err) {
      showError("Gagal mengambil data jabatan karyawan");
      jabatanOptions.value = [];
      console.error("Fetch jabatan karyawan error:", err);
    }
  }

  // Fetch agama options from m_gen group 'agama'
  async function fetchAgamaOptions() {
    try {
      const params = new URLSearchParams({ filter_column_group: "agama", limit: "100" });
      const result = await httpService.get(`${apiConfig.endpoints.general.list}?${params}`);
      if (result.status !== "success") throw new Error(result.message || "API error");
      agamaOptions.value = (result.data || [])
        .filter((item) => item.group === "agama" && item.value1 && item.value1.toString().trim() !== "" && (item.status === true || item.status === 1))
        .map((item) => ({
          value: item.id || item.key1,
          label: item.value1,
        }));
      console.log("Agama options loaded:", agamaOptions.value);
    } catch (err) {
      showError("Gagal mengambil data agama");
      agamaOptions.value = [];
      console.error("Fetch agama error:", err);
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

    // Ensure agamaOptions is populated for dropdown
    if (!agamaOptions.value.length) {
      await fetchAgamaOptions();
    }

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
        // Build whitelist from TABLE_COLUMNS
        const allowed = TABLE_COLUMNS.map((c) => c.value).filter(Boolean);
        if (allowed.includes(sortState.value.sortBy)) {
          params.order_by_raw = `${sortState.value.sortBy} ${direction}`;
        }
      }
      const result = await httpService.get(`${apiConfig.endpoints.karyawan.list}?${new URLSearchParams(params)}`);
      if (result.status !== "success") throw new Error(result.message || "API error");
      dataTables.value = (result.data || []).map((item) => {
        // Map agama and jabatan from nested objects if available
        let agamaLabel = "-";
        if (item.agama) {
          agamaLabel = item.agama.value1 || "-";
        } else if (item.agama_id) {
          const foundAgama = agamaOptions.value.find((opt) => opt.value === item.agama_id);
          if (foundAgama) agamaLabel = foundAgama.label;
        }
        return {
          ...item,
          jabatan_id: item.jabatan?.value1 || "-",
          agama_display: agamaLabel,
        };
      });
      pagination.value = {
        currentPage: result.pagination?.page || 1,
        pageSize: result.pagination?.limit || paginate,
        totalItems: result.pagination?.total || 0,
        totalPages: result.pagination?.totalPages || 1,
      };
    } catch (err) {
      error.value = err.message || "Failed to fetch karyawan items";
      showError("Failed to fetch karyawan items");
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
      const result = await httpService.get(apiConfig.endpoints.karyawan.show(id));
      if (result.status !== "success") throw new Error(result.message || "API error");
      // Tambahkan base url hanya jika foto disimpan sebagai relative path
      let fotoVal = "";
      if (result.data.foto) {
        if (typeof result.data.foto === "string" && result.data.foto.startsWith("http")) {
          fotoVal = result.data.foto;
        } else {
          fotoVal = buildApiUrl(String(result.data.foto).replace(/^uploads\//, "/uploads/")).replace("/api/", "/");
        }
      }
      const data = { ...result.data, foto: fotoVal };
      return data;
    } catch (err) {
      showError("Gagal mengambil data karyawan");
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
      // Debug log foto sebelum submit
      console.log("DEBUG FOTO:", formData.value.foto, typeof formData.value.foto);
      // Jika foto adalah File, gunakan FormData (untuk backward compatibility)
      let result;
      let url = apiConfig.endpoints.karyawan.create;
      if (isEditMode.value && selectedItem.value) url = apiConfig.endpoints.karyawan.update(selectedItem.value.id);

      const isFile = formData.value.foto && typeof formData.value.foto === "object" && formData.value.foto instanceof File;
      if (isFile) {
        const body = new FormData();
        body.append("nama", formData.value.nama || "");
        body.append("jabatan_id", formData.value.jabatan_id || "");
        body.append("umur", formData.value.umur !== null && formData.value.umur !== undefined && formData.value.umur !== "" ? Number(formData.value.umur) : "");
        body.append("status", typeof formData.value.status === "boolean" ? formData.value.status : "");
        body.append("no_ktp", formData.value.no_ktp || "");
        body.append("agama_id", formData.value.agama_id || "");
        body.append("tgl_lahir", formData.value.tgl_lahir || "");
        body.append("foto", formData.value.foto);
        if (isEditMode.value && selectedItem.value) {
          result = await httpService.put(url, body, { headers: {} });
        } else {
          result = await httpService.post(url, body, { headers: {} });
        }
      } else {
        // Kirim JSON biasa jika foto berupa link/string
        const payload = {
          nama: formData.value.nama || "",
          jabatan_id: formData.value.jabatan_id || "",
          umur: formData.value.umur !== null && formData.value.umur !== undefined && formData.value.umur !== "" ? Number(formData.value.umur) : null,
          status: typeof formData.value.status === "boolean" ? formData.value.status : null,
          no_ktp: formData.value.no_ktp || "",
          agama_id: formData.value.agama_id || "",
          tgl_lahir: formData.value.tgl_lahir || "",
        };
        // sertakan foto jika ada string (link)
        if (formData.value.foto && typeof formData.value.foto === "string") payload.foto = formData.value.foto;

        if (isEditMode.value && selectedItem.value) {
          result = await httpService.put(url, payload);
        } else {
          result = await httpService.post(url, payload);
        }
      }
      if (result.status !== "success") throw new Error(result.message || "API error");
      showSuccess(isEditMode.value ? "Karyawan updated successfully" : `Karyawan ${isCopyMode.value ? "copied" : "created"} successfully`);
      closeForm();
      clearURL();
      fetchDataTables(pagination.value.currentPage, pagination.value.pageSize);
    } catch (err) {
      const action = isEditMode.value ? "update" : "save";
      showError(`Failed to ${action} karyawan`);
      console.error("Save error:", err);
    } finally {
      formLoading.value = false;
    }
  };

  /**
   * Delete karyawan item (API)
   */
  const deleteKaryawan = async (item) => {
    try {
      const url = apiConfig.endpoints.karyawan.delete(item.id);
      const result = await httpService.delete(url);
      if (result.status !== "success") throw new Error(result.message || "API error");
      showSuccess("Karyawan deleted successfully");
      fetchDataTables(pagination.value.currentPage, pagination.value.pageSize);
      selectedItem.value = null;
    } catch (err) {
      showError("Failed to delete karyawan");
      console.error("Delete error:", err);
    }
  };

  // === FORM MANAGEMENT ===
  /**
   * Open form with specified mode and data
   */
  const openForm = (mode, item = null) => {
    formMode.value = mode;
    fetchJabatanOptions(); // fetch jabatan here
    fetchAgamaOptions(); // fetch agama here

    if (mode === "create") {
      resetForm();
    } else if (item) {
      selectedItem.value = item;
      // Ensure all fields are present in formData
      formData.value = {
        ...initialFormData,
        ...(mode === "copy" ? { ...item, id: undefined } : { ...item }),
      };
      // Normalize foto for preview in edit/view modes
      try {
        const origin = typeof window !== "undefined" && window.location && window.location.origin ? window.location.origin : "";
        let baseUrl = apiConfig.baseURL.replace(/\/api\/?$/, "").replace(/\/$/, "");
        if (!baseUrl) baseUrl = origin;
        if (formData.value.foto) {
          if (typeof formData.value.foto === "string" && formData.value.foto.startsWith("http")) {
            // keep as-is - it's already an absolute URL
            fotoPreview.value = formData.value.foto;
          } else {
            const path = String(formData.value.foto).replace(/^\/+/, "");
            const fullUrl = `${baseUrl.replace(/\/$/, "")}/${path}`;
            formData.value.foto = fullUrl;
            fotoPreview.value = fullUrl;
          }
        } else {
          fotoPreview.value = "";
        }
      } catch (e) {
        console.warn("Error normalizing foto for preview", e);
        fotoPreview.value = "";
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
      title: "Delete Karyawan",
      message: `Are you sure you want to delete karyawan \"${selectedItem.value.nama}\"? This action cannot be undone.`,
      confirmText: "Delete",
      confirmVariant: "filled",
      onConfirm: async () => {
        await deleteKaryawan(selectedItem.value);
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
    jabatanOptions,
    agamaOptions,

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
    onFotoChange,
    fotoPreview,

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

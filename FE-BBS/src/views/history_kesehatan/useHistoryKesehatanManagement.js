import { ref, computed, onMounted, h, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useSnackbar } from "@/composables/useSnackbar.js";
import Badge from "@/components/Badge.vue";
import { apiConfig, buildApiUrl } from "@/config/api.js";
import httpService from "@/services/httpService.js";
import { pl } from "element-plus/es/locales.mjs";

/**
 * Composable for managing user default operations
 * Handles CRUD operations, filtering, pagination, and form management
 */
export function useHistoryKesehatanManagement() {
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
  const loading = ref(false);
  const error = ref(null);

  // Dropdown options
  const penghuniOptions = ref([]);
  const karyawanOptions = ref([]);
  const jenisLaporanOptions = ref([]);

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

  // Form data with default values for History Kesehatan
  const initialFormData = {
    m_penghuni_id: "",
    m_kary_id: "",
    jenis_laporan_id: "",
    tgl_laporan: "",
    laporan: "",
    // status: true,
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
    // { text: "Status", value: "status", type: "checkbox", editable: true },
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
    { text: "Nama", value: "nama", sortable: false },
    { text: "Pendamping", value: "m_kary_id", sortable: true },
    { text: "Jenis Laporan", value: "jenis_laporan_id", sortable: true },
    { text: "Tanggal", value: "tgl_laporan", sortable: false },
  ];

  // === COMPUTED PROPERTIES ===
  // Form mode checkers
  const isEditMode = computed(() => formMode.value === "edit");
  const isViewMode = computed(() => formMode.value === "view");
  const isCopyMode = computed(() => formMode.value === "copy");
  const isCreateMode = computed(() => formMode.value === "create");

  // Combined dropdown options for form
  const selectOptions = computed(() => ({
    penghuni: penghuniOptions.value,
    karyawan: karyawanOptions.value,
    jenisLaporan: jenisLaporanOptions.value,
  }));

  // Form configuration based on mode
  const formConfig = computed(() => {
    const configs = {
      create: {
        title: "Add New History Kesehatan",
        subtitle: "Create a new history kesehatan",
        submitText: "Create History Kesehatan",
        readonly: false,
      },
      edit: {
        title: "Edit History Kesehatan",
        subtitle: "Update history kesehatan information",
        submitText: "Update History Kesehatan",
        readonly: false,
      },
      view: {
        title: "History Kesehatan Details",
        subtitle: "View history kesehatan information",
        submitText: null,
        readonly: true,
      },
      copy: {
        title: "Copy History Kesehatan",
        subtitle: "Create a copy of history kesehatan",
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
   * Utility: Normalize date string to YYYY-MM-DD (for input type="date")
   */
  function normalizeDateToInput(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${mm}-${dd}`;
  }

  // === API ENDPOINTS [DROPDOWN FETCHING] ===

  // Fetch jenis laporan options from m_general
  async function fetchJenisLaporanDropdown() {
    try {
      // Fetch dengan limit besar untuk memastikan semua jenis_laporan ter-include
      const endpoint = `${apiConfig.endpoints.general.list}?limit=1000`;
      const result = await httpService.get(endpoint);
      console.log("Raw gen list result:", result);
      if (result.status !== "success") throw new Error(result.message || "API error");
      const raw = result.data || [];
      console.log("Raw gen data:", raw);

      // Accept several possible group name variants for "jenis laporan"
      const acceptedGroups = new Set(["jenislaporan", "jenis_laporan", "jenis laporan", "jenis-laporan", "jenislaporan", "JenisLaporan"].map((g) => g.toLowerCase()));
      console.log("Accepted groups:", Array.from(acceptedGroups));

      const filtered = raw.filter((item) => {
        if (!item || !item.group) return false;
        const groupLower = String(item.group).toLowerCase();
        const matches = acceptedGroups.has(groupLower);
        if (matches) {
          console.log(`Item matches: ${item.id} group=${item.group} (lowercased: ${groupLower})`);
        }
        return matches;
      });
      console.log("Filtered jenis laporan items:", filtered);

      const options = filtered.map((item) => ({ value: item.id, label: item.value1 || item.key1 || item.code || item.value2 }));
      jenisLaporanOptions.value = options;
      console.log("Jenis Laporan options loaded:", options);
    } catch (err) {
      showError("Gagal mengambil data jenis laporan");
      jenisLaporanOptions.value = [];
      console.error("Fetch jenis laporan dropdown error:", err);
    }
  }

  // Fetch penghuni options from m_penghuni
  async function fetchPenghuniDropdown() {
    try {
      const endpoint = apiConfig.endpoints.penghuni.list;
      const result = await httpService.get(endpoint);
      if (result.status !== "success") throw new Error(result.message || "API error");
      // Map to dropdown format
      const options = (result.data || []).map((item) => ({
        value: item.id,
        label: item.nama,
      }));
      penghuniOptions.value = options;
    } catch (err) {
      showError("Gagal mengambil data penghuni");
      penghuniOptions.value = [];
      console.error("Fetch penghuni dropdown error:", err);
    }
  }

  // Fetch karyawan options from m_karyawan
  async function fetchKaryawanDropdown() {
    try {
      const endpoint = apiConfig.endpoints.karyawan.list;
      const result = await httpService.get(endpoint);
      if (result.status !== "success") throw new Error(result.message || "API error");
      // Map to dropdown format
      const options = (result.data || []).map((item) => ({
        value: item.id,
        label: item.nama,
      }));
      karyawanOptions.value = options;
    } catch (err) {
      showError("Gagal mengambil data karyawan");
      karyawanOptions.value = [];
      console.error("Fetch karyawan dropdown error:", err);
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
        include: "m_gen,m_kary,m_penghuni",
      };
      // Append server-side raw ordering if set
      if (sortState.value.sortBy) {
        const direction = sortState.value.sortDesc ? "DESC" : "ASC";
        const allowed = TABLE_COLUMNS.map((c) => c.value).filter(Boolean);
        if (allowed.includes(sortState.value.sortBy)) {
          params.order_by_raw = `${sortState.value.sortBy} ${direction}`;
        }
      }
      const endpoint = apiConfig.endpoints.history_kesehatan.list;
      const result = await httpService.get(endpoint, { params });
      if (result.status !== "success") throw new Error(result.message || "API error");
      const items = result.data || [];

      // Ensure we have penghuni/karyawan/jenisLaporan options cached so we can map ids to labels
      if (!penghuniOptions.value || penghuniOptions.value.length === 0) await fetchPenghuniDropdown();
      if (!karyawanOptions.value || karyawanOptions.value.length === 0) await fetchKaryawanDropdown();
      if (!jenisLaporanOptions.value || jenisLaporanOptions.value.length === 0) await fetchJenisLaporanDropdown();

      // Build quick lookup maps
      const penghuniMap = (penghuniOptions.value || []).reduce((acc, cur) => {
        acc[cur.value] = cur.label;
        return acc;
      }, {});
      const karyawanMap = (karyawanOptions.value || []).reduce((acc, cur) => {
        acc[cur.value] = cur.label;
        return acc;
      }, {});
      const jenisMap = (jenisLaporanOptions.value || []).reduce((acc, cur) => {
        acc[cur.value] = cur.label;
        return acc;
      }, {});

      dataTables.value = items.map((item) => ({
        ...item,
        nama: item.m_penghuni?.nama || penghuniMap[item.m_penghuni_id] || item.nama || "",
        jenis_laporan_id: jenisMap[item.jenis_laporan_id] || jenisMap[item.jenis_laporan] || item.m_gen?.value1 || "-",
        m_kary_id: item.m_kary?.nama || karyawanMap[item.m_kary_id] || "-",
      }));
      pagination.value = {
        currentPage: result.pagination?.page || 1,
        pageSize: result.pagination?.limit || paginate,
        totalItems: result.pagination?.total || 0,
        totalPages: result.pagination?.totalPages || 1,
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
      const params = {
        include: "m_penghuni,m_kary,m_gen",
      };
      const endpoint = apiConfig.endpoints.history_kesehatan.show(id);
      const result = await httpService.get(endpoint, { params });
      if (result.status !== "success") throw new Error(result.message || "API error");
      return result.data;
    } catch (err) {
      showError("Gagal mengambil data user default");
      console.error("Fetch by id error:", err);
      return null;
    }
  };

  /**
   * Save history kesehatan (create or update)
   */
  const saveData = async () => {
    if (formLoading.value) return; // Prevent multiple submissions
    formLoading.value = true;
    try {
      // Build request body for History Kesehatan
      const body = {
        m_penghuni_id: formData.value.m_penghuni_id || undefined,
        m_kary_id: formData.value.m_kary_id || undefined,
        jenis_laporan_id: formData.value.jenis_laporan_id || undefined,
        tgl_laporan: formData.value.tgl_laporan || undefined,
        laporan: formData.value.laporan || undefined,
        status: typeof formData.value.status === "boolean" ? formData.value.status : undefined,
      };
      Object.keys(body).forEach((key) => body[key] === undefined && delete body[key]);
      let endpoint = apiConfig.endpoints.history_kesehatan.create;
      let result;
      if (isEditMode.value && selectedItem.value) {
        endpoint = apiConfig.endpoints.history_kesehatan.update(selectedItem.value.id);
        result = await httpService.put(endpoint, body);
      } else {
        result = await httpService.post(endpoint, body);
      }
      if (result.status !== "success") throw new Error(result.message || "API error");
      showSuccess(isEditMode.value ? "History kesehatan updated successfully" : `History kesehatan ${isCopyMode.value ? "copied" : "created"} successfully`);
      closeForm();
      clearURL();
      // Refresh list after save
      fetchDataTables(pagination.value.currentPage, pagination.value.pageSize);
    } catch (err) {
      const action = isEditMode.value ? "update" : "save";
      showError(`Failed to ${action} history kesehatan`);
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
      const endpoint = apiConfig.endpoints.history_kesehatan.delete(item.id);
      const result = await httpService.delete(endpoint);
      if (result.status !== "success") throw new Error(result.message || "API error");
      showSuccess("History kesehatan deleted successfully");
      // Refresh list after delete
      fetchDataTables(pagination.value.currentPage, pagination.value.pageSize);
      selectedItem.value = null;
    } catch (err) {
      showError("Failed to delete history kesehatan");
      console.error("Delete error:", err);
    }
  };

  // === FORM MANAGEMENT ===
  /**
   * Open form with specified mode and data
   */
  const openForm = async (mode, item = null) => {
    formMode.value = mode;
    // Fetch dropdown options hanya saat form dibuka
    await Promise.all([fetchPenghuniDropdown(), fetchKaryawanDropdown(), fetchJenisLaporanDropdown()]);

    if (mode === "create") {
      resetForm();
    } else if (item) {
      selectedItem.value = item;
      formData.value = mode === "copy" ? { ...item, id: undefined } : { ...item };
      // Normalisasi tgl_laporan agar selalu YYYY-MM-DD untuk input type="date"
      if (formData.value.tgl_laporan) {
        formData.value.tgl_laporan = normalizeDateToInput(formData.value.tgl_laporan);
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
      title: "Delete History Kesehatan",
      message: `Are you sure you want to delete this history kesehatan record? This action cannot be undone.`,
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

  // === DETAIL SELECT MODAL LOGIC (untuk dipakai di view jika diperlukan) ===
  const showSelectModal = ref(false);
  const selectedRows = ref([]);
  const modalSelectOptions = ref([]);
  const selectColumns = [
    { text: "Company", value: "company" }, // hanya tampilkan text
    { text: "Responsibility", value: "responsibility" }, // hanya tampilkan text
    { text: "isPrimary", value: "isPrimary" },
    { text: "Status", value: "status" },
  ];

  // function handleAddToList() {
  //   showSelectModal.value = true;
  //   fetchKaryawanOptions(); // fetch data setiap kali modal dibuka
  // }

  // Fetch responsibility data for select modal (if needed)
  async function fetchModalKaryawanOptions() {
    try {
      const endpoint = apiConfig.endpoints.responsibility.list;
      const params = { include: "m_unit_bussiness" };
      const result = await httpService.get(endpoint, { params });
      if (result.status !== "success") throw new Error(result.message || "API error");
      // Map API data to modalSelectOptions format
      modalSelectOptions.value = (result.data || []).map((item) => ({
        id: item.id,
        company: item.m_unit_bussiness?.comp_name || "-",
        responsibility: item.name,
        responsensibility_id: item.id, // id untuk dipakai di detailListForm
        isPrimary: false, // default, bisa diubah saat select
        status: item.status,
      }));
    } catch (err) {
      showError("Gagal mengambil data responsibility");
      modalSelectOptions.value = [];
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
      await openForm("create");
    } else if (["edit", "view", "copy"].includes(action) && itemId) {
      // Selalu fetch by id dari backend
      const item = await fetchDataById(itemId);
      if (item) {
        await openForm(action, item);
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
    // userTypeOptions: jenisLaporanTypeDropdown,

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

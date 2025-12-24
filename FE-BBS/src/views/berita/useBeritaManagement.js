import { ref, computed, onMounted, h, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useSnackbar } from "@/composables/useSnackbar.js";
import Badge from "@/components/Badge.vue";
import { apiConfig } from "@/config/api.js";
import { httpService } from "@/services/httpService.js";
import { pl } from "element-plus/es/locales.mjs";

/**
 * Composable for managing berita operations
 * Handles CRUD operations, filtering, pagination, and form management
 */
export function useBeritaManagement() {
  // Debouncing for search
  let searchTimeout = null;
  const router = useRouter();
  const route = useRoute();
  const { showSuccess, showError } = useSnackbar();

  // === REACTIVE STATE ===
  const searchTerm = ref("");
  const statusFilter = ref("all");
  const selectedItem = ref(null);
  const showForm = ref(false);
  const formLoading = ref(false);
  const pagination = ref({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1,
  });
  const dataTables = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Sorting state for server-side ordering
  const sortState = ref({ sortBy: null, sortDesc: false });

  const gambarPreview = ref("");

  // Dropdown kategori berita
  const kategoriOptions = ref([]);

  const confirmModal = ref({
    show: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    confirmVariant: "filled",
    onConfirm: () => {},
  });

  const formMode = ref("create");

  // Form data berita
  const initialFormData = {
    judul: "",
    isi_berita: "",
    gambar: "",
    kategori_id: "",
    status: true, // Tambahkan status, default aktif
  };
  const formData = ref({ ...initialFormData });

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

  // Table columns
  const TABLE_COLUMNS = [
    { text: "Judul", value: "judul", sortable: true },
    { text: "Kategori", value: "kategori_label", sortable: false },
    {
      text: "Status",
      value: "status",
      sortable: true,
      render: (value) => h(Badge, { color: value === true || value === 1 || value === "active" ? "green" : "red" }, () => (value === true || value === 1 || value === "active" ? "Active" : "Inactive")),
    },
    // { text: "Gambar", value: "gambar", sortable: false },
  ];

  // Form mode checkers
  const isEditMode = computed(() => formMode.value === "edit");
  const isViewMode = computed(() => formMode.value === "view");
  const isCopyMode = computed(() => formMode.value === "copy");
  const isCreateMode = computed(() => formMode.value === "create");

  // Dropdown options for form
  const selectOptions = computed(() => ({ kategori: kategoriOptions.value }));

  const formConfig = computed(() => {
    const configs = {
      create: {
        title: "Tambah Berita Baru",
        subtitle: "Buat berita baru",
        submitText: "Simpan Berita",
        readonly: false,
      },
      edit: {
        title: "Edit Berita",
        subtitle: "Ubah data berita",
        submitText: "Update Berita",
        readonly: false,
      },
      view: {
        title: "Detail Berita",
        subtitle: "Lihat detail berita",
        submitText: null,
        readonly: true,
      },
      copy: {
        title: "Copy Berita",
        subtitle: "Salin data berita",
        submitText: "Simpan Salinan",
        readonly: false,
      },
    };
    return configs[formMode.value] || configs.create;
  });

  // Dropdown status untuk form
  const statusOptions = [
    { value: true, label: "Active" },
    { value: false, label: "Inactive" },
  ];

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

  // Fetch kategori dari m_gen (group = 'kategori')
  async function fetchKategoriDropdown() {
    try {
      const response = await httpService.get(apiConfig.endpoints.general.list, { params: { filter_column_group: "kategori", limit: 1000 } });
      if (response.status !== "success") throw new Error(response.message || "API error");
      kategoriOptions.value = (response.data || []).filter((item) => item.group === "kategori" && (item.status === true || item.status === 1 || item.status === "active")).map((item) => ({ value: item.id, label: item.value1 }));
    } catch (err) {
      showError("Gagal mengambil data kategori");
      kategoriOptions.value = [];
      console.error("Fetch kategori dropdown error:", err);
    }
  }

  // Fetch berita list
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
        searchfield: "judul",
        page,
        limit: paginate,
        include: "m_gen",
      };
      // Append server-side raw ordering if set and allowed
      if (sortState.value.sortBy) {
        const direction = sortState.value.sortDesc ? "DESC" : "ASC";
        const allowed = TABLE_COLUMNS.map((c) => c.value).filter(Boolean);
        if (allowed.includes(sortState.value.sortBy)) {
          params.order_by_raw = `${sortState.value.sortBy} ${direction}`;
        }
      }
      const response = await httpService.get(apiConfig.endpoints.berita.list, { params });
      if (response.status !== "success") throw new Error(response.message || "API error");
      dataTables.value = (response.data || []).map((item) => {
        // Prefer included kategori object, otherwise lookup from kategoriOptions by kategori_id, then fallback
        const fromOptions = kategoriOptions.value.find((opt) => opt.value === item.kategori_id);
        const kategoriLabel = item.kategori?.value1 || (fromOptions ? fromOptions.label : item.kategori || "-");
        return {
          ...item,
          kategori_label: kategoriLabel,
        };
      });
      pagination.value = {
        currentPage: response.pagination?.page || 1,
        pageSize: response.pagination?.limit || paginate,
        totalItems: response.pagination?.total || 0,
        totalPages: response.pagination?.totalPages || 1,
      };
    } catch (err) {
      error.value = err.message || "Failed to fetch berita";
      showError("Failed to fetch berita");
      console.error("Fetch error:", err);
    } finally {
      loading.value = false;
    }
  };

  // Fetch berita by id
  const fetchDataById = async (id) => {
    try {
      const response = await httpService.get(apiConfig.endpoints.berita.show(id), { params: { include: "m_gen" } });
      if (response.data?.gambar) {
        const base = apiConfig.baseURL.replace(/\/$/, "");
        gambarPreview.value = typeof response.data.gambar === "string" && response.data.gambar.startsWith("http") ? response.data.gambar : `${base}/${String(response.data.gambar).replace(/^\/+/, "")}`;
      } else {
        gambarPreview.value = null;
      }
      console.log("Gambar Preview:", gambarPreview.value);
      if (response.status !== "success") throw new Error(response.message || "API error");
      return response.data;
    } catch (err) {
      showError("Gagal mengambil data berita");
      console.error("Fetch by id error:", err);
      return null;
    }
  };

  // Save berita (create/update)
  const saveData = async () => {
    if (formLoading.value) return;
    formLoading.value = true;
    try {
      let body;
      let headers;
      // Deteksi jika gambarFile adalah file baru (File/Blob), jika string berarti tidak ada perubahan gambar
      const isFile = formData.value.gambarFile && (formData.value.gambarFile instanceof File || formData.value.gambarFile instanceof Blob);
      if (isFile) {
        body = new FormData();
        body.append("judul", formData.value.judul || "");
        body.append("isi_berita", formData.value.isi_berita || "");
        body.append("kategori_id", formData.value.kategori_id || "");
        body.append("gambar", formData.value.gambarFile);
        body.append("status", formData.value.status === false || formData.value.status === 0 || formData.value.status === "inactive" ? 0 : 1); // status sebagai 1/0
        headers = undefined;
      } else {
        const jsonBody = {
          judul: formData.value.judul || undefined,
          isi_berita: formData.value.isi_berita || undefined,
          kategori_id: formData.value.kategori_id || undefined,
          gambar: formData.value.gambar || undefined,
          status: formData.value.status === false || formData.value.status === 0 || formData.value.status === "inactive" ? 0 : 1,
        };
        Object.keys(jsonBody).forEach((key) => jsonBody[key] === undefined && delete jsonBody[key]);
        body = JSON.stringify(jsonBody);
        headers = { "Content-Type": "application/json" };
      }
      let result;
      const endpoint = isEditMode.value && selectedItem.value ? apiConfig.endpoints.berita.update(selectedItem.value.id) : apiConfig.endpoints.berita.create;
      if (isFile) {
        // For FormData uploads use native fetch and apiConfig.baseURL
        const url = `${apiConfig.baseURL.replace(/\/$/, "")}${endpoint}`;
        const response = await fetch(url, {
          method: isEditMode.value && selectedItem.value ? "PUT" : "POST",
          body,
        });
        if (!response.ok) throw new Error("Failed to save berita");
        result = await response.json();
      } else {
        if (isEditMode.value && selectedItem.value) {
          result = await httpService.put(endpoint, JSON.parse(body));
        } else {
          result = await httpService.post(endpoint, JSON.parse(body));
        }
      }
      if (result.status !== "success") throw new Error(result.message || "API error");
      showSuccess(isEditMode.value ? "Berita berhasil diupdate" : `Berita ${isCopyMode.value ? "disalin" : "ditambahkan"} berhasil`);
      closeForm();
      clearURL();
      fetchDataTables(pagination.value.currentPage, pagination.value.pageSize);
    } catch (err) {
      const action = isEditMode.value ? "update" : "save";
      showError(`Failed to ${action} berita`);
      console.error("Save error:", err);
    } finally {
      formLoading.value = false;
    }
  };

  // === FORM MANAGEMENT ===
  /**
   * Open form with specified mode and data
   */
  const openForm = async (mode, item = null) => {
    formMode.value = mode;
    await fetchKategoriDropdown();
    if (mode === "create") {
      resetForm();
      formData.value.status = true; // default aktif saat create
    } else if (item) {
      selectedItem.value = item;
      formData.value = mode === "copy" ? { ...item, id: undefined } : { ...item };
      // Normalize gambar for preview in edit/view modes
      try {
        const origin = typeof window !== "undefined" && window.location && window.location.origin ? window.location.origin : "";
        let baseUrl = apiConfig.baseURL.replace(/\/api\/?$/, "").replace(/\/$/, "");
        if (!baseUrl) baseUrl = origin;
        if (formData.value.gambar) {
          if (typeof formData.value.gambar === "string" && formData.value.gambar.startsWith("http")) {
            gambarPreview.value = formData.value.gambar;
          } else {
            const path = String(formData.value.gambar).replace(/^\/+/, "");
            gambarPreview.value = `${baseUrl.replace(/\/$/, "")}/${path}`;
            formData.value.gambar = gambarPreview.value;
          }
        } else {
          gambarPreview.value = "";
        }
      } catch (e) {
        console.warn("Error normalizing gambar for preview", e);
      }
      // Pastikan status selalu boolean/number
      if (formData.value.status === undefined) formData.value.status = true;
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
  const handleAdd = async () => {
    updateURL("add");
    await openForm("create");
  };

  /**
   * Handle edit selected item
   */
  const handleEdit = async (item = null) => {
    const target = item || selectedItem.value;
    if (!target || !target.id) return;
    const data = await fetchDataById(target.id);
    if (data && data.id) {
      selectedItem.value = data;
      await openForm("edit", data);
      updateURL("edit", data.id);
    } else {
      showError("Data tidak ditemukan");
    }
  };

  /**
   * Handle view selected item
   */
  const handleView = async (item = null) => {
    const target = item || selectedItem.value;
    if (!target || !target.id) return;
    const data = await fetchDataById(target.id);
    if (data && data.id) {
      selectedItem.value = data;
      await openForm("view", data);
      updateURL("view", data.id);
    } else {
      showError("Data tidak ditemukan");
    }
  };

  /**
   * Handle copy selected item
   */
  const handleCopy = async (item = null) => {
    const target = item || selectedItem.value;
    if (!target || !target.id) return;
    const data = await fetchDataById(target.id);
    if (data && data.id) {
      selectedItem.value = data;
      await openForm("copy", data);
      updateURL("copy", data.id);
    } else {
      showError("Data tidak ditemukan");
    }
  };

  /**
   * Handle delete selected item
   */
  const handleDelete = (item = null) => {
    const target = item || selectedItem.value;
    if (!target || !target.id) return;
    fetchDataById(target.id).then((data) => {
      if (data && data.id) {
        selectedItem.value = data;
        showConfirmation({
          title: "Delete Berita",
          message: `Are you sure you want to delete this berita record? This action cannot be undone.`,
          confirmText: "Delete",
          confirmVariant: "filled",
          onConfirm: () => {
            deleteBerita(data);
            hideConfirmation();
          },
        });
      } else {
        showError("Data tidak ditemukan");
      }
    });
  };

  /**
   * Delete berita by id
   */
  const deleteBerita = async (item) => {
    if (!item?.id) return;
    try {
      const response = await fetch(buildApiUrl(apiConfig.endpoints.berita.delete(item.id)), {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to delete berita");
      const result = await response.json();
      if (result.status !== "success") throw new Error(result.message || "API error");
      showSuccess("Berita berhasil dihapus");
      fetchDataTables(pagination.value.currentPage, pagination.value.pageSize);
      selectedItem.value = null;
    } catch (err) {
      showError("Gagal menghapus berita");
      console.error("Delete error:", err);
    }
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
  const handleFilterChange = (value) => {
    statusFilter.value = value;
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

  watch(() => route.query, detectActionFromURL);

  /**
   * Handle row click in table (hanya select, tidak buka form)
   */
  const handleRowClick = (item) => {
    selectedItem.value = item;
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
    dataTables,
    loading,
    error,

    // === Computed Properties ===
    formConfig,
    isEditMode,
    isViewMode,
    isCopyMode,
    isCreateMode,
    selectOptions,
    columns: TABLE_COLUMNS,
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
    handleRowClick,
    handleFilterChange,
    gambarPreview,
    // === Additional Options ===
    statusOptions,
    filterOptions: FILTER_OPTIONS,
  };
}

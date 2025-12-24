import { ref, computed, onMounted, watch, h } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useSnackbar } from "@/composables/useSnackbar.js";
import { apiConfig } from "@/config/api.js";
import { httpService } from "@/services/httpService.js";
import Badge from "@/components/Badge.vue";

/**
 * Composable for managing galery operations
 * Handles CRUD operations, filtering, pagination, and form management
 */
export function useGaleryManagement() {
  // Debouncing for search
  let searchTimeout = null;
  const router = useRouter();
  const route = useRoute();

  const gambarPreview = ref(null);
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

  // Data management
  const dataTables = ref([]);
  const loading = ref(false);
  const error = ref(null);
  // Server-side sort state (field name and direction)
  const sortState = ref({ sortBy: null, sortDesc: false });

  // Dropdown kategori galery
  const kategoriOptions = ref([]);

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

  // Form data with default values for Galery
  const initialFormData = {
    judul: "",
    gambar: "",
    kategori_id: "",
    status: true,
    gambarFile: null,
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

  // Table column configuration for Galery
  const TABLE_COLUMNS = [
    { text: "Judul", value: "judul", sortable: true },
    { text: "Kategori", value: "kategori_label", sortable: false },
    // {
    //   text: "Gambar",
    //   value: "gambar",
    //   sortable: true,
    //   render: (value, item) => {
    //     if (!value) return "-";
    //     return h("img", {
    //       src: value,
    //       alt: item?.judul || "gambar",
    //       style: "width:64px; height:40px; object-fit:cover; border-radius:4px",
    //     });
    //   },
    // },
    {
      text: "Status",
      value: "status",
      sortable: true,
      render: (value) => {
        const color = value === true || value === 1 || value === "active" ? "green" : "red";
        const label = value === true || value === 1 || value === "active" ? "Active" : "Inactive";
        return h(Badge, { color }, () => label);
      },
    },
  ];

  // === COMPUTED PROPERTIES ===
  // Form mode checkers
  const isEditMode = computed(() => formMode.value === "edit");
  const isViewMode = computed(() => formMode.value === "view");
  const isCopyMode = computed(() => formMode.value === "copy");
  const isCreateMode = computed(() => formMode.value === "create");

  // Combined dropdown options for form
  const selectOptions = computed(() => ({
    kategori: kategoriOptions.value,
  }));

  // Form configuration based on mode
  const formConfig = computed(() => {
    const configs = {
      create: {
        title: "Tambah Galery",
        subtitle: "Buat galery baru",
        submitText: "Tambah Galery",
        readonly: false,
      },
      edit: {
        title: "Edit Galery",
        subtitle: "Ubah data galery",
        submitText: "Update Galery",
        readonly: false,
      },
      view: {
        title: "Detail Galery",
        subtitle: "Lihat detail galery",
        submitText: null,
        readonly: true,
      },
      copy: {
        title: "Copy Galery",
        subtitle: "Salin galery",
        submitText: "Salin Galery",
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
    gambarPreview.value = null;
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
  // Fetch kategori galery dari m_gen (group = 'kategori')
  async function fetchKategoriDropdown() {
    try {
      const response = await httpService.get(apiConfig.endpoints.general.list, { params: { filter_column_group: "kategori", limit: 1000 } });
      if (response.status !== "success") throw new Error(response.message || "API error");
      kategoriOptions.value = (response.data || []).filter((item) => item.group === "kategori" && (item.status === true || item.status === 1 || item.status === "active")).map((item) => ({ value: item.id || item.key1, label: item.value1 }));
    } catch (err) {
      showError("Gagal mengambil data kategori");
      kategoriOptions.value = [];
      console.error("Fetch kategori galery error:", err);
    }
  }

  // === API METHODS ===
  /**
   * Fetch galery list
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
        searchfield: "judul",
        page,
        limit: paginate,
        include: "m_gen",
      };

      // If sort is active and the field is allowed, add order_by_raw param
      try {
        const allowed = TABLE_COLUMNS.map((c) => c.value).filter(Boolean);
        if (sortState.value.sortBy && allowed.includes(sortState.value.sortBy)) {
          const direction = sortState.value.sortDesc ? "DESC" : "ASC";
          params.order_by_raw = `${sortState.value.sortBy} ${direction}`;
        }
      } catch (e) {
        // defensive: don't break fetching if something unexpected happens
        console.error("Error building order_by_raw:", e);
      }
      const response = await httpService.get(apiConfig.endpoints.galery.list, { params });
      if (response.status !== "success") throw new Error(response.message || "API error");
      const baseUrl = apiConfig.baseURL.replace(/\/api\/?$/, "").replace(/\/$/, "");
      dataTables.value = (response.data || []).map((item) => {
        // Prefer included kategori object, otherwise lookup from kategoriOptions by kategori_id, then fallback
        const fromOptions = kategoriOptions.value.find((opt) => opt.value === item.kategori_id);
        const kategoriLabel = item.kategori?.value1 || (fromOptions ? fromOptions.label : item.kategori || "-");
        return {
          ...item,
          kategori_label: kategoriLabel,
          gambar: item.gambar ? (typeof item.gambar === "string" && item.gambar.startsWith("http") ? item.gambar : `${baseUrl}/${String(item.gambar).replace(/^\/+/, "")}`) : null,
        };
      });
      pagination.value = {
        currentPage: response.pagination?.page || 1,
        pageSize: response.pagination?.limit || paginate,
        totalItems: response.pagination?.total || 0,
        totalPages: response.pagination?.totalPages || 1,
      };
    } catch (err) {
      error.value = err.message || "Failed to fetch galery items";
      showError("Failed to fetch galery items");
      console.error("Fetch error:", err);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Fetch galery by id
   */
  const fetchDataById = async (id) => {
    try {
      const response = await httpService.get(apiConfig.endpoints.galery.show(id), { params: { include: "m_gen" } });
      const baseUrl = apiConfig.baseURL.replace(/\/api\/?$/, "").replace(/\/$/, "");
      if (response.data?.gambar) {
        gambarPreview.value = typeof response.data.gambar === "string" && response.data.gambar.startsWith("http") ? response.data.gambar : `${baseUrl}/${String(response.data.gambar).replace(/^\/+/, "")}`;
      } else {
        gambarPreview.value = null;
      }
      console.log("Gambar Preview:", gambarPreview.value);
      if (response.status !== "success") throw new Error(response.message || "API error");
      return response.data;
    } catch (err) {
      showError("Gagal mengambil data galery");
      console.error("Fetch by id error:", err);
      return null;
    }
  };

  /**
   * Save galery (create or update)
   */
  const saveData = async () => {
    if (formLoading.value) return;
    formLoading.value = true;
    try {
      let body;
      let headers;
      // Handle file upload for gambar
      const isFile = formData.value.gambarFile && (formData.value.gambarFile instanceof File || formData.value.gambarFile instanceof Blob);
      if (isFile) {
        body = new FormData();
        body.append("judul", formData.value.judul || "");
        body.append("kategori_id", formData.value.kategori_id || "");
        body.append("gambar", formData.value.gambarFile);
        body.append("status", formData.value.status ? 1 : 0);
        headers = undefined;
      } else {
        const jsonBody = {
          judul: formData.value.judul || undefined,
          kategori_id: formData.value.kategori_id || undefined,
          gambar: formData.value.gambar || undefined,
          status: formData.value.status === false ? 0 : 1,
        };
        Object.keys(jsonBody).forEach((key) => jsonBody[key] === undefined && delete jsonBody[key]);
        body = JSON.stringify(jsonBody);
        headers = { "Content-Type": "application/json" };
      }
      let result;
      const endpoint = isEditMode.value && selectedItem.value ? apiConfig.endpoints.galery.update(selectedItem.value.id) : apiConfig.endpoints.galery.create;
      if (isFile) {
        const url = `${apiConfig.baseURL.replace(/\/$/, "")}${endpoint}`;
        const response = await fetch(url, { method: isEditMode.value && selectedItem.value ? "PUT" : "POST", body });
        if (!response.ok) throw new Error("Failed to save galery");
        result = await response.json();
      } else {
        if (isEditMode.value && selectedItem.value) {
          result = await httpService.put(endpoint, JSON.parse(body));
        } else {
          result = await httpService.post(endpoint, JSON.parse(body));
        }
      }
      if (result.status !== "success") throw new Error(result.message || "API error");
      showSuccess(isEditMode.value ? "Galery berhasil diupdate" : `Galery ${isCopyMode.value ? "disalin" : "ditambahkan"} berhasil`);
      closeForm();
      clearURL();
      fetchDataTables(pagination.value.currentPage, pagination.value.pageSize);
    } catch (err) {
      const action = isEditMode.value ? "update" : "save";
      showError(`Failed to ${action} galery`);
      console.error("Save error:", err);
    } finally {
      formLoading.value = false;
    }
  };

  /**
   * Delete galery
   */
  const deleteGalery = async (item) => {
    try {
      // TODO: Replace with actual API call
      // await simulateApiCall(500);
      const result = await httpService.delete(apiConfig.endpoints.galery.delete(item.id));
      if (result.status !== "success") throw new Error(result.message || "API error");
      showSuccess("Galery berhasil dihapus");
      fetchDataTables(pagination.value.currentPage, pagination.value.pageSize);
      selectedItem.value = null;
    } catch (err) {
      showError("Failed to delete galery");
      console.error("Delete error:", err);
    }
  };

  // === FORM MANAGEMENT ===
  /**
   * Cancel gambar preview dan file
   */
  const cancelGambar = () => {
    gambarPreview.value = null;
    formData.value.gambar = "";
    formData.value.gambarFile = null;
  };
  /**
   * Open form with specified mode and data
   */
  const openForm = async (mode, item = null) => {
    formMode.value = mode;
    await fetchKategoriDropdown();
    if (mode === "create") {
      resetForm();
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
            // assume stored path like 'uploads/...' or '/uploads/...'
            const path = String(formData.value.gambar).replace(/^\/+/, "");
            gambarPreview.value = `${baseUrl.replace(/\/$/, "")}/${path}`;
            formData.value.gambar = gambarPreview.value;
          }
        } else {
          gambarPreview.value = null;
        }
      } catch (e) {
        console.warn("Error normalizing gambar for preview", e);
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
  const handleAdd = async () => {
    updateURL("add");
    await openForm("create");
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
      title: "Hapus Galery",
      message: `Yakin ingin menghapus galery ini? Tindakan ini tidak dapat dibatalkan.`,
      confirmText: "Hapus",
      confirmVariant: "filled",
      onConfirm: () => {
        deleteGalery(selectedItem.value);
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
    // Support both emit shapes: (column, direction) or ({ column, direction })
    let column = null;
    let direction = null;
    if (a && typeof a === "object" && a.column !== undefined) {
      column = a.column;
      direction = a.direction;
    } else {
      column = a;
      direction = b;
    }

    // Normalize direction: could be boolean (desc) or string
    const sortDesc = typeof direction === "string" ? direction.toLowerCase() === "desc" : !!direction;
    sortState.value.sortBy = column;
    sortState.value.sortDesc = sortDesc;

    // Reset to page 1 and refetch
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

  const detectActionFromURL = async () => {
    const action = route.query.action;
    const itemId = route.query.id;
    if (!action) {
      showForm.value = false;
      resetForm();
      fetchDataTables();
      return;
    }
    if (action === "add") {
      await openForm("create");
    } else if (["edit", "view", "copy"].includes(action) && itemId) {
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
    loading,
    error,
    dataTables,
    formConfig,
    isEditMode,
    isViewMode,
    isCopyMode,
    isCreateMode,
    filterOptions: FILTER_OPTIONS,
    columns: TABLE_COLUMNS,
    currentPage: computed(() => pagination.value.currentPage),
    pageSize: computed(() => pagination.value.pageSize),
    totalItems: computed(() => pagination.value.totalItems),
    totalPages: computed(() => pagination.value.totalPages),
    showConfirmModal: computed({
      get: () => confirmModal.value.show,
      set: (val) => {
        confirmModal.value.show = val;
      },
    }),
    confirmModalConfig: computed(() => confirmModal.value),
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
    gambarPreview,
    cancelGambar,
    handleDelete,
    handleCancel,
    handleFormSubmit,
    selectOptions,
  };
}

import { ref, computed, onMounted, h, watch, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";
import Badge from "@/components/Badge.vue";
import { useSnackbar } from "@/composables/useSnackbar.js";
import { apiConfig } from "@/config/api.js";
import { httpService } from "@/services/httpService.js";

/**
 * Composable for managing Angpao
 * Handles CRUD operations, filtering, pagination, and form management for Angpao data
 */
export function useAngpaoManagement() {
  // === UTILITY: Rupiah Formatter ===
  function formatRupiah(value) {
    if (typeof value !== "number") value = parseFloat(value) || 0;
    return value.toLocaleString("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 });
  }
  // Debouncing for search
  let searchTimeout = null;
  const router = useRouter();
  const route = useRoute();
  const { showSuccess, showError } = useSnackbar();

  // === REACTIVE STATE ===
  // Search
  const searchTerm = ref("");

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

  // Dropdowns
  const userTypeOptions = ref([]);
  const jenisTransaksiOptions = ref([]);
  const penghuniOptions = ref([]);

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
    m_penghuni_id: "",
    balance: 0,
  };
  const formData = ref({ ...initialFormData });

  // === DETAIL LIST ===
  const detailListForm = ref([]);
  // Make columns a computed property so options are always up-to-date
  const detailListColumns = computed(() => [
    { text: "Tanggal", value: "tanggal", type: "date", editable: true },
    { text: "Jenis Transaksi", value: "jenis_transaksi_id", type: "select", editable: true, options: jenisTransaksiOptions.value },
    { text: "Jumlah", value: "balance", type: "number", editable: true },
    { text: "Keterangan", value: "catatan_transaksi", type: "text", editable: true },
    { text: "Aksi", value: "action", type: "action", editable: false },
  ]);

  // === CONFIGURATION ===
  const TABLE_COLUMNS = [
    { text: "Penghuni", value: "penghuni_nama", sortable: false },
    {
      text: "Balance",
      value: "balance",
      sortable: true,
      render: (value) => formatRupiah(value),
    },
  ];

  // === COMPUTED PROPERTIES ===
  const isEditMode = computed(() => formMode.value === "edit");
  const isViewMode = computed(() => formMode.value === "view");
  const isCopyMode = computed(() => formMode.value === "copy");
  const isCreateMode = computed(() => formMode.value === "create");
  const formConfig = computed(() => {
    const configs = {
      create: { title: "Tambah Angpao", subtitle: "Buat data angpao baru", submitText: "Simpan Angpao", readonly: false },
      edit: { title: "Edit Angpao", subtitle: "Ubah data angpao", submitText: "Update Angpao", readonly: false },
      view: { title: "Detail Angpao", subtitle: "Lihat detail angpao", submitText: null, readonly: true },
      copy: { title: "Copy Angpao", subtitle: "Salin data angpao", submitText: "Simpan Salinan", readonly: false },
    };
    return configs[formMode.value] || configs.create;
  });
  const isFormReadonly = computed(() => formConfig.value.readonly);

  // === UTILITY METHODS ===
  const resetForm = () => {
    formData.value = { ...initialFormData };
    selectedItem.value = null;
    formMode.value = "create";
  };
  const showConfirmation = (config) => {
    confirmModal.value = { ...confirmModal.value, ...config, show: true };
  };
  const hideConfirmation = () => {
    confirmModal.value.show = false;
  };
  const normalizeDateToInput = (dateStr) => {
    if (!dateStr) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${mm}-${dd}`;
  };

  // === API ENDPOINTS [DROPDOWN FETCHING] ===
  async function fetchPenghuniOptions() {
    try {
      const response = await httpService.get(apiConfig.endpoints.penghuni.list);
      if (response.status !== "success") throw new Error(response.message || "API error");
      penghuniOptions.value = (response.data || []).map((item) => ({ value: item.id, label: item.nama }));
    } catch (err) {
      showError("Gagal mengambil data penghuni");
      penghuniOptions.value = [];
    }
  }
  async function fetchJenisTransaksiOptions() {
    try {
      const response = await httpService.get(apiConfig.endpoints.general.list);
      if (response.status !== "success") throw new Error(response.message || "API error");
      const items = response.data || [];
      jenisTransaksiOptions.value = items.filter((item) => item.group === "jenis_transaksi").map((item) => ({ value: item.id, label: item.value1 || item.value2 || item.code }));
    } catch (err) {
      showError("Gagal mengambil data jenis transaksi");
      jenisTransaksiOptions.value = [];
    }
  }

  // === INITIALIZATION ===
  const addDetailListRow = () => {
    detailListForm.value.push({
      tanggal: new Date().toISOString().split("T")[0],
      jenis_transaksi_id: "",
      balance: 0,
      catatan_transaksi: "",
    });
  };
  const removeDetailListRow = (idx) => {
    if (typeof idx === "number" && idx >= 0 && idx < detailListForm.value.length) {
      detailListForm.value.splice(idx, 1);
    }
  };

  // === API METHODS ===
  const fetchDataTables = async (page = 1, paginate = 10) => {
    if (loading.value) return;
    loading.value = true;
    error.value = null;
    try {
      const params = {
        ...(searchTerm.value.trim() && { search: searchTerm.value.trim() }),
        searchfield: "",
        page,
        limit: paginate,
        include: "m_penghuni,t_angpao_d",
      };
      // Append server-side raw ordering if set
      if (sortState.value.sortBy) {
        const direction = sortState.value.sortDesc ? "DESC" : "ASC";
        const allowed = TABLE_COLUMNS.map((c) => c.value).filter(Boolean);
        if (allowed.includes(sortState.value.sortBy)) {
          params.order_by_raw = `${sortState.value.sortBy} ${direction}`;
        }
      }
      const response = await httpService.get(apiConfig.endpoints.angpao.list, { params });
      if (response.status !== "success") throw new Error(response.message || "API error");
      dataTables.value = (response.data || []).map((item) => {
        // Hitung balance dari t_angpao_ds
        let calculatedBalance = 0;
        if (Array.isArray(item.t_angpao_ds)) {
          calculatedBalance = item.t_angpao_ds.reduce((sum, detail) => {
            const jenis = jenisTransaksiOptions.value.find((opt) => opt.value === detail.jenis_transaksi_id);
            const label = (jenis?.label || "").toLowerCase();
            if (label.includes("debit") || label.includes("penarikan") || label.includes("tarik") || label.includes("pinjam")) {
              return sum - (Number(detail.balance) || 0);
            } else if (label.includes("kredit") || label.includes("setoran") || label.includes("deposit")) {
              return sum + (Number(detail.balance) || 0);
            }
            return sum;
          }, 0);
        }
        return {
          ...item,
          penghuni_nama: item.m_penghuni?.nama || item.nama || "",
          balance: calculatedBalance || parseFloat(item.balance) || 0,
        };
      });
      pagination.value = {
        currentPage: response.pagination?.page || 1,
        pageSize: response.pagination?.limit || paginate,
        totalItems: response.pagination?.total || 0,
        totalPages: response.pagination?.totalPages || 1,
      };
    } catch (err) {
      error.value = err.message || "Failed to fetch angpao list";
      showError("Failed to fetch angpao list");
    } finally {
      loading.value = false;
    }
  };
  const fetchDataById = async (id) => {
    try {
      const response = await httpService.get(apiConfig.endpoints.angpao.show(id), { params: { include: "m_penghuni,t_angpao_d" } });
      if (response.status !== "success") throw new Error(response.message || "API error");
      return response.data;
    } catch (err) {
      showError("Gagal mengambil data angpao");
      return null;
    }
  };
  const saveData = async () => {
    if (formLoading.value) return;
    // Validasi: penghuni harus dipilih
    if (!formData.value.m_penghuni_id) {
      showError("Penghuni harus dipilih!");
      return;
    }
    formLoading.value = true;
    try {
      const body = {
        m_penghuni_id: formData.value.m_penghuni_id,
        balance: formData.value.balance,
        t_angpao_ds: detailListForm.value.map((item) => ({
          tgl_transaksi: item.tanggal, // mapping ke field backend
          jenis_transaksi_id: item.jenis_transaksi_id,
          balance: item.balance,
          catatan_transaksi: item.catatan_transaksi,
        })),
      };
      Object.keys(body).forEach((key) => (body[key] == null || body[key] === "") && delete body[key]);
      if (Array.isArray(body.t_angpao_ds)) {
        body.t_angpao_ds = body.t_angpao_ds.map((d) => {
          Object.keys(d).forEach((k) => (d[k] == null || d[k] === "") && delete d[k]);
          return d;
        });
      }
      let result;
      if (isEditMode.value && selectedItem.value) {
        result = await httpService.put(apiConfig.endpoints.angpao.updateWithDetails(selectedItem.value.id), body);
      } else {
        result = await httpService.post(apiConfig.endpoints.angpao.createWithDetails, body);
      }
      if (result.status !== "success") throw new Error(result.message || "API error");
      showSuccess(isEditMode.value ? "Angpao berhasil diupdate" : "Angpao berhasil disimpan");
      closeForm();
      clearURL();
      fetchDataTables(pagination.value.currentPage, pagination.value.pageSize);
    } catch (err) {
      showError("Gagal menyimpan angpao");
    } finally {
      formLoading.value = false;
    }
  };
  const deleteAngpao = async (item) => {
    try {
      const result = await httpService.delete(apiConfig.endpoints.angpao.delete(item.id));
      if (result.status !== "success") throw new Error(result.message || "API error");
      showSuccess("Angpao berhasil dihapus");
      fetchDataTables(pagination.value.currentPage, pagination.value.pageSize);
      selectedItem.value = null;
    } catch (err) {
      showError("Gagal menghapus angpao");
    }
  };

  // === FORM MANAGEMENT ===
  const openForm = async (mode, item = null) => {
    formMode.value = mode;
    await Promise.all([fetchPenghuniOptions(), fetchJenisTransaksiOptions()]);
    if (mode === "create") {
      resetForm();
      detailListForm.value = [];
    } else if (item) {
      selectedItem.value = item;
      // Set penghuni_id terlebih dahulu
      formData.value.m_penghuni_id = item.m_penghuni_id || "";
      // Load detail list
      if (Array.isArray(item.t_angpao_ds)) {
        detailListForm.value = item.t_angpao_ds.map((detail) => ({
          id: detail.id,
          tanggal: normalizeDateToInput(detail.tgl_transaksi),
          jenis_transaksi_id: detail.jenis_transaksi_id || "",
          balance: detail.balance || 0,
          catatan_transaksi: detail.catatan_transaksi || "-",
        }));
      } else {
        detailListForm.value = [];
      }
      // Hitung balance dari detail dengan jenisTransaksiOptions yang sudah ter-load
      await nextTick();
      let calculatedBalance = 0;
      if (Array.isArray(item.t_angpao_ds)) {
        calculatedBalance = item.t_angpao_ds.reduce((sum, detail) => {
          const jenis = jenisTransaksiOptions.value.find((opt) => opt.value === detail.jenis_transaksi_id);
          const label = (jenis?.label || "").toLowerCase();
          if (label.includes("debit") || label.includes("penarikan") || label.includes("tarik") || label.includes("pinjam")) {
            return sum - (Number(detail.balance) || 0);
          } else if (label.includes("kredit") || label.includes("setoran") || label.includes("deposit")) {
            return sum + (Number(detail.balance) || 0);
          }
          return sum;
        }, 0);
      }
      formData.value.balance = calculatedBalance || item.balance || 0;
      // Untuk mode copy, reset id
      if (mode === "copy") {
        formData.value.id = undefined;
      }
    }
    showForm.value = true;
  };
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
  const handleAdd = () => {
    updateURL("add");
    openForm("create");
  };
  const handleEdit = () => {
    if (!selectedItem.value) return;
    updateURL("edit", selectedItem.value.id);
  };
  const handleView = () => {
    if (!selectedItem.value) return;
    updateURL("view", selectedItem.value.id);
  };
  const handleCopy = () => {
    if (!selectedItem.value) return;
    updateURL("copy", selectedItem.value.id);
  };
  const handleDelete = () => {
    if (!selectedItem.value) return;
    showConfirmation({
      title: "Delete Angpao",
      message: `Yakin ingin menghapus angpao ini? Tindakan ini tidak dapat dibatalkan.`,
      confirmText: "Delete",
      confirmVariant: "filled",
      onConfirm: () => {
        deleteAngpao(selectedItem.value);
        hideConfirmation();
      },
    });
  };
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
  const handlePageChanged = (page) => {
    pagination.value.currentPage = page;
    fetchDataTables(page, pagination.value.pageSize);
  };
  const handlePageSizeChanged = (paginate) => {
    pagination.value.pageSize = paginate;
    pagination.value.currentPage = 1;
    fetchDataTables(1, paginate);
  };
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

    pagination.value.currentPage = 1;
    fetchDataTables(1, pagination.value.pageSize);
  };
  const handleFormSubmit = () => {
    if (isViewMode.value) return;
    saveData();
  };

  // === LIFECYCLE ===
  onMounted(() => {
    fetchPenghuniOptions();
    fetchJenisTransaksiOptions();
    fetchDataTables(); // Ensure data is fetched on mount
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
      openForm("create");
    } else if (["edit", "view", "copy"].includes(action) && itemId) {
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
  };
  watch(() => route.query, detectActionFromURL);

  // === WATCHERS & BALANCE LOGIC ===
  // Watch detailListForm dan jenisTransaksiOptions untuk update balance otomatis
  watch(
    [detailListForm, jenisTransaksiOptions],
    ([details, jenisOptions]) => {
      if (!Array.isArray(details) || details.length === 0) {
        formData.value.balance = 0;
        return;
      }
      let balance = 0;
      for (const item of details) {
        const jenis = jenisOptions.find((opt) => opt.value === item.jenis_transaksi_id);
        if (!jenis) continue;
        const label = (jenis.label || "").toLowerCase();
        const amount = Number(item.balance) || 0;
        // Debit: penarikan, pinjaman, tarik
        if (label.includes("debit") || label.includes("penarikan") || label.includes("tarik") || label.includes("pinjam")) {
          balance -= amount;
        }
        // Kredit: setoran, deposit
        else if (label.includes("kredit") || label.includes("setoran") || label.includes("deposit")) {
          balance += amount;
        }
      }
      formData.value.balance = balance;
    },
    { deep: true }
  );

  // === RETURN EXPOSED API ===
  return {
    // === Reactive State ===
    searchTerm,
    selectedItem,
    showForm,
    formLoading,
    formData,
    loading,
    error,
    dataTables,

    // === User Default Detail List ===
    detailListForm,
    detailListColumns,
    addDetailListRow,
    removeDetailListRow,

    // === Computed Properties ===
    formConfig,
    isEditMode,
    isViewMode,
    isCopyMode,
    isCreateMode,
    isFormReadonly,
    columns: TABLE_COLUMNS,
    userTypeOptions,

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

    // Expose options for use in the view
    penghuniOptions,
    jenisTransaksiOptions,
  };
}

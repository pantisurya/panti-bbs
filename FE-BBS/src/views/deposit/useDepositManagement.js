import { ref, computed, onMounted, h, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useSnackbar } from "@/composables/useSnackbar.js";
import Badge from "@/components/Badge.vue";
import { apiConfig, buildApiUrl } from "@/config/api.js";
import { pl } from "element-plus/es/locales.mjs";
import { httpService } from "@/services/httpService.js";

/**
 * Composable for managing user default operations
 * Handles CRUD operations, filtering, pagination, and form management
 */
export function useDepositManagement() {
  // Debouncing for search
  let searchTimeout = null;
  const router = useRouter();
  const route = useRoute();
  const { showSuccess, showError } = useSnackbar();

  // === REACTIVE STATE ===
  // Search and filtering
  const searchTerm = ref("");
  // statusFilter berisi UUID, statusFilterLabel berisi label
  const statusFilter = ref("all");
  const statusFilterLabel = ref("all");

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

  // Penghuni options for select dropdown
  const penghuniOptions = ref([]);

  // Status and Jenis Transaksi options
  const statusOptions = ref([]);
  const jenisTransaksiOptions = ref([]);

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

  const detailListForm = ref([]);
  console.log("detailListForm initialized:", detailListForm.length);
  // Form data with default values - Updated untuk status detection
  const initialFormData = {
    m_penghuni_id: "",
    balance: 0,
    status_id: detailListForm.length > 0 ? "d7e25459-4291-4333-b34a-b859b6b13bab" : "1985e7a2-c4ac-4723-9df7-8a9e22313371",
  };
  const formData = ref({ ...initialFormData });

  // === USER DEFAULT DETAIL LIST ===
  // List of detail items for deposit (t_deposit_ds)

  // Watch for changes in detailListForm to update status automatically
  watch(
    detailListForm,
    (newDetails) => {
      if (!newDetails || newDetails.length === 0) {
        formData.value.balance = 0;
        // Jika tidak ada transaksi, status "Belum Lunas"
        const statusOption = statusOptions.value.find((opt) => opt.label === "Belum Lunas");
        formData.value.status_id = statusOption ? statusOption.value : "";
        return;
      }

      // Opening balance dari transaksi pertama (ini adalah saldo deposit awal mereka)
      const openingBalance = parseFloat(newDetails[0]?.balance) || 0;

      // Hitung total kredit (setoran) dan debit (penarikan/pinjaman)
      const totalKredit = newDetails
        .filter((d) => {
          if (!d.jenis_transaksi_id) return false;
          const jenisOption = jenisTransaksiOptions.value.find((opt) => opt.value === d.jenis_transaksi_id);
          const jenisLabel = jenisOption?.label || "";
          const kind = classifyJenisLabel(jenisLabel);
          return kind === "credit";
        })
        .reduce((sum, d) => sum + (parseFloat(d.balance) || 0), 0);

      const totalDebit = newDetails
        .filter((d) => {
          if (!d.jenis_transaksi_id) return false;
          const jenisOption = jenisTransaksiOptions.value.find((opt) => opt.value === d.jenis_transaksi_id);
          const jenisLabel = jenisOption?.label || "";
          const kind = classifyJenisLabel(jenisLabel);
          return kind === "debit";
        })
        .reduce((sum, d) => sum + (parseFloat(d.balance) || 0), 0);

      // Saldo akhir
      const finalBalance = totalKredit - totalDebit;
      formData.value.balance = finalBalance;

      // Logika status sesuai requirement:
      // - Jika final balance > opening balance (initial deposit) = ERROR, set warning status
      // - Jika final balance < opening balance = "Deposit Dipinjam"
      // - Jika final balance == opening balance = "Lunas" (semua deposit kembali)
      // - Jika final balance == 0 = "Belum Lunas" (tidak ada transaksi)
      let detectedStatus = "";
      if (finalBalance === 0) {
        detectedStatus = "Belum Lunas";
      } else if (finalBalance > openingBalance) {
        detectedStatus = "Saldo Melebihi jumlah Deposit"; // Status error - tidak bisa disave
      } else if (finalBalance < openingBalance) {
        detectedStatus = "Deposit Dipinjam";
      } else if (finalBalance === openingBalance) {
        detectedStatus = "Lunas";
      }

      const statusOption = statusOptions.value.find((opt) => opt.label === detectedStatus);
      if (statusOption) {
        formData.value.status_id = statusOption.value;
      } else {
        formData.value.status_id = "";
      }
    },
    { deep: true }
  );

  // Columns for the deposit detail table
  const detailListColumns = [
    { text: "Tanggal Transaksi", value: "tgl_transaksi", type: "date", editable: false },
    { text: "Jenis Transaksi", value: "jenis_transaksi", type: "text", editable: false },
    { text: "Catatan", value: "catatan_transaksi", type: "text", editable: false },
    { text: "Balance", value: "balance", type: "number", editable: false },
  ];

  // === STATUS DETECTION LOGIC ===
  /**
   * Deteksi status deposit berdasarkan saldo dan transaksi
   * @param {Object} depositData - Data deposit dengan detail transaksi
   * @returns {string} - Status: 'Lunas', 'Belum Lunas', atau 'Deposit Dipinjam'
   */
  // Helper: classify jenis_transaksi label into 'credit' | 'debit' | null
  function classifyJenisLabel(label) {
    if (!label) return null;
    const l = String(label).toLowerCase();
    // debit keywords have higher priority
    if (l.includes("pinjaman") || l.includes("debit") || l.includes("tarik") || l.includes("penarikan")) return "debit";
    if (l.includes("setoran") || l.includes("kredit")) return "credit";
    // ambiguous 'deposit' may appear in both labels like 'Pinjaman Deposit' -> prefer debit if pinjaman present
    if (l.includes("deposit")) return l.includes("pinjaman") ? "debit" : "credit";
    return null;
  }

  const detectDepositStatus = (depositData) => {
    const { t_deposit_d = [], t_deposit_ds = [] } = depositData;
    // Gabungkan semua transaksi
    const allTransactions = [...(t_deposit_d || []), ...(t_deposit_ds || [])];
    if (!allTransactions.length) {
      return "Belum Lunas";
    }
    // Opening balance dari transaksi pertama
    const openingBalance = parseFloat(allTransactions[0]?.balance) || 0;
    // Hitung total kredit dan debit
    const totalKredit = allTransactions
      .filter((d) => {
        const jenisTransaksi = d.m_gen?.value1 || "";
        const kind = classifyJenisLabel(jenisTransaksi);
        return kind === "credit";
      })
      .reduce((sum, d) => sum + (parseFloat(d.balance) || 0), 0);

    const totalDebit = allTransactions
      .filter((d) => {
        const jenisTransaksi = d.m_gen?.value1 || "";
        const kind = classifyJenisLabel(jenisTransaksi);
        return kind === "debit";
      })
      .reduce((sum, d) => sum + (parseFloat(d.balance) || 0), 0);

    const saldoAkhir = totalKredit - totalDebit;
    console.log("Saldo Akhir:", totalKredit, "Opening Balance:", totalDebit);
    if (saldoAkhir === 0) {
      return "Belum Lunas";
    } else if (saldoAkhir < openingBalance) {
      return "Deposit Dipinjam";
    } else if (saldoAkhir === openingBalance) {
      return "Lunas";
    } else if (saldoAkhir > openingBalance) {
      return "Saldo Melebihi jumlah Deposit";
    }
    return "Belum Lunas";
  };

  /**
   * Format currency untuk tampilan
   */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  /**
   * Get status color untuk UI
   */
  const getStatusColor = (status) => {
    const colorMap = {
      Lunas: "green",
      "Belum Lunas": "yellow",
      "Deposit Dipinjam": "red",
    };
    return colorMap[status] || "gray";
  };

  // === CONFIGURATION ===
  // Filter options for status filtering - Updated untuk deposit
  const FILTER_OPTIONS = [
    {
      value: "all",
      label: "Semua Status",
      activeClass: "bg-white text-gray-900",
      inactiveClass: "text-gray-600 hover:text-gray-900",
    },
    {
      value: "Lunas",
      label: "Lunas",
      activeClass: "bg-green-500 text-white",
      inactiveClass: "text-gray-600 hover:text-green-600",
    },
    {
      value: "Belum Lunas",
      label: "Belum Lunas",
      activeClass: "bg-yellow-500 text-white",
      inactiveClass: "text-gray-600 hover:text-yellow-600",
    },
    {
      value: "Deposit Dipinjam",
      label: "Deposit Dipinjam",
      activeClass: "bg-red-500 text-white",
      inactiveClass: "text-gray-600 hover:text-red-600",
    },
  ];

  // Table column configuration - Updated untuk deposit
  const TABLE_COLUMNS = [
    { text: "Penghuni", value: "nama", sortable: false },
    {
      text: "Balance",
      value: "balance",
      sortable: true,
      render: (value) => formatCurrency(value),
    },
    {
      text: "Status",
      value: "status",
      sortable: true,
      render: (value) => h(Badge, { color: getStatusColor(value) }, () => value),
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
        title: "Tambah Deposit",
        subtitle: "Buat data deposit baru",
        submitText: "Simpan Deposit",
        readonly: false,
      },
      edit: {
        title: "Edit Deposit",
        subtitle: "Ubah data deposit",
        submitText: "Update Deposit",
        readonly: false,
      },
      view: {
        title: "Detail Deposit",
        subtitle: "Lihat detail deposit",
        submitText: null,
        readonly: true,
      },
      copy: {
        title: "Copy Deposit",
        subtitle: "Salin data deposit",
        submitText: "Simpan Salinan",
        readonly: false,
      },
    };
    return configs[formMode.value] || configs.create;
  });

  // Helper: apakah form readonly (untuk v-bind:disabled)
  const isFormReadonly = computed(() => formConfig.value.readonly);

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
      const params = new URLSearchParams({ filter_column_group: "Tipe User" });
      const response = await httpService.get(`${apiConfig.endpoints.general.list}?${params}`);
      if (response.status !== "success") throw new Error(response.message || "API error");
      const options = (response.data || []).map((item) => ({
        value: item.id,
        label: item.value1,
      }));
      userTypeDropdown.value = options;
    } catch (err) {
      showError("Gagal mengambil data user type");
      userTypeDropdown.value = [];
    }
  }

  // Fetch company options for dropdown
  async function fetchCompanyDropdown() {
    try {
      const response = await httpService.get("/dynamic/m_unit_bussiness");
      if (response.status !== "success") throw new Error(response.message || "API error");
      const options = (response.data || []).map((item) => ({
        value: item.id,
        label: item.comp_name,
      }));
      detailListColumns[0].options = options;
    } catch (err) {
      showError("Gagal mengambil data company");
      detailListColumns[0].options = [];
    }
  }

  // Fetch responsibility options for dropdown
  async function fetchResponsibilityDropdown() {
    try {
      const response = await httpService.get("/dynamic/m_responsibility");
      if (response.status !== "success") throw new Error(response.message || "API error");
      const options = (response.data || []).map((item) => ({
        value: item.id,
        label: item.name,
      }));
      detailListColumns[1].options = options;
    } catch (err) {
      showError("Gagal mengambil data responsibility");
      detailListColumns[1].options = [];
    }
  }

  // Fetch m_penghuni untuk select options
  async function fetchPenghuniOptions() {
    try {
      const response = await httpService.get(apiConfig.endpoints.penghuni.list);
      if (response.status !== "success") throw new Error(response.message || "API error");
      penghuniOptions.value = (response.data || [])
        .filter((item) => item.nama && item.nama.trim() !== "")
        .map((item) => ({
          value: item.id,
          label: item.nama,
        }));
      console.log("Penghuni options fetched:", penghuniOptions.value);
      if (!penghuniOptions.value.length) {
        penghuniOptions.value = [{ value: "", label: "Tidak ada data" }];
      }
    } catch (err) {
      showError("Gagal mengambil data penghuni");
      penghuniOptions.value = [{ value: "", label: "Tidak ada data" }];
    }
  }

  // Fetch m_gen untuk status (group: status)
  async function fetchStatusOptions() {
    try {
      const response = await httpService.get(`${apiConfig.endpoints.general.list}?limit=1000`);
      if (response.status !== "success") throw new Error(response.message || "API error");
      const items = response.data || [];
      statusOptions.value = items
        .filter((item) => item.group === "status" && item.id && item.value1 && item.value1.trim() !== "")
        .map((item) => ({
          value: item.id, // UUID
          label: item.value1,
        }));
      if (!statusOptions.value.length) {
        statusOptions.value = [{ value: "", label: "Tidak ada data" }];
      }
    } catch (err) {
      showError("Gagal mengambil data status");
      statusOptions.value = [{ value: "", label: "Tidak ada data" }];
    }
  }

  // Fetch m_gen untuk jenis_transaksi (group: jenis_transaksi)
  async function fetchJenisTransaksiOptions() {
    try {
      const response = await httpService.get(`${apiConfig.endpoints.general.list}?limit=1000`);
      if (response.status !== "success") throw new Error(response.message || "API error");
      const items = response.data || [];
      jenisTransaksiOptions.value = items
        .filter((item) => item.group === "jenis_transaksi" && item.id && item.value1 && item.value1.trim() !== "")
        .map((item) => ({
          value: item.id, // UUID
          label: item.value1,
        }));
      if (!jenisTransaksiOptions.value.length) {
        jenisTransaksiOptions.value = [{ value: "", label: "Tidak ada data" }];
      }
    } catch (err) {
      showError("Gagal mengambil data jenis transaksi");
      jenisTransaksiOptions.value = [{ value: "", label: "Tidak ada data" }];
    }
  }

  // === INITIALIZATION ===

  // Add a new empty detail row dengan default values
  const addDetailListRow = () => {
    const newRow = {
      tgl_transaksi: new Date().toISOString().split("T")[0], // Today's date
      jenis_transaksi_id: "",
      catatan_transaksi: "",
      balance: 0,
    };
    detailListForm.value.push(newRow);
  };

  // Remove a detail row by index
  const removeDetailListRow = (idx) => {
    if (typeof idx === "number" && idx >= 0 && idx < detailListForm.value.length) {
      detailListForm.value.splice(idx, 1);
    }
  };

  // Add specific transaction types dengan helper functions
  const addSetoranTransaction = (amount, catatan = "") => {
    const setoranOption = jenisTransaksiOptions.value.find((opt) => opt.label.toLowerCase().includes("setoran") || opt.label.toLowerCase().includes("kredit"));

    if (setoranOption) {
      detailListForm.value.push({
        tgl_transaksi: new Date().toISOString().split("T")[0],
        jenis_transaksi_id: setoranOption.value,
        catatan_transaksi: catatan || `Setoran ${formatCurrency(amount)}`,
        balance: parseFloat(amount) || 0,
      });
    }
  };

  const addPinjamanTransaction = (amount, catatan = "") => {
    const pinjamanOption = jenisTransaksiOptions.value.find((opt) => opt.label.toLowerCase().includes("pinjaman") || opt.label.toLowerCase().includes("debit"));

    if (pinjamanOption) {
      detailListForm.value.push({
        tgl_transaksi: new Date().toISOString().split("T")[0],
        jenis_transaksi_id: pinjamanOption.value,
        catatan_transaksi: catatan || `Pinjaman ${formatCurrency(amount)}`,
        balance: parseFloat(amount) || 0,
      });
    }
  };

  // === API METHODS ===
  /**
   * Fetch deposit data with automatic status detection
   */
  const fetchDataTables = async (page = 1, paginate = 10) => {
    if (loading.value) return;
    loading.value = true;
    error.value = null;
    try {
      const params = {
        ...(searchTerm.value.trim() && { search: searchTerm.value.trim() }),
        ...(statusFilter.value !== "all" && { filter_column_status_id: statusFilter.value }),
        searchfield: "",
        page,
        limit: paginate,
        include: "m_penghuni,m_gen",
      };

      // Append server-side raw ordering if set and safe (whitelist)
      if (sortState.value.sortBy) {
        const direction = sortState.value.sortDesc ? "DESC" : "ASC";
        const allowed = TABLE_COLUMNS.map((c) => c.value).filter(Boolean);
        if (allowed.includes(sortState.value.sortBy)) {
          params.order_by_raw = `${sortState.value.sortBy} ${direction}`;
        }
      }
      const response = await httpService.get(`${apiConfig.endpoints.deposit.list}?${new URLSearchParams(params)}`);
      if (response.status !== "success") throw new Error(response.message || "API error");
      dataTables.value = (response.data || []).map((item) => {
        // Get status label dari m_gen (yang di-include dari status_id)
        const statusLabel = item.m_gen?.value1 || "Unknown";
        return {
          ...item,
          nama: item.m_penghuni?.nama || item.nama || "",
          status: statusLabel,
          statusFromDB: statusLabel,
          balance: parseFloat(item.balance) || 0,
        };
      });
      pagination.value = {
        currentPage: response.pagination?.page || 1,
        pageSize: response.pagination?.limit || paginate,
        totalItems: response.pagination?.total || 0,
        totalPages: response.pagination?.totalPages || 1,
      };
    } catch (err) {
      error.value = err.message || "Failed to fetch deposit list";
      showError("Failed to fetch deposit list");
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
        include: "m_penghuni,m_gen,t_deposit_d",
      };
      const response = await httpService.get(`${apiConfig.endpoints.deposit.show(id)}?${new URLSearchParams(params)}`);
      if (response.status !== "success") throw new Error(response.message || "API error");
      return {
        ...response.data,
        jenis_transaksi_id: response.data.t_deposit_d?.map((d) => d.jenis_transaksi_id) || [],
      };
    } catch (err) {
      showError("Gagal mengambil data user default");
      return null;
    }
  };

  /**
   * Save user default (create or update)
   */
  const saveData = async () => {
    if (formLoading.value) return;

    if (detailListForm.value && detailListForm.value.length > 0) {
      // Opening balance dari transaksi pertama (saldo deposit awal)
      const openingBalance = parseFloat(detailListForm.value[0]?.balance) || 0;

      // Hitung total setoran (kredit) dan penarikan/pinjaman (debit)
      const totalSetoran = detailListForm.value
        .filter((d) => {
          if (!d.jenis_transaksi_id && !d.jenis_transaksi) return false;
          const jenisOption = jenisTransaksiOptions.value.find((opt) => opt.value === d.jenis_transaksi_id);
          const jenisLabel = jenisOption?.label || d.jenis_transaksi || "";
          return classifyJenisLabel(jenisLabel) === "credit";
        })
        .reduce((sum, d) => sum + (parseFloat(d.balance) || 0), 0);

      const totalDebit = detailListForm.value
        .filter((d) => {
          if (!d.jenis_transaksi_id && !d.jenis_transaksi) return false;
          const jenisOption = jenisTransaksiOptions.value.find((opt) => opt.value === d.jenis_transaksi_id);
          const jenisLabel = jenisOption?.label || d.jenis_transaksi || "";
          return classifyJenisLabel(jenisLabel) === "debit";
        })
        .reduce((sum, d) => sum + (parseFloat(d.balance) || 0), 0);

      const saldoAkhir = totalSetoran - totalDebit;

      // VALIDASI: Jika saldo akhir > saldo awal = ERROR, tidak boleh disave
      if (saldoAkhir > openingBalance) {
        showError("Saldo melebihi jumlah deposit awal. Tidak dapat menyimpan data.");
        return;
      }

      // Set status berdasarkan saldo akhir
      let detectedStatus = "";
      if (saldoAkhir === 0) {
        detectedStatus = "Belum Lunas";
      } else if (saldoAkhir < openingBalance) {
        detectedStatus = "Deposit Dipinjam";
      } else if (saldoAkhir === openingBalance) {
        detectedStatus = "Lunas";
      }

      const statusOption = statusOptions.value.find((opt) => opt.label === detectedStatus);
      if (statusOption) {
        formData.value.status_id = statusOption.value;
      }
      formData.value.balance = saldoAkhir;
    }

    formLoading.value = true;
    try {
      const body = {
        m_penghuni_id: formData.value.m_penghuni_id,
        status_id: formData.value.status_id,
        balance: formData.value.balance,
        t_deposit_ds: detailListForm.value.map((item) => ({
          tgl_transaksi: item.tgl_transaksi,
          jenis_transaksi_id: item.jenis_transaksi_id,
          catatan_transaksi: item.catatan_transaksi,
          balance: item.balance,
        })),
      };
      Object.keys(body).forEach((key) => (body[key] == null || body[key] === "") && delete body[key]);
      if (Array.isArray(body.t_deposit_ds)) {
        body.t_deposit_ds = body.t_deposit_ds.map((d) => {
          Object.keys(d).forEach((k) => (d[k] == null || d[k] === "") && delete d[k]);
          return d;
        });
      }
      let url = apiConfig.endpoints.deposit.createWithDetails;
      if (isEditMode.value && selectedItem.value) {
        url = apiConfig.endpoints.deposit.updateWithDetails(selectedItem.value.id);
      }
      let response;
      if (isEditMode.value && selectedItem.value) {
        response = await httpService.put(url, body);
      } else {
        response = await httpService.post(url, body);
      }
      if (response.status !== "success") throw new Error(response.message || "API error");
      showSuccess(isEditMode.value ? "Deposit berhasil diupdate" : "Deposit berhasil disimpan");
      closeForm();
      clearURL();
      fetchDataTables(pagination.value.currentPage, pagination.value.pageSize);
    } catch (err) {
      showError("Gagal menyimpan deposit");
    } finally {
      formLoading.value = false;
    }
  };

  /**
   * Delete deposit item by calling API
   */
  const deleteUserDefault = async (item) => {
    try {
      if (!item || !item.id) throw new Error("Invalid item");
      const response = await httpService.delete(apiConfig.endpoints.deposit.delete(item.id));
      if (response.status !== "success") throw new Error(response.message || "API error");
      showSuccess("Deposit berhasil dihapus");
      fetchDataTables(pagination.value.currentPage, pagination.value.pageSize);
      selectedItem.value = null;
    } catch (err) {
      showError(err.message || "Gagal menghapus deposit");
    }
  };

  // === FORM MANAGEMENT ===
  /**
   * Open form with specified mode and data
   */
  const openForm = async (mode, item = null) => {
    formMode.value = mode;
    await Promise.all([fetchPenghuniOptions(), fetchStatusOptions(), fetchJenisTransaksiOptions()]);
    if (mode === "create") {
      resetForm();
      detailListForm.value = [];
    } else if (item) {
      selectedItem.value = item;
      formData.value = mode === "copy" ? { ...item, id: undefined } : { ...item };
      // Support both t_deposit_ds and t_deposit_d (for backward compatibility)
      const details = Array.isArray(item.t_deposit_ds) && item.t_deposit_ds.length > 0 ? item.t_deposit_ds : Array.isArray(item.t_deposit_d) ? item.t_deposit_d : [];
      detailListForm.value = details.map((detail) => {
        // Cari label jenis transaksi dari master
        let jenisLabel = "";
        if (detail.jenis_transaksi_id) {
          const jenisOpt = jenisTransaksiOptions.value.find((opt) => opt.value === detail.jenis_transaksi_id);
          jenisLabel = jenisOpt ? jenisOpt.label : detail.jenis_transaksi || "";
        } else if (detail.jenis_transaksi) {
          jenisLabel = detail.jenis_transaksi;
        }
        return {
          id: detail.id,
          tgl_transaksi: normalizeDateToInput(detail.tgl_transaksi),
          jenis_transaksi_id: detail.jenis_transaksi_id || "",
          jenis_transaksi: jenisLabel,
          catatan_transaksi: detail.catatan_transaksi,
          balance: parseFloat(detail.balance) || 0, // Keep as number for data model
        };
      });
    } else {
      detailListForm.value = [];
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
      title: "Hapus Deposit",
      message: `Apakah Anda yakin ingin menghapus deposit ini? Tindakan ini tidak dapat dibatalkan.`,
      confirmText: "Hapus",
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
    if (searchTimeout) clearTimeout(searchTimeout);
    // Set new timeout for debouncing (500ms delay)
    searchTimeout = setTimeout(() => {
      fetchDataTables(1, pagination.value.pageSize);
    }, 500);
  };

  /**
   * Handle status filter change with improved logic
   */
  const handleFilterChange = async (value) => {
    statusFilterLabel.value = value;
    if (value === "all") {
      statusFilter.value = "all";
      fetchDataTables(1, pagination.value.pageSize);
      return;
    }

    // Ensure status master is loaded so we can map label -> UUID
    if (!statusOptions.value || statusOptions.value.length === 0) {
      try {
        await fetchStatusOptions();
      } catch (e) {
        // fallback: leave filter as 'all' so we don't send invalid id
        statusFilter.value = "all";
        fetchDataTables(1, pagination.value.pageSize);
        return;
      }
    }

    // Support receiving either label (e.g. 'Lunas') or UUID value from the StatusFilter
    let statusOpt = statusOptions.value.find((opt) => opt.label === value);
    if (!statusOpt) statusOpt = statusOptions.value.find((opt) => opt.value === value);
    statusFilter.value = statusOpt ? statusOpt.value : "all";
    fetchDataTables(1, pagination.value.pageSize);
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
    // Accept either DataTable's object payload { column, direction } or (column, direction|boolean)
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
      const response = await httpService.get(`${apiEndpoint}?${params}`);
      if (response.status !== "success") throw new Error(response.message || "API error");
      selectOptions.value = (response.data || []).map((item) => ({
        id: item.id,
        company: item.m_unit_bussiness?.comp_name || "-",
        responsibility: item.name,
        responsensibility_id: item.id,
        isPrimary: false,
        status: item.status,
      }));
    } catch (err) {
      showError("Gagal mengambil data responsibility");
      selectOptions.value = [];
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
    fetchPenghuniOptions().then(() => {
      if (!penghuniOptions.value.length) {
        alert("Data penghuni kosong! Cek API atau database.");
      }
    });
    fetchStatusOptions().then(() => {
      if (!statusOptions.value.length) {
        alert("Data status kosong! Cek API atau database.");
      }
    });
    fetchJenisTransaksiOptions().then(() => {
      if (!jenisTransaksiOptions.value.length) {
        alert("Data jenis transaksi kosong! Cek API atau database.");
      }
    });
    detectActionFromURL();
  });

  // Watch route.query agar form terbuka sesuai URL
  const detectActionFromURL = async () => {
    const action = route.query.action;
    const itemId = route.query.id;
    console.log("Detecting action from URL:", action, itemId);
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

    // === Status Detection Functions ===
    detectDepositStatus,
    formatCurrency,
    getStatusColor,

    // === User Default Detail List ===
    detailListForm,
    detailListColumns,
    addDetailListRow,
    removeDetailListRow,
    addSetoranTransaction,
    addPinjamanTransaction,

    // Computed: For UI display only, balance formatted as Rupiah
    detailListFormDisplay: computed(() =>
      detailListForm.value.map((row) => ({
        ...row,
        balance: formatCurrency(row.balance),
      }))
    ),

    // === SelectDataModal Logic ===
    showSelectModal,
    selectedRows,
    selectOptions,
    penghuniOptions,
    statusOptions,
    jenisTransaksiOptions,
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
    isFormReadonly,

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

/**
 * Utility: Normalize date to YYYY-MM-DD (for input type="date")
 */
function normalizeDateToInput(dateStr) {
  if (!dateStr) return "";
  // Handle already normalized
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

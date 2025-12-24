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
export function usePenghuniManagement() {
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

  // Form data dengan field sesuai kebutuhan
  const initialFormData = {
    nama: "",
    tmpt_lahir: "",
    tgl_lahir: "",
    no_kk: "",
    tgl_masuk: "",
    tgl_keluar: "",
    agama_id: "",
    alamat: "",
    riwayat_hidup: "",
    aspek_kognitif: "",
    aspek_afektif: "",
    aspek_spiritual: "",
    aspek_sosial: "",
    anggota_keluarga_disuka: "",
    alasan_keluarga_disuka: "",
    anggota_keluarga_tidak_disuka: "",
    alasan_keluarga_tidak_disuka: "",
    dinamika_kepribadian: "",
    aktivitas_di_rumah: "",
    penilaian_keluarga: "",
    tingkat_ketergantungan_id: "",
    alasan_tingkat_ketergantungan: "",
    kesimpulan_id: "",
    alasan_kesimpulan: "",
    no_hp: "",
    nik: "",
    status: true,
    // Tambahan Penanggung Jawab
    nama_pj: "",
    umur_pj: "",
    jenis_kelamin_pj: "",
    hub_keluarga_pj: "",
    alamat_pj: "",
    no_telp_pj: "",
    foto: "",
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
    { text: "NIK", value: "nik", sortable: true },
    { text: "Nama", value: "nama", sortable: true },
    { text: "Agama", value: "agama_id", sortable: true },
    { text: "Alamat", value: "alamat", sortable: true },
    { text: "Tanggal Lahir", value: "tgl_lahir", sortable: true },
    { text: "No HP", value: "no_hp", sortable: true },
    { text: "Status", value: "status", sortable: true, render: (value) => h(Badge, { color: value ? "green" : "red" }, () => (value ? "Active" : "Inactive")) },
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
        title: "Add New Penghuni Oma Opa",
        subtitle: "Create a new penghuni",
        submitText: "Create Penghuni",
        readonly: false,
      },
      edit: {
        title: "Edit Penghuni Oma Opa",
        subtitle: "Update penghuni information",
        submitText: "Update Penghuni",
        readonly: false,
      },
      view: {
        title: "Penghuni Oma Opa Details",
        subtitle: "View penghuni information",
        submitText: null,
        readonly: true,
      },
      copy: {
        title: "Copy Penghuni Oma Opa",
        subtitle: "Create a copy of penghuni",
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
      const params = new URLSearchParams({ filter_column_group: "Tipe User" });
      const result = await httpService.get(`${apiConfig.endpoints.general.list}?${params}`);
      if (result.status !== "success") throw new Error(result.message || "API error");
      const options = (result.data || []).map((item) => ({ value: item.id, label: item.value1 }));
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
      const result = await httpService.get("/dynamic/m_unit_bussiness");
      if (result.status !== "success") throw new Error(result.message || "API error");
      const options = (result.data || []).map((item) => ({ value: item.id, label: item.comp_name }));
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
      const result = await httpService.get("/dynamic/m_responsibility");
      if (result.status !== "success") throw new Error(result.message || "API error");
      const options = (result.data || []).map((item) => ({ value: item.id, label: item.name }));
      detailListColumns[1].options = options;
    } catch (err) {
      showError("Gagal mengambil data responsibility");
      detailListColumns[1].options = [];
      console.error("Fetch responsibility dropdown error:", err);
    }
  }

  // Dropdown options
  const agamaOptions = ref([]);
  const tingkatKetergantunganOptions = ref([]);
  const kesimpulanOptions = ref([]);

  // Fetch m_gen options by group
  async function fetchGenOptions(group, targetRef) {
    try {
      const params = new URLSearchParams({ filter_column_group: group });
      const result = await httpService.get(`${apiConfig.endpoints.general.list}?${params}`);
      if (result.status !== "success") throw new Error(result.message || "API error");
      targetRef.value = (result.data || []).filter((item) => item.status === true || item.status === 1 || item.status === "active").map((item) => ({ value: item.id, label: item.value1 }));
    } catch (err) {
      targetRef.value = [];
      showError(`Gagal mengambil data ${group}`);
      console.error(`Fetch ${group} error:`, err);
    }
  }

  // === INITIALIZATION ===
  onMounted(() => {
    fetchGenOptions("agama", agamaOptions);
    fetchGenOptions("tingkat_ketergantungan", tingkatKetergantunganOptions);
    fetchGenOptions("kesimpulan", kesimpulanOptions);
    detectActionFromURL();
  });

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
        searchfield: "nama,nik",
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
      const result = await httpService.get(`${apiConfig.endpoints.penghuni.list}?${new URLSearchParams(params)}`);
      if (result.status !== "success") throw new Error(result.message || "API error");
      dataTables.value = (result.data || []).map((item) => {
        let agamaLabel = "-";
        if (item.agama_id && agamaOptions.value.length > 0) {
          const found = agamaOptions.value.find((opt) => opt.value == item.agama_id);
          if (found) agamaLabel = found.label;
        } else if (Array.isArray(item.m_gen)) {
          const activeGen = item.m_gen.filter((g) => g.status === true || g.status === 1 || g.status === "active");
          const agamaGen = activeGen.find((g) => g.group === "agama");
          if (agamaGen) agamaLabel = agamaGen.value1;
        } else if (item.m_gen?.group === "agama" && (item.m_gen.status === true || item.m_gen.status === 1 || item.m_gen.status === "active")) {
          agamaLabel = item.m_gen.value1;
        }
        return {
          ...item,
          agama_id: agamaLabel,
          alamat: item.alamat || "-",
          nik: item.nik || "-",
        };
      });
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
      const params = {};
      const result = await httpService.get(`${apiConfig.endpoints.penghuni.show(id)}?${new URLSearchParams(params)}`);
      if (result.status !== "success") throw new Error(result.message || "API error");
      return result.data;
    } catch (err) {
      showError("Gagal mengambil data penghuni");
      console.error("Fetch by id error:", err);
      return null;
    }
  };

  /**
   * Save user default (create or update)
   * Save penghuni (create or update)
   */
  const saveData = async () => {
    if (formLoading.value) return; // Prevent multiple submissions
    formLoading.value = true;
    try {
      let result;
      // Check if foto is a File object (true file upload) vs string (URL link)
      const isFotoFile = formData.value.foto && typeof formData.value.foto === "object" && formData.value.foto instanceof File;

      if (isFotoFile) {
        // FormData approach for file upload
        const body = new FormData();
        const appendIfExists = (key, val) => {
          if (val !== undefined && val !== null && val !== "") body.append(key, val);
        };
        console.log("Form Data before submit:", formData.value);
        appendIfExists("nama", formData.value.nama);
        appendIfExists("tmpt_lahir", formData.value.tmpt_lahir);
        appendIfExists("tgl_lahir", formData.value.tgl_lahir);
        appendIfExists("no_kk", formData.value.no_kk);
        appendIfExists("tgl_masuk", formData.value.tgl_masuk);
        appendIfExists("tgl_keluar", formData.value.tgl_keluar);
        appendIfExists("agama_id", formData.value.agama_id);
        appendIfExists("alamat", formData.value.alamat);
        appendIfExists("riwayat_hidup", formData.value.riwayat_hidup);
        appendIfExists("aspek_kognitif", formData.value.aspek_kognitif);
        appendIfExists("aspek_afektif", formData.value.aspek_afektif);
        appendIfExists("aspek_spiritual", formData.value.aspek_spiritual);
        appendIfExists("aspek_sosial", formData.value.aspek_sosial);
        appendIfExists("anggota_keluarga_disuka", formData.value.anggota_keluarga_disuka);
        appendIfExists("alasan_keluarga_disuka", formData.value.alasan_keluarga_disuka);
        appendIfExists("anggota_keluarga_tidak_disuka", formData.value.anggota_keluarga_tidak_disuka);
        appendIfExists("alasan_keluarga_tidak_disuka", formData.value.alasan_keluarga_tidak_disuka);
        appendIfExists("dinamika_kepribadian", formData.value.dinamika_kepribadian);
        appendIfExists("aktivitas_di_rumah", formData.value.aktivitas_di_rumah);
        appendIfExists("penilaian_keluarga", formData.value.penilaian_keluarga);
        appendIfExists("tingkat_ketergantungan_id", formData.value.tingkat_ketergantungan_id);
        appendIfExists("alasan_tingkat_ketergantungan", formData.value.alasan_tingkat_ketergantungan);
        appendIfExists("kesimpulan_id", formData.value.kesimpulan_id);
        appendIfExists("alasan_kesimpulan", formData.value.alasan_kesimpulan);
        appendIfExists("no_hp", formData.value.no_hp);
        appendIfExists("nik", formData.value.nik);
        appendIfExists("nama_pj", formData.value.nama_pj);
        appendIfExists("umur_pj", formData.value.umur_pj);
        appendIfExists("jenis_kelamin_pj", formData.value.jenis_kelamin_pj);
        appendIfExists("hub_keluarga_pj", formData.value.hub_keluarga_pj);
        appendIfExists("alamat_pj", formData.value.alamat_pj);
        appendIfExists("no_telp_pj", formData.value.no_telp_pj);
        if (typeof formData.value.status === "boolean") body.append("status", formData.value.status);
        if (isEditMode.value && selectedItem.value?.id) {
          appendIfExists("id", selectedItem.value.id);
        }
        body.append("foto", formData.value.foto);
        let url = apiConfig.endpoints.penghuni.create;
        if (isEditMode.value && selectedItem.value) {
          url = apiConfig.endpoints.penghuni.update(selectedItem.value.id);
        }
        result = isEditMode.value && selectedItem.value ? await httpService.put(url, body) : await httpService.post(url, body);
      } else {
        // JSON approach for string URL or no foto
        const jsonBody = {
          nama: formData.value.nama || undefined,
          agama_id: formData.value.agama_id || undefined,
          alamat: formData.value.alamat || undefined,
          tgl_lahir: formData.value.tgl_lahir || undefined,
          riwayat_hidup: formData.value.riwayat_hidup || undefined,
          aspek_kognitif: formData.value.aspek_kognitif || undefined,
          aspek_afektif: formData.value.aspek_afektif || undefined,
          aspek_spiritual: formData.value.aspek_spiritual || undefined,
          aspek_sosial: formData.value.aspek_sosial || undefined,
          anggota_keluarga_disuka: formData.value.anggota_keluarga_disuka || undefined,
          alasan_keluarga_disuka: formData.value.alasan_keluarga_disuka || undefined,
          anggota_keluarga_tidak_disuka: formData.value.anggota_keluarga_tidak_disuka || undefined,
          alasan_keluarga_tidak_disuka: formData.value.alasan_keluarga_tidak_disuka || undefined,
          dinamika_kepribadian: formData.value.dinamika_kepribadian || undefined,
          aktivitas_di_rumah: formData.value.aktivitas_di_rumah || undefined,
          penilaian_keluarga: formData.value.penilaian_keluarga || undefined,
          tingkat_ketergantungan_id: formData.value.tingkat_ketergantungan_id || undefined,
          alasan_tingkat_ketergantungan: formData.value.alasan_tingkat_ketergantungan || undefined,
          kesimpulan_id: formData.value.kesimpulan_id || undefined,
          alasan_kesimpulan: formData.value.alasan_kesimpulan || undefined,
          no_hp: formData.value.no_hp || undefined,
          nik: formData.value.nik || undefined,
          no_kk: formData.value.no_kk || undefined,
          tmpt_lahir: formData.value.tmpt_lahir || undefined,
          tgl_masuk: formData.value.tgl_masuk || undefined,
          tgl_keluar: formData.value.tgl_keluar || undefined,
          nama_pj: formData.value.nama_pj || undefined,
          umur_pj: formData.value.umur_pj || undefined,
          jenis_kelamin_pj: formData.value.jenis_kelamin_pj || undefined,
          hub_keluarga_pj: formData.value.hub_keluarga_pj || undefined,
          alamat_pj: formData.value.alamat_pj || undefined,
          no_telp_pj: formData.value.no_telp_pj || undefined,
          foto: formData.value.foto || undefined,
          status: typeof formData.value.status === "boolean" ? formData.value.status : undefined,
        };
        Object.keys(jsonBody).forEach((key) => jsonBody[key] === undefined && delete jsonBody[key]);
        let url = apiConfig.endpoints.penghuni.create;
        if (isEditMode.value && selectedItem.value) {
          url = apiConfig.endpoints.penghuni.update(selectedItem.value.id);
        }
        result = isEditMode.value && selectedItem.value ? await httpService.put(url, jsonBody) : await httpService.post(url, jsonBody);
      }
      if (result.status !== "success") throw new Error(result.message || "API error");
      showSuccess(isEditMode.value ? "Data penghuni updated successfully" : `Data penghuni ${isCopyMode.value ? "copied" : "created"} successfully`);
      closeForm();
      clearURL();
      fetchDataTables(pagination.value.currentPage, pagination.value.pageSize);
    } catch (err) {
      const action = isEditMode.value ? "update" : "save";
      showError(`Failed to ${action} data penghuni`);
      console.error("Save error:", err);
    } finally {
      formLoading.value = false;
    }
  };

  /**
   * Fetch penghuni item by id from API
   */
  // const fetchDataById = async (id) => {
  //   try {
  //     const response = await fetch(buildApiUrl(`${apiConfig.endpoints.penghuni.show(id)}`), {
  //       method: "GET",
  //       headers: { "Content-Type": "application/json" },
  //     });
  //     if (!response.ok) throw new Error("Failed to fetch penghuni by id");
  //     const result = await response.json();
  //     if (result.status !== "success") throw new Error(result.message || "API error");
  //     return result.data;
  //   } catch (err) {
  //     showError("Gagal mengambil data penghuni");
  //     console.error("Fetch by id error:", err);
  //     return null;
  //   }
  // };

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
      // Pastikan field foto ikut diisi jika ada
      formData.value = mode === "copy" ? { ...item, id: undefined } : { ...item };
      // Normalize foto path for preview in edit/view
      try {
        const origin = typeof window !== "undefined" && window.location && window.location.origin ? window.location.origin : "";
        let baseUrl = apiConfig.baseURL.replace(/\/api\/?$/, "").replace(/\/$/, "");
        if (!baseUrl) baseUrl = origin;
        if (item.foto) {
          if (typeof item.foto === "string" && item.foto.startsWith("http")) {
            photoPreview.value = item.foto;
            formData.value.foto = item.foto;
          } else {
            const path = String(item.foto).replace(/^\/+/, "");
            photoPreview.value = `${baseUrl.replace(/\/$/, "")}/${path}`;
            formData.value.foto = photoPreview.value;
          }
        } else {
          photoPreview.value = "";
        }
      } catch (e) {
        console.warn("Error normalizing penghuni foto", e);
      }
      // Normalisasi tgl_lahir agar selalu YYYY-MM-DD untuk input type="date"
      if (formData.value.tgl_lahir) {
        formData.value.tgl_lahir = normalizeDateToInput(formData.value.tgl_lahir);
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
   * Delete penghuni by id
   */
  const deletePenghuni = async (item) => {
    if (!item?.id) return;
    try {
      const url = apiConfig.endpoints.penghuni.delete(item.id);
      const result = await httpService.delete(url);
      if (result.status !== "success") throw new Error(result.message || "API error");
      showSuccess("Data penghuni berhasil dihapus");
      fetchDataTables(pagination.value.currentPage, pagination.value.pageSize);
      selectedItem.value = null;
    } catch (err) {
      showError("Gagal menghapus data penghuni");
      console.error("Delete error:", err);
    }
  };

  /**
   * Handle delete selected item
   */
  const handleDelete = () => {
    if (!selectedItem.value) return;
    showConfirmation({
      title: "Delete Penghuni Oma Opa",
      message: `Are you sure you want to delete penghuni \"${selectedItem.value.nama || selectedItem.value.name || ""}\"? This action cannot be undone.`,
      confirmText: "Delete",
      confirmVariant: "filled",
      onConfirm: () => {
        deletePenghuni(selectedItem.value);
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
      const result = await httpService.get(`${apiEndpoint}?${params}`);
      if (result.status !== "success") throw new Error(result.message || "API error");
      selectOptions.value = (result.data || []).map((item) => ({
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
    agamaOptions,
    tingkatKetergantunganOptions,
    kesimpulanOptions,

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
 * Utility: Normalize date string to YYYY-MM-DD (for input type="date")
 */
function normalizeDateToInput(dateStr) {
  if (!dateStr) return "";
  // Try to parse as Date
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  // Pad month and day
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

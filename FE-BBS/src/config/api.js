// ...existing code...
// API Configuration
export const apiConfig = {
  // Use relative /api by default so dev server proxy can forward requests to backend
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000,

  // API Endpoints
  endpoints: {
    // Auth endpoints
    auth: {
      login: "/auth/login",
      logout: "/auth/logout",
      register: "/auth/register",
      profile: "/auth/profile",
      refresh: "/auth/refresh",
    }, // Menu endpoints
    menu: {
      list: "/dynamic/m_menu",
      create: "/dynamic/m_menu",
      update: (id) => `/dynamic/m_menu/${id}`,
      delete: (id) => `/dynamic/m_menu/${id}`,
      show: (id) => `/dynamic/m_menu/${id}`,
    }, // General endpoints
    general: {
      list: "/dynamic/m_gen",
      create: "/dynamic/m_gen",
      update: (id) => `/dynamic/m_gen/${id}`,
      delete: (id) => `/dynamic/m_gen/${id}`,
      show: (id) => `/dynamic/m_gen/${id}`,
    },

    // Prefix endpoints
    prefix: {
      list: "/dynamic/m_prefix_num",
      create: "/dynamic/m_prefix_num",
      update: (id) => `/dynamic/m_prefix_num/${id}`,
      delete: (id) => `/dynamic/m_prefix_num/${id}`,
      show: (id) => `/dynamic/m_prefix_num/${id}`,
    },

    // Generate Number endpoints
    generateNumber: {
      list: "/dynamic/m_format_num",
      create: "/dynamic/m_format_num",
      update: (id) => `/dynamic/m_format_num/${id}`,
      delete: (id) => `/dynamic/m_format_num/${id}`,
      show: (id) => `/dynamic/m_format_num/${id}`,
    },

    // Role endpoints
    role: {
      list: "/dynamic/m_role",
      create: "/dynamic/m_role/with-details",
      update: (id) => `/dynamic/m_role/with-details/${id}`,
      delete: (id) => `/dynamic/m_role/${id}`,
      show: (id) => `/dynamic/m_role/${id}`,
    },

    // User endpoints
    user: {
      list: "/dynamic/user_default",
      create: "/dynamic/user_default",
      createWithDetails: "/dynamic/user_default/with-details",
      updateWithDetails: (id) => `/dynamic/user_default/with-details/${id}`,
      update: (id) => `/dynamic/user_default/${id}`,
      delete: (id) => `/dynamic/user_default/${id}`,
      show: (id) => `/dynamic/user_default/${id}`,
    },

    // Approval endpoints
    approval: {
      list: "/dynamic/m_set_approval",
      create: "/dynamic/m_set_approval",
      update: (id) => `/dynamic/m_set_approval/${id}`,
      delete: (id) => `/dynamic/m_set_approval/${id}`,
      show: (id) => `/dynamic/m_set_approval/${id}`,
    },

    // Responsibility endpoints
    responsibility: {
      list: "/dynamic/m_responsibility",
      create: "/dynamic/m_responsibility",
      createWithDetails: "/dynamic/m_responsibility/with-details",
      update: (id) => `/dynamic/m_responsibility/${id}`,
      updateWithDetails: (id) => `/dynamic/m_responsibility/with-details/${id}`,
      delete: (id) => `/dynamic/m_responsibility/${id}`,
      show: (id) => `/dynamic/m_responsibility/${id}`,
    },

    // Customer group endpoints
    customer_group: {
      list: "/dynamic/m_customer_group",
      create: "/dynamic/m_customer_group",
      update: (id) => `/dynamic/m_customer_group/${id}`,
      delete: (id) => `/dynamic/m_customer_group/${id}`,
      show: (id) => `/dynamic/m_customer_group/${id}`,
    },
    // Penghuni endpoints
    penghuni: {
      list: "/dynamic/m_penghuni",
      create: "/dynamic/m_penghuni",
      update: (id) => `/dynamic/m_penghuni/${id}`,
      delete: (id) => `/dynamic/m_penghuni/${id}`,
      show: (id) => `/dynamic/m_penghuni/${id}`,
    },
    // Karyawan endpoints
    karyawan: {
      list: "/dynamic/m_kary",
      create: "/dynamic/m_kary",
      update: (id) => `/dynamic/m_kary/${id}`,
      delete: (id) => `/dynamic/m_kary/${id}`,
      show: (id) => `/dynamic/m_kary/${id}`,
    },
    // pengurus endpoints
    pengurus: {
      list: "/dynamic/m_pengurus",
      create: "/dynamic/m_pengurus",
      update: (id) => `/dynamic/m_pengurus/${id}`,
      delete: (id) => `/dynamic/m_pengurus/${id}`,
      show: (id) => `/dynamic/m_pengurus/${id}`,
    }, // General endpoints as needed
    deposit: {
      list: "/dynamic/t_deposit",
      create: "/dynamic/t_deposit",
      createWithDetails: "/dynamic/t_deposit/with-details",
      updateWithDetails: (id) => `/dynamic/t_deposit/with-details/${id}`,
      update: (id) => `/dynamic/t_deposit/${id}`,
      delete: (id) => `/dynamic/t_deposit/${id}`,
      show: (id) => `/dynamic/t_deposit/${id}`,
    },
    history_kesehatan: {
      list: "/dynamic/history_kesehatan",
      create: "/dynamic/history_kesehatan",
      update: (id) => `/dynamic/history_kesehatan/${id}`,
      delete: (id) => `/dynamic/history_kesehatan/${id}`,
      show: (id) => `/dynamic/history_kesehatan/${id}`,
    },
    berita: {
      list: "/dynamic/berita",
      create: "/dynamic/berita",
      update: (id) => `/dynamic/berita/${id}`,
      delete: (id) => `/dynamic/berita/${id}`,
      show: (id) => `/dynamic/berita/${id}`,
    },
    galery: {
      list: "/dynamic/galery",
      create: "/dynamic/galery",
      update: (id) => `/dynamic/galery/${id}`,
      delete: (id) => `/dynamic/galery/${id}`,
      show: (id) => `/dynamic/galery/${id}`,
    },
    pondokan: {
      list: "/dynamic/t_pondokan",
      create: "/dynamic/t_pondokan",
      createWithDetails: "/dynamic/t_pondokan/with-details",
      updateWithDetails: (id) => `/dynamic/t_pondokan/with-details/${id}`,
      update: (id) => `/dynamic/t_pondokan/${id}`,
      delete: (id) => `/dynamic/t_pondokan/${id}`,
      show: (id) => `/dynamic/t_pondokan/${id}`,
    },
    realisasi_pondokan: {
      list: "/dynamic/t_realisasi_pondokan",
      create: "/dynamic/t_realisasi_pondokan",
      createWithDetails: "/dynamic/t_realisasi_pondokan/with-details",
      updateWithDetails: (id) => `/dynamic/t_realisasi_pondokan/with-details/${id}`,
      update: (id) => `/dynamic/t_realisasi_pondokan/${id}`,
      delete: (id) => `/dynamic/t_realisasi_pondokan/${id}`,
      show: (id) => `/dynamic/t_realisasi_pondokan/${id}`,
    },
    angpao: {
      list: "/dynamic/t_angpao",
      create: "/dynamic/t_angpao",
      createWithDetails: "/dynamic/t_angpao/with-details",
      updateWithDetails: (id) => `/dynamic/t_angpao/with-details/${id}`,
      update: (id) => `/dynamic/t_angpao/${id}`,
      delete: (id) => `/dynamic/t_angpao/${id}`,
      show: (id) => `/dynamic/t_angpao/${id}`,
    },
    angpao_detail: {
      list: "/dynamic/t_angpao_d",
      create: "/dynamic/t_angpao_d",
      createWithDetails: "/dynamic/t_angpao_d/with-details",
      update: (id) => `/dynamic/t_angpao_d/${id}`,
      delete: (id) => `/dynamic/t_angpao_d/${id}`,
      show: (id) => `/dynamic/t_angpao_d/${id}`,
    },
  },
};

// Helper function to build full URL
export const buildApiUrl = (endpoint) => {
  return `${apiConfig.baseURL}${endpoint}`;
};

// Environment info
export const isProduction = import.meta.env.PROD;
export const isDevelopment = import.meta.env.DEV;
export const appEnv = import.meta.env.VITE_APP_ENV || "development";

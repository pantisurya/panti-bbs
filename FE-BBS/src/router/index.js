import { createRouter, createWebHistory } from "vue-router";
import DefaultLayout from "../layouts/DefaultLayout.vue";

const routes = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/login",
    name: "login",
    component: () => import("../views/auth/LoginView.vue"),
    meta: {
      layout: "auth",
      guest: true,
    },
  },
  {
    path: "/",
    component: DefaultLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "dashboard",
        name: "dashboard",
        component: () => import("@/views/DashboardView.vue"),
      },
      {
        path: "history_kesehatan",
        name: "history_kesehatan",
        component: () => import("@/views/history_kesehatan/HistoryKesehatanView.vue"),
      },
      {
        path: "Berita",
        name: "Berita",
        component: () => import("@/views/berita/BeritaView.vue"),
      },
      {
        path: "Galery",
        name: "Galery",
        component: () => import("@/views/galery/GaleryView.vue"),
      },
      {
        path: "setup/user-default",
        name: "setup-user-default",
        component: () => import("@/views/user-default/UserDefaultView.vue"),
      },
      {
        path: "setup/penghuni",
        name: "setup-penghuni",
        component: () => import("@/views/penghuni/PenghuniView.vue"),
      },
      {
        path: "setup/gen",
        name: "setup-general",
        component: () => import("@/views/gen/GeneralView.vue"),
      },
      {
        path: "setup/kary",
        name: "setup-karyawan",
        component: () => import("@/views/kary/KaryawanView.vue"),
      },
      {
        path: "setup/pengurus",
        name: "setup-pengurus",
        component: () => import("@/views/pengurus/PengurusView.vue"),
      },
      {
        path: "keuangan/deposit",
        name: "keuangan-deposit",
        component: () => import("@/views/deposit/DepositView.vue"),
      },
      {
        path: "keuangan/pondokan",
        name: "keuangan-pondokan",
        component: () => import("@/views/pondokan/PondokanView.vue"),
      },
      {
        path: "keuangan/realisasi_pondokan",
        name: "keuangan-realisasi-pondokan",
        component: () => import("@/views/realisasi_pondokan/RealisasiPondokanView.vue"),
      },
      {
        path: "keuangan/angpao",
        name: "keuangan-angpao",
        component: () => import("@/views/angpao/AngpaoView.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guards
router.beforeEach((to, from, next) => {
  // const isAuthenticated = localStorage.getItem('auth_token') // You can modify this based on your auth logic
  const isAuthenticated = localStorage.getItem("auth_token"); // You can modify this based on your auth logic

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: "login" });
  } else if (to.meta.guest && isAuthenticated) {
    next({ name: "dashboard" });
  } else {
    next();
  }
});

export default router;

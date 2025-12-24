<script>
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import BLogo from "./BLogo.vue";
import Icon from "./Icon.vue";

const menuItems = ref([
  {
    label: "Dashboard",
    icon: "home",
    route: "/dashboard",
    isOpen: false, // Initialize isOpen
  },
  {
    label: "Setup",
    icon: "cog",
    isOpen: false, // Initialize isOpen
    children: [
      {
        label: "User Default",
        icon: "user-cog",
        isOpen: false,
        // Remove children for User Default (no sub child)
      },
      { label: "General", icon: "cogs", isOpen: false },
      { label: "Karyawan", icon: "users", isOpen: false },
      { label: "Penghuni", icon: "user-friends", isOpen: false },
      { label: "Pengurus", icon: "user-friends", isOpen: false },
    ],
  },
  {
    label: "History Kesehatan",
    icon: "heartbeat",
    route: "/history_kesehatan",
    isOpen: false, // Initialize isOpen
  },
  {
    label: "Keuangan",
    icon: "money-bill-wave",
    isOpen: false, // Initialize isOpen
    children: [
      { label: "Deposit", icon: "piggy-bank", isOpen: false },
      { label: "Pondokan", icon: "home", isOpen: false },
      { label: "Realisasi Pondokan", icon: "clipboard-check", isOpen: false },
      { label: "Angpao", icon: "gift", isOpen: false },
    ],
  },
  {
    label: "Berita",
    icon: "heartbeat",
    route: "/berita",
    isOpen: false, // Initialize isOpen
  },
  {
    label: "Galery",
    icon: "heartbeat",
    route: "/galery",
    isOpen: false, // Initialize isOpen
  },
]);

const toggleSubmenu = (item) => {
  if (item.children) {
    // Jika menu memiliki route aktif, jangan tutup
    const hasActiveRoute = item.children.some((child) => {
      const childRoute = getChildRoute(item, child);
      if (window.location.pathname === childRoute || window.location.pathname.startsWith(childRoute)) {
        return true;
      }
      // Check nested children untuk route aktif
      if (child.children) {
        return child.children.some((subChild) => {
          const subChildRoute = getChildRoute(item, child, subChild);
          return window.location.pathname === subChildRoute || window.location.pathname.startsWith(subChildRoute);
        });
      }
      return false;
    });

    // Jika tidak ada route aktif, baru boleh toggle
    if (!hasActiveRoute) {
      item.isOpen = !item.isOpen;

      // Close all other submenus when one is opened
      if (item.isOpen) {
        menuItems.value.forEach((menuItem) => {
          if (menuItem !== item && menuItem.children) {
            // Cek apakah menuItem lain memiliki route aktif
            const otherHasActiveRoute = menuItem.children.some((child) => {
              const childRoute = getChildRoute(menuItem, child);
              if (window.location.pathname === childRoute || window.location.pathname.startsWith(childRoute)) {
                return true;
              }
              if (child.children) {
                return child.children.some((subChild) => {
                  const subChildRoute = getChildRoute(menuItem, child, subChild);
                  return window.location.pathname === subChildRoute || window.location.pathname.startsWith(subChildRoute);
                });
              }
              return false;
            });

            // Hanya tutup jika tidak ada route aktif
            if (!otherHasActiveRoute) {
              menuItem.isOpen = false;
              // Also close nested children
              menuItem.children.forEach((child) => {
                if (
                  !child.children ||
                  !child.children.some((subChild) => {
                    const subChildRoute = getChildRoute(menuItem, child, subChild);
                    return window.location.pathname === subChildRoute || window.location.pathname.startsWith(subChildRoute);
                  })
                ) {
                  child.isOpen = false;
                }
              });
            }
          }
        });
      } else {
        // Close all children when parent is closed
        item.children.forEach((child) => {
          // Hanya tutup child yang tidak memiliki route aktif
          if (child.children) {
            const childHasActiveRoute = child.children.some((subChild) => {
              const subChildRoute = getChildRoute(item, child, subChild);
              return window.location.pathname === subChildRoute || window.location.pathname.startsWith(subChildRoute);
            });
            if (!childHasActiveRoute) {
              child.isOpen = false;
            }
          }
        });
      }
    }
  }
};

// Helper function to get the route for a child menu item
const getChildRoute = (parent, child, subChild = "") => {
  // Route mapping based on parent and child labels
  if (parent.label === "Setup") {
    switch (child.label) {
      case "User Default":
        if (subChild && subChild.label) {
          switch (subChild.label) {
            case "Permissions":
              return "/setup/user-default/permissions";
            case "Roles":
              return "/setup/user-default/roles";
            default:
              return "/setup/user-default";
          }
        }
        return "/setup/user-default";
      case "General":
        return "/setup/gen";
      case "Karyawan":
        return "/setup/kary";
      case "Penghuni":
        return "/setup/penghuni";
      case "Pengurus":
        return "/setup/pengurus"
      default:
        return `/setup`;
    }
  }

  if (parent.label === "Keuangan") {
    switch (child.label) {
      case "Deposit":
        return "/keuangan/deposit";
      case "Pondokan":
        return "/keuangan/pondokan";
      case "Realisasi Pondokan":
        return "/keuangan/realisasi_pondokan";
      case "Angpao":
        return "/keuangan/angpao";
      default:
        return `/keuangan`;
    }
  }

  if (parent.label === "Marketing") {
    switch (child.label) {
      case "Customer Group":
        return "/marketing/customer-group";
      default:
        return `/marketing`;
    }
  }

  if (parent.label === "Accounting") {
    switch (child.label) {
      case "Master":
        if (subChild && subChild.label) {
          switch (subChild.label) {
            case "COA":
              return "/accounting/master/coa";
            case "Interface":
              return "/accounting/master/interface";
            case "Faktur Pajak":
              return "/accounting/master/faktur-pajak";
            default:
              return "/accounting/master";
          }
        }
        break; // Add break to prevent fall-through
      case "Transaction":
        return "/accounting/transaction";
      case "Report":
        return "/accounting/report";
      default:
        return `/accounting`;
      case "Customer":
        return "/marketing/customer";
    }
  }

  if (parent.label === "History Kesehatan") {
    return "/history_kesehatan";
  }

  // Default route construction for other modules
  return `/${parent.label.toLowerCase()}/${child.label.toLowerCase()}`;
};

export default {
  components: {
    BLogo,
    Icon,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();

    // Reactive computed untuk menentukan menu mana yang active
    const isMenuOpen = computed(() => (item) => {
      if (item.children) {
        return item.children.some((child) => {
          const childRoute = getChildRoute(item, child);
          return route.path === childRoute || route.path.startsWith(childRoute);
        });
      }
      return false;
    });

    // Helper to check if menu should stay open based on active route
    const shouldMenuStayOpen = computed(() => (item) => {
      if (item.children) {
        return item.children.some((child) => {
          const childRoute = getChildRoute(item, child);
          if (route.path === childRoute || route.path.startsWith(childRoute)) {
            return true;
          }
          // Check nested children
          if (child.children) {
            return child.children.some((subChild) => {
              const subChildRoute = getChildRoute(item, child, subChild);
              return route.path === subChildRoute || route.path.startsWith(subChildRoute);
            });
          }
          return false;
        });
      }
      return false;
    });

    // Helper to check if a route is active
    const isActiveRoute = computed(() => (parent, child, subChild = "") => {
      const expectedRoute = getChildRoute(parent, child, subChild);
      return route.path === expectedRoute;
    });

    // Watch route changes untuk auto-open parent menu
    watch(
      () => route.path,
      (newPath) => {
        menuItems.value.forEach((item) => {
          if (item.children) {
            const hasActiveChild = item.children.some((child) => {
              const childRoute = getChildRoute(item, child);
              if (newPath === childRoute || newPath.startsWith(childRoute)) {
                return true;
              }
              // Check nested children
              if (child.children) {
                return child.children.some((subChild) => {
                  const subChildRoute = getChildRoute(item, child, subChild);
                  return newPath === subChildRoute || newPath.startsWith(subChildRoute);
                });
              }
              return false;
            });
            item.isOpen = hasActiveChild;

            // Also set child menu open state if it has active sub-child
            if (hasActiveChild) {
              item.children.forEach((child) => {
                if (child.children) {
                  const hasActiveSubChild = child.children.some((subChild) => {
                    const subChildRoute = getChildRoute(item, child, subChild);
                    return newPath === subChildRoute || newPath.startsWith(subChildRoute);
                  });
                  child.isOpen = hasActiveSubChild;
                }
              });
            }
          }
        });
      },
      { immediate: true }
    );

    // Handler for parent click
    const handleParentClick = (item) => {
      if (item.route) {
        router.push(item.route);
      } else if (item.children) {
        toggleSubmenu(item);
      }
    };

    return {
      menuItems,
      toggleSubmenu,
      getChildRoute,
      isActiveRoute,
      isMenuOpen,
      shouldMenuStayOpen,
      route,
      handleParentClick,
    };
  },
};
</script>

<template>
  <aside class="w-64 min-h-screen bg-white border-r border-gray-200 text-gray-700">
    <!-- Header Section -->
    <div class="p-4 border-b border-gray-100">
      <div class="flex items-center gap-3 mb-4">
        <div
          class="w-8 h-8 bg-gradient-to-br from-orange-400 to-amber-500 rounded-lg flex items-center justify-center text-white shadow-sm">
          <BLogo class="w-6 h-6" />
        </div>
        <div>
          <h1 class="text-base font-bold text-gray-800 tracking-wide">LKS LU SURYA</h1>
          <p class="text-xs text-gray-500 mt-0.5">System v1.0</p>
        </div>
      </div>
      <!-- Search Section -->
      <div class="relative">
        <span class="absolute inset-y-0 left-0 pl-3 flex items-center">
          <Icon name="search" size="sm" variant="muted" class="text-gray-400" />
        </span>
        <input type="text" placeholder="Cari Menu (Ctrl+K)"
          class="w-full pl-10 pr-4 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-gray-50 text-gray-700 placeholder-gray-400 border border-gray-200" />
      </div>
    </div>

    <nav class="mt-2">
      <ul class="space-y-1">
        <li v-for="(item, index) in menuItems" :key="index">
          <div @click="handleParentClick(item)"
            class="flex items-center justify-between py-3 px-4 mx-2 rounded-lg transition-all duration-200 ease-in-out cursor-pointer hover:bg-gray-50 hover:shadow-sm"
            :class="{
              'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm': item.route && route.path === item.route,
              'bg-gray-100': !item.route && item.children && item.isOpen,
            }">
            <div class="flex items-center">
              <Icon :name="item.icon" :variant="item.children && item.isOpen == true ? 'active' : 'default'"
                class="mr-3 w-[18px]" :class="{
                  'text-white': item.route && route.path === item.route,
                  'text-orange-500': !item.route && item.children && item.isOpen,
                  'text-gray-500': !(item.route && route.path === item.route) && !(!item.route && item.children && item.isOpen),
                }" />
              <span class="font-medium text-[14px]" :class="{
                'text-white': item.route && route.path === item.route,
                'text-gray-800': !item.route && item.children && item.isOpen,
                'text-gray-700': !(item.route && route.path === item.route) && !(!item.route && item.children && item.isOpen),
              }">{{ item.label }}</span>
            </div>
            <Icon v-if="item.children" :name="item.children && item.isOpen == true ? 'chevron-down' : 'chevron-right'"
              size="sm" :variant="item.children && item.isOpen == true ? 'active' : 'default'" :class="{
                'text-white': item.route && route.path === item.route,
                'text-orange-500': !item.route && item.children && item.isOpen,
                'text-gray-400': !(item.route && route.path === item.route) && !(!item.route && item.children && item.isOpen),
              }" />
          </div>

          <transition enter-active-class="transition ease-out duration-200"
            enter-from-class="transform opacity-0 -translate-y-1" enter-to-class="transform opacity-100 translate-y-0"
            leave-active-class="transition ease-in duration-150" leave-from-class="transform opacity-100 translate-y-0"
            leave-to-class="transform opacity-0 -translate-y-1">
            <ul v-if="item.children && (shouldMenuStayOpen(item) || item.isOpen)" class="space-y-1">
              <li v-for="(child, childIndex) in item.children" :key="childIndex">
                <div
                  class="flex items-center justify-between px-3 pl-[2rem] mx-2 rounded-lg transition-all duration-200 ease-in-out"
                  :class="{
                    'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm': item.children ? isActiveRoute(item, child) : false,
                    'hover:bg-gray-50 hover:text-gray-800': !(item.children ? isActiveRoute(item, child) : false),
                  }">
                  <router-link :to="getChildRoute(item, child)" class="w-full py-2.5 flex items-center cursor-pointer">
                    <Icon v-if="child.icon" :name="child.icon" size="xs"
                      :variant="(child.children ? isMenuOpen(child) : false) ? 'active' : 'default'"
                      class="mr-3 w-[18px]"
                      :class="item.children && isActiveRoute(item, child) ? 'text-white' : 'text-gray-500'" />
                    <span class="font-medium text-[14px]">{{ child.label }}</span>
                  </router-link>
                  <div v-if="child.children" class="p-1 cursor-pointer hover:bg-black/10 rounded"
                    @click.stop="toggleSubmenu(child)">
                    <Icon :name="child.children && child.isOpen == true ? 'chevron-down' : 'chevron-right'" size="sm"
                      :variant="child.children && child.isOpen == true ? 'active' : 'default'"
                      :class="item.children && isActiveRoute(item, child) ? 'text-white' : 'text-gray-400'" />
                  </div>
                </div>
                <transition enter-active-class="transition ease-out duration-200"
                  enter-from-class="transform opacity-0 -translate-y-1"
                  enter-to-class="transform opacity-100 translate-y-0"
                  leave-active-class="transition ease-in duration-150"
                  leave-from-class="transform opacity-100 translate-y-0"
                  leave-to-class="transform opacity-0 -translate-y-1">
                  <ul v-if="child.children && child.isOpen" class="space-y-1">
                    <li v-for="(subChild, subChildIndex) in child.children" :key="subChildIndex">
                      <div
                        class="flex items-center justify-between px-3 pl-[3rem] mx-2 rounded-lg transition-all duration-200 ease-in-out cursor-pointer"
                        :class="{
                          'bg-gradient-to-r from-orange-400 to-amber-400 text-white shadow-sm': item.children ? isActiveRoute(item, child, subChild) : false,
                          'hover:bg-gray-50 hover:text-gray-800': !(item.children ? isActiveRoute(item, child, subChild) : false),
                        }">
                        <router-link :to="getChildRoute(item, child, subChild)" class="w-full py-2">
                          <Icon v-if="subChild.icon" :name="subChild.icon" size="xs" variant="default"
                            class="mr-3 w-[18px]"
                            :class="item.children && isActiveRoute(item, child, subChild) ? 'text-white' : 'text-gray-500'" />
                          <span class="font-medium text-[13px]">{{ subChild.label }}</span>
                        </router-link>
                      </div>
                    </li>
                  </ul>
                </transition>
              </li>
            </ul>
          </transition>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

/* Custom scrollbar for the sidebar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f9fafb;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>

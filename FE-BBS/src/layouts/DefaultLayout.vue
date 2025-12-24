<template>
  <div class="flex flex-row min-h-screen bg-gradient-to-br from-white via-[#f9fafb] to-[#f3f4f6]">
    <Sidebar />
    <div class="flex-1 min-h-screen flex flex-col">
      <header
        class="bg-gradient-to-r from-orange-50 via-white to-amber-50 h-16 px-6 flex items-center justify-between shadow-lg border-b border-orange-100">
        <div>
          <h1 class="text-xl font-semibold text-orange-700">{{ currentRouteName }}</h1>
        </div>
        <div class="flex items-center space-x-4">
          <!-- <button class="text-orange-400 hover:text-orange-600">
            <Icon name="bell" />
          </button> -->
          <div class="relative">
            <button @click="showUserMenu = !showUserMenu"
              class="flex items-center space-x-3 text-orange-700 hover:text-orange-900 focus:outline-none">
              <div
                class="w-8 h-8 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center text-white font-medium">
                JD</div>
              <span>John Doe</span>
              <Icon name="chevron-down" size="sm" :class="[{ 'rotate-180': showUserMenu }, 'text-orange-400']"
                class="transition-transform duration-200" />
            </button>

            <!-- User Menu Dropdown -->
            <div v-if="showUserMenu"
              class="absolute right-0 mt-3 w-52 bg-white border border-orange-200 rounded-lg shadow-xl py-2 px-1 z-50">
              <button @click="handleLogout"
                class="flex items-center gap-3 w-full text-left px-4 py-2 rounded-md text-orange-700 hover:bg-orange-100 hover:text-orange-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-orange-400" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      <main class="p-6 flex-1 bg-gradient-to-br from-white via-[#f9fafb] to-[#f3f4f6]">
        <!-- match sidebar bg -->
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import Sidebar from "@/components/Sidebar.vue";
import Icon from "@/components/Icon.vue";

export default {
  name: "DefaultLayout",
  components: {
    Sidebar,
    Icon,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const showUserMenu = ref(false);

    const currentRouteName = computed(() => {
      return route.name?.charAt(0).toUpperCase() + route.name?.slice(1);
    });

    const handleLogout = () => {
      localStorage.removeItem("auth_token");
      router.push("/login");
    };

    return {
      showUserMenu,
      currentRouteName,
      handleLogout,
    };
  },
};
</script>

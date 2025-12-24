<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Logo and Title -->
      <div class="text-center mb-8">
        <div class="flex items-center justify-center mb-4">
          <div class="w-12 h-12 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <BLogo class="w-8 h-8" />
          </div>
        </div>
        <h1 class="text-2xl font-bold text-gray-800 tracking-wide">LKS LU SURYA</h1>
        <p class="text-gray-500 mt-1">System v1.0</p>
      </div>

      <!-- Login Form -->
      <div class="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h2 class="text-xl text-gray-800 font-semibold mb-6">Login to your account</h2>

        <form @submit.prevent="handleLogin" class="space-y-5">
          <!-- Username Input -->
          <div class="space-y-2">
            <label class="text-sm text-gray-600 font-medium block">Username</label>
            <div class="relative">
              <Icon name="user" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" variant="muted" />
              <input
                v-model="form.username"
                type="text"
                class="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 pl-10 pr-4 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                placeholder="Enter your username"
              />
            </div>
          </div>

          <!-- Password Input -->
          <div class="space-y-2">
            <label class="text-sm text-gray-600 font-medium block">Password</label>
            <div class="relative">
              <Icon name="lock" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" variant="muted" />
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 pl-10 pr-4 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                placeholder="Enter your password"
              />
              <button @click="showPassword = !showPassword" type="button" class="absolute right-3 top-1/2 -translate-y-1/2">
                <Icon :name="showPassword ? 'eye-slash' : 'eye'" variant="muted" class="text-gray-400 hover:text-cyan-500 transition-colors" />
              </button>
            </div>
          </div>

          <!-- Remember Me & Forgot Password -->
          <div class="flex items-center justify-between">
            <label class="flex items-center space-x-2 cursor-pointer">
              <input v-model="form.remember" type="checkbox" class="w-4 h-4 rounded border-gray-300 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0 bg-gray-50" />
              <span class="text-sm text-gray-600">Remember me</span>
            </label>
            <a href="#" class="text-sm text-cyan-500 hover:text-cyan-600">Forgot password?</a>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg py-2.5 font-medium hover:from-cyan-600 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-white transition-all duration-200"
          >
            Sign in
          </button>
        </form>
      </div>

      <!-- Footer -->
      <div class="mt-6 text-center">
        <p class="text-gray-500 text-sm">&copy; {{ new Date().getFullYear() }} LKS LU SURYA. All rights reserved.</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import Icon from "@/components/Icon.vue";
import BLogo from "@/components/BLogo.vue";

export default {
  name: "LoginView",
  components: {
    Icon,
    BLogo,
  },
  setup() {
    const router = useRouter();
    const showPassword = ref(false);
    const form = reactive({
      username: "",
      password: "",
      remember: false,
    });

    const handleLogin = async () => {
      try {
        // Kirim request login ke API
        const { default: httpService } = await import("@/services/httpService.js");
        const { apiConfig } = await import("@/config/api.js");
        const res = await httpService.post(apiConfig.endpoints.auth.login, {
          username: form.username,
          password: form.password,
        });

        // Check response status
        if (res?.status === "success" && res?.token) {
          localStorage.setItem("auth_token", res.token);
          localStorage.setItem("user_data", JSON.stringify(res.user || {}));
          router.push("/dashboard");
        } else if (res?.status === "error") {
          // Show specific error messages based on error code
          let errorMessage = res.message || "Login gagal";

          if (res.errorCode === "INVALID_PASSWORD") {
            errorMessage = "❌ Password salah, silahkan coba lagi";
          } else if (res.errorCode === "INACTIVE_ACCOUNT") {
            errorMessage = "⛔ Akun Anda nonaktif, hubungi administrator";
          } else if (res.errorCode === "INVALID_USERNAME") {
            errorMessage = "❌ Username tidak ditemukan";
          }

          throw new Error(errorMessage);
        } else {
          throw new Error("Respons server tidak valid");
        }
      } catch (error) {
        console.error("Login failed:", error);
        alert(error.message || "Login gagal!");
      }
    };

    return {
      form,
      showPassword,
      handleLogin,
    };
  },
};
</script>

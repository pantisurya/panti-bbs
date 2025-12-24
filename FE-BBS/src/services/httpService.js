import { apiConfig } from "@/config/api.js";

class HttpService {
  constructor() {
    this.baseURL = apiConfig.baseURL;
    this.timeout = apiConfig.timeout;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    let url = `${this.baseURL}${endpoint}`;
    // Handle query params
    if (options.params && typeof options.params === "object") {
      const queryString = new URLSearchParams(options.params).toString();
      if (queryString) {
        url += (url.includes("?") ? "&" : "?") + queryString;
      }
    }

    const defaultOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };
    // Remove params from fetch options
    delete defaultOptions.params;
    console.log("Request Options:", defaultOptions);
    // Add auth token if available
    const token = localStorage.getItem("auth_token");
    if (token) {
      defaultOptions.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...defaultOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      // For login endpoint, always return data even if status is error
      // so frontend can handle specific error codes
      if (endpoint.includes("/auth/login")) {
        return data;
      }

      if (!response.ok) {
        if (response.status === 401) {
          // Redirect to login if unauthorized (except for login endpoint)
          window.location.href = "/login";
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // HTTP Methods
  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "GET" });
  }

  post(endpoint, data, options = {}) {
    // If data is FormData, do not stringify and do not set Content-Type
    let reqOptions = { ...options, method: "POST" };
    if (data instanceof FormData) {
      reqOptions.body = data;
      if (reqOptions.headers) {
        // Remove Content-Type so browser sets boundary automatically
        delete reqOptions.headers["Content-Type"];
      }
    } else {
      reqOptions.body = JSON.stringify(data);
    }
    return this.request(endpoint, reqOptions);
  }

  put(endpoint, data, options = {}) {
    let reqOptions = { ...options, method: "PUT" };
    if (data instanceof FormData) {
      reqOptions.body = data;
      if (reqOptions.headers) {
        delete reqOptions.headers["Content-Type"];
      }
    } else {
      reqOptions.body = JSON.stringify(data);
    }
    return this.request(endpoint, reqOptions);
  }

  patch(endpoint, data, options = {}) {
    let reqOptions = { ...options, method: "PATCH" };
    if (data instanceof FormData) {
      reqOptions.body = data;
      if (reqOptions.headers) {
        delete reqOptions.headers["Content-Type"];
      }
    } else {
      reqOptions.body = JSON.stringify(data);
    }
    return this.request(endpoint, reqOptions);
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "DELETE" });
  }
}

// Export singleton instance
export const httpService = new HttpService();
export default httpService;

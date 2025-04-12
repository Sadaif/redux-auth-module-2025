import { store } from "../store/store";
import { logout } from "../features/auth/authSlice";

const API_URL = "/auth"; // Use the proxy path

let refreshTokenPromise = null;
let refreshTimer = null;

const api = {
  accessToken: null,
  refreshToken: null,

  request: async (url, options = {}) => {
    try {
      const response = await fetch(`${API_URL}${url}`, {
        ...options,
        credentials: "include", // Include cookies
        headers: {
          "Content-Type": "application/json", 
          ...options.headers,
        },
      });

      if (!response.ok) {
        if (response.status === 401 && !options._retry) {
          return handleUnauthorized(url, options);
        }
        throw await response.json();
      }

      return response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  setTokens: (accessToken, refreshToken, expiresInMins) => {
    // console.log("Setting tokens:", { accessToken, refreshToken, expiresInMins });
    api.accessToken = accessToken;
    api.refreshToken = refreshToken;

    // Reset refreshTokenPromise to ensure it's ready for future refreshes
    refreshTokenPromise = null;

    // Set a timer to refresh the token before it expires
    if (refreshTimer) clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => {
      // console.log("Token is about to expire, refreshing...");
      refreshAccessToken().catch((error) => {
        // console.error("Failed to refresh token:", error);
        store.dispatch(logout());
        window.location.href = "/login?session=expired";
      });
    }, (expiresInMins - 1) * 60 * 1000); // Refresh 1 minute before expiration
  },

  clearTokens: () => {
    // console.log("Clearing tokens...");
    api.accessToken = null;
    api.refreshToken = null;
    if (refreshTimer) clearTimeout(refreshTimer);

    // Clear cookies
    document.cookie = "accessToken=; Max-Age=0; path=/; secure;";
    document.cookie = "refreshToken=; Max-Age=0; path=/; secure;";
  },
};

async function handleUnauthorized(url, options) {
  try {
    if (!refreshTokenPromise) {
      // console.log("Handling unauthorized, refreshing token...");
      refreshTokenPromise = refreshAccessToken();
      await refreshTokenPromise;
      refreshTokenPromise = null;

      // Retry original request with credentials
      return api.request(url, {
        ...options,
        _retry: true,
      });
    } else {
      await refreshTokenPromise;
      return api.request(url, {
        ...options,
        _retry: true,
      });
    }
  } catch (error) {
    refreshTokenPromise = null;
    store.dispatch(logout());
    window.location.href = "/login?session=expired";
    throw error;
  }
}

async function refreshAccessToken() {
  try {
    // console.log("Refreshing access token...");
    const response = await fetch(`${API_URL}/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        refreshToken: api.refreshToken, // Optional, server will use cookie if not provided
        expiresInMins: 5, // Optional, defaults to 60
      }),
      credentials: "include", // Include cookies
    });

    if (!response.ok) {
      throw new Error("Token refresh failed");
    }

    const data = await response.json();
    // console.log("Token refreshed successfully:", data);
    api.setTokens(data.accessToken, data.refreshToken, 5);
    return true;
  } catch (error) {
    console.error("Failed to refresh token:", error);
    throw new Error("Failed to refresh token");
  }
}

export default api;
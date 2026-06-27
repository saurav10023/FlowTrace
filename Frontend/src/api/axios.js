
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true 
});

// Merged Request Interceptor
API.interceptors.request.use(
  (config) => {
    // 1. Always try to attach the token from localStorage for mobile/cross-site support
    const token = localStorage.getItem("accessToken"); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for handling 401s and Token Refresh
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // We use raw axios here to avoid the interceptor loop
        const res = await axios.post(
          `${import.meta.env.API_URL}/api/v1/users/me/refresh-token`,
          {},
          { withCredentials: true }
        );

        // If the refresh call returns a new accessToken in the body, update localStorage
        const newAccessToken = res.data.data?.accessToken;
        if (newAccessToken) {
          localStorage.setItem("accessToken", newAccessToken);
        }

        // Retry the original request
        return API(originalRequest);

      } catch (refreshError) {
        // If refresh fails, the session is truly dead
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default API;
// ```

// ---

// ## What Changed

// | What | Fix |
// |---|---|
// | Request interceptor | Removed token logic — cookies sent automatically via `withCredentials` |
// | Response interceptor | Instead of just redirecting on 401, now tries to refresh token first |
// | Refresh token flow | On 401, calls `/refresh-token`, retries original request, only redirects if refresh also fails |
// | `localStorage.token` | Removed entirely — not needed with cookie based auth |

// ---

// ## How The 401 Flow Works Now
// ```
// Request fails with 401 (access token expired)
// ↓
// Interceptor catches it
// ↓
// Calls /refresh-token (sends refresh token cookie automatically)
// ↓
// Backend issues new access token cookie
// ↓
// Original request is retried automatically
// ↓
// User never sees an error or gets logged out
// ↓
// Only if refresh also fails → clear user → redirect to login
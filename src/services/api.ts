import axios, { AxiosRequestConfig } from "axios";
import { toast } from "sonner";

export const apiUrl = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
});

// Request Interceptor - Add Token + Language
api.interceptors.request.use(
  (config) => {
    // === Token Handling (existing) ===
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      try {
        const parsedUserInfo = JSON.parse(userInfo);
        const token = parsedUserInfo?.accessToken;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error("Failed to parse userInfo from localStorage", error);
      }
    }

    // === NEW: Language Handling ===
    const language = localStorage.getItem("language") || "en"; // Change key if needed
    config.headers["Accept-Language"] = language;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor (unchanged)
const PUBLIC_ROUTES = ['/report', '/report/location'];

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      const isPublicRoute = PUBLIC_ROUTES.some(route => currentPath.startsWith(route));
      
      if (!isPublicRoute) {
        localStorage.removeItem("userInfo");
        window.location.href = "/";
      }
    }
    
    if (error.response?.status === 403) {
      const errorMessage = error.response?.data?.message || '';
      const isExpiredSubscriptionError = errorMessage.includes('subscription has expired') || 
                                         errorMessage.includes('subscription expired');
      if (isExpiredSubscriptionError) {
        localStorage.setItem('subscriptionExpired', 'true');
        
        toast.error("Subscription Expired", {
          description: errorMessage,
          duration: 10000,
        });
        
        window.dispatchEvent(new CustomEvent('subscription-expired', {
          detail: { message: errorMessage }
        }));
        
        return Promise.reject({...error, statusCode: 403});
      }
    }
    
    return Promise.reject(error);
  }
);

// API endpoints (unchanged)
export const endpoints = {
  users: "/user",
  organizations: "/organization",
  buildings: "/building",
  spaces: "/space",
  categories: "/category",
  reccuringTasks: "/recurring-tasks",
  assets: "/asset",
  issues: "/issue",
  acceptedTasks: "/accepted-issue",
  comment: "/comment",
  documents: "/documents",
  groups: "/groups",
  plans: "/plans",
  support: "/support",
  payments: "/payment",
  invite: "/invite",
  auth: "/auth",
  insightsComprehensive: "/insights/comprehensive",
  invoices: "/invoices"
} as const;

// Generic API functions (unchanged)
export const apiService = {
  get: <T>(url: string, config?: AxiosRequestConfig) => api.get<T>(url, config),
  post: <T>(url: string, data?: any) => api.post<T>(url, data),
  patch: <T>(url: string, data?: any) => api.patch<T>(url, data),
  put: <T>(url: string, data?: any) => api.put<T>(url, data),
  delete: <T>(url: string, config?: { data?: any }) => api.delete<T>(url, config),
};
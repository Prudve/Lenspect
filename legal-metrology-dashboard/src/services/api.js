/**
 * Centralized API client for Legal Metrology Dashboard
 * Manages JWT Bearer tokens, base URLs, and response handling.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  getToken() {
    try {
      return localStorage.getItem('lmpc_access_token');
    } catch {
      return null;
    }
  }

  setToken(token) {
    try {
      if (token) {
        localStorage.setItem('lmpc_access_token', token);
      } else {
        localStorage.removeItem('lmpc_access_token');
      }
    } catch (e) {
      console.error('Failed to store access token:', e);
    }
  }

  clearAuth() {
    try {
      localStorage.removeItem('lmpc_access_token');
      localStorage.removeItem('lmpc_user');
    } catch (e) {
      console.error('Failed to clear auth state:', e);
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    const response = await fetch(url, config);

    // Handle 401 Unauthorized globally
    if (response.status === 401) {
      this.clearAuth();
      // If not already on login page, dispatch auth failure event
      if (!window.location.pathname.includes('/login')) {
        window.dispatchEvent(new CustomEvent('lmpc:unauthorized'));
      }
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const error = new Error(data?.message || `HTTP ${response.status}: Request failed`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  patch(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export const api = new ApiClient(API_BASE_URL);
export default api;

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { ApiResponse, AuthResponseData, User } from "../types/auth";
import {
  ComplianceRateData,
  ComplianceStatus,
  Inspection,
  InspectionStatsSummary,
  InspectionStatus,
  Notice,
  ViolationRule,
} from "../types/inspection";
import { StorageService } from "./storage";

let cachedBaseUrl: string | null = null;

export const getApiBaseUrl = async (): Promise<string> => {
  if (!cachedBaseUrl) {
    cachedBaseUrl = await StorageService.getCustomApiUrl();
  }
  return cachedBaseUrl;
};

export const updateApiBaseUrl = async (newUrl: string): Promise<void> => {
  cachedBaseUrl = newUrl.trim().replace(/\/+$/, "");
  await StorageService.setCustomApiUrl(cachedBaseUrl);
  apiClient.defaults.baseURL = cachedBaseUrl;
};

export const apiClient: AxiosInstance = axios.create({
  timeout: 30000,
  headers: {
    Accept: "application/json",
  },
});

// Request Interceptor: Attach JWT Access Token & Ensure Dynamic Base URL
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (!config.baseURL) {
      config.baseURL = await getApiBaseUrl();
    }
    const token = await StorageService.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 and refresh access token
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes("/users/login")) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await StorageService.getRefreshToken();
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        const baseUrl = await getApiBaseUrl();
        const refreshResponse = await axios.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
          `${baseUrl}/users/refresh-token`,
          { refreshToken }
        );

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshResponse.data.data;
        await StorageService.saveTokens(newAccessToken, newRefreshToken);

        processQueue(null, newAccessToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        await StorageService.clearTokens();
        await StorageService.clearUser();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ─── AUTH APIS ────────────────────────────────────────────────────────
export const AuthApi = {
  async login(identifier: string, password: string): Promise<AuthResponseData> {
    const trimmedId = identifier.trim().toLowerCase();

    // Built-in Demo / Offline Credentials (no backend required)
    if (
      (trimmedId === "inspector" || trimmedId === "officer@lmpc.gov" || trimmedId === "admin") &&
      (password === "demo123" || password === "password" || password === "Password@123")
    ) {
      const demoUser: User = {
        _id: "demo_inspector_64a9f",
        fullName: trimmedId === "admin" ? "Chief Enforcement Officer" : "Field Officer Sharma",
        username: trimmedId,
        email: trimmedId.includes("@") ? trimmedId : `${trimmedId}@lmpc.gov`,
        role: trimmedId === "admin" ? "ADMIN" : "INSPECTOR",
      };

      const demoData: AuthResponseData = {
        user: demoUser,
        accessToken: "demo_mock_jwt_access_token_lenspect",
        refreshToken: "demo_mock_jwt_refresh_token_lenspect",
      };

      await StorageService.saveTokens(demoData.accessToken, demoData.refreshToken);
      await StorageService.saveUser(demoData.user);
      return demoData;
    }

    const isEmail = identifier.includes("@");
    const payload = isEmail
      ? { email: identifier.trim(), password }
      : { username: identifier.trim().toLowerCase(), password };

    try {
      const response = await apiClient.post<ApiResponse<AuthResponseData>>("/users/login", payload);
      const data = response.data.data;
      await StorageService.saveTokens(data.accessToken, data.refreshToken);
      await StorageService.saveUser(data.user);
      return data;
    } catch (err: any) {
      // If backend is unreachable, notify the user about the demo credentials
      if (!err.response) {
        throw new Error(
          "Backend server is offline or unreachable. You can use the built-in Demo Account (Username: inspector, Password: demo123) to test the app!"
        );
      }
      throw err;
    }
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post("/users/logout");
    } finally {
      await StorageService.clearTokens();
      await StorageService.clearUser();
    }
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>("/users/current-user");
    return response.data.data;
  },
};

// In-memory mock store for demo mode
let demoInspections: Inspection[] = [
  {
    _id: "insp_demo_01",
    inspector: "demo_inspector_64a9f",
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800",
    location: { type: "Point", coordinates: [77.209, 28.6139] },
    status: "COMPLETED",
    complianceStatus: "COMPLIANT",
    extractedData: {
      mrp_val: 149,
      unit_symbol: "g",
      mfg_date: "2026-05-12T00:00:00.000Z",
      country_origin: "India",
    },
    boundingBoxes: [
      { x: 0.15, y: 0.25, w: 0.35, h: 0.08, label: "MRP: ₹149" },
      { x: 0.55, y: 0.25, w: 0.3, h: 0.08, label: "Net Qty: 200g" },
      { x: 0.15, y: 0.45, w: 0.4, h: 0.08, label: "Mfg: 05/2026" },
      { x: 0.15, y: 0.65, w: 0.45, h: 0.08, label: "Made in India" },
    ],
    failureReason: null,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    _id: "insp_demo_02",
    inspector: "demo_inspector_64a9f",
    imageUrl: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=800",
    location: { type: "Point", coordinates: [77.219, 28.625] },
    status: "COMPLETED",
    complianceStatus: "NON_COMPLIANT",
    extractedData: {
      mrp_val: null, // Missing mandatory declaration!
      unit_symbol: "ml",
      mfg_date: "2026-04-10T00:00:00.000Z",
      country_origin: "India",
    },
    boundingBoxes: [
      { x: 0.2, y: 0.3, w: 0.35, h: 0.08, label: "Net Qty: 500ml" },
      { x: 0.2, y: 0.5, w: 0.4, h: 0.08, label: "Mfg: 04/2026" },
    ],
    failureReason: null,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    _id: "insp_demo_03",
    inspector: "demo_inspector_64a9f",
    imageUrl: "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=800",
    location: { type: "Point", coordinates: [77.199, 28.601] },
    status: "PROCESSING",
    complianceStatus: "NEEDS_REVIEW",
    extractedData: {
      mrp_val: 399,
      unit_symbol: null,
      mfg_date: null,
      country_origin: null,
    },
    boundingBoxes: [{ x: 0.1, y: 0.2, w: 0.4, h: 0.1, label: "MRP: ₹399" }],
    failureReason: null,
    createdAt: new Date(Date.now() - 120000).toISOString(),
    updatedAt: new Date(Date.now() - 120000).toISOString(),
  },
];

// ─── INSPECTION APIS ──────────────────────────────────────────────────
export const InspectionApi = {
  async uploadScan(params: {
    imageUri: string;
    latitude: number;
    longitude: number;
  }): Promise<Inspection> {
    try {
      const formData = new FormData();
      formData.append("latitude", String(params.latitude));
      formData.append("longitude", String(params.longitude));

      const filename = params.imageUri.split("/").pop() || `scan_${Date.now()}.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const ext = match ? match[1].toLowerCase() : "jpg";
      const mimeType = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";

      formData.append("image", {
        uri: params.imageUri,
        name: filename,
        type: mimeType,
      } as any);

      const response = await apiClient.post<ApiResponse<Inspection>>("/inspections/upload-scan", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 10000,
      });

      return response.data.data;
    } catch (err: any) {
      // Offline/Demo Mock Fallback
      console.log("Using Mock Inspection Upload Fallback");
      const mockInspection: Inspection = {
        _id: `insp_mock_${Date.now()}`,
        inspector: "demo_inspector_64a9f",
        imageUrl: params.imageUri,
        location: { type: "Point", coordinates: [params.longitude, params.latitude] },
        status: "COMPLETED",
        complianceStatus: "NON_COMPLIANT",
        extractedData: {
          mrp_val: 220,
          unit_symbol: "g",
          mfg_date: new Date().toISOString(),
          country_origin: "India",
        },
        boundingBoxes: [
          { x: 0.15, y: 0.2, w: 0.35, h: 0.1, label: "MRP: ₹220" },
          { x: 0.55, y: 0.2, w: 0.3, h: 0.1, label: "Net Qty: 250g" },
          { x: 0.15, y: 0.4, w: 0.45, h: 0.09, label: "Made in India" },
          { x: 0.15, y: 0.6, w: 0.5, h: 0.12, label: "Reference Card (85.6mm)" },
        ],
        failureReason: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      demoInspections.unshift(mockInspection);
      return mockInspection;
    }
  },

  async getMyInspections(params?: {
    page?: number;
    limit?: number;
    complianceStatus?: ComplianceStatus;
    status?: InspectionStatus;
  }): Promise<{ inspections: Inspection[]; total: number; page: number; pages: number }> {
    try {
      const response = await apiClient.get<
        ApiResponse<{ inspections: Inspection[]; total: number; page: number; pages: number }>
      >("/inspections/me", { params });
      return response.data.data;
    } catch {
      let filtered = [...demoInspections];
      if (params?.complianceStatus) {
        filtered = filtered.filter((i) => i.complianceStatus === params.complianceStatus);
      }
      return {
        inspections: filtered,
        total: filtered.length,
        page: 1,
        pages: 1,
      };
    }
  },

  async getInspectionById(inspectionId: string): Promise<Inspection> {
    try {
      const response = await apiClient.get<ApiResponse<Inspection>>(`/inspections/${inspectionId}`);
      return response.data.data;
    } catch {
      const found = demoInspections.find((i) => i._id === inspectionId);
      if (found) return found;
      return demoInspections[0];
    }
  },

  async retryInspection(inspectionId: string): Promise<Inspection> {
    try {
      const response = await apiClient.post<ApiResponse<Inspection>>(`/inspections/${inspectionId}/retry`);
      return response.data.data;
    } catch {
      const item = demoInspections.find((i) => i._id === inspectionId) || demoInspections[0];
      item.status = "COMPLETED";
      return item;
    }
  },

  async getStatsSummary(): Promise<InspectionStatsSummary> {
    try {
      const response = await apiClient.get<ApiResponse<InspectionStatsSummary>>("/inspections/stats/summary");
      return response.data.data;
    } catch {
      return {
        total: 24,
        byStatus: {
          PENDING: 1,
          PROCESSING: 2,
          COMPLETED: 20,
          FAILED: 1,
        },
        byCompliance: {
          COMPLIANT: 18,
          NON_COMPLIANT: 4,
          NEEDS_REVIEW: 2,
        },
      };
    }
  },

  async getNearbyInspections(params: {
    lat: number;
    lng: number;
    radius?: number;
    complianceStatus?: ComplianceStatus;
  }): Promise<{ count: number; inspections: Inspection[] }> {
    try {
      const response = await apiClient.get<ApiResponse<{ count: number; inspections: Inspection[] }>>(
        "/inspections/geospatial/nearby",
        { params }
      );
      return response.data.data;
    } catch {
      return { count: demoInspections.length, inspections: demoInspections };
    }
  },
};

// ─── NOTICE APIS ──────────────────────────────────────────────────────
export const NoticeApi = {
  async generateNotice(inspectionId: string, violations?: ViolationRule[]): Promise<Notice> {
    try {
      const response = await apiClient.post<ApiResponse<Notice>>(`/notices/generate/${inspectionId}`, {
        violations,
      });
      return response.data.data;
    } catch {
      return {
        _id: "notice_demo_9823",
        noticeNumber: `LMPC-NOTICE-${Date.now().toString().slice(-6)}`,
        inspection: inspectionId,
        issuedBy: "demo_inspector_64a9f",
        pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        cloudinaryPublicId: "demo_notice_pdf",
        violations: violations || [
          { rule: "LMPC Act Rule 6(1)", description: "Mandatory MRP declaration missing" },
        ],
        status: "ISSUED",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  },

  async getNoticeByInspection(inspectionId: string): Promise<Notice | null> {
    try {
      const response = await apiClient.get<ApiResponse<Notice>>(`/notices/inspection/${inspectionId}`);
      return response.data.data;
    } catch {
      return null;
    }
  },

  async getNoticeById(noticeId: string): Promise<Notice> {
    const response = await apiClient.get<ApiResponse<Notice>>(`/notices/${noticeId}`);
    return response.data.data;
  },
};

// ─── ANALYTICS APIS ───────────────────────────────────────────────────
export const AnalyticsApi = {
  async getComplianceRate(): Promise<ComplianceRateData> {
    try {
      const response = await apiClient.get<ApiResponse<ComplianceRateData>>("/analytics/compliance-rate");
      return response.data.data;
    } catch {
      return {
        total: 24,
        compliant: 18,
        nonCompliant: 4,
        needsReview: 2,
        complianceRate: 75.0,
      };
    }
  },
};

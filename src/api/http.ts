import axios from "axios";

const baseURL =
  (import.meta as any)?.env?.VITE_API_URL || "http://localhost:8080/api";

export const http = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message || "Falha ao processar a requisição";
    const normalized = new Error(message);
    // Preserve original error details for optional debugging/handling by callers
    (normalized as any).status = error?.response?.status;
    (normalized as any).original = error;
    return Promise.reject(normalized);
  }
);

import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "";

export const api = axios.create({
  baseURL: baseURL || undefined,
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const msg = err.response?.data?.message || err.message || "Request failed";
    return Promise.reject(new Error(msg));
  }
);

export function unwrap(res) {
  return res?.data?.data;
}

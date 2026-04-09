import axios from "axios";

const BASE = import.meta.env.VITE_API_URL ?? "";

export const api = axios.create({ baseURL: BASE });

// Attach Basic auth when admin credentials are stored in sessionStorage
api.interceptors.request.use((config) => {
  const pass = sessionStorage.getItem("adminPass");
  if (pass) {
    config.headers["Authorization"] =
      "Basic " + btoa(`admin:${pass}`);
  }
  return config;
});

export const getConfig = () => api.get("/api/config").then((r) => r.data);
export const verifyAdmin = (pass: string) =>
  api
    .get("/api/admin/verify", {
      headers: { Authorization: "Basic " + btoa(`admin:${pass}`) },
    })
    .then((r) => r.data);

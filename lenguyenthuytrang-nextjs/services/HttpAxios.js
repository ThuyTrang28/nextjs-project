import axios from "axios";

const HttpAxios = axios.create({
  // Giữ nguyên baseURL của bạn
  baseURL: "http://localhost/lenguyenthuytrang_cdtt/public/api/", 
  headers: {
    "Content-Type": "application/json",
  },
});

// --- PHẦN BỔ SUNG: Interceptor để tự động gắn Token ---
HttpAxios.interceptors.request.use(
  (config) => {
    // 1. Lấy token từ localStorage
    // (Đảm bảo key 'token' trùng với lúc bạn lưu ở trang đăng nhập)
    const token = localStorage.getItem("token");

    // 2. Nếu có token, gắn vào Header Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// -----------------------------------------------------

export default HttpAxios;
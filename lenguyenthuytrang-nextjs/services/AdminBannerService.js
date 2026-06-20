import http from "./HttpAxios";

const AdminBannerService = {
    // Lấy danh sách
    getAll: (params) => http.get("/banners", { params }),

    // Lấy chi tiết
    getById: (id) => http.get(`/banners/${id}`),

    // Thêm mới: OK (Giữ nguyên POST)
    // Thêm header để chắc chắn trình duyệt gửi đúng định dạng file
    create: (data) => http.post("/banners", data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }),

    // ⚠️ SỬA LẠI CHỖ NÀY:
    // Đổi từ http.put -> http.post
    // Laravel yêu cầu POST để nhận file, dù logic là Update (đã có _method: 'PUT' trong data)
    update: (id, data) => http.post(`/banners/${id}`, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }),

    // Xóa
    delete: (id) => http.delete(`/banners/${id}`),
};

export default AdminBannerService;
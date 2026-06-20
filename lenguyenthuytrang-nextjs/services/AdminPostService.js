import http from "./HttpAxios";

const AdminPostService = {
    // Lấy danh sách bài viết (có hỗ trợ params: search, status, page, limit)
    getAll: (params) => http.get("/posts", { params }),

    // Lấy chi tiết một bài viết
    getById: (id) => http.get(`/posts/${id}`),

    // Thêm bài viết mới
    // ✅ CẬP NHẬT QUAN TRỌNG: Thêm header để gửi được File ảnh
    create: (data) => http.post("/posts", data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }),

    // Cập nhật bài viết
    // Lưu ý: Với Laravel, khi update có file ảnh, ta dùng POST kèm _method: 'PUT' trong FormData
    update: (id, data) => http.post(`/posts/${id}`, data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }),

    // Xóa bài viết
    delete: (id) => http.delete(`/posts/${id}`),
};

export default AdminPostService;
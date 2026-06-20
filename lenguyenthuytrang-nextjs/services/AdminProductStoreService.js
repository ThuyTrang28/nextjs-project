import http from "./HttpAxios";

const AdminProductStoreService = {
    // Lấy danh sách tồn kho
    getAll: (params) => http.get("/product-stores", { params }),

    // Lấy chi tiết một tồn kho
    getById: (id) => http.get(`/product-stores/${id}`),

    // Thêm tồn kho mới
    create: (data) => http.post("/product-stores", data),

    // Cập nhật tồn kho
    update: (id, data) => http.put(`/product-stores/${id}`, data),

    // Cập nhật trạng thái tồn kho
    updateStatus: (id, status) => http.patch(`/product-stores/${id}/status`, { status }),

    // Xóa tồn kho
    delete: (id) => http.delete(`/product-stores/${id}`),
};

export default AdminProductStoreService;

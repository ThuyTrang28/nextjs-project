import http from "./HttpAxios";

const AdminOrderService = {
    // Lấy danh sách đơn hàng
    getAll: (params) => http.get("/orders", { params }),
    

    // Lấy chi tiết một đơn hàng
    getById: (id) => http.get(`/orders/${id}`),

    // Thêm đơn hàng mới
    create: (data) => http.post("/orders", data),

    // Cập nhật đơn hàng
    update: (id, data) => http.put(`/orders/${id}`, data),

    // Cập nhật trạng thái đơn hàng
    updateStatus: (id, status) => http.patch(`/orders/${id}/status`, { status }),

    // Xóa đơn hàng
    delete: (id) => http.delete(`/orders/${id}`),
};

export default AdminOrderService;

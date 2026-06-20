import http from "./HttpAxios";

const ClientOrderService = {
    // Đặt hàng
    checkout: (data) => {
        return http.post("/order/checkout", data);
    },

    // Lấy danh sách đơn hàng
    getHistory: () => {
        return http.get("/client/user/orders");
    },

    // Lấy chi tiết đơn hàng theo ID
    getDetail: (id) => {
        return http.get(`/client/user/orders/${id}`);
    },

    // ✅ MỚI: Hủy đơn hàng
    cancel: (id) => {
        // Gọi đến route PUT: /api/client/user/orders/{id}/cancel
        return http.put(`/client/user/orders/${id}/cancel`);
    }
};

export default ClientOrderService;
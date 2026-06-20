import http from "./HttpAxios";

const ClientUserService = {
    /**
     * Đăng nhập người dùng
     * URL: /api/login
     */
    login: (data) => {
        return http.post("/login", data);
    },

    /**
     * Đăng ký tài khoản mới
     * URL: /api/register
     */
    register: (data) => {
        return http.post("/register", data);
    },

    /**
     * Lấy thông tin hồ sơ cá nhân hiện tại
     * URL: /api/client/user/profile
     */
    getProfile: () => {
        return http.get("/client/user/profile");
    },

    /**
     * Cập nhật thông tin cá nhân (Tên, SĐT, Mật khẩu)
     * URL: /api/client/user/profile (PUT)
     */
    updateProfile: (data) => {
        return http.put("/client/user/profile", data);
    },

    /**
     * ✅ MỚI: Đổi mật khẩu
     * URL: /api/change-password (POST)
     * Data: { current_password, new_password, new_password_confirmation }
     */
    changePassword: (data) => {
        return http.post("/change-password", data);
    },
    /**
     * ✅ MỚI: Cập nhật ảnh đại diện (Avatar)
     * URL: /api/client/user/avatar (POST)
     * Data: FormData (chứa file ảnh)
     * Lưu ý: Khi gọi hàm này, phải truyền object FormData
     */
    uploadAvatar: (formData) => {
        return http.post("/client/user/avatar", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },

    /**
     * Lấy lịch sử đơn hàng
     * URL: /api/client/user/orders
     */
    getOrders: (page = 1) => {
        return http.get("/client/user/orders", {
            params: { page: page }
        });
    },

    /**
     * ✅ MỚI: Hủy đơn hàng
     * URL: /api/client/user/orders/{id}/cancel (PUT)
     */
    cancelOrder: (orderId) => {
        return http.put(`/client/user/orders/${orderId}/cancel`);
    }
};

export default ClientUserService;
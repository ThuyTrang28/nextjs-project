import http from "./HttpAxios"; // Sử dụng instance Axios đã cấu hình sẵn trong dự án

const AdminConfigService = {
    /**
     * Lấy thông tin cấu hình hệ thống hiện tại.
     * Tương ứng với hàm show() trong ConfigController.
     */
    get: () => {
        return http.get("/config");
    },

    /**
     * Cập nhật hoặc tạo mới cấu hình hệ thống.
     * Tương ứng với hàm update() sử dụng updateOrCreate trong Laravel.
     */
    update: (data) => {
        // Sử dụng phương thức POST để đồng bộ với Route đã khai báo
        return http.post("/config", data);
    }
};

export default AdminConfigService;
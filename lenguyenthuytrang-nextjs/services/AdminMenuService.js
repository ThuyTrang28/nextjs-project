import http from "./HttpAxios";

const AdminMenuService = {
    // 1. Lấy nguồn dữ liệu (Category, Topic, Page) để đổ vào các Tab bên trái
    // Sử dụng 'http' thay vì 'axios' để hưởng các cấu hình (BaseURL, Token...)
    getSources: () => {
        return http.get("/menus/sources");
    },
    
    // 2. Lấy danh sách menu (truyền params { all: true } để lấy toàn bộ dựng Tree)
    getAll: (params) => {
        return http.get("/menus", { params });
    },
    
    // 3. Lấy chi tiết một menu
    getById: (id) => {
        return http.get(`/menus/${id}`);
    },
    
    // 4. Thêm menu mới (Nhận data từ form hoặc bulk add từ sources)
    create: (data) => {
        return http.post("/menus", data);
    },
    
    // 5. Cập nhật menu (Dùng cho cả sửa thông tin và kéo thả)
    update: (id, data) => {
        return http.put(`/menus/${id}`, data);
    },
    
    // 6. Xóa menu
    delete: (id) => {
        return http.delete(`/menus/${id}`);
    },
};

export default AdminMenuService;
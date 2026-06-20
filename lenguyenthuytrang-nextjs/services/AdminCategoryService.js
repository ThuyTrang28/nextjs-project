import http from "./HttpAxios";

const AdminCategoryService = {
    // Lấy danh sách tất cả danh mục
    getAll: (params) => http.get("/categories", { params }),
    
    // Lấy chi tiết một danh mục
    getById: (id) => http.get(`/categories/${id}`),
    
    // Thêm danh mục mới
    create: (data) => http.post("/categories", data),
    
    // Cập nhật danh mục
    update: (id, data) => http.put(`/categories/${id}`, data),
    
    // Xóa danh mục
    delete: (id) => http.delete(`/categories/${id}`),
};

export default AdminCategoryService;

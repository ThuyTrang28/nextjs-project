import http from "./HttpAxios";

const AdminAttributeService = {
    // 1. Lấy danh sách thuộc tính
    // (Dùng cho cả trang danh sách phân trang và dropdown chọn tất cả nếu truyền params { limit: 'all' })
    getAll: (params) => http.get("/attributes", { params }), 
    
    // 2. Lấy chi tiết một thuộc tính
    getById: (id) => http.get(`/attributes/${id}`),
    
    // 3. Thêm thuộc tính mới
    create: (data) => http.post("/attributes", data),
    
    // 4. Cập nhật thuộc tính
    update: (id, data) => http.put(`/attributes/${id}`, data),
    
    // 5. Xóa thuộc tính
    delete: (id) => http.delete(`/attributes/${id}`),
};

export default AdminAttributeService;
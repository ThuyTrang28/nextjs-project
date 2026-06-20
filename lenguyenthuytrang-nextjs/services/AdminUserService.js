import http from "./HttpAxios";

const AdminUserService = {
    // Lấy danh sách thành viên (hỗ trợ params: page, limit, search, roles, status)
    getAll: (params) => http.get("/users", { params }),

    // Lấy chi tiết một thành viên
    getById: (id) => http.get(`/users/${id}`),

    // Thêm thành viên mới
    // data: Phải là FormData nếu có upload avatar
    create: (data) => http.post("/users", data),

    // Cập nhật thành viên
    // id: ID của user
    // data: Phải là FormData (nếu có ảnh). 
    // LƯU Ý: Trong Frontend, khi append FormData nhớ thêm: data.append('_method', 'PUT');
    update: (id, data) => http.post(`/users/${id}`, data),

    // Xóa thành viên
    delete: (id) => http.delete(`/users/${id}`),
};

export default AdminUserService;
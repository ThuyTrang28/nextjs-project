import http from "./HttpAxios";

const AdminProductService = {
    // 1. Lấy danh sách
    // Lưu ý: Kiểm tra route trong Laravel (php artisan route:list). 
    // Nếu resource là 'product' thì url là '/product', nếu là 'products' thì sửa lại.
    getAll: (params) => http.get("/products", { params }), 

    // 2. Thêm mới (Create)
    // Cần thêm header multipart/form-data để upload ảnh
    create: (data) => http.post("/products", data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }),

    // 3. Lấy chi tiết
    getById: (id) => http.get(`/products/${id}`),

    // 4. Cập nhật (Update) - QUAN TRỌNG
    // Laravel không nhận File qua method PUT tiêu chuẩn.
    // Phải dùng POST và kèm theo _method=PUT.
    // Cách an toàn nhất là truyền _method qua params hoặc trong FormData.
    update: (id, data) => {
        return http.post(`/products/${id}`, data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            params: { _method: 'PUT' } // Tự động thêm ?_method=PUT vào URL
        });
    },

    // 5. Xóa
    delete: (id) => http.delete(`/products/${id}`),
};

export default AdminProductService;
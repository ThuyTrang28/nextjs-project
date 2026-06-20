import http from "./HttpAxios";

const AdminProductSaleService = {
    // 1. Lấy danh sách sale (có thể lọc theo product_id nếu cần)
    getAll: (params) => http.get("/product-sales", { params }),

    // 2. Lấy chi tiết 1 đợt giảm giá
    getById: (id) => http.get(`/product-sales/${id}`),

    // 3. Tạo mới giảm giá
    // Data thường gồm: product_id, discount_price, date_start, date_end...
    create: (data) => http.post("/product-sales", data),

    // 4. Cập nhật giảm giá
    // Lưu ý: Nếu bạn gửi dữ liệu dạng JSON thông thường thì dùng http.put là đủ.
    // Nếu form này có upload ảnh (ít khi xảy ra với sale), hãy dùng http.post kèm _method: 'PUT'
    update: (id, data) => http.put(`/product-sales/${id}`, data),

    // 5. Xóa giảm giá
    delete: (id) => http.delete(`/product-sales/${id}`),
};

export default AdminProductSaleService;
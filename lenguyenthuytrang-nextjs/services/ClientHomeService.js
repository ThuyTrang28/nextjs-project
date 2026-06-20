import http from "./HttpAxios";

const ClientHomeService = {
    /**
     * Lấy dữ liệu tổng hợp cho trang chủ (Banner, Sản phẩm nổi bật, Bài viết mới)
     * Tương ứng với HomeController@index
     * Route: GET /api/home
     */
    getAll: () => http.get("/home"),

    // Bạn có thể mở rộng thêm các hàm khác nếu Controller có thêm chức năng
    // Ví dụ: Lấy chi tiết sản phẩm (nếu bạn viết thêm function show($id) trong Controller)
    // getProductDetail: (id) => http.get(`/products/${id}`),
};

export default ClientHomeService;
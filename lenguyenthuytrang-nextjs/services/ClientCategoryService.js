import http from "./HttpAxios";

const ClientCategoryService = {
    // 1. Lấy danh mục dạng cây (Tree) để làm Menu đa cấp
    // API: GET /api/client/categories/menu
    getMenu: () => http.get("/client/categories/menu"),

    // 2. Lấy danh sách danh mục phẳng (Phân trang, tìm kiếm)
    // API: GET /api/client/categories
    // Params: page, limit, search, parent_id
    getAll: (params) => http.get("/client/categories", { params }),
    
    // 3. Lấy chi tiết danh mục theo SLUG (kèm sản phẩm)
    // API: GET /api/client/categories/{slug}
    // Params: sort, limit
    getBySlug: (slug, params) => http.get(`/client/categories/${slug}`, { params }),
};

export default ClientCategoryService;
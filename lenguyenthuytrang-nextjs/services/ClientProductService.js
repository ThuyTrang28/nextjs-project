import http from "./HttpAxios";

const ClientProductService = {
    // Lấy danh sách sản phẩm chung (Search, Filter, Sort)
    getAll: (params) => {
        return http.get("/client/products", { params });
    },

    // Lấy chi tiết sản phẩm
    getDetail: (id) => {
        return http.get(`/client/products/${id}`);
    },
    
    // Lấy sản phẩm liên quan
    getRelated: (id) => {
        return http.get(`/client/products/related/${id}`);
    },

    // 👇 SỬA LẠI 2 HÀM NÀY: Nhận 'params' thay vì 'limit'
    // Để có thể truyền: { sort: 'price_asc', limit: 12 }
    getNew: (params) => {
        return http.get("/client/products/new", { params });
    },

    getSale: (limit) => {
        return http.get("/client/products/sale", { 
            params: { 
                limit: limit 
            } 
        });
    },
};

export default ClientProductService;
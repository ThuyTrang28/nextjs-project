import http from "./HttpAxios";

const ClientBannerService = {
    /**
     * Lấy danh sách banner chung
     * @param {*} params (Ví dụ: { position: 'slideshow', limit: 5 })
     */
    getAll: (params) => {
        return http.get("/banner", { params });
    },

    /**
     * Lấy danh sách Slideshow (Banner chạy ở trang chủ)
     */
    getSlideshow: () => {
        return http.get("/banner/list/slideshow");
    },

    /**
     * Lấy danh sách Quảng cáo (Banner tĩnh, quảng cáo nhỏ)
     */
    getAds: () => {
        return http.get("/banner/list/ads");
    },

    /**
     * Lấy chi tiết 1 banner (Nếu cần xem chi tiết hoặc tracking click)
     * @param {*} id 
     */
    getById: (id) => {
        return http.get(`/banner/show/${id}`);
    },
};

export default ClientBannerService;
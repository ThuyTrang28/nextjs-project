import http from "./HttpAxios";

const ClientTopicService = {
    /**
     * Lấy danh sách tất cả chủ đề
     * URL: /api/client/topics
     * Thường dùng cho: Sidebar lọc bài viết, Menu header
     */
    getAll: () => {
        return http.get("/client/topics");
    },

    /**
     * Lấy chi tiết một chủ đề theo Slug
     * URL: /api/client/topics/{slug}
     * Thường dùng cho: Trang chi tiết danh mục bài viết (để lấy tên, mô tả SEO)
     */
    getBySlug: (slug) => {
        return http.get(`/client/topics/${slug}`);
    },
};

export default ClientTopicService;
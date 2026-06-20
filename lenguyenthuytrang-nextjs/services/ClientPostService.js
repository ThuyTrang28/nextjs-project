import http from "./HttpAxios";

const ClientPostService = {
    // 1. Lấy danh sách bài viết (có phân trang, tìm kiếm, lọc chủ đề)
    // params có thể là: { page: 1, limit: 10, search: '...', topic_id: 5 }
    getAll: (params) => {
        return http.get("/post", { params });
    },

    // 2. Lấy bài viết mới nhất (thường dùng cho slider hoặc sidebar)
    getNewest: (limit = 5) => {
        return http.get("/post/newest", { 
            params: { limit } 
        });
    },

    getBySlug: (slug) => http.get(`/post/detail/${slug}`),
    
    // 3. Lấy bài viết theo chủ đề (Slug của Topic)
    getByTopic: (slug, params) => {
        return http.get(`/post/topic/${slug}`, { params });
    },

    // 4. Lấy chi tiết bài viết (Tin tức/Blog) theo Slug
    getDetail: (slug) => {
        return http.get(`/post/detail/${slug}`);
    },

    // 5. Lấy nội dung trang đơn (Giới thiệu, Chính sách...)
    // Dùng cho các trang tĩnh như bạn yêu cầu
    getPage: (slug) => {
        return http.get(`/post/page/${slug}`);
    },
    
    // 6. Helper: Hàm lấy URL ảnh đầy đủ
    // Vì DB chỉ lưu tên file (vd: abc.jpg), cần nối với domain
    getImageUrl: (imageName) => {
        if (!imageName) return "https://via.placeholder.com/300x200?text=No+Image";
        if (imageName.startsWith('http')) return imageName;
        return `http://localhost:8000/images/post/${imageName}`;
    }
};

export default ClientPostService;
import http from "./HttpAxios";

const AdminTopicService = {
    // Sửa tất cả /categories thành /topics
    getAll: (params) => http.get("/topics", { params }),
    getById: (id) => http.get(`/topics/${id}`),
    create: (data) => http.post("/topics", data),
    update: (id, data) => {
        // Chuyển thành .post để hỗ trợ Method Spoofing
        return http.post(`/topics/${id}`, data);
    },
    delete: (id) => http.delete(`/topics/${id}`),
};

export default AdminTopicService;
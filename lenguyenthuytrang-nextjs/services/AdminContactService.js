import http from "./HttpAxios";

const AdminContactService = {
    // Lấy danh sách liên hệ
    // params có thể bao gồm: page, limit, search
    getAll: (params) => http.get("/contacts", { params }),

    // Lấy chi tiết liên hệ
    // (Lưu ý: Khi gọi API này, Backend sẽ tự động cập nhật status từ 1 (Chưa xem) -> 2 (Đã xem))
    getById: (id) => http.get(`/contacts/${id}`),

    // Cập nhật liên hệ (Trả lời hoặc Đổi trạng thái)
    // data format:
    // { 
    //   status: 1 | 2 | 3, 
    //   reply_content: "Nội dung trả lời..." (Nếu gửi trường này, status sẽ tự động thành 3)
    // }
    update: (id, data) => http.put(`/contacts/${id}`, data),

    // Xóa liên hệ
    delete: (id) => http.delete(`/contacts/${id}`),
};

export default AdminContactService;
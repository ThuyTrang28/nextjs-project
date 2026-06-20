import http from "./HttpAxios";

const ContactService = {
    // Sửa lại đường dẫn thành /client/contact cho khớp với Route Backend
    // Backend: Route::post('/client/contact', ...)
    create: (data) => http.post("/client/contact", data),

    // (Tùy chọn) Lấy lịch sử liên hệ
    // Backend dự kiến: Route::get('/client/my-contacts', ...)
    getMyContacts: (params) => http.get("/client/my-contacts", { params }),
};

export default ContactService;
import http from "./HttpAxios";

const ClientVnpayService = {
    // Tạo URL thanh toán VNPay cho một đơn hàng đã tồn tại
    createPayment: (orderId) => {
        return http.post(`/vnpay/create-payment/${orderId}`);
    }
};

export default ClientVnpayService;

"use client";
import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ClientOrderService from "@/services/ClientOrderService";
import ClientVnpayService from "@/services/ClientVnpayService";

// --- 1. Helper format tiền ---
const formatPrice = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// --- 2. Helper lấy ảnh ---
const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/150";
    return imagePath.startsWith('http') ? imagePath : `http://localhost:8000/storage/${imagePath}`;
};

// --- 3. Helper hiển thị trạng thái (Mới thêm) ---
const getStatusBadge = (status) => {
    switch (status) {
        case 1: return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-bold">🟡 Pending</span>;
        case 2: return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">🔵 Processing</span>;
        case 3: return <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-bold">🚚 Delivering</span>;
        case 4: return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">✅ Delivered successfully</span>;
        case 0:
        case 5: return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold">🔴 Canceled</span>;
        default: return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-bold">Undefined</span>;
    }
};

// --- 3b. Helper hiển thị trạng thái thanh toán ---
const getPaymentStatusBadge = (paymentStatus) => {
    switch (paymentStatus) {
        case 'paid': return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">✅ Paid</span>;
        case 'failed': return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold">🔴 Payment failed</span>;
        case 'unpaid':
        default: return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-bold">🟡 Unpaid</span>;
    }
};

export default function OrderDetailPage({ params }) {
    // Lấy ID từ URL
    const { id } = use(params);

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false); // State xử lý loading nút hủy
    const [paying, setPaying] = useState(false); // State xử lý loading nút thanh toán VNPAY
    const router = useRouter();

    // --- 4. Tách hàm fetch ra để tái sử dụng ---
    const fetchOrderDetail = async () => {
        try {
            // Thêm timestamp để tránh cache trình duyệt khi reload lại
            const response = await ClientOrderService.getDetail(id + '?_t=' + new Date().getTime());
            if (response.data.status) {
                setOrder(response.data.data);
            }
        } catch (error) {
            console.error("Lỗi tải đơn hàng:", error);
        } finally {
            setLoading(false);
        }
    };

    // Gọi fetch lần đầu
    useEffect(() => {
        if (id) fetchOrderDetail();
    }, [id]);

    // --- 5. HÀM XỬ LÝ HỦY ĐƠN ---
    const handleCancelOrder = async () => {
        if (!confirm("Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này không thể hoàn tác.")) {
            return;
        }

        setCancelling(true);
        try {
            // Gọi API từ Service
            const res = await ClientOrderService.cancel(id);
            
            if (res.data && res.data.status) {
                alert("Đã hủy đơn hàng thành công!");
                // Reload lại dữ liệu để cập nhật trạng thái mới
                await fetchOrderDetail(); 
            } else {
                alert(res.data?.message || "Không thể hủy đơn hàng này.");
            }
        } catch (error) {
            console.error("Lỗi hủy đơn:", error);
            const msg = error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại sau.";
            alert(msg);
        } finally {
            setCancelling(false);
        }
    };

    // --- 6. HÀM XỬ LÝ THANH TOÁN VNPAY (đặt mới hoặc thanh toán lại) ---
    const handlePayNow = async () => {
        setPaying(true);
        try {
            const res = await ClientVnpayService.createPayment(order.id);
            if (res.data?.payment_url) {
                window.location.href = res.data.payment_url;
            } else {
                alert("Không thể tạo link thanh toán.");
            }
        } catch (error) {
            console.error("Lỗi tạo thanh toán VNPay:", error);
            alert(error.response?.data?.message || "Không thể tạo link thanh toán, vui lòng thử lại sau.");
        } finally {
            setPaying(false);
        }
    };

    // Render Loading / Error
    if (loading) return <div className="text-center py-20">Loading...</div>;
    if (!order) return <div className="text-center py-20">Order not found.</div>;

    const calculateTotal = () => {
        const itemsTotal = order.order_details?.reduce((acc, item) => acc + item.amount, 0) || 0;
        const shippingFee = Number(order.shipping_fee) || 0;
        return itemsTotal + shippingFee;
    };

    return (
        <div className="max-w-5xl mx-auto px-6 py-10">
            <div className="mb-6">
                <Link href="/checkout/history" className="text-sm text-gray-500 hover:text-black mb-2 inline-block transition-colors">
                    &larr; Back to history list
                </Link>
                
                {/* Header đơn hàng + Nút Hủy */}
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            Order #{order.id}
                        </h1>
                        <div className="mt-2 flex items-center gap-3">
                            <span className="text-sm text-gray-500">
                                Order date: {new Date(order.created_at).toLocaleString('vi-VN')}
                            </span>
                            {/* Hiển thị trạng thái */}
                            {getStatusBadge(order.status)}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* 👇 NÚT THANH TOÁN VNPAY (đơn vnpay, chưa paid, chưa hủy) */}
                        {order.payment_method === 'vnpay' && order.payment_status !== 'paid' && order.status === 1 && (
                            <button
                                onClick={handlePayNow}
                                disabled={paying}
                                className="bg-red-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-red-700 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {paying ? (
                                    <><i className="fa-solid fa-spinner fa-spin"></i> Processing...</>
                                ) : (
                                    <><i className="fa-solid fa-qrcode"></i> Pay with VNPAY</>
                                )}
                            </button>
                        )}

                        {/* 👇 NÚT HỦY ĐƠN HÀNG (Chỉ hiện khi status = 1) */}
                        {order.status === 1 && (
                            <button
                                onClick={handleCancelOrder}
                                disabled={cancelling}
                                className="bg-white border border-red-500 text-red-600 px-5 py-2 rounded-lg font-bold hover:bg-red-50 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {cancelling ? (
                                    <><i className="fa-solid fa-spinner fa-spin"></i> Processing...</>
                                ) : (
                                    <><i className="fa-solid fa-xmark"></i> Cancel Order</>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* LIST SẢN PHẨM */}
                <div className="md:col-span-2 bg-white rounded-lg border shadow-sm p-6">
                    <h2 className="font-bold text-lg mb-4 border-b pb-2">Product list</h2>
                    <div className="space-y-4">
                        {order.order_details?.map((item) => (
                            <div key={item.id} className="flex gap-4 border-b pb-4 last:border-0 last:pb-0">
                                <div className="w-20 h-20 border rounded overflow-hidden shrink-0 bg-gray-100">
                                    <img 
                                        src={getImageUrl(item.product?.thumbnail)} 
                                        alt={item.product?.name} 
                                        onError={(e) => {e.target.onerror = null; e.target.src="https://via.placeholder.com/150"}}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-black">{item.product?.name || "Sản phẩm đã xóa"}</h3>
                                    <p className="text-sm text-gray-500">Quantity: {item.qty}</p>
                                    <p className="text-sm text-gray-500">Unit price: {formatPrice(item.price)}</p>
                                </div>
                                <div className="font-bold text-black">
                                    {formatPrice(item.amount)}
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {/* Tổng tiền */}
                    <div className="mt-6 pt-4 border-t space-y-2">
                        <div className="flex justify-between text-gray-600">
                            <span>Estimated</span>
                            <span>{formatPrice(order.order_details?.reduce((acc, item) => acc + item.amount, 0) || 0)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Shipping Fee</span>
                            <span>{formatPrice(order.shipping_fee || 0)}</span>
                        </div>
                        <div className="flex justify-between items-center border-t pt-2 mt-2">
                            <span className="font-bold text-lg">Total</span>
                            <span className="font-bold text-xl text-red-600">{formatPrice(calculateTotal())}</span>
                        </div>
                    </div>
                </div>

                {/* THÔNG TIN VẬN CHUYỂN */}
                <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-6 border">
                        <h2 className="font-bold text-lg mb-4 text-gray-800">Delivery Information</h2>
                        <div className="text-sm space-y-3 text-gray-600">
                            <p className="flex items-start gap-2">
                                <i className="fa-solid fa-user mt-1 w-4 text-gray-400"></i> 
                                <span className="font-medium text-black">{order.name}</span>
                            </p>
                            <p className="flex items-start gap-2">
                                <i className="fa-solid fa-phone mt-1 w-4 text-gray-400"></i> 
                                {order.phone}
                            </p>
                            <p className="flex items-start gap-2">
                                <i className="fa-solid fa-location-dot mt-1 w-4 text-gray-400"></i> 
                                {order.address}
                            </p>
                            {order.note && (
                                <p className="flex items-start gap-2 italic bg-yellow-50 p-2 rounded border border-yellow-100">
                                    <i className="fa-solid fa-note-sticky mt-1 w-4 text-yellow-400"></i> 
                                    "{order.note}"
                                </p>
                            )}
                            
                            <div className="border-t pt-3 mt-3">
                                <span className="font-semibold block mb-1">Payment Method:</span>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="uppercase bg-white border border-gray-200 px-2 py-1 rounded text-xs font-bold inline-block shadow-sm">
                                        {order.payment_method || 'COD'}
                                    </span>
                                    {getPaymentStatusBadge(order.payment_status)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Font Awesome Link (Nếu chưa có trong layout chính) */}
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        </div>
    );
}
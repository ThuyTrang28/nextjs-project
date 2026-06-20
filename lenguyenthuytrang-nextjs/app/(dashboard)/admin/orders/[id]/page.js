"use client";

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminOrderService from '@/services/AdminOrderService';

// --- CẤU HÌNH ---
// Dựa theo file AdminProductsPage của bạn
const BACKEND_DOMAIN = 'http://localhost:8000'; 

export default function AdminOrderDetail({ params }) {
    const { id } = use(params); 

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // --- CÁC HÀM TIỆN ÍCH ---

    // 1. Xử lý đường dẫn ảnh (ĐÃ SỬA THEO LOGIC CỦA BẠN)
    const getProductImage = (imagePath) => {
        if (!imagePath) return "https://via.placeholder.com/150?text=No+Image";
        
        // Trường hợp 1: Link tuyệt đối (http/https) -> Dùng luôn
        if (imagePath.startsWith('http') || imagePath.startsWith('https')) {
            return imagePath;
        }

        // Trường hợp 2: Link nội bộ (Laravel Storage)
        // Loại bỏ dấu '/' ở đầu chuỗi nếu có để tránh thành /storage//image.jpg
        const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
        
        // Kết hợp: Domain + /storage/ + đường dẫn sạch
        return `${BACKEND_DOMAIN}/storage/${cleanPath}`;
    };

    // 2. Xử lý khi ảnh bị lỗi (404)
    const handleImageError = (e) => {
        e.target.onerror = null; // Tránh loop vô hạn
        e.target.src = "https://via.placeholder.com/150?text=Error";
    };

    // 3. Mapping trạng thái
    const getStatusBadge = (status) => {
        switch (status) {
            case 1: return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">Chờ xử lý</span>;
            case 2: return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">Đang xử lý</span>;
            case 3: return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">Đã giao hàng</span>;
            case 0: return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">Đã hủy</span>;
            default: return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-semibold">Không xác định</span>;
        }
    };

    // 4. Format tiền tệ
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchOrderDetail = async () => {
            try {
                const response = await AdminOrderService.getById(id);
                if (response.data.status) {
                    setOrder(response.data.data);
                } else {
                    alert("Không tìm thấy đơn hàng!");
                    router.push('/admin/orders');
                }
            } catch (error) {
                console.error("Lỗi tải đơn hàng:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchOrderDetail();
    }, [id, router]);

    // Tính tổng tiền
    const calculateTotal = () => {
        if (!order?.details) return 0;
        return order.details.reduce((acc, item) => acc + (item.price * item.qty), 0);
    };

    // --- GIAO DIỆN ---
    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-slate-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
        </div>
    );

    if (!order) return <div className="p-8 text-center text-red-500">Đơn hàng không tồn tại.</div>;

    return (
        <main className="p-4 md:p-8 bg-slate-50/50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                {/* --- HEADER --- */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/orders" className="text-slate-500 hover:text-slate-800 transition-colors bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                            <i className="fa-solid fa-arrow-left text-xl"></i>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">
                                Chi tiết đơn hàng #{order.id}
                            </h1>
                            <div className="mt-1">{getStatusBadge(order.status)}</div>
                        </div>
                    </div>
                    
                    <div className="flex gap-2">
                        <Link href={`/admin/orders/edit/${order.id}`} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm transition-colors text-sm font-medium flex items-center gap-2">
                            <i className="fa-solid fa-pen"></i> Cập nhật trạng thái
                        </Link>
                        <button onClick={() => window.print()} className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 shadow-sm transition-colors text-sm font-medium flex items-center gap-2">
                            <i className="fa-solid fa-print"></i> In hóa đơn
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* --- CỘT TRÁI: CHI TIẾT SẢN PHẨM --- */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-5 border-b border-slate-100 bg-slate-50/50 font-bold text-slate-800 flex justify-between items-center">
                                <span className="flex items-center gap-2"><i className="fa-solid fa-box-open text-amber-600"></i> Danh sách sản phẩm</span>
                                <span className="text-xs font-normal bg-white px-2 py-1 rounded border border-slate-200 text-slate-500">{order.details?.length || 0} sản phẩm</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                                        <tr>
                                            <th className="px-5 py-3 font-semibold">Sản phẩm</th>
                                            <th className="px-5 py-3 text-center font-semibold">Đơn giá</th>
                                            <th className="px-5 py-3 text-center font-semibold">SL</th>
                                            <th className="px-5 py-3 text-right font-semibold">Thành tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {order.details && order.details.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-4">
                                                        
                                                        {/* --- HIỂN THỊ ẢNH --- */}
                                                        <div className="w-16 h-16 rounded-xl border border-slate-200 overflow-hidden shrink-0 bg-white relative">
                                                            <img 
                                                                src={getProductImage(item.product?.thumbnail)} 
                                                                alt={item.product?.name || "Product"}
                                                                onError={handleImageError}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        {/* ------------------- */}

                                                        <div>
                                                            {item.product ? (
                                                                <>
                                                                    <p className="font-bold text-slate-800 line-clamp-2 mb-1" title={item.product.name}>
                                                                        {item.product.name}
                                                                    </p>
                                                                    <p className="text-xs text-slate-500 bg-slate-100 inline-block px-1.5 py-0.5 rounded">ID: {item.product.id}</p>
                                                                </>
                                                            ) : (
                                                                <span className="text-red-500 text-xs italic bg-red-50 px-2 py-1 rounded">Sản phẩm đã xóa</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-center text-slate-600">{formatCurrency(item.price)}</td>
                                                <td className="px-5 py-4 text-center font-bold text-slate-800">x{item.qty}</td>
                                                <td className="px-5 py-4 text-right font-bold text-amber-600">
                                                    {formatCurrency(item.price * item.qty)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* Tổng tiền */}
                            <div className="p-6 bg-slate-50/50 border-t border-slate-200 flex flex-col items-end gap-3">
                                <div className="flex justify-between w-full max-w-xs text-slate-600 text-sm">
                                    <span>Tạm tính:</span>
                                    <span className="font-medium">{formatCurrency(calculateTotal())}</span>
                                </div>
                                <div className="flex justify-between w-full max-w-xs text-slate-600 text-sm">
                                    <span>Phí vận chuyển:</span>
                                    <span className="font-medium">0 ₫</span>
                                </div>
                                <div className="flex justify-between w-full max-w-xs text-xl font-extrabold text-slate-900 mt-2 pt-3 border-t border-slate-200">
                                    <span>Tổng cộng:</span>
                                    <span className="text-red-600">{formatCurrency(calculateTotal())}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- CỘT PHẢI: THÔNG TIN KHÁCH HÀNG --- */}
                    <div className="space-y-6">
                        
                        {/* Thông tin khách hàng */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <h3 className="font-bold text-slate-800 mb-5 pb-3 border-b border-slate-100 flex items-center">
                                <span className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3"><i className="fa-regular fa-user"></i></span>
                                Thông tin khách hàng
                            </h3>
                            <div className="space-y-4 text-sm text-slate-600">
                                <div>
                                    <span className="block text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Họ tên</span>
                                    <span className="text-slate-900 font-semibold text-base">{order.name}</span>
                                </div>
                                <div>
                                    <span className="block text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Email</span>
                                    <span className="text-slate-800">{order.email}</span>
                                </div>
                                <div>
                                    <span className="block text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Số điện thoại</span>
                                    <span className="text-slate-800 font-mono">{order.phone}</span>
                                </div>
                                {order.user && (
                                    <div className="pt-3 mt-3 border-t border-slate-100 bg-slate-50 p-3 rounded-lg">
                                        <span className="block text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Tài khoản User</span>
                                        <span className="text-blue-600 font-medium flex items-center gap-1">
                                            <i className="fa-solid fa-circle-check text-xs"></i> {order.user.name}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Thông tin giao hàng */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <h3 className="font-bold text-slate-800 mb-5 pb-3 border-b border-slate-100 flex items-center">
                                <span className="bg-red-100 text-red-600 p-2 rounded-lg mr-3"><i className="fa-solid fa-location-dot"></i></span>
                                Giao hàng
                            </h3>
                            <div className="space-y-4 text-sm text-slate-600">
                                <div>
                                    <span className="block text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Địa chỉ nhận hàng</span>
                                    <p className="text-slate-900 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">{order.address}</p>
                                </div>
                                <div>
                                    <span className="block text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Ghi chú</span>
                                    <p className="italic text-slate-500">{order.note || "Không có ghi chú"}</p>
                                </div>
                                <div>
                                    <span className="block text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Ngày đặt hàng</span>
                                    <span className="text-slate-800">{new Date(order.created_at).toLocaleString('vi-VN')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Thanh toán */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <h3 className="font-bold text-slate-800 mb-5 pb-3 border-b border-slate-100 flex items-center">
                                <span className="bg-green-100 text-green-600 p-2 rounded-lg mr-3"><i className="fa-regular fa-credit-card"></i></span>
                                Thanh toán
                            </h3>
                            <div className="text-sm">
                                <div className="flex justify-between items-center mb-2 p-3 bg-slate-50 rounded-lg">
                                    <span className="text-slate-600 font-medium">Phương thức:</span>
                                    <span className="font-bold uppercase text-slate-900 bg-white px-2 py-1 rounded border border-slate-200 shadow-sm">{order.payment_method || 'COD'}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        </main>
    );
}
"use client";

import React, { useState, useEffect, useMemo, useCallback, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; 
import AdminOrderService from '@/services/AdminOrderService';

// --- CẤU HÌNH ---
const BACKEND_DOMAIN = 'http://localhost:8000'; 

const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND' 
    }).format(amount);
};

export default function AdminOrderEdit({ params }) {
    const { id } = use(params);
    const router = useRouter(); 

    const [order, setOrder] = useState({
        id: '',
        status: 1,
        customerName: '',
        customerEmail: '',
        shippingAddress: '',
        shippingPhone: '',
        paymentMethod: '',
        notes: '',
        shippingFee: 0,
        items: [],
    });

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // --- HÀM XỬ LÝ ẢNH ---
    const getProductImage = (imagePath) => {
        if (!imagePath) return "https://via.placeholder.com/150?text=No+Image";
        if (imagePath.startsWith('http') || imagePath.startsWith('https')) {
            return imagePath;
        }
        const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
        return `${BACKEND_DOMAIN}/storage/${cleanPath}`;
    };

    const handleImageError = (e) => {
        e.target.onerror = null;
        e.target.src = "https://via.placeholder.com/150?text=Error";
    };

    // --- FETCH DỮ LIỆU ---
    useEffect(() => {
        const fetchOrderDetail = async () => {
            if (!id) return;
            try {
                // Thêm timestamp để tránh cache khi load trang edit
                const response = await AdminOrderService.getById(id + '?_t=' + new Date().getTime());
                if (response.data.status) {
                    const data = response.data.data;
                    
                    setOrder({
                        id: data.id,
                        status: data.status,
                        customerName: data.name,
                        customerEmail: data.email,
                        shippingPhone: data.phone,
                        shippingAddress: data.address,
                        paymentMethod: data.payment_method,
                        notes: data.note || '',
                        shippingFee: Number(data.shipping_fee) || 0,
                        items: data.details ? data.details.map(d => ({
                            tempId: d.id,
                            productId: d.product_id,
                            name: d.product ? d.product.name : 'Sản phẩm đã xóa',
                            thumbnail: d.product ? d.product.thumbnail : null, 
                            quantity: d.qty,
                            price: Number(d.price) || 0
                        })) : []
                    });
                } else {
                    setError("Không tìm thấy đơn hàng!");
                }
            } catch (err) {
                console.error("Lỗi tải đơn hàng:", err);
                setError("Lỗi kết nối đến server.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetail();
    }, [id]);

    // --- TÍNH TOÁN TỔNG TIỀN ---
    const subTotal = useMemo(() => {
        return order.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    }, [order.items]);

    const finalTotal = useMemo(() => {
        return subTotal + Number(order.shippingFee);
    }, [subTotal, order.shippingFee]);

    // --- HÀM XỬ LÝ FORM ---
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setOrder(prevOrder => ({ ...prevOrder, [name]: value }));
    }, []);

    // --- SUBMIT FORM (CẬP NHẬT TRẠNG THÁI) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage('');
        setError('');

        try {
            // Chuẩn bị payload gửi lên server
            const payload = {
                status: parseInt(order.status),
                name: order.customerName,
                email: order.customerEmail,
                phone: order.shippingPhone,
                address: order.shippingAddress,
                note: order.notes,
                payment_method: order.paymentMethod,
                shipping_fee: order.shippingFee,
                details: order.items.map(item => ({
                    id: item.tempId,
                    qty: item.quantity,
                    price: item.price
                }))
            };

            // 👇 GỌI API UPDATE THẬT
            const res = await AdminOrderService.update(id, payload);

            if (res.data && res.data.status) {
                setMessage('✅ Cập nhật thành công! Đang chuyển hướng...');
                
                // 👇 QUAN TRỌNG: Làm mới cache của Next.js
                router.refresh(); 
                
                // Chuyển hướng về trang danh sách sau 1 giây
                setTimeout(() => {
                    router.push('/admin/orders');
                }, 1000);
            } else {
                setError(res.data?.message || 'Có lỗi xảy ra khi cập nhật.');
            }

        } catch (err) {
            console.error('Lỗi cập nhật:', err);
            setError('❌ Cập nhật thất bại. ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-slate-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
        </div>
    );

    return (
        <main className="p-4 md:p-8 bg-slate-50 min-h-screen">
            <div className="max-w-5xl mx-auto">
                {/* HEADER */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <i className="fa-solid fa-file-pen text-sky-600"></i>
                        Xử Lý Đơn Hàng <span className="text-slate-500 text-2xl">#{order.id}</span>
                    </h1>
                    <button 
                        onClick={() => router.push('/admin/orders')} 
                        className="text-sm font-semibold text-slate-600 hover:text-sky-700 transition-colors bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm"
                    >
                        <i className="fa-solid fa-arrow-left mr-2"></i> Quay lại
                    </button>
                </div>

                {message && <div className="p-4 mb-6 bg-green-50 text-green-700 border border-green-200 rounded-lg flex items-center gap-2"><i className="fa-solid fa-check-circle"></i> {message}</div>}
                {error && <div className="p-4 mb-6 bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-center gap-2"><i className="fa-solid fa-triangle-exclamation"></i> {error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* --- 1. TRẠNG THÁI & THANH TOÁN --- */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h2 className="text-lg font-bold mb-4 text-slate-800 border-b pb-2">1. Trạng Thái & Thanh Toán</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Ô CHỈNH SỬA TRẠNG THÁI */}
                            <div className="bg-sky-50 p-4 rounded-lg border border-sky-200">
                                <label className="block text-sm font-bold text-sky-800 mb-2">
                                    <i className="fa-solid fa-pen-to-square mr-1"></i> Cập nhật trạng thái
                                </label>
                                <select 
                                    name="status" 
                                    value={order.status} 
                                    onChange={handleChange} 
                                    className="w-full p-2.5 border border-sky-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none bg-white font-medium text-slate-700 shadow-sm"
                                >
                                    {/* 👇 CẬP NHẬT DANH SÁCH TRẠNG THÁI MỚI */}
                                    <option value="1">🟡 Chờ xử lý</option>
                                    <option value="2">🔵 Đang xử lý (Đóng gói)</option>
                                    <option value="3">🚚 Đang vận chuyển (Đang giao)</option>
                                    <option value="4">✅ Giao thành công</option>
                                    <option value="0">🔴 Đã hủy</option>
                                </select>
                            </div>

                            {/* Phương thức thanh toán (Read-only) */}
                            <div className="p-4">
                                <label className="block text-sm font-medium text-slate-500 mb-1">Phương thức thanh toán</label>
                                <div className="font-bold text-slate-800 uppercase flex items-center gap-2">
                                    <i className="fa-regular fa-credit-card text-slate-400"></i>
                                    {order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : 
                                     order.paymentMethod === 'bank' ? 'Chuyển khoản ngân hàng' : order.paymentMethod}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- 2. THÔNG TIN KHÁCH HÀNG (READ-ONLY) --- */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h2 className="text-lg font-bold mb-4 text-slate-800 border-b pb-2 flex justify-between">
                            2. Thông Tin Giao Hàng
                            <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-1 rounded"><i className="fa-solid fa-lock"></i> Chỉ xem</span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Tên khách hàng</label>
                                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium">
                                    {order.customerName}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Email</label>
                                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
                                    {order.customerEmail}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Số điện thoại</label>
                                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-mono">
                                    {order.shippingPhone}
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Địa chỉ giao hàng</label>
                                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
                                    {order.shippingAddress}
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Ghi chú từ khách</label>
                                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 italic">
                                    {order.notes || "Không có ghi chú"}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- 3. CHI TIẾT SẢN PHẨM (READ-ONLY) --- */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h2 className="text-lg font-bold mb-4 text-slate-800 border-b pb-2 flex justify-between items-center">
                            3. Chi Tiết Đơn Hàng
                            <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-1 rounded"><i className="fa-solid fa-lock"></i> Chỉ xem</span>
                        </h2>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
                                    <tr>
                                        <th className="px-4 py-3 rounded-tl-lg w-20">Ảnh</th>
                                        <th className="px-4 py-3">Sản phẩm</th>
                                        <th className="px-4 py-3 text-center w-24">SL</th>
                                        <th className="px-4 py-3 text-right w-36">Đơn giá</th>
                                        <th className="px-4 py-3 text-right w-36 rounded-tr-lg">Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {order.items.map((item) => (
                                        <tr key={item.tempId} className="hover:bg-slate-50">
                                            <td className="px-4 py-3">
                                                <div className="w-12 h-12 rounded border border-slate-200 overflow-hidden bg-white">
                                                    <img 
                                                        src={getProductImage(item.thumbnail)} 
                                                        alt="Img" 
                                                        onError={handleImageError}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 font-medium text-slate-800">
                                                {item.name}
                                                <div className="text-xs text-slate-400 font-normal">ID: {item.productId}</div>
                                            </td>
                                            <td className="px-4 py-3 text-center font-semibold text-slate-700">
                                                {item.quantity}
                                            </td>
                                            <td className="px-4 py-3 text-right text-slate-600">
                                                {formatCurrency(item.price)}
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold text-slate-700">
                                                {formatCurrency(item.quantity * item.price)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="border-t border-slate-200 bg-slate-50/50">
                                    <tr>
                                        <td colSpan="4" className="px-4 py-3 text-right text-slate-600">Tạm tính:</td>
                                        <td className="px-4 py-3 text-right font-semibold text-slate-800">{formatCurrency(subTotal)}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan="4" className="px-4 py-3 text-right text-slate-600">Phí vận chuyển:</td>
                                        <td className="px-4 py-3 text-right font-semibold text-slate-800">
                                            {formatCurrency(order.shippingFee)}
                                        </td>
                                    </tr>
                                    <tr className="bg-slate-100 border-t border-slate-300">
                                        <td colSpan="4" className="px-4 py-4 text-right font-bold text-slate-800 text-base">TỔNG CỘNG:</td>
                                        <td className="px-4 py-4 text-right font-bold text-red-600 text-xl">{formatCurrency(finalTotal)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex justify-end gap-4 sticky bottom-4 bg-white/90 p-4 backdrop-blur-sm shadow-lg rounded-xl border border-slate-200">
                        <button 
                            type="button" 
                            onClick={() => router.push('/admin/orders')}
                            className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            Hủy bỏ
                        </button>
                        <button type="submit" disabled={submitting} className="px-6 py-2.5 bg-sky-600 text-white font-bold rounded-lg hover:bg-sky-700 transition-colors shadow-md shadow-sky-200 disabled:opacity-70 flex items-center gap-2">
                            {submitting ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Đang lưu...</> : <><i className="fa-solid fa-floppy-disk"></i> Lưu Trạng Thái</>}
                        </button>
                    </div>

                </form>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
            </div>
        </main>
    );
}
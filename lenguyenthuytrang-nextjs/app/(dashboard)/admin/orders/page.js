"use client";

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation'; 
import AdminOrderService from '@/services/AdminOrderService';

// --- 1. CẤU HÌNH TRẠNG THÁI ---
const ORDER_STATUS_MAP = {
    0: { text: 'Đã Hủy', style: 'bg-red-100 text-red-800', icon: 'fa-xmark' },
    1: { text: 'Chờ xử lý', style: 'bg-yellow-100 text-yellow-800', icon: 'fa-clock' },
    2: { text: 'Đang xử lý', style: 'bg-blue-100 text-blue-800', icon: 'fa-gears' },
    3: { text: 'Đang vận chuyển', style: 'bg-indigo-100 text-indigo-800', icon: 'fa-truck-fast' }, 
    4: { text: 'Giao thành công', style: 'bg-green-100 text-green-800', icon: 'fa-check' },
};

const ORDER_STATUSES_FOR_FILTER = [
    { value: 'all', text: 'Tất cả Trạng thái' },
    ...Object.keys(ORDER_STATUS_MAP).map(key => ({ 
        value: Number(key), 
        text: ORDER_STATUS_MAP[key].text 
    }))
];

// --- 2. MODAL XÁC NHẬN (Giữ nguyên) ---
const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onCancel}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto transform transition-all scale-100 opacity-100" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                    <div className="text-red-500 bg-red-100 p-3 rounded-full"><i className="fa-solid fa-triangle-exclamation text-xl"></i></div>
                    <h3 className="text-xl font-bold text-slate-800">{title}</h3>
                </div>
                <div className="p-6">
                    <p className="text-slate-600 mb-6">{message}</p>
                    <div className="flex justify-end gap-3">
                        <button onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200">Hủy bỏ</button>
                        <button onClick={onConfirm} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 shadow-md shadow-red-200">Xác nhận Xóa</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- 3. COMPONENT CHÍNH ---
export default function AdminOrdersPage() {
    const router = useRouter();
    const pathname = usePathname();
    const [orders, setOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); 
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // Mặc định là true để hiện loading ngay

    // --- FETCH DATA ---
    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        // setOrders([]); // Tùy chọn: Xóa danh sách cũ để người dùng biết đang tải lại
        
        try {
            const params = {};
            if (searchTerm) params.search = searchTerm;
            if (filterStatus !== 'all') params.status = filterStatus;
            
            // 👇 CACHE BUSTING 1: Thêm timestamp vào query params
            params._t = new Date().getTime(); 

            // 👇 CACHE BUSTING 2: Cấu hình Headers (Nếu Service hỗ trợ truyền config axios/fetch)
            // Nếu AdminOrderService.getAll chỉ nhận params, bạn cần sửa cả file Service (xem hướng dẫn bên dưới)
            const res = await AdminOrderService.getAll(params);
            
            const apiData = res.data;
            const list = Array.isArray(apiData.data) ? apiData.data : (Array.isArray(apiData) ? apiData : []);
            
            console.log("Dữ liệu mới nhất từ API:", list); // F12 để kiểm tra status tại đây
            setOrders(list);
        } catch (err) {
            console.error("Lỗi tải danh sách:", err);
            setOrders([]);
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm, filterStatus]);

    // --- EFFECT: TỰ ĐỘNG CẬP NHẬT ---
    
    // 1. Tải khi Filter/Pathname thay đổi
    useEffect(() => {
        // Kích hoạt làm mới router của Next.js để xóa Cache Router (nếu có)
        router.refresh(); 
        fetchOrders();
    }, [fetchOrders, pathname, router]); 

    // 2. Tự động tải lại khi cửa sổ được focus (Chuyển tab rồi quay lại)
    useEffect(() => {
        const onFocus = () => {
            console.log("Windows focused - Refreshing data...");
            fetchOrders();
        };
        window.addEventListener("focus", onFocus);
        return () => window.removeEventListener("focus", onFocus);
    }, [fetchOrders]);


    // --- DELETE LOGIC ---
    const confirmDeleteOrder = useCallback((order) => {
        setOrderToDelete(order);
        setIsModalOpen(true);
    }, []);

    const executeDelete = useCallback(async () => {
        if (orderToDelete) {
            setIsLoading(true);
            try {
                await AdminOrderService.delete(orderToDelete.id);
                setOrders(prev => prev.filter(o => o.id !== orderToDelete.id));
            } catch (err) {
                alert("Xóa thất bại: " + (err.response?.data?.message || err.message));
            } finally {
                setIsLoading(false);
                setIsModalOpen(false);
                setOrderToDelete(null);
            }
        }
    }, [orderToDelete]);

    // --- FILTER & SORT LOGIC ---
    const filteredOrders = useMemo(() => {
        let list = [...orders]; 
        const lowerTerm = searchTerm.toLowerCase();

        // Lọc trạng thái (Ép kiểu Number)
        if (filterStatus !== 'all') {
            const statusInt = Number(filterStatus);
            list = list.filter(order => Number(order.status) === statusInt);
        }

        // Lọc tìm kiếm
        if (searchTerm) {
            list = list.filter(order =>
                (order.customer_name && order.customer_name.toLowerCase().includes(lowerTerm)) ||
                (order.phone && order.phone.includes(lowerTerm)) ||
                (order.email && order.email.toLowerCase().includes(lowerTerm)) ||
                String(order.id).includes(lowerTerm)
            );
        }

        // Sắp xếp: Mới nhất lên đầu
        return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }, [orders, searchTerm, filterStatus]);

    // --- UTILS ---
    const formatShortDate = (dateTime) => {
        if (!dateTime) return '-';
        try {
            const date = new Date(dateTime);
            return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit' }).format(date);
        } catch (e) { return dateTime; }
    };

    const getStatusDisplay = (statusVal) => {
        const statusInt = Number(statusVal);
        const config = ORDER_STATUS_MAP[statusInt] || { text: `Status ${statusVal}`, style: 'bg-gray-100 text-gray-700', icon: 'fa-circle-question' };

        return (
            <span className={`px-3 py-1 inline-flex items-center gap-1.5 text-xs leading-5 font-semibold rounded-full ${config.style}`}>
                <i className={`fa-solid ${config.icon}`}></i>
                {config.text}
            </span>
        );
    };

    // --- RENDER ---
    return (
        <>
            <main className="p-4 md:p-8 bg-slate-50 min-h-screen">
                <div className="max-w-7xl mx-auto">

                    {/* HEADER */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <h1 className="text-3xl font-bold text-slate-800 flex items-center">
                            <i className="fa-solid fa-clipboard-list mr-3 text-sky-600"></i>
                            Quản Lý Đơn Hàng
                        </h1>
                        <div className="flex gap-3">
                            <button 
                                onClick={fetchOrders} 
                                className="text-sm text-sky-600 hover:text-sky-800 flex items-center gap-1 font-semibold bg-white border border-slate-200 px-3 py-2 rounded-lg shadow-sm"
                            >
                                <i className={`fa-solid fa-rotate-right ${isLoading ? 'fa-spin' : ''}`}></i> Làm mới
                            </button>
                            <Link href="/admin/orders/add" className="bg-amber-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-amber-600 transition-colors duration-200 flex items-center gap-2 shadow-md">
                                <i className="fa-solid fa-plus"></i> Tạo Đơn Hàng
                            </Link>
                        </div>
                    </div>
                    
                    {/* FILTER BAR */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                            <input 
                                type="text" 
                                placeholder="Tìm theo Mã đơn, Tên, SĐT..." 
                                className="pl-10 p-2.5 border border-slate-300 rounded-lg w-full focus:ring-2 focus:ring-sky-500 outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="w-full sm:w-64">
                            <select 
                                className="w-full p-2.5 border border-slate-300 rounded-lg bg-white text-slate-700 focus:ring-2 focus:ring-sky-500 outline-none"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                {ORDER_STATUSES_FOR_FILTER.map(status => (
                                    <option key={status.value} value={status.value}>{status.text}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* TABLE */}
                    <div className="overflow-hidden bg-white rounded-xl shadow-lg border border-slate-200">
                        {isLoading && orders.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">
                                <i className="fa-solid fa-spinner fa-spin text-2xl mb-2"></i>
                                <p>Đang tải dữ liệu...</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Mã Đơn</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Khách hàng</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Liên hệ</th> 
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Ngày tạo</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 bg-white">
                                        {filteredOrders.length > 0 ? (
                                            filteredOrders.map((order) => (
                                                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-sky-600">#{order.id}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-medium text-slate-900">{order.customer_name}</div>
                                                        <div className="text-xs text-slate-500">
                                                            {order.user_account_name ? <span className="text-indigo-500"><i className="fa-solid fa-user-check"></i> TV: {order.user_account_name}</span> : 'Khách vãng lai'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                        <div className="flex flex-col">
                                                            <span><i className="fa-solid fa-phone text-slate-400 text-xs mr-1"></i> {order.phone}</span>
                                                            <span className="text-xs truncate max-w-[150px]" title={order.address}>{order.address}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                        {formatShortDate(order.created_at)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {getStatusDisplay(order.status)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <Link href={`/admin/orders/${order.id}`} className="text-slate-400 hover:text-sky-600 mx-2 transition-colors" title="Xem chi tiết">
                                                            <i className="fa-solid fa-eye text-lg"></i>
                                                        </Link>
                                                        <Link href={`/admin/orders/edit/${order.id}`} className="text-slate-400 hover:text-amber-600 mx-2 transition-colors" title="Cập nhật">
                                                            <i className="fa-solid fa-pen-to-square text-lg"></i>
                                                        </Link>
                                                        <button 
                                                            onClick={() => confirmDeleteOrder({ id: order.id, customerName: order.customer_name })}
                                                            className="text-slate-400 hover:text-red-600 mx-2 transition-colors"
                                                            title="Xóa đơn hàng"
                                                        >
                                                            <i className="fa-solid fa-trash-can text-lg"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                                    <i className="fa-solid fa-box-open text-4xl mb-3 text-slate-300"></i>
                                                    <p>Không tìm thấy đơn hàng nào.</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                    
                </div>
            </main>

            <ConfirmationModal
                isOpen={isModalOpen}
                title="Xác nhận Xóa"
                message={`Bạn có chắc muốn xóa đơn hàng #${orderToDelete?.id} không?`}
                onConfirm={executeDelete}
                onCancel={() => setIsModalOpen(false)}
            />
            
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        </>
    );
}
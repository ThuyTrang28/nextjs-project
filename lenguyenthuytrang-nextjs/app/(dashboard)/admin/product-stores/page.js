"use client";

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head'; 
import AdminProductStoreService from '@/services/AdminProductStoreService';

// --- CONFIG ---
const ITEMS_PER_PAGE = 5;
// IMPORTANT: Thay đổi domain này trùng với APP_URL trong .env của Laravel
const BACKEND_DOMAIN = 'http://localhost:8000'; 

// --- HELPER ---
const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '0 đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Hàm xử lý link ảnh an toàn
const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    // Xử lý path tương đối (bỏ dấu / ở đầu nếu có)
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${BACKEND_DOMAIN}/storage/${cleanPath}`;
};

// --- COMPONENT THÔNG BÁO ---
const Notification = ({ message, type, onClose }) => {
    if (!message) return null;
    const bgColor = type === 'success' ? 'bg-emerald-500' : 'bg-red-500';
    return (
        <div className={`fixed top-5 right-5 p-4 rounded-xl shadow-2xl text-white z-50 ${bgColor} animate-in slide-in-from-right duration-300 flex items-center shadow-emerald-200/50`} onClick={onClose}>
            <i className={`fa-solid ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-3 text-xl`}></i>
            <span className="font-medium">{message}</span>
        </div>
    );
};

export default function AdminProductStorePage() {
    const [stores, setStores] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [isLoading, setIsLoading] = useState(true);

    // 1. Show Notification
    const showNotification = useCallback((message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: '', type: '' }), 3000);
    }, []);

    // 2. Fetch Data
    const fetchStores = useCallback(async (page, search) => {
        setIsLoading(true);
        try {
            const params = {
                page,
                limit: ITEMS_PER_PAGE,
                search: search.trim()
            };
            
            const res = await AdminProductStoreService.getAll(params);
            const responseData = res.data; 

            // Xử lý response từ Laravel Paginate
            if (responseData && responseData.data && Array.isArray(responseData.data.data)) {
                setStores(responseData.data.data);
                setTotalRecords(responseData.data.total);
            } else if (responseData && Array.isArray(responseData.data)) {
                setStores(responseData.data);
                setTotalRecords(responseData.total || responseData.data.length);
            } else {
                setStores([]);
                setTotalRecords(0);
            }
        } catch (err) {
            console.error("Fetch Error:", err);
            showNotification('Không thể kết nối đến server.', 'error');
            setStores([]);
        } finally {
            setIsLoading(false);
        }
    }, [showNotification]);

    // 3. Effect: Gọi API khi page/search thay đổi
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchStores(currentPage, searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [currentPage, searchTerm, fetchStores]);

    // Handle Actions
    const handlePageChange = (page) => setCurrentPage(page);
    
    // Toggle Status
    const handleToggleStatus = async (store) => {
        if (!store.id) {
            showNotification('Sản phẩm này chưa nhập kho, vui lòng nhập kho trước!', 'error');
            return;
        }

        const newStatus = store.status === 1 ? 0 : 1;
        try {
            const res = await AdminProductStoreService.updateStatus(store.id, newStatus);
            if (res.data && res.data.status) {
                showNotification('Cập nhật trạng thái thành công!', 'success');
                fetchStores(currentPage, searchTerm); 
            } else {
                showNotification('Cập nhật thất bại.', 'error');
            }
        } catch (error) {
            showNotification('Lỗi hệ thống.', 'error');
        }
    };

    const totalPages = Math.ceil(totalRecords / ITEMS_PER_PAGE);

    return (
        <>
            <Head>
                <title>Quản lý Kho | Admin</title>
            </Head>

            <Notification {...notification} onClose={() => setNotification({ message: '', type: '' })} />

            <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
                <div className="max-w-7xl mx-auto">
                    
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                                <span className="bg-white p-2 rounded-lg shadow-sm border border-slate-100 text-emerald-600">
                                    <i className="fa-solid fa-warehouse"></i>
                                </span>
                                Quản lý Tồn Kho
                            </h1>
                            <p className="text-slate-500 mt-1 text-sm">Theo dõi số lượng và trạng thái kinh doanh</p>
                        </div>

                        <Link href="/admin/product-stores/add">
                            <button className="bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center gap-2">
                                <i className="fa-solid fa-plus"></i> Cập nhật Số lượng Sản phẩm 
                            </button>
                        </Link>
                    </div>

                    {/* Search */}
                    <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 mb-6 flex items-center max-w-lg">
                        <i className="fa-solid fa-magnifying-glass text-slate-400 ml-4"></i>
                        <input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm..."
                            className="w-full p-3 outline-none text-slate-700 placeholder-slate-400 bg-transparent"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/80 border-b border-slate-100">
                                        <th className="p-5 text-sm font-bold text-slate-500 uppercase w-[45%]">Sản phẩm</th>
                                        <th className="p-5 text-sm font-bold text-slate-500 uppercase text-right">Giá Vốn</th>
                                        <th className="p-5 text-sm font-bold text-slate-500 uppercase text-center">Tồn kho</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-5">
                                    {isLoading ? (
                                        [...Array(5)].map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td className="p-5"><div className="h-14 bg-slate-200 rounded-xl w-full"></div></td>
                                                <td className="p-5"><div className="h-4 bg-slate-200 rounded w-full"></div></td>
                                                <td className="p-5"><div className="h-4 bg-slate-200 rounded w-1/2 mx-auto"></div></td>
                                                {/* Đã xóa cột Skeleton Trạng thái ở đây */}
                                                <td className="p-5"><div className="h-8 bg-slate-200 rounded w-20 ml-auto"></div></td>
                                            </tr>
                                        ))
                                    ) : stores.length > 0 ? (
                                        stores.map((store) => (
                                            <tr key={store.product_id} className="hover:bg-slate-50 transition-colors group">
                                                
                                                {/* Cột Sản Phẩm (Ảnh + Tên) */}
                                                <td className="p-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-14 w-14 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative">
                                                            {store.thumbnail ? (
                                                                <img 
                                                                    src={getImageUrl(store.thumbnail)} 
                                                                    alt={store.product_name} 
                                                                    className="h-full w-full object-cover"
                                                                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/100x100?text=No+Img"; }}
                                                                />
                                                            ) : (
                                                                <div className="h-full w-full flex items-center justify-center text-slate-300"><i className="fa-solid fa-image"></i></div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-800 text-base group-hover:text-emerald-600 transition-colors line-clamp-1">
                                                                {store.product_name}
                                                            </div>
                                                            <div className="text-xs text-slate-400 mt-1">ID: #{store.product_id}</div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Giá Vốn */}
                                                <td className="p-5 text-right font-mono font-medium text-slate-600">
                                                    {formatCurrency(store.price_root)}
                                                </td>

                                                {/* Tồn Kho */}
                                                <td className="p-5 text-center">
                                                    <span className={`inline-block px-3 py-1 rounded-lg font-bold text-sm ${
                                                        store.qty > 10 ? 'bg-emerald-100 text-emerald-700' : 
                                                        store.qty > 0 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                        {store.qty}
                                                    </span>
                                                </td>

                                                
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            {/* Colspan giảm từ 5 xuống 4 vì đã xóa 1 cột */}
                                            <td colSpan="4" className="p-12 text-center text-slate-400">
                                                <div className="flex flex-col items-center justify-center">
                                                    <i className="fa-solid fa-box-open text-6xl mb-4 opacity-50"></i>
                                                    <p className="text-lg font-medium">Không tìm thấy sản phẩm nào</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="p-4 border-t border-slate-100 flex justify-center bg-slate-50/50">
                                <div className="flex bg-white rounded-lg shadow-sm border border-slate-200 p-1 gap-1">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-100 disabled:opacity-30 text-slate-600"
                                    >
                                        <i className="fa-solid fa-chevron-left text-xs"></i>
                                    </button>
                                    <span className="px-4 flex items-center text-sm font-bold text-slate-600">{currentPage} / {totalPages}</span>
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-100 disabled:opacity-30 text-slate-600"
                                    >
                                        <i className="fa-solid fa-chevron-right text-xs"></i>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
            </div>
        </>
    );
}
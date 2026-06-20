"use client";

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import AdminProductSaleService from '@/services/AdminProductSaleService'; 
import AdminCategoryService from '@/services/AdminCategoryService';

// --- CONFIG ---
const BACKEND_DOMAIN = 'http://localhost:8000'; 
const ITEMS_PER_PAGE = 5; // Số lượng hiển thị mỗi trang

// --- HELPER XỬ LÝ ẢNH ---
const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${BACKEND_DOMAIN}/storage/${cleanPath}`;
};

// --- THÀNH PHẦN MODAL XÁC NHẬN ---
const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onCancel}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto transform transition-all duration-300" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                    <div className="text-red-500 bg-red-100 p-3 rounded-full">
                        <i className="fa-solid fa-triangle-exclamation text-xl"></i>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">{title}</h3>
                </div>
                <div className="p-6">
                    <p className="text-slate-600 mb-6">{message}</p>
                    <div className="flex justify-end gap-3">
                        <button onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Hủy bỏ</button>
                        <button onClick={onConfirm} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-md shadow-red-200">Xác nhận Xóa</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- SKELETON ---
const TableSkeleton = () => (
    <div className="animate-pulse">
        {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-50 mb-2 rounded-lg border border-slate-100" />
        ))}
    </div>
);

// --- COMPONENT CHÍNH ---
export default function AdminPromotionsPage() {
    // State dữ liệu
    const [promotions, setPromotions] = useState([]);
    const [categories, setCategories] = useState([]); 
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // State bộ lọc
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    // State Modal & Pagination
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [promoToDelete, setPromoToDelete] = useState(null);
    
    // State Pagination (Đầy đủ thông tin)
    const [pagination, setPagination] = useState({ 
        currentPage: 1, 
        lastPage: 1,
        totalItems: 0
    });

    // --- 1. LOAD DANH MỤC TỪ API ---
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await AdminCategoryService.getAll();
                setCategories(res.data.data || res.data || []);
            } catch (err) {
                console.error("Lỗi tải danh mục:", err);
            }
        };
        fetchCategories();
    }, []);

    // --- 2. LOAD KHUYẾN MÃI TỪ API ---
    const fetchPromotions = useCallback(async (page = 1) => {
        setIsLoading(true);
        setError(null);
        try {
            const params = { 
                page, 
                limit: ITEMS_PER_PAGE 
            };
            if (searchTerm) params.search = searchTerm;

            const response = await AdminProductSaleService.getAll(params);
            
            const responseData = response.data;
            const rawList = responseData.data?.data || responseData.data || [];
            
            // Mapping Dữ Liệu
            const mappedData = rawList.map(item => {
                const today = new Date();
                const endDate = new Date(item.date_end);
                const isActive = endDate >= today;

                const productName = item.product_name || item.product?.name || `Sản phẩm #${item.product_id}`;
                const thumbnail = item.thumbnail || item.product?.thumbnail || null;
                const categoryId = item.category_id || item.product?.category_id || 0;
                const priceBuy = item.price_buy || item.product?.price_buy || 0;
                const saleName = item.name || `KM: ${productName}`;

                return {
                    id: item.id,
                    name: saleName,
                    product: productName,
                    thumbnail: thumbnail,
                    category_id: categoryId,
                    price_sale: item.price_sale,
                    price_buy: priceBuy, 
                    startDate: item.date_begin,
                    endDate: item.date_end,
                    isActive: isActive
                };
            });

            setPromotions(mappedData);
            
            // Cập nhật thông tin phân trang từ API
            if(responseData.data && responseData.data.last_page) {
                setPagination({
                    currentPage: responseData.data.current_page,
                    lastPage: responseData.data.last_page,
                    totalItems: responseData.data.total || 0
                });
            } else {
                // Fallback nếu API không trả về dạng paginate chuẩn
                setPagination({ currentPage: 1, lastPage: 1, totalItems: mappedData.length });
            }

        } catch (err) {
            console.error("Lỗi tải khuyến mãi:", err);
            setError("Không thể tải danh sách. Vui lòng kiểm tra kết nối.");
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm]);

    // Gọi API khi (search thay đổi) HOẶC (người dùng bấm chuyển trang)
    // Lưu ý: useEffect này chỉ nên chạy khi search thay đổi để reset về trang 1
    // Còn chuyển trang sẽ gọi trực tiếp fetchPromotions
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchPromotions(1); // Reset về trang 1 khi search thay đổi
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, fetchPromotions]); // Bỏ dependency pagination.currentPage để tránh loop vô tận

    // Hàm xử lý chuyển trang
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.lastPage) {
            fetchPromotions(newPage);
        }
    };

    // --- 3. XỬ LÝ XÓA ---
    const confirmDeletePromotion = useCallback((promo) => {
        setPromoToDelete(promo);
        setIsModalOpen(true);
    }, []);

    const executeDelete = useCallback(async () => {
        if (!promoToDelete) return;
        try {
            await AdminProductSaleService.delete(promoToDelete.id);
            alert("Đã xóa chương trình khuyến mãi thành công!");
            
            // Logic load lại trang sau khi xóa
            if (promotions.length === 1 && pagination.currentPage > 1) {
                fetchPromotions(pagination.currentPage - 1);
            } else {
                fetchPromotions(pagination.currentPage);
            }
        } catch (err) {
            alert("Lỗi khi xóa: " + (err.response?.data?.message || err.message));
        } finally {
            setIsModalOpen(false);
            setPromoToDelete(null);
        }
    }, [promoToDelete, pagination.currentPage, promotions.length, fetchPromotions]);

    // --- 4. LỌC DỮ LIỆU (Client-side filtering cho danh mục) ---
    const displayPromotions = useMemo(() => {
        if (selectedCategory === 'all') return promotions;
        return promotions.filter(p => String(p.category_id) === String(selectedCategory));
    }, [promotions, selectedCategory]);

    // Helper: Tính % giảm giá
    const calculateDiscountPercent = (original, sale) => {
        if (!original || original <= 0) return '';
        const percent = Math.round(((original - sale) / original) * 100);
        return `-${percent}%`;
    };

    return (
        <>
            <Head>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
                <title>Quản lý Khuyến mãi | Admin</title>
            </Head>
        
            <div className="p-4 md:p-8 bg-slate-50/50 min-h-screen">
                <div className="max-w-7xl mx-auto">

                    {/* HEADER */}
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800 flex items-center">
                                <span className="p-2 bg-amber-500 text-white rounded-lg mr-3 shadow-lg shadow-amber-200">
                                    <i className="fa-solid fa-tags"></i>
                                </span>
                                Quản Lý Khuyến Mãi
                            </h1>
                            <p className="text-slate-500 mt-1 ml-12">Danh sách các chương trình giảm giá đang áp dụng</p>
                        </div>

                        <Link href="/admin/product-sales/add">
                            <button className="bg-slate-900 text-white font-bold py-3 px-5 rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 shadow-xl shadow-slate-200">
                                <i className="fa-solid fa-plus"></i>
                                Thêm Khuyến Mãi
                            </button>
                        </Link>
                    </div>

                    {/* FILTER BAR */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo Tên sản phẩm..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                            />
                        </div>
                        
                        <div className="relative min-w-[200px]">
                            <i className="fa-solid fa-filter absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                            <select
                                className="w-full pl-10 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all cursor-pointer appearance-none"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <option value="all">Tất cả danh mục</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* TABLE AREA */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        {isLoading ? (
                            <div className="p-8"><TableSkeleton /></div>
                        ) : error ? (
                            <div className="p-20 text-center">
                                <div className="text-red-500 text-5xl mb-4"><i className="fa-solid fa-triangle-exclamation"></i></div>
                                <p className="text-slate-800 font-bold text-xl">{error}</p>
                                <button onClick={() => fetchPromotions(1)} className="mt-4 text-amber-600 font-semibold underline">Thử lại</button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-100">
                                    <thead className="bg-slate-50/80">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Ảnh</th> 
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Tên Chương Trình</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Sản phẩm</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Chi tiết Giá</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Thời gian</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {displayPromotions.length > 0 ? (
                                            displayPromotions.map((promo) => (
                                                <tr key={promo.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-400">#{promo.id}</td>
                                                    
                                                    {/* Hiển thị Ảnh */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="h-12 w-12 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                                                            {promo.thumbnail ? (
                                                                <img 
                                                                    src={getImageUrl(promo.thumbnail)} 
                                                                    alt={promo.product} 
                                                                    className="h-full w-full object-cover"
                                                                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/100x100?text=No+Img"; }}
                                                                />
                                                            ) : (
                                                                <i className="fa-solid fa-image text-slate-300"></i>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* Tên Khuyến Mãi */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-bold text-amber-700 max-w-[200px] truncate" title={promo.name}>
                                                            {promo.name}
                                                        </div>
                                                    </td>

                                                    {/* Tên Sản phẩm */}
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 max-w-[180px] truncate" title={promo.product}>{promo.product}</td>
                                                    
                                                    {/* Giá */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-amber-600">
                                                                {Number(promo.price_sale).toLocaleString('vi-VN')} đ
                                                            </span>
                                                            {promo.price_buy > 0 && (
                                                                <span className="text-xs text-slate-400 line-through">
                                                                    {Number(promo.price_buy).toLocaleString('vi-VN')} đ
                                                                    <span className="ml-1 text-red-500 no-underline font-bold">
                                                                        ({calculateDiscountPercent(promo.price_buy, promo.price_sale)})
                                                                    </span>
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="flex items-center gap-1"><i className="fa-regular fa-calendar-plus text-green-500"></i> {promo.startDate}</span>
                                                            <span className="flex items-center gap-1"><i className="fa-regular fa-calendar-minus text-red-500"></i> {promo.endDate}</span>
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-lg ${promo.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                                            {promo.isActive ? 'Đang chạy' : 'Kết thúc'}
                                                        </span>
                                                    </td>

                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex justify-end gap-2">
                                                            <Link href={`/admin/product-sales/edit/${promo.id}`}>
                                                                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Sửa">
                                                                    <i className="fa-solid fa-pen-to-square"></i>
                                                                </button>
                                                            </Link>
                                                            <button
                                                                onClick={() => confirmDeletePromotion(promo)}
                                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Xóa"
                                                            >
                                                                <i className="fa-solid fa-trash-can"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="8" className="px-6 py-12 text-center text-slate-400">
                                                    <i className="fa-solid fa-box-open text-4xl mb-3 opacity-50"></i>
                                                    <p>Không tìm thấy khuyến mãi nào phù hợp.</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination UI */}
                        {pagination.lastPage > 1 && (
                            <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center bg-slate-50/50 gap-4">
                                <span className="text-sm text-slate-500">
                                    Hiển thị trang <span className="font-bold">{pagination.currentPage}</span> / {pagination.lastPage}
                                </span>
                                <div className="flex bg-white rounded-lg shadow-sm border border-slate-200 p-1 gap-1">
                                    <button
                                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                                        disabled={pagination.currentPage === 1}
                                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-100 disabled:opacity-30 text-slate-600 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <i className="fa-solid fa-chevron-left text-xs"></i>
                                    </button>
                                    
                                    <div className="flex items-center px-4 bg-slate-50 border-x border-slate-100 text-sm font-bold text-slate-700">
                                        {pagination.currentPage}
                                    </div>

                                    <button
                                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                                        disabled={pagination.currentPage === pagination.lastPage}
                                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-100 disabled:opacity-30 text-slate-600 disabled:cursor-not-allowed transition-colors"
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

            {/* Modal */}
            <ConfirmationModal
                isOpen={isModalOpen}
                title="Xác nhận Xóa"
                message={`Bạn có chắc chắn muốn xóa chương trình "${promoToDelete?.name}"?`}
                onConfirm={executeDelete}
                onCancel={() => setIsModalOpen(false)}
            />
        </>
    );
}
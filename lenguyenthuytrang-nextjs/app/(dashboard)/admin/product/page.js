"use client";

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import AdminProductService from '@/services/AdminProductService';
import AdminCategoryService from '@/services/AdminCategoryService';

// --- CẤU HÌNH ---
const BACKEND_DOMAIN = 'http://localhost:8000'; 
const ITEMS_PER_PAGE = 5; // Hiển thị 5 sản phẩm mỗi trang

// --- Helper: Cắt chuỗi mô tả ---
const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
};

// --- Components nhỏ hỗ trợ ---
const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onCancel}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-100 flex items-center gap-4">
                    <div className="text-red-600 bg-red-50 p-3 rounded-full">
                        <i className="fa-solid fa-circle-exclamation text-xl"></i>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">{title}</h3>
                </div>
                <div className="p-6">
                    <p className="text-slate-600 leading-relaxed mb-6">{message}</p>
                    <div className="flex justify-end gap-3">
                        <button onClick={onCancel} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all">Hủy bỏ</button>
                        <button onClick={onConfirm} className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-200">Xác nhận Xóa</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TableSkeleton = () => (
    <div className="animate-pulse">
        {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-50 mb-2 rounded-lg" />
        ))}
    </div>
);

// --- Component Chính ---
export default function AdminProductsPage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState(['Tất cả sản phẩm']);
    
    // State Pagination
    const [pagination, setPagination] = useState({ 
        currentPage: 1, 
        lastPage: 1, 
        totalItems: 0 
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Tất cả sản phẩm');

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);

    // 1. Debounce Search Logic
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPagination(prev => ({ ...prev, currentPage: 1 })); 
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // 2. Fetch Danh mục để lọc
    const fetchCategories = useCallback(async () => {
        try {
            const response = await AdminCategoryService.getAll();
            const list = response.data.data || response.data || [];
            const names = list.map(cat => cat.name); 
            setCategories(['Tất cả sản phẩm', ...names]);
        } catch (err) {
            console.error("Lỗi danh mục:", err);
        }
    }, []);

    // 3. Fetch Sản phẩm (Quan trọng nhất)
    const fetchProducts = useCallback(async (page = 1) => {
        setIsLoading(true);
        setError(null);
        try {
            const params = { 
                page: page, 
                search: debouncedSearch, 
                limit: ITEMS_PER_PAGE // Truyền limit 5
            };
            
            if (selectedCategory !== "Tất cả sản phẩm") {
                params.category = selectedCategory;
            }

            const response = await AdminProductService.getAll(params);
            
            const paginator = response.data.data; 
            const productList = paginator.data || [];

            // --- MAPPING DỮ LIỆU ---
            const normalized = productList.map(p => {
                let imageUrl = null;
                if (p.thumbnail) {
                    if (p.thumbnail.startsWith('http')) {
                        imageUrl = p.thumbnail;
                    } else {
                        const cleanPath = p.thumbnail.startsWith('/') ? p.thumbnail.substring(1) : p.thumbnail;
                        imageUrl = `${BACKEND_DOMAIN}/storage/${cleanPath}`;
                    }
                }

                return {
                    id: p.id,
                    name: p.name,
                    category_name: p.category || 'Chưa phân loại',
                    price_buy: parseFloat(p.price) || 0, 
                    qty: p.stock !== null ? p.stock : 0, 
                    description: p.description || p.content || '',
                    status: p.status,
                    thumbnailUrl: imageUrl
                };
            });

            setProducts(normalized);
            setPagination({
                currentPage: paginator.current_page,
                lastPage: paginator.last_page,
                totalItems: paginator.total,
            });
        } catch (err) {
            console.error("Fetch Error:", err);
            setError("Không thể tải dữ liệu. Vui lòng kiểm tra kết nối API.");
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearch, selectedCategory]);

    useEffect(() => { fetchCategories(); }, [fetchCategories]);
    
    // Gọi API khi (search/category thay đổi) HOẶC (người dùng bấm chuyển trang)
    useEffect(() => {
        fetchProducts(pagination.currentPage);
    }, [pagination.currentPage, fetchProducts]); // Quan trọng: dependency currentPage

    // 4. Xử lý chuyển trang
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.lastPage) {
            setPagination(prev => ({ ...prev, currentPage: newPage }));
        }
    };

    // 5. Xử lý xóa
    const executeDelete = async () => {
        if (!productToDelete) return;
        try {
            await AdminProductService.delete(productToDelete.id);
            alert("Đã xóa sản phẩm thành công!");
            
            // Nếu xóa hết item ở trang cuối thì lùi về 1 trang
            if (products.length === 1 && pagination.currentPage > 1) {
                setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }));
            } else {
                fetchProducts(pagination.currentPage);
            }
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            alert("Lỗi khi xóa: " + msg);
        } finally {
            setIsModalOpen(false);
            setProductToDelete(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
            <Head>
                <title>Quản lý Sản phẩm | Admin</title>
            </Head>

            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                            <span className="bg-amber-500 text-white p-2 rounded-lg shadow-lg shadow-amber-200">
                                <i className="fa-solid fa-box"></i>
                            </span>
                            Quản lý Sản phẩm
                        </h1>
                        <p className="text-slate-500 mt-1">Danh sách sản phẩm hiện có trên hệ thống</p>
                    </div>

                    <Link href="/admin/product/add">
                        <button className="bg-slate-900 text-white font-bold py-3 px-6 rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-200">
                            <i className="fa-solid fa-plus"></i>
                            Thêm sản phẩm
                        </button>
                    </Link>
                </div>

                {/* Filters Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="relative md:col-span-2">
                        <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                        <input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm theo tên..."
                            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <i className="fa-solid fa-filter absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                        <select
                            className="w-full pl-12 pr-10 py-3.5 bg-white border border-slate-200 rounded-2xl appearance-none focus:ring-2 focus:ring-amber-500 outline-none transition-all shadow-sm"
                            value={selectedCategory}
                            onChange={(e) => {
                                setSelectedCategory(e.target.value);
                                setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset trang khi đổi danh mục
                            }}
                        >
                            {categories.map((cat, index) => <option key={index} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                </div>

                {/* Main Table */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    {isLoading ? (
                        <div className="p-8"><TableSkeleton /></div>
                    ) : error ? (
                        <div className="p-20 text-center">
                            <div className="text-red-500 text-5xl mb-4"><i className="fa-solid fa-triangle-exclamation"></i></div>
                            <p className="text-slate-800 font-bold text-xl">{error}</p>
                            <button onClick={() => fetchProducts(1)} className="mt-4 text-amber-600 font-semibold underline">Thử lại</button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="px-6 py-4 text-slate-500 font-bold text-xs uppercase tracking-wider w-[25%]">Sản phẩm</th>
                                        <th className="px-6 py-4 text-slate-500 font-bold text-xs uppercase tracking-wider w-[25%]">Mô tả</th>
                                        <th className="px-6 py-4 text-slate-500 font-bold text-xs uppercase tracking-wider">Danh mục</th>
                                        <th className="px-6 py-4 text-slate-500 font-bold text-xs uppercase tracking-wider">Giá & Kho</th>
                                        <th className="px-6 py-4 text-slate-500 font-bold text-xs uppercase tracking-wider text-center">Trạng thái</th>
                                        <th className="px-6 py-4 text-slate-500 font-bold text-xs uppercase tracking-wider text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {products.map((product) => (
                                        <tr key={product.id} className="hover:bg-slate-50/80 transition-colors group">
                                            
                                            {/* Cột 1: Sản phẩm (Ảnh + Tên) */}
                                            <td className="px-6 py-4 align-top">
                                                <div className="flex items-start gap-4">
                                                    <div className="h-16 w-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative">
                                                        {product.thumbnailUrl ? (
                                                            <img 
                                                                src={product.thumbnailUrl} 
                                                                alt={product.name} 
                                                                className="h-full w-full object-cover"
                                                                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/100x100?text=No+Image"; }}
                                                            />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center text-slate-300 bg-slate-50"><i className="fa-solid fa-image text-2xl"></i></div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 pt-1">
                                                        <h4 className="font-bold text-slate-900 line-clamp-2 leading-tight group-hover:text-amber-600 transition-colors" title={product.name}>
                                                            {product.name}
                                                        </h4>
                                                        <span className="text-xs text-slate-400 font-medium block mt-1">ID: #{product.id}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Cột 2: Mô tả */}
                                            <td className="px-6 py-4 align-top">
                                                <div className="text-sm text-slate-600 line-clamp-3 pt-1 leading-relaxed" title={product.description}>
                                                    {product.description ? truncateText(product.description, 80) : <span className="text-slate-400 italic">Không có mô tả</span>}
                                                </div>
                                            </td>

                                            {/* Cột 3: Danh mục */}
                                            <td className="px-6 py-4 align-top pt-5">
                                                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-tighter whitespace-nowrap">
                                                    {product.category_name}
                                                </span>
                                            </td>

                                            {/* Cột 4: Giá & Kho */}
                                            <td className="px-6 py-4 align-top pt-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900 whitespace-nowrap">{product.price_buy.toLocaleString('vi-VN')} đ</span>
                                                    <span className="text-xs text-slate-500 mt-1">Kho: <span className="font-semibold text-slate-700">{product.qty}</span></span>
                                                </div>
                                            </td>

                                            {/* Cột 5: Trạng thái */}
                                            <td className="px-6 py-4 align-top pt-5 text-center">
                                                <span className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${product.status == 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {product.status == 1 ? 'Hoạt động' : 'Đang ẩn'}
                                                </span>
                                            </td>

                                            {/* Cột 6: Thao tác */}
                                            <td className="px-6 py-4 align-top pt-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={`/admin/product/edit/${product.id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Sửa">
                                                        <i className="fa-solid fa-pen-to-square"></i>
                                                    </Link>
                                                    <button
                                                        onClick={() => { setProductToDelete(product); setIsModalOpen(true); }}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Xóa"
                                                    >
                                                        <i className="fa-solid fa-trash-can"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Empty State */}
                    {!isLoading && products.length === 0 && (
                        <div className="py-20 text-center">
                            <i className="fa-solid fa-box-open text-6xl text-slate-200 mb-4"></i>
                            <p className="text-slate-500">Không tìm thấy sản phẩm nào khớp với tìm kiếm</p>
                        </div>
                    )}
                </div>

                {/* Pagination Controls */}
                {!isLoading && pagination.lastPage > 1 && (
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                        <p className="text-sm text-slate-500 font-medium">
                            Hiển thị <span className="text-slate-900 font-bold">{products.length}</span> trên <span className="text-slate-900 font-bold">{pagination.totalItems}</span> sản phẩm
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                                disabled={pagination.currentPage === 1}
                                className="w-10 h-10 flex items-center justify-center border border-slate-200 rounded-xl bg-white text-slate-600 disabled:opacity-30 hover:bg-slate-50 transition-all font-bold"
                            >
                                <i className="fa-solid fa-chevron-left"></i>
                            </button>
                            
                            <div className="flex items-center px-4 h-10 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 min-w-[100px] justify-center">
                                Trang {pagination.currentPage} / {pagination.lastPage}
                            </div>
                            
                            <button
                                onClick={() => handlePageChange(pagination.currentPage + 1)}
                                disabled={pagination.currentPage === pagination.lastPage}
                                className="w-10 h-10 flex items-center justify-center border border-slate-200 rounded-xl bg-white text-slate-600 disabled:opacity-30 hover:bg-slate-50 transition-all font-bold"
                            >
                                <i className="fa-solid fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                )}
                
                {/* Font Awesome CDN */}
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
            </div>

            <ConfirmationModal
                isOpen={isModalOpen}
                title="Xóa sản phẩm này?"
                message={`Bạn có chắc chắn muốn xóa "${productToDelete?.name}"? Dữ liệu này sẽ không thể khôi phục sau khi xóa.`}
                onConfirm={executeDelete}
                onCancel={() => setIsModalOpen(false)}
            />
        </div>
    );
}
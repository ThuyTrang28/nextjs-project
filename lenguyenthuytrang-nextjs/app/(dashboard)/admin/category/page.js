"use client";

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import AdminCategoryService from '@/services/AdminCategoryService';

// --- CẤU HÌNH PHÂN TRANG ---
const LIMIT = 5; 

// --- COMPONENT MODAL (Giữ nguyên) ---
const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onCancel}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-100 flex items-center gap-4">
                    <div className="text-red-600 bg-red-50 p-3 rounded-full">
                        <i className="fa-solid fa-triangle-exclamation text-xl"></i>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">{title}</h3>
                </div>
                <div className="p-6">
                    <p className="text-slate-600 mb-6">{message}</p>
                    <div className="flex justify-end gap-3">
                        <button onClick={onCancel} className="px-5 py-2.5 bg-slate-100 rounded-xl text-slate-600 font-semibold hover:bg-slate-200 transition-colors">Hủy bỏ</button>
                        <button onClick={onConfirm} className="px-5 py-2.5 bg-red-600 rounded-xl text-white font-semibold hover:bg-red-700 shadow-lg shadow-red-200 transition-colors">Xác nhận Xóa</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENT CHÍNH ---
export default function CategoryManagementPage() {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State Phân trang & Tìm kiếm
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // State Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    // 1. Xử lý Debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1); 
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // 2. Hàm gọi API
    const fetchCategories = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const params = {
                page: page,
                limit: LIMIT,
                search: debouncedSearch
            };

            const response = await AdminCategoryService.getAll(params);
            const result = response.data; 

            if (result.status) {
                setCategories(result.data || []);
                setTotalItems(result.total || 0);
                setTotalPages(Math.ceil((result.total || 0) / LIMIT));
            } else {
                setError(result.message || "Lỗi tải dữ liệu");
            }

        } catch (err) {
            console.error("Lỗi tải danh mục:", err);
            setError("Không thể kết nối đến máy chủ.");
            setCategories([]);
        } finally {
            setIsLoading(false);
        }
    }, [page, debouncedSearch]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // 3. Xử lý Xóa
    const confirmDeleteCategory = (category) => {
        setCategoryToDelete(category);
        setIsModalOpen(true);
    };

    const executeDelete = async () => {
        if (!categoryToDelete) return;
        try {
            await AdminCategoryService.delete(categoryToDelete.id);
            if (categories.length === 1 && page > 1) {
                setPage(prev => prev - 1);
            } else {
                fetchCategories(); 
            }
        } catch (err) {
            alert(err.response?.data?.message || "Lỗi khi xóa danh mục");
        } finally {
            setIsModalOpen(false);
            setCategoryToDelete(null);
        }
    };

    // 4. Xử lý Cập nhật trạng thái
    const handleToggleStatus = async (category) => {
        try {
            const newStatus = category.status === 1 ? 0 : 1;
            await AdminCategoryService.update(category.id, { 
                name: category.name, 
                slug: category.slug,
                status: newStatus 
            });
            setCategories(prev => prev.map(cat => 
                cat.id === category.id ? { ...cat, status: newStatus } : cat
            ));
        } catch (err) {
            console.error("Lỗi cập nhật trạng thái:", err);
            alert("Không thể cập nhật trạng thái.");
        }
    };

    // 5. Chuyển trang
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
            <Head>
                <title>Quản lý Danh mục</title>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
            </Head>

            <div className="max-w-7xl mx-auto">
                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
                            <span className="bg-amber-500 text-white p-2 rounded-lg shadow-lg shadow-amber-200">
                                <i className="fa-solid fa-layer-group"></i>
                            </span>
                            Quản lý Danh mục
                        </h1>
                        <p className="text-slate-500 mt-1">Phân loại sản phẩm và quản lý cấu trúc hiển thị</p>
                    </div>
                    
                    <Link href="/admin/category/add">
                        <button className="bg-slate-900 text-white font-bold py-3 px-6 rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 shadow-xl shadow-slate-200">
                            <i className="fa-solid fa-plus"></i> Thêm Danh mục
                        </button>
                    </Link>
                </div>

                {/* --- SEARCH BAR --- */}
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm danh mục..." 
                            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none shadow-sm transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* --- TABLE --- */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    {isLoading ? (
                        <div className="p-12 text-center text-slate-500">
                            <i className="fa-solid fa-circle-notch fa-spin text-3xl text-amber-500 mb-3"></i>
                            <p>Đang tải dữ liệu...</p>
                        </div>
                    ) : error ? (
                        <div className="p-12 text-center text-red-500">
                            <i className="fa-solid fa-bug text-3xl mb-3"></i>
                            <p>{error}</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="px-6 py-4 text-slate-500 font-bold text-xs uppercase w-20">ID</th>
                                        <th className="px-6 py-4 text-slate-500 font-bold text-xs uppercase w-48">Tên Danh mục</th>
                                        <th className="px-6 py-4 text-slate-500 font-bold text-xs uppercase w-40">Slug</th>
                                        {/* THÊM CỘT MÔ TẢ */}
                                        <th className="px-6 py-4 text-slate-500 font-bold text-xs uppercase">Mô tả</th>
                                        <th className="px-6 py-4 text-slate-500 font-bold text-xs uppercase w-40">Danh mục Cha</th> 
                                        <th className="px-6 py-4 text-slate-500 font-bold text-xs uppercase text-center w-32">Trạng thái</th>
                                        <th className="px-6 py-4 text-slate-500 font-bold text-xs uppercase text-right w-32">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {categories.map((cat) => (
                                        <tr key={cat.id} className="hover:bg-amber-50/30 transition-colors group">
                                            <td className="px-6 py-4 text-slate-500 font-mono text-xs">#{cat.id}</td>
                                            
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900 text-sm group-hover:text-amber-600 transition-colors">
                                                    {cat.name}
                                                </div>
                                                <div className="text-xs text-slate-400 mt-0.5">
                                                    Ngày tạo: {new Date(cat.created_at).toLocaleDateString('vi-VN')}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-mono truncate max-w-[150px] block" title={cat.slug}>
                                                    {cat.slug}
                                                </span>
                                            </td>

                                            {/* HIỂN THỊ MÔ TẢ */}
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                <div className="max-w-xs truncate" title={cat.description}>
                                                    {cat.description || <span className="text-slate-400 italic">--</span>}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {cat.parent_name ? (
                                                    <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-md text-xs font-medium w-fit">
                                                        <i className="fa-solid fa-turn-up fa-rotate-90"></i> {cat.parent_name}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 italic text-xs">-- Gốc --</span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => handleToggleStatus(cat)}
                                                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                                                        cat.status === 1 
                                                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                                                    }`}
                                                >
                                                    {cat.status === 1 ? 'Hiển thị' : 'Đang ẩn'}
                                                </button>
                                            </td>
                                            
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={`/admin/category/edit/${cat.id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Sửa">
                                                        <i className="fa-solid fa-pen-to-square"></i>
                                                    </Link>
                                                    <button 
                                                        onClick={() => confirmDeleteCategory(cat)}
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
                    {!isLoading && !error && categories.length === 0 && (
                        <div className="py-20 text-center">
                            <i className="fa-solid fa-folder-open text-6xl text-slate-200 mb-4"></i>
                            <p className="text-slate-500">Không tìm thấy danh mục nào</p>
                        </div>
                    )}
                </div>

                {/* --- PHÂN TRANG (Pagination) --- */}
                {!isLoading && totalPages > 1 && (
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                        <p className="text-sm text-slate-500 font-medium">
                            Hiển thị <span className="text-slate-900 font-bold">{categories.length}</span> trên tổng số <span className="text-slate-900 font-bold">{totalItems}</span> danh mục
                        </p>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => handlePageChange(page - 1)} 
                                disabled={page === 1}
                                className="w-10 h-10 flex items-center justify-center border border-slate-200 rounded-xl bg-white text-slate-600 disabled:opacity-30 hover:bg-slate-50 font-bold transition-colors"
                            >
                                <i className="fa-solid fa-chevron-left"></i>
                            </button>
                            
                            <div className="flex items-center px-4 h-10 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 min-w-[100px] justify-center">
                                Trang {page} / {totalPages}
                            </div>
                            
                            <button 
                                onClick={() => handlePageChange(page + 1)} 
                                disabled={page === totalPages}
                                className="w-10 h-10 flex items-center justify-center border border-slate-200 rounded-xl bg-white text-slate-600 disabled:opacity-30 hover:bg-slate-50 font-bold transition-colors"
                            >
                                <i className="fa-solid fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                )}
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
            </div>

            <ConfirmationModal
                isOpen={isModalOpen}
                title="Xóa Danh mục?"
                message={`Bạn có chắc chắn muốn xóa "${categoryToDelete?.name}"? Lưu ý: Các sản phẩm thuộc danh mục này có thể bị ảnh hưởng.`}
                onConfirm={executeDelete}
                onCancel={() => setIsModalOpen(false)}
            />
        </div>
    );
}
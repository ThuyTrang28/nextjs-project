"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminCategoryService from '@/services/AdminCategoryService';

export default function AddCategoryPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [categories, setCategories] = useState([]); 

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        parent_id: '', 
        description: '',
        isActive: true,
    });

    // 1. Load danh sách danh mục cha
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await AdminCategoryService.getAll({ limit: 100 });
                if (res.data && res.data.data) {
                    setCategories(res.data.data);
                }
            } catch (error) {
                console.error("Lỗi tải danh mục cha:", error);
            }
        };
        fetchCategories();
    }, []);

    // 2. Hàm tạo Slug tự động
    const generateSlug = (text) => {
        return text.toString().toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
            .replace(/\s+/g, '-')           
            .replace(/[^\w\-]+/g, '')       
            .replace(/\-\-+/g, '-')         
            .replace(/^-+/, '')             
            .replace(/-+$/, '');            
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: type === 'checkbox' ? checked : value };
            if (name === 'name') {
                newData.slug = generateSlug(value);
            }
            return newData;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // [QUAN TRỌNG] Chuẩn bị dữ liệu để tránh lỗi 500 từ Backend
            const payload = {
                name: formData.name,
                slug: formData.slug,
                // Nếu không nhập mô tả, gửi chuỗi rỗng thay vì null
                description: formData.description || "", 
                // Chuyển boolean thành 1 hoặc 0
                status: formData.isActive ? 1 : 0, 
                // Nếu parent_id rỗng -> gửi null (Backend phải cho phép null)
                parent_id: formData.parent_id ? parseInt(formData.parent_id) : null,
                
                // [BỔ SUNG] Gửi thêm các trường mặc định để tránh lỗi database
                image: null,       
                sort_order: 0      
            };

            const response = await AdminCategoryService.create(payload);

            if (response.data && response.data.status) {
                alert('Thêm danh mục thành công!');
                router.push('/admin/category');
            } else {
                alert(response.data?.message || 'Có lỗi xảy ra!');
            }

        } catch (error) {
            console.error("Lỗi submit:", error);
            // Hiển thị lỗi chi tiết trả về từ Laravel
            const msg = error.response?.data?.message || error.message;
            const detail = error.response?.data?.error || ""; // Lấy chi tiết lỗi SQL nếu có
            alert(`Lỗi: ${msg}\n${detail}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen p-4 md:p-8 bg-slate-50/50">
            <div className="max-w-3xl mx-auto">
                <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center">
                        <span className="bg-amber-100 p-2 rounded-lg text-amber-600 mr-3">
                            <i className="fa-solid fa-folder-plus"></i>
                        </span>
                        Thêm Danh Mục
                    </h1>
                    <Link href="/admin/category" className="text-slate-500 hover:text-amber-600 font-medium flex items-center gap-2 transition-colors bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm hover:shadow-md">
                        <i className="fa-solid fa-arrow-left"></i>
                        Quay lại
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                    
                    {/* Tên Danh mục */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-bold text-slate-700 mb-2">Tên Danh mục <span className="text-red-500">*</span></label>
                        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="Ví dụ: Mỹ phẩm Cao cấp" className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all" />
                    </div>

                    {/* Slug */}
                    <div>
                        <label htmlFor="slug" className="block text-sm font-bold text-slate-700 mb-2">Slug <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <input type="text" id="slug" name="slug" value={formData.slug} onChange={handleChange} required placeholder="tu-dong-tao-tu-ten" className="w-full border border-slate-200 p-3 pl-10 rounded-xl bg-slate-50 text-slate-600 font-mono text-sm outline-none" />
                            <i className="fa-solid fa-link absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
                        </div>
                    </div>

                    {/* Danh mục cha */}
                    <div>
                        <label htmlFor="parent_id" className="block text-sm font-bold text-slate-700 mb-2">Danh mục Cha</label>
                        <select id="parent_id" name="parent_id" value={formData.parent_id} onChange={handleChange} className="w-full border border-slate-200 p-3 rounded-xl outline-none bg-white cursor-pointer">
                            <option value="">-- Là danh mục gốc --</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Mô tả */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-bold text-slate-700 mb-2">Mô tả</label>
                        <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows="4" placeholder="Mô tả ngắn gọn..." className="w-full border border-slate-200 p-3 rounded-xl outline-none resize-y"></textarea>
                    </div>
                    
                    {/* Trạng thái */}
                    <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div>
                            <span className="text-sm font-bold text-slate-700 block">Hiển thị</span>
                            <span className="text-xs text-slate-500">Bật để hiển thị trên website</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                        </label>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button type="submit" disabled={isLoading} className="bg-amber-600 text-white px-8 py-3.5 text-lg font-bold rounded-xl hover:bg-amber-700 transition-all flex items-center gap-2 disabled:opacity-70">
                            {isLoading ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Đang xử lý...</> : <><i className="fa-solid fa-save"></i> Lưu Danh Mục</>}
                        </button>
                    </div>
                </form>
            </div>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        </main>
    );
}
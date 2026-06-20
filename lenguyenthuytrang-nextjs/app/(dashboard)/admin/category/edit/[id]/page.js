"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation'; // Sử dụng useParams để lấy ID từ URL
import AdminCategoryService from '@/services/AdminCategoryService';

export default function EditCategoryPage() {
    const router = useRouter();
    const params = useParams(); // Lấy ID từ URL (ví dụ: /admin/category/edit/5 -> id = 5)
    const categoryId = params.id;

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Danh sách danh mục cha (để chọn trong dropdown)
    const [categories, setCategories] = useState([]); 

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        parent_id: '', // Mặc định rỗng
        description: '',
        isActive: true,
    });

    // 1. Tải dữ liệu ban đầu (Chi tiết danh mục + Danh sách cha)
    useEffect(() => {
        const fetchData = async () => {
            if (!categoryId) return;

            try {
                // Gọi song song 2 API để tiết kiệm thời gian
                const [categoryDetailRes, parentCategoriesRes] = await Promise.all([
                    AdminCategoryService.getById(categoryId),
                    AdminCategoryService.getAll({ limit: 100 }) // Lấy danh sách cha
                ]);

                // Xử lý danh sách cha
                if (parentCategoriesRes.data && parentCategoriesRes.data.data) {
                    // Loại bỏ chính danh mục hiện tại ra khỏi danh sách cha (tránh vòng lặp vô tận)
                    const parents = parentCategoriesRes.data.data.filter(c => c.id != categoryId);
                    setCategories(parents);
                }

                // Xử lý chi tiết danh mục để đổ vào form
                const detail = categoryDetailRes.data.data;
                if (detail) {
                    setFormData({
                        name: detail.name,
                        slug: detail.slug,
                        parent_id: detail.parent_id || '', // Nếu null thì set về rỗng
                        description: detail.description || '',
                        isActive: detail.status === 1 // Chuyển đổi số 1/0 thành true/false
                    });
                }

            } catch (error) {
                console.error("Lỗi tải dữ liệu:", error);
                alert("Không thể tải thông tin danh mục.");
                router.push('/admin/category'); // Quay về nếu lỗi
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [categoryId, router]);

    // 2. Hàm tạo Slug
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
            // Tự động cập nhật slug nếu sửa tên (có thể bỏ nếu không muốn tự động khi edit)
            if (name === 'name') {
                newData.slug = generateSlug(value);
            }
            return newData;
        });
    };

    // 3. Xử lý Submit (Cập nhật)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Chuẩn bị payload đúng format backend yêu cầu
            const payload = {
                name: formData.name,
                slug: formData.slug,
                description: formData.description || "",
                status: formData.isActive ? 1 : 0, // Chuyển lại thành số
                parent_id: formData.parent_id ? parseInt(formData.parent_id) : null,
                
                // Các trường mặc định
                image: null,
                sort_order: 0
            };

            // Gọi API Update
            const response = await AdminCategoryService.update(categoryId, payload);

            if (response.data && response.data.status) {
                alert('Cập nhật danh mục thành công!');
                router.push('/admin/category');
            } else {
                alert(response.data?.message || 'Cập nhật thất bại!');
            }

        } catch (error) {
            console.error("Lỗi cập nhật:", error);
            const msg = error.response?.data?.message || error.message;
            alert('Lỗi: ' + msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <main className="min-h-screen p-8 flex items-center justify-center bg-slate-50">
                <div className="text-xl text-slate-600 font-medium">
                    <i className="fa-solid fa-spinner fa-spin mr-3 text-blue-600"></i>
                    Đang tải dữ liệu danh mục...
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen p-4 md:p-8 bg-slate-50/50">
            <div className="max-w-3xl mx-auto">
                
                {/* --- HEADER --- */}
                <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center">
                        <span className="bg-blue-100 p-2 rounded-lg text-blue-600 mr-3">
                            <i className="fa-solid fa-pen-to-square"></i>
                        </span>
                        Chỉnh Sửa Danh Mục
                    </h1>
                    <Link href="/admin/category" className="text-slate-500 hover:text-blue-600 font-medium flex items-center gap-2 transition-colors bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm hover:shadow-md">
                        <i className="fa-solid fa-arrow-left"></i>
                        Quay lại
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                    
                    {/* Tên Danh mục */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-bold text-slate-700 mb-2">Tên Danh mục <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                        />
                    </div>

                    {/* Slug */}
                    <div>
                        <label htmlFor="slug" className="block text-sm font-bold text-slate-700 mb-2">Slug (URL) <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <input
                                type="text"
                                id="slug"
                                name="slug"
                                value={formData.slug}
                                onChange={handleChange}
                                required
                                className="w-full border border-slate-200 p-3 pl-10 rounded-xl bg-slate-50 text-slate-600 font-mono text-sm outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                            />
                            <i className="fa-solid fa-link absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
                        </div>
                    </div>

                    {/* Danh mục cha */}
                    <div>
                        <label htmlFor="parent_id" className="block text-sm font-bold text-slate-700 mb-2">Danh mục Cha</label>
                        <select
                            id="parent_id"
                            name="parent_id"
                            value={formData.parent_id}
                            onChange={handleChange}
                            className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all appearance-none bg-white cursor-pointer"
                        >
                            <option value="">-- Là danh mục gốc (Không có cha) --</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Mô tả */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-bold text-slate-700 mb-2">Mô tả</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all resize-y"
                        ></textarea>
                    </div>
                    
                    {/* Trạng thái */}
                    <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div>
                            <span className="text-sm font-bold text-slate-700 block">Trạng thái hiển thị</span>
                            <span className="text-xs text-slate-500">Bật để hiển thị danh mục này</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleChange}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-blue-600 text-white px-8 py-3.5 text-lg font-bold rounded-xl hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <><i className="fa-solid fa-circle-notch fa-spin"></i> Đang lưu...</>
                            ) : (
                                <><i className="fa-solid fa-cloud-arrow-up"></i> Cập nhật</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        </main>
    );
}
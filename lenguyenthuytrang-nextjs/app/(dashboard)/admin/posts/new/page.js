"use client";

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminTopicService from '@/services/AdminTopicService'; // [MỚI] Import Service

const initialFormData = {
    name: '',
    slug: '',
    description: '', // [MỚI]
    sort_order: 0,   // [MỚI]
    status: 1,       // [MỚI]
};

export default function AddTopicForm() {
    const router = useRouter();
    const [formData, setFormData] = useState(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({}); // Lưu lỗi validation từ Laravel

    const generateSlug = (text) => {
        if (!text) return '';
        let slug = text.toLowerCase();
        slug = slug.replace(/á|à|ả|ã|ạ|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/g, 'a');
        slug = slug.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/g, 'e');
        slug = slug.replace(/í|ì|ỉ|ĩ|ị/g, 'i');
        slug = slug.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/g, 'o');
        slug = slug.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/g, 'u');
        slug = slug.replace(/ý|ỳ|ỷ|ỹ|ỵ/g, 'y');
        slug = slug.replace(/đ/g, 'd');
        slug = slug.replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
        return slug;
    };

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        const val = type === 'number' ? parseInt(value) : value;
        
        setFormData(prev => {
            const newState = { ...prev, [name]: val };
            if (name === 'name' && !prev.slug) {
                 newState.slug = generateSlug(value);
            }
            return newState;
        });
    };

    // Xử lý gửi dữ liệu lên Laravel
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        try {
            // [KẾT NỐI API THẬT]
            const res = await AdminTopicService.create(formData);

            if (res.data && res.data.status) {
                alert("Thêm chủ đề thành công!");
                router.push('/admin/posts'); // Chuyển hướng về danh sách
            }
        } catch (error) {
            console.error("Lỗi thêm chủ đề:", error);
            // Bắt lỗi Validation (422) từ Laravel
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors);
            } else {
                alert("Có lỗi xảy ra: " + (error.response?.data?.message || error.message));
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-2xl mx-auto">
                <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-xl shadow-lg space-y-6">
                    <h1 className="text-2xl font-bold border-b pb-4">Thêm Chủ đề Mới</h1>

                    {/* Tên Chủ đề */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Tên Chủ đề</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full p-3 border rounded-lg focus:ring-green-500" />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>}
                    </div>

                    {/* Slug */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Slug</label>
                        <input type="text" name="slug" value={formData.slug} onChange={handleChange} required className="w-full p-3 border rounded-lg bg-gray-50" />
                        {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug[0]}</p>}
                    </div>

                    {/* Mô tả (Bổ sung cho khớp Controller) */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Mô tả</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} className="w-full p-3 border rounded-lg" rows="3" placeholder="Mô tả ngắn về chủ đề..." />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Sắp xếp */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Sắp xếp</label>
                            <input type="number" name="sort_order" value={formData.sort_order} onChange={handleChange} className="w-full p-3 border rounded-lg" />
                        </div>
                        {/* Trạng thái */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Trạng thái</label>
                            <select name="status" value={formData.status} onChange={handleChange} className="w-full p-3 border rounded-lg">
                                <option value={1}>Xuất bản</option>
                                <option value={0}>Chưa xuất bản</option>
                            </select>
                        </div>
                    </div>

                    <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:bg-gray-400">
                        {isSubmitting ? "Đang xử lý..." : "Lưu Chủ đề"}
                    </button>
                </form>
            </div>
        </div>
    );
}
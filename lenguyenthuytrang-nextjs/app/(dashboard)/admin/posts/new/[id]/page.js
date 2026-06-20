"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import AdminTopicService from '@/services/AdminTopicService';

export default function EditTopicPage() {
    const router = useRouter();
    const params = useParams();
    const topicId = params.id; // Lấy ID từ URL ví dụ: /admin/topic/edit/1

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        sort_order: 0,
        status: 1
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // 1. Tải dữ liệu cũ của chủ đề
    useEffect(() => {
        const fetchTopic = async () => {
            if (!topicId) return;
            try {
                const res = await AdminTopicService.getById(topicId);
                if (res.data && res.data.status) {
                    const topic = res.data.data;
                    setFormData({
                        name: topic.name || '',
                        slug: topic.slug || '',
                        description: topic.description || '',
                        sort_order: topic.sort_order || 0,
                        status: topic.status ?? 1
                    });
                }
            } catch (error) {
                console.error("Lỗi tải chủ đề:", error);
                alert("Không thể tải thông tin chủ đề.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchTopic();
    }, [topicId]);

    // 2. Xử lý thay đổi input
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) : value
        }));
    };

    // 3. Gửi dữ liệu cập nhật
    // EditTopicPage.js

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const dataToUpdate = {
                ...formData,
                sort_order: parseInt(formData.sort_order) || 0,
                status: parseInt(formData.status),
                // BẮT BUỘC: Laravel cần trường này để hiểu đây là request PUT
                _method: 'PUT'
            };

            // Gửi qua phương thức POST (Service của bạn cần dùng http.post)
            const res = await AdminTopicService.update(topicId, dataToUpdate);

            if (res.data && res.data.status) {
                alert("Cập nhật chủ đề thành công!");
                router.push('/admin/posts');
            }
        } catch (error) {
            // Log toàn bộ error để xem status code là bao nhiêu (422, 500, hay 405)
            console.error("Chi tiết lỗi:", error.response);
            alert("Lỗi: " + (error.response?.data?.message || "Kiểm tra log Laravel để xem chi tiết lỗi 500"));
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center">Đang tải dữ liệu...</div>;

    return (
        <div className="p-4 md:p-8 bg-slate-50 min-h-screen text-slate-800">
            <div className="max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-8 border-b pb-4">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <i className="fa-solid fa-pen-to-square text-blue-600"></i>
                        Chỉnh sửa chủ đề: #{topicId}
                    </h1>
                    <Link href="/admin/posts" className="text-slate-500 hover:text-blue-600 flex items-center gap-2">
                        <i className="fa-solid fa-arrow-left"></i> Quay lại
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                    {/* Tên chủ đề */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Tên chủ đề</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100" />
                    </div>

                    {/* Slug */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Slug (Đường dẫn)</label>
                        <input type="text" name="slug" value={formData.slug} onChange={handleChange} required className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 outline-none" />
                    </div>

                    {/* Mô tả */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Mô tả</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full p-3 border border-slate-200 rounded-xl outline-none" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Thứ tự sắp xếp</label>
                            <input type="number" name="sort_order" value={formData.sort_order} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-xl outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Trạng thái</label>
                            <select name="status" value={formData.status} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-xl outline-none">
                                <option value={1}>Hiện (Xuất bản)</option>
                                <option value={0}>Ẩn (Nháp)</option>
                            </select>
                        </div>
                    </div>

                    <button type="submit" disabled={isSaving} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:bg-slate-300">
                        {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                </form>
            </div>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        </div>
    );
}
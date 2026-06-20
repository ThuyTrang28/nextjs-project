"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminPostService from '@/services/AdminPostService';
import AdminTopicService from '@/services/AdminTopicService';

export default function AddPostForm() {
    const router = useRouter();

    // --- STATE ---
    const [topics, setTopics] = useState([]);
    const [loadingTopics, setLoadingTopics] = useState(true);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form Data State
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        topic_id: '',
        post_type: 'post',
        description: '',
        content: '',
        status: 1,
        // image is managed separately or can be kept null here
    });

    // Separate state for the file object to ensure clarity
    const [file, setFile] = useState(null);

    // --- 1. LẤY DANH SÁCH CHỦ ĐỀ (TOPIC) ---
    useEffect(() => {
        (async () => {
            try {
                const res = await AdminTopicService.getAll({ limit: 100 });
                if (res.data.status) {
                    setTopics(res.data.data);
                    if (res.data.data.length > 0) {
                        setFormData(prev => ({ ...prev, topic_id: res.data.data[0].id }));
                    }
                }
            } catch (error) {
                console.error("Lỗi lấy danh sách chủ đề:", error);
            } finally {
                setLoadingTopics(false);
            }
        })();
    }, []);

    // --- 2. HÀM TẠO SLUG TỰ ĐỘNG ---
    const generateSlug = (text) => {
        return text
            .toString()
            .toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    };

    // --- 3. XỬ LÝ THAY ĐỔI INPUT ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            if (name === 'title') {
                newData.slug = generateSlug(value);
            }
            return newData;
        });
    };

    // --- 4. XỬ LÝ ẢNH ---
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile); // Update file state
            
            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => setThumbnailPreview(reader.result);
            reader.readAsDataURL(selectedFile);
        } else {
            setFile(null);
            setThumbnailPreview(null);
        }
    };

    // --- 5. SUBMIT FORM ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Use FormData to send data including the file
            const dataPayload = new FormData();
            
            // Append text fields from state
            dataPayload.append('title', formData.title);
            dataPayload.append('slug', formData.slug);
            dataPayload.append('topic_id', formData.topic_id);
            dataPayload.append('post_type', formData.post_type);
            dataPayload.append('description', formData.description);
            dataPayload.append('content', formData.content);
            dataPayload.append('status', formData.status);
            
            // Append file if selected
            // Note: Ensure your backend validation expects 'image'
            if (file) {
                dataPayload.append('image', file);
            }

            // Call API
            await AdminPostService.create(dataPayload);
            
            alert("Thêm bài viết thành công!");
            router.push('/admin/posts');

        } catch (error) {
            console.error("Lỗi khi thêm bài viết:", error);
            
            // Handle Laravel Validation Errors (422)
            if (error.response && error.response.status === 422) {
                const errors = error.response.data.errors;
                if (errors) {
                    const firstKey = Object.keys(errors)[0];
                    alert(`Lỗi: ${errors[firstKey][0]}`);
                } else {
                     alert(error.response.data.message || "Dữ liệu không hợp lệ.");
                }
            } else {
                const msg = error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.";
                alert(msg);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-5xl mx-auto">
                
                {/* HEADER */}
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center">
                        <i className="fa-solid fa-file-circle-plus mr-3 text-red-600"></i>
                        Thêm Bài viết Mới
                    </h1>
                    <a href="/admin/posts" className="text-slate-600 hover:text-red-600 transition-colors flex items-center gap-1 font-medium">
                        <i className="fa-solid fa-arrow-left"></i> Quay lại
                    </a>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="bg-white p-6 md:p-10 rounded-xl shadow-xl space-y-6">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Tiêu đề */}
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Tiêu đề (Title)</label>
                            <input
                                type="text" name="title"
                                value={formData.title} onChange={handleChange}
                                required
                                placeholder="Nhập tiêu đề bài viết..."
                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-red-500 focus:border-red-500 shadow-sm"
                            />
                        </div>

                        {/* Slug (Auto generate) */}
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Slug (Đường dẫn)</label>
                            <input
                                type="text" name="slug"
                                value={formData.slug} onChange={handleChange}
                                required
                                className="w-full p-3 border border-slate-300 bg-slate-50 rounded-lg focus:ring-red-500 focus:border-red-500 shadow-sm text-slate-600"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Chủ đề (Topic) */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Chủ đề (Topic)</label>
                            <div className="relative">
                                <select
                                    name="topic_id"
                                    value={formData.topic_id} onChange={handleChange}
                                    required
                                    disabled={loadingTopics}
                                    className="block w-full p-3 border border-slate-300 rounded-lg bg-white appearance-none pr-8 focus:ring-red-500 shadow-sm"
                                >
                                    <option value="" disabled>-- Chọn chủ đề --</option>
                                    {topics.map(topic => (
                                        <option key={topic.id} value={topic.id}>{topic.name}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                                    <i className="fa-solid fa-angle-down text-xs"></i>
                                </div>
                            </div>
                        </div>

                        {/* Loại bài viết (Post Type) */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Loại (Post Type)</label>
                            <div className="relative">
                                <select
                                    name="post_type"
                                    value={formData.post_type} onChange={handleChange}
                                    className="block w-full p-3 border border-slate-300 rounded-lg bg-white appearance-none pr-8 focus:ring-red-500 shadow-sm"
                                >
                                    <option value="post">Bài viết (Post)</option>
                                    <option value="page">Trang đơn (Page)</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                                    <i className="fa-solid fa-angle-down text-xs"></i>
                                </div>
                            </div>
                        </div>

                        {/* Trạng thái */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Trạng thái</label>
                            <div className="relative">
                                <select
                                    name="status"
                                    value={formData.status} onChange={handleChange}
                                    className="block w-full p-3 border border-slate-300 rounded-lg bg-white appearance-none pr-8 focus:ring-red-500 shadow-sm"
                                >
                                    <option value="1">Xuất bản</option>
                                    <option value="0">Nháp</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                                    <i className="fa-solid fa-angle-down text-xs"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mô tả ngắn */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Mô tả ngắn (Description)</label>
                        <textarea
                            name="description"
                            value={formData.description} onChange={handleChange}
                            rows="3"
                            placeholder="Tóm tắt nội dung bài viết..."
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-red-500 shadow-sm"
                        ></textarea>
                    </div>

                    {/* Ảnh đại diện */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Ảnh đại diện (Thumbnail)</label>
                        <input
                            type="file" name="image"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-red-500 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 cursor-pointer shadow-sm"
                        />
                        {thumbnailPreview && (
                            <div className="mt-4 p-2 border border-slate-200 rounded-lg bg-slate-50 inline-block">
                                <img src={thumbnailPreview} alt="Preview" className="max-h-40 rounded shadow-sm" />
                            </div>
                        )}
                    </div>
                    
                    {/* Nội dung chi tiết */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Nội dung chi tiết (Content)</label>
                        <textarea
                            name="content"
                            value={formData.content} onChange={handleChange}
                            required
                            rows="15"
                            placeholder="Viết nội dung bài đăng tại đây..."
                            className="w-full p-4 border border-slate-300 rounded-lg focus:ring-red-500 transition shadow-sm font-sans"
                        ></textarea>
                    </div>

                    {/* Nút Submit */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`py-3 px-8 rounded-xl font-bold text-white transition-all duration-200 shadow-lg flex items-center gap-2
                                ${isSubmitting ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 hover:-translate-y-1'}`}
                        >
                            {isSubmitting ? <><i className="fa-solid fa-spinner fa-spin"></i> Đang lưu...</> : <><i className="fa-solid fa-save"></i> Lưu Bài Viết</>}
                        </button>
                    </div>
                </form>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
            </div>
        </div>
    );
}
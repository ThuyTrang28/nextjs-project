"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation'; // Hook điều hướng
import AdminPostService from '@/services/AdminPostService';
import AdminTopicService from '@/services/AdminTopicService';

// Cấu hình đường dẫn ảnh (Cần khớp với backend của bạn)
const IMAGE_BASE_URL = "http://localhost/lenguyenthuytrang_cdtt/public/images/post";

export default function EditPostPage() {
    const router = useRouter();
    const { id } = useParams(); // Lấy ID từ URL (vd: /admin/posts/edit/5)

    // --- STATE ---
    const [topics, setTopics] = useState([]); // Danh sách chủ đề cho dropdown

    const [formData, setFormData] = useState({
        title: '',
        topic_id: '',
        type: 'post', // Mặc định là post
        status: 1,
        content: '',  // Nội dung chi tiết (detail)
        description: '', // Mô tả ngắn
        image: null,  // File ảnh mới (nếu có)
    });

    const [currentImage, setCurrentImage] = useState(null); // Tên ảnh cũ từ DB
    const [thumbnailPreview, setThumbnailPreview] = useState(null); // Preview ảnh mới

    // State trạng thái UI
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // --- 1. LOAD DỮ LIỆU (BÀI VIẾT + CHỦ ĐỀ) ---
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Gọi song song 2 API: Lấy chi tiết bài viết & Lấy danh sách chủ đề
                const [postRes, topicRes] = await Promise.all([
                    AdminPostService.getById(id),
                    AdminTopicService.getAll()
                ]);

                // 1. Set danh sách chủ đề
                if (topicRes.data.status) {
                    setTopics(topicRes.data.data);
                }

                // 2. Fill dữ liệu bài viết vào form
                // ... trong useEffect
                if (postRes.data.status) {
                    const post = postRes.data.data;
                    setFormData({
                        title: post.title,
                        topic_id: post.topic_id,

                        // 🔴 SỬA: Lấy đúng key từ API (post_type thay vì type)
                        type: post.post_type || 'post',

                        status: post.status,
                        content: post.detail || post.content, // fix phòng hờ cả 2 trường hợp
                        description: post.description,
                        image: null,

                        // 🟢 THÊM: Lưu slug cũ vào state để gửi lại khi update
                        slug: post.slug
                    });
                    setCurrentImage(post.image);
                }

            } catch (err) {
                console.error("Lỗi tải dữ liệu:", err);
                setError("Không thể tải dữ liệu bài viết. Vui lòng thử lại.");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchData();
    }, [id]);

    // --- 2. XỬ LÝ FORM ---

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, image: file }));
            // Tạo URL preview
            const objectUrl = URL.createObjectURL(file);
            setThumbnailPreview(objectUrl);
        }
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
        const data = new FormData();
        data.append('title', formData.title);
        data.append('topic_id', formData.topic_id);
        data.append('content', formData.content); 
        data.append('description', formData.description);
        data.append('status', formData.status);

        // 🔴 SỬA: Đổi tên key 'type' thành 'post_type' cho khớp Backend
        data.append('post_type', formData.type); 

        // 🟢 THÊM: Gửi slug lên (Nếu form không có chỗ nhập slug thì lấy từ state cũ hoặc tạo từ title)
        // Cách đơn giản nhất: Gửi lại slug cũ đã load từ DB
        data.append('slug', formData.slug); 

        if (formData.image) {
            data.append('image', formData.image);
        }

        data.append('_method', 'PUT');

        const response = await AdminPostService.update(id, data);

            if (response.data.status) {
                alert("Cập nhật bài viết thành công!");
                router.push('/admin/posts'); // Quay về trang danh sách
            } else {
                setError(response.data.message || "Cập nhật thất bại.");
            }

        } catch (err) {
            console.error("❌ Lỗi submit:", err);

            // 👇 THÊM ĐOẠN NÀY ĐỂ SOI LỖI 422
            if (err.response && err.response.status === 422) {
                console.log("CHI TIẾT LỖI VALIDATE:", err.response.data.errors);
                alert("Lỗi dữ liệu: " + JSON.stringify(err.response.data.errors));
            }

            setError("Có lỗi xảy ra khi cập nhật. Vui lòng kiểm tra lại.");
        }
    };

    // --- 3. RENDER UI ---

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <p className="text-xl font-medium text-red-600 flex items-center gap-3">
                    <i className="fa-solid fa-spinner fa-spin text-2xl"></i> Đang tải dữ liệu...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 max-w-4xl mx-auto mt-10">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                    <strong className="font-bold">Lỗi! </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
                <button onClick={() => router.back()} className="mt-4 text-slate-600 hover:text-black underline">
                    Quay lại
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h1 className="text-3xl font-extrabold text-slate-800 flex items-center">
                        <i className="fa-solid fa-file-pen mr-3 text-red-600"></i>
                        Chỉnh sửa Bài viết (#{id})
                    </h1>
                    <button onClick={() => router.push('/admin/posts')} className="text-slate-600 hover:text-red-600 transition-colors flex items-center gap-1 font-medium">
                        <i className="fa-solid fa-arrow-left"></i> Quay lại
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white p-6 md:p-10 rounded-xl shadow-xl space-y-6">

                    {/* Hàng 1: Tiêu đề */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Tiêu đề bài viết <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                            placeholder="Nhập tiêu đề bài viết..."
                        />
                    </div>

                    {/* Hàng 2: Chủ đề, Loại, Trạng thái */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Chủ đề */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Chủ đề (Topic)</label>
                            <select
                                name="topic_id"
                                value={formData.topic_id}
                                onChange={handleChange}
                                required
                                className="w-full p-3 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-red-500 outline-none"
                            >
                                <option value="">-- Chọn chủ đề --</option>
                                {topics.map(topic => (
                                    <option key={topic.id} value={topic.id}>{topic.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Loại bài viết */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Loại bài viết</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="w-full p-3 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-red-500 outline-none"
                            >
                                <option value="post">Bài viết (Post)</option>
                                <option value="page">Trang đơn (Page)</option>
                            </select>
                        </div>

                        {/* Trạng thái */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Trạng thái</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full p-3 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-red-500 outline-none"
                            >
                                <option value="1">Xuất bản</option>
                                <option value="2">Nháp</option>
                            </select>
                        </div>
                    </div>

                    {/* Hàng 3: Ảnh đại diện */}
                    <div className="p-4 border border-dashed border-slate-300 rounded-xl bg-slate-50">
                        <label className="block text-sm font-bold text-slate-700 mb-3">Hình đại diện</label>
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            {/* Input chọn file */}
                            <div className="flex-1 w-full">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="block w-full text-sm text-slate-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-full file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-red-50 file:text-red-700
                                    hover:file:bg-red-100 cursor-pointer"
                                />
                                <p className="mt-2 text-xs text-slate-500 italic">Chọn ảnh mới nếu muốn thay đổi.</p>
                            </div>

                            {/* Preview Ảnh */}
                            <div className="shrink-0">
                                <span className="block text-xs font-semibold text-slate-500 mb-1 text-center">
                                    {thumbnailPreview ? "Ảnh mới chọn:" : "Ảnh hiện tại:"}
                                </span>
                                {thumbnailPreview ? (
                                    <img src={thumbnailPreview} alt="Preview" className="h-24 w-auto object-cover rounded-lg border border-red-300 shadow-sm" />
                                ) : currentImage ? (
                                    <img src={`${IMAGE_BASE_URL}/${currentImage}`} alt="Current" className="h-24 w-auto object-cover rounded-lg border border-slate-300 shadow-sm" />
                                ) : (
                                    <div className="h-24 w-24 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs">No Image</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Hàng 4: Mô tả ngắn */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Mô tả ngắn (SEO)</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                            placeholder="Mô tả tóm tắt nội dung bài viết..."
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                        ></textarea>
                    </div>

                    {/* Hàng 5: Nội dung chi tiết */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Nội dung chi tiết</label>
                        <textarea
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            required
                            rows="12"
                            placeholder="Nhập nội dung bài viết ở đây..."
                            className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none font-mono text-sm leading-relaxed"
                        ></textarea>
                    </div>

                    {/* Nút Submit */}
                    <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => router.push('/admin/posts')}
                            className="px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`px-8 py-3 rounded-xl text-white font-bold shadow-lg flex items-center gap-2 transition transform hover:-translate-y-0.5
                                ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
                        >
                            {isSubmitting ? <><i className="fa-solid fa-spinner fa-spin"></i> Đang lưu...</> : <><i className="fa-solid fa-floppy-disk"></i> Lưu thay đổi</>}
                        </button>
                    </div>

                </form>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
            </div>
        </div>
    );
}
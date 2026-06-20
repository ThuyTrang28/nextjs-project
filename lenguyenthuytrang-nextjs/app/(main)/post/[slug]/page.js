"use client";

import { useState, useEffect, use } from "react"; // Thêm hook 'use'
import Link from "next/link";
import ClientPostService from "@/services/ClientPostService";

// Cấu hình đường dẫn ảnh
const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_URL || 'http://localhost/lenguyenthuytrang_cdtt/public/images/post';

const getImageUrl = (imageName) => {
    if (!imageName) return "https://via.placeholder.com/1200x600?text=No+Image";
    if (imageName.startsWith('http')) return imageName;
    return `${IMAGE_BASE_URL}/${imageName}`;
};

export default function PostDetailPage({ params }) {
    // ✅ Next.js 15+: Unwrap params bằng React.use()
    const { slug } = use(params);

    const [post, setPost] = useState(null);
    const [relatedPosts, setRelatedPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!slug) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Lấy chi tiết bài viết
                const res = await ClientPostService.getBySlug(slug);
                if (res.data.status) {
                    const postData = res.data.data;
                    setPost(postData);

                    // 2. Nếu có bài viết, lấy thêm bài viết liên quan (cùng Topic)
                    // Lưu ý: Backend cần trả về topic_slug hoặc topic_id để gọi API này
                    if (postData.topic_slug || postData.topic_id) {
                       // Demo logic lấy bài liên quan (tùy chỉnh theo API backend của bạn)
                       // const relatedRes = await ClientPostService.getByTopic(postData.topic_slug);
                       // if (relatedRes.data.status) setRelatedPosts(relatedRes.data.data.data);
                    }
                }
            } catch (error) {
                console.error("Lỗi tải bài viết:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-white">
                <p className="text-xl text-gray-500 flex items-center gap-2">
                    <i className="fa-solid fa-spinner fa-spin"></i> Loading content...
                </p>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-white text-center px-4">
                <div className="text-6xl text-gray-300 mb-4"><i className="fa-regular fa-file-excel"></i></div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Article not found</h1>
                <p className="text-gray-500 mb-6">This article may have been deleted or the link does not exist.</p>
                <Link href="/post" className="bg-black text-white px-6 py-3 rounded-full hover:bg-red-600 transition">
                    Back to the news page
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen font-sans text-gray-800 pb-20">
            {/* --- BREADCRUMB --- */}
            <div className="bg-gray-50 border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-4 py-4 text-sm text-gray-500 flex items-center gap-2">
                    <Link href="/" className="hover:text-black">Home</Link>
                    <i className="fa-solid fa-chevron-right text-xs"></i>
                    <Link href="/post" className="hover:text-black">News</Link>
                    <i className="fa-solid fa-chevron-right text-xs"></i>
                    <span className="text-gray-800 font-medium truncate max-w-[200px]">{post.title}</span>
                </div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <article className="max-w-4xl mx-auto px-4 mt-10">
                {/* Header Bài viết */}
                <header className="mb-10 text-center">
                    <div className="flex justify-center items-center gap-4 text-sm text-gray-500 mb-4 uppercase tracking-wider font-semibold">
                        <span className="text-red-600">{post.topic_name || "News"}</span>
                        <span>•</span>
                        <span>{new Date(post.created_at).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
                        {post.title}
                    </h1>
                    <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
                        {post.description}
                    </p>
                </header>

                {/* Featured Image */}
                <div className="w-full rounded-2xl overflow-hidden shadow-lg mb-12 bg-gray-100 flex justify-center">
                    <img 
                        src={getImageUrl(post.image)} 
                        alt={post.title} 
                        // SỬA: Dùng 'w-full h-auto' để ảnh hiển thị full kích thước gốc
                        // Bỏ 'object-cover' và 'aspect-video' ở thẻ cha để tránh crop ảnh
                        className="w-full h-auto max-h-[600px] object-contain" 
                        onError={(e) => {e.target.onerror = null; e.target.src="https://via.placeholder.com/1200x600?text=No+Image"}}
                    />
                </div>

                {/* Nội dung bài viết (HTML) */}
                {/* Sử dụng prose của Tailwind để format văn bản đẹp tự động */}
                <div 
                    className="prose prose-lg prose-slate max-w-none 
                    prose-headings:font-bold prose-headings:text-gray-900 
                    prose-a:text-red-600 prose-a:no-underline hover:prose-a:underline
                    prose-img:rounded-xl prose-img:shadow-md"
                    dangerouslySetInnerHTML={{ __html: post.content || post.detail }} // Support cả 2 tên trường
                ></div>

                {/* Footer bài viết */}
                <div className="mt-16 pt-8 border-t border-gray-200 flex justify-between items-center">
                    <div className="flex gap-2">
                        <span className="font-bold text-gray-900">Share:</span>
                        <button className="text-gray-500 hover:text-blue-600"><i className="fa-brands fa-facebook"></i></button>
                        <button className="text-gray-500 hover:text-blue-400"><i className="fa-brands fa-twitter"></i></button>
                        <button className="text-gray-500 hover:text-red-600"><i className="fa-brands fa-pinterest"></i></button>
                    </div>
                    <Link href="/post" className="text-gray-600 font-semibold hover:text-black flex items-center gap-2">
                        <i className="fa-solid fa-arrow-left"></i> Back to list
                    </Link>
                </div>
            </article>

            {/* Link CSS FontAwesome (Nếu chưa có trong Layout chung) */}
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        </div>
    );
}
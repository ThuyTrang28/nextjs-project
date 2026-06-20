"use client";
import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import ClientPostService from '@/services/ClientPostService';

// ✅ CẤU HÌNH ĐƯỜNG DẪN ẢNH (Quan trọng)
const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_URL || 'http://localhost/lenguyenthuytrang_cdtt/public/images/post';

const getImageUrl = (imageName) => {
    if (!imageName) return null; // Trả về null nếu không có ảnh để xử lý giao diện fallback
    if (imageName.startsWith('http')) return imageName;
    return `${IMAGE_BASE_URL}/${imageName}`;
};

export default function DynamicPage({ params }) {
    const { slug } = use(params);

    const [pageData, setPageData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!slug) return;
        const fetchPageData = async () => {
            try {
                setLoading(true);
                const response = await ClientPostService.getPage(slug);
                if (response.data.status) {
                    setPageData(response.data.data);
                } else {
                    setError("Không tìm thấy nội dung trang này.");
                }
            } catch (err) {
                console.error("Lỗi tải trang:", err);
                setError("Trang không tồn tại hoặc đã bị xóa.");
            } finally {
                setLoading(false);
            }
        };
        fetchPageData();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col justify-center items-center bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
                <p className="text-gray-500 font-medium">Loading content...</p>
            </div>
        );
    }

    if (error || !pageData) {
        return (
            <div className="min-h-[60vh] flex flex-col justify-center items-center text-center px-4 bg-gray-50">
                <i className="fa-regular fa-folder-open text-6xl text-gray-300 mb-6"></i>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Page not found</h1>
                <p className="text-gray-500 mb-8">{error}</p>
                <Link href="/" className="bg-black text-white px-8 py-3 rounded-full hover:bg-red-600 transition shadow-lg font-medium">
                    Back to Home
                </Link>
            </div>
        );
    }

    const featuredImage = getImageUrl(pageData.image);

    return (
        <div className="bg-white min-h-screen font-sans text-gray-800">
            
            {/* --- HERO SECTION (Banner Ảnh) --- */}
            {/* Nếu có ảnh thì hiển thị banner ảnh, không thì hiển thị banner màu */}
            <div className="relative w-full h-[300px] md:h-[400px] bg-gray-900 flex items-center justify-center overflow-hidden">
                {featuredImage ? (
                    <>
                        <img 
                            src={featuredImage} 
                            alt={pageData.title} 
                            className="absolute inset-0 w-full h-full object-cover opacity-60"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent"></div>
                    </>
                ) : (
                    <div className="absolute inset-0 bg-linear-to-r from-gray-800 to-black opacity-90"></div>
                )}
                
                <div className="relative z-10 container mx-auto px-4 text-center">
                    <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg leading-tight uppercase tracking-wide">
                        {pageData.title}
                    </h1>
                    <div className="flex justify-center items-center gap-2 text-gray-300 text-sm font-medium">
                        <Link href="/" className="hover:text-white transition">Home</Link>
                        <span>/</span>
                        <span className="text-red-500">{pageData.title}</span>
                    </div>
                </div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="container mx-auto px-4 py-16 max-w-5xl">
                <div className="flex flex-col lg:flex-row gap-12">
                    
                    {/* Cột Trái: Nội dung chính */}
                    <main className="lg:w-3/4">
                        <article className="prose prose-lg prose-slate max-w-none 
                            prose-headings:font-bold prose-headings:text-gray-900 
                            prose-p:text-gray-600 prose-p:leading-8
                            prose-a:text-red-600 prose-a:no-underline hover:prose-a:underline
                            prose-img:rounded-2xl prose-img:shadow-lg prose-img:my-8
                            prose-blockquote:border-l-4 prose-blockquote:border-red-500 prose-blockquote:bg-gray-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:italic"
                        >
                            {/* Hiển thị mô tả ngắn (Sapo) đậm hơn */}
                            {pageData.description && (
                                <p className="lead font-medium text-xl text-gray-800 mb-8 border-l-4 border-black pl-4">
                                    {pageData.description}
                                </p>
                            )}

                            {/* Nội dung chi tiết HTML */}
                            <div dangerouslySetInnerHTML={{ __html: pageData.content || pageData.detail }} />
                        </article>

                        {/* Footer bài viết */}
                        <div className="mt-12 pt-8 border-t border-gray-200 text-sm text-gray-500 flex justify-between items-center">
                            <span>Last updated: {new Date(pageData.updated_at).toLocaleDateString('vi-VN')}</span>
                            <div className="flex gap-4">
                                <button className="hover:text-blue-600"><i className="fa-brands fa-facebook fa-lg"></i></button>
                                <button className="hover:text-blue-400"><i className="fa-brands fa-twitter fa-lg"></i></button>
                                <button className="hover:text-red-600"><i className="fa-brands fa-pinterest fa-lg"></i></button>
                            </div>
                        </div>
                    </main>

                    {/* Cột Phải: Sidebar (Giả lập) */}
                    <aside className="lg:w-1/4 space-y-8">
                        {/* Box 1: Giới thiệu ngắn */}
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <h3 className="font-bold text-lg mb-4 border-b-2 border-black pb-2 inline-block">About us</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Dior Beauty brings luxurious and classy beauty. Discover the latest collections today..
                            </p>
                            <Link href="/products" className="text-sm font-bold text-red-600 hover:underline">View product &rarr;</Link>
                        </div>

                        {/* Box 2: Link nhanh */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-lg mb-4">Other information</h3>
                            <ul className="space-y-3 text-sm text-gray-600">
                                <li><Link href="/pages/chinh-sach-bao-mat" className="hover:text-red-600 flex items-center gap-2"><i className="fa-solid fa-shield-halved text-xs"></i> Privacy Policy</Link></li>
                                <li><Link href="/pages/dieu-khoan-su-dung" className="hover:text-red-600 flex items-center gap-2"><i className="fa-solid fa-file-contract text-xs"></i> Terms of Use</Link></li>
                                <li><Link href="/contact" className="hover:text-red-600 flex items-center gap-2"><i className="fa-solid fa-envelope text-xs"></i> Contact support</Link></li>
                            </ul>
                        </div>
                    </aside>

                </div>
            </div>

            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        </div>
    );
}
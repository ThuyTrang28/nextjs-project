"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ClientPostService from "@/services/ClientPostService";
import ClientTopicService from "@/services/ClientTopicService";

// ✅ 1. CẤU HÌNH ĐƯỜNG DẪN ẢNH CHÍNH XÁC (Trỏ vào thư mục chứa ảnh bài viết)
const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_URL || 'http://localhost/lenguyenthuytrang_cdtt/public/images/post';

// ✅ 2. HÀM XỬ LÝ ẢNH
const getImageUrl = (imageName) => {
    if (!imageName) return "https://via.placeholder.com/600x400?text=No+Image";
    // Nếu ảnh đã là link full (http...) thì giữ nguyên, ngược lại nối với base url
    if (imageName.startsWith('http')) return imageName;
    return `${IMAGE_BASE_URL}/${imageName}`;
};

export default function PostListPage() {
    // --- STATE ---
    const [posts, setPosts] = useState([]);
    const [topics, setTopics] = useState([]);
    
    // State bộ lọc & phân trang
    const [selectedTopic, setSelectedTopic] = useState('all'); 
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    // --- 1. LẤY DANH SÁCH CHỦ ĐỀ ---
    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const res = await ClientTopicService.getAll(); 
                if (res.data && res.data.status) {
                    setTopics(res.data.data || []);
                }
            } catch (error) {
                console.error("Lỗi lấy chủ đề:", error);
            }
        };
        fetchTopics();
    }, []);

    // --- 2. LẤY DANH SÁCH BÀI VIẾT ---
    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                const params = {
                    page: page,
                    limit: 6,      
                    status: 1,     
                    sort: 'newest' 
                };

                if (selectedTopic !== 'all') {
                    params.topic_id = selectedTopic;
                }

                const res = await ClientPostService.getAll(params);
                
                if (res.data && res.data.status) {
                    setPosts(res.data.data?.data || []); 
                    setTotalPages(res.data.data?.last_page || 1);
                }
            } catch (error) {
                console.error("Lỗi lấy bài viết:", error);
                setPosts([]); 
            } finally {
                setTimeout(() => setLoading(false), 300);
            }
        };

        fetchPosts();
    }, [page, selectedTopic]);

    // --- HANDLERS ---
    const handleTopicChange = (topicId) => {
        if (topicId === selectedTopic) return;
        setSelectedTopic(topicId);
        setPage(1); 
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans text-gray-800 pb-20">
            
            {/* HEADER BANNER */}
            <div className="bg-black text-white py-16 text-center px-4 mb-10 shadow-md">
                <h1 className="text-4xl font-bold mb-4 uppercase tracking-wider">News & Events</h1>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    Update the latest trends, knowledge, and promotions.
                </p>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-10">
                    
                    {/* --- SIDEBAR: LỌC CHỦ ĐỀ --- */}
                    <aside className="lg:w-1/4">
                        <div className="sticky top-24 bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-xl mb-6 border-b-2 border-black pb-2 flex items-center">
                                <i className="fa-solid fa-filter mr-2"></i> Topic
                            </h3>
                            <ul className="space-y-2">
                                <li>
                                    <button 
                                        onClick={() => handleTopicChange('all')}
                                        className={`w-full text-left py-3 px-4 rounded-xl transition-all font-medium flex justify-between items-center ${
                                            selectedTopic === 'all' 
                                            ? 'bg-black text-white shadow-lg transform scale-105' 
                                            : 'hover:bg-gray-200 text-gray-600'
                                        }`}
                                    >
                                        <span>All</span>
                                        {selectedTopic === 'all' && <i className="fa-solid fa-check text-xs"></i>}
                                    </button>
                                </li>
                                {topics.length > 0 && topics.map((topic) => (
                                    <li key={topic.id}>
                                        <button 
                                            onClick={() => handleTopicChange(topic.id)}
                                            className={`w-full text-left py-3 px-4 rounded-xl transition-all font-medium flex justify-between items-center ${
                                                selectedTopic === topic.id 
                                                ? 'bg-black text-white shadow-lg transform scale-105' 
                                                : 'hover:bg-gray-200 text-gray-600'
                                            }`}
                                        >
                                            <span>{topic.name}</span>
                                            {selectedTopic === topic.id && <i className="fa-solid fa-check text-xs"></i>}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </aside>

                    {/* --- MAIN: DANH SÁCH BÀI VIẾT --- */}
                    <main className="lg:w-3/4">
                        {loading ? (
                            // LOADING SKELETON
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="animate-pulse bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                        <div className="bg-gray-200 h-56 rounded-xl mb-4 w-full"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
                                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                                        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                    </div>
                                ))}
                            </div>
                        ) : posts.length > 0 ? (
                            <>
                                {/* GRID BÀI VIẾT */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {posts.map((post) => (
                                        <article key={post.id} className="group flex flex-col bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden h-full">
                                            
                                            {/* Hình ảnh */}
                                            <div className="relative h-60 overflow-hidden bg-gray-100">
                                                <Link href={`/post/${post.slug || post.id}`}>
                                                    <img 
                                                        // ✅ DÙNG HÀM getImageUrl ĐỂ LOAD ẢNH
                                                        src={getImageUrl(post.image)} 
                                                        alt={post.title} 
                                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                                        // Thêm xử lý lỗi ảnh
                                                        onError={(e) => {e.target.onerror = null; e.target.src="https://via.placeholder.com/600x400?text=No+Image"}}
                                                    />
                                                </Link>
                                                <div className="absolute top-4 left-4 bg-black/80 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm shadow-md">
                                                    {post.topic_name || "News"}
                                                </div>
                                            </div>

                                            {/* Nội dung */}
                                            <div className="p-6 flex flex-col flex-1">
                                                <div className="flex items-center text-gray-400 text-xs mb-3 space-x-2">
                                                    <i className="fa-regular fa-calendar"></i>
                                                    <span>{post.created_at ? new Date(post.created_at).toLocaleDateString('vi-VN') : 'Recently updated'}</span>
                                                </div>
                                                
                                                <h2 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-red-600 transition-colors">
                                                    <Link href={`/post/${post.slug || post.id}`}>
                                                        {post.title}
                                                    </Link>
                                                </h2>
                                                
                                                <p className="text-gray-500 text-sm line-clamp-3 mb-6 flex-1 leading-relaxed">
                                                    {post.description || "View article details..."}
                                                </p>

                                                <Link 
                                                    href={`/post/${post.slug || post.id}`} 
                                                    className="group/btn inline-flex items-center justify-between w-full px-5 py-3 border border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-black hover:text-white hover:border-black transition-all duration-300"
                                                >
                                                    <span>View details</span>
                                                    <i className="fa-solid fa-arrow-right transform group-hover/btn:translate-x-1 transition-transform"></i>
                                                </Link>
                                            </div>
                                        </article>
                                    ))}
                                </div>

                                {/* PHÂN TRANG */}
                                {totalPages > 1 && (
                                    <div className="mt-16 flex justify-center items-center gap-3">
                                        <button 
                                            onClick={() => handlePageChange(page - 1)}
                                            disabled={page === 1}
                                            className="w-11 h-11 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:border-black hover:bg-black hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-600 transition-all"
                                        >
                                            <i className="fa-solid fa-chevron-left"></i>
                                        </button>

                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                            <button
                                                key={p}
                                                onClick={() => handlePageChange(p)}
                                                className={`w-11 h-11 rounded-full font-bold text-sm transition-all shadow-sm ${
                                                    page === p 
                                                    ? 'bg-black text-white shadow-md scale-110' 
                                                    : 'bg-white border border-gray-200 text-gray-600 hover:border-black hover:text-black'
                                                }`}
                                            >
                                                {p}
                                            </button>
                                        ))}

                                        <button 
                                            onClick={() => handlePageChange(page + 1)}
                                            disabled={page === totalPages}
                                            className="w-11 h-11 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:border-black hover:bg-black hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-600 transition-all"
                                        >
                                            <i className="fa-solid fa-chevron-right"></i>
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            // EMPTY STATE
                            <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                                    <i className="fa-regular fa-folder-open text-4xl text-gray-300"></i>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-600">Article not found</h3>
                                <p className="text-gray-400 text-sm">There are no articles on this topic yet.</p>
                                <button onClick={() => handleTopicChange('all')} className="mt-4 text-sm font-bold underline decoration-2 underline-offset-4 hover:text-red-600 transition-colors">
                                    View all posts
                                </button>
                            </div>
                        )}
                    </main>
                </div>
            </div>
            
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        </div>
    );
}
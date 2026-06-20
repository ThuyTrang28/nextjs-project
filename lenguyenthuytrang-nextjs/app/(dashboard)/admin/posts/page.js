"use client";

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Head from 'next/head';
import AdminPostService from '@/services/AdminPostService'; 
import AdminTopicService from '@/services/AdminTopicService';

// ✅ CẬP NHẬT 1: Đường dẫn ảnh chính xác
const IMAGE_BASE_URL = "http://localhost/lenguyenthuytrang_cdtt/public/images/post"; 

// --- HÀM HỖ TRỢ ---
const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return !isNaN(date) ? date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) : dateString;
};

const getStatusLabel = (status) => (status === 1 || status === '1') ? 'Xuất bản' : 'Nháp';
const getStatusStyle = (status) => (status === 1 || status === '1') ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';

const truncateContent = (htmlContent, maxLength = 50) => {
    if (!htmlContent) return '';
    const plainText = htmlContent.replace(/<[^>]+>/g, '');
    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength) + '...';
};

// ... (Giữ nguyên phần DeleteConfirmationModal) ...
const DeleteConfirmationModal = ({ show, item, type, onConfirm, onCancel }) => {
    if (!show || !item) return null;
    const itemName = type === 'post' ? item.title : item.name;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm" onClick={onCancel}>
            <div className="bg-white rounded-xl shadow-2xl p-6 w-11/12 max-w-sm" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-red-600 mb-4 border-b pb-2">Xác nhận Xóa</h3>
                <p className="text-slate-700 mb-6">Xóa {type==='post'?'bài viết':'chủ đề'} "<strong>{itemName}</strong>"?</p>
                <div className="flex justify-end gap-3">
                    <button onClick={onCancel} className="py-2 px-4 bg-slate-200 rounded-lg hover:bg-slate-300">Hủy</button>
                    <button onClick={onConfirm} className="py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700">Xóa ngay</button>
                </div>
            </div>
            <Head><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" /></Head>
        </div>
    );
};

// --- TAB QUẢN LÝ BÀI VIẾT (POST) ---
const PostManagementTab = ({ posts, categories, refreshData }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [postToDelete, setPostToDelete] = useState(null);

    const openDeleteModal = (post) => { setPostToDelete(post); setShowDeleteModal(true); };
    const handleConfirmDelete = async () => {
        if (postToDelete) {
            try {
                await AdminPostService.delete(postToDelete.id);
                alert("Xóa thành công!");
                refreshData();
            } catch (error) { alert("Lỗi: " + error.message); } 
            finally { setShowDeleteModal(false); setPostToDelete(null); }
        }
    };

    const filteredPosts = useMemo(() => {
        let result = posts;
        if (selectedStatus !== 'All') result = result.filter(p => getStatusLabel(p.status) === selectedStatus);
        if (selectedCategory !== 'All') result = result.filter(p => p.topic_name === selectedCategory);
        if (searchTerm) result = result.filter(p => 
            p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
            (p.slug && p.slug.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        return result;
    }, [posts, searchTerm, selectedStatus, selectedCategory]);

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-700">Danh sách Bài viết</h2>
                <a href="/admin/posts/add" className="bg-red-600 text-white py-2 px-4 rounded-xl hover:bg-red-700 flex items-center gap-2 shadow-md">
                    <i className="fa-solid fa-plus"></i> Tạo Bài đăng
                </a>
            </div>

            <div className="mb-6 flex flex-col gap-4 sm:flex-row">
                <input type="text" placeholder="Tìm tiêu đề, slug..." className="p-3 border rounded-xl w-full sm:max-w-sm shadow-sm outline-none focus:ring-2 focus:ring-red-500" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                <select className="p-3 border rounded-xl bg-white shadow-sm outline-none" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
                    <option value="All">Tất cả Trạng thái</option>
                    <option value="Xuất bản">Xuất bản</option>
                    <option value="Nháp">Nháp</option>
                </select>
                <select className="p-3 border rounded-xl bg-white shadow-sm outline-none" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                    <option value="All">Tất cả Danh mục</option>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
            </div>

            <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase whitespace-nowrap">ID</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase whitespace-nowrap">Hình ảnh</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase whitespace-nowrap">Tiêu đề & Slug</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase whitespace-nowrap">Nội dung</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase whitespace-nowrap">Mô tả</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase whitespace-nowrap">Loại</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase whitespace-nowrap">Danh mục</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase whitespace-nowrap">Trạng thái</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase whitespace-nowrap">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {filteredPosts.length > 0 ? filteredPosts.map(post => (
                            <tr key={post.id} className="hover:bg-red-50 transition-colors">
                                <td className="px-4 py-4 text-xs font-medium text-slate-900">#{post.id}</td>
                                <td className="px-4 py-4">
                                    {post.image ? (
                                        <div className="w-24 h-auto bg-gray-100 rounded overflow-hidden border border-gray-200">
                                            <img 
                                                // ✅ CẬP NHẬT 2: Hiển thị full ảnh
                                                src={`${IMAGE_BASE_URL}/${post.image}`} 
                                                alt={post.title} 
                                                // w-full: rộng full khung cha, h-auto: cao tự động theo tỷ lệ
                                                // object-contain: Đảm bảo ảnh nằm trọn trong khung, không bị cắt
                                                className="w-full h-auto object-contain"
                                                onError={(e) => {e.target.onerror = null; e.target.src="https://placehold.co/60x40?text=No+Img"}}
                                            />
                                        </div>
                                    ) : <span className="text-xs bg-gray-200 px-2 py-1 rounded">No Img</span>}
                                </td>
                                
                                <td className="px-4 py-4 max-w-xs">
                                    <div className="text-sm font-semibold text-slate-800 line-clamp-2" title={post.title}>{post.title}</div>
                                    <div className="text-xs text-slate-500 mt-1 italic truncate" title={post.slug}>{post.slug}</div>
                                </td>

                                <td className="px-4 py-4 max-w-xs">
                                    <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100" title="Nội dung chi tiết">
                                        {truncateContent(post.content || post.detail, 60)}
                                    </div>
                                </td>

                                <td className="px-4 py-4 max-w-xs">
                                    <p className="text-xs text-slate-600 line-clamp-2" title={post.description}>
                                        {post.description || <span className="italic text-slate-400">---</span>}
                                    </p>
                                </td>

                                <td className="px-4 py-4 text-xs">
                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-bold uppercase">{post.post_type}</span>
                                </td>

                                <td className="px-4 py-4 text-xs text-slate-600">
                                    <span className="bg-slate-100 px-2 py-1 rounded font-medium">{post.topic_name || 'N/A'}</span>
                                </td>

                                <td className="px-4 py-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${getStatusStyle(post.status)}`}>{getStatusLabel(post.status)}</span>
                                </td>

                                <td className="px-4 py-4 text-xs font-medium whitespace-nowrap">
                                    <div className="flex gap-2">
                                        <a href={`/admin/posts/edit/${post.id}`} className="text-blue-600 hover:text-blue-800 p-1 border border-blue-200 rounded"><i className="fa-solid fa-pen-to-square"></i></a>
                                        <button onClick={() => openDeleteModal(post)} className="text-red-600 hover:text-red-800 p-1 border border-red-200 rounded"><i className="fa-solid fa-trash-can"></i></button>
                                    </div>
                                </td>
                            </tr>
                        )) : (<tr><td colSpan="10" className="text-center py-6 text-slate-500">Không có dữ liệu</td></tr>)}
                    </tbody>
                </table>
            </div>
            <DeleteConfirmationModal show={showDeleteModal} item={postToDelete} type="post" onConfirm={handleConfirmDelete} onCancel={() => setShowDeleteModal(false)} />
        </>
    );
};

// ... (Phần CategoryManagementTab và AdminPostsPage giữ nguyên như code bạn gửi) ...
const CategoryManagementTab = ({ categories, refreshData }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    const openDeleteModal = (cat) => { setCategoryToDelete(cat); setShowDeleteModal(true); };
    const handleConfirmDelete = async () => {
        if (categoryToDelete) {
            try { await AdminTopicService.delete(categoryToDelete.id); alert("Xóa thành công!"); refreshData(); }
            catch (error) { alert("Lỗi: " + error.message); }
            finally { setShowDeleteModal(false); setCategoryToDelete(null); }
        }
    };
    const filteredCategories = useMemo(() => {
        if (!searchTerm) return categories;
        return categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [categories, searchTerm]);

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-700">Danh sách Chủ đề</h2>
                <a href="/admin/posts/new" className="bg-green-600 text-white py-2 px-4 rounded-xl hover:bg-green-700 flex items-center gap-2 shadow-md">
                    <i className="fa-solid fa-plus"></i> Thêm Chủ đề
                </a>
            </div>
            <input type="text" placeholder="Tìm chủ đề..." className="p-3 border rounded-xl w-full max-w-sm mb-6 shadow-sm outline-none focus:ring-2 focus:ring-green-500" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tên</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Slug</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Trạng thái</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Ngày tạo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {filteredCategories.length > 0 ? filteredCategories.map(cat => (
                            <tr key={cat.id} className="hover:bg-green-50 transition-colors">
                                <td className="px-6 py-4 text-sm font-medium text-slate-900">#{cat.id}</td>
                                <td className="px-6 py-4 text-sm font-semibold text-slate-800">{cat.name}</td>
                                <td className="px-6 py-4 text-sm text-slate-600">{cat.slug}</td>
                                <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(cat.status)}`}>{getStatusLabel(cat.status)}</span></td>
                                <td className="px-6 py-4 text-sm text-slate-600">{formatDate(cat.created_at)}</td>
                                <td className="px-6 py-4 text-sm font-medium">
                                    <div className="flex gap-2">
                                        <a href={`/admin/posts/new/${cat.id}`} className="text-blue-600 p-1 border border-blue-200 rounded hover:bg-blue-50"><i className="fa-solid fa-pen-to-square"></i></a>
                                        <button onClick={() => openDeleteModal(cat)} className="text-red-600 p-1 border border-red-200 rounded hover:bg-red-50"><i className="fa-solid fa-trash-can"></i></button>
                                    </div>
                                </td>
                            </tr>
                        )) : (<tr><td colSpan="6" className="text-center py-6 text-slate-500">Không có dữ liệu</td></tr>)}
                    </tbody>
                </table>
            </div>
            <DeleteConfirmationModal show={showDeleteModal} item={categoryToDelete} type="category" onConfirm={handleConfirmDelete} onCancel={() => setShowDeleteModal(false)} />
        </>
    );
};

export default function AdminPostsPage() {
    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeTab, setActiveTab] = useState('posts');
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [postsRes, categoriesRes] = await Promise.all([
                AdminPostService.getAll({ limit: 100 }), 
                AdminTopicService.getAll({ limit: 100 }) 
            ]);
            if(postsRes.data.status) setPosts(postsRes.data.data);
            if(categoriesRes.data.status) setCategories(categoriesRes.data.data);
        } catch (error) { console.error("Lỗi:", error); } 
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const tabClass = (tab) => `px-4 py-2 font-semibold text-sm rounded-t-lg transition-colors border-b-2 ${activeTab === tab ? 'bg-white border-red-600 text-red-600' : 'text-slate-500 hover:bg-slate-50 border-transparent'}`;

    return (
        <div className="p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-slate-800 mb-6 flex items-center"><i className="fa-solid fa-layer-group mr-3 text-red-600"></i> Quản lý Bài viết & Chủ đề</h1>
                <div className="border-b border-slate-200 mb-6 flex space-x-4">
                    <button onClick={() => setActiveTab('posts')} className={tabClass('posts')}><i className="fa-solid fa-newspaper mr-1"></i> Bài viết</button>
                    <button onClick={() => setActiveTab('categories')} className={tabClass('categories')}><i className="fa-solid fa-tags mr-1"></i> Chủ đề</button>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 min-h-[400px]">
                    {loading ? <div className="flex justify-center items-center h-40 text-slate-500"><i className="fa-solid fa-spinner fa-spin mr-2"></i> Đang tải dữ liệu...</div> 
                    : activeTab === 'posts' ? <PostManagementTab posts={posts} categories={categories} refreshData={fetchData} /> : <CategoryManagementTab categories={categories} refreshData={fetchData} />}
                </div>
            </div>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        </div>
    );
}
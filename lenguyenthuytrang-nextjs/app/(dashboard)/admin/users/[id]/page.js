"use client";

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import AdminUserService from '@/services/AdminUserService';

// --- 1. CẤU HÌNH DOMAIN (Giống bên ProfilePage) ---
const BACKEND_DOMAIN = 'http://localhost:8000';

// --- 2. HÀM XỬ LÝ ẢNH (Đã sửa theo ProfilePage) ---
const getAvatarUrl = (avatar) => {
    // Nếu không có avatar -> Trả về ảnh placeholder
    if (!avatar) return "https://via.placeholder.com/150?text=No+Image";
    
    // Nếu là link online (Google/Facebook) -> Trả về nguyên gốc
    if (avatar.startsWith('http')) return avatar;
    
    // Xử lý đường dẫn nội bộ: Thêm /storage/ vào trước
    // Lưu ý: Đảm bảo bạn đã chạy lệnh "php artisan storage:link" trong Laravel
    const cleanPath = avatar.startsWith('/') ? avatar.substring(1) : avatar;
    return `${BACKEND_DOMAIN}/storage/${cleanPath}`; 
};

// --- HÀM FORMAT NGÀY ---
const formatDate = (dateString) => {
    if (!dateString) return 'Chưa cập nhật';
    const date = new Date(dateString);
    return !isNaN(date) ? date.toLocaleString('vi-VN') : dateString;
};

export default function AdminUserDetailPage({ params }) {
    const { id } = use(params);

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchUserDetail = async () => {
            if (!id) return;
            try {
                const response = await AdminUserService.getById(id);
                if (response.data.status) {
                    setUser(response.data.data);
                } else {
                    setError("Không tìm thấy thông tin người dùng.");
                }
            } catch (err) {
                console.error("Lỗi tải chi tiết user:", err);
                setError("Có lỗi xảy ra khi kết nối đến server.");
            } finally {
                setLoading(false);
            }
        };

        fetchUserDetail();
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-slate-50">
                <div className="text-slate-500 flex flex-col items-center">
                    <i className="fa-solid fa-circle-notch fa-spin text-3xl mb-3 text-blue-600"></i>
                    <span>Đang tải thông tin...</span>
                </div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="p-8 text-center">
                <div className="text-red-500 text-xl mb-4"><i className="fa-solid fa-triangle-exclamation"></i> {error || "User không tồn tại"}</div>
                <Link href="/admin/users" className="text-blue-600 hover:underline">Quay lại danh sách</Link>
            </div>
        );
    }

    return (
        <main className="p-4 md:p-8 bg-slate-50 min-h-screen">
            <div className="max-w-5xl mx-auto">
                
                {/* --- HEADER --- */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                            <i className="fa-solid fa-id-card text-blue-600"></i>
                            Hồ Sơ Thành Viên
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">Xem chi tiết thông tin tài khoản #{user.id}</p>
                    </div>
                    <Link href="/admin/users">
                        <button className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-colors shadow-sm flex items-center gap-2">
                            <i className="fa-solid fa-arrow-left"></i> Quay lại
                        </button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* --- CỘT TRÁI: TỔNG QUAN --- */}
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center text-center h-full">
                            <div className="relative w-32 h-32 mb-4">
                                <img 
                                    src={getAvatarUrl(user.avatar)} 
                                    alt={user.name} 
                                    className="w-full h-full object-cover rounded-full border-4 border-slate-100 shadow-md"
                                    onError={(e) => {
                                        e.target.onerror = null; 
                                        e.target.src = "https://via.placeholder.com/150?text=User";
                                    }}
                                />
                                <div className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-white ${user.status === 1 ? 'bg-green-500' : 'bg-red-500'}`} title="Trạng thái online"></div>
                            </div>
                            
                            <h2 className="text-xl font-bold text-slate-800 mb-1">{user.name}</h2>
                            <p className="text-slate-500 text-sm mb-4">@{user.username || 'unknown'}</p>

                            <div className="flex gap-2 mb-6 flex-wrap justify-center">
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold uppercase rounded-full">
                                    {user.roles}
                                </span>
                                <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full ${user.status === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {user.status === 1 ? 'Hoạt động' : 'Tạm khóa'}
                                </span>
                            </div>

                            <div className="w-full border-t border-slate-100 pt-4 mt-auto">
                                <div className="text-xs text-slate-400 mb-1">Ngày tham gia</div>
                                <div className="text-sm font-medium text-slate-700">{formatDate(user.created_at)}</div>
                            </div>
                        </div>
                    </div>

                    {/* --- CỘT PHẢI: CHI TIẾT --- */}
                    <div className="md:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-full">
                            <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2">
                                <i className="fa-solid fa-circle-info text-blue-500"></i> Thông tin chi tiết
                            </h3>
                            
                            <div className="space-y-4">
                                {/* Email */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-2 border-b border-slate-50 items-center">
                                    <div className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                        <i className="fa-solid fa-envelope w-5 text-center"></i> Email
                                    </div>
                                    <div className="sm:col-span-2 text-slate-800 font-medium break-all">
                                        {user.email}
                                    </div>
                                </div>

                                {/* Số điện thoại */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-2 border-b border-slate-50 items-center">
                                    <div className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                        <i className="fa-solid fa-phone w-5 text-center"></i> Số điện thoại
                                    </div>
                                    <div className="sm:col-span-2 text-slate-800 font-medium">
                                        {user.phone || <span className="text-slate-400 italic">Chưa cập nhật</span>}
                                    </div>
                                </div>

                                {/* Địa chỉ */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-2 border-b border-slate-50 items-center">
                                    <div className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                        <i className="fa-solid fa-location-dot w-5 text-center"></i> Địa chỉ
                                    </div>
                                    <div className="sm:col-span-2 text-slate-800">
                                        {user.address || <span className="text-slate-400 italic">Chưa cập nhật</span>}
                                    </div>
                                </div>

                                {/* Giới tính */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-2 border-b border-slate-50 items-center">
                                    <div className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                        <i className="fa-solid fa-venus-mars w-5 text-center"></i> Giới tính
                                    </div>
                                    <div className="sm:col-span-2 text-slate-800">
                                        {user.gender || <span className="text-slate-400 italic">Chưa cập nhật</span>}
                                    </div>
                                </div>

                                {/* Cập nhật lần cuối */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-2 items-center">
                                    <div className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                        <i className="fa-solid fa-clock-rotate-left w-5 text-center"></i> Cập nhật gần nhất
                                    </div>
                                    <div className="sm:col-span-2 text-slate-800">
                                        {formatDate(user.updated_at)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        </main>
    );
}
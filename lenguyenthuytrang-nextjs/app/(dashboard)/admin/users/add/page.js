"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; 
// Import Service để gọi API
import AdminUserService from '@/services/AdminUserService'; 

export default function AddUserPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // State form khớp với các trường required trong UserController
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',      // Mới thêm (Required ở Backend)
        username: '',   // Mới thêm (Required ở Backend)
        password: '',
        roles: 'customer', // Khớp với validation: admin, customer
        status: '1',    // 1: Active, 0: Suspended (Backend lưu số)
        avatar: '',     // Tùy chọn
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: value 
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Chuẩn bị dữ liệu gửi đi
            // Lưu ý: Status cần parse sang số nguyên nếu backend yêu cầu chặt chẽ, 
            // nhưng ở đây gửi string '1' backend Laravel vẫn thường tự cast được.
            // Tuy nhiên, để an toàn ta convert luôn.
            const payload = {
                ...formData,
                status: parseInt(formData.status), 
            };

            console.log('Sending payload:', payload); // Debug xem dữ liệu gửi đi

            // Gọi API
            const response = await AdminUserService.create(payload);

            if (response.data.status) {
                alert('Thêm người dùng thành công!');
                router.push('/admin/users'); // Chuyển hướng về danh sách
            } else {
                setError(response.data.message || 'Có lỗi xảy ra.');
            }

        } catch (err) {
            console.error("Lỗi submit:", err);
            // Lấy lỗi chi tiết từ Laravel trả về (nếu có validation error)
            const errorMsg = err.response?.data?.message || err.message || 'Lỗi kết nối server';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                
                {/* --- HEADER --- */}
                <div className="flex justify-between items-center mb-6 border-b border-slate-300 pb-4">
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <i className="fa-solid fa-user-plus text-blue-600"></i>
                        Thêm Người Dùng Mới
                    </h1>
                    <Link href="/admin/users" className="text-slate-600 hover:text-slate-900 flex items-center gap-2 transition-colors font-medium">
                        <i className="fa-solid fa-arrow-left"></i>
                        Quay lại danh sách
                    </Link>
                </div>

                {/* --- ERROR ALERT --- */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <strong className="font-bold">Lỗi: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-slate-200">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Cột Trái */}
                        <div className="space-y-6">
                            {/* Tên Người dùng */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1">Họ và Tên <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Nguyễn Văn A"
                                    className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                                />
                            </div>

                            {/* Username (Mới thêm) */}
                            <div>
                                <label htmlFor="username" className="block text-sm font-semibold text-slate-700 mb-1">Tên đăng nhập (Username) <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                    placeholder="nguyenvana123"
                                    className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1">Email <span className="text-red-500">*</span></label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="user@example.com"
                                    className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                                />
                            </div>

                             {/* Mật khẩu */}
                             <div>
                                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1">Mật khẩu <span className="text-red-500">*</span></label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                    placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                                    className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Cột Phải */}
                        <div className="space-y-6">
                            {/* Số điện thoại (Mới thêm) */}
                            <div>
                                <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-1">Số điện thoại <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    placeholder="0987654321"
                                    className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                                />
                            </div>

                            {/* Vai trò */}
                            <div>
                                <label htmlFor="roles" className="block text-sm font-semibold text-slate-700 mb-1">Vai trò <span className="text-red-500">*</span></label>
                                <select
                                    id="roles"
                                    name="roles"
                                    value={formData.roles}
                                    onChange={handleChange}
                                    className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                                >
                                    {/* Value phải khớp với validation 'in:admin,customer' trong Controller */}
                                    <option value="customer">Customer (Khách hàng)</option>
                                    <option value="admin">Admin (Quản trị viên)</option>
                                </select>
                            </div>

                            {/* Trạng thái */}
                            <div>
                                <label htmlFor="status" className="block text-sm font-semibold text-slate-700 mb-1">Trạng thái</label>
                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                                >
                                    {/* Value là 1 và 0 để khớp với DB */}
                                    <option value="1">Active (Hoạt động)</option>
                                    <option value="0">Suspended (Tạm ngưng)</option>
                                </select>
                            </div>
                            
                            {/* Avatar URL (Tạm thời là input text, sau này có thể đổi thành upload file) */}
                            <div>
                                <label htmlFor="avatar" className="block text-sm font-semibold text-slate-700 mb-1">Avatar (Tên file)</label>
                                <input
                                    type="text"
                                    id="avatar"
                                    name="avatar"
                                    value={formData.avatar}
                                    onChange={handleChange}
                                    placeholder="default.jpg"
                                    className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* --- BUTTONS --- */}
                    <div className="flex justify-end pt-6 border-t mt-8 gap-4">
                         <Link href="/admin/users">
                            <button type="button" className="px-6 py-3 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors">
                                Hủy bỏ
                            </button>
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`bg-blue-600 text-white px-8 py-3 text-lg font-semibold rounded-lg shadow-lg flex items-center gap-2 transition-all
                                ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700 hover:shadow-xl'}`}
                        >
                            {loading ? (
                                <>
                                    <i className="fa-solid fa-spinner fa-spin"></i> Đang xử lý...
                                </>
                            ) : (
                                <>
                                    <i className="fa-solid fa-save"></i> Lưu Người Dùng
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
            {/* Link Font Awesome */}
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        </div>
    );
}
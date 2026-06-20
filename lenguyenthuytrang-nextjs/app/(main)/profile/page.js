"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ClientUserService from '@/services/ClientUserService';

// Cấu hình domain backend để hiển thị ảnh
const BACKEND_DOMAIN = 'http://localhost:8000';

export default function ProfilePage() {
    const router = useRouter();
    
    // State quản lý dữ liệu
    const [user, setUser] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        avatar: null
    });

    // State quản lý UI
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [avatarFile, setAvatarFile] = useState(null); // File ảnh mới để upload
    const [avatarPreview, setAvatarPreview] = useState(null); // Link ảnh để xem trước

    // --- 1. FETCH DATA ---
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await ClientUserService.getProfile();
                if (res.data.status) {
                    const userData = res.data.data;
                    setUser({
                        ...userData,
                        password: '', // Không hiển thị mật khẩu cũ
                        password_confirmation: ''
                    });
                    
                    // Xử lý link ảnh từ backend
                    if (userData.avatar) {
                        const avatarUrl = userData.avatar.startsWith('http') 
                            ? userData.avatar 
                            : `${BACKEND_DOMAIN}/storage/${userData.avatar}`;
                        setAvatarPreview(avatarUrl);
                    }
                }
            } catch (error) {
                console.error("Lỗi tải hồ sơ:", error);
                // Nếu chưa đăng nhập (401), đẩy về login
                if (error.response && error.response.status === 401) {
                    router.push('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [router]);

    // --- 2. XỬ LÝ INPUT ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser(prev => ({ ...prev, [name]: value }));
    };

    // --- 3. XỬ LÝ CHỌN ẢNH ---
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            // Tạo link ảo để xem trước ảnh ngay lập tức
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    // --- 4. XỬ LÝ SUBMIT (QUAN TRỌNG) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Bước 1: Nếu có chọn ảnh mới -> Upload ảnh trước
            if (avatarFile) {
                const formData = new FormData();
                formData.append('avatar', avatarFile);
                
                await ClientUserService.uploadAvatar(formData);
                // Không cần alert ở đây, đợi xong hết mới báo
            }

            // Bước 2: Cập nhật thông tin văn bản (Tên, SĐT, Pass)
            const profileData = {
                name: user.name,
                phone: user.phone,
            };

            // Chỉ gửi password nếu người dùng nhập vào
            if (user.password) {
                profileData.password = user.password;
                profileData.password_confirmation = user.password_confirmation;
            }

            const res = await ClientUserService.updateProfile(profileData);

            if (res.data.status) {
                alert("Cập nhật hồ sơ thành công!");
                // Refresh trang để lấy dữ liệu mới nhất
                window.location.reload(); 
            }

        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || "Có lỗi xảy ra.";
            // Hiển thị lỗi validation từ Laravel (nếu có)
            if (error.response?.data?.errors) {
                const firstError = Object.values(error.response.data.errors)[0][0];
                alert(firstError);
            } else {
                alert(msg);
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="min-h-screen flex justify-center items-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-slate-900 px-6 py-4">
                    <h1 className="text-xl font-bold text-white">Personal profile</h1>
                </div>

                <form onSubmit={handleSubmit} className="p-8">
                    {/* --- AVATAR SECTION --- */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-200">
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <i className="fa-solid fa-user text-4xl"></i>
                                    </div>
                                )}
                            </div>
                            
                            {/* Nút upload ẩn đè lên ảnh */}
                            <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition shadow-sm">
                                <i className="fa-solid fa-camera"></i>
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*" 
                                    onChange={handleAvatarChange} 
                                />
                            </label>
                        </div>
                        <p className="text-sm text-gray-500 mt-3">Tap the camera icon to change</p>
                    </div>

                    {/* --- FORM INFO --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Email (Read only) */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email (Cannot be changed)</label>
                            <input 
                                type="email" 
                                value={user.email} 
                                disabled 
                                className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed" 
                            />
                        </div>

                        {/* Họ tên */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input 
                                type="text" 
                                name="name"
                                value={user.name} 
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" 
                            />
                        </div>

                        {/* Số điện thoại */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <input 
                                type="text" 
                                name="phone"
                                value={user.phone} 
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" 
                            />
                        </div>

                    </div>

                    {/* --- ACTIONS --- */}
                    <div className="mt-8 flex justify-end gap-4">
                        <button 
                            type="button"
                            onClick={() => router.back()}
                            className="px-6 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={saving}
                            className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:opacity-70 flex items-center gap-2"
                        >
                            {saving ? (
                                <><i className="fa-solid fa-spinner fa-spin"></i> Saving...</>
                            ) : (
                                <><i className="fa-solid fa-floppy-disk"></i>Save changes</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
            {/* Thêm FontAwesome nếu chưa có trong Layout */}
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        </div>
    );
}
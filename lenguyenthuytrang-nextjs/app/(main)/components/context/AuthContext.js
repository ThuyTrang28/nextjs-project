"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// Đảm bảo bạn đã có file service này tại services/ClientUserService.js
import ClientUserService from '@/services/ClientUserService'; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Hàm gọi API lấy thông tin user hiện tại
    // Hàm này sẽ được gọi khi:
    // 1. App mới tải (F5)
    // 2. Sau khi đăng nhập thành công
    const fetchUser = async () => {
        try {
            const token = localStorage.getItem('token');
            // Nếu không có token thì dừng, không gọi API
            if (!token) {
                setLoading(false);
                return;
            }

            // Gọi API lấy thông tin Profile
            const response = await ClientUserService.getProfile();
            
            if (response.data && response.data.status) {
                setUser(response.data.data);
            }
        } catch (error) {
            console.error("Lỗi xác thực (Token hết hạn hoặc không hợp lệ):", error);
            // Nếu lỗi (ví dụ token hết hạn), xóa token và user
            setUser(null);
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    };

    // Chạy 1 lần khi ứng dụng khởi động để kiểm tra đăng nhập
    useEffect(() => {
        fetchUser();
    }, []);

    // Hàm đăng xuất
    const logout = () => {
        localStorage.removeItem('token'); // Xóa token
        setUser(null); // Xóa state user
        router.push('/auth/sign-in'); // Chuyển hướng về trang đăng nhập
    };

    return (
        <AuthContext.Provider value={{ user, setUser, loading, logout, fetchUser }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook custom để sử dụng AuthContext nhanh gọn ở các component khác
export const useAuth = () => useContext(AuthContext);
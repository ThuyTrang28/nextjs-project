"use client";
import React, { useState } from 'react';
import Link from 'next/link';

export default function AdminSignUpPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        // --- LOGIC XỬ LÝ ĐĂNG KÝ MOCK ---
        console.log('Đang đăng ký với:', { name, email, password });
        
        // Giả lập API call
        setTimeout(() => {
            setIsLoading(false);
            alert('Đăng ký thành công (Mock)! Vui lòng đăng nhập.');
            window.location.href = '/admin/login'; 
        }, 2000);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 p-4">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-2xl border border-slate-200/50">
                
                {/* Header */}
                <div className="text-center">
                    <div className="w-12 h-12 mx-auto bg-amber-500 rounded-lg flex items-center justify-center font-black text-slate-900 text-2xl mb-3">
                        A
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-900">
                        Đăng ký Tài khoản
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Tạo một tài khoản Quản trị viên mới
                    </p>
                </div>

                {/* Form */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {/* Name Input */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Tên người dùng
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 transition-colors"
                            placeholder="Tên của bạn"
                            disabled={isLoading}
                        />
                    </div>
                    
                    {/* Email Input */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Địa chỉ Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 transition-colors"
                            placeholder="vd: admin@example.com"
                            disabled={isLoading}
                        />
                    </div>

                    {/* Password Input */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Mật khẩu
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 transition-colors"
                            placeholder="Tối thiểu 6 ký tự"
                            disabled={isLoading}
                        />
                    </div>

                    {/* Action Button */}
                    <button
                        type="submit"
                        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-slate-900 ${
                            isLoading ? 'bg-amber-400 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600'
                        } transition-colors duration-200`}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                        ) : (
                            <i className="fa-solid fa-user-plus mr-2"></i>
                        )}
                        {isLoading ? 'Đang tạo tài khoản...' : 'Đăng Ký'}
                    </button>
                </form>

                {/* Footer Links */}
                <div className="text-center text-sm">
                    <p className="text-gray-600">
                        Đã có tài khoản?{' '}
                        <Link href="/admin/login" className="font-medium text-amber-600 hover:text-amber-500 transition-colors">
                            Đăng nhập
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
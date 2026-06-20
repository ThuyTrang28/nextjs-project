"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ClientUserService from '@/services/ClientUserService'; 

const SignInPage = () => {
    const router = useRouter();
    
    // 2. State management (Updated to use username)
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false); // Added Remember Me state
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // 4. Handle Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Call API with username instead of email
            const response = await ClientUserService.login({ username, password, remember });

            if (response.data.status) {
                // A. Save Token
                localStorage.setItem('token', response.data.token);
                
                // B. Save User Info
                localStorage.setItem('user', JSON.stringify(response.data.data));

                // C. Dispatch Event for Header update
                window.dispatchEvent(new Event('auth-change'));
                
                alert("Đăng nhập thành công!");
                
                // D. Redirect
                router.push('/'); 
            } else {
                setError(response.data.message || "Đăng nhập thất bại.");
            }

        } catch (err) {
            console.error("Login Error:", err);
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError("Tên đăng nhập hoặc mật khẩu không đúng. Vui lòng thử lại.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto py-20 px-4">
            <h1 className="text-3xl font-bold text-center mb-6">Log in to Account</h1>
            
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg space-y-4 border border-gray-100">
                
                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded text-sm text-center border border-red-200 flex items-center justify-center gap-2">
                        <i className="fa-solid fa-triangle-exclamation"></i>
                        {error}
                    </div>
                )}

                {/* Username Input [UPDATED] */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input 
                        type="text" 
                        required 
                        className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-black transition-colors"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                
                {/* Password Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input 
                        type="password" 
                        placeholder="••••••" 
                        required 
                        className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-black transition-colors"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                {/* Remember Me & Forgot Password Row */}
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                        <input
                            id="remember-me"
                            name="remember"
                            type="checkbox"
                            checked={remember}
                            onChange={(e) => setRemember(e.target.checked)}
                            className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-gray-900">
                            Remember password
                        </label>
                    </div>

                    <Link href="/auth/forgot-password" className="text-blue-600 hover:underline">
                        Forgot password?
                    </Link>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-3 bg-black text-white font-semibold rounded hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                    {loading ? (
                        <>
                            <i className="fa-solid fa-spinner fa-spin"></i> Processing...
                        </>
                    ) : (
                        "Log in"
                    )}
                </button>
            </form>

            <p className="text-center mt-4 text-gray-600">
                No account yet?{' '}
                <Link href="/auth/sign-up" className="text-red-600 font-semibold hover:underline">
                    Sign up now
                </Link>
            </p>
            
            {/* FontAwesome Link if needed locally */}
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        </div>
    );
};

export default SignInPage;
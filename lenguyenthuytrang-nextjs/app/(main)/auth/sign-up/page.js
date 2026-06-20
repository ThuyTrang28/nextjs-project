"use client"; 

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ClientUserService from '@/services/ClientUserService'; 

const SignUpPage = () => {
    const router = useRouter();

    // 1. Initialize State
    const [formData, setFormData] = useState({
        name: '',
        username: '', // Added Username
        email: '',
        phone: "",
        password: '',
        password_confirmation: '', // Added Confirm Password
        remember: false // Added Remember Me
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // 2. Handle Input Change
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // 3. Handle Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Basic Client-side Validation
        if (formData.password !== formData.password_confirmation) {
            setError("The confirmation password does not match.");
            setLoading(false);
            return;
        }

        try {
            // Call API
            const response = await ClientUserService.register(formData);

            if (response.data.status) {
                // If "Remember Password" is checked, browsers usually handle this automatically upon successful form submission.
                // If you implemented logic to auto-login after register, you would store tokens here based on formData.remember.
                
                alert("Đăng ký thành công! Vui lòng đăng nhập.");
                router.push('/auth/sign-in'); 
            }
        } catch (err) {
            const message = err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto py-20 px-4">
            <h1 className="text-3xl font-bold text-center mb-6">Create New Account</h1>
            
            {/* Error Message */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm text-center">
                    <i className="fa-solid fa-triangle-exclamation mr-2"></i>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg space-y-4">
                
                {/* Full Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
                    <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required 
                        className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-black transition-colors"
                    />
                </div>

                {/* Username [NEW] */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input 
                        type="text" 
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required 
                        className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-black transition-colors"
                    />
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required 
                        className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-black transition-colors"
                    />
                </div>

                {/* Phone */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input 
                        type="text" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required 
                        className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-black transition-colors"
                    />
                </div>

                {/* Password */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input 
                        type="password" 
                        name="password"
                        placeholder="At least 6 characters" 
                        value={formData.password}
                        onChange={handleChange}
                        required 
                        minLength={6}
                        className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-black transition-colors"
                    />
                </div>

                {/* Confirm Password [NEW] */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
                    <input 
                        type="password" 
                        name="password_confirmation"
                        placeholder="Re-enter password" 
                        value={formData.password_confirmation}
                        onChange={handleChange}
                        required 
                        className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-black transition-colors"
                    />
                </div>

                {/* Remember Me Checkbox [NEW] */}
                <div className="flex items-center">
                    <input
                        id="remember-me"
                        name="remember"
                        type="checkbox"
                        checked={formData.remember}
                        onChange={handleChange}
                        className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                        Remember password
                    </label>
                </div>

                {/* Submit Button */}
                <button 
                    type="submit" 
                    disabled={loading}
                    className={`w-full py-3 font-semibold rounded transition-all duration-200 
                        ${loading ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-black text-white hover:bg-gray-800 shadow-md'}`}
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <i className="fa-solid fa-spinner fa-spin"></i> Processing...
                        </span>
                    ) : (
                        "Register"
                    )}
                </button>
            </form>

            <p className="text-center mt-4 text-gray-600">
                Already have an account?{' '}
                <Link href="/auth/sign-in" className="text-black font-semibold hover:underline">
                    Log in
                </Link>
            </p>

            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        </div>
    );
};

export default SignUpPage;
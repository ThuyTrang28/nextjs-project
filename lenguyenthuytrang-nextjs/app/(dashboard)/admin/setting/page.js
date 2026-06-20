"use client";

import React, { useState, useEffect } from 'react';
import AdminConfigService from '@/services/AdminConfigService';

export default function SettingsPage() {
    const [formData, setFormData] = useState({
        site_name: '',
        email: '',
        phone: '',
        address: '',
        hotline: '',
        facebook: '',
        status: 1
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // 1. Tải cấu hình hiện tại khi vào trang
    useEffect(() => {
        const loadConfig = async () => {
            try {
                const res = await AdminConfigService.get();
                if (res.data.status && res.data.data) {
                    setFormData(res.data.data);
                }
            } catch (error) {
                console.error("Chưa có cấu hình ban đầu.");
            } finally {
                setIsLoading(false);
            }
        };
        loadConfig();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await AdminConfigService.update(formData);
            if (res.data.status) {
                alert("Cập nhật cấu hình hệ thống thành công!");
            }
        } catch (error) {
            alert("Lỗi khi lưu cấu hình: " + (error.response?.data?.message || "Lỗi hệ thống"));
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center">Đang tải cấu hình...</div>;

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <i className="fa-solid fa-gears text-blue-600"></i>
                    Cấu hình hệ thống Sephora
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Tên Website */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Tên Website</label>
                            <input type="text" name="site_name" value={formData.site_name} onChange={handleChange} required className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-100" />
                        </div>

                        {/* Hotline */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Hotline</label>
                            <input type="text" name="hotline" value={formData.hotline} onChange={handleChange} required className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-100" />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Email liên hệ</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-3 border rounded-xl outline-none" />
                        </div>

                        {/* Điện thoại */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Số điện thoại</label>
                            <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-3 border rounded-xl outline-none" />
                        </div>

                        {/* Địa chỉ */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2">Địa chỉ trụ sở</label>
                            <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full p-3 border rounded-xl outline-none" />
                        </div>
                    </div>

                    <button type="submit" disabled={isSaving} className="w-full py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-all disabled:bg-gray-400">
                        {isSaving ? "Đang lưu cấu hình..." : "Lưu thiết lập"}
                    </button>
                </form>
            </div>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        </div>
    );
}
"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';

// Giả lập dữ liệu chi tiết liên hệ (dùng để test component mới)
const mockContactDetail = { 
    id: 101, 
    name: 'Trần Văn Khách', 
    email: 'khach@contact.com', 
    subject: 'Vấn đề đơn hàng #12345', 
    message: 'Tôi chưa nhận được đơn hàng...\nXin hãy kiểm tra gấp tình trạng vận chuyển của đơn hàng này.', 
    date: '2025-11-20', 
    status: 'Chưa trả lời',
    phone: '090-123-4567',
    internalNotes: 'Khách hàng này đã gửi 2 email trong tuần, cần ưu tiên xử lý. Đã kiểm tra trạng thái đơn hàng.', 
};

// Lấy style cho trạng thái (Copy từ component chính)
const getStatusStyle = (status) => {
    switch (status) {
        case 'Đã trả lời':
            return 'bg-green-100 text-green-800 border border-green-200';
        case 'Chưa trả lời':
            return 'bg-red-100 text-red-800 border border-red-200';
        default:
            return 'bg-slate-100 text-slate-600 border border-slate-200';
    }
};

// Component tiện ích cho các trường thông tin
const DetailField = ({ label, value, icon, className = '' }) => (
    <div className={`flex items-start ${className}`}>
        <i className={`fa-solid ${icon} mr-3 mt-1 text-purple-500 text-lg`}></i>
        <div>
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="text-base text-slate-900 font-semibold wrap-break-word">{value}</p>
        </div>
    </div>
);

// Component Form Chi tiết Liên hệ
export default function ContactDetailPage({ contactId = 101 }) {
    const [contact, setContact] = useState(mockContactDetail);
    const [currentNotes, setCurrentNotes] = useState(mockContactDetail.internalNotes);
    const [isSaving, setIsSaving] = useState(false);
    
    // Kiểm tra xem ghi chú có thay đổi không
    const notesChanged = currentNotes !== contact.internalNotes;

    if (!contact) {
        return <div className="p-8 text-center text-xl text-slate-600">Đang tải hoặc không tìm thấy liên hệ...</div>;
    }

    // Giả lập lưu ghi chú nội bộ
    const handleSaveNotes = async () => {
        setIsSaving(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500)); 
            
            setContact(prev => ({ ...prev, internalNotes: currentNotes }));
            // Thay đổi alert thành một thông báo đẹp hơn trong thực tế
            console.log('Lưu ghi chú nội bộ thành công!');
            alert('Lưu ghi chú nội bộ thành công!');

        } catch (error) {
            console.error('Lỗi khi lưu ghi chú:', error);
            alert('Đã xảy ra lỗi khi lưu ghi chú.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-2xl border border-slate-200">

                {/* HEADER VÀ THÔNG TIN CHUNG */}
                <div className="mb-10 border-b pb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
                    <h1 className="text-4xl font-extrabold text-slate-800 flex items-center mb-3 md:mb-0">
                        <i className="fa-solid fa-file-invoice mr-4 text-purple-600"></i>
                        Liên hệ Khách hàng <span className="text-purple-600 ml-2">#{contact.id}</span>
                    </h1>
                    <Link href="/admin/contact" passHref>
                            <button className="text-slate-600 hover:text-amber-700 transition-colors flex items-center gap-1">
                                <i className="fa-solid fa-arrow-left"></i>
                                Quay lại Danh sách
                            </button>
                        </Link>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    
                    {/* CỘT 1: THÔNG TIN KHÁCH HÀNG & METADATA */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-purple-50 p-6 rounded-xl border border-purple-200 shadow-lg">
                            <h2 className="text-xl font-bold text-purple-700 mb-5 flex items-center">
                                <i className="fa-solid fa-user-tag mr-3"></i> Thông tin Người gửi
                            </h2>
                            <div className="space-y-4">
                                <DetailField label="Tên Khách hàng" value={contact.name} icon="fa-user" />
                                <DetailField 
                                    label="Email" 
                                    value={contact.email} 
                                    icon="fa-envelope"
                                    className="hover:text-purple-700 cursor-pointer"
                                />
                                <DetailField label="Điện thoại" value={contact.phone || 'N/A'} icon="fa-phone" />
                            </div>
                        </div>

                        {/* Metadata nhỏ */}
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-md">
                             <h2 className="text-xl font-bold text-slate-700 mb-5 flex items-center">
                                <i className="fa-solid fa-calendar-alt mr-3 text-purple-500"></i> Metadata
                            </h2>
                            <DetailField label="Ngày gửi" value={contact.date} icon="fa-calendar-day" className="mb-4" />
                            <DetailField label="ID Giao dịch" value={contact.id} icon="fa-fingerprint" />
                        </div>
                    </div>

                    {/* CỘT 2: NỘI DUNG LIÊN HỆ & GHI CHÚ NỘI BỘ */}
                    <div className="lg:col-span-2">
                        
                        {/* Khu vực Nội dung Thư */}
                        <div className="mb-8 p-6 rounded-xl border border-slate-300 bg-slate-50 shadow-inner">
                            <h2 className="text-2xl font-bold text-slate-700 mb-4 flex items-center">
                                <i className="fa-solid fa-comment-dots mr-3 text-purple-500"></i> Nội dung Thư
                            </h2>
                            
                            {/* Chủ đề */}
                            <div className="mb-4 p-3 rounded-lg bg-white border border-purple-100 shadow-sm">
                                <strong className="block text-xs uppercase text-purple-600 mb-1">Chủ đề</strong>
                                <p className="text-xl font-bold text-slate-800">{contact.subject}</p>
                            </div>

                            {/* Nội dung chi tiết */}
                            <div className="p-4 bg-white rounded-lg border border-slate-200 max-h-60 overflow-y-auto">
                                <strong className="block text-sm text-slate-500 mb-2">Nội dung chi tiết:</strong>
                                <div className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                                    {contact.message}
                                </div>
                            </div>
                        </div>
                        
                        {/* KHU VỰC GHI CHÚ NỘI BỘ */}
                        <div className="mt-8 pt-6 border-t border-purple-200">
                            <h3 className="text-2xl font-bold text-purple-700 mb-4 flex items-center">
                                <i className="fa-solid fa-clipboard-list mr-3"></i> Ghi chú Nội bộ (Chỉ quản trị viên thấy)
                            </h3>
                            
                            <textarea
                                rows="6"
                                value={currentNotes}
                                onChange={(e) => setCurrentNotes(e.target.value)}
                                placeholder="Thêm ghi chú, lịch sử xử lý, hoặc thông tin nội bộ khác..."
                                className="w-full p-4 border border-slate-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 shadow-inner resize-none text-slate-700 transition-shadow"
                            ></textarea>
                            
                            <div className="flex justify-end mt-4 space-x-3">
                                {/* Nút Hủy thay đổi */}
                                <button
                                    type="button"
                                    onClick={() => setCurrentNotes(contact.internalNotes)} 
                                    disabled={isSaving || !notesChanged}
                                    className="py-2 px-6 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Hủy thay đổi
                                </button>
                                
                                {/* Nút Lưu Ghi chú */}
                                <button
                                    type="button"
                                    onClick={handleSaveNotes}
                                    disabled={isSaving || !notesChanged}
                                    className="py-2 px-6 rounded-lg text-white font-semibold transition-all shadow-lg bg-purple-600 hover:bg-purple-700 disabled:bg-slate-400 disabled:shadow-none disabled:cursor-not-allowed flex items-center"
                                >
                                    {isSaving ? (
                                        <>
                                            <i className="fa-solid fa-spinner fa-spin mr-2"></i> Đang lưu...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa-solid fa-save mr-2"></i> Lưu Ghi chú
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            
            {/* Thư viện Font Awesome */}
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        </div>
    );
}
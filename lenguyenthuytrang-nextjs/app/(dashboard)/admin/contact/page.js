"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
// Import Service
import AdminContactService from '@/services/AdminContactService';

// --- HÀM HỖ TRỢ ---
const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return !isNaN(date) ? date.toLocaleDateString('vi-VN') : dateString;
};

// Chuyển đổi trạng thái từ số sang chữ để hiển thị (giả sử backend trả về số)
const getStatusLabel = (status) => {
    // Tùy chỉnh logic này dựa trên dữ liệu thực tế từ API của bạn
    // Ví dụ: 1: Chưa trả lời, 2: Đã xem, 3: Đã trả lời
    if (status === 1 || status === '1') return 'Chưa trả lời';
    if (status === 2 || status === '2') return 'Đã xem';
    if (status === 3 || status === '3') return 'Đã trả lời';
    return 'Chưa xác định';
};

const getStatusStyle = (statusLabel) => {
    switch (statusLabel) {
        case 'Đã trả lời': return 'bg-green-100 text-green-800';
        case 'Đã xem': return 'bg-blue-100 text-blue-800';
        case 'Chưa trả lời': return 'bg-red-100 text-red-800';
        default: return 'bg-slate-100 text-slate-600';
    }
};

// --- COMPONENT MODAL XÁC NHẬN ---
const ConfirmationModal = ({ isOpen, contact, onConfirm, onCancel }) => {
    if (!isOpen || !contact) return null;

    const title = "Xác nhận Xóa Liên hệ";
    const message = `Bạn có chắc chắn muốn xóa liên hệ của "${contact.name}" (ID: #${contact.id})? Hành động này không thể hoàn tác.`;
        
    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300" onClick={onCancel}>
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 transform transition-all duration-300 scale-100" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start border-b pb-3 mb-4">
                    <h3 className="text-xl font-bold text-red-700">
                        <i className="fa-solid fa-triangle-exclamation mr-2"></i> {title}
                    </h3>
                    <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <i className="fa-solid fa-xmark text-lg"></i>
                    </button>
                </div>
                <div className="mb-6"><p className="text-slate-600">{message}</p></div>
                <div className="flex justify-end space-x-3">
                    <button onClick={onCancel} className="py-2 px-4 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors font-medium shadow-sm">Hủy bỏ</button>
                    <button onClick={onConfirm} className="py-2 px-4 rounded-lg text-white font-semibold transition-colors shadow-md bg-red-600 hover:bg-red-700">Xóa vĩnh viễn</button>
                </div>
            </div>
        </div>
    );
}

// --- COMPONENT MODAL TRẢ LỜI/CHI TIẾT ---
const ReplyModal = ({ contact, onSendReply, onClose }) => {
    const [replyContent, setReplyContent] = useState('');
    const [isSending, setIsSending] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (replyContent.trim() !== '') {
            setIsSending(true);
            await onSendReply(contact.id, replyContent);
            setIsSending(false);
        } else {
            alert('Vui lòng nhập nội dung trả lời.');
        }
    };
    
    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center transition-opacity duration-300" onClick={onClose}>
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 p-8 transform transition-all duration-300 scale-100" onClick={e => e.stopPropagation()}>
                
                <div className="flex justify-between items-start border-b pb-4 mb-4">
                    <h3 className="text-2xl font-bold text-purple-700 flex items-center">
                        <i className="fa-solid fa-envelope-open-text mr-3"></i>
                        Trả lời Liên hệ (#{contact.id})
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <i className="fa-solid fa-xmark text-xl"></i>
                    </button>
                </div>

                {/* THÔNG TIN LIÊN HỆ */}
                <div className="mb-6 space-y-2 text-slate-700 border p-4 rounded-lg bg-slate-50">
                    <p><strong>Từ:</strong> {contact.name} &lt;{contact.email}&gt;</p>
                    {/* Giả sử API trả về content thay vì message, hoặc subject */}
                    <p><strong>Nội dung gửi:</strong></p>
                    <div className="p-3 bg-white border border-slate-200 rounded-lg whitespace-pre-wrap max-h-40 overflow-y-auto text-sm">
                        {contact.content || contact.message}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Ngày gửi: {formatDate(contact.created_at)}</p>
                </div>

                {/* FORM TRẢ LỜI */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Nội dung trả lời</label>
                        <textarea
                            rows="6"
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder={`Soạn thư trả lời cho ${contact.email}...`}
                            required
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 shadow-sm"
                        ></textarea>
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="py-2 px-4 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors font-medium shadow-sm"
                        >
                            Đóng
                        </button>
                        <button
                            type="submit"
                            disabled={isSending}
                            className={`py-2 px-4 rounded-lg text-white font-semibold transition-colors shadow-md bg-purple-600 hover:bg-purple-700 focus:ring-purple-500 flex items-center ${isSending ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isSending ? (
                                <><i className="fa-solid fa-spinner fa-spin mr-2"></i> Đang gửi...</>
                            ) : (
                                <><i className="fa-solid fa-paper-plane mr-2"></i> Gửi Trả lời</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- COMPONENT CHÍNH ---
export default function ContactManagementPage() {
    // --- STATE ---
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('All');
    
    // State Modal
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [contactToDelete, setContactToDelete] = useState(null); 
    const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
    const [contactToReply, setContactToReply] = useState(null);
    
    // Phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const contactsPerPage = 5; 

    // --- 1. GỌI API LẤY DANH SÁCH ---
    const fetchContacts = useCallback(async () => {
        setLoading(true);
        try {
            // Lấy tất cả hoặc phân trang từ server (ở đây lấy limit lớn để client-side pagination demo)
            const response = await AdminContactService.getAll({ limit: 1000 });
            if (response.data.status) {
                setContacts(response.data.data);
            }
        } catch (error) {
            console.error("Lỗi tải danh sách liên hệ:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchContacts();
    }, [fetchContacts]);

    // --- LOGIC UI ---
    
    // Lấy danh sách trạng thái duy nhất từ dữ liệu
    const uniqueStatuses = useMemo(() => {
        const statuses = contacts.map(c => getStatusLabel(c.status));
        return [...new Set(statuses)];
    }, [contacts]);
    
    // --- XỬ LÝ XÓA ---
    const handleOpenDeleteModal = (contact) => {
        setContactToDelete(contact);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (contactToDelete) {
            try {
                await AdminContactService.delete(contactToDelete.id);
                alert("Xóa liên hệ thành công!");
                fetchContacts(); // Tải lại dữ liệu
                
                // Reset trang nếu cần
                if (contacts.length % contactsPerPage === 1 && contacts.length > contactsPerPage && currentPage > 1) {
                     setCurrentPage(currentPage - 1);
                }
            } catch (error) {
                alert("Lỗi khi xóa: " + (error.response?.data?.message || error.message));
            } finally {
                setIsDeleteModalOpen(false);
                setContactToDelete(null); 
            }
        }
    };

    // --- XỬ LÝ TRẢ LỜI / XEM CHI TIẾT ---
    const handleOpenReplyModal = async (contact) => {
        // Khi mở modal, có thể gọi API show để đánh dấu là "Đã xem" (nếu backend hỗ trợ)
        try {
            await AdminContactService.getById(contact.id); 
            // Cập nhật lại trạng thái local ngay lập tức để UI phản hồi nhanh (Optional)
            setContacts(prev => prev.map(c => c.id === contact.id && c.status === 1 ? {...c, status: 2} : c));
        } catch (error) {
            console.error("Lỗi khi xem chi tiết:", error);
        }
        
        setContactToReply(contact);
        setIsReplyModalOpen(true);
    };

    const handleSendReply = async (id, content) => {
        try {
            const data = {
                reply_content: content,
                // Backend sẽ tự động set status = 3 (Đã trả lời)
            };
            await AdminContactService.update(id, data);
            alert("Đã gửi phản hồi thành công!");
            fetchContacts(); // Tải lại danh sách để cập nhật trạng thái mới nhất
            setIsReplyModalOpen(false);
            setContactToReply(null);
        } catch (error) {
            alert("Lỗi khi gửi phản hồi: " + (error.response?.data?.message || error.message));
        }
    };

    // Hàm lọc liên hệ (Client-side)
    const filteredContacts = useMemo(() => {
        let currentContacts = contacts;
        const lowerCaseSearchTerm = searchTerm.toLowerCase();

        // Lọc theo Trạng thái
        if (selectedStatus !== 'All') {
            currentContacts = currentContacts.filter(contact => getStatusLabel(contact.status) === selectedStatus);
        }

        // Lọc theo Từ khóa
        if (searchTerm) {
            currentContacts = currentContacts.filter(contact =>
                (contact.name && contact.name.toLowerCase().includes(lowerCaseSearchTerm)) ||
                (contact.email && contact.email.toLowerCase().includes(lowerCaseSearchTerm)) ||
                (contact.content && contact.content.toLowerCase().includes(lowerCaseSearchTerm))
            );
        }

        return currentContacts;
    }, [searchTerm, selectedStatus, contacts]); 
    
    // Phân trang
    const totalPages = Math.ceil(filteredContacts.length / contactsPerPage);
    const indexOfLastContact = currentPage * contactsPerPage;
    const indexOfFirstContact = indexOfLastContact - contactsPerPage;
    const currentContacts = filteredContacts.slice(indexOfFirstContact, indexOfLastContact);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="p-4 md:p-8">
            <div className="max-w-7xl mx-auto">

                {/* --- HEADER --- */}
                <div className="mb-6 border-b pb-4">
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center">
                        <i className="fa-solid fa-message mr-3 text-purple-600"></i>
                        Quản lý Liên hệ Khách hàng
                    </h1>
                </div>

                {/* --- FILTER BAR --- */}
                <div className="mb-6 flex flex-col sm:flex-row gap-4">
                    <div className="relative w-full sm:max-w-md">
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo Tên, Email hoặc Nội dung..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="w-full border border-slate-300 p-3 rounded-xl focus:ring-purple-500 focus:border-purple-500 shadow-sm"
                        />
                    </div>
                    
                    <div className="relative w-full sm:w-auto">
                        <select
                            value={selectedStatus}
                            onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
                            className="block w-full border border-slate-300 p-3 rounded-xl bg-white text-slate-700 appearance-none pr-8 focus:ring-purple-500 shadow-sm"
                        >
                            <option value="All">Tất cả Trạng thái</option>
                            {uniqueStatuses.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                            <i className="fa-solid fa-angle-down"></i>
                        </div>
                    </div>
                </div>

                {/* --- TABLE --- */}
                <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-slate-100 min-h-[300px]">
                    {loading ? (
                        <div className="flex justify-center items-center h-40 text-slate-500">
                            <i className="fa-solid fa-spinner fa-spin mr-2"></i> Đang tải dữ liệu...
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Khách hàng</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nội dung</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ngày gửi</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Trạng thái</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {currentContacts.length > 0 ? (
                                    currentContacts.map((contact) => {
                                        const statusLabel = getStatusLabel(contact.status);
                                        return (
                                            <tr key={contact.id} className="hover:bg-purple-50/50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">#{contact.id}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <div className="font-medium text-slate-700">{contact.name}</div>
                                                    <div className="text-slate-500 text-xs">{contact.email}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-700 max-w-xs truncate">
                                                    {/* Hiển thị nội dung ngắn gọn */}
                                                    {contact.content && contact.content.length > 30 ? contact.content.substring(0, 30) + '...' : contact.content}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{formatDate(contact.created_at)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(statusLabel)}`}>
                                                        {statusLabel}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button 
                                                        onClick={() => handleOpenReplyModal(contact)}
                                                        className="text-purple-600 hover:text-purple-800 mr-4 transition-colors inline-flex items-center"
                                                    >
                                                        <i className="fa-solid fa-file-lines mr-1"></i> Xem/Trả lời
                                                    </button>
                                                    
                                                    <button 
                                                        onClick={() => handleOpenDeleteModal(contact)}
                                                        className="text-red-600 hover:text-red-800 transition-colors"
                                                    >
                                                        <i className="fa-solid fa-trash mr-1"></i> Xóa
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-slate-500 text-lg">
                                            Không tìm thấy liên hệ nào.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* --- PAGINATION --- */}
                {totalPages > 1 && (
                    <div className="mt-4 flex justify-between items-center">
                        <span className="text-sm text-slate-600">
                            Hiển thị {indexOfFirstContact + 1} đến {Math.min(indexOfLastContact, filteredContacts.length)} trong tổng số {filteredContacts.length} liên hệ
                        </span>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                            <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50">
                                <i className="fa-solid fa-chevron-left"></i>
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => paginate(page)}
                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors
                                        ${page === currentPage ? 'z-10 bg-purple-600 border-purple-600 text-white' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'}`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50">
                                <i className="fa-solid fa-chevron-right"></i>
                            </button>
                        </nav>
                    </div>
                )}
                
            </div>

            {/* --- MODALS --- */}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                contact={contactToDelete}
                onConfirm={handleConfirmDelete}
                onCancel={() => setIsDeleteModalOpen(false)}
            />

            {isReplyModalOpen && contactToReply && (
                <ReplyModal 
                    contact={contactToReply}
                    onSendReply={handleSendReply}
                    onClose={() => setIsReplyModalOpen(false)}
                />
            )}
            
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        </div>
    );
}
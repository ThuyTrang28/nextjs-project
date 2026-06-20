"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
// Import Service
import AdminUserService from '@/services/AdminUserService'; 

// --- HÀM HỖ TRỢ ---
const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return !isNaN(date) ? date.toLocaleDateString('vi-VN') : dateString;
};

// Chuyển đổi trạng thái
const mapStatus = (status) => {
    return (status === 1 || status === '1') ? 'Active' : 'Suspended';
};

// --- COMPONENT MODAL XÁC NHẬN ---
const ConfirmationModal = ({ isOpen, user, onConfirm, onCancel }) => {
    if (!isOpen || !user) return null;

    const title = "Xác nhận Xóa Thành viên";
    const message = `Bạn có chắc chắn muốn xóa thành viên "${user.name}" (ID: #${user.id})? Hành động này không thể hoàn tác.`;
        
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

// --- COMPONENT CHÍNH ---
export default function AdminUsersPage() {
    // --- STATE ---
    const [users, setUsers] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('All');
    
    // State Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null); 
    
    // Phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 5; 

    // --- 1. GỌI API LẤY DANH SÁCH ---
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await AdminUserService.getAll({ limit: 1000 });
            if (response.data.status) {
                setUsers(response.data.data);
            }
        } catch (error) {
            console.error("Lỗi tải danh sách thành viên:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // --- LOGIC UI ---
    
    const uniqueRoles = useMemo(() => {
        return [...new Set(users.map(user => user.roles))];
    }, [users]);
    
    const handleOpenDeleteModal = (user) => {
        setUserToDelete(user);
        setIsModalOpen(true);
    };

    // --- 2. GỌI API XÓA ---
    const handleConfirmDelete = async () => {
        if (userToDelete) {
            try {
                await AdminUserService.delete(userToDelete.id);
                alert("Xóa thành viên thành công!");
                
                fetchUsers();
                
                if (users.length % usersPerPage === 1 && users.length > usersPerPage && currentPage > 1) {
                     setCurrentPage(currentPage - 1);
                }
            } catch (error) {
                alert("Lỗi khi xóa: " + (error.response?.data?.message || error.message));
            } finally {
                setIsModalOpen(false);
                setUserToDelete(null); 
            }
        }
    };
    
    const handleCancelDelete = () => {
        setIsModalOpen(false);
        setUserToDelete(null);
    };

    // Hàm lọc người dùng
    const filteredUsers = useMemo(() => {
        let currentUsers = users;
        const lowerCaseSearchTerm = searchTerm.toLowerCase();

        if (selectedRole !== 'All') {
            currentUsers = currentUsers.filter(user => user.roles === selectedRole);
        }

        if (searchTerm) {
            currentUsers = currentUsers.filter(user =>
                user.name.toLowerCase().includes(lowerCaseSearchTerm) ||
                user.email.toLowerCase().includes(lowerCaseSearchTerm) ||
                (user.phone && user.phone.includes(lowerCaseSearchTerm)) || // Thêm tìm kiếm theo SĐT
                (user.roles && user.roles.toLowerCase().includes(lowerCaseSearchTerm))
            );
        }

        return currentUsers;
    }, [searchTerm, selectedRole, users]); 
    
    // Logic Phân trang
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const getStatusStyle = (status) => {
        const uiStatus = typeof status === 'number' ? mapStatus(status) : status;
        switch (uiStatus) {
            case 'Active': return 'bg-green-100 text-green-800';
            case 'Suspended': return 'bg-red-100 text-red-800'; 
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    return (
        <div className="p-4 md:p-8">
            <div className="max-w-7xl mx-auto">

                {/* --- HEADER --- */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center">
                        <i className="fa-solid fa-users mr-3 text-blue-600"></i>
                        Quản lý Thành viên
                    </h1>

                    <Link href="/admin/users/add" passHref>
                        <button className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 shadow-md">
                            <i className="fa-solid fa-user-plus"></i>
                            Thêm Thành viên Mới 
                        </button>
                    </Link>
                </div>

                {/* --- FILTER BAR --- */}
                <div className="mb-6 flex flex-col sm:flex-row gap-4">
                    <div className="relative w-full sm:max-w-sm">
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo Tên, Email, SĐT..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="w-full border border-slate-300 p-3 rounded-xl focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        />
                    </div>
                    
                    <div className="relative w-full sm:w-auto">
                        <select
                            value={selectedRole}
                            onChange={(e) => { setSelectedRole(e.target.value); setCurrentPage(1); }}
                            className="block w-full border border-slate-300 p-3 rounded-xl bg-white text-slate-700 appearance-none pr-8 focus:ring-blue-500 shadow-sm"
                        >
                            <option value="All">Tất cả Vai trò</option>
                            {uniqueRoles.map(role => (
                                <option key={role} value={role}>{role}</option>
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
                            <i className="fa-solid fa-spinner fa-spin mr-2"></i> Đang tải danh sách...
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tên</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Email</th>
                                    {/* THÊM CỘT SỐ ĐIỆN THOẠI */}
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">SĐT</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Vai trò</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Ngày Đăng ký</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Trạng thái</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {currentUsers.length > 0 ? (
                                    currentUsers.map((user) => {
                                        const uiStatus = mapStatus(user.status);
                                        return (
                                            <tr key={user.id} className="hover:bg-blue-50/50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">#{user.id}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-medium">
                                                    <div className="flex items-center gap-2">
                                                        {user.avatar && (
                                                            <img 
                                                                src={`http://localhost/lenguyenthuytrang_cdtt/public/images/user/${user.avatar}`} 
                                                                alt={user.name} 
                                                                className="w-8 h-8 rounded-full object-cover border"
                                                                onError={(e) => {e.target.onerror = null; e.target.style.display = 'none'}}
                                                            />
                                                        )}
                                                        {user.name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{user.email}</td>
                                                {/* HIỂN THỊ SỐ ĐIỆN THOẠI */}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{user.phone || '-'}</td>
                                                
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-700">{user.roles}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{formatDate(user.created_at)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(uiStatus)}`}>
                                                        {uiStatus}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    {/* ĐỔI NÚT SỬA THÀNH NÚT CHI TIẾT */}
                                                    <Link href={`/admin/users/${user.id}`} className="text-teal-600 hover:text-teal-800 mr-4 transition-colors font-medium">
                                                        <i className="fa-solid fa-eye mr-1"></i> Chi tiết
                                                    </Link>
                                                    <button onClick={() => handleOpenDeleteModal(user)} className="text-red-600 hover:text-red-800 transition-colors">
                                                        <i className="fa-solid fa-trash mr-1"></i> Xóa
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-8 text-center text-slate-500 text-lg">
                                            Không tìm thấy thành viên nào.
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
                            Hiển thị {indexOfFirstUser + 1} đến {Math.min(indexOfLastUser, filteredUsers.length)} trong tổng số {filteredUsers.length} thành viên
                        </span>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                            <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50">
                                <i className="fa-solid fa-chevron-left"></i>
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => paginate(page)}
                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors
                                        ${page === currentPage ? 'z-10 bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'}`}
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

            {/* --- MODAL --- */}
            <ConfirmationModal
                isOpen={isModalOpen}
                user={userToDelete}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />

            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        </div>
    );
}
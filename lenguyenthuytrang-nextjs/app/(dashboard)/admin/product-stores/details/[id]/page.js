// app/admin/inventorys/details/[id]/page.js

"use client";

import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
// import Head from 'next/head'; // Không cần thiết trong App Router, thay bằng export metadata
import { useRouter, useParams } from 'next/navigation'; // <-- THÊM: useParams

// --- DỮ LIỆU MOCK (Giữ nguyên) ---
const initialMockInventory = [
    { id: 'INV001', supplier: 'ABC Cosmetics', date: '2025-12-05', items: 5, totalValue: 550.75, status: 'Đang chờ xử lý', products: [{name: 'Mascara A1', sku: 'MA001', quantity: 100, unitPrice: 5.50}, {name: 'Son dưỡng B2', sku: 'SB002', quantity: 50, unitPrice: 3.50}, {name: 'Phấn nền C3', sku: 'PN003', quantity: 80, unitPrice: 6.00}] },
    { id: 'INV002', supplier: 'Global Beauty Inc.', date: '2025-11-28', items: 12, totalValue: 1200.00, status: 'Đã hoàn tất', products: [{name: 'Nước hoa X1', sku: 'NH001', quantity: 20, unitPrice: 40.00}, {name: 'Serum Y2', sku: 'SR002', quantity: 30, unitPrice: 15.00}] },
    { id: 'INV003', supplier: 'VietNam Supplies', date: '2025-12-01', items: 3, totalValue: 80.50, status: 'Đã hủy', products: [{name: 'Bông tẩy trang', sku: 'BT001', quantity: 500, unitPrice: 0.10}, {name: 'Tăm bông', sku: 'TB002', quantity: 1000, unitPrice: 0.03}] },
    { id: 'INV004', supplier: 'ABC Cosmetics', date: '2025-12-08', items: 8, totalValue: 700.25, status: 'Đang chờ xử lý', products: [{name: 'Kẻ mắt A', sku: 'KM001', quantity: 150, unitPrice: 4.50}, {name: 'Toner B', sku: 'TN002', quantity: 100, unitPrice: 5.00}] },
    { id: 'INV005', supplier: 'Fashion Hub', date: '2025-12-07', items: 15, totalValue: 950.00, status: 'Đã hoàn tất', products: [{name: 'Áo khoác', sku: 'AK001', quantity: 50, unitPrice: 15.00}, {name: 'Quần Jeans', sku: 'QJ002', quantity: 40, unitPrice: 20.00}] },
    { id: 'INV006', supplier: 'Makeup Pros', date: '2025-12-06', items: 4, totalValue: 210.50, status: 'Đang chờ xử lý', products: [{name: 'Bút che khuyết điểm', sku: 'BC001', quantity: 200, unitPrice: 1.50}] },
    { id: 'INV007', supplier: 'Global Beauty Inc.', date: '2025-11-20', items: 20, totalValue: 3500.00, status: 'Đã hoàn tất', products: [{name: 'Máy sấy tóc', sku: 'MST01', quantity: 10, unitPrice: 80.00}, {name: 'Bàn chải điện', sku: 'BCE02', quantity: 20, unitPrice: 50.00}] },
];

// --- THÀNH PHẦN MODAL XÁC NHẬN (Giữ nguyên) ---
const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, confirmButtonText, iconClassName, iconBg }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onCancel}>
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto transform transition-all duration-300 scale-100 opacity-100"
                onClick={(e) => e.stopPropagation()} 
            >
                <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                    <div className={`${iconBg} p-3 rounded-full`}>
                        <i className={`${iconClassName} text-xl`}></i>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">{title}</h3>
                </div>
                
                <div className="p-6">
                    <p className="text-slate-600 mb-6">{message}</p>
                    
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            onClick={onConfirm}
                            className="px-4 py-2 text-sm font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors shadow-md shadow-amber-200"
                        >
                            {confirmButtonText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- HÀM HỖ TRỢ (Giữ nguyên) ---
const getStatusStyle = (status) => {
    switch (status) {
        case 'Đã hoàn tất':
            return 'bg-green-100 text-green-800';
        case 'Đang chờ xử lý':
            return 'bg-yellow-100 text-yellow-800';
        case 'Đã hủy':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-slate-100 text-slate-800';
    }
};

const formatPrice = (price) => {
    return `$${(price ?? 0).toFixed(2)}`;
};

// --- THÀNH PHẦN CHÍNH TRANG CHI TIẾT ---
export default function AdminInventoryDetailsPage() {
    // SỬA LỖI TẠI ĐÂY: Thay router.query bằng useParams()
    const params = useParams();
    const id = params.id; 
    
    // State quản lý dữ liệu (giả lập việc cập nhật trạng thái)
    const [inventoryRecords, setInventoryRecords] = useState(initialMockInventory); 
    
    // Tìm kiếm phiếu dựa trên ID trong URL (sử dụng useMemo để tối ưu)
    const record = useMemo(() => {
        // ID đã được lấy từ useParams, nên ta chỉ cần kiểm tra
        if (!id) return null; 
        return inventoryRecords.find(r => r.id === id);
    }, [id, inventoryRecords]);

    // State cho Modal xác nhận (Hủy/Hoàn tất) (Giữ nguyên)
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [modalActionType, setModalActionType] = useState(null); 

    // --- HÀM XỬ LÝ HÀNH ĐỘNG (Hủy/Hoàn tất) (Giữ nguyên) ---
    const openConfirmModal = useCallback((actionType) => {
        setModalActionType(actionType);
        setIsConfirmModalOpen(true);
    }, []);

    const closeConfirmModal = useCallback(() => {
        setIsConfirmModalOpen(false);
        setModalActionType(null);
    }, []);

    const executeAction = useCallback(() => {
        if (record && modalActionType) {
            const newStatus = modalActionType === 'cancel' ? 'Đã hủy' : 'Đã hoàn tất';
            
            const updatedRecords = inventoryRecords.map(r => {
                if (r.id === record.id) {
                    // Trong ứng dụng thực tế, bạn sẽ gọi API ở đây
                    return { ...r, status: newStatus };
                }
                return r;
            });
            setInventoryRecords(updatedRecords);
        }
        closeConfirmModal();
    }, [inventoryRecords, record, modalActionType, closeConfirmModal]);
    
    // Cài đặt nội dung Modal xác nhận (Giữ nguyên)
    const modalProps = useMemo(() => {
        if (modalActionType === 'cancel') {
            return {
                title: "Xác nhận Hủy Phiếu",
                message: `Bạn có chắc chắn muốn HỦY phiếu nhập kho "${record?.id}" từ nhà cung cấp ${record?.supplier} không?`,
                confirmButtonText: "Xác nhận Hủy",
                iconClassName: "fa-solid fa-ban text-red-500",
                iconBg: "bg-red-100"
            };
        } else if (modalActionType === 'complete') {
            return {
                title: "Xác nhận Hoàn tất Phiếu",
                message: `Bạn có chắc chắn muốn đánh dấu phiếu nhập kho "${record?.id}" là ĐÃ HOÀN TẤT không? Hành động này sẽ cập nhật tồn kho.`,
                confirmButtonText: "Hoàn tất Nhập kho",
                iconClassName: "fa-solid fa-check-circle text-green-500",
                iconBg: "bg-green-100"
            };
        }
        return { title: "", message: "", confirmButtonText: "", iconClassName: "", iconBg: "" };
    }, [modalActionType, record]);


    if (!id) {
        // Khi component render lần đầu, id có thể chưa có (undefined/null)
        // Dùng trạng thái loading/placeholder.
        return (
             <div className="p-8 text-center text-slate-500">Đang tải chi tiết phiếu...</div>
        );
    }

    if (!record) {
        // Lỗi 404 (ID có, nhưng không tìm thấy trong dữ liệu mock)
        return (
             <div className="p-8 text-center text-red-600">
                <h1 className="text-2xl font-bold mb-4">Lỗi 404</h1>
                <p>Không tìm thấy phiếu nhập kho với ID: **{id}**</p>
                <Link href="/admin/product-stores" className="mt-4 inline-block text-sky-600 hover:text-sky-800">Quay lại danh sách</Link>
            </div>
        );
    }
    
    const { supplier, date, totalValue, status, products } = record;

    // --- RENDER GIAO DIỆN CHI TIẾT PHIẾU (Giữ nguyên) ---
    return (
        <>
            {/* Loại bỏ <Head> và dùng <link> CSS ngoài cùng nếu cần */}
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

            <div className="p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    
                    {/* --- HEADER --- */}
                    <div className="flex justify-between items-start mb-6 border-b pb-4">
                        <h1 className="text-3xl font-bold text-slate-800 flex items-center">
                            <i className="fa-solid fa-file-invoice mr-3 text-sky-600"></i>
                            Chi tiết Phiếu Nhập Kho: <span className="text-sky-600 ml-2">{record.id}</span>
                        </h1>
                        
                        <Link 
                            href="/admin/product-stores" 
                            className="text-slate-600 hover:text-slate-800 flex items-center gap-1 transition-colors"
                        >
                            <i className="fa-solid fa-arrow-left"></i>
                            <span className="font-semibold">Quay lại danh sách</span>
                        </Link>
                    </div>
                    
                    {/* --- THÔNG TIN CHUNG VÀ HÀNH ĐỘNG --- */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            
                            {/* Cột 1: Thông tin cơ bản */}
                            <div>
                                <h2 className="text-xl font-bold text-slate-700 mb-3 border-b pb-2">Thông tin Chung</h2>
                                <p className="text-sm mb-2"><span className="font-semibold text-slate-600">Nhà cung cấp:</span> <span className="text-slate-900">{supplier}</span></p>
                                <p className="text-sm mb-2"><span className="font-semibold text-slate-600">Ngày nhập:</span> <span className="text-slate-900">{date}</span></p>
                                <p className="text-sm mb-2"><span className="font-semibold text-slate-600">Trạng thái:</span> <span className={`px-2 py-0.5 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusStyle(status)}`}>{status}</span></p>
                            </div>

                            {/* Cột 2: Tổng quan */}
                            <div>
                                <h2 className="text-xl font-bold text-slate-700 mb-3 border-b pb-2">Tổng quan</h2>
                                <p className="text-sm mb-2"><span className="font-semibold text-slate-600">Tổng Số Mặt hàng (Loại):</span> <span className="text-slate-900 text-lg font-bold">{record.items}</span></p>
                                <p className="text-sm mb-2"><span className="font-semibold text-slate-600">Tổng Giá trị Phiếu:</span> <span className="text-green-600 text-xl font-bold">{formatPrice(totalValue)}</span></p>
                                {/* Thêm thông tin chi tiết khác nếu có */}
                            </div>

                            {/* Cột 3: Hành động */}
                            <div className="flex flex-col justify-start items-start md:items-end">
                                <h2 className="text-xl font-bold text-slate-700 mb-3 border-b pb-2 w-full text-left md:text-right">Hành động</h2>
                                {status === 'Đang chờ xử lý' ? (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => openConfirmModal('complete')}
                                            className="bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-md shadow-green-200"
                                        >
                                            <i className="fa-solid fa-check-double"></i>
                                            Hoàn tất Nhập kho
                                        </button>
                                        <button
                                            onClick={() => openConfirmModal('cancel')}
                                            className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 shadow-md shadow-red-200"
                                        >
                                            <i className="fa-solid fa-ban"></i>
                                            Hủy Phiếu
                                        </button>
                                    </div>
                                ) : (
                                    <p className="text-slate-500 italic">Không có hành động khả dụng cho trạng thái **{status}**</p>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* --- DANH SÁCH SẢN PHẨM TRONG PHIẾU (Giữ nguyên) --- */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
                        <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center">
                            <i className="fa-solid fa-list-check mr-2 text-amber-500"></i>
                            Danh sách Sản phẩm Nhập
                        </h2>
                        
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Mã SKU</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tên Sản phẩm</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Số lượng nhập</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Đơn giá nhập</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {products && products.map((item, index) => (
                                        <tr key={index} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{item.sku}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">{item.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-600 font-medium">{item.quantity.toLocaleString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-600">{formatPrice(item.unitPrice)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-right text-slate-900">{formatPrice(item.unitPrice * item.quantity)}</td>
                                        </tr>
                                    ))}
                                    <tr>
                                        <td colSpan="4" className="px-6 py-4 text-right text-base font-bold text-slate-800 border-t-2 border-slate-300">Tổng cộng:</td>
                                        <td className="px-6 py-4 text-right text-xl font-bold text-green-600 border-t-2 border-slate-300">{formatPrice(totalValue)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>

            {/* Render Modal xác nhận (Hủy/Hoàn tất) */}
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                title={modalProps.title}
                message={modalProps.message}
                onConfirm={executeAction}
                onCancel={closeConfirmModal}
                confirmButtonText={modalProps.confirmButtonText}
                iconClassName={modalProps.iconClassName}
                iconBg={modalProps.iconBg}
            />
        </>
    );
}
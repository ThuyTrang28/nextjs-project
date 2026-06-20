"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import AdminProductService from '@/services/AdminProductService'; // API lấy danh sách sản phẩm
import AdminProductStoreService from '@/services/AdminProductStoreService'; // API lưu kho

export default function AdminNewInventoryReceiptPage() {
    const router = useRouter();
    const fileInputRef = useRef(null);

    // State dữ liệu
    const [products, setProducts] = useState([]); // Danh sách sản phẩm để chọn
    const [selectedProduct, setSelectedProduct] = useState(null); // Sản phẩm đang chọn

    // Form State (Khớp với các cột trong bảng ProductStore)
    const [formData, setFormData] = useState({
        product_id: '',
        price_root: '', // Giá nhập (Giá gốc)
        qty: 1          // Số lượng nhập
    });

    const [importFile, setImportFile] = useState(null);
    const [isImportMode, setIsImportMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // 1. Load danh sách sản phẩm khi vào trang
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Lấy tất cả sản phẩm (limit lớn để hiển thị hết trong dropdown)
                const res = await AdminProductService.getAll({ limit: 1000 });
                const list = res.data.data?.data || res.data.data || [];
                setProducts(list);
            } catch (error) {
                console.error("Lỗi tải sản phẩm:", error);
            }
        };
        fetchProducts();
    }, []);

    // 2. Xử lý khi người dùng chọn sản phẩm từ Dropdown
    const handleProductChange = (e) => {
        const pId = e.target.value;
        const product = products.find(p => String(p.id) === String(pId));

        setSelectedProduct(product);

        setFormData(prev => ({
            ...prev,
            product_id: pId,
            // Tự động điền giá nhập bằng giá gốc của sản phẩm (price_buy). Nếu null thì về rỗng.
            price_root: product && product.price_buy != null ? product.price_buy : ''
        }));
    };

    // 3. Xử lý thay đổi input
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 4. Submit: Nhập Kho Thủ Công
    const handleManualSubmit = async (e) => {
        e.preventDefault();

        if (!formData.product_id || formData.qty <= 0) {
            alert('Vui lòng chọn sản phẩm và nhập số lượng hợp lệ.');
            return;
        }

        setIsLoading(true);
        try {
            // Chuẩn bị dữ liệu gửi về Backend (ProductStoreController -> store)
            const payload = {
                product_id: formData.product_id,
                qty: formData.qty,
                price_root: formData.price_root, // <--- Sửa tên key cho khớp với Backend
            };

            const res = await AdminProductStoreService.create(payload);

            if (res.data && res.data.status) {
                alert('Nhập kho thành công!');
                router.push('/admin/product-stores');
            } else {
                alert('Có lỗi xảy ra: ' + (res.data?.message || 'Không xác định'));
            }

        } catch (error) {
            console.error("Lỗi nhập kho:", error);
            alert('Lỗi hệ thống: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsLoading(false);
        }
    };

    // 5. Submit: Import File (Giữ nguyên logic cũ hoặc kết nối API Import thật)
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) setImportFile(file);
    };

    const handleImportSubmit = async (e) => {
        e.preventDefault();
        if (!importFile) {
            alert('Vui lòng chọn file!');
            return;
        }
        setIsLoading(true);
        try {
            // Giả lập API Import
            setTimeout(() => {
                alert(`Đã import thành công từ file "${importFile.name}"!`);
                router.push('/admin/product-stores');
            }, 1500);
        } catch (error) {
            alert('Lỗi import.');
        } finally {
            setIsLoading(false);
        }
    };

    // Helper format tiền
    const formatCurrency = (val) => Number(val).toLocaleString('vi-VN');

    return (
        <>
            <Head>
                <title>Nhập Kho Sản Phẩm | Admin</title>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
            </Head>

            <div className="p-4 md:p-8 min-h-screen bg-slate-50/50">
                <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">

                    {/* --- HEADER --- */}
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-emerald-50/50">
                        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                            <span className="bg-emerald-100 text-emerald-600 p-2 rounded-lg">
                                <i className="fa-solid fa-boxes-packing"></i>
                            </span>
                            Nhập Kho Sản Phẩm
                        </h1>
                        <Link href="/admin/product-stores" className="text-sm font-medium text-slate-500 hover:text-emerald-600 flex items-center transition-colors">
                            <i className="fa-solid fa-arrow-left mr-2"></i>
                            Quay lại
                        </Link>
                    </div>

                    {/* --- BODY --- */}
                    <div className="p-8">

                        {/* Tab Switcher */}
                        <div className="flex bg-slate-100 p-1 rounded-xl mb-8">
                            <button
                                type="button"
                                onClick={() => setIsImportMode(false)}
                                className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${!isImportMode ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                <i className="fa-solid fa-pen-to-square mr-2"></i> Nhập Thủ công
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsImportMode(true)}
                                className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${isImportMode ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                <i className="fa-solid fa-file-import mr-2"></i> Import Excel
                            </button>
                        </div>

                        {/* Form Content */}
                        <form onSubmit={!isImportMode ? handleManualSubmit : handleImportSubmit} className="animate-in fade-in duration-300">

                            {!isImportMode ? (
                                /* --- FORM THỦ CÔNG --- */
                                <div className="space-y-6">

                                    {/* 1. Chọn Sản phẩm */}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Chọn Sản phẩm <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <select
                                                name="product_id"
                                                value={formData.product_id}
                                                onChange={handleProductChange}
                                                required
                                                className="w-full pl-4 pr-10 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none cursor-pointer"
                                            >
                                                <option value="">-- Vui lòng chọn sản phẩm --</option>
                                                {products.map(p => (
                                                    <option key={p.id} value={p.id}>
                                                        {p.name} (Hiện có: {p.stock || 0})
                                                    </option>
                                                ))}
                                            </select>
                                            <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
                                        </div>
                                        {selectedProduct && (
                                            <p className="mt-2 text-sm text-slate-500">
                                                <i className="fa-solid fa-circle-info mr-1 text-emerald-500"></i>
                                                Đang chọn: <strong>{selectedProduct.name}</strong> - ID: {selectedProduct.id}
                                            </p>
                                        )}
                                    </div>

                                    {/* 2. Giá Nhập & Số Lượng */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                        {/* Giá Nhập */}
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Giá Nhập (VND) <span className="text-red-500">*</span></label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    name="price_root"
                                                    // Fix lỗi controlled component
                                                    value={formData.price_root ?? ''}
                                                    onChange={handleChange}
                                                    min="0"
                                                    className="w-full pl-4 pr-12 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-mono font-bold text-slate-700"
                                                    placeholder="0"
                                                    required
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">đ</span>
                                            </div>
                                            <p className="text-xs text-slate-400 mt-1 italic">Mặc định lấy giá mua của sản phẩm</p>
                                        </div>

                                        {/* Số Lượng */}
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Số lượng nhập <span className="text-red-500">*</span></label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    name="qty"
                                                    value={formData.qty}
                                                    onChange={handleChange}
                                                    min="1"
                                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-emerald-600"
                                                    required
                                                />
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1">
                                                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, qty: Number(prev.qty) + 1 }))} className="text-slate-400 hover:text-emerald-600 px-2"><i className="fa-solid fa-caret-up"></i></button>
                                                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, qty: Math.max(1, Number(prev.qty) - 1) }))} className="text-slate-400 hover:text-red-600 px-2"><i className="fa-solid fa-caret-down"></i></button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tổng kết nhanh */}
                                    {formData.price_root && formData.qty && (
                                        <div className="bg-emerald-50 p-4 rounded-lg flex justify-between items-center border border-emerald-100">
                                            <span className="text-emerald-800 font-medium">Tổng giá trị nhập:</span>
                                            <span className="text-2xl font-bold text-emerald-700">
                                                {formatCurrency(formData.price_root * formData.qty)} đ
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* --- FORM IMPORT FILE --- */
                                <div className="space-y-6">
                                    <div
                                        className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${importFile ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50'
                                            }`}
                                        onClick={() => fileInputRef.current.click()}
                                    >
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept=".xlsx,.csv"
                                            onChange={handleFileChange}
                                        />

                                        {importFile ? (
                                            <div className="animate-in zoom-in duration-200">
                                                <i className="fa-solid fa-file-excel text-5xl text-green-600 mb-4"></i>
                                                <p className="font-bold text-slate-800 text-lg">{importFile.name}</p>
                                                <p className="text-sm text-slate-500 mt-1">{(importFile.size / 1024).toFixed(2)} KB</p>
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); setImportFile(null); }}
                                                    className="mt-4 text-red-500 hover:text-red-700 text-sm font-semibold underline"
                                                >
                                                    Xóa file
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <i className="fa-solid fa-cloud-arrow-up text-5xl text-emerald-300 mb-4"></i>
                                                <p className="text-slate-700 font-semibold text-lg">Nhấn để chọn file Excel hoặc CSV</p>
                                                <p className="text-sm text-slate-400 mt-2">Kích thước tối đa: 5MB</p>
                                            </>
                                        )}
                                    </div>

                                    <div className="flex justify-center">
                                        <a href="/templates/import_inventory_template.xlsx" download className="group flex items-center text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors">
                                            <span className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-emerald-100 flex items-center justify-center mr-2">
                                                <i className="fa-solid fa-download"></i>
                                            </span>
                                            Tải xuống file mẫu chuẩn (.xlsx)
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* --- ACTION BUTTONS --- */}
                            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
                                <Link href="/admin/product-stores">
                                    <button type="button" className="px-6 py-3 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-all">
                                        Hủy bỏ
                                    </button>
                                </Link>
                                <button
                                    type="submit"
                                    disabled={isLoading || (isImportMode && !importFile)}
                                    className={`px-8 py-3 rounded-xl text-white font-bold shadow-lg flex items-center gap-2 transition-all ${isLoading || (isImportMode && !importFile)
                                            ? 'bg-slate-400 cursor-not-allowed shadow-none'
                                            : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-200 hover:-translate-y-0.5'
                                        }`}
                                >
                                    {isLoading && <i className="fa-solid fa-circle-notch fa-spin"></i>}
                                    {isImportMode ? 'Tiến hành Import' : 'Lưu vào Kho'}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
            </div>
        </>
    );
}
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Head from 'next/head';
import AdminProductSaleService from '@/services/AdminProductSaleService';
import AdminProductService from '@/services/AdminProductService';

// Helper: Format tiền tệ an toàn (Tránh lỗi NaN)
const formatCurrency = (amount) => {
    const value = parseFloat(amount);
    if (isNaN(value)) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

export default function EditPromotionPage() {
    const params = useParams();
    const router = useRouter();
    const saleId = params.id;
    
    // State
    const [products, setProducts] = useState([]); 
    const [formData, setFormData] = useState({
        name: '', // Tên chương trình
        product_id: '',
        price_sale: 0,
        date_begin: '',
        date_end: '',
        description: ''
    });

    const [selectedProductInfo, setSelectedProductInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // 1. Fetch Dữ liệu
    useEffect(() => {
        const fetchData = async () => {
            if (!saleId) return;
            setIsLoading(true);
            try {
                const [productsRes, saleRes] = await Promise.all([
                    AdminProductService.getAll({ limit: 2000 }), // Lấy danh sách sản phẩm
                    AdminProductSaleService.getById(saleId)
                ]);

                // Xử lý danh sách sản phẩm
                const productList = productsRes.data.data?.data || productsRes.data.data || [];
                setProducts(productList);

                // Xử lý dữ liệu Sale hiện tại
                const saleData = saleRes.data.data || saleRes.data;
                if (saleData) {
                    const formatDate = (dateString) => dateString ? dateString.split(' ')[0] : '';

                    setFormData({
                        name: saleData.name || '',
                        product_id: saleData.product_id,
                        price_sale: parseFloat(saleData.price_sale),
                        date_begin: formatDate(saleData.date_begin),
                        date_end: formatDate(saleData.date_end),
                        description: saleData.description || ''
                    });

                    // Tìm sản phẩm hiện tại để hiển thị giá gốc
                    const currentProduct = productList.find(p => String(p.id) === String(saleData.product_id));
                    if (currentProduct) {
                        setSelectedProductInfo(currentProduct);
                    }
                }

            } catch (error) {
                console.error("Lỗi tải dữ liệu:", error);
                alert("Không thể tải thông tin khuyến mãi.");
                router.push('/admin/product-sales');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [saleId, router]);

    // 2. Xử lý khi chọn sản phẩm
    const handleProductChange = (e) => {
        const pId = e.target.value;
        const product = products.find(p => String(p.id) === String(pId));
        
        setFormData(prev => ({ ...prev, product_id: pId }));
        setSelectedProductInfo(product || null);
    };

    // 3. Xử lý thay đổi input
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 4. Lấy giá gốc an toàn (Sửa lỗi NaN ở đây)
    const getOriginalPrice = () => {
        if (!selectedProductInfo) return 0;
        // Kiểm tra cả 'price' (từ index controller) và 'price_buy' (phòng hờ)
        return parseFloat(selectedProductInfo.price || selectedProductInfo.price_buy || 0);
    };

    // 5. Tính % giảm giá
    const discountPercent = useMemo(() => {
        const original = getOriginalPrice();
        const sale = parseFloat(formData.price_sale);
        
        if (original <= 0) return 0;
        if (sale >= original) return 0;

        return Math.round(((original - sale) / original) * 100);
    }, [selectedProductInfo, formData.price_sale]);

    // 6. Submit Form
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const originalPrice = getOriginalPrice();
            const salePrice = parseFloat(formData.price_sale);

            if (salePrice >= originalPrice && originalPrice > 0) {
                if(!window.confirm(`Giá khuyến mãi (${formatCurrency(salePrice)}) cao hơn hoặc bằng giá gốc (${formatCurrency(originalPrice)}). Bạn có chắc chắn muốn lưu?`)) {
                    setIsSaving(false);
                    return;
                }
            }

            const payload = {
                name: formData.name,
                product_id: formData.product_id,
                price_sale: formData.price_sale,
                date_begin: formData.date_begin,
                date_end: formData.date_end,
                description: formData.description
            };

            const res = await AdminProductSaleService.update(saleId, payload);

            if (res.data && res.data.status) {
                alert("Cập nhật thành công!");
                router.push('/admin/product-sales');
            } else {
                alert(res.data?.message || "Cập nhật thất bại.");
            }
        } catch (err) {
            console.error("Lỗi cập nhật:", err);
            alert(`Lỗi: ${err.response?.data?.message || err.message}`);
        } finally {
            setIsSaving(false);
        }
    };
    
    if (isLoading) {
        return (
            <div className="min-h-screen p-8 flex items-center justify-center">
                <div className="text-xl text-slate-600 flex flex-col items-center">
                    <i className="fa-solid fa-spinner fa-spin text-4xl mb-4 text-amber-500"></i>
                    Đang tải dữ liệu...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-8 bg-slate-50/50">
            <Head><title>Sửa Khuyến Mãi | Admin</title></Head>

            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                            <span className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                                <i className="fa-solid fa-pen-to-square"></i>
                            </span>
                            Sửa Khuyến Mãi
                        </h1>
                        <p className="text-slate-500 text-sm mt-1 ml-11">ID: #{saleId}</p>
                    </div>
                    <Link href="/admin/product-sales" className="text-slate-600 hover:text-slate-900 flex items-center gap-2 transition-colors px-4 py-2 rounded-lg hover:bg-white">
                        <i className="fa-solid fa-arrow-left"></i> Quay lại
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
                    
                    {/* Tên chương trình */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-bold text-slate-700 mb-2">Tên Chương Trình <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="Ví dụ: Giảm giá ngày 20/10..."
                            className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                        />
                    </div>

                    {/* Chọn Sản phẩm */}
                    <div>
                        <label htmlFor="product_id" className="block text-sm font-bold text-slate-700 mb-2">Sản phẩm Áp dụng <span className="text-red-500">*</span></label>
                        <select
                            id="product_id"
                            name="product_id"
                            value={formData.product_id}
                            onChange={handleProductChange}
                            required
                            className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                        >
                            <option value="">-- Chọn sản phẩm --</option>
                            {products.map(product => (
                                <option key={product.id} value={product.id}>
                                    {product.name} - Giá gốc: {formatCurrency(product.price || product.price_buy)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Thông tin Giá */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Giá Gốc (Tham khảo)</label>
                            <div className="text-lg font-bold text-slate-700">
                                {formatCurrency(getOriginalPrice())}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="price_sale" className="block text-sm font-bold text-slate-700 mb-1">
                                Giá Khuyến Mãi (VNĐ) <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    id="price_sale"
                                    name="price_sale"
                                    value={formData.price_sale}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none font-bold text-amber-600"
                                />
                                {discountPercent > 0 && (
                                    <span className="absolute right-3 top-3 bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">
                                        Giảm {discountPercent}%
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-400 mt-1">Nhập giá bán cuối cùng sau khi giảm.</p>
                        </div>
                    </div>
                    
                    {/* Thời gian */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="date_begin" className="block text-sm font-bold text-slate-700 mb-2">Ngày Bắt đầu <span className="text-red-500">*</span></label>
                            <input type="date" id="date_begin" name="date_begin" value={formData.date_begin} onChange={handleChange} required className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none" />
                        </div>
                        <div>
                            <label htmlFor="date_end" className="block text-sm font-bold text-slate-700 mb-2">Ngày Kết thúc <span className="text-red-500">*</span></label>
                            <input type="date" id="date_end" name="date_end" value={formData.date_end} onChange={handleChange} required className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none" />
                        </div>
                    </div>

                    {/* Mô tả */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">Ghi chú / Mô tả</label>
                        <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows="3" className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none"></textarea>
                    </div>

                    {/* Button */}
                    <div className="pt-4 flex justify-end gap-3">
                        <Link href="/admin/product-sales">
                            <button type="button" className="px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-all">Hủy bỏ</button>
                        </Link>
                        <button type="submit" disabled={isSaving} className="px-8 py-3 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-700 shadow-lg shadow-amber-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2">
                            {isSaving ? <><i className="fa-solid fa-spinner fa-spin"></i> Đang lưu...</> : <><i className="fa-solid fa-save"></i> Cập nhật</>}
                        </button>
                    </div>
                </form>
            </div>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        </div>
    );
}
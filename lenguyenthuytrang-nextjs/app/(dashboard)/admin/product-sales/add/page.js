"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminProductSaleService from '@/services/AdminProductSaleService';
import AdminProductService from '@/services/AdminProductService';

// --- CONFIG ---
const BACKEND_DOMAIN = 'http://localhost:8000'; 

// --- HELPER XỬ LÝ ẢNH ---
const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${BACKEND_DOMAIN}/storage/${cleanPath}`;
};

// --- HELPER FORMAT TIỀN ---
const formatCurrency = (amount) => {
    const num = Number(amount);
    if (isNaN(num)) return '0 đ';
    return num.toLocaleString('vi-VN') + ' đ';
};

export default function AddPromotionPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    
    // State danh sách sản phẩm
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // State Form (Đã thêm trường name)
    const [formData, setFormData] = useState({
        name: '',           // <--- THÊM MỚI: Tên chương trình
        product_id: '',
        date_begin: '',
        date_end: '',
        discount_type: 'percent', 
        discount_value: '',       
        final_price: 0            
    });

    // 1. Fetch danh sách sản phẩm
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await AdminProductService.getAll({ limit: 100 });
                const list = res.data.data?.data || res.data.data || [];
                setProducts(list);
            } catch (error) {
                console.error("Lỗi tải sản phẩm:", error);
            }
        };
        fetchProducts();
    }, []);

    // 2. Xử lý khi chọn sản phẩm
    const handleProductChange = (e) => {
        const pId = e.target.value;
        const product = products.find(p => String(p.id) === String(pId));
        setSelectedProduct(product);
        
        let rawPrice = 0;
        if (product) {
            rawPrice = product.price_buy || product.price || product.price_root || 0;
        }

        const originalPrice = Number(rawPrice);

        setFormData(prev => ({
            ...prev,
            product_id: pId,
            discount_value: '', 
            final_price: originalPrice 
        }));
    };

    // 3. Logic Tính toán Giá
    const calculatePrice = (type, value, originalPrice) => {
        const price = Number(originalPrice) || 0;
        if (price === 0) return 0;

        let final = 0;
        let val = Number(value) || 0;

        if (type === 'percent') {
            if (val > 100) val = 100;
            final = price * (1 - val / 100);
        } else {
            final = price - val;
        }
        return Math.max(0, final); 
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            
            if (name === 'discount_type' || name === 'discount_value') {
                if (selectedProduct) {
                    const rawPrice = selectedProduct.price_buy || selectedProduct.price || selectedProduct.price_root || 0;
                    
                    newData.final_price = calculatePrice(
                        name === 'discount_type' ? value : prev.discount_type, 
                        name === 'discount_value' ? value : prev.discount_value, 
                        Number(rawPrice)
                    );
                }
            }
            return newData;
        });
    };

    // 4. Submit Form
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const rawPrice = selectedProduct ? (selectedProduct.price_buy || selectedProduct.price || selectedProduct.price_root || 0) : 0;
        const originalPrice = Number(rawPrice);

        if (Number(formData.final_price) >= originalPrice && Number(formData.discount_value) > 0) {
            alert("Giá sau khuyến mãi phải nhỏ hơn giá gốc!");
            setIsLoading(false);
            return;
        }

        try {
            // Chuẩn bị dữ liệu gửi đi (Đã bao gồm name)
            const dataToSend = {
                name: formData.name, // <--- GỬI TÊN LÊN SERVER
                product_id: formData.product_id,
                price_sale: formData.final_price,
                date_begin: formData.date_begin,
                date_end: formData.date_end,
            };

            await AdminProductSaleService.create(dataToSend);
            alert("Thêm chương trình khuyến mãi thành công!");
            router.push('/admin/product-sales'); 

        } catch (err) {
            console.error("Lỗi submit:", err);
            const msg = err.response?.data?.message || "Có lỗi xảy ra";
            alert(`Lỗi: ${msg}`);
        } finally {
            setIsLoading(false);
        }
    };

    const getProductPrice = (product) => {
        if (!product) return 0;
        return Number(product.price_buy || product.price || product.price_root || 0);
    };

    return (
        <main className="min-h-screen p-4 md:p-8 bg-slate-50">
            <div className="max-w-5xl mx-auto">
                
                {/* --- HEADER --- */}
                <div className="flex justify-between items-center mb-6 border-b border-slate-300 pb-4">
                    <h1 className="text-3xl font-bold text-slate-800">
                        <i className="fa-solid fa-percent mr-3 text-amber-600"></i>
                        Tạo Chương Trình Giảm Giá
                    </h1>
                    <Link href="/admin/product-sales" className="text-slate-600 hover:text-slate-900 flex items-center gap-2 transition-colors">
                        <i className="fa-solid fa-arrow-left"></i> Quay lại
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* CỘT TRÁI: Form Nhập liệu */}
                    <div className="lg:col-span-2 space-y-6">
                        <form id="promo-form" onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6">
                            
                            {/* 0. Tên chương trình (MỚI THÊM) */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Tên chương trình <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Ví dụ: Sale tết, Giảm giá mùa hè..."
                                    className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                                />
                            </div>

                            {/* 1. Chọn Sản phẩm */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Chọn Sản phẩm <span className="text-red-500">*</span></label>
                                <select
                                    name="product_id"
                                    value={formData.product_id}
                                    onChange={handleProductChange}
                                    required
                                    className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition-all bg-slate-50"
                                >
                                    <option value="">-- Vui lòng chọn sản phẩm --</option>
                                    {products.map(product => (
                                        <option key={product.id} value={product.id}>
                                            {product.name} - Giá: {formatCurrency(getProductPrice(product))}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* 2. Thiết lập Giảm giá */}
                            <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                                <h3 className="font-bold text-amber-800 mb-4 flex items-center gap-2">
                                    <i className="fa-solid fa-calculator"></i> Thiết lập giá
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Loại giảm giá */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Loại giảm giá</label>
                                        <select
                                            name="discount_type"
                                            value={formData.discount_type}
                                            onChange={handleChange}
                                            className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-amber-500 outline-none"
                                        >
                                            <option value="percent">Theo Phần trăm (%)</option>
                                            <option value="amount">Theo Số tiền (VNĐ)</option>
                                        </select>
                                    </div>

                                    {/* Giá trị giảm */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                                            {formData.discount_type === 'percent' ? 'Nhập % giảm' : 'Nhập số tiền giảm'}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                name="discount_value"
                                                value={formData.discount_value}
                                                onChange={handleChange}
                                                required
                                                min="0"
                                                disabled={!selectedProduct}
                                                placeholder="0"
                                                className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-amber-500 outline-none font-bold text-slate-700 pl-4 pr-10"
                                            />
                                            <span className="absolute right-3 top-2.5 text-slate-400 font-bold">
                                                {formData.discount_type === 'percent' ? '%' : 'đ'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 3. Thời gian áp dụng */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Ngày Bắt đầu <span className="text-red-500">*</span></label>
                                    <input
                                        type="date"
                                        name="date_begin"
                                        value={formData.date_begin}
                                        onChange={handleChange}
                                        required
                                        className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Ngày Kết thúc <span className="text-red-500">*</span></label>
                                    <input
                                        type="date"
                                        name="date_end"
                                        value={formData.date_end}
                                        onChange={handleChange}
                                        required
                                        className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || !selectedProduct}
                                className="w-full bg-amber-600 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-amber-700 transition-all shadow-lg shadow-amber-200 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                            >
                                {isLoading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-check"></i>}
                                Lưu Khuyến Mãi
                            </button>
                        </form>
                    </div>

                    {/* CỘT PHẢI: Preview Sản phẩm */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 sticky top-6">
                            <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Xem trước Sản phẩm</h3>
                            
                            {selectedProduct ? (
                                <div className="space-y-4">
                                    {/* Ảnh sản phẩm */}
                                    <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center relative">
                                        {selectedProduct.thumbnail ? (
                                            <img 
                                                src={getImageUrl(selectedProduct.thumbnail)} 
                                                alt={selectedProduct.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => { 
                                                    e.target.onerror = null; 
                                                    e.target.src = "https://placehold.co/400x400?text=No+Image"; 
                                                }}
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center text-slate-400">
                                                <i className="fa-solid fa-image text-4xl mb-2"></i>
                                                <span className="text-sm">Chưa có ảnh</span>
                                            </div>
                                        )}
                                        
                                        {/* Badge % Giảm */}
                                        {formData.discount_type === 'percent' && formData.discount_value > 0 && (
                                            <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow-md">
                                                -{formData.discount_value}%
                                            </div>
                                        )}
                                    </div>

                                    {/* Tên & Giá */}
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-lg leading-tight mb-1">{selectedProduct.name}</h4>
                                        <p className="text-sm text-slate-500">Mã SP: #{selectedProduct.id}</p>
                                    </div>

                                    {/* So sánh Giá */}
                                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500">Giá gốc:</span>
                                            <span className="font-medium text-slate-700 line-through">
                                                {formatCurrency(getProductPrice(selectedProduct))}
                                            </span>
                                        </div>
                                        
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500">Mức giảm:</span>
                                            <span className="font-medium text-green-600">
                                                {formData.discount_type === 'percent' 
                                                    ? `${formData.discount_value || 0}%` 
                                                    : formatCurrency(formData.discount_value || 0)
                                                }
                                            </span>
                                        </div>

                                        <div className="border-t border-slate-200 my-2 pt-2 flex justify-between items-center">
                                            <span className="font-bold text-slate-700">Giá bán sau KM:</span>
                                            <span className="font-bold text-xl text-red-600">
                                                {formatCurrency(formData.final_price)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-10 text-slate-400">
                                    <i className="fa-solid fa-box-open text-5xl mb-3 opacity-50"></i>
                                    <p>Vui lòng chọn sản phẩm để xem trước giá.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        </main>
    );
}
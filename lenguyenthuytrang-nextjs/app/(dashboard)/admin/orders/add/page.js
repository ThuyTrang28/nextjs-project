"use client";

import React, { useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import Head from 'next/head'; 

// --- DỮ LIỆU MOCK VÀ TÙY CHỌN ---
const mockCustomers = [
    { id: 1, name: 'Nguyễn Văn A', email: 'vana@example.com' },
    { id: 2, name: 'Trần Thị B', email: 'thib@example.com' },
    { id: 3, name: 'Lê Hoàng C', email: 'hoangc@example.com' },
];

const mockProducts = [
    { id: 201, name: 'Kem chống nắng SPF50+', price: 250000, stock: 100 },
    { id: 202, name: 'Son môi Matt Queen (Đỏ)', price: 350000, stock: 50 },
    { id: 203, name: 'Nước hoa Unisex 50ml', price: 950000, stock: 30 },
    { id: 204, name: 'Cọ tán phấn lớn', price: 120000, stock: 200 },
];

const mockPaymentMethods = ['COD (Thanh toán khi nhận hàng)', 'Chuyển khoản Ngân hàng', 'Thẻ tín dụng/ghi nợ'];

// --- COMPONENT CHÍNH ---
export default function AddOrderPage() {
    // State của form
    const [formData, setFormData] = useState({
        customerId: '',
        shippingAddress: '',
        paymentMethod: mockPaymentMethods[0],
        orderNotes: '',
        items: [{ productId: mockProducts[0].id, quantity: 1, price: mockProducts[0].price }],
    });
    const [submitting, setSubmitting] = useState(false);

    // --- LOGIC XỬ LÝ FORM ---

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleItemChange = useCallback((index, field, value) => {
        const newItems = [...formData.items];
        let item = { ...newItems[index] };

        if (field === 'productId') {
            const product = mockProducts.find(p => p.id === Number(value));
            if (product) {
                item.productId = Number(value);
                item.price = product.price; 
            }
        } else if (field === 'quantity') {
            item.quantity = Math.max(1, Number(value));
        }

        newItems[index] = item;
        setFormData(prev => ({ ...prev, items: newItems }));
    }, [formData.items]);

    const handleAddItem = useCallback(() => {
        const defaultProduct = mockProducts[0];
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { 
                productId: defaultProduct.id, 
                quantity: 1, 
                price: defaultProduct.price 
            }]
        }));
    }, []);

    const handleRemoveItem = useCallback((index) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    }, []);

    // Tính toán Tổng tiền đơn hàng
    const totalAmount = useMemo(() => {
        return formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }, [formData.items]);

    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        setSubmitting(true);
        console.log("Đang gửi đơn hàng:", formData, "Tổng tiền:", totalAmount);

        // Giả lập API call
        setTimeout(() => {
            setSubmitting(false);
            alert(`Đã tạo đơn hàng thành công! Tổng cộng: ${totalAmount.toLocaleString('vi-VN')} VND`);
            // Reset form hoặc chuyển hướng sau khi submit thành công
            // setFormData({ ...initial state... }); 
        }, 1500);
    }, [formData, totalAmount]);

    // --- CÁC HÀM TIỆN ÍCH HIỂN THỊ ---
    const formatCurrency = (amount) => {
        return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    };

    const getProductPrice = (productId) => {
        const product = mockProducts.find(p => p.id === Number(productId));
        return product ? product.price : 0;
    }

    // --- GIAO DIỆN ---
    return (
        <>
            <Head>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
            </Head>

            <main className="min-h-screen p-4 md:p-8 bg-slate-50">
                <div className="max-w-6xl mx-auto">

                    {/* --- 1. HEADER và Breadcrumb --- */}
                    <div className="mb-6 flex justify-between items-center border-b pb-4 border-slate-200">
                        <h1 className="text-3xl font-bold text-slate-800 flex items-center">
                            <i className="fa-solid fa-cart-plus mr-3 text-amber-600"></i>
                            Thêm Đơn Đặt Hàng Mới
                        </h1>
                        <Link href="/admin/orders" passHref>
                            <button className="text-slate-600 hover:text-amber-700 transition-colors flex items-center gap-1">
                                <i className="fa-solid fa-arrow-left"></i>
                                Quay lại Danh sách
                            </button>
                        </Link>
                    </div>
                    
                    {/* --- 2. FORM TẠO ĐƠN HÀNG --- */}
                    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg border border-slate-100 space-y-8">
                        
                        {/* --- PHẦN 1: THÔNG TIN KHÁCH HÀNG & GIAO HÀNG --- */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Khách hàng */}
                            <div>
                                <label htmlFor="customerId" className="block text-sm font-medium text-slate-700 mb-1">
                                    <i className="fa-solid fa-user-tag mr-2 text-blue-500"></i>
                                    Chọn Khách hàng *
                                </label>
                                <select
                                    id="customerId"
                                    name="customerId"
                                    required
                                    value={formData.customerId}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 transition-shadow"
                                >
                                    <option value="" disabled>-- Chọn khách hàng --</option>
                                    {mockCustomers.map(customer => (
                                        <option key={customer.id} value={customer.id}>
                                            {customer.name} ({customer.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Phương thức thanh toán */}
                            <div>
                                <label htmlFor="paymentMethod" className="block text-sm font-medium text-slate-700 mb-1">
                                    <i className="fa-solid fa-credit-card mr-2 text-green-500"></i>
                                    Phương thức Thanh toán *
                                </label>
                                <select
                                    id="paymentMethod"
                                    name="paymentMethod"
                                    required
                                    value={formData.paymentMethod}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 transition-shadow"
                                >
                                    {mockPaymentMethods.map(method => (
                                        <option key={method} value={method}>{method}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Địa chỉ giao hàng */}
                            <div className="md:col-span-2">
                                <label htmlFor="shippingAddress" className="block text-sm font-medium text-slate-700 mb-1">
                                    <i className="fa-solid fa-location-dot mr-2 text-red-500"></i>
                                    Địa chỉ Giao hàng *
                                </label>
                                <textarea
                                    id="shippingAddress"
                                    name="shippingAddress"
                                    rows="2"
                                    required
                                    placeholder="Nhập địa chỉ chi tiết"
                                    value={formData.shippingAddress}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 transition-shadow"
                                ></textarea>
                            </div>
                        </div>

                        <hr className="border-slate-200" />
                        
                        {/* --- PHẦN 2: CHI TIẾT SẢN PHẨM (Order Items) --- */}
                        <div>
                            <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                                <i className="fa-solid fa-list-check mr-2 text-amber-600"></i>
                                Chi tiết Sản phẩm
                            </h2>
                            
                            <div className="space-y-4">
                                {formData.items.map((item, index) => (
                                    <div key={index} className="flex flex-col sm:flex-row gap-4 p-4 border border-slate-200 rounded-lg bg-slate-50 relative">
                                        
                                        {/* Sản phẩm */}
                                        <div className="flex-1">
                                            <label htmlFor={`product-${index}`} className="block text-xs font-medium text-slate-500 mb-1">Sản phẩm</label>
                                            <select
                                                id={`product-${index}`}
                                                value={item.productId}
                                                onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                                                required
                                                className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-amber-500 focus:border-amber-500"
                                            >
                                                {mockProducts.map(product => (
                                                    <option key={product.id} value={product.id}>
                                                        {product.name} ({formatCurrency(product.price)})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Số lượng */}
                                        <div className="w-full sm:w-24">
                                            <label htmlFor={`quantity-${index}`} className="block text-xs font-medium text-slate-500 mb-1">Số lượng</label>
                                            <input
                                                id={`quantity-${index}`}
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                required
                                                className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-amber-500 focus:border-amber-500"
                                            />
                                        </div>

                                        {/* Giá/đơn vị (Hiển thị) */}
                                        <div className="w-full sm:w-36">
                                            <label className="block text-xs font-medium text-slate-500 mb-1">Giá đơn vị</label>
                                            <p className="p-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 font-medium">
                                                {formatCurrency(getProductPrice(item.productId))}
                                            </p>
                                        </div>

                                        {/* Tổng tiền tạm thời */}
                                        <div className="w-full sm:w-36">
                                            <label className="block text-xs font-medium text-slate-500 mb-1">Tổng cộng</label>
                                            <p className="p-2 bg-amber-100 border border-amber-300 rounded-lg text-sm text-amber-800 font-bold">
                                                {formatCurrency(item.price * item.quantity)}
                                            </p>
                                        </div>

                                        {/* Nút Xóa */}
                                        {formData.items.length > 1 && (
                                            <button 
                                                type="button" 
                                                onClick={() => handleRemoveItem(index)}
                                                className="absolute -top-2.5 -right-2.5 bg-red-500 text-white w-6 h-6 rounded-full text-xs hover:bg-red-600 transition-colors shadow-md"
                                                title="Xóa sản phẩm này"
                                            >
                                                <i className="fa-solid fa-times"></i>
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <button 
                                type="button" 
                                onClick={handleAddItem}
                                className="mt-4 px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2"
                            >
                                <i className="fa-solid fa-plus-circle"></i>
                                Thêm Sản phẩm
                            </button>
                        </div>
                        
                        <hr className="border-slate-200" />

                        {/* --- PHẦN 3: GHI CHÚ VÀ TỔNG KẾT --- */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            
                            {/* Ghi chú */}
                            <div className="md:col-span-2">
                                <label htmlFor="orderNotes" className="block text-sm font-medium text-slate-700 mb-1">
                                    <i className="fa-solid fa-clipboard-list mr-2 text-purple-500"></i>
                                    Ghi chú Đơn hàng
                                </label>
                                <textarea
                                    id="orderNotes"
                                    name="orderNotes"
                                    rows="3"
                                    placeholder="Các yêu cầu đặc biệt hoặc ghi chú nội bộ..."
                                    value={formData.orderNotes}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 transition-shadow"
                                ></textarea>
                            </div>

                            {/* Tổng tiền */}
                            <div className="md:col-span-1 p-4 bg-amber-50 rounded-lg shadow-inner flex flex-col justify-center">
                                <p className="text-lg font-semibold text-slate-700">TỔNG GIÁ TRỊ ĐƠN HÀNG:</p>
                                <p className="text-3xl font-extrabold text-amber-700 mt-1">
                                    {formatCurrency(totalAmount)}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">(Chưa bao gồm phí vận chuyển)</p>
                            </div>
                        </div>

                        {/* --- PHẦN 4: NÚT GỬI --- */}
                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={submitting || formData.items.length === 0 || !formData.customerId}
                                className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center gap-2 shadow-md shadow-green-200 disabled:bg-slate-400 disabled:cursor-not-allowed"
                            >
                                {submitting ? (
                                    <>
                                        <i className="fa-solid fa-spinner fa-spin"></i>
                                        Đang tạo...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-solid fa-save"></i>
                                        Lưu & Tạo Đơn Hàng
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
                </div>
            </main>
        </>
    );
}
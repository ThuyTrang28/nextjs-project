"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminProductService from '@/services/AdminProductService';
import AdminCategoryService from '@/services/AdminCategoryService';
import AdminAttributeService from '@/services/AdminAttributeService'; // [MỚI] Import

export default function AddProductPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // Dữ liệu API
    const [categories, setCategories] = useState([]);
    const [attributesList, setAttributesList] = useState([]); // [MỚI] List attribute từ API

    const [formData, setFormData] = useState({
        name: '',
        category_id: '',
        price: 0,
        // discount: 0, // Bỏ comment nếu backend hỗ trợ
        stock: 1,
        shortDescription: '',
        content: '',
        isActive: true,
    });

    // [MỚI] State quản lý thuộc tính sản phẩm
    // Cấu trúc: [{ attribute_id: 1, value: "Đỏ" }]
    const [productAttributes, setProductAttributes] = useState([]);

    // State ảnh
    const [productImage, setProductImage] = useState(null);
    const [productImageFile, setProductImageFile] = useState(null);

    // 1. Fetch Data (Category & Attribute)
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Gọi song song 2 API
                // Ví dụ trong AdminCategoryService.js hoặc trực tiếp trong useEffect
                const [catRes, attrRes] = await Promise.all([
                    AdminCategoryService.getAll({ limit: 'all' }), // Gửi tham số limit là 'all'
                    AdminAttributeService.getAll({ limit: 'all' })
                ]);

                // Cập nhật lại state categories
                setCategories(catRes.data.data || []);

                // Set Categories
                const catList = catRes.data.data || catRes.data || [];
                setCategories(catList);
                if (catList.length > 0) {
                    setFormData(prev => ({ ...prev, category_id: catList[0].id }));
                }

                // [MỚI] Set Attributes List
                const attrList = attrRes.data.data || attrRes.data || [];
                setAttributesList(attrList);

            } catch (error) {
                console.error("Lỗi tải dữ liệu:", error);
            }
        };
        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // [MỚI] --- Logic Attribute Động ---
    const handleAddAttribute = () => {
        setProductAttributes([...productAttributes, { attribute_id: "", value: "" }]);
    };

    const handleRemoveAttribute = (index) => {
        const newAttrs = [...productAttributes];
        newAttrs.splice(index, 1);
        setProductAttributes(newAttrs);
    };

    const handleAttributeChange = (index, field, value) => {
        const newAttrs = [...productAttributes];
        newAttrs[index][field] = value;
        setProductAttributes(newAttrs);
    };

    // --- Logic Ảnh ---
    const handleImageUpload = (e) => {
        const file = e.target.files ? e.target.files[0] : null;
        if (file) {
            setProductImageFile(file);
            setProductImage(URL.createObjectURL(file));
        }
    };

    // --- Submit Form ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const data = new FormData();

            // 1. Dữ liệu cơ bản
            data.append('name', formData.name);
            data.append('category_id', formData.category_id);
            data.append('price_buy', formData.price);
            data.append('qty', formData.stock);
            data.append('status', formData.isActive ? 1 : 2);
            data.append('description', formData.shortDescription);
            data.append('content', formData.content);

            // [MỚI] 2. Xử lý Attributes (Gửi dạng mảng)
            // Lọc bỏ dòng trống
            const validAttributes = productAttributes.filter(a => a.attribute_id && a.value);

            validAttributes.forEach((attr, index) => {
                data.append(`attributes[${index}][attribute_id]`, attr.attribute_id);
                data.append(`attributes[${index}][value]`, attr.value);
            });

            // 3. Ảnh
            if (productImageFile) {
                data.append('thumbnail', productImageFile);
            } else {
                alert("Vui lòng chọn ảnh đại diện!");
                setIsLoading(false);
                return;
            }

            const res = await AdminProductService.create(data);

            if (res.data && res.data.status) {
                alert("Thêm sản phẩm thành công!");
                router.push('/admin/product');
            } else {
                alert(res.data?.message || "Thêm sản phẩm thất bại");
            }

        } catch (err) {
            console.error("Lỗi:", err);
            const msg = err.response?.data?.message || err.message;
            alert("Lỗi: " + msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-800">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-slate-200 pb-6">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-3">
                            <span className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                                <i className="fa-solid fa-plus"></i>
                            </span>
                            Thêm sản phẩm mới
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">Quản lý kho hàng và thông tin hiển thị</p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/admin/product" className="px-5 py-2.5 rounded-xl border border-slate-200 font-medium hover:bg-white transition-all text-slate-600">
                            Hủy bỏ
                        </Link>
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="px-5 py-2.5 rounded-xl bg-amber-600 text-white font-medium hover:bg-amber-700 shadow-lg shadow-amber-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Đang xử lý...' : 'Lưu sản phẩm'}
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* CỘT TRÁI */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* 1. Thông tin cơ bản */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5">
                            <h3 className="font-semibold flex items-center gap-2 text-slate-700">
                                <i className="fa-solid fa-circle-info text-amber-500"></i> Thông tin cơ bản
                            </h3>
                            <div>
                                <label className="block text-sm font-medium mb-2">Tên sản phẩm *</label>
                                <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-200 outline-none" placeholder="Ví dụ: Kem dưỡng phục hồi B5..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Danh mục *</label>
                                <select name="category_id" value={formData.category_id} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none" required>
                                    <option value="">-- Chọn danh mục --</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* 2. Nội dung */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5">
                            <h3 className="font-semibold flex items-center gap-2 text-slate-700">
                                <i className="fa-solid fa-pen-nib text-amber-500"></i> Nội dung
                            </h3>
                            <div>
                                <label className="block text-sm font-medium mb-2">Mô tả ngắn</label>
                                <textarea name="shortDescription" rows="3" value={formData.shortDescription} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none resize-none"></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Chi tiết sản phẩm</label>
                                <textarea name="content" rows="8" value={formData.content} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none"></textarea>
                            </div>
                        </div>

                        {/* [MỚI] 3. Thuộc tính (Attribute) */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5">
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold flex items-center gap-2 text-slate-700">
                                    <i className="fa-solid fa-tags text-amber-500"></i> Thuộc tính sản phẩm
                                </h3>
                                <button type="button" onClick={handleAddAttribute} className="text-sm text-amber-600 font-bold hover:underline">
                                    + Thêm thuộc tính
                                </button>
                            </div>

                            {/* Khu vực hiển thị danh sách input */}
                            <div className="space-y-3">
                                {productAttributes.length === 0 && (
                                    <p className="text-sm text-slate-400 italic text-center py-4 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                        Chưa có thuộc tính nào. Nhấn "Thêm thuộc tính" để bắt đầu.
                                    </p>
                                )}

                                {productAttributes.map((attr, index) => (
                                    <div key={index} className="flex gap-3 items-center animate-in fade-in slide-in-from-top-1 duration-200">
                                        {/* Dropdown chọn Tên Attribute (Lấy từ API) */}
                                        <select
                                            value={attr.attribute_id}
                                            onChange={(e) => handleAttributeChange(index, 'attribute_id', e.target.value)}
                                            className="w-1/3 px-3 py-2.5 rounded-lg border border-slate-200 outline-none text-sm focus:border-amber-400 bg-white"
                                        >
                                            <option value="">-- Chọn thuộc tính --</option>
                                            {attributesList.map(a => (
                                                <option key={a.id} value={a.id}>{a.name}</option>
                                            ))}
                                        </select>

                                        {/* Input nhập giá trị */}
                                        <input
                                            type="text"
                                            value={attr.value}
                                            onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                                            placeholder="Giá trị (VD: Đỏ, XL, 50ml...)"
                                            className="flex-1 px-3 py-2.5 rounded-lg border border-slate-200 outline-none text-sm focus:border-amber-400"
                                        />

                                        {/* Nút xóa dòng */}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveAttribute(index)}
                                            className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                            title="Xóa dòng này"
                                        >
                                            <i className="fa-solid fa-trash-can"></i>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* CỘT PHẢI */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h3 className="font-semibold mb-4 text-slate-700">Ảnh đại diện</h3>
                            <div className="relative aspect-square bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden hover:border-amber-400 transition-colors group">
                                {productImage ? (
                                    <>
                                        <img src={productImage} alt="Preview" className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => { setProductImage(null); setProductImageFile(null); }} className="absolute top-3 right-3 bg-white text-red-500 w-8 h-8 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <i className="fa-solid fa-trash-can"></i>
                                        </button>
                                    </>
                                ) : (
                                    <label className="cursor-pointer text-center p-4 w-full h-full flex flex-col justify-center items-center">
                                        <i className="fa-solid fa-cloud-arrow-up text-3xl text-slate-300 mb-2"></i>
                                        <span className="block text-xs text-slate-400 mt-2">Tải ảnh lên</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                    </label>
                                )}
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                            <h3 className="font-semibold text-slate-700">Giá & Kho</h3>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500">Giá nhập (VNĐ)</span>
                                <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-28 text-right font-bold outline-none border-b border-slate-200 focus:border-amber-500" />
                            </div>
                            {/* Nếu muốn thêm Discount thì bỏ comment ở đây */}
                            {/* <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500">Giảm giá (%)</span>
                                <input type="number" name="discount" value={formData.discount} onChange={handleChange} className="w-28 text-right font-bold outline-none border-b border-slate-200 focus:border-amber-500" />
                            </div> */}
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500">Tồn kho</span>
                                <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-28 text-right font-bold outline-none border-b border-slate-200 focus:border-amber-500" />
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center">
                            <span className="font-medium text-slate-700 text-sm">Hiển thị</span>
                            <button type="button" onClick={() => setFormData(p => ({ ...p, isActive: !p.isActive }))} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.isActive ? 'bg-green-500' : 'bg-slate-300'}`}>
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    </div>

                </form>
            </div>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        </main>
    );
}
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import Head from 'next/head';
import AdminProductService from '@/services/AdminProductService';
import AdminCategoryService from '@/services/AdminCategoryService';

// Cấu hình domain backend (Khớp với .env Laravel)
const BACKEND_DOMAIN = 'http://localhost:8000';

// Helper lấy link ảnh
const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    // Xử lý path tương đối: bỏ dấu / ở đầu nếu có
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${BACKEND_DOMAIN}/storage/${cleanPath}`;
};

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const productId = params.id;

    // State dữ liệu
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        category_id: '',
        price: 0, // Frontend dùng 'price' để hiển thị, khi gửi đi sẽ map thành 'price_buy'
        stock: 0,
        shortDescription: '',
        content: '',
        isActive: true,
    });

    // State hình ảnh
    const [previewImage, setPreviewImage] = useState(null);
    const [newImageFile, setNewImageFile] = useState(null);

    // State trạng thái UI
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // 1. Fetch Dữ liệu (Chạy 1 lần khi load trang)
    useEffect(() => {
        const fetchData = async () => {
            if (!productId) return;
            setIsLoading(true);
            try {
                // 1. Gọi song song và truyền thêm { limit: 'all' }
                const [catRes, prodRes] = await Promise.all([
                    AdminCategoryService.getAll({ limit: 'all' }),
                    AdminProductService.getById(productId)
                ]);

                // 2. Xử lý Danh mục: Bóc tách linh hoạt từ Pagination hoặc Array phẳng
                const rawCatData = catRes.data.data || catRes.data;
                const catList = rawCatData.data ? rawCatData.data : rawCatData;
                setCategories(Array.isArray(catList) ? catList : []);

                // 3. Xử lý Sản phẩm
                const product = prodRes.data.data || prodRes.data;

                if (product) {
                    // Lấy tồn kho từ quan hệ 'store' hoặc thuộc tính 'qty' trực tiếp
                    const currentStock = product.store ? product.store.qty : (product.qty || 0);

                    setFormData({
                        name: product.name || '',
                        category_id: product.category_id || '',
                        price: product.price_buy || 0,
                        stock: currentStock,
                        shortDescription: product.description || '',
                        content: product.content || '',
                        isActive: product.status === 1,
                    });

                    // Cập nhật ảnh preview từ thumbnail có sẵn
                    if (product.thumbnail) {
                        setPreviewImage(getImageUrl(product.thumbnail));
                    }
                }
            } catch (error) {
                console.error("Lỗi tải dữ liệu:", error);
                alert("Không thể tải thông tin sản phẩm. Vui lòng kiểm tra kết nối.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [productId]); // Dependency productId là chính xác

    // --- Handle Change Input Text ---
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // --- Handle Upload Ảnh ---
    const handleImageUpload = (e) => {
        const file = e.target.files ? e.target.files[0] : null;
        if (file) {
            setNewImageFile(file); // Lưu file để gửi lên server
            setPreviewImage(URL.createObjectURL(file)); // Preview ngay lập tức
        }
    };

    // --- Handle Submit (Cập nhật) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const data = new FormData();

            // Map dữ liệu vào FormData để gửi lên Server
            data.append('name', formData.name);
            data.append('category_id', formData.category_id);

            // LƯU Ý: Backend Controller validate 'price_buy', nên phải gửi key này
            data.append('price_buy', formData.price);

            // Gửi qty để controller cập nhật vào bảng store (nếu có logic update store)
            data.append('qty', formData.stock);

            data.append('status', formData.isActive ? 1 : 2);
            data.append('description', formData.shortDescription);
            data.append('content', formData.content);

            // Chỉ gửi ảnh nếu người dùng chọn ảnh mới
            if (newImageFile) {
                data.append('thumbnail', newImageFile);
            }

            // Lưu ý: Service của bạn đã tự động thêm params: { _method: 'PUT' } 
            // nên ở đây chỉ cần gọi hàm update
            const res = await AdminProductService.update(productId, data);

            if (res.data && res.data.status) {
                alert("Cập nhật sản phẩm thành công!");
                router.push('/admin/product');
            } else {
                alert(res.data?.message || "Cập nhật thất bại.");
            }

        } catch (err) {
            console.error("Lỗi cập nhật:", err);
            const msg = err.response?.data?.message || "Có lỗi xảy ra.";
            alert(`Lỗi: ${msg}`);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen p-8 flex items-center justify-center bg-slate-50">
                <div className="text-xl text-slate-600 flex flex-col items-center">
                    <i className="fa-solid fa-circle-notch fa-spin text-4xl text-amber-500 mb-4"></i>
                    Đang tải dữ liệu...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-8 bg-slate-50/50">
            <Head><title>Chỉnh sửa sản phẩm</title></Head>
            <div className="max-w-6xl mx-auto">

                {/* HEADER */}
                <div className="flex justify-between items-center mb-8 border-b border-slate-200 pb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                            <span className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                <i className="fa-solid fa-pen-to-square"></i>
                            </span>
                            Chỉnh Sửa Sản Phẩm
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">ID: #{productId}</p>
                    </div>
                    <Link href="/admin/product" className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium hover:bg-slate-50 transition-all text-slate-600 flex items-center gap-2">
                        <i className="fa-solid fa-arrow-left"></i> Quay lại
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* CỘT TRÁI: Nội dung */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Thông tin cơ bản */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5">
                            <h3 className="font-semibold flex items-center gap-2 text-slate-700">
                                <i className="fa-solid fa-circle-info text-blue-500"></i> Thông tin cơ bản
                            </h3>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Tên Sản phẩm <span className="text-red-500">*</span></label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-200 outline-none" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Danh mục <span className="text-red-500">*</span></label>
                                <select name="category_id" value={formData.category_id} onChange={handleChange} required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none">
                                    <option value="">-- Chọn danh mục --</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Mô tả */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5">
                            <h3 className="font-semibold flex items-center gap-2 text-slate-700">
                                <i className="fa-solid fa-pen-nib text-blue-500"></i> Nội dung
                            </h3>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả Ngắn</label>
                                <textarea name="shortDescription" rows="3" value={formData.shortDescription} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-200 outline-none resize-none"></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Chi tiết</label>
                                <textarea name="content" rows="8" value={formData.content} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-200 outline-none"></textarea>
                            </div>
                        </div>
                    </div>

                    {/* CỘT PHẢI: Settings */}
                    <div className="space-y-6">
                        {/* Ảnh */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h3 className="font-semibold mb-4 text-slate-700">Ảnh đại diện</h3>
                            <div className="relative aspect-square bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden hover:border-blue-400 transition-colors group">
                                {previewImage ? (
                                    <>
                                        <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                                        <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                            <i className="fa-solid fa-pen text-2xl mb-2"></i>
                                            <span className="text-sm font-medium">Thay đổi ảnh</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                        </label>
                                    </>
                                ) : (
                                    <label className="cursor-pointer text-center p-4 w-full h-full flex flex-col justify-center items-center">
                                        <i className="fa-solid fa-cloud-arrow-up text-3xl text-slate-300 mb-2"></i>
                                        <span className="block text-xs text-slate-400 font-medium">Tải ảnh lên</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* Giá & Kho */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                            <h3 className="font-semibold text-slate-700">Giá & Kho</h3>

                            <div className="flex justify-between items-center">
                                <label className="text-sm text-slate-500">Giá bán (VNĐ)</label>
                                <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-32 text-right font-bold outline-none border-b border-slate-200 focus:border-blue-500 py-1" />
                            </div>

                            <div className="flex justify-between items-center">
                                <label className="text-sm text-slate-500">Tồn kho</label>
                                <input
                                    type="number"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    className="w-32 text-right font-bold outline-none border-b border-slate-200 focus:border-blue-500 py-1"
                                // Có thể thêm disabled nếu bạn muốn quản lý kho riêng
                                />
                            </div>
                            <p className="text-xs text-slate-400 italic text-right">* Cập nhật tồn kho sẽ ảnh hưởng đến kho hàng</p>
                        </div>

                        {/* Trạng thái */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-slate-700 text-sm">Hiển thị trên web</span>
                                <button type="button" onClick={() => setFormData(p => ({ ...p, isActive: !p.isActive }))} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.isActive ? 'bg-green-500' : 'bg-slate-300'}`}>
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSaving ? <><i className="fa-solid fa-spinner fa-spin"></i> Đang lưu...</> : <><i className="fa-solid fa-save"></i> Lưu Thay Đổi</>}
                        </button>
                    </div>
                </form>
            </div>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        </div>
    );
}
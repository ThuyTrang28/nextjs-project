"use client";

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import AdminBannerService from '@/services/AdminBannerService';

const BACKEND_DOMAIN = 'http://localhost:8000'; 

// ✅ HÀM LẤY ẢNH CHUẨN
const getImageUrl = (imageSource) => {
    if (!imageSource || imageSource === "null" || imageSource === "") {
        return "https://placehold.co/300x150?text=No+Image";
    }
    
    // Preview khi chọn file
    if (imageSource instanceof File) return URL.createObjectURL(imageSource);
    
    // Nếu link đã đầy đủ (có http)
    if (typeof imageSource === 'string' && imageSource.startsWith('http')) return imageSource;

    // Lấy tên file
    const fileName = imageSource.toString().split('/').pop();
    
    // ✅ URL: http://localhost:8000/storage/images/banner/ten_anh.jpg
    return `${BACKEND_DOMAIN}/storage/images/banner/${fileName}?t=${new Date().getTime()}`;
};

const statusStringToNumber = (statusStr) => statusStr === 'Active' ? 1 : 0;
const statusNumberToString = (statusNum) => parseInt(statusNum) === 1 ? 'Active' : 'Inactive';

const Notification = ({ message, type, onClose }) => {
    if (!message) return null;
    return (
        <div className={`fixed top-5 right-5 p-4 rounded-xl shadow-2xl text-white z-9999 transition-all animate-in fade-in slide-in-from-right-10 ${type === 'success' ? 'bg-emerald-500' : 'bg-rose-600'}`}>
            <div className="flex items-center space-x-3">
                <i className={`fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-xmark'} text-xl`}></i>
                <span className="font-bold">{message}</span>
                <button onClick={onClose} className="ml-4 hover:scale-110 transition-transform"><i className="fa-solid fa-xmark"></i></button>
            </div>
        </div>
    );
};

const BannerFormModal = ({ isOpen, onClose, banner, onSave }) => {
    const initialFormData = { name: '', status: 'Active', position: 'slideshow', image: '', link: '', sort_order: 1 };
    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        if (isOpen) {
            if (banner) {
                setFormData({
                    ...banner,
                    status: statusNumberToString(banner.status),
                });
            } else { setFormData(initialFormData); }
        }
    }, [banner, isOpen]);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFormData(prev => ({ ...prev, image: e.target.files[0] })); 
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-100">
                    <h2 className="text-2xl font-extrabold text-slate-800">{banner ? 'Chỉnh sửa Banner' : 'Thêm Banner Mới'}</h2>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Tên Banner</label>
                        <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Hình ảnh Banner</label>
                        <input type="file" onChange={handleFileChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" />
                        {formData.image && (
                            <div className="mt-3 h-32 w-full bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-inner">
                                <img src={getImageUrl(formData.image)} className="w-full h-full object-contain" alt="Preview" onError={(e) => e.target.style.display='none'} />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Vị trí</label>
                            <select value={formData.position} onChange={(e) => setFormData({...formData, position: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                                <option value="slideshow">Slideshow</option>
                                <option value="ads">Ads</option>
                                <option value="top_header">Top Header</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Trạng thái</label>
                            <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                                <option value="Active">Hoạt động</option>
                                <option value="Inactive">Ẩn</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 font-bold text-slate-500 hover:bg-slate-100 rounded-xl">Hủy</button>
                        <button type="submit" className="px-5 py-2.5 font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 shadow-lg">Lưu</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default function BannerManagementPage() {
    const [banners, setBanners] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [isLoading, setIsLoading] = useState(true);

    const fetchBanners = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await AdminBannerService.getAll();
            const rawData = res.data.data;
            const list = Array.isArray(rawData) ? rawData : (rawData.data || []);
            setBanners(list);
        } catch (e) { console.error(e); } finally { setIsLoading(false); }
    }, []);

    useEffect(() => { fetchBanners(); }, [fetchBanners]);

    const handleSaveBanner = async (formData) => {
        const data = new FormData();
        data.append('name', formData.name);
        data.append('link', formData.link || '');
        data.append('position', formData.position);
        data.append('status', statusStringToNumber(formData.status));
        data.append('sort_order', formData.sort_order || 1);

        if (formData.image instanceof File) {
            data.append('image', formData.image);
        } else {
            // Backend dùng 'storeAs' nên không cần gửi lại tên ảnh cũ
            // Nếu gửi '123.jpg' (string) vào hàm storeAs của Laravel nó sẽ lỗi
            // Tốt nhất là KHÔNG GỬI GÌ nếu không thay đổi ảnh
        }

        try {
            if (formData.id) {
                data.append('_method', 'PUT');
                await AdminBannerService.update(formData.id, data);
                setNotification({ message: 'Cập nhật thành công!', type: 'success' });
            } else {
                await AdminBannerService.create(data);
                setNotification({ message: 'Thêm mới thành công!', type: 'success' });
            }
            fetchBanners();
            setIsModalOpen(false);
        } catch (e) {
            // In lỗi chi tiết
            const errorMsg = e.response?.data?.message || e.message;
            console.error("Save Error:", errorMsg);
            setNotification({ message: 'Lỗi: ' + errorMsg, type: 'error' });
        }
        setTimeout(() => setNotification({ message: '', type: '' }), 4000);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Xóa banner này?')) {
            try {
                await AdminBannerService.delete(id);
                setNotification({ message: 'Đã xóa!', type: 'success' });
                fetchBanners();
            } catch(e) { setNotification({ message: 'Lỗi xóa!', type: 'error' }); }
            setTimeout(() => setNotification({ message: '', type: '' }), 3000);
        }
    };

    return (
        <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
            <Notification {...notification} onClose={() => setNotification({ message: '', type: '' })} />
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-extrabold text-slate-900">Quản lý Banner</h1>
                    <button onClick={() => { setEditingBanner(null); setIsModalOpen(true); }} className="bg-slate-900 text-white font-bold py-3 px-6 rounded-xl hover:bg-slate-800 shadow-xl flex items-center gap-2"><i className="fa-solid fa-plus"></i> Thêm mới</button>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold text-xs uppercase">
                                    <th className="px-6 py-4">Preview</th>
                                    <th className="px-6 py-4">Tên Banner</th>
                                    <th className="px-6 py-4">Vị trí</th>
                                    <th className="px-6 py-4 text-center">Trạng thái</th>
                                    <th className="px-6 py-4 text-right">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {isLoading ? (
                                    <tr><td colSpan="5" className="text-center py-10 text-slate-400">Đang tải...</td></tr>
                                ) : banners.map(b => (
                                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="h-16 w-28 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shadow-sm relative">
                                                <img 
                                                    src={getImageUrl(b.image)} 
                                                    className="w-full h-full object-cover" 
                                                    alt={b.name}
                                                    onError={(e) => { 
                                                        e.target.onerror = null; 
                                                        e.target.src="https://placehold.co/300x150?text=Error"; 
                                                    }}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-800">{b.name}</td>
                                        <td className="px-6 py-4"><span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase">{b.position}</span></td>
                                        <td className="px-6 py-4 text-center"><span className={`px-3 py-1 rounded-lg text-xs font-bold ${b.status === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{b.status === 1 ? 'Hoạt động' : 'Ẩn'}</span></td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button onClick={() => { setEditingBanner(b); setIsModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><i className="fa-solid fa-edit"></i></button>
                                            <button onClick={() => handleDelete(b.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><i className="fa-solid fa-trash"></i></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <BannerFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} banner={editingBanner} onSave={handleSaveBanner} />
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        </div>
    );
}
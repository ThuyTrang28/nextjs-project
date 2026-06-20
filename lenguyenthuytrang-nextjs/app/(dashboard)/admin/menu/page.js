"use client";

import React, { useState, useEffect, useCallback } from 'react';
import AdminMenuService from '@/services/AdminMenuService';

const capitalize = (s) => (typeof s === 'string' && s.length) ? s.charAt(0).toUpperCase() + s.slice(1) : s;

// --- Sub-component: MenuItemDisplay ---
const MenuItemDisplay = ({ item, onEdit, onDelete, depth = 0 }) => {
    const depthPadding = depth * 1.5;
    const typeStyle = {
        custom: 'text-purple-600 bg-purple-100',
        category: 'text-blue-600 bg-blue-100',
        topic: 'text-teal-600 bg-teal-100',
        page: 'text-green-600 bg-green-100',
    };

    return (
        <li
            style={{ paddingLeft: `${depthPadding}rem` }}
            className={`flex justify-between items-center p-3 border-b border-slate-200 hover:bg-slate-50 transition-colors ${depth > 0 ? 'bg-white' : 'bg-slate-50'}`}
        >
            <div className="flex items-center space-x-4">
                <i className="fa-solid fa-grip-lines text-slate-400"></i>
                <div className="flex flex-col">
                    <span className="font-semibold text-slate-800">{item.name}</span>
                    <span className="text-sm text-slate-500">{item.link}</span>
                </div>
            </div>

            <div className="flex items-center space-x-3">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeStyle[item.type] || typeStyle.custom}`}>
                    {capitalize(item.type)}
                </span>
                <button 
                    onClick={() => onEdit(item)} 
                    className="p-1.5 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors"
                >
                    <i className="fa-solid fa-pen-to-square"></i>
                </button>
                <button 
                    onClick={() => onDelete(item.id)} 
                    className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                >
                    <i className="fa-solid fa-trash"></i>
                </button>
            </div>
        </li>
    );
};

// --- Helper: Build Menu Tree ---
const buildMenuTree = (items, parentId = 0, depth = 0) => {
    return items
        .filter(item => (Number(item.parent_id) || 0) === parentId)
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
        .map(item => ({
            ...item,
            depth,
            children: buildMenuTree(items, item.id, depth + 1)
        }));
};

export default function MenuManagementPage() {
    const [menuItems, setMenuItems] = useState([]); 
    const [sources, setSources] = useState({ categories: [], topics: [], pages: [] }); 
    const [activeTab, setActiveTab] = useState('Custom');
    const [customLink, setCustomLink] = useState({ label: '', link: '' });
    const [isLoading, setIsLoading] = useState(false);
    
    // State quản lý việc chỉnh sửa (Modal)
    const [editingItem, setEditingItem] = useState(null);

    // 1. Fetch dữ liệu nguồn (Category, Topic, Page)
    const fetchSources = async () => {
        try {
            const res = await AdminMenuService.getSources();
            if (res.data.status) setSources(res.data.data);
        } catch (err) { console.error("Lỗi tải nguồn dữ liệu", err); }
    };

    // 2. Fetch danh sách Menu
    const fetchMenus = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await AdminMenuService.getAll({ all: true });
            if (res.data.status) setMenuItems(res.data.data);
        } catch (err) { alert('Không thể tải danh sách menu.'); }
        finally { setIsLoading(false); }
    }, []);

    useEffect(() => {
        fetchSources();
        fetchMenus();
    }, [fetchMenus]);

    const menuTree = buildMenuTree(menuItems);

    // 3. Thêm Menu
    const handleAddMenuItem = async (name, link, type) => {
        if (!name || !link) return alert("Vui lòng nhập tên và link");
        setIsLoading(true);
        try {
            const payload = {
                name,
                link,
                type: type.toLowerCase(),
                position: 'mainmenu',
                parent_id: 0,
                sort_order: menuItems.length + 1
            };
            const res = await AdminMenuService.create(payload);
            if (res.data.status) {
                await fetchMenus();
                setCustomLink({ label: '', link: '' });
            }
        } catch (err) { alert("Lỗi khi thêm menu"); }
        finally { setIsLoading(false); }
    };

    // 4. Cập nhật Menu (Update)
    const handleUpdateMenu = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await AdminMenuService.update(editingItem.id, editingItem);
            if (res.data.status) {
                await fetchMenus();
                setEditingItem(null); // Đóng modal
            }
        } catch (err) { alert("Lỗi khi cập nhật menu"); }
        finally { setIsLoading(false); }
    };

    // 5. Xóa Menu
    const handleDelete = async (id) => {
        if (!confirm('Bạn có chắc chắn muốn xóa menu này?')) return;
        setIsLoading(true);
        try {
            await AdminMenuService.delete(id);
            await fetchMenus();
        } catch (err) { alert("Lỗi khi xóa menu"); }
        finally { setIsLoading(false); }
    };

    // Render Đệ quy
    const renderMenuContent = (items) => (
        items.map(item => (
            <React.Fragment key={item.id}>
                <MenuItemDisplay
                    item={item}
                    onEdit={(it) => setEditingItem({ ...it })}
                    onDelete={handleDelete}
                    depth={item.depth}
                />
                {item.children && item.children.length > 0 && renderMenuContent(item.children)}
            </React.Fragment>
        ))
    );

    // Component Tab Nguồn
    const SourceLinkTab = ({ type, data }) => {
        const [selectedIds, setSelectedIds] = useState([]);
        const handleBulkAdd = async () => {
            setIsLoading(true);
            for (const id of selectedIds) {
                const item = data.find(i => i.id === id);
                await handleAddMenuItem(item.name, item.slug, type);
            }
            setSelectedIds([]);
            setIsLoading(false);
        };

        return (
            <div className="space-y-4">
                <div className="max-h-60 overflow-y-auto border rounded-lg p-2 bg-slate-50">
                    {data.length > 0 ? data.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-2 border-b last:border-0">
                            <span className="text-sm text-slate-700">{item.name}</span>
                            <input 
                                type="checkbox" 
                                className="w-4 h-4 accent-purple-600"
                                checked={selectedIds.includes(item.id)}
                                onChange={() => setSelectedIds(prev => prev.includes(item.id) ? prev.filter(i => i!==item.id) : [...prev, item.id])}
                            />
                        </div>
                    )) : <p className="text-center text-xs text-slate-400 p-4">Không có dữ liệu</p>}
                </div>
                <button 
                    disabled={selectedIds.length === 0}
                    onClick={handleBulkAdd} 
                    className="w-full py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white rounded-lg transition-colors shadow-md"
                >
                    Thêm {selectedIds.length > 0 && `(${selectedIds.length})`} vào Menu
                </button>
            </div>
        );
    };

    return (
        <div className="p-8 bg-slate-100 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-extrabold text-slate-800">Quản lý Menu</h1>
                    <button onClick={fetchMenus} className="bg-white p-2 rounded-full shadow-sm hover:text-purple-600"><i className="fa-solid fa-sync"></i></button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* BÊN TRÁI: FORM THÊM */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-xl border border-white">
                            <h2 className="text-lg font-bold text-slate-700 mb-4">Thêm mục mới</h2>
                            <div className="flex space-x-2 mb-4 border-b overflow-x-auto pb-1">
                                {['Custom', 'Category', 'Topic', 'Page'].map(tab => (
                                    <button 
                                        key={tab} 
                                        onClick={() => setActiveTab(tab)} 
                                        className={`pb-2 px-3 text-sm font-semibold transition-all ${activeTab === tab ? 'border-b-2 border-purple-600 text-purple-600' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            {activeTab === 'Custom' ? (
                                <div className="space-y-4">
                                    <input value={customLink.label} onChange={e => setCustomLink({...customLink, label: e.target.value})} placeholder="Tên menu (Ví dụ: Trang chủ)" className="w-full p-2.5 border rounded-lg focus:ring-2 ring-purple-100 outline-none transition-all" />
                                    <input value={customLink.link} onChange={e => setCustomLink({...customLink, link: e.target.value})} placeholder="Đường dẫn URL" className="w-full p-2.5 border rounded-lg focus:ring-2 ring-purple-100 outline-none transition-all" />
                                    <button onClick={() => handleAddMenuItem(customLink.label, customLink.link, 'custom')} className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-lg shadow-purple-200 transition-all">Thêm Menu</button>
                                </div>
                            ) : (
                                <SourceLinkTab 
                                    type={activeTab} 
                                    data={activeTab === 'Category' ? sources.categories : activeTab === 'Topic' ? sources.topics : sources.pages} 
                                />
                            )}
                        </div>
                    </div>

                    {/* BÊN PHẢI: CẤU TRÚC MENU */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-xl border border-white overflow-hidden">
                            <div className="p-5 bg-slate-50 border-b flex justify-between items-center">
                                <h2 className="font-bold text-slate-700 uppercase tracking-wider text-sm">Cấu trúc Menu hiện tại</h2>
                                <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full font-bold">{menuItems.length} mục</span>
                            </div>
                            <ul className="divide-y divide-slate-100 min-h-[400px]">
                                {menuItems.length > 0 ? renderMenuContent(menuTree) : (
                                    <div className="py-20 text-center flex flex-col items-center justify-center opacity-30">
                                        <i className="fa-solid fa-list-check text-6xl mb-4"></i>
                                        <p className="font-medium italic">Danh sách đang trống</p>
                                    </div>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL CHỈNH SỬA (UPDATE) */}
            {editingItem && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b flex justify-between items-center bg-slate-50 rounded-t-2xl">
                            <h3 className="font-bold text-xl text-slate-800">Cập nhật Menu</h3>
                            <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-red-500 transition-colors"><i className="fa-solid fa-times-circle text-2xl"></i></button>
                        </div>
                        <form onSubmit={handleUpdateMenu} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tên Menu</label>
                                <input 
                                    value={editingItem.name} 
                                    onChange={e => setEditingItem({...editingItem, name: e.target.value})}
                                    className="w-full p-3 border rounded-xl focus:ring-2 ring-blue-100 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Đường dẫn (Slug/Link)</label>
                                <input 
                                    value={editingItem.link} 
                                    onChange={e => setEditingItem({...editingItem, link: e.target.value})}
                                    className="w-full p-3 border rounded-xl focus:ring-2 ring-blue-100 outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Menu Cha</label>
                                    <select 
                                        value={editingItem.parent_id || 0}
                                        onChange={e => setEditingItem({...editingItem, parent_id: e.target.value})}
                                        className="w-full p-3 border rounded-xl"
                                    >
                                        <option value={0}>Cấp gốc</option>
                                        {menuItems.filter(m => m.id !== editingItem.id).map(m => (
                                            <option key={m.id} value={m.id}>{m.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sắp xếp</label>
                                    <input 
                                        type="number"
                                        value={editingItem.sort_order || 0}
                                        onChange={e => setEditingItem({...editingItem, sort_order: e.target.value})}
                                        className="w-full p-3 border rounded-xl"
                                    />
                                </div>
                            </div>
                            <div className="pt-4 flex space-x-3">
                                <button type="button" onClick={() => setEditingItem(null)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all">Hủy</button>
                                <button type="submit" className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all">Lưu thay đổi</button>
                            </div>
                        </form>
                    </div>
                    
                </div>
            )}

            {/* LOADING OVERLAY */}
            {isLoading && (
                <div className="fixed inset-0 bg-white/70 flex flex-col items-center justify-center z-[100] backdrop-blur-[2px]">
                    <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 font-bold text-purple-600 animate-pulse">Đang đồng bộ dữ liệu...</p>
                </div>
            )}
             <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        </div>
    );
}
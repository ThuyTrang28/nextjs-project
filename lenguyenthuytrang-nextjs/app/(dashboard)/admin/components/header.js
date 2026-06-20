"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';

const NAV_MENU = [
    { name: 'Dashboard', href: '/admin/dashboard', key: 'dashboard' },
    { name: 'Menu', href: '/admin/menu', key: 'menu' },
    { name: 'Banner', href: '/admin/banner', key: 'banner' },
    { name: 'Danh mục', href: '/admin/category', key: 'category' }, 
    { name: 'Sản phẩm', href: '/admin/product', key: 'product' },
    { name: 'Nhập kho', href: '/admin/product-stores', key: 'product-stores' },
    { name: 'Đơn hàng', href: '/admin/orders', key: 'orders' },
    { name: 'Khuyến mãi', href: '/admin/product-sales', key: 'product-sales' },
    { name: 'Chủ đề & Bài viết', href: '/admin/posts', key: 'posts' },
    { name: 'Người dùng', href: '/admin/users', key: 'users' },
    { name: 'Liên hệ', href: '/admin/contact', key: 'contact' },
];

export default function Header({ open = {}, toggle }) {
    const router = useRouter(); 
    const SIDEBAR_KEY = 'adminSidebar';
    const isOpen = !!open[SIDEBAR_KEY];

    const handleLogout = () => {
        console.log('Đang thực hiện đăng xuất...');
        router.push('/admin/login');
    };

    return (
        <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-700 text-white shadow-md">
            {/* THAY ĐỔI 1: Sử dụng w-full thay vì max-w-7xl để lấy hết chiều rộng màn hình */}
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 gap-4">
                    
                    {/* --- KHU VỰC TRÁI: Toggle & Logo --- */}
                    <div className="flex items-center gap-4 shrink-0">
                        <button
                            // THAY ĐỔI 2: Hiện nút menu trên các màn hình nhỏ hơn XL (dưới 1280px)
                            className="p-2 rounded-md text-slate-300 hover:bg-slate-800 hover:text-white focus:outline-none xl:hidden transition-colors"
                            onClick={() => toggle(SIDEBAR_KEY)}
                        >
                            {isOpen ? (
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>

                        <Link href="/admin/dashboard" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center font-bold text-slate-900">
                                A
                            </div>
                            <h1 className="text-xl font-bold tracking-wide text-slate-100 hidden sm:block">
                                ADMIN <span className="text-amber-500">PANEL</span>
                            </h1>
                        </Link>
                    </div>

                    {/* --- KHU VỰC GIỮA: Navigation (Desktop) --- */}
                    {/* THAY ĐỔI 3: Chỉ hiện Nav khi màn hình >= XL. Sử dụng flex-1 để căn giữa. */}
                    <nav className="hidden xl:flex items-center justify-center flex-1">
                        {/* Container menu: Flex row, wrap nếu cần (nhưng ở đây ta dùng XL để đảm bảo đủ chỗ) */}
                        <div className="flex items-center gap-1"> 
                            {NAV_MENU.map((item) => (
                                <Link
                                    key={item.key}
                                    href={item.href}
                                    // THAY ĐỔI 4: whitespace-nowrap để chữ không bị xuống dòng. Giữ nguyên style cũ.
                                    className="px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all duration-200 whitespace-nowrap"
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </nav>

                    {/* --- KHU VỰC PHẢI: User Info & Actions --- */}
                    <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-white">Admin User</p>
                            <p className="text-xs text-slate-400">role: super-admin</p>
                        </div>
                        
                        <div className="h-8 w-px bg-slate-700 hidden sm:block"></div>

                        <button 
                            onClick={handleLogout}
                            className="flex items-center gap-2 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white px-3 py-2 rounded-lg text-sm transition-all duration-200 border border-red-600/20"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span className="hidden lg:inline">Đăng xuất</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* --- MENU MOBILE (Dropdown) --- */}
            {isOpen && (
                <div className="xl:hidden border-t border-slate-700 bg-slate-800 animate-in slide-in-from-top-2 duration-200">
                    <nav className="px-2 pt-2 pb-4 space-y-1">
                        {NAV_MENU.map((item) => (
                            <Link
                                key={item.key}
                                href={item.href}
                                className="block px-3 py-3 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                                onClick={() => toggle(SIDEBAR_KEY)}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                    {item.name}
                                </div>
                            </Link>
                        ))}
                    </nav>
                </div>
            )}
        </header>
    );
}
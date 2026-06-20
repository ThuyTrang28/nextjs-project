"use client";
import Link from 'next/link';
import { useState, useRef, useEffect } from "react";
import { useRouter } from 'next/navigation';
import CategoryService from "@/services/ClientCategoryService";
import ClientProductService from "@/services/ClientProductService";
import AdminMenuService from '@/services/AdminMenuService'; // Import service menu

// Import Context
import { useAuth } from "../components/context/AuthContext";

// --- CẤU HÌNH ---
const BACKEND_DOMAIN = 'http://localhost:8000';

// --- HELPER FORMAT & IMAGE ---
const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(price));
};

const getImageUrl = (thumbnail) => {
    if (!thumbnail) return "https://via.placeholder.com/150";
    return thumbnail.startsWith('http') ? thumbnail : `${BACKEND_DOMAIN}/storage/${thumbnail}`;
};

const getUserAvatar = (avatar) => {
    if (!avatar) return "https://via.placeholder.com/40";
    if (avatar.startsWith('http')) return avatar;
    const cleanPath = avatar.startsWith('/') ? avatar.substring(1) : avatar;
    return `${BACKEND_DOMAIN}/storage/${cleanPath}`;
};

// --- HÀM CHUYỂN ĐỔI DATA PHẲNG THÀNH CÂY MENU ---
const buildMenuTree = (items, parentId = 0) => {
    return items
        .filter(item => (Number(item.parent_id) || 0) === parentId)
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
        .map(item => ({
            ...item,
            ...item,
            children: buildMenuTree(items, item.id)
        }));
};

// --- COMPONENT CON: RENDER MENU ĐỆ QUY ---
const NavMenuItem = ({ item }) => {
    const hasChildren = item.children && item.children.length > 0;
    
    // Xử lý link: Nếu là custom thì dùng nguyên link, nếu là category/topic/page thì tiền tố tương ứng
    const getLink = (menuItem) => {
        if (menuItem.type === 'custom') return menuItem.link;
        if (menuItem.type === 'category') return `/category/${menuItem.link}`;
        if (menuItem.type === 'topic') return `/topic/${menuItem.link}`;
        if (menuItem.type === 'page') return `/pages/${menuItem.link}`;
        return menuItem.link;
    };

    return (
        <div className="relative group h-full flex items-center">
            <Link
                href={getLink(item)}
                className="hover:text-gray-300 cursor-pointer whitespace-nowrap flex items-center gap-1 py-3 px-3 transition-colors"
            >
                {item.name}
                {hasChildren && <i className="fa-solid fa-chevron-down text-[10px] ml-1 opacity-70 group-hover:opacity-100 transition-opacity"></i>}
            </Link>

            {hasChildren && (
                <div className="absolute top-full left-0 mt-0 w-60 bg-white text-gray-800 shadow-xl rounded-b-lg border-t-4 border-black hidden group-hover:block z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="py-2 flex flex-col items-start">
                        {item.children.map((child) => (
                            <Link
                                key={child.id}
                                href={getLink(child)}
                                className="w-full px-5 py-2.5 hover:bg-gray-100 hover:text-red-600 text-sm text-left transition-colors flex justify-between items-center"
                            >
                                {child.name}
                                {child.children && child.children.length > 0 && <i className="fa-solid fa-chevron-right text-[10px] opacity-50"></i>}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Component menu item cho dropdown User
const UserMenuItem = ({ href, iconClass, label, onClick }) => (
    <Link href={href || '#'} onClick={onClick} className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-50 text-gray-700 hover:text-black transition-colors">
        <i className={`${iconClass} w-6 text-center mr-3`}></i>
        <span className="font-medium">{label}</span>
    </Link>
);

export default function Header() {
    const [search, setSearch] = useState("");
    const router = useRouter();
    const { user, logout, loading: authLoading } = useAuth();

    // --- STATE DỮ LIỆU MENU ---
    const [mainMenu, setMainMenu] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [isSignInDropdownOpen, setIsSignInDropdownOpen] = useState(false);

    const dropdownRef = useRef(null);
    const searchRef = useRef(null);

    // --- GỌI API MENU DỰA TRÊN TABLE MENU ---
    useEffect(() => {
        const fetchMenuData = async () => {
            try {
                const response = await AdminMenuService.getAll({ all: true, status: 1 });
                if (response.data.status) {
                    const tree = buildMenuTree(response.data.data);
                    setMainMenu(tree);
                }
            } catch (error) {
                console.error("Lỗi khi tải menu động:", error);
            }
        };
        fetchMenuData();
    }, []);

    // --- LOGIC TÌM KIẾM ---
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (search.trim().length > 1) {
                setIsSearching(true);
                setShowResults(true);
                try {
                    const response = await ClientProductService.getAll({ search: search, limit: 5 });
                    if (response && response.data && response.data.data) {
                        setSearchResults(response.data.data.data || []);
                    }
                } catch (error) {
                    console.error("Lỗi tìm kiếm:", error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
                setShowResults(false);
            }
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [search]);

    // --- XỬ LÝ CLICK OUTSIDE ---
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsSignInDropdownOpen(false);
            if (searchRef.current && !searchRef.current.contains(event.target)) setShowResults(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearchEnter = (e) => {
        if (e.key === 'Enter' && search.trim()) {
            setShowResults(false);
            router.push(`/search?q=${encodeURIComponent(search.trim())}`);
        }
    };

    return (
        <header className="border-b border-gray-200 z-50 relative bg-white">
            {/* TOP BAR */}
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between" ref={dropdownRef}>
                <div className="flex items-center gap-6 flex-1 min-w-0">
                    <Link href="/" className="text-2xl font-bold tracking-widest text-black shrink-0 hover:opacity-80 transition-opacity">SEPHORA</Link>

                    {/* SEARCH BOX */}
                    <div className="relative shrink-0 w-full max-w-[600px]" ref={searchRef}>
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 z-20 pointer-events-none">
                            <i className="fa-solid fa-magnifying-glass text-sm"></i>
                        </div>
                        <input
                            placeholder="Tìm kiếm sản phẩm..."
                            className="w-full border border-gray-300 rounded-full py-2.5 pl-12 pr-4 text-sm focus:ring-1 focus:ring-black focus:border-black bg-gray-50 relative z-10 transition-all outline-none"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={handleSearchEnter}
                        />
                        {showResults && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden">
                                {isSearching ? (
                                    <div className="p-4 text-center text-gray-500 text-sm"><i className="fa-solid fa-spinner fa-spin mr-2"></i> Đang tìm kiếm...</div>
                                ) : searchResults.length > 0 ? (
                                    <div>
                                        <div className="px-4 py-2 bg-gray-50 text-xs font-bold text-gray-500 uppercase">Sản phẩm gợi ý</div>
                                        {searchResults.map((product) => (
                                            <Link key={product.id} href={`/products/${product.id}`} className="flex items-center gap-4 p-3 hover:bg-gray-50 border-b border-gray-100 last:border-0" onClick={() => setShowResults(false)}>
                                                <img src={getImageUrl(product.thumbnail)} alt={product.name} className="w-10 h-10 object-cover rounded" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                                                    <span className="text-xs text-red-600 font-bold">{formatPrice(product.price_sale || product.price_buy)}</span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : <div className="p-4 text-center text-gray-500 text-sm">Không tìm thấy kết quả nào</div>}
                            </div>
                        )}
                    </div>
                </div>

                {/* Icons Group */}
                <div className="flex items-center gap-4 text-sm text-gray-700 ml-4">
                    <div className="flex items-center gap-6 border-l border-gray-300 pl-6">
                        <div className="relative flex items-center gap-2 cursor-pointer hover:text-black" onClick={() => setIsSignInDropdownOpen(!isSignInDropdownOpen)}>
                            {authLoading ? (
                                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
                            ) : user ? (
                                <>
                                    <img src={getUserAvatar(user.avatar)} alt={user.username} className="w-8 h-8 rounded-full object-cover border border-gray-300" />
                                    <div className="text-xs hidden md:flex flex-col">
                                        <p className="font-semibold text-sm">{user.username}</p>
                                        <p className="text-gray-500 text-xs">Thành viên</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <i className="fa-solid fa-user-circle text-2xl text-gray-700"></i>
                                    <div className="text-xs hidden md:block">
                                        <p className="font-semibold text-sm">Đăng nhập</p>
                                        <p className="text-red-600 font-bold text-xs">để nhận ưu đãi 🎁</p>
                                    </div>
                                </>
                            )}

                            {isSignInDropdownOpen && (
                                <div className="absolute top-full mt-4 right-0 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 text-base text-gray-700 overflow-hidden">
                                    {user ? (
                                        <>
                                            <div className="p-4 bg-gray-50 border-b">
                                                <p className="text-sm text-gray-500">Xin chào,</p>
                                                <h3 className="font-bold text-lg text-black">{user.username}</h3>
                                            </div>
                                            <UserMenuItem href="/profile" iconClass="fa-regular fa-id-card" label="Trang cá nhân" />
                                            <UserMenuItem href="/checkout/history" iconClass="fa-solid fa-box-open" label="Lịch sử đơn hàng" />
                                            <UserMenuItem href="/profile/change-password" iconClass="fa-solid fa-key" label="Đổi mật khẩu" />
                                            <button onClick={() => {logout(); setIsSignInDropdownOpen(false);}} className="w-full text-left flex items-center px-4 py-3 hover:bg-red-50 text-red-600 border-t"><i className="fa-solid fa-right-from-bracket w-6 mr-3"></i>Đăng xuất</button>
                                        </>
                                    ) : (
                                        <div className="p-4 border-b">
                                            <h3 className="font-bold text-xl text-black">Chào mừng bạn.</h3>
                                            <div className="flex gap-2 mt-3">
                                                <Link href="/auth/sign-in" className="flex-1"><button className="w-full bg-black text-white py-2 text-sm font-semibold rounded-full">Đăng nhập</button></Link>
                                                <Link href="/auth/sign-up" className="flex-1"><button className="w-full border border-black text-black py-2 text-sm font-semibold rounded-full">Đăng ký</button></Link>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <Link href="/wishlist"><i className="fa-solid fa-heart text-2xl text-red-500 p-2 hover:scale-110 transition-transform"></i></Link>
                        <Link href="/cart"><i className="fa-solid fa-bag-shopping text-2xl text-gray-700 p-2 hover:scale-110 transition-transform"></i></Link>
                    </div>
                </div>
            </div>

            {/* DYNAMIC NAVIGATION BAR */}
            <nav className="bg-black text-white text-sm relative z-40 shadow-md">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-wrap justify-center items-center gap-x-2 h-12 font-semibold tracking-wide">
                       
                       
                        {/* LOAD DỮ LIỆU TỪ TABLE MENU */}
                        {mainMenu.length > 0 ? (
                            mainMenu.map((menuItem) => (
                                <NavMenuItem key={menuItem.id} item={menuItem} />
                            ))
                        ) : (
                            <div className="animate-pulse flex space-x-4">
                                <div className="h-4 w-20 bg-gray-700 rounded"></div>
                                <div className="h-4 w-20 bg-gray-700 rounded"></div>
                                <div className="h-4 w-20 bg-gray-700 rounded"></div>
                            </div>
                        )}
                        
                    </div>
                </div>
            </nav>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        </header>
    );
}
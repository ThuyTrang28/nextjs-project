"use client";
import { useState, useEffect, Fragment } from "react";
import Link from "next/link";
import ClientProductService from "@/services/ClientProductService"; 
import ClientBannerService from "@/services/ClientBannerService"; 

// Cấu hình đường dẫn hình ảnh
const BACKEND_DOMAIN = "http://localhost:8000"; 
const DEFAULT_BANNER = "https://placehold.co/1200x400?text=Chào+Mừng+Đến+Cửa+Hàng"; 
const DEFAULT_PROMO = "https://placehold.co/300x400?text=Khuyến+Mãi";
const DEFAULT_TOP = "https://placehold.co/1200x150?text=Banner+Đầu+Trang";

// Hàm bổ trợ lấy URL ảnh sản phẩm
const getImageUrl = (imageName) => {
    if (!imageName) return null;
    if (imageName.startsWith('http')) return imageName;
    return `${BACKEND_DOMAIN}/storage/${imageName}`; 
};

// Hàm bổ trợ lấy URL ảnh banner
const getBannerUrl = (imageName) => {
    if (!imageName) return null;
    if (imageName.startsWith('http')) return imageName;
    return `${BACKEND_DOMAIN}/images/banner/${imageName}`;
};

// Hàm bổ trợ định dạng tiền tệ (Đã chuyển sang VND ₫)
const formatMoney = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(amount));
};

export default function ProductListingPage() {
    // --- Quản lý State ---
    // Sắp xếp mặc định là 'newest'. Các tùy chọn: 'newest', 'oldest', 'price_asc', 'price_desc', 'discount_desc'
    const [sort, setSort] = useState("newest");
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // State phân trang
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0
    });

    // State lưu trữ Banner
    const [slideshowBanner, setSlideshowBanner] = useState(DEFAULT_BANNER); 
    const [topHeaderBanner, setTopHeaderBanner] = useState(DEFAULT_TOP); 
    const [promoCard, setPromoCard] = useState({                            
        img: DEFAULT_PROMO,
        title: "ƯU ĐÃI",
        link: "#"
    });

    // --- 1. LẤY DỮ LIỆU BANNER ---
    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const res = await ClientBannerService.getAll();
                
                if (res.data.status && Array.isArray(res.data.data)) {
                    const allBanners = res.data.data;
                    const findBanner = (pos) => allBanners.find(b => 
                        b.position && b.position.toLowerCase() === pos.toLowerCase()
                    );

                    const topItem = findBanner('top_header');
                    if (topItem && topItem.image) setTopHeaderBanner(getBannerUrl(topItem.image));
                    else setTopHeaderBanner(null);

                    const slideItem = findBanner('slideshow');
                    if (slideItem && slideItem.image) setSlideshowBanner(getBannerUrl(slideItem.image));

                    const adsItem = findBanner('ads');
                    if (adsItem && adsItem.image) {
                        setPromoCard({
                            img: getBannerUrl(adsItem.image),
                            title: adsItem.name || "ƯU ĐÃI",
                            link: adsItem.link || "#"
                        });
                    }
                }
            } catch (error) {
                console.error("Lỗi khi tải banner:", error);
            }
        };
        fetchBanners();
    }, []);

    // --- 2. LẤY DỮ LIỆU SẢN PHẨM (KÈM SẮP XẾP & PHÂN TRANG) ---
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                // Chuẩn bị tham số gọi API
                const params = {
                    sort: sort,      
                    limit: 11,        // 11 sản phẩm + 1 thẻ quảng cáo = lưới 12 phần tử
                    page: page        // Trang hiện tại để phân trang
                };

                const response = await ClientProductService.getNew(params);
                const result = response.data; 

                let apiProducts = [];
                
                if (result && result.status) {
                    // Xử lý cấu trúc phân trang của Laravel hoặc mảng chuẩn
                    if (result.data && result.data.data) {
                        apiProducts = result.data.data;
                        setPagination({
                            current_page: result.data.current_page,
                            last_page: result.data.last_page,
                            total: result.data.total
                        });
                    } else if (Array.isArray(result.data)) {
                        apiProducts = result.data;
                    }
                }

                if (apiProducts.length > 0) {
                    const mappedProducts = apiProducts.map(item => ({
                        id: item.id,
                        brand: "DIOR", 
                        name: item.name,
                        price: item.price_sale ? formatMoney(item.price_sale) : formatMoney(item.price_buy),
                        originalPrice: item.price_sale ? formatMoney(item.price_buy) : null,
                        img: item.thumbnail 
                            ? getImageUrl(item.thumbnail)
                            : "https://placehold.co/300x300?text=Khong+Co+Anh",
                        rating: 4.5,
                        reviews: 1.2,
                        colors: 5,
                        badges: [
                            item.price_sale ? "GIẢM GIÁ" : null,
                            // Logic cho nhãn "MỚI": được tạo trong vòng 30 ngày qua
                            (new Date(item.created_at) > new Date(Date.now() - 30*24*60*60*1000)) ? "MỚI" : null
                        ].filter(Boolean)
                    }));
                    setProducts(mappedProducts);
                } else {
                    setProducts([]);
                }

            } catch (error) {
                console.error("Lỗi khi tải sản phẩm:", error);
            } finally {
                setLoading(false);
                if(page > 1) window.scrollTo({ top: 400, behavior: 'smooth' }); 
            }
        };
        fetchProducts();
    }, [sort, page]); 

    // Xử lý thay đổi bộ lọc sắp xếp: Cập nhật state và quay về trang 1
    const handleSortChange = (e) => {
        setSort(e.target.value);
        setPage(1);
    };

    // Xử lý chuyển trang
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.last_page) {
            setPage(newPage);
        }
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 max-w-7xl mx-auto px-6 py-8">
            <main className="w-full space-y-8">
                
                {/* THANH ĐIỀU KHIỂN & BỘ LỌC SẮP XẾP */}
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <div className="text-sm font-normal">
                        Hiển thị <span className="font-bold">{products.length}</span> trên <span className="font-bold">{pagination.total}</span> kết quả
                    </div>
                    <div className="flex items-center text-sm">
                        <span className="text-gray-700 mr-2 font-medium">Sắp xếp theo:</span>
                        <div className="relative">
                            <select 
                                value={sort} 
                                onChange={handleSortChange} 
                                className="appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-black focus:border-black block w-full p-2.5 pr-8 cursor-pointer"
                            >
                                <option value="newest">Hàng mới về</option>
                                <option value="oldest">Cũ nhất</option>
                                <option value="price_asc">Giá: Thấp đến Cao</option>
                                <option value="price_desc">Giá: Cao đến Thấp</option>
                                <option value="discount_desc">Giảm giá nhiều nhất</option>
                                <option value="best_selling">Bán chạy nhất</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-6">
                    
                    {/* DANH SÁCH SẢN PHẨM */}
                    <div className="col-span-12">
                        {loading ? (
                            <div className="text-center py-20 flex justify-center">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
                                    
                                    {products.map((p) => (
                                        <Fragment key={p.id}>
                                            <article className="group flex flex-col items-center text-center h-full relative">
                                                <div className="relative w-full">
                                                    {/* Nhãn trạng thái */}
                                                    <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                                                        {p.badges && p.badges.map((b) => (
                                                            <span key={b} className={`text-[10px] px-2 py-1 rounded font-semibold text-white ${b === 'GIẢM GIÁ' ? 'bg-red-600' : 'bg-black'}`}>
                                                                {b}
                                                            </span>
                                                        ))}
                                                    </div>

                                                    {/* Nút yêu thích */}
                                                    <button className="absolute top-2 right-2 text-xl text-gray-400 hover:text-red-500 z-10 transition-colors">
                                                        <i className="fa-regular fa-heart"></i>
                                                    </button>
                                                    
                                                    {/* Ảnh sản phẩm */}
                                                    <Link href={`/products/${p.id}`} className="block">
                                                        <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-center h-72 w-full group-hover:bg-gray-100 transition-colors cursor-pointer relative overflow-hidden">
                                                            <img src={p.img} alt={p.name} className="max-h-full max-w-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110" />
                                                        </div>
                                                    </Link>
                                                </div>

                                                {/* Thông tin sản phẩm */}
                                                <div className="mt-4 text-left w-full px-2 flex flex-col grow">
                                                    <div className="text-xs font-bold text-gray-800 uppercase tracking-wide">{p.brand}</div>
                                                    
                                                    <Link href={`/products/${p.id}`} className="block">
                                                        <div className="font-medium mt-1 text-sm text-gray-900 leading-tight group-hover:underline cursor-pointer line-clamp-2 h-10 overflow-hidden" title={p.name}>
                                                            {p.name}
                                                        </div>
                                                    </Link>
                                                    
                                                    {/* Đánh giá sao */}
                                                    <div className="flex items-center gap-1 mt-2 text-yellow-500 text-xs">
                                                        {Array.from({ length: 5 }).map((_, i) => (
                                                            <i key={i} className={`fa-star ${i < Math.round(p.rating) ? "fa-solid" : "fa-regular"}`}></i>
                                                        ))}
                                                        <span className="text-gray-400 ml-1">({p.reviews}k)</span>
                                                    </div>

                                                    {/* Giá sản phẩm */}
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <span className={`font-semibold text-base ${p.originalPrice ? 'text-red-600' : 'text-gray-900'}`}>
                                                            {p.price}
                                                        </span>
                                                        {p.originalPrice && (
                                                            <span className="text-xs text-gray-400 line-through">
                                                                {p.originalPrice}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </article>
                                        </Fragment>
                                    ))}

                                </div>

                                {/* THANH PHÂN TRANG */}
                                {pagination.last_page > 1 && (
                                    <div className="mt-16 flex justify-center items-center gap-4 border-t border-gray-100 pt-8">
                                        <button
                                            onClick={() => handlePageChange(pagination.current_page - 1)}
                                            disabled={pagination.current_page === 1}
                                            className="px-4 py-2 border border-gray-300 rounded hover:bg-black hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-900 flex items-center gap-1"
                                        >
                                            <i className="fa-solid fa-chevron-left text-sm"></i> Trước
                                        </button>
                                        
                                        <span className="text-sm font-medium text-gray-600">
                                            Trang <span className="text-black font-bold">{pagination.current_page}</span> trên {pagination.last_page}
                                        </span>

                                        <button
                                            onClick={() => handlePageChange(pagination.current_page + 1)}
                                            disabled={pagination.current_page === pagination.last_page}
                                            className="px-4 py-2 border border-gray-300 rounded hover:bg-black hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-900 flex items-center gap-1"
                                        >
                                            Sau <i className="fa-solid fa-chevron-right text-sm"></i>
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
"use client";
import { useState, useEffect, Fragment } from "react";
import Link from "next/link";
import ClientProductService from "@/services/ClientProductService";
import ClientBannerService from "@/services/ClientBannerService";

// Cấu hình đường dẫn ảnh
const BACKEND_DOMAIN = "http://localhost:8000";
const DEFAULT_BANNER = "https://placehold.co/1200x400?text=Slideshow+Banner";
const DEFAULT_PROMO = "https://placehold.co/300x400?text=Ads+Banner";
const DEFAULT_TOP = "https://placehold.co/1200x150?text=Top+Header+Banner"; // Ảnh mặc định cho Top Header

// ✅ 1. HÀM LẤY ẢNH SẢN PHẨM (GIỮ NGUYÊN NHƯ CŨ)
const getImageUrl = (imageName) => {
    if (!imageName) return null;
    if (imageName.startsWith('http')) return imageName;
    return `${BACKEND_DOMAIN}/storage/${imageName}`;
};

// ✅ 2. HÀM LẤY ẢNH BANNER RIÊNG (Trỏ vào public/images/banner)
const getBannerUrl = (imageName) => {
    if (!imageName) return DEFAULT_BANNER;
    if (imageName.startsWith('http')) return imageName;

    // 👇 QUAN TRỌNG: Phải có '/storage/' thì mới lấy được ảnh từ Laravel Storage
    return `${BACKEND_DOMAIN}/storage/images/banner/${imageName}`;
};

// ĐÃ ĐỔI SANG ĐỊNH DẠNG ĐỒNG (VND)
const formatMoney = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(amount));
};

export default function ProductListingPage() {
    const [sort, setSort] = useState("newest");
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- STATE QUẢN LÝ CÁC VỊ TRÍ BANNER ---
    // Mặc định để ảnh placeholder để bạn dễ nhìn thấy vị trí trên trang
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
                // Gọi API lấy tất cả banner
                const res = await ClientBannerService.getAll();
                console.log("🔥 API Banner Response:", res.data); // Kiểm tra xem có dữ liệu không

                if (res.data.status && Array.isArray(res.data.data)) {
                    const allBanners = res.data.data;

                    // 🛠 HÀM LỌC MẠNH MẼ (Chuyển về chữ thường để so sánh)
                    const findBanner = (pos) => allBanners.find(b =>
                        b.position && b.position.toLowerCase() === pos.toLowerCase()
                    );

                    // 1️⃣ TOP HEADER (Banner trên cùng)
                    const topItem = findBanner('top_header');
                    if (topItem && topItem.image) {
                        setTopHeaderBanner(getBannerUrl(topItem.image));
                    } else {
                        setTopHeaderBanner(null); // Ẩn nếu không có banner thật
                    }

                    // 2️⃣ SLIDESHOW (Banner to giữa màn hình)
                    const slideItem = findBanner('slideshow');
                    if (slideItem && slideItem.image) {
                        setSlideshowBanner(getBannerUrl(slideItem.image));
                    }

                    // 3️⃣ ADS (Quảng cáo nhỏ trong lưới sản phẩm)
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
                console.error("Lỗi tải banner:", error);
            }
        };

        fetchBanners();
    }, []);

    // --- 2. LẤY DỮ LIỆU SẢN PHẨM (GIỮ NGUYÊN) ---
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const params = { sort: sort, limit: 11 };
                const response = await ClientProductService.getNew(params);
                const result = response.data;

                let apiProducts = [];
                if (result && result.status) {
                    if (Array.isArray(result.data)) apiProducts = result.data;
                    else if (result.data && Array.isArray(result.data.data)) apiProducts = result.data.data;
                }

                if (apiProducts.length > 0) {
                    const mappedProducts = apiProducts.map(item => ({
                        id: item.id,
                        brand: "DIOR",
                        name: item.name,
                        price: item.price_sale ? formatMoney(item.price_sale) : formatMoney(item.price_buy),
                        originalPrice: item.price_sale ? formatMoney(item.price_buy) : null,
                        // ✅ GIỮ NGUYÊN LOGIC ẢNH SẢN PHẨM CŨ
                        img: item.thumbnail ? getImageUrl(item.thumbnail) : "https://placehold.co/300x300?text=No+Img",
                        rating: 4.5,
                        reviews: 1.2,
                        colors: 5,
                        badges: [item.price_sale ? "GIẢM GIÁ" : null, "MỚI"].filter(Boolean)
                    }));
                    setProducts(mappedProducts);
                } else { setProducts([]); }
            } catch (error) { console.error("Lỗi tải sản phẩm:", error); }
            finally { setLoading(false); }
        };
        fetchProducts();
    }, [sort]);

    return (
        <div className="min-h-screen bg-white text-gray-900 max-w-7xl mx-auto px-6 py-8">
            <main className="w-full space-y-8">

                {/* 🔴 VỊ TRÍ 1: TOP HEADER BANNER 
                    (Nằm trên cùng, trước cả Header Results) 
                */}
                {topHeaderBanner && (
                    <div className="w-full rounded-lg overflow-hidden shadow-sm border border-gray-100">
                        <img
                            src={topHeaderBanner}
                            alt="Banner Khuyến Mãi Trên Cùng"
                            className="w-full h-auto max-h-[150px] object-cover"
                            onError={(e) => e.target.style.display = 'none'}
                        />
                    </div>
                )}

                {/* HEADER */}
                <div className="flex justify-between items-center">
                    <div className="text-sm font-normal">{products.length} Kết quả</div>
                </div>

                <div className="grid grid-cols-12 gap-6">

                    {/* 🔴 VỊ TRÍ 2: SLIDESHOW 
                        (Banner to nhất, chiếm 12 cột) 
                    */}
                    <div className="col-span-12">
                        <div className="w-full h-[350px] sm:h-[400px] overflow-hidden rounded-lg bg-gray-100 shadow-md relative group">
                            <img
                                src={slideshowBanner}
                                alt="Banner Slideshow Chính"
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = DEFAULT_BANNER;
                                }}
                            />
                            <div className="absolute top-2 left-2 text-white text-xs px-2 py-1 rounded"></div>
                        </div>
                    </div>


                    {/* LIST SẢN PHẨM */}
                    <div className="col-span-12">
                        {/* TIÊU ĐỀ SẢN PHẨM MỚI NHẤT */}
                        <div className="mb-10 flex items-center justify-between border-b border-gray-100 pb-5">
                            <div>
                                <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 uppercase">
                                    Sản Phẩm Mới
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Khám phá những xu hướng làm đẹp mới nhất vừa cập bến.
                                </p>
                            </div>
                            <Link href="/products" className="text-sm font-bold text-black hover:underline hidden sm:block">
                                Xem tất cả <i className="fa-solid fa-chevron-right ml-1 text-[10px]"></i>
                            </Link>
                        </div>
                        {loading ? (
                            <div className="text-center py-20 flex justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">

                                {products.map((p) => (
                                    <Fragment key={p.id}>
                                        <article className="group flex flex-col items-center text-center h-full relative">
                                            <div className="relative w-full">
                                                <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                                                    {p.badges && p.badges.map((b) => (
                                                        <span key={b} className={`text-[10px] px-2 py-1 rounded font-semibold text-white ${b === 'GIẢM GIÁ' ? 'bg-red-600' : 'bg-black'}`}>{b}</span>
                                                    ))}
                                                </div>
                                                <button className="absolute top-2 right-2 text-xl text-gray-400 hover:text-red-500 z-10 transition-colors"><i className="fa-regular fa-heart"></i></button>
                                                <Link href={`/products/${p.id}`} className="block">
                                                    <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-center h-72 w-full group-hover:bg-gray-100 transition-colors cursor-pointer">
                                                        <img src={p.img} alt={p.name} className="max-h-full max-w-full object-contain mix-blend-multiply" />
                                                    </div>
                                                </Link>
                                            </div>
                                            <div className="mt-4 text-left w-full px-2 flex flex-col grow">
                                                <div className="text-xs font-bold text-gray-800 uppercase">{p.brand}</div>
                                                <Link href={`/products/${p.id}`} className="block">
                                                    <div className="font-medium mt-1 text-sm text-gray-900 leading-tight group-hover:underline cursor-pointer line-clamp-2 h-10 overflow-hidden">{p.name}</div>
                                                </Link>
                                                <div className="text-xs text-gray-500 mt-1">{p.colors} Màu sắc</div>
                                                <div className="flex items-center gap-1 mt-2 text-yellow-500">
                                                    {Array.from({ length: 5 }).map((_, i) => (<i key={i} className={`fa-star ${i < Math.round(p.rating) ? "fa-solid" : "fa-regular"}`}></i>))}
                                                    <span className="text-xs text-gray-500 ml-1">({p.reviews}k)</span>
                                                </div>
                                                <div className="mt-2 flex items-center gap-2">
                                                    <span className={`font-semibold text-gray-900 ${p.originalPrice ? 'text-red-600' : ''}`}>{p.price}</span>
                                                    {p.originalPrice && <span className="text-xs text-gray-400 line-through">{p.originalPrice}</span>}
                                                </div>
                                            </div>
                                        </article>
                                    </Fragment>
                                ))}

                                {/* 🔴 VỊ TRÍ 3: ADS (QUẢNG CÁO NHỎ) 
                                    (Nằm lẫn vào danh sách sản phẩm) 
                                */}
                                <article className="group col-span-1 flex flex-col items-center justify-center bg-gray-100 rounded-lg text-center h-full min-h-[300px] relative overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-shadow border border-dashed border-gray-300">
                                    <Link href={promoCard.link} className="absolute inset-0 z-20"></Link>
                                    <img
                                        src={promoCard.img}
                                        alt="Banner Quảng Cáo"
                                        className="absolute inset-0 w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = DEFAULT_PROMO;
                                        }}
                                    />
                                    <div className="absolute top-2 right-2 z-10 text-white text-[10px] px-2 rounded"></div>
                                    <div className="relative z-10 px-6 py-2 rounded-full mt-32 transform group-hover:-translate-y-2 transition-transform">
                                        <span className="text-xs font-bold tracking-widest text-black uppercase"></span>
                                    </div>
                                </article>

                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
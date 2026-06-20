"use client";
import React, { useState, useEffect, use } from 'react'; 
import { useRouter } from 'next/navigation'; 
import Link from 'next/link'; // Import Link để chuyển trang
import ProductDetailGallery from '../../components/product/ProductDetailGallery';
import StarsRating from '../../components/shared/StarsRating';
import Button from '../../components/shared/Button';
import ClientProductService from '@/services/ClientProductService'; 

// Hàm bổ trợ định dạng tiền tệ (Đã chuyển sang VND ₫)
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(amount));
};

const BACKEND_DOMAIN = 'http://localhost:8000';

const ProductDetailPage = ({ params }) => {
    const { id } = use(params);
    const router = useRouter(); 

    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]); // State cho sản phẩm liên quan
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [addingToCart, setAddingToCart] = useState(false); 

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);
                // GỌI SONG SONG: Chi tiết sản phẩm và Sản phẩm liên quan để tối ưu tốc độ
                const [response, relatedRes] = await Promise.all([
                    ClientProductService.getDetail(id),
                    ClientProductService.getRelated(id)
                ]);
                
                // Xử lý chi tiết sản phẩm
                if (response && response.data && response.data.status) {
                    const apiData = response.data.data;
                    const priceBuy = Number(apiData.price_buy);
                    const priceSale = apiData.price_sale ? Number(apiData.price_sale) : 0;
                    const isOnSale = priceSale > 0 && priceSale < priceBuy;

                    let imageUrls = [];
                    if (apiData.images && apiData.images.length > 0) {
                        imageUrls = apiData.images.map(img => 
                            img.image.startsWith('http') ? img.image : `${BACKEND_DOMAIN}/storage/${img.image}`
                        );
                    } else {
                        const thumb = apiData.thumbnail 
                            ? (apiData.thumbnail.startsWith('http') ? apiData.thumbnail : `${BACKEND_DOMAIN}/storage/${apiData.thumbnail}`)
                            : 'https://via.placeholder.com/500';
                        imageUrls = [thumb];
                    }

                    const mappedProduct = {
                        id: apiData.id,
                        brand: apiData.category ? apiData.category.name : "BỘ SƯU TẬP SEPHORA", 
                        name: apiData.name,
                        shade: apiData.short_description || 'Màu sắc cơ bản', 
                        price: isOnSale ? priceSale : priceBuy,
                        originalPrice: isOnSale ? priceBuy : null,
                        rating: 4.5,
                        reviewCount: 120,
                        questionsCount: 'Đặt câu hỏi',
                        soldCount: '1.2K',
                        status: apiData.status === 1 ? 'CÒN HÀNG' : 'HẾT HÀNG',
                        isNew: true,
                        imageUrls: imageUrls,
                        description: apiData.description, 
                        standardSizes: [
                            { label: 'MỚI', color: 'bg-white', text: '001 Bán chạy nhất' },
                            { label: 'MỚI', color: 'bg-pink-100', text: '002 Ngọc trai hồng' },
                            { label: 'MỚI', color: 'bg-yellow-100', text: '003 Ánh vàng' },
                        ]
                    };
                    setProduct(mappedProduct);
                } else {
                    setError("Không tìm thấy sản phẩm.");
                }

                // Xử lý sản phẩm liên quan
                if (relatedRes && relatedRes.data && relatedRes.data.status) {
                    setRelatedProducts(relatedRes.data.data);
                }

            } catch (err) {
                console.error("Lỗi khi tải dữ liệu:", err);
                setError("Lỗi kết nối đến máy chủ.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchAllData();
            // Cuộn lên đầu trang khi ID thay đổi (người dùng click từ sản phẩm liên quan)
            window.scrollTo(0, 0);
        }
    }, [id]);

    const handleAddToCart = () => {
        if (!product) return;
        setAddingToCart(true);
        try {
            const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
            const existingItemIndex = currentCart.findIndex(item => item.id === product.id);
            if (existingItemIndex > -1) {
                currentCart[existingItemIndex].qty += 1;
            } else {
                currentCart.push({
                    id: product.id,
                    name: product.name,
                    brand: product.brand,
                    price: product.price,
                    image: product.imageUrls[0], 
                    shade: product.shade,
                    qty: 1
                });
            }
            localStorage.setItem('cart', JSON.stringify(currentCart));
            window.dispatchEvent(new Event('cart-updated'));
            setTimeout(() => router.push('/cart'), 500);
        } catch (error) {
            console.error("Lỗi thêm vào giỏ hàng:", error);
            setAddingToCart(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center min-h-[60vh] text-gray-500"><i className="fa-solid fa-spinner fa-spin mr-2"></i> Đang tải thông tin...</div>;
    if (error) return <div className="flex justify-center items-center min-h-[60vh] text-red-500 font-bold">{error}</div>;
    if (!product) return null;

    const isOutOfStock = product.status !== 'CÒN HÀNG';

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 bg-white">
            {/* Breadcrumb - Đường dẫn điều hướng */}
            <div className="text-sm text-gray-500 mb-6">
                Trang chủ &gt; Sản phẩm &gt; <span className="text-black font-medium">{product.name}</span>
            </div>

            <div className="flex flex-col lg:flex-row gap-12">
                {/* Cột Trái: Bộ sưu tập ảnh */}
                <div className="lg:w-3/5">
                    <ProductDetailGallery images={product.imageUrls} />
                </div>

                {/* Cột Phải: Thông tin chi tiết */}
                <div className="lg:w-2/5 space-y-5">
                    <h1 className="text-sm font-bold tracking-widest text-gray-900 uppercase">{product.brand}</h1>
                    <h2 className="text-3xl font-light leading-tight text-gray-900">{product.name}</h2>
                    
                    <div className="flex items-center space-x-4 border-b border-gray-200 pb-5">
                        <StarsRating rating={product.rating} reviewCount={product.reviewCount} />
                        <span className="text-sm text-gray-400 hidden sm:inline">|</span>
                        <span className="text-sm text-gray-500 hover:underline cursor-pointer">{product.questionsCount}</span>
                        <span className="text-sm text-gray-400 hidden sm:inline">|</span>
                        <span className="text-sm text-gray-500">Đã bán {product.soldCount}</span>
                    </div>

                    <div className="mt-2 flex items-center gap-3">
                        {product.originalPrice ? (
                            <>
                                <span className="text-3xl font-bold text-red-600">{formatCurrency(product.price)}</span>
                                <span className="text-xl text-gray-400 line-through font-normal">{formatCurrency(product.originalPrice)}</span>
                                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded">GIẢM GIÁ</span>
                            </>
                        ) : (
                            <span className="text-3xl font-bold text-black">{formatCurrency(product.price)}</span>
                        )}
                    </div>

                    <div className="space-y-3 pt-4">
                        <p className="font-semibold text-sm">Màu sắc: <span className="font-normal text-gray-600">{product.shade}</span></p>
                        <div className="flex gap-3 flex-wrap">
                            {product.standardSizes.map((size, index) => (
                                <div key={index} title={size.text} className={`relative w-10 h-10 flex items-center justify-center border rounded-md cursor-pointer hover:border-black transition-colors shadow-sm ${size.color}`}>
                                    <span className="text-[8px] absolute -top-1.5 -right-1.5 bg-black text-white px-1 font-bold rounded-sm">MỚI</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4">
                        {isOutOfStock ? (
                            <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-500 px-3 py-1.5 rounded text-sm font-semibold"><i className="fa-solid fa-circle-xmark"></i> Hết hàng</div>
                        ) : (
                            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded text-sm font-semibold border border-green-200"><i className="fa-solid fa-check-circle"></i> Còn hàng</div>
                        )}
                    </div>

                    <div className="flex flex-col gap-3 pt-6">
                        <Button variant="primary" disabled={isOutOfStock || addingToCart} className={`w-full py-4 text-lg shadow-md transition-transform active:scale-95 ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={handleAddToCart}>
                            {addingToCart ? <span className="flex items-center justify-center gap-2"><i className="fa-solid fa-spinner fa-spin"></i> Đang xử lý...</span> : (isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ hàng')}
                        </Button>
                        <button className="w-full py-3.5 border border-gray-300 rounded-full text-base font-semibold text-gray-700 hover:border-black hover:bg-gray-50 transition-all flex items-center justify-center gap-2"><i className="fa-regular fa-heart"></i> Thêm vào yêu thích</button>
                    </div>

                    <div className="bg-gray-50 p-5 rounded-lg text-sm mt-4 space-y-3 text-gray-700 border border-gray-100">
                        <div className="flex items-center gap-3"><i className="fa-solid fa-truck-fast text-lg text-black"></i><span>Miễn phí vận chuyển cho đơn hàng từ <strong>1.000.000đ</strong></span></div>
                        <div className="flex items-center gap-3"><i className="fa-solid fa-box-open text-lg text-black"></i><span>Đổi trả miễn phí trong vòng <strong>30 ngày</strong></span></div>
                    </div>
                </div>
            </div>

            {/* Chi tiết sản phẩm */}
            <div className="mt-20 pt-10 border-t border-gray-200">
                <h3 className="text-2xl font-bold mb-8 text-gray-900 text-center">Chi Tiết Sản Phẩm</h3>
                <div className="max-w-4xl mx-auto bg-gray-50 p-8 rounded-xl border border-gray-100">
                    <div className="text-gray-800 prose prose-lg max-w-none leading-relaxed content-detail" dangerouslySetInnerHTML={{ __html: product.description }} />
                </div>
            </div>

            {/* --- PHẦN SẢN PHẨM LIÊN QUAN --- */}
            {relatedProducts.length > 0 && (
                <div className="mt-24 pt-10 border-t border-gray-200">
                    <h3 className="text-2xl font-bold mb-10 text-gray-900">Có thể bạn cũng thích</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {relatedProducts.map((item) => (
                            <Link 
                                href={`/products/${item.id}`} 
                                key={item.id} 
                                className="group flex flex-col"
                            >
                                <div className="aspect-square overflow-hidden bg-gray-100 rounded-lg mb-4 relative">
                                    <img 
                                        src={item.thumbnail?.startsWith('http') ? item.thumbnail : `${BACKEND_DOMAIN}/storage/${item.thumbnail}`} 
                                        alt={item.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    {item.price_sale > 0 && item.price_sale < item.price_buy && (
                                        <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">GIẢM GIÁ</span>
                                    )}
                                </div>
                                <h4 className="text-[10px] font-extrabold uppercase text-gray-900 mb-1">
                                    {item.category?.name || "SEPHORA"}
                                </h4>
                                <p className="text-sm text-gray-800 line-clamp-2 group-hover:underline mb-2 h-10">
                                    {item.name}
                                </p>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold">
                                        {formatCurrency(item.price_sale > 0 ? item.price_sale : item.price_buy)}
                                    </span>
                                    {item.price_sale > 0 && (
                                        <span className="text-xs text-gray-400 line-through">
                                            {formatCurrency(item.price_buy)}
                                        </span>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            <style jsx global>{`
                .content-detail h2 { font-size: 1.5rem; font-weight: bold; margin-top: 1.5em; margin-bottom: 0.8em; }
                .content-detail p { margin-bottom: 1em; line-height: 1.7; }
                .content-detail ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 1em; }
                .content-detail img { max-width: 100%; height: auto; border-radius: 8px; margin: 1em 0; }
            `}</style>
        </div>
    );
};

export default ProductDetailPage;
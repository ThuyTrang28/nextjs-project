"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // 1. Import useRouter
import ClientProductService from '@/services/ClientProductService';

const SalePage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter(); // 2. Hook Router

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await ClientProductService.getSale(20); 
                if (response && response.data && response.data.status) {
                    setProducts(response.data.data);
                }
            } catch (error) {
                console.error("Lỗi tải sản phẩm khuyến mãi:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- LOGIC MUA NGAY ---
    const handleBuyNow = (e, product) => {
        // 3. Ngăn chặn sự kiện click lan ra thẻ Link cha (quan trọng!)
        e.preventDefault(); 
        e.stopPropagation();

        try {
            // Lấy giỏ hàng cũ
            const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
            
            // Kiểm tra sản phẩm có trong giỏ chưa
            const existingItemIndex = currentCart.findIndex(item => item.id === product.id);

            if (existingItemIndex > -1) {
                currentCart[existingItemIndex].qty += 1;
            } else {
                // Thêm mới (Map dữ liệu cho đúng format Cart)
                const newItem = {
                    id: product.id,
                    name: product.name,
                    brand: "DIOR", // Hoặc lấy từ product.brand_name nếu có
                    price: product.price_sale ? Number(product.price_sale) : Number(product.price_buy), // Ưu tiên giá Sale
                    image: product.thumbnail 
                        ? (product.thumbnail.startsWith('http') ? product.thumbnail : `http://localhost:8000/storage/${product.thumbnail}`) 
                        : "https://via.placeholder.com/300",
                    shade: "Universal Shade", // Giá trị mặc định
                    qty: 1
                };
                currentCart.push(newItem);
            }

            // Lưu lại & Phát event
            localStorage.setItem('cart', JSON.stringify(currentCart));
            window.dispatchEvent(new Event('cart-updated'));

            // 4. Chuyển hướng sang Cart
            router.push('/cart');

        } catch (error) {
            console.error("Lỗi mua ngay:", error);
        }
    };

    // Helper functions
    const calculateDiscount = (original, sale) => {
        if (!original || !sale) return 0;
        return Math.round(((original - sale) / original) * 100);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(price));
    };

    const getImageUrl = (thumbnail) => {
        if (!thumbnail) return "https://via.placeholder.com/300";
        return thumbnail.startsWith('http') ? thumbnail : `http://localhost:8000/storage/${thumbnail}`;
    };

    if (loading) return (
        <div className="min-h-screen flex justify-center items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="bg-red-50 border border-red-100 rounded-2xl p-8 mb-12 text-center">
                <h1 className="text-4xl font-extrabold text-red-600 uppercase tracking-wide mb-2">
                    Flash Sale 🔥
                </h1>
                <p className="text-gray-600">
                    Grab the hottest deals at unbeatable prices. Limited quantities available.!
                </p>
            </div>

            {products.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-gray-500 text-lg">There are currently no promotions.</p>
                    <Link href="/" className="text-red-600 hover:underline mt-2 inline-block font-semibold">
                        Back to Home
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map((product) => {
                        const discount = calculateDiscount(product.price_buy, product.price_sale);

                        return (
                            <Link href={`/product/${product.id}`} key={product.id} className="group block">
                                <article className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                                    
                                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                                        <img 
                                            src={getImageUrl(product.thumbnail)} 
                                            alt={product.name} 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 mix-blend-multiply"
                                        />
                                        <span className="absolute top-0 right-0 bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-bl-lg z-10">
                                            -{discount}%
                                        </span>
                                    </div>

                                    <div className="p-4 flex flex-col grow">
                                        <div className="text-xs font-bold text-gray-400 mb-1 uppercase">
                                            Limited Time Offer
                                        </div>
                                        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-red-600 transition-colors">
                                            {product.name}
                                        </h3>
                                        
                                        <div className="mt-auto flex items-end gap-2">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-gray-400 line-through">
                                                    {formatPrice(product.price_buy)}
                                                </span>
                                                <span className="text-xl font-bold text-red-600">
                                                    {formatPrice(product.price_sale)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Nút Mua Ngay - Gắn sự kiện onClick */}
                                        <button 
                                            className="w-full mt-4 py-2 rounded-lg border border-red-600 text-red-600 font-bold text-sm hover:bg-red-600 hover:text-white transition-colors z-20 relative"
                                            onClick={(e) => handleBuyNow(e, product)}
                                        >
                                            Buy now
                                        </button>
                                    </div>
                                </article>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default SalePage;
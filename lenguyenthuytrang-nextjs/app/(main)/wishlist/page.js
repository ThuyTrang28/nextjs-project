"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const DUMMY_PRODUCTS = [
    {
        id: 1,
        brand: 'DIOR',
        name: 'Backstage Glow Maximizer Face Palette',
        price: '$54.00',
        rating: 4.5,
        reviews: 607,
        image: 'https://via.placeholder.com/300x300/f0f0f0?text=DIOR+Glow',
    },
    {
        id: 2,
        brand: 'rhode',
        name: 'Pocket Blush Buildable Hydrating Cream Blush',
        price: '$25.00',
        rating: 4.8,
        reviews: 887,
        isClean: true,
        image: 'https://via.placeholder.com/300x300/f0f0f0?text=rhode+Blush',
    },
    {
        id: 3,
        brand: 'PATRICK TA',
        name: 'Major Headlines Double-Take Crème & Powder Blush',
        priceRange: '$25.00 - $38.00',
        rating: 4.2,
        reviews: '3.9K',
        image: 'https://via.placeholder.com/300x300/f0f0f0?text=PATRICK+TA',
    },
    {
        id: 4,
        brand: 'HUDA BEAUTY',
        name: 'Easy Bake Blurring Loose Baking & Setting Powder',
        priceRange: '$23.00 - $39.00',
        rating: 4.7,
        reviews: '13.3K',
        image: 'https://via.placeholder.com/300x300/f0f0f0?text=HUDA+Powder',
    },
    {
        id: 5,
        brand: 'DIOR',
        name: 'Rosy Glow Powder Blush',
        price: '$42.00',
        rating: 4.6,
        reviews: 824,
        image: 'https://via.placeholder.com/300x300/f0f0f0?text=DIOR+Blush',
    },
    {
        id: 6,
        brand: 'Rare Beauty by Selena Go...',
        name: 'Soft Pinch Liquid Blush',
        priceRange: '$15.00 - $25.00',
        rating: 4.9,
        reviews: '12.3K',
        isNew: true,
        isSale: true,
        image: 'https://via.placeholder.com/300x300/f0f0f0?text=Rare+Beauty',
    },
];


// Component hiển thị thông tin rating và review
const ProductRating = ({ rating, reviews }) => (
    <div className="flex items-center text-xs mt-1">
        {/* Giả lập rating stars */}
        <div className="text-black/80">
            {'★'.repeat(Math.floor(rating))}
            {'☆'.repeat(5 - Math.floor(rating))}
        </div>
        <span className="text-gray-500 ml-1">({reviews})</span>
    </div>
);

// Component hiển thị một sản phẩm duy nhất
const ProductCard = ({ product }) => {
    // Sử dụng đường dẫn hình ảnh giả lập (bạn cần thay thế bằng component <Image> của Next.js và ảnh thật)
    const imagePlaceholderUrl = product.image;

    return (
        <div className="w-full border border-gray-200 rounded-lg overflow-hidden relative cursor-pointer group">
            {/* Vùng ảnh */}
            <div className="relative bg-white pt-4 pb-2 px-2">
                <img
                    src={imagePlaceholderUrl}
                    alt={product.name}
                    className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />

                {/* Icon trái tim ở góc phải trên */}
                <i className="fa-solid fa-heart absolute top-3 right-3 text-red-500 hover:text-red-700 transition-colors text-xl"></i>

                {/* Label NEW */}
                {product.isNew && (
                    <span className="absolute top-3 left-3 bg-white text-black text-[10px] font-bold px-2 py-0.5 rounded-full border border-black">
                        NEW
                    </span>
                )}

                {/* Label CLEAN (Ví dụ: rhode) */}
                {product.isClean && (
                    <div className="absolute bottom-3 right-3 text-green-600 bg-white rounded-full p-1 shadow-md">
                        <span className="text-xs font-bold">✅ Clean</span>
                    </div>
                )}
            </div>

            {/* Thông tin sản phẩm */}
            <div className="p-3 text-left">
                <div className="text-gray-600 text-xs font-semibold uppercase">{product.brand}</div>
                <div className="text-sm mt-1 leading-tight min-h-10">{product.name}</div>

                {/* Giá */}
                <div className="font-bold mt-2">
                    {product.price || product.priceRange}
                </div>

                {/* Rating */}
                <ProductRating rating={product.rating} reviews={product.reviews} />

            </div>
        </div>
    );
};


export default function LovesPageContent() {
    return (
        <main className="font-sans antialiased bg-white min-h-screen">
            <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-12">

                {/* --- PHẦN 1 & 2: HEADER VÀ NÚT ĐĂNG NHẬP --- */}
                <div className="text-center mb-16">
                    {/* Biểu tượng trang điểm lớn: thay thế bằng ICON hoặc IMG */}
                    {/* Giả lập ICON bằng Font Awesome */}
                    <div className="text-center mb-6">
                        {/* Sử dụng Next.js Image Component để tối ưu hóa ảnh */}
                        <Image
                            src="/images/makeup-icon.png" // Thay đổi đường dẫn đến file icon của bạn
                            alt="Makeup and Heart Icon"
                            width={200} // Điều chỉnh kích thước phù hợp
                            height={200} // Điều chỉnh kích thước phù hợp
                            className="mx-auto" // Căn giữa hình ảnh
                        />
                    </div>

                    <p className="text-sm text-black mb-8 max-w-sm mx-auto">
                        Sign in to organize and share your saved products.
                    </p>

                    {/* Nút Sign In */}
                    <Link
                        href="/auth/sign-in" // Đặt đường dẫn chuyển hướng đến trang đăng nhập
                        passHref
                        className="w-full max-w-xs mx-auto block" // Chuyển các lớp bố cục sang Link
                    >
                        <button
                            type="button" // Sử dụng type="button" để tránh hành vi gửi form mặc định
                            className="bg-black text-white px-12 py-3 text-lg font-semibold rounded-full hover:bg-gray-800 transition shadow-lg w-full"
                        >
                            Sign In
                        </button>
                    </Link>
                </div>

                {/* --- PHẦN 3: DANH SÁCH SẢN PHẨM --- */}
                <div className="mt-16">
                    <h2 className="text-2xl font-bold mb-8 text-center md:text-left">
                        We Think You'll Love
                    </h2>

                    {/* Lưới sản phẩm */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-10">
                        {DUMMY_PRODUCTS.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>

            </div>
            {/* Nạp Font Awesome cho Icons */}
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        </main>
    );
}
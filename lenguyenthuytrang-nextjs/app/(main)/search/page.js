"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation'; // Hook lấy tham số URL
import ClientProductService from '@/services/ClientProductService';

const SearchPage = () => {
    // 1. Lấy từ khóa tìm kiếm từ URL (ví dụ: ?q=son)
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || ''; 

    // 2. State quản lý dữ liệu
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // 3. Gọi API khi query thay đổi
    useEffect(() => {
        const fetchSearchResults = async () => {
            setLoading(true);
            try {
                if (!query) {
                    setProducts([]);
                    return;
                }

                // Gọi API getAll với tham số search
                const response = await ClientProductService.getAll({ search: query });
                
                // Kiểm tra cấu trúc trả về của Laravel (thường là response.data.data cho phân trang)
                if (response && response.data && response.data.data) {
                    // Nếu Laravel trả về paginate, dữ liệu nằm trong data.data.data
                    // Nếu Laravel trả về collection thường, dữ liệu nằm trong data.data
                    const resultData = response.data.data.data ? response.data.data.data : response.data.data;
                    setProducts(resultData || []); 
                }
            } catch (error) {
                console.error("Lỗi tìm kiếm:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSearchResults();
    }, [query]);

    // Helper: Format tiền tệ
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(price));
    };

    // Helper: Xử lý ảnh
    const getImageUrl = (thumbnail) => {
        if (!thumbnail) return "https://via.placeholder.com/300";
        return thumbnail.startsWith('http') ? thumbnail : `http://localhost:8000/storage/${thumbnail}`;
    };

    // --- GIAO DIỆN LOADING ---
    if (loading) return (
        <div className="min-h-screen flex justify-center items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black"></div>
        </div>
    );

    // --- GIAO DIỆN CHÍNH ---
    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <h1 className="text-3xl font-semibold mb-6">
                Search results for: "<span className="text-red-600">{query}</span>"
            </h1>
            
            {products.length > 0 ? (
                <>
                    <p className="text-gray-600 mb-8">Found <strong>{products.length}</strong> relevant results.</p>
                    
                    {/* Grid Sản Phẩm */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <Link href={`/products/${product.id}`} key={product.id} className="group block">
                                <article className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                                    {/* Ảnh */}
                                    <div className="relative aspect-square bg-gray-100 overflow-hidden">
                                        <img 
                                            src={getImageUrl(product.thumbnail)} 
                                            alt={product.name} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 mix-blend-multiply"
                                        />
                                        {/* Badge New nếu có */}
                                        {product.status === 1 && (
                                            <span className="absolute top-2 left-2 bg-black text-white text-[10px] px-2 py-1 uppercase font-bold">
                                                New
                                            </span>
                                        )}
                                    </div>

                                    {/* Thông tin */}
                                    <div className="p-4 flex flex-col grow">
                                        <div className="text-xs font-bold text-gray-500 mb-1 uppercase">
                                            SEPHORA COLLECTION
                                        </div>
                                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:underline">
                                            {product.name}
                                        </h3>
                                        
                                        <div className="mt-auto pt-2 border-t border-gray-100">
                                            <span className="font-bold text-gray-900 text-lg">
                                                {formatPrice(product.price_buy)}
                                            </span>
                                        </div>
                                    </div>
                                </article>
                            </Link>
                        ))}
                    </div>
                </>
            ) : (
                // Trường hợp không tìm thấy
                <div className="text-center py-20 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                    <i className="fa-solid fa-face-frown text-5xl text-gray-400 mb-4"></i>
                    <p className="text-xl text-gray-600 font-medium">Sorry, no results match your request.</p>
                    <p className="text-gray-500 mt-2">Try a different keyword or check your spelling.</p>
                    <Link href="/" className="inline-block mt-6 px-6 py-2 bg-black text-white rounded-full font-bold hover:bg-gray-800 transition">
                        Back to Home
                    </Link>
                </div>
            )}
        </div>
    );
};

export default SearchPage;
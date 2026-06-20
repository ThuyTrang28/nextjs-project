"use client";
import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import ClientProductService from '@/services/ClientProductService';
import ClientCategoryService from '@/services/ClientCategoryService';

const CategoryPage = ({ params }) => {
    // 1. Unwrap params để lấy slug (Next.js 15+)
    const { slug } = use(params);

    // 2. State
    const [products, setProducts] = useState([]);
    const [categoryInfo, setCategoryInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    // 3. Gọi API lấy dữ liệu
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Gọi song song 2 API: Lấy thông tin danh mục & Lấy sản phẩm
                const [productRes, categoryRes] = await Promise.all([
                    // Gọi API lấy sản phẩm theo category_slug
                    ClientProductService.getAll({ category_slug: slug }),
                    // Gọi API lấy thông tin chi tiết danh mục (để hiển thị tên)
                    ClientCategoryService.getBySlug(slug)
                ]);

                // Xử lý dữ liệu sản phẩm
                if (productRes && productRes.data && productRes.data.data) {
                    // productRes.data.data ở đây là object phân trang của Laravel ({ data: [], current_page: ... })
                    // hoặc là mảng tùy vào cách bạn trả về ở Controller. 
                    // Dựa vào code Controller cũ, nó là: { status: true, data: { ...paginate object... } }
                    
                    const productsData = productRes.data.data.data || []; // Lấy mảng sản phẩm trong object phân trang
                    setProducts(productsData);
                }

                // Xử lý thông tin danh mục
                if (categoryRes && categoryRes.data && categoryRes.data.data) {
                    setCategoryInfo(categoryRes.data.data.category_info);
                }

            } catch (error) {
                console.error("Lỗi tải dữ liệu danh mục:", error);
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchData();
        }
    }, [slug]);

    // Helper format tiền
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(price));
    };

    // Helper xử lý ảnh
    const getImageUrl = (thumbnail) => {
        if (!thumbnail) return "https://via.placeholder.com/300";
        return thumbnail.startsWith('http') ? thumbnail : `http://localhost:8000/storage/${thumbnail}`;
    };

    if (loading) return <div className="min-h-screen flex justify-center items-center">Loading...</div>;

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            {/* Tiêu đề danh mục */}
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold uppercase mb-2">
                    {categoryInfo ? categoryInfo.name : slug}
                </h1>
                {categoryInfo && categoryInfo.description && (
                    <p className="text-gray-500 max-w-2xl mx-auto">{categoryInfo.description}</p>
                )}
            </div>

            {/* Danh sách sản phẩm */}
            {products.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">Chưa có sản phẩm nào trong danh mục này.</p>
                    <Link href="/" className="text-blue-600 hover:underline mt-2 inline-block">Back to Home</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <Link href={`/products/${product.id}`} key={product.id} className="group">
                            <div className="flex flex-col h-full">
                                {/* Ảnh */}
                                <div className="bg-gray-100 rounded-lg overflow-hidden relative aspect-square mb-4">
                                    <img 
                                        src={getImageUrl(product.thumbnail)} 
                                        alt={product.name} 
                                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 mix-blend-multiply"
                                    />
                                    {/* Badge Status */}
                                    {product.status === 1 && (
                                        <span className="absolute top-2 left-2 bg-black text-white text-[10px] font-bold px-2 py-1 rounded">
                                            NEW
                                        </span>
                                    )}
                                </div>

                                {/* Thông tin */}
                                <div>
                                    <h3 className="text-xs font-bold text-gray-900 mb-1">
                                        {categoryInfo ? categoryInfo.name : "DIOR"}
                                    </h3>
                                    <h2 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:underline mb-1">
                                        {product.name}
                                    </h2>
                                    <p className="text-sm font-bold text-gray-900">
                                        {formatPrice(product.price_buy)}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CategoryPage;
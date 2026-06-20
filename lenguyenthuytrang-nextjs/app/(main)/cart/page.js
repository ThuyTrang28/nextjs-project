"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Import useRouter để chuyển trang
import Button from '../components/shared/Button';
import { useAuth } from '../components/context/AuthContext'; // Import useAuth để check đăng nhập

const CartPage = () => {
    const [cartItems, setCartItems] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const router = useRouter();
    const { user } = useAuth(); // Lấy thông tin user từ AuthContext

    // 1. Load dữ liệu từ LocalStorage khi mount
    useEffect(() => {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            setCartItems(JSON.parse(storedCart));
        }
        setIsLoaded(true);
    }, []);

    // 2. Hàm cập nhật LocalStorage và State
    const updateCartData = (newItems) => {
        setCartItems(newItems);
        localStorage.setItem('cart', JSON.stringify(newItems));
        window.dispatchEvent(new Event('cart-updated'));
    };

    // 3. Xử lý thay đổi số lượng
    const handleQuantityChange = (id, newQty) => {
        if (newQty < 1) return;
        const updatedItems = cartItems.map(item => 
            item.id === id ? { ...item, qty: parseInt(newQty) } : item
        );
        updateCartData(updatedItems);
    };

    // 4. Xử lý xóa sản phẩm
    const handleRemoveItem = (id) => {
        const updatedItems = cartItems.filter(item => item.id !== id);
        updateCartData(updatedItems);
    };

    // 5. Xử lý khi bấm "Tiến hành Thanh toán"
    const handleCheckout = () => {
        if (user) {
            // Nếu đã đăng nhập -> Vào trang Shipping
            router.push('/checkout/shipping');
        } else {
            // Nếu chưa đăng nhập -> Vào trang Đăng nhập
            // Có thể thêm query param để sau khi login xong redirect lại cart (tùy chọn)
            alert("Vui lòng đăng nhập để tiến hành thanh toán!");
            router.push('/auth/sign-in');
        }
    };

    // 6. Tính toán tổng tiền
    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const shippingFee = subtotal > 50 ? 0 : 10;
    const discount = 0;
    const total = subtotal + shippingFee - discount;

    const formatPrice = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    if (!isLoaded) return <div className="min-h-screen flex justify-center items-center">Loading...</div>;

    if (cartItems.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-20 text-center">
                <h1 className="text-3xl font-bold mb-4">Your shopping cart is empty</h1>
                <p className="text-gray-500 mb-8">Please add a few of your favorite items.!</p>
                <Link href="/" className="bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition">
                    Continue shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <h1 className="text-3xl font-bold mb-8">Your Shopping Cart ({cartItems.length} product)</h1>
            
            <div className="flex flex-col lg:flex-row gap-10">
                {/* --- DANH SÁCH SẢN PHẨM --- */}
                <div className="lg:w-2/3 space-y-6">
                    {cartItems.map((item) => (
                        <div key={item.id} className="flex border p-4 rounded-lg items-start sm:items-center bg-white shadow-sm">
                            <div className="w-24 h-24 bg-gray-100 rounded-md shrink-0 overflow-hidden mr-4">
                                <img 
                                    src={item.image || "https://via.placeholder.com/150"} 
                                    alt={item.name} 
                                    className="w-full h-full object-cover mix-blend-multiply"
                                    onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/150"; }}
                                />
                            </div>

                            <div className="grow">
                                <h3 className="text-xs font-bold text-gray-500 uppercase">{item.brand}</h3>
                                <Link href={`/product/${item.id}`} className="font-semibold text-lg hover:underline line-clamp-1">
                                    {item.name}
                                </Link>
                                <p className="text-sm text-gray-600 mt-1">{item.shade}</p>
                                <p className="font-bold mt-2 text-lg">{formatPrice(item.price)}</p>
                            </div>

                            <div className="flex flex-col items-end space-y-4 ml-4">
                                <div className="flex items-center border border-gray-300 rounded">
                                    <button 
                                        className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                                        onClick={() => handleQuantityChange(item.id, item.qty - 1)}
                                    >-</button>
                                    <input 
                                        type="number" 
                                        value={item.qty} 
                                        readOnly
                                        className="w-10 p-1 text-center text-sm outline-none"
                                    />
                                    <button 
                                        className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                                        onClick={() => handleQuantityChange(item.id, item.qty + 1)}
                                    >+</button>
                                </div>
                                <button 
                                    onClick={() => handleRemoveItem(item.id)}
                                    className="text-red-500 text-sm hover:underline flex items-center gap-1"
                                >
                                    <i className="fa-regular fa-trash-can"></i> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* --- TÓM TẮT ĐƠN HÀNG --- */}
                <div className="lg:w-1/3 h-fit">
                    <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 sticky top-4">
                        <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                        <div className="space-y-3 text-gray-700 border-b border-gray-300 pb-4">
                            <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span>{formatPrice(subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Transportation:</span>
                                {shippingFee === 0 ? (
                                    <span className="text-green-600 font-semibold">Free</span>
                                ) : (
                                    <span>{formatPrice(shippingFee)}</span>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex justify-between font-bold text-xl mt-4 text-black">
                            <span>Total:</span>
                            <span>{formatPrice(total)}</span>
                        </div>

                        {shippingFee > 0 && (
                            <p className="text-xs text-gray-500 mt-2 text-right">
                                Buy more {formatPrice(50 - subtotal)} to get free shipping
                            </p>
                        )}

                        <div className="mt-6">
                            {/* NÚT THANH TOÁN ĐÃ ĐƯỢC CẬP NHẬT LOGIC */}
                            <Button 
                                variant="primary" 
                                className="w-full block text-center py-3"
                                onClick={handleCheckout} // Gọi hàm xử lý check login
                            >
                                Proceed to Payment
                            </Button>
                        </div>
                        
                        <div className="mt-4 text-center">
                            <Link href="/" className="text-sm underline hover:text-gray-600">
                                Continue shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;